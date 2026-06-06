export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym   = symbol.toUpperCase().trim();
  const AV    = process.env.ALPHAVANTAGE_KEY;
  const AIKEY = process.env.ANTHROPIC_API_KEY;
  if (!AV) return res.status(500).json({ error: 'ALPHAVANTAGE_KEY not set' });

  const today = new Date().toISOString().split('T')[0];
  const n  = v => { const x=parseFloat(String(v)); return (isNaN(x)||!isFinite(x)||String(v).trim()==='None')?null:x; };
  const f2 = v => { const x=n(v); return x==null?null:+x.toFixed(2); };
  const p  = v => { const x=n(v); return x==null?null:+(x*100).toFixed(2); };
  const AV_URL = 'https://www.alphavantage.co/query';
  const hdrs = {'User-Agent':'Mozilla/5.0','Accept':'application/json'};

  // ── 1. REAL-TIME PRICE (Yahoo Finance / Stooq) ──────────────
  let price=null, dataAsOf=today;
  for (const [url, parse] of [
    [`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=5d`, async r=>{
      const d=await r.json(); const m=d?.chart?.result?.[0]?.meta;
      if(m?.regularMarketPrice>0){price=+m.regularMarketPrice.toFixed(2);
        if(m.regularMarketTime)dataAsOf=new Date(m.regularMarketTime*1000).toISOString().split('T')[0];}
    }],
    [`https://query2.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=5d`, async r=>{
      const d=await r.json(); const m=d?.chart?.result?.[0]?.meta;
      if(m?.regularMarketPrice>0)price=+m.regularMarketPrice.toFixed(2);
    }],
    [`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${sym}`, async r=>{
      const d=await r.json(); const q=d?.quoteResponse?.result?.[0];
      if(q?.regularMarketPrice>0)price=+q.regularMarketPrice.toFixed(2);
    }],
    [`https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2ohlcv&h&e=csv`, async r=>{
      const rows=(await r.text()).trim().split('\n');
      if(rows[1]){const c=rows[1].split(',');const cl=parseFloat(c[5]);if(cl>0){price=+cl.toFixed(2);dataAsOf=c[1]||today;}}
    }]
  ]) {
    if (price) break;
    try{const r=await fetch(url,{headers:hdrs});if(r.ok)await parse(r);}catch{}
  }

  // ── 2. ALPHA VANTAGE — OVERVIEW ─────────────────────────────
  let ov={};
  try {
    const r=await fetch(`${AV_URL}?function=OVERVIEW&symbol=${sym}&apikey=${AV}`);
    ov=await r.json();
  } catch(e){return res.status(500).json({error:'AV error: '+e.message});}
  if(!ov.Symbol){
    if(ov.Note||ov.Information)return res.status(429).json({error:'AV rate limit — 1 daqiqadan keyin qayta urinib ko\'ring'});
    return res.json({found:false});
  }

  const mktCap=n(ov.MarketCapitalization), revTTM=n(ov.RevenueTTM), gpTTM=n(ov.GrossProfitTTM);

  // ── 3. ALPHA VANTAGE — INCOME_STATEMENT (annual YoY growth) ─
  let revGrowth=null, epsGrowth=null, curR=null, qkR=null, d2e=null;
  try {
    const r=await fetch(`${AV_URL}?function=INCOME_STATEMENT&symbol=${sym}&apikey=${AV}`);
    const is=await r.json();
    const ann=is.annualReports||[];
    if(ann.length>=2){
      // Annual YoY revenue growth (matches stockanalysis methodology)
      const r0=n(ann[0].totalRevenue), r1=n(ann[1].totalRevenue);
      if(r0&&r1&&r1!==0) revGrowth=+(  (r0-r1)/Math.abs(r1)*100).toFixed(2);
      // Annual YoY EPS growth
      const e0=n(ann[0].dilutedEPS||ann[0].reportedEPS||ann[0].eps||ann[0].netIncome&&n(ann[0].sharesOutstandingDiluted)?n(ann[0].netIncome)/n(ann[0].sharesOutstandingDiluted):null), e1=n(ann[1].dilutedEPS||ann[1].reportedEPS||ann[1].eps||null);
      if(e0&&e1&&e1!==0) epsGrowth=+((e0-e1)/Math.abs(e1)*100).toFixed(2);
    }
    // Balance sheet basics from quarterly income statement context
    // Try to get from most recent quarter
    const qtr=(is.quarterlyReports||[])[0]||{};
    // EBIT/Interest → Interest Coverage
    // (we'll get these from Claude instead)
  } catch{}

  // ── 4. ALPHA VANTAGE — BALANCE SHEET ─────────────────────────
  try {
    const r=await fetch(`${AV_URL}?function=BALANCE_SHEET&symbol=${sym}&apikey=${AV}`);
    const bs=await r.json();
    const rpts=bs.quarterlyReports||bs.annualReports||[];
    const q=rpts[0]||{};
    const g=(...keys)=>{for(const k of keys){const v=n(q[k]);if(v!=null)return v;}return null;};
    const curA=g('totalCurrentAssets'); const curL=g('totalCurrentLiabilities');
    const inv=g('inventory','inventories');
    const ltd=g('longTermDebt','longTermDebtNoncurrent')||0;
    const std=g('shortTermDebt','currentLongTermDebt','shortLongTermDebtTotal')||0;
    const eq=g('totalShareholderEquity','totalStockholdersEquity','stockholdersEquity');
    if(curA&&curL&&curL>0){curR=f2(curA/curL);qkR=f2((curA-(inv||0))/curL);}
    const debt=ltd+std; if(debt&&eq&&eq>0)d2e=f2(debt/eq);
  } catch{}

  // ── 5. CLAUDE HAIKU — gaps + risk booleans ───────────────────
  let roic=null, intCov=null, pcf=null, isDefensive=false, isLeader=false, legalOk=true, beatSP500=false;
  if(AIKEY){
    try{
      const prompt=`Stock: ${sym} (${ov.Name}). Sector: ${ov.Sector}. Industry: ${ov.Industry}. Today: ${today}.
Known from Alpha Vantage: ROE=${p(ov.ReturnOnEquityTTM)}%, ROA=${p(ov.ReturnOnAssetsTTM)}%, NetMargin=${p(ov.ProfitMargin)}%, RevenueTTM=$${revTTM?+(revTTM/1e9).toFixed(1):'?'}B TTM.
Provide EXACT values from the most recent quarterly SEC filing. Return ONLY this JSON (no text, no markdown):
{
"roic": exact ROIC % like 33.23,
"interestCoverage": exact like 31.95,
"pcf": P/FCF ratio like 67.32 or null,
"currentRatio": exact like 2.51,
"quickRatio": exact like 1.62,
"debtToEquity": exact like 0.30,
"revenueGrowthAnnual": annual YoY revenue growth % like 2.1,
"epsGrowthAnnual": annual YoY EPS growth % like 19.6,
"isDefensiveSector": false (true ONLY for Healthcare/Utilities/Consumer Staples/Energy),
"isIndustryLeader": true if top-5 market cap in semiconductor equipment,
"freeFromLegalIssues": true if no major ongoing lawsuits or gov enforcement actions (export controls alone = still true),
"outperformedSP500_5y": true if 5-year total return > S&P 500
}`;
      const ar=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':AIKEY,'anthropic-version':'2023-06-01'},
        body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:200,messages:[{role:'user',content:prompt}]})});
      if(ar.ok){const ad=await ar.json();const txt=ad.content?.[0]?.text||'';
        const si=txt.indexOf('{'),ei=txt.lastIndexOf('}');
        if(si!==-1){const ai=JSON.parse(txt.slice(si,ei+1));
          roic=ai.roic!=null?f2(ai.roic):null; intCov=ai.interestCoverage!=null?f2(ai.interestCoverage):null;
          pcf=ai.pcf!=null?f2(ai.pcf):null;
          if(curR==null)curR=ai.currentRatio!=null?f2(ai.currentRatio):null;
          if(qkR==null)qkR=ai.quickRatio!=null?f2(ai.quickRatio):null;
          if(d2e==null)d2e=ai.debtToEquity!=null?f2(ai.debtToEquity):null;
          isDefensive=!!ai.isDefensiveSector; isLeader=!!ai.isIndustryLeader;
          legalOk=!!ai.freeFromLegalIssues; beatSP500=!!ai.outperformedSP500_5y;
          if(revGrowth==null&&ai.revenueGrowthAnnual!=null)revGrowth=f2(ai.revenueGrowthAnnual);
          if(epsGrowth==null&&ai.epsGrowthAnnual!=null)epsGrowth=f2(ai.epsGrowthAnnual);}}
    }catch{}
  }

  // ── Valuation ratios ─────────────────────────────────────────
  const eps=n(ov.EPS);
  const pe = price&&eps&&eps>0 ? f2(price/eps) : f2(ov.TrailingPE)||f2(ov.PERatio);
  const pb = f2(ov.PriceToBookRatio);
  const peg= f2(ov.PEGRatio);
  const ps = mktCap&&revTTM ? f2(mktCap/revTTM) : null;
  const grossM = gpTTM&&revTTM ? +(gpTTM/revTTM*100).toFixed(2) : null;
  const mc = mktCap ? +(mktCap/1e6).toFixed(0) : null;

  return res.json({
    found:true, ticker:sym,
    companyName:ov.Name||sym, exchange:ov.Exchange||'',
    sector:ov.Sector||'', industry:ov.Industry||'',
    price, dataAsOf,
    fundamentals:{
      revenueGrowth:revGrowth, epsGrowth:epsGrowth,
      pe, ps, pb, pcf, peg,
      grossMargin:grossM, operatingMargin:p(ov.OperatingMarginTTM), netMargin:p(ov.ProfitMargin),
      currentRatio:curR, quickRatio:qkR, cashRatio:null,
      debtToEquity:d2e, debtToAssets:null, interestCoverage:intCov,
      roa:p(ov.ReturnOnAssetsTTM), roe:p(ov.ReturnOnEquityTTM), roic
    },
    risk:{
      beta:f2(ov.Beta), marketCap:mc,
      profitableTTM:p(ov.ProfitMargin)!=null?p(ov.ProfitMargin)>0:true,
      operatingCashFlowPositive:p(ov.OperatingMarginTTM)!=null?p(ov.OperatingMarginTTM)>0:true,
      isDefensiveSector:isDefensive, isIndustryLeader:isLeader,
      freeFromLegalIssues:legalOk, outperformedSP500_5y:beatSP500
    }
  });
}