export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();
  const AV = process.env.ALPHAVANTAGE_KEY;
  const AIKEY = process.env.ANTHROPIC_API_KEY;
  if (!AV || !AIKEY) return res.status(500).json({ error: 'API keys missing' });

  const today = new Date().toISOString().split('T')[0];
  const n = v => { const x = parseFloat(String(v)); return (isNaN(x) || !isFinite(x) || String(v).trim() === 'None') ? null : x; };
  const f2 = v => { const x = n(v); return x == null ? null : +x.toFixed(2); };
  const p = v => { const x = n(v); return x == null ? null : +(x * 100).toFixed(2); };

  // ── 1. PRICE (Yahoo Finance) ─────────────────────────────────
  let price = null, dataAsOf = today;
  for (const url of [
    `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=5d`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=5d`,
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${sym}`,
    `https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2ohlcv&h&e=csv`
  ]) {
    if (price) break;
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } });
      if (!r.ok) continue;
      if (url.includes('chart')) {
        const d = await r.json(), m = d?.chart?.result?.[0]?.meta;
        if (m?.regularMarketPrice > 0) { price = +m.regularMarketPrice.toFixed(2); if (m.regularMarketTime) dataAsOf = new Date(m.regularMarketTime * 1000).toISOString().split('T')[0]; }
      } else if (url.includes('v7')) {
        const d = await r.json(), q = d?.quoteResponse?.result?.[0];
        if (q?.regularMarketPrice > 0) price = +q.regularMarketPrice.toFixed(2);
      } else {
        const rows = (await r.text()).trim().split('\n');
        if (rows[1]) { const c = rows[1].split(','), cl = parseFloat(c[5]); if (cl > 0) { price = +cl.toFixed(2); dataAsOf = c[1] || today; } }
      }
    } catch {}
  }

  // ── 2. ALPHA VANTAGE: OVERVIEW + INCOME_STATEMENT + BALANCE_SHEET ──
  const AV_BASE = 'https://www.alphavantage.co/query';
  // 1 call only to stay within 25/day free limit
  const ovR = await fetch(`${AV_BASE}?function=OVERVIEW&symbol=${sym}&apikey=${AV}`);
  const ov = await ovR.json();
  const is = { annualReports: [] };
  const bs = { quarterlyReports: [], annualReports: [] };

  if (!ov.Symbol) {
    if (ov.Note || ov.Information) return res.status(429).json({ error: 'AV rate limit' });
    return res.json({ found: false });
  }

  // OVERVIEW metrics (exact)
  const mktCap = n(ov.MarketCapitalization), revTTM = n(ov.RevenueTTM), gpTTM = n(ov.GrossProfitTTM);
  const eps = n(ov.EPS);
  const pe = price && eps && eps > 0 ? f2(price / eps) : f2(ov.TrailingPE) || f2(ov.PERatio);
  const pb = f2(ov.PriceToBookRatio), peg = f2(ov.PEGRatio);
  const ps = mktCap && revTTM ? f2(mktCap / revTTM) : null;
  const grossM = gpTTM && revTTM ? +(gpTTM / revTTM * 100).toFixed(2) : null;
  const mc = mktCap ? +(mktCap / 1e6).toFixed(0) : null;

  // INCOME_STATEMENT: revenue growth + interest coverage
  let revGrowth = null, epsGrowth = null, intCov = null;
  const ann = is.annualReports || [];
  if (ann.length >= 2) {
    const a0 = ann[0], a1 = ann[1];
    const r0 = n(a0.totalRevenue), r1 = n(a1.totalRevenue);
    if (r0 && r1 && r1 !== 0) revGrowth = +((r0 - r1) / Math.abs(r1) * 100).toFixed(2);
    const ni0 = n(a0.netIncome), ni1 = n(a1.netIncome);
    if (ni0 && ni1 && ni1 !== 0) epsGrowth = +((ni0 - ni1) / Math.abs(ni1) * 100).toFixed(2);
    const ebit0 = n(a0.ebit) || n(a0.operatingIncome);
    const intExp = n(a0.interestExpense) || n(a0.interestAndDebtExpense);
    if (ebit0 && intExp && intExp !== 0) intCov = +Math.abs(ebit0 / intExp).toFixed(2);
  }

  // BALANCE_SHEET: liquidity ratios
  let curR = null, qkR = null, d2e = null, roic = null;
  const bsRpts = bs.quarterlyReports || bs.annualReports || [];
  const bq = bsRpts[0] || {};
  const g = (...keys) => { for (const k of keys) { const v = n(bq[k]); if (v != null) return v; } return null; };
  const curA = g('totalCurrentAssets');
  const curL = g('totalCurrentLiabilities');
  const inv = g('inventory', 'inventories');
  const ltd = g('longTermDebt', 'longTermDebtNoncurrent') || 0;
  const std = g('currentDebt', 'shortTermDebt', 'currentPortionOfLongTermDebt') || 0;
  const eq = g('totalShareholderEquity', 'totalStockholdersEquity');
  const totA = g('totalAssets');
  if (curA && curL && curL > 0) {
    curR = f2(curA / curL);
    qkR = f2((curA - (inv || 0)) / curL);
  }
  const debt = ltd + std;
  if (debt && eq && eq > 0) d2e = f2(debt / eq);
  // ROIC = Net Income / (Equity + LT Debt)
  const ni = n((is.annualReports || [])[0]?.netIncome);
  const capital = eq && ltd ? eq + ltd : null;
  if (ni && capital && capital > 0) roic = +(ni / capital * 100).toFixed(2);

  // ── 3. CLAUDE — fills remaining nulls ────────────────────────
  const nulls = [revGrowth, epsGrowth, curR, qkR, d2e, roic, intCov].filter(v => v == null).length;
  let isDefensive = false, isLeader = false, legalOk = true, beatSP500 = false, pcf = null;

  try {
    const known = `PE=${pe},PS=${ps},PB=${pb},GrossMargin=${grossM}%,NetMargin=${p(ov.ProfitMargin)}%,ROE=${p(ov.ReturnOnEquityTTM)}%,ROA=${p(ov.ReturnOnAssetsTTM)}%,RevGrowth=${revGrowth??'null'},EpsGrowth=${epsGrowth??'null'},CurRatio=${curR??'null'},D/E=${d2e??'null'},ROIC=${roic??'null'},IntCov=${intCov??'null'}`;
    const prompt = `Stock: ${sym} (${ov.Name}). Sector: ${ov.Sector}. Industry: ${ov.Industry}. Today: ${today}.
Alpha Vantage data: ${known}
Fill in null values using latest annual SEC filing data. Return ONLY JSON:
{"revenueGrowth":${revGrowth ?? 'NUMBER_ANNUAL_PCT'},"epsGrowth":${epsGrowth ?? 'NUMBER_ANNUAL_PCT'},"currentRatio":${curR ?? 'NUMBER'},"quickRatio":${qkR ?? 'NUMBER'},"debtToEquity":${d2e ?? 'NUMBER'},"interestCoverage":${intCov ?? 'NUMBER'},"roic":${roic ?? 'NUMBER_PCT'},"pcf":NUMBER_OR_NULL,"isDefensiveSector":BOOL,"isIndustryLeader":BOOL,"freeFromLegalIssues":BOOL,"outperformedSP500_5y":BOOL}
Rules: % values as numbers (33.23 not 0.3323). isDefensiveSector true ONLY for Healthcare/Utilities/Consumer Staples/Energy.`;

    const ar = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': AIKEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 250, messages: [{ role: 'user', content: prompt }] })
    });
    if (ar.ok) {
      const ad = await ar.json();
      const txt = ad.content?.[0]?.text || '';
      const si = txt.indexOf('{'), ei = txt.lastIndexOf('}');
      if (si !== -1) {
        const ai = JSON.parse(txt.slice(si, ei + 1));
        const fp = v => { if (v == null || !isFinite(+v)) return null; const x = +v; return x < 2 && x > -2 ? +(x * 100).toFixed(2) : +x.toFixed(2); };
        if (revGrowth == null) revGrowth = fp(ai.revenueGrowth);
        if (epsGrowth == null) epsGrowth = fp(ai.epsGrowth);
        if (curR == null) curR = f2(ai.currentRatio);
        if (qkR == null) qkR = f2(ai.quickRatio);
        if (d2e == null) d2e = f2(ai.debtToEquity);
        if (intCov == null) intCov = f2(ai.interestCoverage);
        if (roic == null) roic = fp(ai.roic);
        pcf = f2(ai.pcf);
        isDefensive = !!ai.isDefensiveSector;
        isLeader = !!ai.isIndustryLeader;
        legalOk = !!ai.freeFromLegalIssues;
        beatSP500 = !!ai.outperformedSP500_5y;
      }
    }
  } catch {}

  return res.json({
    found: true, ticker: sym,
    companyName: ov.Name || sym, exchange: ov.Exchange || '',
    sector: ov.Sector || '', industry: ov.Industry || '',
    price, dataAsOf,
    fundamentals: {
      revenueGrowth: revGrowth, epsGrowth: epsGrowth,
      pe, ps, pb, pcf, peg,
      grossMargin: grossM, operatingMargin: p(ov.OperatingMarginTTM), netMargin: p(ov.ProfitMargin),
      currentRatio: curR, quickRatio: qkR, cashRatio: null,
      debtToEquity: d2e, debtToAssets: null, interestCoverage: intCov,
      roa: p(ov.ReturnOnAssetsTTM), roe: p(ov.ReturnOnEquityTTM), roic
    },
    risk: {
      beta: f2(ov.Beta), marketCap: mc,
      profitableTTM: p(ov.ProfitMargin) != null ? p(ov.ProfitMargin) > 0 : true,
      operatingCashFlowPositive: p(ov.OperatingMarginTTM) != null ? p(ov.OperatingMarginTTM) > 0 : true,
      isDefensiveSector: isDefensive, isIndustryLeader: isLeader,
      freeFromLegalIssues: legalOk, outperformedSP500_5y: beatSP500
    }
  });
}