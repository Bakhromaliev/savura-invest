export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();
  const AI_KEY = process.env.ANTHROPIC_API_KEY;
  if (!AI_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  // ── 1. Real-time price (no API key needed) ────────────────────
  let livePrice = null;
  let liveDate  = new Date().toISOString().split('T')[0];

  // Try Yahoo Finance chart endpoint
  try {
    const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`;
    const yRes = await fetch(yUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible)', 'Accept': 'application/json' }
    });
    if (yRes.ok) {
      const yData = await yRes.json();
      const meta = yData?.chart?.result?.[0]?.meta;
      if (meta?.regularMarketPrice) {
        livePrice = +meta.regularMarketPrice.toFixed(2);
        liveDate  = new Date(meta.regularMarketTime * 1000).toISOString().split('T')[0];
      }
    }
  } catch(_) {}

  // Fallback: Stooq (always free, no auth)
  if (!livePrice) {
    try {
      const sUrl = `https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2t2ohlcv&h&e=csv`;
      const sRes = await fetch(sUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (sRes.ok) {
        const csv = await sRes.text();
        const rows = csv.trim().split('\n');
        if (rows.length > 1) {
          const cols = rows[1].split(',');
          const close = parseFloat(cols[6]);
          if (close > 0) {
            livePrice = +close.toFixed(2);
            liveDate  = cols[1] || liveDate;
          }
        }
      }
    } catch(_) {}
  }

  // ── 2. Fundamentals from Claude AI ───────────────────────────
  const prompt = `You are a financial data API. Return ONLY valid JSON for US stock "${sym}" using the latest quarterly/annual data you know.

If "${sym}" is not a real US stock ticker, return: {"found":false}

Otherwise return this exact structure (all numbers, no strings for numeric fields):
{
  "found": true,
  "ticker": "${sym}",
  "companyName": "string",
  "exchange": "NASDAQ or NYSE",
  "sector": "string",
  "industry": "string",
  "fundamentals": {
    "revenueGrowth": number_or_null,
    "epsGrowth": number_or_null,
    "pe": number_or_null,
    "ps": number_or_null,
    "pb": number_or_null,
    "pcf": number_or_null,
    "peg": number_or_null,
    "grossMargin": number_or_null,
    "operatingMargin": number_or_null,
    "netMargin": number_or_null,
    "currentRatio": number_or_null,
    "quickRatio": number_or_null,
    "cashRatio": number_or_null,
    "debtToEquity": number_or_null,
    "debtToAssets": number_or_null,
    "interestCoverage": number_or_null,
    "roa": number_or_null,
    "roe": number_or_null,
    "roic": number_or_null
  },
  "risk": {
    "beta": number_or_null,
    "marketCap": number_in_usd_millions_or_null,
    "profitableTTM": boolean,
    "operatingCashFlowPositive": boolean,
    "isDefensiveSector": boolean,
    "isIndustryLeader": boolean,
    "freeFromLegalIssues": boolean,
    "outperformedSP500_5y": boolean
  }
}

Rules: percentages as numbers (43.2 not 0.432), marketCap in USD millions, null if unknown. Return ONLY JSON.`;

  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!aiRes.ok) return res.status(500).json({ error: 'AI API error ' + aiRes.status });

    const aiData  = await aiRes.json();
    const text    = aiData.content?.[0]?.text || '';
    const si = text.indexOf('{'), ei = text.lastIndexOf('}');
    if (si === -1) return res.json({ found: false });

    const parsed = JSON.parse(text.slice(si, ei + 1));
    if (!parsed.found) return res.json({ found: false });

    // ── 3. Merge: inject live price ──────────────────────────────
    return res.json({
      ...parsed,
      price:     livePrice ?? parsed.price ?? null,
      dataAsOf:  liveDate,
      _livePrice: !!livePrice
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}