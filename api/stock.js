// Savura Invest — stock.js
// Primary: Alpha Vantage (same data source as stockanalysis.com)
// Fallback: Claude haiku for ROIC, risk assessment

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym   = symbol.toUpperCase().trim();
  const AV    = process.env.ALPHAVANTAGE_KEY;
  const AIKEY = process.env.ANTHROPIC_API_KEY;
  if (!AV) return res.status(500).json({ error: 'ALPHAVANTAGE_KEY not set' });

  const today = new Date().toISOString().split('T')[0];
  const n  = v => { const x=parseFloat(v); return isNaN(x)||!isFinite(x)?null:x; };
  const p  = (v,mul=100) => { const x=n(v); return x==null?null:+( x*mul).toFixed(2); };
  const f2 = v => { const x=n(v); return x==null?null:+x.toFixed(2); };

  // ── 1. Alpha Vantage — 3 parallel calls ─────────────────────
  const AV_URL = `https://www.alphavantage.co/query`;
  let ov={}, qt={}, bs={};
  try {
    // Sequential calls to stay within 5 req/min rate limit
    const ovR = await fetch(`${AV_URL}?function=OVERVIEW&symbol=${sym}&apikey=${AV}`);
    ov = await ovR.json();
    if (!ov.Symbol) {
      if (ov.Note||ov.Information) return res.status(429).json({ error: 'Rate limit' });
      return res.json({ found: false });
    }
    const qtR = await fetch(`${AV_URL}?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${AV}`);
    qt = await qtR.json();
    const bsR = await fetch(`${AV_URL}?function=BALANCE_SHEET&symbol=${sym}&apikey=${AV}`);
    bs = await bsR.json();
  } catch(e) { return res.status(500).json({ error: 'Alpha Vantage error: '+e.message }); }

  // Ticker check handled above in sequential block

  // ── 2. Parse Alpha Vantage data ──────────────────────────────
  const price       = n(qt['Global Quote']?.['05. price']);
  const mktCap      = n(ov.MarketCapitalization);
  const revTTM      = n(ov.RevenueTTM);
  const gpTTM       = n(ov.GrossProfitTTM);
  const priceDate   = qt['Global Quote']?.['07. latest trading day'] || today;

  // Valuation
  const pe   = f2(ov.TrailingPE)  || f2(ov.PERatio);
  const pb   = f2(ov.PriceToBookRatio);
  const peg  = f2(ov.PEGRatio);
  const ps   = mktCap && revTTM ? f2(mktCap/revTTM) : null;

  // Profitability
  const grossM = gpTTM && revTTM ? +(gpTTM/revTTM*100).toFixed(2) : null;
  const opM    = p(ov.OperatingMarginTTM);
  const netM   = p(ov.ProfitMargin);
  const roa    = p(ov.ReturnOnAssetsTTM);
  const roe    = p(ov.ReturnOnEquityTTM);

  // Growth
  const revGrow = p(ov.QuarterlyRevenueGrowthYOY);
  const epsGrow = p(ov.QuarterlyEarningsGrowthYOY);

  // Beta & Market Cap
  const beta  = f2(ov.Beta);
  const mc    = mktCap ? +(mktCap/1e6).toFixed(0) : null;
  const eps   = f2(ov.EPS);

  // ── 3. Balance Sheet — Current Ratio, D/E ───────────────────
  let curR=null, qkR=null, d2e=null, d2a=null, cashR=null;
  try {
    // Try quarterly first, then annual
    const rpts = bs.quarterlyReports || bs.annualReports || [];
    const qtr = rpts[0] || {};
    const g = (...keys) => { for(const k of keys){ const v=n(qtr[k]); if(v!=null) return v; } return null; };
    const curA = g('totalCurrentAssets','currentAssets');
    const curL = g('totalCurrentLiabilities','currentLiabilities');
    const inv  = g('inventory','inventories');
    const cash = g('cashAndShortTermInvestments','cashAndCashEquivalentsAtCarryingValue','cash');
    const ltd  = g('longTermDebt','longTermDebtNoncurrent');
    const std  = g('shortTermDebt','currentPortionOfLongTermDebt','shortLongTermDebt');
    const debt = (ltd||0) + (std||0);
    const eq   = g('totalShareholderEquity','stockholdersEquity','totalStockholdersEquity','shareHolderEquity');
    const totA = g('totalAssets','assets');
    if (curA && curL && curL > 0) {
      curR  = f2(curA/curL);
      qkR   = inv!=null ? f2((curA-Math.max(0,inv))/curL) : f2(curA/curL);
      if (cash!=null) cashR = f2(cash/curL);
    }
    if (debt > 0 && eq && eq > 0) d2e = f2(debt/eq);
    if (debt > 0 && totA && totA > 0) d2a = f2(debt/totA);
  } catch {}

  // ── 4. Claude haiku — ROIC, interest coverage, risk booleans ─
  let roic=null, intCov=null, pcf=null;
  let isDefensive=false, isLeader=false, legalOk=true, beatSP500=false;
  if (AIKEY) {
    try {
      const prompt = `Stock: ${sym} (${ov.Name}). Today: ${today}. Sector: ${ov.Sector}. Industry: ${ov.Industry}.
Known financials: Revenue TTM $${revTTM?+(revTTM/1e9).toFixed(2):'?'}B, Net Margin ${netM}%, ROE ${roe}%, Price $${price}.
Return ONLY JSON (no text):
{"roic":number,"interestCoverage":number,"pcf":number_or_null,"isDefensiveSector":bool,"isIndustryLeader":bool,"freeFromLegalIssues":bool,"outperformedSP500_5y":bool}
Rules: isDefensiveSector=true only for Healthcare/Utilities/Consumer Staples/Energy. isIndustryLeader=true if top-5 by mkt cap in industry. outperformedSP500_5y based on 5y stock performance vs S&P500.`;
      const ar = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':AIKEY,'anthropic-version':'2023-06-01'},
        body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:200,messages:[{role:'user',content:prompt}]})
      });
      if (ar.ok) {
        const ad = await ar.json();
        const txt = ad.content?.[0]?.text||'';
        const si=txt.indexOf('{'),ei=txt.lastIndexOf('}');
        if (si!==-1) {
          const ai=JSON.parse(txt.slice(si,ei+1));
          roic   = ai.roic!=null?f2(ai.roic):null;
          intCov = ai.interestCoverage!=null?f2(ai.interestCoverage):null;
          pcf    = ai.pcf!=null?f2(ai.pcf):null;
          isDefensive = !!ai.isDefensiveSector;
          isLeader    = !!ai.isIndustryLeader;
          legalOk     = !!ai.freeFromLegalIssues;
          beatSP500   = !!ai.outperformedSP500_5y;
        }
      }
    } catch {}
  }

  // ── 5. Return complete result ─────────────────────────────────
  return res.json({
    found: true, ticker: sym,
    companyName: ov.Name || sym,
    exchange:    ov.Exchange || '',
    sector:      ov.Sector || '',
    industry:    ov.Industry || '',
    price:       price,
    dataAsOf:    priceDate,
    fundamentals: {
      revenueGrowth:   revGrow,
      epsGrowth:       epsGrow,
      pe, ps, pb, pcf, peg,
      grossMargin:     grossM,
      operatingMargin: opM,
      netMargin:       netM,
      currentRatio:    curR,
      quickRatio:      qkR,
      cashRatio:       cashR,
      debtToEquity:    d2e,
      debtToAssets:    d2a,
      interestCoverage: intCov,
      roa, roe, roic
    },
    risk: {
      beta,
      marketCap:                 mc,
      profitableTTM:             netM != null ? netM > 0 : true,
      operatingCashFlowPositive: opM  != null ? opM  > 0 : true,
      isDefensiveSector:         isDefensive,
      isIndustryLeader:          isLeader,
      freeFromLegalIssues:       legalOk,
      outperformedSP500_5y:      beatSP500
    }
  });
}