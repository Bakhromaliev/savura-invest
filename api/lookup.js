// api/lookup.js — lightweight ticker lookup for watchlist
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const sym = (req.query.sym || "").trim().toUpperCase();
  if (!sym) return res.status(400).json({ error: "sym required" });

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
  };

  // 1. Try Yahoo Finance quote (price + company name)
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=1d&interval=1d`,
      { headers }
    );
    if (r.ok) {
      const d = await r.json();
      const meta = d?.chart?.result?.[0]?.meta;
      if (meta?.regularMarketPrice) {
        return res.status(200).json({
          ticker: sym,
          companyName: meta.longName || meta.shortName || sym,
          price: meta.regularMarketPrice,
          currency: meta.currency || "USD",
          exchange: meta.exchangeName || "",
        });
      }
    }
  } catch {}

  // 2. Yahoo Finance search (fallback)
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${sym}&quotesCount=1&newsCount=0&enableFuzzyQuery=false`,
      { headers }
    );
    if (r.ok) {
      const d = await r.json();
      const q = d?.quotes?.[0];
      if (q && (q.symbol === sym || q.symbol === sym + ".US")) {
        return res.status(200).json({
          ticker: sym,
          companyName: q.longname || q.shortname || sym,
          price: q.regularMarketPrice || null,
          currency: q.currency || "USD",
          exchange: q.exchange || "",
        });
      }
    }
  } catch {}

  // 3. Try v7 quote endpoint
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${sym}`,
      { headers }
    );
    if (r.ok) {
      const d = await r.json();
      const q = d?.quoteResponse?.result?.[0];
      if (q) {
        return res.status(200).json({
          ticker: sym,
          companyName: q.longName || q.shortName || sym,
          price: q.regularMarketPrice || null,
          currency: q.currency || "USD",
          exchange: q.fullExchangeName || "",
        });
      }
    }
  } catch {}

  return res.status(404).json({ error: "Ticker topilmadi: " + sym });
}
