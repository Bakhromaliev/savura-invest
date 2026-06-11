// api/lookup.js — real-time price via Finnhub + Yahoo fallback
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  if (req.method === "OPTIONS") return res.status(200).end();

  const sym = (req.query.sym || "").trim().toUpperCase().replace(/[^A-Z.]/g, "");
  if (!sym) return res.status(400).json({ error: "sym required" });

  const FINNHUB_KEY = process.env.FINNHUB_KEY;
  const AV_KEY = process.env.ALPHAVANTAGE_KEY;

  // ── 1. Finnhub: real-time price (no delay) ──────────────────────
  if (FINNHUB_KEY) {
    try {
      const [quoteRes, profileRes] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`),
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${FINNHUB_KEY}`)
      ]);

      const quote = await quoteRes.json();
      const profile = await profileRes.json();

      // quote.c = current price (real-time)
      if (quote?.c && quote.c > 0) {
        return res.status(200).json({
          ticker: sym,
          companyName: profile?.name || sym,
          price: Math.round(quote.c * 100) / 100,
          change: Math.round((quote.c - quote.pc) * 100) / 100,
          changePct: Math.round((quote.dp || 0) * 100) / 100,
          high: quote.h,
          low: quote.l,
          prevClose: quote.pc,
          exchange: profile?.exchange || "",
          currency: profile?.currency || "USD",
          source: "finnhub_realtime",
        });
      }
    } catch {}
  }

  // ── 2. Yahoo Finance v8 chart (15-20 min delayed) ───────────────
  const yHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://finance.yahoo.com",
  };
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, { headers: yHeaders });
    if (r.ok) {
      const d = await r.json();
      const meta = d?.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice;
      if (price && price > 0) {
        return res.status(200).json({
          ticker: sym,
          companyName: meta.longName || meta.shortName || sym,
          price: Math.round(price * 100) / 100,
          exchange: meta.exchangeName || "",
          currency: meta.currency || "USD",
          source: "yahoo_delayed",
        });
      }
    }
  } catch {}

  // ── 3. Yahoo Finance v7 quote ────────────────────────────────────
  try {
    const r = await fetch(`https://query2.finance.yahoo.com/v7/finance/quote?symbols=${sym}`, { headers: yHeaders });
    if (r.ok) {
      const d = await r.json();
      const q = d?.quoteResponse?.result?.[0];
      if (q?.regularMarketPrice) {
        return res.status(200).json({
          ticker: sym,
          companyName: q.longName || q.shortName || sym,
          price: Math.round(q.regularMarketPrice * 100) / 100,
          exchange: q.fullExchangeName || "",
          currency: q.currency || "USD",
          source: "yahoo_delayed",
        });
      }
    }
  } catch {}

  // ── 4. Alpha Vantage fallback ────────────────────────────────────
  if (AV_KEY) {
    try {
      const r = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${AV_KEY}`);
      if (r.ok) {
        const d = await r.json();
        const q = d?.["Global Quote"];
        const price = parseFloat(q?.["05. price"]);
        if (price > 0) {
          return res.status(200).json({
            ticker: sym,
            companyName: sym,
            price: Math.round(price * 100) / 100,
            source: "alphavantage",
          });
        }
      }
    } catch {}
  }

  return res.status(404).json({
    error: `${sym} topilmadi. Ticker to'g'ri ekanligini tekshiring (masalan: AAPL, NVDA, AMAT).`
  });
}
