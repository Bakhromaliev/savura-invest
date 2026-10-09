// api/fundamentals.js — avtomatik fundamental ma'lumot (Finnhub + Yahoo S&P500 taqqoslash)
// Kerakli env: FINNHUB_KEY (lookup.js bilan bir xil). Qo'shimcha kalit shart emas.
const CACHE = {};                 // { SYM: { data, ts } }
const TTL = 6 * 60 * 60 * 1000;   // 6 soat
const HITS = {};                  // IP bo'yicha cheklov
const num = v => { const x = typeof v === "number" ? v : parseFloat(v); return isFinite(x) ? x : null; };
const r2 = v => (v == null ? null : +(+v).toFixed(2));
const first = (m, keys) => { for (const k of keys) { const x = num(m[k]); if (x != null) return x; } return null; };

const DEFENSIVE = /health|pharma|biotech|medical|utilit|food|beverage|tobacco|household|consumer staples|retail.*(food|grocery)|energy|oil|gas|telecom/i;

async function yahooReturn(sym) {
  const u = s => `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=1mo&range=5y`;
  const get = async s => {
    const r = await fetch(u(s), { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) throw new Error("yahoo " + r.status);
    const j = await r.json();
    const c = (j?.chart?.result?.[0]?.indicators?.adjclose?.[0]?.adjclose || j?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || []).filter(x => x > 0);
    if (c.length < 24) throw new Error("short");
    return c[c.length - 1] / c[0] - 1;
  };
  const [a, b] = await Promise.all([get(sym), get("^GSPC")]);
  return { stock: a, sp: b };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  const sym = (req.query.sym || "").trim().toUpperCase().replace(/[^A-Z.\-]/g, "");
  if (!sym) return res.status(400).json({ error: "sym required" });
  const KEY = process.env.FINNHUB_KEY;
  if (!KEY) return res.status(500).json({ error: "no_key" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "ip";
  const now = Date.now();
  HITS[ip] = (HITS[ip] || []).filter(t => now - t < 60000);
  if (HITS[ip].length >= 12) return res.status(429).json({ error: "rate" });
  HITS[ip].push(now);

  const c = CACHE[sym];
  if (c && now - c.ts < TTL) return res.status(200).json({ ...c.data, cached: true });

  try {
    const base = "https://finnhub.io/api/v1";
    const [mR, pR, qR] = await Promise.all([
      fetch(`${base}/stock/metric?symbol=${sym}&metric=all&token=${KEY}`),
      fetch(`${base}/stock/profile2?symbol=${sym}&token=${KEY}`),
      fetch(`${base}/quote?symbol=${sym}&token=${KEY}`),
    ]);
    if (mR.status === 429) return res.status(429).json({ error: "rate" });
    const mj = await mR.json().catch(() => ({}));
    const p = await pR.json().catch(() => ({}));
    const q = await qR.json().catch(() => ({}));
    const m = mj?.metric || {};
    if (!p?.name && !Object.keys(m).length) return res.status(200).json({ found: false });

    const pe = first(m, ["peTTM", "peBasicExclExtraTTM", "peNormalizedAnnual"]);
    const epsG = first(m, ["epsGrowthTTMYoy", "epsGrowth3Y"]);
    let peg = null;
    if (pe != null && pe > 0 && epsG != null && epsG > 0) peg = pe / epsG;
    let de = first(m, ["totalDebt/totalEquityQuarterly", "totalDebt/totalEquityAnnual"]);
    if (de != null && de > 50) de = de / 100;           // foiz ko'rinishida kelsa
    const capM = first(m, ["marketCapitalization"]) ?? num(p.marketCapitalization);
    const netM = first(m, ["netProfitMarginTTM", "netProfitMarginAnnual"]);
    const opM = first(m, ["operatingMarginTTM", "operatingMarginAnnual"]);

    const industry = p.finnhubIndustry || "";
    // Sifat belgilari — taxminiy (UI "tekshiring" deb ko'rsatadi)
    const isDefensive = DEFENSIVE.test(industry);
    const isLeader = capM != null && capM >= 100000;     // >= $100 mlrd
    let beat = null;
    try { const y = await yahooReturn(sym); beat = y.stock > y.sp; } catch {}

    const out = {
      found: true, ticker: sym,
      companyName: p.name || sym, exchange: p.exchange || "", sector: industry, industry: industry,
      price: q?.c > 0 ? r2(q.c) : null, dataAsOf: new Date().toISOString().split("T")[0],
      fundamentals: {
        revenueGrowth: r2(first(m, ["revenueGrowthTTMYoy", "revenueGrowth3Y"])),
        epsGrowth: r2(epsG), pe: r2(pe),
        ps: r2(first(m, ["psTTM", "psAnnual"])), pb: r2(first(m, ["pbQuarterly", "pbAnnual"])),
        pcf: r2(first(m, ["pfcfShareTTM", "pcfShareTTM"])), peg: r2(peg),
        grossMargin: r2(first(m, ["grossMarginTTM", "grossMarginAnnual"])), operatingMargin: r2(opM), netMargin: r2(netM),
        currentRatio: r2(first(m, ["currentRatioQuarterly", "currentRatioAnnual"])),
        quickRatio: r2(first(m, ["quickRatioQuarterly", "quickRatioAnnual"])),
        cashRatio: null, debtToEquity: r2(de), debtToAssets: null,
        interestCoverage: r2(first(m, ["netInterestCoverageTTM", "netInterestCoverageAnnual"])),
        roa: r2(first(m, ["roaTTM", "roaRfy"])), roe: r2(first(m, ["roeTTM", "roeRfy"])),
        roic: r2(first(m, ["roiTTM", "roiAnnual"])),
      },
      risk: {
        beta: r2(first(m, ["beta"])), marketCap: capM != null ? Math.round(capM) : null,
        profitableTTM: netM != null ? netM > 0 : null,
        operatingCashFlowPositive: opM != null ? opM > 0 : null,
        isDefensiveSector: isDefensive, isIndustryLeader: isLeader,
        freeFromLegalIssues: true, outperformedSP500_5y: beat,
      },
      // UI da "tekshiring" belgisi bilan chiqadigan taxminiy maydonlar
      estimated: ["isDefensiveSector", "isIndustryLeader", "freeFromLegalIssues"].concat(beat == null ? ["outperformedSP500_5y"] : ["outperformedSP500_5y"]),
    };
    CACHE[sym] = { data: out, ts: now };
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ error: "upstream" });
  }
}
