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

const GEM_MODELS = ["gemini-2.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
async function geminiJudge(key, c) {
  const prompt = `Siz moliyaviy tahlilchisiz. Aksiya: ${c.name} (${c.ticker}), soha: ${c.industry || "noma'lum"}, bozor qiymati: $${c.capB ? c.capB.toFixed(1) + " mlrd" : "noma'lum"}.
Bugungi sana: ${new Date().toISOString().split("T")[0]}. Eng so'nggi ochiq ma'lumotlarga tayanib 4 savolga javob bering:
1) defensive: himoyalangan (defensiv) sohami (sog'liqni saqlash, kommunal, kundalik iste'mol tovarlari, energetika)?
2) leader: o'z sohasida/industriyada yetakchi (top-3 yoki eng yirik) kompaniyami?
3) legalClean: katta sud/regulyator muammolaridan (antitrest, yirik da'volar, tergov) XOLIMI? Jiddiy ochiq muammo bo'lsa false.
4) beatSP500: so'nggi 5 yilda narx bo'yicha S&P 500 dan oldindami?
Faqat JSON qaytaring: {"defensive":bool,"leader":bool,"legalClean":bool,"beatSP500":bool,"note":"1 qisqa jumla o'zbekcha, sud/regulyator holati haqida"}`;
  for (const useSearch of [true, false]) {
    for (const model of GEM_MODELS) {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), useSearch ? 7000 : 5000);
      try {
        const body = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 600 } };
        if (useSearch) body.tools = [{ google_search: {} }]; else body.generationConfig.responseMimeType = "application/json";
        if (/^gemini-2\.5-flash/.test(model)) body.generationConfig.thinkingConfig = { thinkingBudget: 0 };
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctl.signal });
        clearTimeout(to);
        if (!r.ok) { if (r.status === 400 && useSearch) break; continue; }   // qidiruv qo'llab-quvvatlanmasa -> qidiruvsiz
        const j = await r.json();
        const txt = (j?.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
        const a = txt.indexOf("{"), b = txt.lastIndexOf("}");
        if (a < 0) continue;
        const o = JSON.parse(txt.slice(a, b + 1));
        if (typeof o.defensive === "boolean" && typeof o.leader === "boolean" && typeof o.legalClean === "boolean") {
          return { defensive: o.defensive, leader: o.leader, legalClean: o.legalClean, beat: typeof o.beatSP500 === "boolean" ? o.beatSP500 : null, note: String(o.note || "").slice(0, 200), model, search: useSearch };
        }
      } catch (e) { clearTimeout(to); }
    }
  }
  return null;
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

    const px = q?.c > 0 ? q.c : null;
    // Narx bilan hozirgi EPS / kitob qiymatidan hisoblaymiz — eskirgan nisbatlardan aniqroq
    const epsTTM = first(m, ["epsTTM", "epsInclExtraItemsTTM", "epsBasicExclExtraItemsTTM"]);
    let pe = px && epsTTM && epsTTM > 0 ? px / epsTTM : first(m, ["peTTM", "peBasicExclExtraTTM", "peNormalizedAnnual"]);
    const bvps = first(m, ["bookValuePerShareQuarterly", "bookValuePerShareAnnual"]);
    const pbCalc = px && bvps && bvps > 0 ? px / bvps : first(m, ["pbQuarterly", "pbAnnual"]);
    const epsG = first(m, ["epsGrowthTTMYoy", "epsGrowth3Y"]);
    // PEG: barqaror (5/3 yillik) o'sish bilan — bir martalik sakrash PEG ni buzmasin
    const epsGLong = first(m, ["epsGrowth5Y", "epsGrowth3Y"]);
    let peg = null;
    const gForPeg = epsGLong != null && epsGLong > 0 ? epsGLong : epsG;
    if (pe != null && pe > 0 && gForPeg != null && gForPeg > 0) peg = pe / gForPeg;
    let de = first(m, ["totalDebt/totalEquityQuarterly", "totalDebt/totalEquityAnnual"]);
    if (de != null && de > 50) de = de / 100;           // foiz ko'rinishida kelsa
    const capM = first(m, ["marketCapitalization"]) ?? num(p.marketCapitalization);
    const netM = first(m, ["netProfitMarginTTM", "netProfitMarginAnnual"]);
    const opM = first(m, ["operatingMarginTTM", "operatingMarginAnnual"]);

    const industry = p.finnhubIndustry || "";
    // Sifat belgilari — taxminiy (UI "tekshiring" deb ko'rsatadi)
    const isDefensive = DEFENSIVE.test(industry);
    const isLeader = capM != null && capM >= 100000;     // >= $100 mlrd
    const GKEY = process.env.GEMINI_KEY;
    const [beat, ai] = await Promise.all([
      yahooReturn(sym).then(y => y.stock > y.sp).catch(() => null),
      GKEY ? geminiJudge(GKEY, { ticker: sym, name: p.name || sym, industry, capB: capM != null ? capM / 1000 : null }) : Promise.resolve(null),
    ]);

    const out = {
      found: true, ticker: sym,
      companyName: p.name || sym, exchange: p.exchange || "", sector: industry, industry: industry,
      price: q?.c > 0 ? r2(q.c) : null, dataAsOf: new Date().toISOString().split("T")[0],
      fundamentals: {
        revenueGrowth: r2(first(m, ["revenueGrowthTTMYoy", "revenueGrowth3Y"])),
        epsGrowth: r2(epsG), pe: r2(pe),
        ps: r2(first(m, ["psTTM", "psAnnual"])), pb: r2(pbCalc),
        pcf: r2(first(m, ["pfcfShareTTM", "pcfShareTTM"])), peg: r2(peg),
        grossMargin: r2(first(m, ["grossMarginTTM", "grossMarginAnnual"])), operatingMargin: r2(opM), netMargin: r2(netM),
        currentRatio: r2(first(m, ["currentRatioQuarterly", "currentRatioAnnual"])),
        quickRatio: r2(first(m, ["quickRatioQuarterly", "quickRatioAnnual"])),
        cashRatio: null, debtToEquity: r2(de), debtToAssets: null,
        interestCoverage: null, // ishonchsiz manba (sof foiz) — bo'sh qoldiriladi
        roa: r2(first(m, ["roaTTM", "roaRfy"])), roe: r2(first(m, ["roeTTM", "roeRfy"])),
        roic: r2(first(m, ["roiTTM", "roiAnnual"])),
      },
      risk: {
        beta: r2(first(m, ["beta"])), marketCap: capM != null ? Math.round(capM) : null,
        profitableTTM: netM != null ? netM > 0 : null,
        operatingCashFlowPositive: opM != null ? opM > 0 : null,
        isDefensiveSector: ai ? ai.defensive : isDefensive, isIndustryLeader: ai ? ai.leader : isLeader,
        freeFromLegalIssues: ai ? ai.legalClean : true, outperformedSP500_5y: beat != null ? beat : (ai && ai.beat != null ? ai.beat : false),
      },
      // Yahoo (5 yillik narx) aniq hisob; qolganini Gemini baholaydi. ai=true bo'lsa UI "AI baholadi" deydi
      ai: !!ai, aiNote: ai ? ai.note : "",
      estimated: ["isDefensiveSector", "isIndustryLeader", "freeFromLegalIssues", "outperformedSP500_5y"],
    };
    const _aiInfo = ai ? (ai.search ? "gemini+search" : "gemini") : "none";
    // ── FMP (ixtiyoriy, FMP_KEY bo'lsa): aniqroq ma'lumot, Finnhub ustiga yoziladi ──
    out.source = "finnhub"; out.aiMode = _aiInfo;
    const FMP = process.env.FMP_KEY;
    if (FMP) {
      try {
        const fb = "https://financialmodelingprep.com/stable";
        const g = async path => { const r = await fetch(`${fb}/${path}${path.includes("?") ? "&" : "?"}symbol=${sym}&apikey=${FMP}`); if (!r.ok) throw new Error("fmp " + r.status); const j = await r.json(); return Array.isArray(j) ? (j[0] || {}) : (j || {}); };
        const [rt, km, gr, pf] = await Promise.all([
          g("ratios-ttm").catch(() => ({})), g("key-metrics-ttm").catch(() => ({})),
          g("financial-growth?limit=1").catch(() => ({})), g("profile").catch(() => ({})),
        ]);
        const pct = v => { const x = num(v); return x == null ? null : r2(x * 100); };
        const val = v => { const x = num(v); return x == null ? null : r2(x); };
        const F = out.fundamentals;
        const set = (k, v) => { if (v != null) F[k] = v; };
        set("pe", val(rt.priceToEarningsRatioTTM)); set("ps", val(rt.priceToSalesRatioTTM));
        set("pb", val(rt.priceToBookRatioTTM)); set("pcf", val(rt.priceToFreeCashFlowRatioTTM));
        set("peg", val(rt.priceToEarningsGrowthRatioTTM));
        set("grossMargin", pct(rt.grossProfitMarginTTM)); set("operatingMargin", pct(rt.operatingProfitMarginTTM)); set("netMargin", pct(rt.netProfitMarginTTM));
        set("currentRatio", val(rt.currentRatioTTM)); set("quickRatio", val(rt.quickRatioTTM));
        set("debtToEquity", val(rt.debtToEquityRatioTTM));
        const ic = num(rt.interestCoverageRatioTTM); if (ic != null && ic > 0 && ic < 1000) F.interestCoverage = r2(ic);
        set("roe", pct(km.returnOnEquityTTM)); set("roa", pct(km.returnOnAssetsTTM)); set("roic", pct(km.returnOnInvestedCapitalTTM));
        set("revenueGrowth", pct(gr.revenueGrowth)); set("epsGrowth", pct(gr.epsgrowth ?? gr.epsGrowth));
        if (num(pf.beta) != null) out.risk.beta = r2(pf.beta);
        if (num(km.marketCap ?? pf.marketCap) != null) out.risk.marketCap = Math.round((km.marketCap ?? pf.marketCap) / 1e6);
        if (F.netMargin != null) out.risk.profitableTTM = F.netMargin > 0;
        if (F.operatingMargin != null) out.risk.operatingCashFlowPositive = F.operatingMargin > 0;
        if (pf.sector) { out.sector = pf.sector; out.industry = pf.industry || pf.sector; if (!out.ai) out.risk.isDefensiveSector = DEFENSIVE.test((pf.sector || "") + " " + (pf.industry || "")); }
        if (Object.keys(rt).length) out.source = "fmp+finnhub";
      } catch (e) {}
    }
    CACHE[sym] = { data: out, ts: now };
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ error: "upstream" });
  }
}
