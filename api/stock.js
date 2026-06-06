export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();
  const AI_KEY = process.env.ANTHROPIC_API_KEY;

  const hdrs = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  // ── helpers ──────────────────────────────────────────────────────
  const num  = v => { const n = parseFloat(v); return isNaN(n) ? null : n; };
  const pct  = v => { const n = parseFloat(v); return isNaN(n) ? null : +n.toFixed(2); };

  // Extract __NEXT_DATA__ from HTML and walk the JSON tree for a key
  function findInJson(obj, keys, depth = 0) {
    if (depth > 12 || obj == null || typeof obj !== 'object') return undefined;
    for (const k of keys) {
      if (k in obj && obj[k] != null && obj[k] !== '-' && obj[k] !== 'N/A') return obj[k];
    }
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) {
        for (const item of val) {
          const r = findInJson(item, keys, depth + 1);
          if (r !== undefined) return r;
        }
      } else if (typeof val === 'object') {
        const r = findInJson(val, keys, depth + 1);
        if (r !== undefined) return r;
      }
    }
    return undefined;
  }

  // Fetch and parse stockanalysis.com page
  async function fetchSA(path) {
    try {
      const r = await fetch(`https://stockanalysis.com${path}`, { headers: hdrs });
      if (!r.ok) return null;
      const html = await r.text();
      const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (!m) return null;
      return JSON.parse(m[1]);
    } catch { return null; }
  }

  // ── 1. Real-time price ────────────────────────────────────────────
  let livePrice = null, liveDate = new Date().toISOString().split('T')[0];
  try {
    const yr = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, { headers: hdrs });
    if (yr.ok) {
      const yd = await yr.json();
      const meta = yd?.chart?.result?.[0]?.meta;
      if (meta?.regularMarketPrice) {
        livePrice = +meta.regularMarketPrice.toFixed(2);
        if (meta.regularMarketTime) liveDate = new Date(meta.regularMarketTime * 1000).toISOString().split('T')[0];
      }
    }
  } catch {}
  if (!livePrice) {
    try {
      const sr = await fetch(`https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2t2ohlcv&h&e=csv`);
      if (sr.ok) {
        const rows = (await sr.text()).trim().split('\n');
        if (rows[1]) {
          const c = rows[1].split(',');
          const cl = parseFloat(c[6]);
          if (cl > 0) { livePrice = +cl.toFixed(2); liveDate = c[1] || liveDate; }
        }
      }
    } catch {}
  }

  // ── 2. stockanalysis.com – overview (sector, industry, market cap, beta) ──
  let companyName = '', exchange = '', sector = '', industry = '', beta = null, marketCap = null;
  const ovData = await fetchSA(`/stocks/${sym.toLowerCase()}/`);
  if (ovData) {
    const pp = ovData?.props?.pageProps ?? {};
    companyName = findInJson(pp, ['name','companyName','longName','shortName']) ?? '';
    exchange    = findInJson(pp, ['exchange','exchangeShortName']) ?? '';
    sector      = findInJson(pp, ['sector']) ?? '';
    industry    = findInJson(pp, ['industry','subSector']) ?? '';
    beta        = num(findInJson(pp, ['beta']));
    const mc    = findInJson(pp, ['marketCap','mktCap']);
    marketCap   = mc ? +(parseFloat(mc) / 1e6).toFixed(0) : null;
    if (!livePrice) livePrice = num(findInJson(pp, ['price','regularMarketPrice','lastPrice']));
  }

  // ── 3. stockanalysis.com – financial ratios (TTM) ────────────────
  let pe=null,ps=null,pb=null,pcf=null,peg=null;
  let grossM=null,opM=null,netM=null,roe=null,roa=null,roic=null;
  let curR=null,quickR=null,cashR=null,d2e=null,d2a=null,intCov=null;
  let revGrow=null,epsGrow=null;

  const ratData = await fetchSA(`/stocks/${sym.toLowerCase()}/financials/ratios/`);
  if (ratData) {
    const pp = ratData?.props?.pageProps ?? {};
    // Find the data table - stockanalysis stores rows as arrays
    const data = findInJson(pp, ['data','financials','ratios','tableData','rows']);

    // Also try direct key lookup throughout the entire props
    pe      = num(findInJson(pp, ['peRatio','pe','priceEarnings','trailingPE','pe_ratio']));
    ps      = num(findInJson(pp, ['psRatio','ps','priceToSales','priceToSalesRatio']));
    pb      = num(findInJson(pp, ['pbRatio','pb','priceToBook','priceBook']));
    pcf     = num(findInJson(pp, ['pfcfRatio','pcf','priceToFreeCashFlow','priceCashFlow']));
    peg     = num(findInJson(pp, ['pegRatio','peg']));
    grossM  = pct(findInJson(pp, ['grossMargin','grossProfitMargin']));
    opM     = pct(findInJson(pp, ['operatingMargin','operatingProfitMargin']));
    netM    = pct(findInJson(pp, ['netMargin','netProfitMargin','profitMargin']));
    roe     = pct(findInJson(pp, ['roe','returnOnEquity']));
    roa     = pct(findInJson(pp, ['roa','returnOnAssets']));
    roic    = pct(findInJson(pp, ['roic','returnOnInvestedCapital','returnOnCapital']));
    curR    = num(findInJson(pp, ['currentRatio']));
    quickR  = num(findInJson(pp, ['quickRatio']));
    cashR   = num(findInJson(pp, ['cashRatio']));
    d2e     = num(findInJson(pp, ['debtEquityRatio','debtToEquity','d2e']));
    d2a     = num(findInJson(pp, ['debtToAssets','debtRatio']));
    intCov  = num(findInJson(pp, ['interestCoverage','interestCoverageRatio']));
    revGrow = pct(findInJson(pp, ['revenueGrowth','revGrowth']));
    epsGrow = pct(findInJson(pp, ['epsGrowth','earningsGrowth','epsGrowthTTM']));
  }

  // ── 4. Claude fallback for missing values ─────────────────────────
  const missing = [pe,ps,pb,grossM,opM,netM,roe,roa].filter(v => v==null).length;
  if (missing >= 4 && AI_KEY) {
    try {
      const known = { pe,ps,pb,pcf,peg,grossM,opM,netM,roe,roa,roic,curR,quickR,cashR,d2e,d2a,intCov,revGrow,epsGrow };
      const prompt = `Stock: ${sym}. Company: ${companyName||sym}. Today: ${liveDate}.
Fill in ONLY missing null values using the latest quarterly SEC filing data you know.
Current values (null = missing): ${JSON.stringify(known)}
Also provide: companyName, exchange, sector, industry, beta, marketCapMillions, profitableTTM, operatingCashFlowPositive, isDefensiveSector, isIndustryLeader, freeFromLegalIssues, outperformedSP500_5y.
If ticker doesn't exist return {"found":false}.
Return ONLY JSON, no text. Percentages as numbers (43.2 not 0.432).`;
      const ar = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type':'application/json','x-api-key':AI_KEY,'anthropic-version':'2023-06-01' },
        body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:700, messages:[{role:'user',content:prompt}] })
      });
      if (ar.ok) {
        const ad = await ar.json();
        const txt = ad.content?.[0]?.text || '';
        const si = txt.indexOf('{'), ei = txt.lastIndexOf('}');
        if (si !== -1) {
          const ai = JSON.parse(txt.slice(si, ei+1));
          if (ai.found === false) return res.json({ found: false });
          if (!companyName) companyName = ai.companyName || sym;
          if (!exchange)    exchange    = ai.exchange || '';
          if (!sector)      sector      = ai.sector   || '';
          if (!industry)    industry    = ai.industry  || '';
          if (!beta)        beta        = num(ai.beta);
          if (!marketCap)   marketCap   = num(ai.marketCapMillions);
          pe      = pe      ?? num(ai.pe);
          ps      = ps      ?? num(ai.ps);
          pb      = pb      ?? num(ai.pb);
          pcf     = pcf     ?? num(ai.pcf);
          peg     = peg     ?? num(ai.peg);
          grossM  = grossM  ?? pct(ai.grossM  ?? ai.grossMargin);
          opM     = opM     ?? pct(ai.opM     ?? ai.operatingMargin);
          netM    = netM    ?? pct(ai.netM    ?? ai.netMargin);
          roe     = roe     ?? pct(ai.roe     ?? ai.returnOnEquity);
          roa     = roa     ?? pct(ai.roa     ?? ai.returnOnAssets);
          roic    = roic    ?? pct(ai.roic    ?? ai.returnOnInvestedCapital);
          curR    = curR    ?? num(ai.curR    ?? ai.currentRatio);
          quickR  = quickR  ?? num(ai.quickR  ?? ai.quickRatio);
          cashR   = cashR   ?? num(ai.cashR   ?? ai.cashRatio);
          d2e     = d2e     ?? num(ai.d2e     ?? ai.debtToEquity);
          d2a     = d2a     ?? num(ai.d2a     ?? ai.debtToAssets);
          intCov  = intCov  ?? num(ai.intCov  ?? ai.interestCoverage);
          revGrow = revGrow ?? pct(ai.revGrow ?? ai.revenueGrowth);
          epsGrow = epsGrow ?? pct(ai.epsGrow ?? ai.epsGrowth);
          // Risk booleans from AI
          if (!beta && ai.beta)  beta = num(ai.beta);
          var aiRisk = ai;
          return res.json({
            found: true, ticker: sym, companyName, exchange, sector, industry,
            price: livePrice, dataAsOf: liveDate,
            fundamentals: { revenueGrowth:revGrow, epsGrowth:epsGrow, pe, ps, pb, pcf, peg,
              grossMargin:grossM, operatingMargin:opM, netMargin:netM,
              currentRatio:curR, quickRatio:quickR, cashRatio:cashR,
              debtToEquity:d2e, debtToAssets:d2a, interestCoverage:intCov,
              roa, roe, roic },
            risk: {
              beta, marketCap,
              profitableTTM:             ai.profitableTTM             ?? (netM > 0),
              operatingCashFlowPositive: ai.operatingCashFlowPositive ?? true,
              isDefensiveSector:         ai.isDefensiveSector         ?? false,
              isIndustryLeader:          ai.isIndustryLeader          ?? false,
              freeFromLegalIssues:       ai.freeFromLegalIssues       ?? true,
              outperformedSP500_5y:      ai.outperformedSP500_5y      ?? false
            }
          });
        }
      }
    } catch {}
  }

  if (!companyName && !livePrice) return res.json({ found: false });

  return res.json({
    found: true, ticker: sym, companyName: companyName||sym, exchange, sector, industry,
    price: livePrice, dataAsOf: liveDate,
    fundamentals: { revenueGrowth:revGrow, epsGrowth:epsGrow, pe, ps, pb, pcf, peg,
      grossMargin:grossM, operatingMargin:opM, netMargin:netM,
      currentRatio:curR, quickRatio:quickR, cashRatio:cashR,
      debtToEquity:d2e, debtToAssets:d2a, interestCoverage:intCov, roa, roe, roic },
    risk: {
      beta, marketCap,
      profitableTTM:             (netM ?? 0) > 0,
      operatingCashFlowPositive: true,
      isDefensiveSector:         ['Healthcare','Consumer Staples','Utilities','Energy'].includes(sector),
      isIndustryLeader:          (marketCap ?? 0) > 50000,
      freeFromLegalIssues:       true,
      outperformedSP500_5y:      false
    }
  });
}