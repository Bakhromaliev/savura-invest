export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym   = symbol.toUpperCase().trim();
  const AV    = process.env.ALPHAVANTAGE_KEY;
  const AIKEY = process.env.ANTHROPIC_API_KEY;
  if (!AV) return res.status(500).json({ error: 'ALPHAVANTAGE_KEY not set' });

  const today = new Date().toISOString().split('T')[0];
  const n  = v => { const x=parseFloat(String(v)); return isNaN(x)||!isFinite(x)||String(v)==='None'?null:x; };
  const p  = v => { const x=n(v); return x==null?null:+(x*100).toFixed(2); };
  const f2 = v => { const x=n(v); return x==null?null:+x.toFixed(2); };
  const BASE = 'https://www.alphavantage.co/query';
  const hdrs = {'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36','Accept':'application/json'};

  // ══════════════════════════════════════════════════
  // 1. REAL-TIME PRICE — Yahoo Finance (free, no limit)
  // ══════════════════════════════════════════════════
  let price = null, dataAsOf = today;
  for (const [url, parse] of [
    [`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, async r => {
      const d=await r.json(); const m=d?.chart?.result?.[0]?.meta;
      if(m?.regularMarketPrice>0){price=+m.regularMarketPrice.toFixed(2);
        if(m.regularMarketTime)dataAsOf=new Date(m.regularMarketTime*1000).toISOString().split('T')[0];}
    }],
    [`https://query2.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, async r => {
      const d=await r.json(); const m=d?.chart?.result?.[0]?.meta;
      if(m?.regularMarketPrice>0)price=+m.regularMarketPrice.toFixed(2);
    }],
    [`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${sym}`, async r => {
      const d=await r.json(); const q=d?.quoteResponse?.result?.[0];
      if(q?.regularMarketPrice>0)price=+q.regularMarketPrice.toFixed(2);
    }],
    [`https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2ohlcv&h&e=csv`, async r => {
      const rows=(await r.text()).trim().split('\n');
      if(rows[1]){const c=rows[1].split(',');const cl=parseFloat(c[5]);if(cl>0){price=+cl.toFixed(2);dataAsOf=c[1]||today;}}
    }]
  ]) {
    if (price) break;
    try { const r=await fetch(url,{headers:hdrs}); if(r.ok) await parse(r); } catch {}
  }

  // ══════════════════════════════════════════════════
  // 2. ALPHA VANTAGE — OVERVIEW (main fundamentals)
  // ══════════════════════════════════════════════════
  let ov = {};
  try {
    const r = await fetch(`${BASE}?function=OVERVIEW&symbol=${sym}&apikey=${AV}`);
    ov = await r.json();
  } catch(e) { return res.status(500).json({ error: 'AV error: '+e.message }); }

  if (!ov.Symbol) {
    if (ov.Note||ov.Information) return res.status(429).json({ error: 'AV rate limit — try again in 1 min' });
    return res.json({ found: false });
  }

  const mktCap  = n(ov.MarketCapitalization);
  const revTTM  = n(ov.RevenueTTM);
  const gpTTM   = n(ov.GrossProfitTTM);

  // Valuation (price-dependent)
  const peAV  = f2(ov.TrailingPE) || f2(ov.PERatio);
  const pe    = price && n(ov.EPS) ? f2(price/n(ov.EPS)) : peAV;
  const pb    = f2(ov.PriceToBookRatio);
  const peg   = f2(ov.PEGRatio);
  const ps    = (price && n(ov.SharesOutstanding)) ? f2(price*n(ov.SharesOutstanding)/1e6/(revTTM/1e6)) : (mktCap&&revTTM?f2(mktCap/revTTM):null);

  // Profitability
  const grossM = gpTTM && revTTM ? +(gpTTM/revTTM*100).toFixed(2) : null;
  const opM    = p(ov.OperatingMarginTTM);
  const netM   = p(ov.ProfitMargin);
  const roa    = p(ov.ReturnOnAssetsTTM);
  const roe    = p(ov.ReturnOnEquityTTM);
  const revGrow = p(ov.QuarterlyRevenueGrowthYOY);
  const epsGrow = p(ov.QuarterlyEarningsGrowthYOY);
  const beta    = f2(ov.Beta);
  const mc      = mktCap ? +(mktCap/1e6).toFixed(0) : (price&&n(ov.SharesOutstanding)?+(price*n(ov.SharesOutstanding)/1e6).toFixed(0):null);

  // ══════════════════════════════════════════════════
  // 3. ALPHA VANTAGE — BALANCE SHEET
  // ══════════════════════════════════════════════════
  let curR=null, qkR=null, d2e=null, d2a=null, cashR=null;
  try {
    const r = await fetch(`${BASE}?function=BALANCE_SHEET&symbol=${sym}&apikey=${AV}`);
    const bs = await r.json();
    // Try quarterly first (most recent), then annual
    const rpt = (bs.quarterlyReports || [])[0] || (bs.annualReports || [])[0] || {};
    const g = (...keys) => { for(const k of keys){ const v=n(rpt[k]); if(v!=null) return v; } return null; };
    const curA = g('totalCurrentAssets');
    const curL = g('totalCurrentLiabilities');
    const inv  = g('inventory','inventories');
    const cash = g('cashAndShortTermInvestments','cashAndCashEquivalentsAtCarryingValue','cash');
    const ltd  = g('longTermDebt','longTermDebtNoncurrent') || 0;
    const std  = g('shortTermDebt','currentLongTermDebt','shortLongTermDebt') || 0;
    const eq   = g('totalShareholderEquity','totalStockholdersEquity','stockholdersEquity');
    const totA = g('totalAssets');
    if (curA && curL && curL > 0) {
      curR  = f2(curA / curL);
      qkR   = f2((curA - (inv||0)) / curL);
      if (cash) cashR = f2(cash / curL);
    }
    const debt = ltd + std;
    if (debt && eq && eq > 0) d2e = f2(debt / eq);
    if (debt && totA && totA > 0) d2a = f2(debt / totA);
  } catch {}

  // ══════════════════════════════════════════════════
  // 4. CLAUDE HAIKU — ROIC, interest coverage, risk
  // ══════════════════════════════════════════════════
  let roic=null, intCov=null, pcf=null;
  let isDefensive=false, isLeader=false, legalOk=true, beatSP500=false;
  if (AIKEY) {
    try {
      const prompt = `Stock: ${sym} (${ov.Name}). Sector: ${ov.Sector}. Industry: ${ov.Industry}. Today: ${today}.
Known: ROE=${roe}%, ROA=${roa}%, NetMargin=${netM}%, Revenue=$${revTTM?+(revTTM/1e9).toFixed(1):'?'}B TTM, D/E=${d2e}, Price=$${price}.
Return ONLY JSON (no text, no markdown):
{"roic":number,"interestCoverage":number,"pcf":number_or_null,"isDefensiveSector":bool,"isIndustryLeader":bool,"freeFromLegalIssues":bool,"outperformedSP500_5y":bool}
Note: isDefensiveSector=true only Healthcare/Utilities/Consumer Staples/Energy. isIndustryLeader=true if top-5 mkt cap in sector. All numbers as-is (not percentages for roic — use 33.23 for 33.23%).`;
      const ar = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST', headers:{'Content-Type':'application/json','x-api-key':AIKEY,'anthropic-version':'2023-06-01'},
        body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:150,messages:[{role:'user',content:prompt}]})
      });
      if(ar.ok){const ad=await ar.json();const txt=ad.content?.[0]?.text||'';
        const si=txt.indexOf('{'),ei=txt.lastIndexOf('}');
        if(si!==-1){const ai=JSON.parse(txt.slice(si,ei+1));
          roic=ai.roic!=null?f2(ai.roic):null; intCov=ai.interestCoverage!=null?f2(ai.interestCoverage):null;
          pcf=ai.pcf!=null?f2(ai.pcf):null; isDefensive=!!ai.isDefensiveSector;
          isLeader=!!ai.isIndustryLeader; legalOk=!!ai.freeFromLegalIssues; beatSP500=!!ai.outperformedSP500_5y;}}
    } catch {}
  }

  return res.json({
    found:true, ticker:sym,
    companyName: ov.Name||sym, exchange: ov.Exchange||'',
    sector: ov.Sector||'', industry: ov.Industry||'',
    price, dataAsOf,
    fundamentals:{revenueGrowth:revGrow,epsGrowth:epsGrow,pe,ps,pb,pcf,peg,
      grossMargin:grossM,operatingMargin:opM,netMargin:netM,
      currentRatio:curR,quickRatio:qkR,cashRatio:cashR,
      debtToEquity:d2e,debtToAssets:d2a,interestCoverage:intCov,
      roa,roe,roic},
    risk:{beta,marketCap:mc,profitableTTM:netM!=null?netM>0:true,
      operatingCashFlowPositive:opM!=null?opM>0:true,
      isDefensiveSector:isDefensive,isIndustryLeader:isLeader,
      freeFromLegalIssues:legalOk,outperformedSP500_5y:beatSP500}
  });
}