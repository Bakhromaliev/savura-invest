export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym   = symbol.toUpperCase().trim();
  const AV    = process.env.ALPHAVANTAGE_KEY;
  const AIKEY = process.env.ANTHROPIC_API_KEY;
  if (!AV)    return res.status(500).json({ error: 'ALPHAVANTAGE_KEY not set' });
  if (!AIKEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const today = new Date().toISOString().split('T')[0];
  const n  = v => { const x=parseFloat(String(v)); return (isNaN(x)||!isFinite(x)||String(v).trim()==='None')?null:x; };
  const f2 = v => { const x=n(v); return x==null?null:+x.toFixed(2); };
  const p  = v => { const x=n(v); return x==null?null:+(x*100).toFixed(2); };
  const hdrs = {'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36','Accept':'application/json'};

  // ── 1. REAL-TIME PRICE ───────────────────────────────────────
  let price=null, dataAsOf=today;
  for (const [url, parse] of [
    [`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=5d`, async r=>{
      const d=await r.json(),m=d?.chart?.result?.[0]?.meta;
      if(m?.regularMarketPrice>0){price=+m.regularMarketPrice.toFixed(2);
        if(m.regularMarketTime)dataAsOf=new Date(m.regularMarketTime*1000).toISOString().split('T')[0];}
    }],
    [`https://query2.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=5d`, async r=>{
      const d=await r.json(),m=d?.chart?.result?.[0]?.meta;
      if(m?.regularMarketPrice>0)price=+m.regularMarketPrice.toFixed(2);
    }],
    [`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${sym}`, async r=>{
      const d=await r.json(),q=d?.quoteResponse?.result?.[0];
      if(q?.regularMarketPrice>0)price=+q.regularMarketPrice.toFixed(2);
    }],
    [`https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2ohlcv&h&e=csv`, async r=>{
      const rows=(await r.text()).trim().split('\n');
      if(rows[1]){const c=rows[1].split(',');const cl=parseFloat(c[5]);
        if(cl>0){price=+cl.toFixed(2);dataAsOf=c[1]||today;}}
    }]
  ]){if(price)break;try{const r=await fetch(url,{headers:hdrs});if(r.ok)await parse(r);}catch{}}

  // ── 2. ALPHA VANTAGE OVERVIEW (1 call only) ──────────────────
  let ov={};
  try{
    const r=await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${sym}&apikey=${AV}`);
    ov=await r.json();
  }catch(e){return res.status(500).json({error:'AV: '+e.message});}

  if(!ov.Symbol){
    if(ov.Note||ov.Information)return res.status(429).json({error:'AV rate limit — 1 daqiqadan keyin qayta urinib ko\'ring'});
    return res.json({found:false});
  }

  const mktCap=n(ov.MarketCapitalization), revTTM=n(ov.RevenueTTM), gpTTM=n(ov.GrossProfitTTM);
  const eps=n(ov.EPS);
  const pe = price&&eps&&eps>0 ? f2(price/eps) : f2(ov.TrailingPE)||f2(ov.PERatio);
  const pb = f2(ov.PriceToBookRatio), peg=f2(ov.PEGRatio);
  const ps = mktCap&&revTTM ? f2(mktCap/revTTM) : null;
  const grossM = gpTTM&&revTTM ? +(gpTTM/revTTM*100).toFixed(2) : null;
  const mc = mktCap ? +(mktCap/1e6).toFixed(0) : null;

  // ── 3. CLAUDE — fills ALL missing values ─────────────────────
  // Ask Claude for: growth rates, balance sheet ratios, ROIC, risk
  const prompt = `You are a financial data API. Stock: ${sym} (${ov.Name||sym}).
Sector: ${ov.Sector||'unknown'}. Industry: ${ov.Industry||'unknown'}. Today: ${today}.

I already have from Alpha Vantage (DO NOT change these):
PE=${pe}, PS=${ps}, PB=${pb}, PEG=${peg}
GrossMargin=${grossM}%, OperatingMargin=${p(ov.OperatingMarginTTM)}%, NetMargin=${p(ov.ProfitMargin)}%
ROE=${p(ov.ReturnOnEquityTTM)}%, ROA=${p(ov.ReturnOnAssetsTTM)}%
Beta=${f2(ov.Beta)}, MarketCap=$${mc}M

Provide EXACT values from the most recent available data (match stockanalysis.com):
Return ONLY this JSON object, no other text:
{"revenueGrowth":ANNUAL_YOY_%,"epsGrowth":ANNUAL_YOY_%,"currentRatio":EXACT,"quickRatio":EXACT,"debtToEquity":EXACT,"interestCoverage":EXACT,"roic":EXACT_%,"pcf":EXACT_OR_NULL,"isDefensiveSector":BOOL,"isIndustryLeader":BOOL,"freeFromLegalIssues":BOOL,"outperformedSP500_5y":BOOL}

Rules:
- revenueGrowth/epsGrowth: most recent ANNUAL year vs prior year (NOT quarterly)
- isDefensiveSector: true ONLY for Healthcare/Utilities/Consumer Staples/Energy sectors
- isIndustryLeader: true if top-5 by market cap in their specific industry
- freeFromLegalIssues: true unless major ongoing lawsuits or SEC/DOJ enforcement
- All percentages as numbers: 33.23 not 0.3323
- If ${sym} is not a real US stock ticker, return {"found":false}`;

  try{
    const ar=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':AIKEY,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:300,
        messages:[{role:'user',content:prompt}]})
    });
    if(!ar.ok)return res.status(500).json({error:'AI error '+ar.status});
    const ad=await ar.json();
    const txt=ad.content?.[0]?.text||'';
    const si=txt.indexOf('{'),ei=txt.lastIndexOf('}');
    if(si===-1)return res.json({found:false});
    const ai=JSON.parse(txt.slice(si,ei+1));
    if(ai.found===false)return res.json({found:false});

    const fixPct = v => {
      if(v==null||!isFinite(+v))return null;
      const x=+v;
      return x<2&&x>-2 ? +(x*100).toFixed(2) : +x.toFixed(2);
    };

    return res.json({
      found:true, ticker:sym,
      companyName:ov.Name||sym, exchange:ov.Exchange||'',
      sector:ov.Sector||'', industry:ov.Industry||'',
      price, dataAsOf,
      fundamentals:{
        revenueGrowth: fixPct(ai.revenueGrowth),
        epsGrowth:     fixPct(ai.epsGrowth),
        pe, ps, pb, pcf:f2(ai.pcf), peg,
        grossMargin:     grossM,
        operatingMargin: p(ov.OperatingMarginTTM),
        netMargin:       p(ov.ProfitMargin),
        currentRatio:    f2(ai.currentRatio),
        quickRatio:      f2(ai.quickRatio),
        cashRatio:       null,
        debtToEquity:    f2(ai.debtToEquity),
        debtToAssets:    null,
        interestCoverage:f2(ai.interestCoverage),
        roa: p(ov.ReturnOnAssetsTTM),
        roe: p(ov.ReturnOnEquityTTM),
        roic:fixPct(ai.roic)
      },
      risk:{
        beta:f2(ov.Beta), marketCap:mc,
        profitableTTM:             p(ov.ProfitMargin)!=null?p(ov.ProfitMargin)>0:true,
        operatingCashFlowPositive: p(ov.OperatingMarginTTM)!=null?p(ov.OperatingMarginTTM)>0:true,
        isDefensiveSector:  !!ai.isDefensiveSector,
        isIndustryLeader:   !!ai.isIndustryLeader,
        freeFromLegalIssues:!!ai.freeFromLegalIssues,
        outperformedSP500_5y:!!ai.outperformedSP500_5y
      }
    });
  }catch(e){return res.status(500).json({error:'Claude: '+e.message});}
}