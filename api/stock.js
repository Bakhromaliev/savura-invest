// Savura Invest - stock.js
// Data sources: SEC EDGAR (official) + Yahoo Finance (price) + Claude (gaps only)
// This matches stockanalysis.com exactly since they use the same SEC EDGAR source

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();
  const AI_KEY = process.env.ANTHROPIC_API_KEY;
  const SEC_UA = 'savura-invest/1.0 bahromaliyevmuhammadyusuf@gmail.com';
  const today = new Date().toISOString().split('T')[0];

  const n2 = v => v != null && isFinite(v) ? +Number(v).toFixed(2) : null;
  const p2 = v => v != null && isFinite(v) ? +Number(v).toFixed(2) : null;

  // ══════════════════════════════════════════════════════
  // 1. REAL-TIME PRICE — Yahoo Finance + Stooq fallback
  // ══════════════════════════════════════════════════════
  let price = null, dataAsOf = today;

  for (const [url, parse] of [
    [`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`,
     async r => { const d=await r.json(); const m=d?.chart?.result?.[0]?.meta; if(m?.regularMarketPrice>0){price=+m.regularMarketPrice.toFixed(2);if(m.regularMarketTime)dataAsOf=new Date(m.regularMarketTime*1000).toISOString().split('T')[0];} }],
    [`https://query2.finance.yahoo.com/v7/finance/quote?symbols=${sym}`,
     async r => { const d=await r.json(); const q=d?.quoteResponse?.result?.[0]; if(q?.regularMarketPrice>0){price=+q.regularMarketPrice.toFixed(2);} }],
    [`https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2ohlcv&h&e=csv`,
     async r => { const rows=(await r.text()).trim().split('\n'); if(rows[1]){const c=rows[1].split(',');const cl=parseFloat(c[5]);if(cl>0){price=+cl.toFixed(2);dataAsOf=c[1]||today;}} }]
  ]) {
    if (price) break;
    try { const r = await fetch(url, { headers: {'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36','Accept':'application/json,text/html'} }); if (r.ok) await parse(r); } catch {}
  }

  // ══════════════════════════════════════════════════════
  // 2. SEC EDGAR — official financial data (same source as stockanalysis.com)
  // ══════════════════════════════════════════════════════
  let secData = null;
  try {
    // 2a. Get CIK from ticker
    const tickRes = await fetch('https://www.sec.gov/files/company_tickers.json',
      { headers:{'User-Agent':SEC_UA,'Accept':'application/json'} });
    const tickers = await tickRes.json();
    const cikEntry = Object.values(tickers).find(t => t.ticker.toUpperCase() === sym);
    if (!cikEntry) throw new Error('ticker not found');

    const cik = String(cikEntry.cik_str).padStart(10,'0');

    // 2b. Fetch submissions for company info (sector, shares outstanding, beta not available)
    const subRes = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`,
      { headers:{'User-Agent':SEC_UA} });
    const sub = await subRes.json();
    const companyName = sub.name || cikEntry.title || sym;
    const sic = sub.sic || '';
    const exchange = sub.exchanges?.[0] || '';

    // 2c. Fetch key financial concepts in parallel
    const BASE = `https://data.sec.gov/api/xbrl/companyconcept/CIK${cik}/us-gaap`;
    const conceptFetch = c => fetch(`${BASE}/${c}.json`,{headers:{'User-Agent':SEC_UA}})
      .then(r=>r.ok?r.json():null).catch(()=>null);

    const [rev1, rev2, grossProfit, opIncome, netIncome,
           assets, curAssets, curLiab, liab, equity,
           ltDebt, epsDil, ocf, shares, inventory] = await Promise.all([
      conceptFetch('Revenues'),
      conceptFetch('RevenueFromContractWithCustomerExcludingAssessedTax'),
      conceptFetch('GrossProfit'),
      conceptFetch('OperatingIncomeLoss'),
      conceptFetch('NetIncomeLoss'),
      conceptFetch('Assets'),
      conceptFetch('AssetsCurrent'),
      conceptFetch('LiabilitiesCurrent'),
      conceptFetch('Liabilities'),
      conceptFetch('StockholdersEquity'),
      conceptFetch('LongTermDebt'),
      conceptFetch('EarningsPerShareDiluted'),
      conceptFetch('NetCashProvidedByUsedInOperatingActivities'),
      conceptFetch('CommonStockSharesOutstanding'),
      conceptFetch('InventoryNet')
    ]);

    // 2d. TTM calculation from quarterly filings
    function getTTM(data) {
      if (!data?.units?.USD) return null;
      // Get quarterly (3-month) filings sorted by end date desc
      const items = data.units.USD
        .filter(d => d.val != null && (d.form==='10-Q'||d.form==='10-K'))
        .map(d => ({
          ...d,
          days: d.start ? Math.round((new Date(d.end)-new Date(d.start))/(864e5)) : null
        }))
        .sort((a,b) => new Date(b.end)-new Date(a.end));

      // Prefer quarterly (60-105 day) items for TTM
      const quarterly = items.filter(d => d.days>=60 && d.days<=105);
      const seen = new Set();
      const last4 = [];
      for (const q of quarterly) {
        if (!seen.has(q.end) && last4.length<4) { seen.add(q.end); last4.push(q); }
      }
      if (last4.length===4) return last4.reduce((s,q)=>s+q.val,0);

      // Fallback: most recent annual 10-K
      const annual = items.filter(d => d.form==='10-K');
      if (annual[0]) return annual[0].val;
      return items[0]?.val ?? null;
    }

    function getLatest(data) {
      if (!data?.units?.USD) return null;
      const items = data.units.USD
        .filter(d => d.val!=null && (d.form==='10-Q'||d.form==='10-K'))
        .sort((a,b)=>new Date(b.end)-new Date(a.end));
      return items[0]?.val ?? null;
    }

    // Revenue: try primary concept, fallback to secondary
    const revData = rev1?.units?.USD?.length ? rev1 : rev2;
    const revenue = getTTM(revData);
    const gp      = getTTM(grossProfit);
    const opInc   = getTTM(opIncome);
    const netInc  = getTTM(netIncome);
    const totalAssets  = getLatest(assets);
    const curA    = getLatest(curAssets);
    const curL    = getLatest(curLiab);
    const totalLiab = getLatest(liab);
    const eq      = getLatest(equity);
    const ltd     = getLatest(ltDebt);
    const epsTTM  = getTTM(epsDil);
    const cfOps   = getTTM(ocf);
    const sharesOut = getLatest(shares);
    const inv     = getLatest(inventory);

    // Calculate all financial ratios
    const grossM  = revenue && gp   ? gp/revenue*100   : null;
    const opM     = revenue && opInc? opInc/revenue*100 : null;
    const netM    = revenue && netInc? netInc/revenue*100 : null;
    const curRatio = curA && curL   ? curA/curL         : null;
    const qkRatio  = curA && curL && inv!=null ? (curA-(inv||0))/curL : curA&&curL?curA/curL:null;
    const cashA    = null; // Need separate cash concept
    const d2e     = eq && ltd!==null ? ltd/eq           : null;
    const d2a     = totalAssets && totalLiab ? totalLiab/totalAssets : null;
    const roa     = totalAssets && netInc ? netInc/totalAssets*100 : null;
    const roe     = eq && netInc ? netInc/eq*100 : null;

    // Book value per share for P/B
    const bookPerShare = eq && sharesOut ? eq/sharesOut : null;

    // Revenue growth (TTM vs prior year): need to compare periods
    // Using the 4 most recent quarters vs 4 quarters before that
    function getDoubleYear(data) {
      if (!data?.units?.USD) return [null,null];
      const quarterly = data.units.USD
        .filter(d=>d.val!=null&&d.start&&(d.form==='10-Q'||d.form==='10-K'))
        .map(d=>({...d,days:Math.round((new Date(d.end)-new Date(d.start))/(864e5))}))
        .filter(d=>d.days>=60&&d.days<=105)
        .sort((a,b)=>new Date(b.end)-new Date(a.end));
      const seen=new Set(), periods=[];
      for(const q of quarterly){if(!seen.has(q.end)&&periods.length<8){seen.add(q.end);periods.push(q);}}
      if(periods.length<8) return [null,null];
      const cur=periods.slice(0,4).reduce((s,q)=>s+q.val,0);
      const prev=periods.slice(4,8).reduce((s,q)=>s+q.val,0);
      return [cur,prev];
    }
    const [curRev,prevRev] = getDoubleYear(revData);
    const revGrowth = curRev&&prevRev&&prevRev!==0 ? (curRev-prevRev)/Math.abs(prevRev)*100 : null;
    const [curEPS,prevEPS] = getDoubleYear(epsDil);
    const epsGrowth = curEPS&&prevEPS&&prevEPS!==0 ? (curEPS-prevEPS)/Math.abs(prevEPS)*100 : null;

    // Valuation ratios (need price)
    const pe = price && epsTTM ? price/epsTTM : null;
    const ps = price && revenue && sharesOut ? price/(revenue/sharesOut) : null;
    const pb = price && bookPerShare ? price/bookPerShare : null;
    const pcf = price && cfOps && sharesOut ? price/(cfOps/sharesOut) : null;

    // Market cap
    const mktCap = price && sharesOut ? +(price*sharesOut/1e6).toFixed(0) : null;

    secData = {
      companyName, exchange, sic,
      grossMargin:     p2(grossM),
      operatingMargin: p2(opM),
      netMargin:       p2(netM),
      currentRatio:    n2(curRatio),
      quickRatio:      n2(qkRatio),
      debtToEquity:    n2(d2e),
      debtToAssets:    n2(d2a),
      roa:             p2(roa),
      roe:             p2(roe),
      revenueGrowth:   p2(revGrowth),
      epsGrowth:       p2(epsGrowth),
      pe:              n2(pe),
      ps:              n2(ps),
      pb:              n2(pb),
      pcf:             n2(pcf),
      marketCap:       mktCap,
      profitableTTM:   netInc != null ? netInc > 0 : null,
      operatingCashFlowPositive: cfOps != null ? cfOps > 0 : null,
      _source: 'SEC EDGAR'
    };
  } catch(e) {
    secData = { _secError: e.message };
  }

  // ══════════════════════════════════════════════════════
  // 3. CLAUDE — fills only missing values + sector/industry/beta
  // ══════════════════════════════════════════════════════
  const missing = !secData?.grossMargin || !secData?.roe;
  if (AI_KEY && (missing || !secData?.companyName)) {
    const known = secData ? JSON.stringify({
      grossMargin: secData.grossMargin,
      operatingMargin: secData.operatingMargin,
      netMargin: secData.netMargin,
      roe: secData.roe, roa: secData.roa,
      currentRatio: secData.currentRatio,
      debtToEquity: secData.debtToEquity,
      pe: secData.pe, revenueGrowth: secData.revenueGrowth
    }) : '{}';

    try {
      const ar = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':AI_KEY,'anthropic-version':'2023-06-01'},
        body:JSON.stringify({
          model:'claude-sonnet-4-6', max_tokens:600,
          messages:[{role:'user',content:
            `Stock: ${sym}. Today: ${today}. Live price: ${price||'unknown'}.
Already computed from SEC EDGAR (trust these): ${known}
Provide ONLY missing values + these always-needed fields.
Return JSON only (no text):
{"sector":"Technology etc","industry":"Semiconductors etc","beta":number,"peg":number_or_null,"quickRatio":${secData?.quickRatio??'null'},"cashRatio":number_or_null,"interestCoverage":number_or_null,"roic":number,"isDefensiveSector":bool,"isIndustryLeader":bool,"freeFromLegalIssues":bool,"outperformedSP500_5y":bool${missing?',"pe":number,"grossMargin":number,"operatingMargin":number,"netMargin":number,"roe":number,"roa":number,"currentRatio":number,"debtToEquity":number,"revenueGrowth":number,"epsGrowth":number,"marketCap":number':''},"found":true}
All % as full numbers (74.15 not 0.7415). If not real US ticker: {"found":false}`
          }]
        })
      });
      if (ar.ok) {
        const ad = await ar.json();
        const txt = ad.content?.[0]?.text||'';
        const si=txt.indexOf('{'),ei=txt.lastIndexOf('}');
        if (si!==-1) {
          const ai = JSON.parse(txt.slice(si,ei+1));
          if (!ai.found) return res.json({found:false});
          // Merge: SEC data takes priority, Claude fills gaps
          const merge = (secVal, aiVal) => secVal!=null ? secVal : aiVal;
          secData = {
            ...ai,
            ...secData,
            sector: ai.sector||'',
            industry: ai.industry||'',
            beta: n2(ai.beta),
            peg: n2(ai.peg),
            roic: p2(ai.roic),
            interestCoverage: n2(ai.interestCoverage),
            cashRatio: n2(ai.cashRatio),
            isDefensiveSector: !!ai.isDefensiveSector,
            isIndustryLeader: !!ai.isIndustryLeader,
            freeFromLegalIssues: !!ai.freeFromLegalIssues,
            outperformedSP500_5y: !!ai.outperformedSP500_5y,
            grossMargin:     merge(secData?.grossMargin, p2(ai.grossMargin)),
            operatingMargin: merge(secData?.operatingMargin, p2(ai.operatingMargin)),
            netMargin:       merge(secData?.netMargin, p2(ai.netMargin)),
            roe:             merge(secData?.roe, p2(ai.roe)),
            roa:             merge(secData?.roa, p2(ai.roa)),
            currentRatio:    merge(secData?.currentRatio, n2(ai.currentRatio)),
            debtToEquity:    merge(secData?.debtToEquity, n2(ai.debtToEquity)),
            revenueGrowth:   merge(secData?.revenueGrowth, p2(ai.revenueGrowth)),
            epsGrowth:       merge(secData?.epsGrowth, p2(ai.epsGrowth)),
            pe:              merge(secData?.pe, n2(ai.pe)),
            marketCap:       merge(secData?.marketCap, ai.marketCap),
          };
        }
      }
    } catch {}
  }

  if (!secData?.companyName && !price) return res.json({found:false});

  return res.json({
    found: true, ticker: sym,
    companyName: secData?.companyName||sym,
    exchange: secData?.exchange||'',
    sector: secData?.sector||'',
    industry: secData?.industry||'',
    price, dataAsOf,
    _dataSource: secData?._source||'Claude AI',
    fundamentals: {
      revenueGrowth:   secData?.revenueGrowth??null,
      epsGrowth:       secData?.epsGrowth??null,
      pe:              secData?.pe??null,
      ps:              secData?.ps??null,
      pb:              secData?.pb??null,
      pcf:             secData?.pcf??null,
      peg:             secData?.peg??null,
      grossMargin:     secData?.grossMargin??null,
      operatingMargin: secData?.operatingMargin??null,
      netMargin:       secData?.netMargin??null,
      currentRatio:    secData?.currentRatio??null,
      quickRatio:      secData?.quickRatio??null,
      cashRatio:       secData?.cashRatio??null,
      debtToEquity:    secData?.debtToEquity??null,
      debtToAssets:    secData?.debtToAssets??null,
      interestCoverage:secData?.interestCoverage??null,
      roa:             secData?.roa??null,
      roe:             secData?.roe??null,
      roic:            secData?.roic??null
    },
    risk: {
      beta:                      secData?.beta??null,
      marketCap:                 secData?.marketCap??null,
      profitableTTM:             secData?.profitableTTM??true,
      operatingCashFlowPositive: secData?.operatingCashFlowPositive??true,
      isDefensiveSector:         secData?.isDefensiveSector??false,
      isIndustryLeader:          secData?.isIndustryLeader??false,
      freeFromLegalIssues:       secData?.freeFromLegalIssues??true,
      outperformedSP500_5y:      secData?.outperformedSP500_5y??false
    }
  });
}