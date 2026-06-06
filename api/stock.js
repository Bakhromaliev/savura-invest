export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();
  const AI_KEY = process.env.ANTHROPIC_API_KEY;
  if (!AI_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const today = new Date().toISOString().split('T')[0];
  let price = null, dataAsOf = today;

  // ── 1. Real-time price: try 4 sources ────────────────────────
  const priceAttempts = [
    // Yahoo Finance v8 chart
    async () => {
      const r = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'application/json', 'Accept-Language': 'en-US,en;q=0.9' } }
      );
      const d = await r.json();
      const meta = d?.chart?.result?.[0]?.meta;
      const p = meta?.regularMarketPrice || meta?.chartPreviousClose;
      if (p > 0) { price = +p.toFixed(2); if (meta.regularMarketTime) dataAsOf = new Date(meta.regularMarketTime*1000).toISOString().split('T')[0]; }
    },
    // Yahoo Finance v7 quote
    async () => {
      const r = await fetch(
        `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${sym}&fields=regularMarketPrice,regularMarketTime`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'application/json' } }
      );
      const d = await r.json();
      const q = d?.quoteResponse?.result?.[0];
      if (q?.regularMarketPrice > 0) { price = +q.regularMarketPrice.toFixed(2); if (q.regularMarketTime) dataAsOf = new Date(q.regularMarketTime*1000).toISOString().split('T')[0]; }
    },
    // Stooq CSV
    async () => {
      const r = await fetch(`https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2ohlcv&h&e=csv`);
      const rows = (await r.text()).trim().split('\n');
      if (rows[1]) { const c = rows[1].split(','); const cl = parseFloat(c[5]); if (cl > 0) { price = +cl.toFixed(2); dataAsOf = c[1]||today; } }
    },
    // Yahoo Finance quoteSummary price module
    async () => {
      const r = await fetch(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${sym}?modules=price`,
        { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
      );
      const d = await r.json();
      const p = d?.quoteSummary?.result?.[0]?.price?.regularMarketPrice?.raw;
      if (p > 0) price = +p.toFixed(2);
    }
  ];

  for (const attempt of priceAttempts) {
    if (price) break;
    try { await attempt(); } catch {}
  }

  // ── 2. Claude AI — fundamentals with explicit date context ────
  const prompt = `You are a financial data API. Today is ${today}.

Stock ticker: ${sym}

CRITICAL INSTRUCTIONS:
1. Use the MOST RECENT available data — the latest TTM (trailing twelve months) figures as of ${today}
2. For well-known stocks like NVDA, AAPL, MSFT, TSLA etc., you have training data through mid-2025. Use the MOST RECENT quarter you know.
3. ALL percentage values MUST be returned as full percentages: e.g. gross margin 74.15% → write 74.15, NOT 0.7415
4. Revenue growth 70.68% → write 70.68, NOT 0.7068
5. P/E ratio is price/EPS. If you know the latest EPS and approximate current price ~${price || 'unknown'}, calculate accordingly.

If "${sym}" is not a real US stock ticker, return: {"found":false}

Return ONLY this JSON (absolutely no text before or after, no markdown):
{
  "found": true,
  "companyName": "full company name",
  "exchange": "NASDAQ or NYSE",
  "sector": "Technology etc",
  "industry": "Semiconductors etc",
  "pe": number (TTM P/E using latest EPS),
  "ps": number (TTM),
  "pb": number,
  "pcf": number or null,
  "peg": number or null,
  "grossMargin": number (e.g. 74.15 for 74.15%),
  "operatingMargin": number (e.g. 64.02 for 64.02%),
  "netMargin": number (e.g. 62.97 for 62.97%),
  "currentRatio": number,
  "quickRatio": number,
  "cashRatio": number or null,
  "debtToEquity": number,
  "debtToAssets": number or null,
  "interestCoverage": number or null,
  "roa": number (e.g. 85.4 for 85.4%),
  "roe": number (e.g. 114.3 for 114.3%),
  "roic": number (e.g. 104.7 for 104.7%),
  "revenueGrowth": number (e.g. 70.68 for 70.68%),
  "epsGrowth": number (e.g. 109.24 for 109.24%),
  "beta": number,
  "marketCap": number in USD millions (e.g. 5020000 for $5.02T),
  "profitableTTM": true or false,
  "operatingCashFlowPositive": true or false,
  "isDefensiveSector": true or false,
  "isIndustryLeader": true or false,
  "freeFromLegalIssues": true or false,
  "outperformedSP500_5y": true or false
}`;

  try {
    const ar = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':AI_KEY, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!ar.ok) return res.status(500).json({ error: 'AI error '+ar.status });

    const ad = await ar.json();
    const txt = ad.content?.[0]?.text || '';
    const si = txt.indexOf('{'), ei = txt.lastIndexOf('}');
    if (si === -1) return res.json({ found: false });

    const ai = JSON.parse(txt.slice(si, ei+1));
    if (!ai.found) return res.json({ found: false });

    // Validate: if margins look like decimals (< 2), multiply by 100
    const fixPct = v => { if (v == null) return null; const n = +v; return n < 2 && n > -1 ? +(n*100).toFixed(2) : +n.toFixed(2); };

    return res.json({
      found: true, ticker: sym,
      companyName: ai.companyName || sym,
      exchange: ai.exchange || '',
      sector: ai.sector || '',
      industry: ai.industry || '',
      price: price,
      dataAsOf,
      fundamentals: {
        revenueGrowth:   fixPct(ai.revenueGrowth),
        epsGrowth:       fixPct(ai.epsGrowth),
        pe:              ai.pe != null ? +Number(ai.pe).toFixed(2) : null,
        ps:              ai.ps != null ? +Number(ai.ps).toFixed(2) : null,
        pb:              ai.pb != null ? +Number(ai.pb).toFixed(2) : null,
        pcf:             ai.pcf != null ? +Number(ai.pcf).toFixed(2) : null,
        peg:             ai.peg != null ? +Number(ai.peg).toFixed(2) : null,
        grossMargin:     fixPct(ai.grossMargin),
        operatingMargin: fixPct(ai.operatingMargin),
        netMargin:       fixPct(ai.netMargin),
        currentRatio:    ai.currentRatio != null ? +Number(ai.currentRatio).toFixed(2) : null,
        quickRatio:      ai.quickRatio != null ? +Number(ai.quickRatio).toFixed(2) : null,
        cashRatio:       ai.cashRatio != null ? +Number(ai.cashRatio).toFixed(2) : null,
        debtToEquity:    ai.debtToEquity != null ? +Number(ai.debtToEquity).toFixed(2) : null,
        debtToAssets:    ai.debtToAssets != null ? +Number(ai.debtToAssets).toFixed(2) : null,
        interestCoverage:ai.interestCoverage != null ? +Number(ai.interestCoverage).toFixed(2) : null,
        roa:             fixPct(ai.roa),
        roe:             fixPct(ai.roe),
        roic:            fixPct(ai.roic)
      },
      risk: {
        beta:                      ai.beta != null ? +Number(ai.beta).toFixed(2) : null,
        marketCap:                 ai.marketCap != null ? +Number(ai.marketCap).toFixed(0) : null,
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