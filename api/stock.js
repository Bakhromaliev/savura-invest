export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const prompt = `You are a financial data API. Return ONLY a valid JSON object (no markdown, no explanation) for US stock "${sym}".

If not a real US stock, return: {"found":false}

Otherwise return exactly this structure:
{
  "found": true,
  "ticker": "${sym}",
  "companyName": "Full Company Name",
  "exchange": "NASDAQ or NYSE",
  "sector": "Technology",
  "industry": "Semiconductors",
  "price": 124.50,
  "dataAsOf": "2026-06-06",
  "fundamentals": {
    "revenueGrowth": 12.5,
    "epsGrowth": 18.2,
    "pe": 28.4,
    "ps": 6.2,
    "pb": 4.1,
    "pcf": 22.1,
    "peg": 1.5,
    "grossMargin": 43.2,
    "operatingMargin": 18.5,
    "netMargin": 15.2,
    "currentRatio": 1.8,
    "quickRatio": 1.4,
    "cashRatio": 0.6,
    "debtToEquity": 0.45,
    "debtToAssets": 0.22,
    "interestCoverage": 18.5,
    "roa": 12.4,
    "roe": 28.6,
    "roic": 21.3
  },
  "risk": {
    "beta": 1.25,
    "marketCap": 2800000,
    "profitableTTM": true,
    "operatingCashFlowPositive": true,
    "isDefensiveSector": false,
    "isIndustryLeader": true,
    "freeFromLegalIssues": true,
    "outperformedSP500_5y": true
  }
}

Use the latest available real data. All percentage values as numbers (e.g. 43.2 not 0.432). marketCap in USD millions. Return ONLY the JSON, nothing else.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: 'Claude API error: ' + err.slice(0, 100) });
    }

    const data = await r.json();
    const text = data.content?.[0]?.text || '';

    const si = text.indexOf('{');
    const ei = text.lastIndexOf('}');
    if (si === -1 || ei === -1) return res.json({ found: false });

    const parsed = JSON.parse(text.slice(si, ei + 1));
    return res.json(parsed);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}