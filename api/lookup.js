// api/lookup.js — real-time price via Finnhub + Yahoo fallback
// Server-side cache: bir xil aksiyani ko'p foydalanuvchi so'rasa,
// Finnhub ga 5 soniyada faqat 1 marta so'rov yuboriladi.
const PRICE_CACHE = {};   // { SYM: { data, ts } }  — 5s TTL
const NAME_CACHE = {};    // { SYM: { name, exchange, currency, ts } } — 24h TTL
const PRICE_TTL = 5000;
const NAME_TTL = 24 * 60 * 60 * 1000;

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
  const debug = req.query.debug === "1";
  const diag = { finnhub_key_set: !!FINNHUB_KEY, av_key_set: !!AV_KEY, steps: [] };

  // ── Server cache: 5s ichida bir xil so'rov takrorlanmasin ──────
  const cached = PRICE_CACHE[sym];
  if (cached && Date.now() - cached.ts < PRICE_TTL) {
    return res.status(200).json({ ...cached.data, cached: true, ...(debug ? { diag: { ...diag, steps: ["cache hit"] } } : {}) });
  }

  // ── 1. Finnhub: real-time price (no delay) ──────────────────────
  if (!FINNHUB_KEY) diag.steps.push("finnhub: KEY YO'Q (env da o'rnatilmagan)");
  if (FINNHUB_KEY) {
    try {
      const nameCached = NAME_CACHE[sym] && Date.now() - NAME_CACHE[sym].ts < NAME_TTL ? NAME_CACHE[sym] : null;
      const fetches = [fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`)];
      if (!nameCached) fetches.push(fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${FINNHUB_KEY}`));
      const results = await Promise.all(fetches);

      const quote = await results[0].json();
      const quoteRes = results[0];
      let profile = nameCached ? { name: nameCached.name, exchange: nameCached.exchange, currency: nameCached.currency } : {};
      if (!nameCached && results[1]) {
        try { profile = await results[1].json(); } catch {}
        if (profile?.name) NAME_CACHE[sym] = { name: profile.name, exchange: profile.exchange, currency: profile.currency, ts: Date.now() };
      }

      if (!quote?.c || quote.c <= 0) {
        diag.steps.push("finnhub: status=" + quoteRes.status + " javob=" + JSON.stringify(quote).slice(0, 120));
        console.error("FINNHUB FAIL", quoteRes.status, JSON.stringify(quote).slice(0, 200));
      }

      // quote.c = current price (real-time)
      if (quote?.c && quote.c > 0) {
        const data = {
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
        };
        PRICE_CACHE[sym] = { data, ts: Date.now() };
        return res.status(200).json({ ...data, ...(debug ? { diag } : {}) });
      }
    } catch (e) { diag.steps.push("finnhub: exception " + e.message); console.error("FINNHUB EXC", e.message); }
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
          ...(debug ? { diag } : {}),
        });
      }
    } else { diag.steps.push("yahoo_v8: status=" + r.status); }
  } catch (e) { diag.steps.push("yahoo_v8: exception " + e.message); }

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
            ...(debug ? { diag } : {}),
          });
        }
      }
    } catch {}
  }

  return res.status(404).json({
    error: `${sym} topilmadi. Ticker to'g'ri ekanligini tekshiring (masalan: AAPL, NVDA, AMAT).`
  });
}