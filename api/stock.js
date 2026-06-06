export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();
  const AI_KEY = process.env.ANTHROPIC_API_KEY;
  if (!AI_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const BHD = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  const num = v => { const n = parseFloat(String(v).replace(/[,%$B]/g,'')); return isNaN(n)||!isFinite(n)?null:+n.toFixed(4); };
  const pct = v => { const n = parseFloat(String(v).replace(/[,%$]/g,'')); return isNaN(n)||!isFinite(n)?null:+n.toFixed(2); };

  // ── 1. Real-time price ────────────────────────────────────────
  let price = null, dataAsOf = new Date().toISOString().split('T')[0];

  // Yahoo Finance (primary)
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d&includePrePost=false`, {
      headers: { ...BHD, 'Accept': 'application/json' }
    });
    if (r.ok) {
      const d = await r.json();
      const meta = d?.chart?.result?.[0]?.meta;
      const p = meta?.regularMarketPrice ?? meta?.chartPreviousClose;
      if (p && p > 0) {
        price = +p.toFixed(2);
        if (meta.regularMarketTime) dataAsOf = new Date(meta.regularMarketTime*1000).toISOString().split('T')[0];
      }
    }
  } catch {}

  // Stooq (fallback)
  if (!price) {
    try {
      const r = await fetch(`https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2t2ohlcv&h&e=csv`, { headers: BHD });
      if (r.ok) {
        const rows = (await r.text()).trim().split('\n');
        if (rows[1]) {
          const c = rows[1].split(',');
          const cl = parseFloat(c[6]);
          if (cl > 0) { price = +cl.toFixed(2); dataAsOf = c[1]||dataAsOf; }
        }
      }
    } catch {}
  }

  // ── 2. stockanalysis.com statistics (real SEC data) ──────────
  let sa = {};
  try {
    const r = await fetch(`https://stockanalysis.com/stocks/${sym.toLowerCase()}/financials/ratios/`, { headers: BHD });
    if (r.ok) {
      const html = await r.text();
      // Extract __NEXT_DATA__
      const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (m) {
        const nd = JSON.parse(m[1]);
        // Walk JSON tree looking for financial ratios
        const walk = (o, depth=0) => {
          if (!o||depth>10||typeof o!=='object') return;
          for (const [k,v] of Object.entries(o)) {
            if (v&&typeof v==='object') walk(v, depth+1);
            const kl = k.toLowerCase();
            if (kl.includes('pe')&&!sa.pe)                sa.pe = num(v);
            if (kl.includes('ps')&&!sa.ps)                sa.ps = num(v);
            if (kl.includes('pb')&&!sa.pb)                sa.pb = num(v);
            if (kl.includes('peg')&&!sa.peg)              sa.peg = num(v);
            if (kl.includes('grossmargin')&&!sa.gm)       sa.gm = pct(v);
            if (kl.includes('operatingmargin')&&!sa.om)   sa.om = pct(v);
            if ((kl.includes('netmargin')||kl.includes('profitmargin'))&&!sa.nm) sa.nm = pct(v);
            if (kl.includes('roe')&&!sa.roe)              sa.roe = pct(v);
            if (kl.includes('roa')&&!sa.roa)              sa.roa = pct(v);
            if (kl.includes('roic')&&!sa.roic)            sa.roic = pct(v);
            if (kl.includes('currentratio')&&!sa.cr)      sa.cr = num(v);
            if (kl.includes('quickratio')&&!sa.qr)        sa.qr = num(v);
            if (kl.includes('cashratio')&&!sa.cashr)      sa.cashr = num(v);
            if (kl.includes('debttoequity')&&!sa.d2e)     sa.d2e = num(v);
            if (kl.includes('debttototal')&&!sa.d2a)      sa.d2a = num(v);
            if (kl.includes('beta')&&!sa.beta)            sa.beta = num(v);
            if (kl.includes('marketcap')&&!sa.mc)         sa.mc = num(v);
            if (kl.includes('revenuegrowth')&&!sa.rg)     sa.rg = pct(v);
            if (kl.includes('epsgrowth')&&!sa.eg)         sa.eg = pct(v);
            if (kl.includes('sector')&&!sa.sector&&typeof v==='string') sa.sector = v;
            if (kl.includes('industry')&&!sa.ind&&typeof v==='string')  sa.ind = v;
            if ((kl.includes('name')||kl.includes('companyname'))&&!sa.name&&typeof v==='string'&&v.length>2) sa.name = v;
          }
        };
        walk(nd?.props?.pageProps);
      }
    }
  } catch {}

  // ── 3. Claude AI fills in everything (uses SA data as base) ──
  const today = new Date().toISOString().split('T')[0];
  const prompt = `You are a financial data API. Today is ${today}. Stock: ${sym}.

Known real-time data (from stockanalysis.com/SEC filings — trust these over your training):
${JSON.stringify(sa)}
Live price: ${price ?? 'unknown'}

Fill in ALL fields below using the LATEST quarterly TTM data available (as of today ${today}).
For P/E: calculate using live price if known, or use current TTM P/E from most recent filings.
If not a real US ticker, return {"found":false}.

Return ONLY this JSON (no text, no markdown):
{
  "found": true,
  "companyName": "string",
  "exchange": "NASDAQ or NYSE",
  "sector": "${sa.sector||'string'}",
  "industry": "${sa.ind||'string'}",
  "pe": number,
  "ps": number,
  "pb": number,
  "pcf": number_or_null,
  "peg": number_or_null,
  "grossMargin": number,
  "operatingMargin": number,
  "netMargin": number,
  "currentRatio": number,
  "quickRatio": number,
  "cashRatio": number_or_null,
  "debtToEquity": number,
  "debtToAssets": number_or_null,
  "interestCoverage": number_or_null,
  "roa": number,
  "roe": number,
  "roic": number,
  "revenueGrowth": number,
  "epsGrowth": number,
  "beta": number,
  "marketCap": number_in_usd_millions,
  "profitableTTM": boolean,
  "operatingCashFlowPositive": boolean,
  "isDefensiveSector": boolean,
  "isIndustryLeader": boolean,
  "freeFromLegalIssues": boolean,
  "outperformedSP500_5y": boolean
}`;

  try {
    const ar = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':AI_KEY,'anthropic-version':'2023-06-01'},
      body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:800,
        messages:[{role:'user',content:prompt}] })
    });
    if (!ar.ok) return res.status(500).json({ error: 'AI error '+ar.status });
    const ad = await ar.json();
    const txt = ad.content?.[0]?.text||'';
    const si=txt.indexOf('{'), ei=txt.lastIndexOf('}');
    if (si===-1) return res.json({found:false});
    const ai = JSON.parse(txt.slice(si,ei+1));
    if (!ai.found) return res.json({found:false});

    // SA data overrides Claude where available (SA = real SEC data)
    const F = (saVal, aiVal) => saVal!=null ? saVal : (aiVal!=null ? aiVal : null);

    return res.json({
      found: true, ticker: sym,
      companyName: sa.name||ai.companyName||sym,
      exchange: ai.exchange||'', sector: sa.sector||ai.sector||'', industry: sa.ind||ai.industry||'',
      price: price, dataAsOf,
      fundamentals: {
        revenueGrowth:   F(sa.rg,   ai.revenueGrowth),
        epsGrowth:       F(sa.eg,   ai.epsGrowth),
        pe:              F(sa.pe,   ai.pe),
        ps:              F(sa.ps,   ai.ps),
        pb:              F(sa.pb,   ai.pb),
        pcf:             ai.pcf ?? null,
        peg:             F(sa.peg,  ai.peg),
        grossMargin:     F(sa.gm,   ai.grossMargin),
        operatingMargin: F(sa.om,   ai.operatingMargin),
        netMargin:       F(sa.nm,   ai.netMargin),
        currentRatio:    F(sa.cr,   ai.currentRatio),
        quickRatio:      F(sa.qr,   ai.quickRatio),
        cashRatio:       F(sa.cashr,ai.cashRatio),
        debtToEquity:    F(sa.d2e,  ai.debtToEquity),
        debtToAssets:    ai.debtToAssets ?? null,
        interestCoverage: ai.interestCoverage ?? null,
        roa:  F(sa.roa,  ai.roa),
        roe:  F(sa.roe,  ai.roe),
        roic: F(sa.roic, ai.roic)
      },
      risk: {
        beta:                      F(sa.beta, ai.beta),
        marketCap:                 F(sa.mc,   ai.marketCap),
        profitableTTM:             ai.profitableTTM,
        operatingCashFlowPositive: ai.operatingCashFlowPositive,
        isDefensiveSector:         ai.isDefensiveSector,
        isIndustryLeader:          ai.isIndustryLeader,
        freeFromLegalIssues:       ai.freeFromLegalIssues,
        outperformedSP500_5y:      ai.outperformedSP500_5y
      }
    });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}