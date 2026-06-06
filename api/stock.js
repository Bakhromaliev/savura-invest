// Savura Invest — stock.js
// Price: Yahoo Finance (real-time)
// Fundamentals: Claude AI + web search → exact stockanalysis.com data

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();
  const AI_KEY = process.env.ANTHROPIC_API_KEY;
  if (!AI_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const today = new Date().toISOString().split('T')[0];

  // ══════════════════════════════════════════
  // 1. REAL-TIME PRICE
  // ══════════════════════════════════════════
  let price = null, dataAsOf = today;

  for (const [url, parse] of [
    [`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, async r => {
      const d = await r.json();
      const m = d?.chart?.result?.[0]?.meta;
      if (m?.regularMarketPrice > 0) {
        price = +m.regularMarketPrice.toFixed(2);
        if (m.regularMarketTime) dataAsOf = new Date(m.regularMarketTime * 1000).toISOString().split('T')[0];
      }
    }],
    [`https://query2.finance.yahoo.com/v7/finance/quote?symbols=${sym}`, async r => {
      const d = await r.json();
      const q = d?.quoteResponse?.result?.[0];
      if (q?.regularMarketPrice > 0) price = +q.regularMarketPrice.toFixed(2);
    }],
    [`https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2ohlcv&h&e=csv`, async r => {
      const rows = (await r.text()).trim().split('\n');
      if (rows[1]) { const c = rows[1].split(','); const cl = parseFloat(c[5]); if (cl > 0) { price = +cl.toFixed(2); dataAsOf = c[1] || today; } }
    }]
  ]) {
    if (price) break;
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'application/json,text/html' } });
      if (r.ok) await parse(r);
    } catch {}
  }

  // ══════════════════════════════════════════
  // 2. FUNDAMENTALS via Claude + web search
  //    Reads exact data from stockanalysis.com
  // ══════════════════════════════════════════
  const prompt = `Search stockanalysis.com for the stock "${sym}" and get its financial statistics.

Look at these two pages:
1. https://stockanalysis.com/stocks/${sym.toLowerCase()}/statistics/
2. https://stockanalysis.com/stocks/${sym.toLowerCase()}/

Extract the following data and return ONLY a JSON object, nothing else:

If "${sym}" is not a real US stock, return: {"found":false}

Otherwise return:
{
  "found": true,
  "companyName": "full company name",
  "exchange": "NASDAQ or NYSE",
  "sector": "sector name",
  "industry": "industry name",
  "pe": trailing PE ratio as number,
  "ps": PS ratio as number,
  "pb": PB ratio as number,
  "peg": PEG ratio as number or null,
  "grossMargin": gross margin as number like 48.96 (NOT 0.4896),
  "operatingMargin": operating margin as number like 30.27,
  "netMargin": net/profit margin as number like 29.31,
  "currentRatio": current ratio as number,
  "quickRatio": quick ratio as number or null,
  "debtToEquity": debt to equity ratio as number,
  "debtToAssets": debt to assets ratio as number or null,
  "roe": return on equity as number like 39.69 (NOT 0.3969),
  "roa": return on assets as number like 22.09,
  "roic": return on invested capital as number like 33.23,
  "revenueGrowth": revenue growth % as number like 21.5,
  "epsGrowth": EPS growth % as number or null,
  "beta": beta as number like 1.65,
  "marketCap": market cap in USD millions as number like 359000,
  "interestCoverage": interest coverage ratio or null,
  "cashRatio": cash ratio or null,
  "profitableTTM": true or false,
  "operatingCashFlowPositive": true or false,
  "isDefensiveSector": true if Healthcare/Utilities/Consumer Staples/Energy, else false,
  "isIndustryLeader": true if company is top-5 in its industry, else false,
  "freeFromLegalIssues": true or false based on recent news,
  "outperformedSP500_5y": true or false based on 5-year stock performance
}

CRITICAL: All percentage values must be full numbers (48.96 not 0.4896). Return ONLY valid JSON.`;

  try {
    const ar = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!ar.ok) {
      const errText = await ar.text();
      return res.status(500).json({ error: 'AI error ' + ar.status + ': ' + errText.slice(0, 100) });
    }

    const ad = await ar.json();

    // Extract text from all content blocks (including after tool use)
    const textBlocks = (ad.content || []).filter(b => b.type === 'text');
    const txt = textBlocks.map(b => b.text).join('');

    // Find JSON in the response
    const si = txt.indexOf('{'), ei = txt.lastIndexOf('}');
    if (si === -1) return res.json({ found: false });

    const ai = JSON.parse(txt.slice(si, ei + 1));
    if (!ai.found) return res.json({ found: false });

    // Safety: fix any decimal percentages that slipped through
    const fixPct = v => {
      if (v == null || !isFinite(v)) return null;
      const n = +v;
      // If value is very small (< 2) it's probably in decimal form like 0.4896
      return n < 2 && n > -2 ? +(n * 100).toFixed(2) : +n.toFixed(2);
    };
    const num = v => v != null && isFinite(+v) ? +Number(v).toFixed(2) : null;

    return res.json({
      found: true,
      ticker: sym,
      companyName: ai.companyName || sym,
      exchange: ai.exchange || '',
      sector: ai.sector || '',
      industry: ai.industry || '',
      price: price,
      dataAsOf,
      fundamentals: {
        revenueGrowth:   fixPct(ai.revenueGrowth),
        epsGrowth:       fixPct(ai.epsGrowth),
        pe:              num(ai.pe),
        ps:              num(ai.ps),
        pb:              num(ai.pb),
        pcf:             num(ai.pcf),
        peg:             num(ai.peg),
        grossMargin:     fixPct(ai.grossMargin),
        operatingMargin: fixPct(ai.operatingMargin),
        netMargin:       fixPct(ai.netMargin),
        currentRatio:    num(ai.currentRatio),
        quickRatio:      num(ai.quickRatio),
        cashRatio:       num(ai.cashRatio),
        debtToEquity:    num(ai.debtToEquity),
        debtToAssets:    num(ai.debtToAssets),
        interestCoverage: num(ai.interestCoverage),
        roa:             fixPct(ai.roa),
        roe:             fixPct(ai.roe),
        roic:            fixPct(ai.roic)
      },
      risk: {
        beta:                      num(ai.beta),
        marketCap:                 ai.marketCap ? +Number(ai.marketCap).toFixed(0) : null,
        profitableTTM:             !!ai.profitableTTM,
        operatingCashFlowPositive: !!ai.operatingCashFlowPositive,
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