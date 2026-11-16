// api/terminal.js — Savura Terminal ma'lumotlari (savurainvest.com/terminal)
//
//   GET /api/terminal?a=market                 indekslar + halol aksiyalar xaritasi
//   GET /api/terminal?a=list                   ~550 kompaniya (Supabase: bot yuboradi)
//   GET /api/terminal?a=company&sym=AAPL       kompaniya: SEC hisobotlari, narx, halollik, insayderlar
//   GET /api/terminal?a=ai&sym=AAPL&lang=uz    Savura AI xulosasi (kuniga 1 marta keshlanadi)
//
// Manbalar: SEC EDGAR (rasmiy, bepul), Yahoo Finance (narx, ~15 daqiqa kechikadi),
// Finnhub (profil, insayderlar, yangiliklar; FINNHUB_KEY), Supabase (bot yuborgan
// fundamental va Halal Terminal ma'lumoti). Savura o'zi shariat hukmi chiqarmaydi.

const SB_URL = process.env.SUPABASE_URL || "https://xxrjcyofbgmcqzoaaktq.supabase.co";
const SB_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cmpjeW9mYmdtY3F6b2Fha3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjQwNDYsImV4cCI6MjA5Njk0MDA0Nn0.EAA4GKKQx6VjXQsa753A0hijVIh6dIw-csb6HhtVoUk";
const SEC_UA = process.env.SEC_UA || "SavuraInvest Terminal savurainvest.com";
const YH = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36", "Accept": "application/json" };

const KESH = {};
function kesh(kalit, ttl, fn) {
  const k = KESH[kalit], now = Date.now();
  if (k && now - k.ts < ttl) return k.p;
  const p = Promise.resolve().then(fn).catch(e => { delete KESH[kalit]; throw e; });
  KESH[kalit] = { p, ts: now };
  return p;
}
const MIN = 60 * 1000, SOAT = 60 * MIN;

const HITS = {};
function cheklov(req, n) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "ip";
  const now = Date.now();
  HITS[ip] = (HITS[ip] || []).filter(t => now - t < 60000);
  if (HITS[ip].length >= n) return true;
  HITS[ip].push(now);
  return false;
}

async function jget(url, headers, ms = 9000) {
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers, signal: ctl.signal });
    if (!r.ok) throw new Error(url.split("?")[0] + " " + r.status);
    return await r.json();
  } finally { clearTimeout(to); }
}
const num = v => { const x = typeof v === "number" ? v : parseFloat(v); return isFinite(x) ? x : null; };

// ── Supabase (bot yuborgan ma'lumot) ──────────────────────────────────────
async function sbAll(jadval, select) {
  const out = [];
  for (let from = 0; from < 5000; from += 1000) {
    const r = await fetch(`${SB_URL}/rest/v1/${jadval}?select=${select}&order=ticker`, {
      headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, Range: `${from}-${from + 999}` } });
    if (!r.ok) throw new Error("supabase " + r.status);
    const j = await r.json(); out.push(...j);
    if (j.length < 1000) break;
  }
  return out;
}
function royxat() {
  return kesh("royxat", 30 * MIN, async () => {
    const [kp, hl] = await Promise.all([
      sbAll("terminal_kompaniya", "ticker,nom,sektor,sanoat,data,sana"),
      sbAll("terminal_halol", "ticker,holat,qarz,tozalash,tekshirilgan,sana")]);
    const h = {}; hl.forEach(x => { h[x.ticker] = x; });
    return kp.map(k => ({ ...k, halol: h[k.ticker] || null }));
  });
}

// ── Yahoo narxlari ────────────────────────────────────────────────────────
async function yChart(sym, range = "1y", interval = "1d") {
  return kesh(`ch:${sym}:${range}:${interval}`, range === "5d" ? 10 * MIN : 60 * MIN, async () => {
    let j;
    try { j = await jget(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=${interval}&range=${range}`, YH); }
    catch (e) { j = await jget(`https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=${interval}&range=${range}`, YH); }
    const r = j?.chart?.result?.[0]; if (!r) throw new Error("chart bo'sh");
    const q = r.indicators?.quote?.[0] || {};
    const t = r.timestamp || [];
    const pts = [];
    for (let i = 0; i < t.length; i++) if (q.close?.[i] != null) pts.push({ t: t[i], o: q.open?.[i], h: q.high?.[i], l: q.low?.[i], c: q.close[i], v: q.volume?.[i] });
    const m = r.meta || {};
    return { narx: m.regularMarketPrice ?? pts.at(-1)?.c ?? null, oldingi: m.chartPreviousClose ?? m.previousClose ?? null,
             vaqt: m.regularMarketTime || null, nom: m.longName || m.shortName || "", nuqtalar: pts };
  });
}
async function ySpark(syms) {
  const out = {};
  for (let i = 0; i < syms.length; i += 20) {
    const part = syms.slice(i, i + 20);
    try {
      const j = await kesh("sp:" + part.join(","), 10 * MIN, () =>
        jget(`https://query1.finance.yahoo.com/v8/finance/spark?symbols=${part.map(encodeURIComponent).join(",")}&range=5d&interval=1d`, YH));
      for (const s of part) {
        const d = j?.[s]; const c = (d?.close || []).filter(x => x != null);
        if (c.length >= 2) out[s] = { narx: c.at(-1), oldingi: c.at(-2) };
      }
    } catch (e) { /* bitta qism ishlamasa qolganlari ko'rsatiladi */ }
  }
  // Zaxira: spark javob bermasa, har bir aksiya uchun 5 kunlik grafikdan (eng yiriklari)
  const yoq = syms.filter(s => !out[s]).slice(0, 40);
  if (yoq.length > syms.length / 2) {
    await Promise.all(yoq.map(async s => { try { const c = await yChart(s, "5d"); if (c.narx && c.oldingi) out[s] = { narx: c.narx, oldingi: c.oldingi }; } catch (e) {} }));
  }
  return out;
}

// ── SEC EDGAR ─────────────────────────────────────────────────────────────
function secCik() {
  return kesh("sec:tickers", 24 * SOAT, async () => {
    const j = await jget("https://www.sec.gov/files/company_tickers.json", { "User-Agent": SEC_UA, "Accept": "application/json" }, 12000);
    const m = {}; Object.values(j).forEach(x => { m[String(x.ticker).toUpperCase()] = { cik: x.cik_str, nom: x.title }; });
    return m;
  });
}
const KONS = {
  daromad: ["RevenueFromContractWithCustomerExcludingAssessedTax", "Revenues", "SalesRevenueNet", "RevenueFromContractWithCustomerIncludingAssessedTax"],
  yalpi: ["GrossProfit"],
  operatsion: ["OperatingIncomeLoss"],
  sof: ["NetIncomeLoss", "ProfitLoss"],
  ocf: ["NetCashProvidedByUsedInOperatingActivities", "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations"],
  capex: ["PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets"],
  eps: ["EarningsPerShareDiluted", "EarningsPerShareBasic"],
  dps: ["CommonStockDividendsPerShareDeclared", "CommonStockDividendsPerShareCashPaid"],
  qarz: ["LongTermDebt", "LongTermDebtNoncurrent"],
  pul: ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"],
  kapital: ["StockholdersEquity", "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"],
  aktiv: ["Assets"],
};
const ONLY = new Set(["qarz", "pul", "kapital", "aktiv"]);   // balans: lahzali qiymat
function yillik(facts, nomlar, lahzali) {
  const g = facts?.["us-gaap"] || {};
  let eng = null;
  for (const nom of nomlar) {
    const u = g[nom]?.units; if (!u) continue;
    const arr = u.USD || u["USD/shares"] || Object.values(u)[0] || [];
    const y = {};
    for (const x of arr) {
      if (!/^(10-K|20-F|40-F)/.test(x.form || "")) continue;
      const fr = x.frame || "";
      const m = lahzali ? fr.match(/^CY(\d{4})Q4I$/) : fr.match(/^CY(\d{4})$/);
      if (m) y[m[1]] = x.val;
    }
    if (!Object.keys(y).length) {
      // frame bo'lmasa: 10-K dagi FY qiymati (yil = tugash sanasi yili)
      for (const x of arr) if (/^(10-K|20-F|40-F)/.test(x.form || "") && x.fp === "FY" && x.end) {
        const yr = x.end.slice(0, 4); if (lahzali || !x.start || (new Date(x.end) - new Date(x.start)) > 300 * 864e5) y[yr] = x.val;
      }
    }
    if (Object.keys(y).length) (eng = eng || []).push({ y, maxY: Math.max(...Object.keys(y).map(Number)) });
  }
  // Kompaniya yillar davomida konsept nomini almashtirgan bo'lishi mumkin: eng yangisi ustun,
  // qolgan yillar eskilaridan to'ldiriladi
  const out = {};
  (eng || []).sort((a, b) => b.maxY - a.maxY).forEach(e => { for (const [k, v] of Object.entries(e.y)) if (!(k in out)) out[k] = v; });
  return out;
}
function secHisobot(sym) {
  return kesh("sec:" + sym, 12 * SOAT, async () => {
    const map = await secCik(); const c = map[sym];
    if (!c) return null;
    const cik = String(c.cik).padStart(10, "0");
    const j = await jget(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, { "User-Agent": SEC_UA, "Accept": "application/json" }, 15000);
    const q = {}; for (const k of Object.keys(KONS)) q[k] = yillik(j.facts, KONS[k], ONLY.has(k));
    const yillar = [...new Set(Object.keys(q.daromad).concat(Object.keys(q.sof)))].map(Number).sort((a, b) => a - b).slice(-10);
    const qator = yillar.map(yr => {
      const s = String(yr), v = k => num(q[k][s]);
      const ocf = v("ocf"), capex = v("capex");
      return { yil: yr, daromad: v("daromad"), yalpi: v("yalpi"), operatsion: v("operatsion"), sof: v("sof"),
               ocf, capex, fcf: ocf != null ? ocf - (capex || 0) : null, eps: v("eps"), dps: v("dps"),
               qarz: v("qarz"), pul: v("pul"), kapital: v("kapital"), aktiv: v("aktiv") };
    });
    const dei = j.facts?.dei?.EntityCommonStockSharesOutstanding?.units?.shares || [];
    const aksiyalar = dei.length ? dei.reduce((a, b) => (a.end > b.end ? a : b)).val : null;
    return { cik, nom: j.entityName || c.nom, yillar: qator, aksiyalar, manba: "SEC EDGAR" };
  });
}

// ── Finnhub ───────────────────────────────────────────────────────────────
async function finnhub(sym) {
  const KEY = process.env.FINNHUB_KEY; if (!KEY) return {};
  return kesh("fh:" + sym, 6 * SOAT, async () => {
    const b = "https://finnhub.io/api/v1", bugun = new Date(), oldin = new Date(Date.now() - 30 * 864e5);
    const d = x => x.toISOString().slice(0, 10);
    const [p, ins, yan] = await Promise.all([
      jget(`${b}/stock/profile2?symbol=${sym}&token=${KEY}`).catch(() => ({})),
      jget(`${b}/stock/insider-transactions?symbol=${sym}&token=${KEY}`).catch(() => ({})),
      jget(`${b}/company-news?symbol=${sym}&from=${d(oldin)}&to=${d(bugun)}&token=${KEY}`).catch(() => [])]);
    const insayder = (ins?.data || []).filter(x => x.transactionCode === "S" || x.transactionCode === "P")
      .slice(0, 12).map(x => ({ sana: x.transactionDate, ism: x.name, soni: x.change, narx: x.transactionPrice, amal: x.transactionCode === "P" ? "xarid" : "sotuv" }));
    const yangilik = (Array.isArray(yan) ? yan : []).slice(0, 8).map(x => ({ sarlavha: x.headline, manba: x.source, url: x.url, vaqt: x.datetime }));
    return { profil: { nom: p.name, logo: p.logo, sanoat: p.finnhubIndustry, sayt: p.weburl, birja: p.exchange, ipo: p.ipo, mamlakat: p.country }, insayder, yangilik };
  });
}

// ── Amallar ───────────────────────────────────────────────────────────────
const INDEKS = [["^GSPC", "S&P 500"], ["^NDX", "Nasdaq 100"], ["^DJI", "Dow Jones"], ["^VIX", "VIX"], ["GC=F", "Oltin"], ["^TNX", "10Y obligatsiya"]];

async function market() {
  return kesh("market", 10 * MIN, async () => {
    const [idx, list] = await Promise.all([
      Promise.all(INDEKS.map(async ([s, n]) => { try { const c = await yChart(s, "5d"); return { s, n, narx: c.narx, oldingi: c.oldingi }; } catch (e) { return { s, n, narx: null }; } })),
      royxat().catch(() => [])]);
    const top = list.filter(k => k.data?.kapitalizatsiya).sort((a, b) => b.data.kapitalizatsiya - a.data.kapitalizatsiya).slice(0, 60);
    const sp = await ySpark(top.map(k => k.ticker));
    const xarita = top.filter(k => sp[k.ticker]).map(k => ({ t: k.ticker, nom: k.nom, sektor: k.sektor, cap: k.data.kapitalizatsiya,
      narx: sp[k.ticker].narx, oz: (sp[k.ticker].narx / sp[k.ticker].oldingi - 1) * 100, holat: k.halol?.holat || null }));
    return { indeks: idx, xarita, vaqt: Date.now() };
  });
}

async function company(sym) {
  const [ch, sec, fh, list] = await Promise.all([
    yChart(sym, "1y").catch(() => null), secHisobot(sym).catch(e => ({ xato: String(e.message || e) })),
    finnhub(sym).catch(() => ({})), royxat().catch(() => [])]);
  const k = list.find(x => x.ticker === sym) || null;
  if (!ch && !k && (!sec || sec.xato)) return { topilmadi: true };
  const sektorlar = k ? list.filter(x => x.sektor === k.sektor && x.data) : [];
  const med = key => { const v = sektorlar.map(x => num(x.data[key])).filter(x => x != null && x > 0).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };
  const sektor = k ? { pe: med("pe"), ps: med("ps"), ev_ebitda: med("ev_ebitda"), yalpi: med("yalpi"), roe: med("roe"), soni: sektorlar.length } : null;
  return { sym, narx: ch, sec, finnhub: fh, kompaniya: k, sektor, vaqt: Date.now() };
}

const TIL = { uz: "o'zbek (lotin)", ru: "rus", en: "ingliz", tr: "turk", ar: "arab" };
async function ai(sym, lang) {
  const KEY = process.env.ANTHROPIC_API_KEY; if (!KEY) return { xato: "kalit yo'q" };
  const kun = new Date().toISOString().slice(0, 10);
  return kesh(`ai:${sym}:${lang}:${kun}`, 24 * SOAT, async () => {
    const c = await company(sym);
    if (c.topilmadi) return { xato: "topilmadi" };
    const y = (c.sec?.yillar || []).slice(-5).map(r => `${r.yil}: daromad ${r.daromad}, sof foyda ${r.sof}, FCF ${r.fcf}, qarz ${r.qarz}`).join("; ");
    const d = c.kompaniya?.data || {};
    const prompt = `Sen Savura Invest tahlilchisisan. ${sym} (${c.sec?.nom || c.kompaniya?.nom || ""}) kompaniyasi uchun ${TIL[lang] || TIL.uz} tilida qisqa tahlil yoz.
Ma'lumot (SEC, yillik, $): ${y}. Ko'rsatkichlar: P/E ${d.pe}, P/S ${d.ps}, EV/EBITDA ${d.ev_ebitda}, ROE ${d.roe}, yalpi marja ${d.yalpi}, qarz/kapital ${d.de}. Sektor medianasi: P/E ${c.sektor?.pe}, P/S ${c.sektor?.ps}.
Faqat JSON qaytar: {"kuchli":["...","...","..."],"risk":["...","...","..."],"xulosa":"2 jumla"}. Shariat hukmi berma, sotib ol/sot deb tavsiya berma, faqat berilgan raqamlarga tayan.`;
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 700, messages: [{ role: "user", content: prompt }] }) });
    if (!r.ok) throw new Error("ai " + r.status);
    const j = await r.json(); const t = (j.content || []).map(x => x.text || "").join("");
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    const o = JSON.parse(t.slice(a, b + 1));
    return { kuchli: (o.kuchli || []).slice(0, 4), risk: (o.risk || []).slice(0, 4), xulosa: o.xulosa || "", sana: kun };
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  const a = String(req.query.a || "");
  const sym = String(req.query.sym || "").trim().toUpperCase().replace(/[^A-Z.\-]/g, "").slice(0, 10);
  try {
    if (a === "market") { res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600"); return res.status(200).json(await market()); }
    if (a === "list") { res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600"); return res.status(200).json({ royxat: await royxat() }); }
    if (a === "company") {
      if (!sym) return res.status(400).json({ xato: "sym kerak" });
      if (cheklov(req, 30)) return res.status(429).json({ xato: "kop" });
      res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
      return res.status(200).json(await company(sym));
    }
    if (a === "ai") {
      if (!sym) return res.status(400).json({ xato: "sym kerak" });
      if (cheklov(req, 6)) return res.status(429).json({ xato: "kop" });
      const lang = ["uz", "ru", "en", "tr", "ar"].includes(req.query.lang) ? req.query.lang : "uz";
      res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");
      return res.status(200).json(await ai(sym, lang));
    }
    return res.status(400).json({ xato: "a = market | list | company | ai" });
  } catch (e) {
    console.error("terminal", a, sym, e && e.message);
    return res.status(502).json({ xato: "manba javob bermadi", sabab: String(e && e.message || e).slice(0, 160) });
  }
}
