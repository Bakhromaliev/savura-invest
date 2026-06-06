export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();
  const AI_KEY = process.env.ANTHROPIC_API_KEY;
  if (!AI_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const today = new Date().toISOString().split('T')[0];
  const hdrs = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  // ── 1. REAL-TIME PRICE ──────────────────────────────────────
  let price = null, dataAsOf = today;
  for (const url of [
    `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`,
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${sym}`,
    `https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2ohlcv&h&e=csv`
  ]) {
    if (price) break;
    try {
      const r = await fetch(url, { headers: hdrs });
      if (!r.ok) continue;
      if (url.includes('chart')) {
        const d = await r.json();
        const m = d?.chart?.result?.[0]?.meta;
        if (m?.regularMarketPrice > 0) { price = +m.regularMarketPrice.toFixed(2); if (m.regularMarketTime) dataAsOf = new Date(m.regularMarketTime*1000).toISOString().split('T')[0]; }
      } else if (url.includes('v7')) {
        const d = await r.json();
        const q = d?.quoteResponse?.result?.[0];
        if (q?.regularMarketPrice > 0) price = +q.regularMarketPrice.toFixed(2);
      } else {
        const rows = (await r.text()).trim().split('\n');
        if (rows[1]) { const c = rows[1].split(','); const cl = parseFloat(c[5]); if (cl > 0) { price = +cl.toFixed(2); dataAsOf = c[1]||today; } }
      }
    } catch {}
  }

  // ── 2. YAHOO FINANCE quoteSummary (primary data source) ─────
  let yf = null;
  try {
    const r = await fetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${sym}?modules=price%2CdefaultKeyStatistics%2CfinancialData%2CsummaryDetail%2CassetProfile`,
      { headers: { ...hdrs, 'Accept': '*/*' } }
    );
    if (r.ok) {
      const d = await r.json();
      const result = d?.quoteSummary?.result?.[0];
      if (result) {
        const fd = result.financialData || {};
        const ks = result.defaultKeyStatistics || {};
        const sd = result.summaryDetail || {};
        const pr = result.price || {};
        const ap = result.assetProfile || {};
        const v = x => x?.raw ?? null;
        const p100 = x => x?.raw != null ? +(x.raw * 100).toFixed(2) : null;
        yf = {
          companyName: pr.longName || pr.shortName || '',
          exchange: pr.exchangeName || '',
          sector: ap.sector || '',
          industry: ap.industry || '',
          grossMargin:     p100(fd.grossMargins),
          operatingMargin: p100(fd.operatingMargins),
          netMargin:       p100(fd.profitMargins),
          roa:             p100(fd.returnOnAssets),
          roe:             p100(fd.returnOnEquity),
          currentRatio:    v(fd.currentRatio) ? +v(fd.currentRatio).toFixed(2) : null,
          quickRatio:      v(fd.quickRatio) ? +v(fd.quickRatio).toFixed(2) : null,
          debtToEquity:    v(fd.debtToEquity) != null ? +(v(fd.debtToEquity)/100).toFixed(2) : null,
          revenueGrowth:   p100(fd.revenueGrowth),
          epsGrowth:       p100(fd.earningsGrowth),
          pe:              v(sd.trailingPE) ? +v(sd.trailingPE).toFixed(2) : null,
          ps:              v(sd.priceToSalesTrailing12Months) ? +v(sd.priceToSalesTrailing12Months).toFixed(2) : null,
          pb:              v(ks.priceToBook) ? +v(ks.priceToBook).toFixed(2) : null,
          peg:             v(ks.pegRatio) ? +v(ks.pegRatio).toFixed(2) : null,
          beta:            v(ks.beta) ? +v(ks.beta).toFixed(2) : null,
          marketCap:       pr.marketCap?.raw ? +(pr.marketCap.raw/1e6).toFixed(0) : null,
          eps:             v(ks.trailingEps),
          profitableTTM:   (fd.profitMargins?.raw ?? 0) > 0,
          operatingCashFlowPositive: (fd.operatingCashflow?.raw ?? 0) > 0,
        };
      }
    }
  } catch {}

  // ── 3. CLAUDE HAIKU — fills gaps + ROIC + sector/risk booleans ──
  const hasData = yf && yf.grossMargin != null && yf.pe != null;
  
  // Always call Claude for: ROIC, interestCoverage, cashRatio, debtToAssets,
  // sector/industry (if not from YF), risk booleans, any null fields
  const fixPct = v => { if (v==null||!isFinite(+v)) return null; const n=+v; return n<2&&n>-2?+(n*100).toFixed(2):+n.toFixed(2); };

  try {
    const known = yf ? `
ALREADY KNOWN (from Yahoo Finance — do NOT change these, they are accurate):
- Gross Margin: ${yf.grossMargin}%
- Operating Margin: ${yf.operatingMargin}%
- Net Margin: ${yf.netMargin}%
- ROA: ${yf.roa}%
- ROE: ${yf.roe}%
- Current Ratio: ${yf.currentRatio}
- Quick Ratio: ${yf.quickRatio}
- Debt/Equity: ${yf.debtToEquity}
- Revenue Growth: ${yf.revenueGrowth}%
- EPS Growth: ${yf.epsGrowth}%
- P/E: ${yf.pe}
- P/S: ${yf.ps}
- P/B: ${yf.pb}
- PEG: ${yf.peg}
- Beta: ${yf.beta}
- Market Cap: $${yf.marketCap}M` : 'No prior data available.';

    const prompt = `Stock: ${sym}. Today: ${today}. Live price: $${price||'unknown'}.
${known}

Provide the following. For known values above, repeat them exactly. For unknown values, use latest available data.
Return ONLY this JSON (no text, no markdown). All % as full numbers (48.96 not 0.4896):
{
  "found": true or false (false only if not a real US stock),
  "companyName": "${yf?.companyName || 'string'}",
  "exchange": "${yf?.exchange || 'NASDAQ or NYSE'}",
  "sector": "${yf?.sector || 'string'}",
  "industry": "${yf?.industry || 'string'}",
  "pe": ${yf?.pe ?? 'number'},
  "ps": ${yf?.ps ?? 'number'},
  "pb": ${yf?.pb ?? 'number'},
  "peg": ${yf?.peg ?? 'number or null'},
  "pcf": "number or null",
  "grossMargin": ${yf?.grossMargin ?? 'number'},
  "operatingMargin": ${yf?.operatingMargin ?? 'number'},
  "netMargin": ${yf?.netMargin ?? 'number'},
  "currentRatio": ${yf?.currentRatio ?? 'number'},
  "quickRatio": ${yf?.quickRatio ?? 'number'},
  "cashRatio": "number or null",
  "debtToEquity": ${yf?.debtToEquity ?? 'number'},
  "debtToAssets": "number or null",
  "interestCoverage": "number",
  "roa": ${yf?.roa ?? 'number'},
  "roe": ${yf?.roe ?? 'number'},
  "roic": "number",
  "revenueGrowth": ${yf?.revenueGrowth ?? 'number'},
  "epsGrowth": ${yf?.epsGrowth ?? 'number or null'},
  "beta": ${yf?.beta ?? 'number'},
  "marketCap": ${yf?.marketCap ?? 'number in USD millions'},
  "profitableTTM": ${yf?.profitableTTM ?? 'true or false'},
  "operatingCashFlowPositive": ${yf?.operatingCashFlowPositive ?? 'true or false'},
  "isDefensiveSector": "true if Healthcare/Utilities/Consumer Staples/Energy else false",
  "isIndustryLeader": "true if top-5 in industry by market cap else false",
  "freeFromLegalIssues": "true or false based on known major legal/regulatory issues",
  "outperformedSP500_5y": "true if 5-year return > S&P 500 else false"
}`;

    const ar = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':AI_KEY, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:800, messages:[{role:'user',content:prompt}] })
    });

    if (!ar.ok) return res.status(500).json({ error: 'AI error '+ar.status });
    const ad = await ar.json();
    const txt = ad.content?.[0]?.text || '';
    const si = txt.indexOf('{'), ei = txt.lastIndexOf('}');
    if (si === -1) return res.json({ found: false });
    const ai = JSON.parse(txt.slice(si, ei+1));
    if (!ai.found) return res.json({ found: false });

    // Yahoo Finance data takes priority for all metrics it provided
    const F = (yfVal, aiVal) => yfVal != null ? yfVal : fixPct(aiVal);
    const N = (yfVal, aiVal) => yfVal != null ? yfVal : (aiVal!=null?+Number(aiVal).toFixed(2):null);

    return res.json({
      found: true, ticker: sym,
      companyName: yf?.companyName || ai.companyName || sym,
      exchange:    yf?.exchange    || ai.exchange    || '',
      sector:      yf?.sector      || ai.sector      || '',
      industry:    yf?.industry    || ai.industry    || '',
      price, dataAsOf,
      fundamentals: {
        revenueGrowth:   F(yf?.revenueGrowth,   ai.revenueGrowth),
        epsGrowth:       F(yf?.epsGrowth,        ai.epsGrowth),
        pe:              N(yf?.pe,               ai.pe),
        ps:              N(yf?.ps,               ai.ps),
        pb:              N(yf?.pb,               ai.pb),
        pcf:             N(null,                 ai.pcf),
        peg:             N(yf?.peg,              ai.peg),
        grossMargin:     F(yf?.grossMargin,      ai.grossMargin),
        operatingMargin: F(yf?.operatingMargin,  ai.operatingMargin),
        netMargin:       F(yf?.netMargin,        ai.netMargin),
        currentRatio:    N(yf?.currentRatio,     ai.currentRatio),
        quickRatio:      N(yf?.quickRatio,       ai.quickRatio),
        cashRatio:       N(null,                 ai.cashRatio),
        debtToEquity:    N(yf?.debtToEquity,     ai.debtToEquity),
        debtToAssets:    N(null,                 ai.debtToAssets),
        interestCoverage:N(null,                 ai.interestCoverage),
        roa:             F(yf?.roa,              ai.roa),
        roe:             F(yf?.roe,              ai.roe),
        roic:            fixPct(ai.roic)
      },
      risk: {
        beta:                      N(yf?.beta, ai.beta),
        marketCap:                 N(yf?.marketCap, ai.marketCap),
        profitableTTM:             yf?.profitableTTM ?? !!ai.profitableTTM,
        operatingCashFlowPositive: yf?.operatingCashFlowPositive ?? !!ai.operatingCashFlowPositive,
        isDefensiveSector:         !!ai.isDefensiveSector,
        isIndustryLeader:          !!ai.isIndustryLeader,
        freeFromLegalIssues:       !!ai.freeFromLegalIssues,
        outperformedSP500_5y:      !!ai.outperformedSP500_5y
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}