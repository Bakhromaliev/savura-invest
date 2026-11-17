// SEO sahifalar (server tomonda): /aksiya/:ticker, /aksiyalar, /savura-50, /sitemap.xml
// Ma'lumot: Supabase (bot sinxronlaydi): terminal_kompaniya, terminal_halol, terminal_narx, terminal_kompas, savura50.
// Halollik - faqat Halal Terminal ma'lumoti (manba va sana bilan); Savura o'zi hukm bermaydi.
const SB_URL = process.env.SUPABASE_URL || "https://xxrjcyofbgmcqzoaaktq.supabase.co";
const SB_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cmpjeW9mYmdtY3F6b2Fha3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjQwNDYsImV4cCI6MjA5Njk0MDA0Nn0.EAA4GKKQx6VjXQsa753A0hijVIh6dIw-csb6HhtVoUk";
const SAYT = "https://savurainvest.com";
const BOT = "https://t.me/savurabot";

async function sb(yol) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${yol}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, signal: ctrl.signal });
    return r.ok ? await r.json() : [];
  } catch (e) { return []; } finally { clearTimeout(t); }
}

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const n = (v, d = 2) => (v == null || isNaN(+v)) ? null : (+v).toFixed(d);
const pct = (v, d = 1) => (v == null || isNaN(+v)) ? "—" : (+v * 100).toFixed(d) + "%";
const sana = s => s ? String(s).slice(0, 10).split("-").reverse().join(".") : "";
const SEKTOR = { "Technology": "Texnologiya", "Healthcare": "Sog'liqni saqlash", "Consumer Defensive": "Iste'mol (asosiy)", "Consumer Cyclical": "Iste'mol (tsiklik)",
  "Industrials": "Sanoat", "Energy": "Energetika", "Basic Materials": "Xomashyo", "Communication Services": "Aloqa xizmatlari", "Utilities": "Kommunal",
  "Real Estate": "Ko'chmas mulk", "Financial Services": "Moliya" };
const sek = s => SEKTOR[s] || s || "";
const HOLAT = { halol: ["mos", "y"], halol_emas: ["mos emas", "q"], shubhali: ["shubhali", "o"] };
const tk = s => String(s || "").toUpperCase().replace(/[^A-Z0-9.\-]/g, "").slice(0, 10);

const CSS = `:root{--bg:#06140F;--card:#0C1F18;--card2:#10281F;--line:#1C3A2D;--text:#E8F1EA;--dim:#A9C4B5;--faint:#7E9C8C;--mint:#4BE0A0;--green:#178A56;--gold:#E2B65C;--red:#F2766A}
@media (prefers-color-scheme:light){:root{--bg:#F4F6EF;--card:#FFFFFF;--card2:#ECF1E7;--line:#DCE4D6;--text:#0E2118;--dim:#46604F;--faint:#5F7A69;--mint:#0E7C4A;--green:#127A4C;--gold:#9A6B12;--red:#C2412F}}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--text);font-family:Manrope,system-ui,-apple-system,sans-serif;font-variant-numeric:tabular-nums}
a{color:var(--mint)}main{max-width:880px;margin:0 auto;padding:24px 16px 64px;display:flex;flex-direction:column;gap:16px}
h1{font-family:Sora,Manrope,sans-serif;font-size:clamp(26px,5vw,40px);line-height:1.12;margin:0}h2{font-size:17px;margin:0}
.yol{font-size:13px;color:var(--faint)}.yol a{color:var(--faint);text-decoration:none}
.k{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:10px}
.q{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.sp{flex:1}
.narx{font-family:Sora,Manrope,sans-serif;font-size:38px;font-weight:700}
.dim{color:var(--dim);font-size:15px;line-height:1.6;margin:0}.f{color:var(--faint);font-size:13px;line-height:1.5;margin:0}
.bad{font-size:13px;font-weight:700;padding:5px 12px;border-radius:20px;background:color-mix(in srgb,var(--mint) 16%,transparent);color:var(--mint)}
.bad.q{background:color-mix(in srgb,var(--red) 16%,transparent);color:var(--red)}.bad.o{background:color-mix(in srgb,var(--gold) 18%,transparent);color:var(--gold)}.bad.n{background:var(--card2);color:var(--dim)}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.g div{background:var(--card2);border-radius:12px;padding:11px 12px}.g span{display:block;font-size:12px;color:var(--dim)}.g b{font-size:17px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 24px;border-radius:14px;background:var(--green);color:#fff;font-weight:700;text-decoration:none;font-size:16px}
.btn2{display:inline-flex;align-items:center;min-height:46px;padding:0 20px;border-radius:14px;border:1px solid var(--line);color:var(--mint);font-weight:700;text-decoration:none}
.row{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--line);text-decoration:none;color:var(--text)}.row:last-child{border-bottom:0}
.nr{width:30px;color:var(--dim);font-weight:800}.tk{font-weight:800;min-width:64px}.bar{height:7px;border-radius:4px;background:var(--line);width:90px;overflow:hidden;flex:none}.bar i{display:block;height:7px;background:var(--mint)}
details{border-top:1px solid var(--line);padding:12px 0}details summary{cursor:pointer;font-weight:700}details p{margin:8px 0 0}
.chip{display:inline-block;padding:7px 12px;border-radius:20px;border:1px solid var(--line);color:var(--dim);text-decoration:none;font-size:14px;margin:0 6px 6px 0}
input{width:100%;background:var(--card);border:1px solid var(--line);color:var(--text);border-radius:12px;padding:12px 14px;font:inherit;font-size:15px}
footer{color:var(--faint);font-size:13px;text-align:center;padding:10px 16px 30px}
.sp{min-width:0}.row .bad{flex:none}@media (max-width:520px){.bar{display:none}.tk{min-width:52px}}`;

function sahifa({ title, desc, canon, body, jsonld = [] }) {
  return `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${canon}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canon}"><meta property="og:site_name" content="Savura Invest">
<meta name="theme-color" content="#06140F"><link rel="icon" href="/icons/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Sora:wght@600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("")}</head>
<body><main>${body}</main><footer>© Savura Invest · halol aksiyalar akademiyasi · <a href="/aksiyalar">Aksiyalar</a> · <a href="/savura-50">Savura 50</a> · <a href="/liga">Liga</a><br>Ma'lumotlar ta'lim maqsadida, investitsiya tavsiyasi emas.</footer></body></html>`;
}

function chiziq(iz) {
  const v = (iz || []).map(Number).filter(x => x > 0);
  if (v.length < 3) return "";
  const mn = Math.min(...v), mx = Math.max(...v), w = 600, h = 90;
  const p = v.map((x, i) => `${(i / (v.length - 1) * w).toFixed(1)},${(h - 6 - (x - mn) / ((mx - mn) || 1) * (h - 12)).toFixed(1)}`).join(" ");
  const rang = v[v.length - 1] >= v[0] ? "var(--mint)" : "var(--red)";
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="1 oylik narx grafigi" preserveAspectRatio="none"><polyline fill="none" stroke="${rang}" stroke-width="2.5" vector-effect="non-scaling-stroke" points="${p}"/></svg>`;
}

async function aksiyaSahifa(t) {
  const [k, h, nx, kp] = await Promise.all([
    sb(`terminal_kompaniya?ticker=eq.${t}&select=*`), sb(`terminal_halol?ticker=eq.${t}&select=*`),
    sb(`terminal_narx?ticker=eq.${t}&select=*`), sb(`terminal_kompas?ticker=eq.${t}&select=ball`)]);
  const c = k[0];
  if (!c) return null;
  const d = c.data || {}, hl = h[0], p = nx[0], ball = kp[0] && kp[0].ball;
  const nom = c.nom || t;
  const qarindosh = c.sektor ? await sb(`terminal_kompaniya?sektor=eq.${encodeURIComponent(c.sektor)}&ticker=neq.${t}&select=ticker,nom&limit=8`) : [];
  const ozg = p && p.oldingi ? (p.narx / p.oldingi - 1) * 100 : null;
  const [hn, hk] = hl ? (HOLAT[hl.holat] || ["tekshirilmagan", "n"]) : ["tekshirilmagan", "n"];
  const hsana = hl ? sana(hl.tekshirilgan || hl.sana) : "";
  const kor = [["P/E", n(d.pe, 1)], ["P/E (kelajak)", n(d.pe_kelajak, 1)], ["ROE", d.roe != null ? pct(d.roe, 0) : null], ["Sof marja", d.marja != null ? pct(d.marja, 0) : null],
    ["Daromad o'sishi", d.osish != null ? pct(d.osish, 0) : null], ["Qarz/kapital", n(d.de, 2)], ["Dividend", d.dividend != null ? pct(d.dividend, 2) : null],
    ["Kapitalizatsiya", d.kapitalizatsiya ? "$" + (d.kapitalizatsiya >= 1e12 ? (d.kapitalizatsiya / 1e12).toFixed(2) + " trln" : (d.kapitalizatsiya / 1e9).toFixed(1) + " mlrd") : null]].filter(x => x[1] != null);
  const faq = [
    [`${t} aksiyasi halolmi?`, hl ? `Halal Terminal ${hsana} dagi tekshiruvda ${nom} (${t}) ni «${hn}» deb belgilagan. Savura o'zi shariat hukmi bermaydi — bu provayder ma'lumoti; holat o'zgarishi mumkin, savdodan oldin yangi holatni tekshiring.` : `${t} hali Halal Terminal orqali tekshirilmagan. Savura botida /halol ${t} buyrug'i bilan tekshiruvni so'rashingiz mumkin.`],
    hl && hl.tozalash != null ? [`${t} bo'yicha tozalash (ehson) qancha?`, `Halal Terminal ma'lumotiga ko'ra nomuvofiq daromad ulushi ${pct(hl.tozalash, 2)}: har $100 dividenddan taxminan $${(hl.tozalash * 100).toFixed(2)} ehson qilinadi. Savura botidagi «Haqiqiy portfelim» buni avtomatik hisoblaydi.`] : null,
    hl && hl.qarz != null ? [`${nom} qarz ulushi qancha?`, `Halal Terminal bo'yicha foizli qarzning ulushi ${pct(hl.qarz, 1)}.`] : null,
    ball != null ? [`Savura kompasi ${t} ga qanday baho beradi?`, `Savura kompasi ${t} ni ${(+ball).toFixed(1)}/10 deb baholaydi. Kompas barqarorlik, rentabellik, o'sish, baholash va dividend ko'rsatkichlarini sektor bilan solishtiradi.`] : null,
  ].filter(Boolean);
  const title = `${nom} (${t}) aksiyasi: halollik holati, narx va ko'rsatkichlar | Savura Invest`;
  const desc = `${t} halolmi? Halal Terminal holati: ${hn}${hsana ? " (" + hsana + ")" : ""}. Narx${p ? " $" + n(p.narx) : ""}, P/E, ROE, qarz va Savura kompasi bahosi — o'zbek tilida.`;
  const canon = `${SAYT}/aksiya/${t}`;
  const body = `<nav class="yol"><a href="/">Savura Invest</a> › <a href="/aksiyalar">Aksiyalar</a>${c.sektor ? " › " + esc(sek(c.sektor)) : ""} › ${t}</nav>
<h1>${esc(nom)} (${t}) aksiyasi: halollik holati, narx va ko'rsatkichlar</h1>
${p ? `<div class="q"><span class="narx">$${n(p.narx)}</span>${ozg != null ? `<b style="color:${ozg >= 0 ? "var(--mint)" : "var(--red)"}">${ozg >= 0 ? "+" : ""}${ozg.toFixed(2)}%</b>` : ""}<span class="f">oxirgi yopilish${p.vaqt ? " · " + sana(p.vaqt) : ""}</span></div>${chiziq(p.iz)}` : ""}
<section class="k"><div class="q"><h2 class="sp">Halal Terminal holati</h2><span class="bad ${hk}">${hn}</span></div>
${hl ? `<p class="dim">${hl.qarz != null ? "Qarz ulushi " + pct(hl.qarz, 1) : ""}${hl.tozalash != null ? " · tozalash ulushi " + pct(hl.tozalash, 2) : ""}${hsana ? " · tekshirilgan " + hsana : ""}</p>` : `<p class="dim">Bu kompaniya hali tekshirilmagan.</p>`}
<p class="f">Manba: Halal Terminal. Savura o'zi shariat hukmi bermaydi.</p></section>
<section class="k"><div class="q"><h2 class="sp">Savura kompasi</h2>${ball != null ? `<b style="font-size:24px">${(+ball).toFixed(1)}<span class="f">/10</span></b>` : ""}</div>
${kor.length ? `<div class="g">${kor.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join("")}</div>` : `<p class="dim">Ko'rsatkichlar tez orada.</p>`}
<p class="f">${esc(sek(c.sektor))}${c.sanoat ? " · " + esc(c.sanoat) : ""}${c.sana ? " · ma'lumot " + sana(c.sana) : ""}</p></section>
<section class="k"><h2>Ko'p so'raladigan savollar</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p class="dim">${esc(a)}</p></details>`).join("")}</section>
<div class="q"><a class="btn" href="/terminal/${t}">Savura terminalida batafsil tahlil</a><a class="btn2" href="${BOT}">Telegram botda kuzatish</a></div>
${qarindosh.length ? `<section><p class="f" style="margin-bottom:8px">Shu sektorda:</p>${qarindosh.map(x => `<a class="chip" href="/aksiya/${esc(x.ticker)}">${esc(x.ticker)}</a>`).join("")}</section>` : ""}`;
  const jsonld = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Savura Invest", item: SAYT + "/" }, { "@type": "ListItem", position: 2, name: "Aksiyalar", item: SAYT + "/aksiyalar" },
      { "@type": "ListItem", position: 3, name: `${nom} (${t})`, item: canon }] }];
  return sahifa({ title, desc, canon, body, jsonld });
}

async function royxatSahifa() {
  const [k, h, kp] = await Promise.all([sb("terminal_kompaniya?select=ticker,nom,sektor&order=ticker&limit=2000"), sb("terminal_halol?select=ticker,holat&limit=2000"),
    sb("terminal_kompas?select=ticker,ball&limit=3000")]);
  const hm = Object.fromEntries(h.map(x => [x.ticker, x.holat])), km = Object.fromEntries(kp.map(x => [x.ticker, x.ball]));
  const body = `<nav class="yol"><a href="/">Savura Invest</a> › Aksiyalar</nav><h1>AQSH aksiyalari: halollik holati va Savura kompasi</h1>
<p class="dim">${k.length} ta kompaniya. Halollik — Halal Terminal ma'lumoti, baho — Savura kompasi (0–10). Kompaniya nomi yoki tikerini yozing.</p>
<input id="qidir" placeholder="Masalan: AAPL yoki Apple" aria-label="Qidirish">
<section class="k" style="padding:6px 18px" id="ro">${k.map(x => { const [hn, hk] = HOLAT[hm[x.ticker]] || ["tekshirilmagan", "n"];
    return `<a class="row" href="/aksiya/${esc(x.ticker)}" data-s="${esc((x.ticker + " " + (x.nom || "")).toLowerCase())}"><span class="tk">${esc(x.ticker)}</span><span class="sp dim" style="font-size:14px">${esc(x.nom || "")}</span>${km[x.ticker] != null ? `<b>${(+km[x.ticker]).toFixed(1)}</b>` : ""}<span class="bad ${hk}">${hn}</span></a>`; }).join("")}</section>
<script>document.getElementById("qidir").oninput=e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll("#ro .row").forEach(r=>{r.style.display=!q||r.dataset.s.indexOf(q)>=0?"":"none";});};</script>`;
  return sahifa({ title: "AQSH aksiyalari ro'yxati: halollik holati (Halal Terminal) | Savura Invest", desc: `${k.length} ta AQSH kompaniyasining Halal Terminal bo'yicha halollik holati va Savura kompasi bahosi — o'zbek tilida.`, canon: SAYT + "/aksiyalar", body });
}

async function s50Sahifa() {
  const meta = (await sb("savura50_meta?select=*&order=hafta.desc&limit=1"))[0];
  if (!meta) return sahifa({ title: "Savura 50 | Savura Invest", desc: "Savura 50 haftalik reytingi tayyorlanmoqda.", canon: SAYT + "/savura-50", body: `<h1>Savura 50</h1><p class="dim">Ro'yxat tayyorlanmoqda — dushanba kuni yangilanadi.</p>` });
  const rows = await sb(`savura50?hafta=eq.${meta.hafta}&select=*&order=orin`);
  const nom = Object.fromEntries((await sb(`terminal_kompaniya?ticker=in.(${rows.map(r => r.ticker).join(",")})&select=ticker,nom`)).map(x => [x.ticker, x.nom]));
  const yangi = meta.yangi || [], chiqdi = meta.chiqdi || [];
  const body = `<nav class="yol"><a href="/">Savura Invest</a> › Savura 50</nav><h1>Savura 50</h1>
<p class="dim">Halal Terminal «mos» deb belgilagan kompaniyalar ichidan Savura kompasi bo'yicha eng sifatli 50 tasi. Har dushanba yangilanadi.</p>
<div class="q"><span class="bad">${sana(meta.hafta)}</span>${yangi.length || chiqdi.length ? `<span class="bad o">+${yangi.length} yangi · −${chiqdi.length} chiqdi</span>` : ""}</div>
<section class="k" style="padding:6px 18px">${rows.map(r => `<a class="row" href="/aksiya/${esc(r.ticker)}"><span class="nr">${r.orin}</span><span class="tk">${esc(r.ticker)}</span><span class="sp dim" style="font-size:14px">${esc(nom[r.ticker] || "")}<br><span class="f">${esc(sek(r.sektor))}</span></span><span class="bar"><i style="width:${Math.round(+r.ball * 10)}%"></i></span><b>${(+r.ball).toFixed(1)}</b>${r.yangi ? '<span class="bad" style="font-size:11px">yangi</span>' : ""}</a>`).join("")}</section>
${meta.natija != null ? `<section class="k"><div class="q"><span class="dim sp">${sana(meta.natija_hafta)} dagi Savura 50 natijasi (≈1 oy)</span><b style="color:${meta.natija >= 0 ? "var(--mint)" : "var(--red)"}">${meta.natija >= 0 ? "+" : ""}${(+meta.natija).toFixed(1)}%</b></div><div class="q"><span class="dim sp">S&amp;P 500 (SPY), shu davr</span><b>${meta.spy >= 0 ? "+" : ""}${(+meta.spy).toFixed(1)}%</b></div><p class="f">O'tmishdagi natija kelajakni kafolatlamaydi.</p></section>` : ""}
${chiqdi.length ? `<p class="f">Bu hafta chiqdi: ${chiqdi.map(esc).join(", ")}</p>` : ""}
<p class="f">Tavsiya emas, ta'lim maqsadida. Halollik — Halal Terminal ma'lumoti; kirish va chiqish qoidalari Savura terminalida.</p>
<a class="btn" href="${BOT}?start=savura50">Botda haftalik o'zgarishlarni olish</a>`;
  return sahifa({ title: `Savura 50 — eng sifatli halol aksiyalar (${sana(meta.hafta)}) | Savura Invest`, desc: "Halal Terminal «mos» deb belgilagan AQSH kompaniyalari ichidan Savura kompasi bo'yicha eng yuqori 50 tasi. Har dushanba yangilanadi.", canon: SAYT + "/savura-50", body,
    jsonld: [{ "@context": "https://schema.org", "@type": "ItemList", name: "Savura 50", itemListElement: rows.slice(0, 50).map(r => ({ "@type": "ListItem", position: r.orin, url: `${SAYT}/aksiya/${r.ticker}`, name: nom[r.ticker] || r.ticker })) }] });
}

async function sitemap() {
  const k = await sb("terminal_kompaniya?select=ticker,sana&order=ticker&limit=5000");
  const st = ["/", "/aksiyalar", "/savura-50", "/liga", "/terminal"].map(u => `<url><loc>${SAYT}${u}</loc><changefreq>daily</changefreq></url>`);
  const ak = k.map(x => `<url><loc>${SAYT}/aksiya/${esc(x.ticker)}</loc>${x.sana ? `<lastmod>${String(x.sana).slice(0, 10)}</lastmod>` : ""}<changefreq>weekly</changefreq></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${st.join("")}${ak.join("")}</urlset>`;
}

export default async function handler(req, res) {
  const q = req.query || {};
  try {
    if (q.sitemap) {
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
      return res.status(200).send(await sitemap());
    }
    let html = null;
    if (q.royxat) html = await royxatSahifa();
    else if (q.s50) html = await s50Sahifa();
    else if (q.t) {
      const t = tk(q.t);
      if (t && t !== q.t) { res.setHeader("Location", `/aksiya/${t}`); return res.status(301).end(); }
      html = t ? await aksiyaSahifa(t) : null;
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (!html) {
      res.setHeader("Cache-Control", "public, s-maxage=600");
      return res.status(404).send(sahifa({ title: "Aksiya topilmadi | Savura Invest", desc: "Bu tiker bo'yicha sahifa topilmadi.", canon: SAYT + "/aksiyalar",
        body: `<h1>Aksiya topilmadi</h1><p class="dim">Bu tiker bizning ro'yxatda yo'q. <a href="/aksiyalar">Barcha aksiyalar</a> yoki <a href="/terminal">Savura terminali</a>.</p>` }));
    }
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).send(html);
  } catch (e) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(500).send("Xato");
  }
}
