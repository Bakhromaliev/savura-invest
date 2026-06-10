// api/lookup.js — ticker price + company name lookup
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const sym = (req.query.sym || "").trim().toUpperCase().replace(/[^A-Z.]/g, "");
  if (!sym) return res.status(400).json({ error: "sym required" });

  const yHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json,text/plain,*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://finance.yahoo.com",
    "Origin": "https://finance.yahoo.com",
  };

  // 1. Yahoo Finance v8 chart
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, { headers: yHeaders });
    if (r.ok) {
      const d = await r.json();
      const meta = d?.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice || meta?.chartPreviousClose;
      if (price) {
        return res.status(200).json({
          ticker: sym,
          companyName: meta.longName || meta.shortName || sym,
          price: Math.round(price * 100) / 100,
          exchange: meta.exchangeName || "",
          currency: meta.currency || "USD",
        });
      }
    }
  } catch {}

  // 2. Yahoo Finance v7 quote
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
        });
      }
    }
  } catch {}

  // 3. Yahoo Finance search
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${sym}&quotesCount=1&newsCount=0`, { headers: yHeaders });
    if (r.ok) {
      const d = await r.json();
      const q = d?.quotes?.find(x => x.symbol === sym || x.symbol === sym + ".US");
      if (q?.regularMarketPrice) {
        return res.status(200).json({
          ticker: sym,
          companyName: q.longname || q.shortname || sym,
          price: Math.round(q.regularMarketPrice * 100) / 100,
          exchange: q.exchange || "",
          currency: "USD",
        });
      }
    }
  } catch {}

  // 4. Alpha Vantage fallback
  const AV_KEY = process.env.ALPHAVANTAGE_KEY;
  if (AV_KEY) {
    try {
      const r = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${AV_KEY}`);
      if (r.ok) {
        const d = await r.json();
        const q = d?.["Global Quote"];
        const price = parseFloat(q?.["05. price"]);
        if (price) {
          // Also get company name
          let name = sym;
          try {
            const r2 = await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${sym}&apikey=${AV_KEY}`);
            if (r2.ok) { const d2 = await r2.json(); if (d2.Name) name = d2.Name; }
          } catch {}
          return res.status(200).json({
            ticker: sym,
            companyName: name,
            price: Math.round(price * 100) / 100,
            exchange: q?.["11. instrument"] || "",
            currency: "USD",
          });
        }
      }
    } catch {}
  }

  return res.status(404).json({ error: `${sym} topilmadi. Ticker to'g'ri ekanligini tekshiring.` });
}
