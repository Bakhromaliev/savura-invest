// Savura Terminal — savurainvest.com/terminal
// Bozor, kompaniya sahifasi (Bloomberg uslubidagi bo'limlar), skaner va solishtirish.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { TILLAR, t as tr } from "./til.js";

// Savura yagona palitrasi: tun - to'q yashil, kun - iliq oq (sayt bilan bir xil)
const TUN = { bg: "#06140F", bg2: "#081A13", card: "#0C1F18", line: "#1C3A2D", line2: "#2A4D3E", text: "#E8F1EA", dim: "#C2D6CA", faint: "#8FB09F",
  blue: "#178A56", blueLt: "#4BE0A0", green: "#4BE0A0", greenBg: "#0F2E21", greenLine: "#22553F", red: "#F2766A", amber: "#E2B65C",
  sel: "#10291F", hover: "#0F2419", input: "#071610", grid: "#10261D", zero: "#2A4D3E", redLine: "#5a2a2a", amberLine: "#5c4a22", up: "#2BC27D", down: "#E5534B",
  backdrop: "#020a07cc", rang: ["#4BE0A0", "#E2B65C", "#7CB8FF", "#E58BC8"] };
const KUN = { bg: "#F4F6EF", bg2: "#FFFFFF", card: "#FFFFFF", line: "#DCE4D6", line2: "#C3D0BE", text: "#0E2118", dim: "#2F4A3C", faint: "#557062",
  blue: "#127A4C", blueLt: "#0E6B41", green: "#0E7C4A", greenBg: "#E2F3E8", greenLine: "#B5DDC4", red: "#C4382E", amber: "#9A6B12",
  sel: "#E2F3E8", hover: "#EEF3EA", input: "#FFFFFF", grid: "#E8EEE3", zero: "#C3D0BE", redLine: "#EBC2BD", amberLine: "#E3D2AE", up: "#159A5C", down: "#C4382E",
  backdrop: "#0e211899", rang: ["#127A4C", "#9A6B12", "#2F6FB8", "#A2457E"] };
const R = { ...TUN };
function temaOl() { try { return localStorage.getItem("savura_theme") === "light" ? "light" : "dark"; } catch (e) { return "dark"; } }

// ── yordamchilar ──────────────────────────────────────────────────────────
const n = v => (typeof v === "number" && isFinite(v) ? v : null);
const iz = s => "\u2066" + s + "\u2069";   // RTL (arabcha) matnda raqam tartibi buzilmasin
const fx0 = (v, d = 2) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/,/g, "\u202f");
const fx = (v, d = 2) => (n(v) == null ? "—" : iz(fx0(v, d)));
const pul = v => (n(v) == null ? "—" : iz("$" + fx0(v, 2)));
const katta = v => { if (n(v) == null) return "—"; const a = Math.abs(v); const s = v < 0 ? "−" : "";
  if (a >= 1e12) return iz(s + "$" + fx0(a / 1e12, 2) + "T"); if (a >= 1e9) return iz(s + "$" + fx0(a / 1e9, 1) + "B"); if (a >= 1e6) return iz(s + "$" + fx0(a / 1e6, 1) + "M"); return iz(s + "$" + fx0(a, 0)); };
const foiz = (v, d = 1) => (n(v) == null ? "—" : iz((v < 0 ? "−" : "") + fx0(Math.abs(v) * 100, d) + "%"));   // ulush -> %
const ozg = v => (n(v) == null ? "—" : iz((v > 0 ? "+" : v < 0 ? "−" : "") + fx0(Math.abs(v), 2) + "%")); // % qiymat
const rang = v => (n(v) == null ? R.faint : v > 0 ? R.green : v < 0 ? R.red : R.dim);
const mlrd = v => (n(v) == null ? "—" : iz((v < 0 ? "−" : "") + fx0(Math.abs(v) / 1e9, 1)));

function yol() { try { return decodeURIComponent(window.location.pathname.replace(/\/+$/, "")); } catch (e) { return "/terminal"; } }
function ot(url) { try { window.history.pushState({}, "", url); window.dispatchEvent(new Event("popstate")); window.scrollTo({ top: 0 }); } catch (e) { window.location.href = url; } }

const KESH = {};
let TOKEN = "";
function olish(url) {
  return fetch(url, { headers: TOKEN ? { Authorization: "Bearer " + TOKEN } : {} })
    .then(r => r.json().then(j => ({ ok: r.ok, status: r.status, j })));
}
function useApi(url) {
  const [s, setS] = useState({ yuk: !!url, d: url ? KESH[url] : null, xato: null });
  const [k, setK] = useState(0);
  useEffect(() => {
    if (!url) { setS({ yuk: false, d: null, xato: null }); return; }
    let tirik = true;
    if (KESH[url] && k === 0) { setS({ yuk: false, d: KESH[url], xato: null }); return; }
    setS(p => ({ ...p, yuk: true, xato: null }));
    olish(url).then(({ ok, j }) => {
      if (!tirik) return;
      if (!ok) throw new Error(j && j.xato || "xato");
      KESH[url] = j; setS({ yuk: false, d: j, xato: null });
    }).catch(e => { if (tirik) setS({ yuk: false, d: null, xato: String(e.message || e) }); });
    return () => { tirik = false; };
  }, [url, k]);
  return { ...s, qayta: () => setK(x => x + 1) };
}

// ── umumiy UI ─────────────────────────────────────────────────────────────
// getter: kun/tun almashganda yangi rang olinadi (...card yoyilganda)
const card = { get background() { return R.card; }, get border() { return `1px solid ${R.line}`; }, borderRadius: 18, padding: 18 };
const h2 = { margin: 0, fontFamily: "Sora, sans-serif", fontSize: 17, fontWeight: 700 };
function Chip({ on, onClick, children }) {
  return <button onClick={onClick} aria-pressed={on} className="tr-chip" style={{ minHeight: 34, padding: "0 12px", borderRadius: 9, fontSize: 13, fontWeight: 700,
    background: on ? R.blue : "transparent", color: on ? "#fff" : R.dim, border: `1px solid ${on ? R.blue : R.line2}` }}>{children}</button>;
}
function Yuk({ L }) { return <div style={{ ...card, color: R.faint, display: "flex", alignItems: "center", gap: 10 }}><span className="tr-spin" />{tr(L, "yukl")}</div>; }
function Xato({ L, qayta, matn }) {
  return <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
    <span style={{ color: R.dim }}>{matn || tr(L, "xato")}</span>
    {qayta && <button onClick={qayta} className="tr-btn2">{tr(L, "qayta")}</button>}</div>;
}
function HolatBelgi({ L, holat, kichik }) {
  const h = holat || "nomalum", ok = h === "halol", yomon = h === "halol_emas";
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: kichik ? 11 : 13, fontWeight: 800, padding: kichik ? "1px 7px" : "5px 10px", borderRadius: 999,
    color: ok ? R.green : yomon ? R.red : R.amber, background: ok ? R.greenBg : "transparent", border: `1px solid ${ok ? R.greenLine : yomon ? R.redLine : R.amberLine}` }}>{tr(L, "holat")[h] || h}</span>;
}

// ── Kirish holati (3 kunlik sinov) ────────────────────────────────────────
function Darvoza({ L, kirish, children, ulashOch }) {
  if (kirish.holat === "ok" || kirish.holat === "sinov") return children;
  if (kirish.holat === "yuk") return <Yuk L={L} />;
  const tugadi = kirish.holat === "tugadi";
  return <div style={{ ...card, maxWidth: 520, margin: "40px auto", textAlign: "center", display: "flex", flexDirection: "column", gap: 12, alignItems: "center", padding: 32 }}>
    <h2 style={{ ...h2, fontSize: 22 }}>{tr(L, tugadi ? "tugadi" : "kirishKerak")}</h2>
    <p style={{ margin: 0, color: R.dim, lineHeight: 1.6 }}>{tr(L, tugadi ? "tugadiSub" : "kirishSub")}</p>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
      {!tugadi && <a href="/?p=auth&keyin=/terminal" onClick={() => { try { sessionStorage.setItem("savura_keyin", window.location.pathname); } catch (e) {} }} className="tr-btn">{tr(L, "kirish")}</a>}
      <a href="https://t.me/savurabot?start=tarif" target="_blank" rel="noopener" className={tugadi ? "tr-btn" : "tr-btn2"}>{tr(L, "botTarif")}</a>
      {tugadi && ulashOch && <button className="tr-btn2" onClick={ulashOch}>{tr(L, "ulash")}</button>}
    </div>
  </div>;
}

// ── Bozor ─────────────────────────────────────────────────────────────────
const INDEKS_NOM = { "GC=F": { uz: "Oltin", ru: "Золото", en: "Gold", tr: "Altın", ar: "الذهب" },
  "SI=F": { uz: "Kumush", ru: "Серебро", en: "Silver", tr: "Gümüş", ar: "الفضة" },
  "CL=F": { uz: "Neft (WTI)", ru: "Нефть (WTI)", en: "Oil (WTI)", tr: "Petrol (WTI)", ar: "النفط (WTI)" },
  "DX-Y.NYB": { uz: "Dollar indeksi", ru: "Индекс доллара", en: "Dollar index", tr: "Dolar endeksi", ar: "مؤشر الدولار" },
  "^IRX": { uz: "Obligatsiya, 3 oy", ru: "Облигации, 3 мес.", en: "Treasury, 3M", tr: "Tahvil, 3 ay", ar: "سندات 3 أشهر" },
  "^FVX": { uz: "Obligatsiya, 5 yil", ru: "Облигации, 5 лет", en: "Treasury, 5Y", tr: "Tahvil, 5 yıl", ar: "سندات 5 سنوات" },
  "^TNX": { uz: "Obligatsiya, 10 yil", ru: "Облигации, 10 лет", en: "Treasury, 10Y", tr: "Tahvil, 10 yıl", ar: "سندات 10 سنوات" },
  "^TYX": { uz: "Obligatsiya, 30 yil", ru: "Облигации, 30 лет", en: "Treasury, 30Y", tr: "Tahvil, 30 yıl", ar: "سندات 30 سنة" } };
const FOIZ_SIM = new Set(["^IRX", "^FVX", "^TNX", "^TYX"]);

// Sana: o'zbekcha nomlar qo'lda (brauzerlarda uz lokali ko'pincha to'liq emas)
const UZ_OY = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const UZ_KUN = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
function sanaYoz(dt, L, qisqa) {
  if (L === "uz") return (qisqa ? UZ_KUN[dt.getDay()].slice(0, 3) : UZ_KUN[dt.getDay()]) + ", " + dt.getDate() + "-" + (qisqa ? UZ_OY[dt.getMonth()].slice(0, 3) : UZ_OY[dt.getMonth()]);
  try { return dt.toLocaleDateString(L, qisqa ? { weekday: "short", day: "numeric", month: "short" } : { weekday: "long", day: "numeric", month: "long" }); } catch (e) { return dt.toISOString().slice(0, 10); }
}

// Kompaniya logotipi (ochiq rasm manbasi), topilmasa harfli belgi
function Logo({ t, size = 28 }) {
  const [xato, setXato] = useState(false);
  const st = { width: size, height: size, borderRadius: size * 0.28, flexShrink: 0, objectFit: "contain", background: "#fff" };
  if (xato || !t) return <span aria-hidden="true" style={{ ...st, display: "inline-flex", alignItems: "center", justifyContent: "center", background: R.greenBg, color: R.green, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: size * 0.42 }}>{(t || "?")[0]}</span>;
  return <img src={"https://financialmodelingprep.com/image-stock/" + encodeURIComponent(t) + ".png"} alt="" loading="lazy" width={size} height={size} onError={() => setXato(true)} style={{ ...st, padding: size * 0.1, boxSizing: "border-box" }} />;
}

// Kichik chiziqli grafik (makro va indekslar)
function Iz({ v, w = 96, h = 28, c }) {
  if (!v || v.length < 2) return null;
  const mn = Math.min(...v), mx = Math.max(...v);
  const d = v.map((x, i) => (i ? "L" : "M") + (i * w / (v.length - 1)).toFixed(1) + " " + (h - 2 - (x - mn) / (mx - mn || 1) * (h - 4)).toFixed(1)).join(" ");
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ display: "block" }}><path d={d} fill="none" stroke={c} strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

// Bosh qism: harakatlanuvchi gradient va kompaniya logotiplari lentasi
function BozorBosh({ L, d }) {
  const xr = (d.xarita || []).slice(0, 48);
  const q1 = xr.filter((_, i) => i % 2 === 0), q2 = xr.filter((_, i) => i % 2 === 1);
  const chip = (x, nusxa) => <a key={(nusxa ? "b" : "a") + x.t} href={"/terminal/" + x.t} onClick={e => { e.preventDefault(); ot("/terminal/" + x.t); }} className="tr-lchip"
    aria-hidden={nusxa ? "true" : undefined} tabIndex={nusxa ? -1 : undefined}>
    <Logo t={x.t} size={26} /><b>{x.t}</b><span style={{ color: rang(x.oz), fontWeight: 800 }}>{ozg(x.oz)}</span></a>;
  const qator = (arr, teskari) => <div className="tr-lenta-oyna"><div className={"tr-lenta" + (teskari ? " teskari" : "")}>{arr.map(x => chip(x, false))}{arr.map(x => chip(x, true))}</div></div>;
  const sana = sanaYoz(new Date(), L, false);
  return <section className="tr-hero">
    <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, padding: "26px 26px 8px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: R.faint, textTransform: L === "uz" ? "none" : "capitalize" }}>{sana}</span>
        <h1 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.02em" }}>{tr(L, "bugunBozor")}</h1>
        <span style={{ color: R.dim, fontSize: 15 }}>{tr(L, "bozorSub")}</span>
      </div>
      <div className="tr-hero-ind">
        {(d.indeks || []).map(i => { const c = i.narx && i.oldingi ? (i.narx / i.oldingi - 1) * 100 : null;
          return <div key={i.s} className="tr-shisha">
            <span style={{ fontSize: 12, color: R.faint }}>{INDEKS_NOM[i.s]?.[L] || i.n}</span>
            <b style={{ fontFamily: "Sora, sans-serif", fontSize: 17 }}>{i.narx == null ? "—" : fx(i.narx, i.narx > 1000 ? 1 : 2)}</b>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: rang(c) }}>{ozg(c)}</span></div>; })}
      </div>
    </div>
    {xr.length > 6 && <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10, padding: "14px 0 22px" }}>{qator(q1, false)}{qator(q2, true)}</div>}
  </section>;
}

function Makro({ L, d }) {
  const m = (d.makro || []).filter(x => x.narx != null);
  if (!m.length) return null;
  return <section style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
      <h2 style={h2}>{tr(L, "makro")}</h2><span style={{ fontSize: 12, color: R.faint }}>{tr(L, "makroIzoh")}</span></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
      {m.map(i => { const c = i.oldingi ? (i.narx / i.oldingi - 1) * 100 : null, f = FOIZ_SIM.has(i.s);
        const farq = f && i.oldingi ? i.narx - i.oldingi : null;
        return <div key={i.s} className="tr-makro">
          <span style={{ fontSize: 12, color: R.faint }}>{INDEKS_NOM[i.s]?.[L] || i.n}</span>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <b style={{ fontFamily: "Sora, sans-serif", fontSize: 18 }}>{f ? iz(fx0(i.narx, 2) + "%") : (i.s === "DX-Y.NYB" ? fx(i.narx, 2) : pul(i.narx))}</b>
              <span style={{ fontSize: 12, fontWeight: 800, color: rang(f ? farq : c) }}>{f ? iz((farq >= 0 ? "+" : "−") + fx0(Math.abs(farq || 0), 2) + " p.p.") : ozg(c)}</span>
            </div>
            <Iz v={i.iz} c={rang(f ? farq : c)} w={84} />
          </div></div>; })}
    </div>
  </section>;
}

function KalendarQism({ L, toliq }) {
  const { yuk, d, xato, qayta } = useApi("/api/terminal?a=kalendar");
  if (yuk && !d) return <Yuk L={L} />;
  if (xato) return <Xato L={L} qayta={qayta} />;
  const arr = (d?.royxat || []).slice(0, toliq ? 200 : 8);
  const kun = s => { try { return sanaYoz(new Date(s + "T12:00:00"), L, true); } catch (e) { return s; } };
  let oldingi = "";
  return <section style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
      <h2 style={h2}>{tr(L, "kalendar")}</h2>
      {toliq ? <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "kalendarIzoh")}</span>
        : <a href="/terminal/kalendar" onClick={e => { e.preventDefault(); ot("/terminal/kalendar"); }} style={{ color: R.blueLt, fontWeight: 700, fontSize: 13 }}>{tr(L, "hammasiniKor")}</a>}
    </div>
    {!arr.length && <span style={{ color: R.faint, padding: "8px 0" }}>{tr(L, "kalYoq")}</span>}
    {arr.map(x => { const sar = toliq && x.sana !== oldingi ? (oldingi = x.sana, true) : false;
      return <React.Fragment key={x.t + x.sana}>
        {sar && <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 800, color: R.faint, textTransform: "capitalize" }}>{kun(x.sana)}</div>}
        <a href={"/terminal/" + x.t} onClick={e => { e.preventDefault(); ot("/terminal/" + x.t); }} className="tr-qator">
          {!toliq && <span style={{ width: 86, color: R.faint, fontSize: 12.5, textTransform: "capitalize" }}>{kun(x.sana)}</span>}
          <Logo t={x.t} size={26} /><b style={{ width: 56 }}>{x.t}</b>
          <span className="tr-tel-yoq" style={{ flex: 1, color: R.dim, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.nom}</span>
          <span className="tr-tel-yoq" style={{ fontSize: 12, color: R.faint, whiteSpace: "nowrap" }}>{x.vaqt === "bmo" ? tr(L, "oldin") : x.vaqt === "amc" ? tr(L, "keyin") : ""}</span>
          <span style={{ width: 92, textAlign: "end", fontSize: 13 }}>{x.epsKut != null ? "EPS " + pul(x.epsKut) : "—"}</span>
        </a></React.Fragment>; })}
  </section>;
}
function Bozor({ L }) {
  const { yuk, d, xato, qayta } = useApi("/api/terminal?a=market");
  const [sek, setSek] = useState("");
  if (yuk && !d) return <Yuk L={L} />;
  if (xato || !d) return <Xato L={L} qayta={qayta} />;
  const xr = d.xarita || [];
  const sektorlar = [...new Set(xr.map(x => x.sektor).filter(Boolean))];
  const kor = xr.filter(x => !sek || x.sektor === sek);
  const maxCap = Math.max(1, ...kor.map(x => x.cap || 0));
  // Xarita rangi: neytraldan yashil/qizilga (kun va tunda alohida asos)
  const kun = R.bg === KUN.bg;
  const aralash = (a, b, t) => `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(",")})`;
  const fon = c => { const a = Math.min(1, Math.abs(c || 0) / 3); const asos = kun ? [225, 232, 220] : [20, 44, 34];
    return aralash(asos, c >= 0 ? (kun ? [21, 154, 92] : [31, 158, 100]) : (kun ? [196, 56, 46] : [190, 66, 58]), 0.25 + 0.75 * a); };
  const yozuv = c => (kun && Math.abs(c || 0) < 1.6 ? R.text : "#fff");
  const tartib = [...xr].sort((a, b) => b.oz - a.oz);
  return <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
    <BozorBosh L={L} d={d} />
    <section style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <h2 style={h2}>{tr(L, "xarita")}</h2>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Chip on={!sek} onClick={() => setSek("")}>{tr(L, "hammasi")}</Chip>
          {sektorlar.slice(0, 8).map(s => <Chip key={s} on={sek === s} onClick={() => setSek(s)}>{s}</Chip>)}
        </div>
      </div>
      <div className="tr-xarita">
        {kor.map((x, i) => { const w = Math.max(1, Math.min(4, Math.round(Math.sqrt(x.cap / maxCap) * 4))); const h = i < 3 ? 2 : 1;
          return <a key={x.t} href={"/terminal/" + x.t} onClick={e => { e.preventDefault(); ot("/terminal/" + x.t); }} title={x.nom}
            style={{ gridColumn: `span ${w}`, gridRow: `span ${h}`, background: fon(x.oz), borderRadius: 8, color: yozuv(x.oz), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, minWidth: 0 }}>
            <b style={{ fontFamily: "Sora, sans-serif", fontSize: 14 }}>{x.t}</b><span style={{ fontSize: 12, fontWeight: 600 }}>{ozg(x.oz)}</span></a>; })}
      </div>
      <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "xaritaIzoh")}</span>
    </section>
    <Makro L={L} d={d} />
    <KalendarQism L={L} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
      {[["osgan", tartib.slice(0, 6)], ["tushgan", tartib.slice(-6).reverse()]].map(([k, arr]) =>
        <section key={k} style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
          <h2 style={{ ...h2, marginBottom: 6 }}>{tr(L, k)}</h2>
          {arr.map(x => <a key={x.t} href={"/terminal/" + x.t} onClick={e => { e.preventDefault(); ot("/terminal/" + x.t); }} className="tr-qator">
            <Logo t={x.t} size={26} /><b style={{ width: 56 }}>{x.t}</b><span style={{ flex: 1, color: R.dim, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.nom}</span>
            <span style={{ width: 84, textAlign: "end" }}>{pul(x.narx)}</span><span style={{ width: 72, textAlign: "end", fontWeight: 700, color: rang(x.oz) }}>{ozg(x.oz)}</span></a>)}
        </section>)}
    </div>
  </div>;
}

// ── Narx grafigi (TradingView Lightweight Charts, CDN) ─────────────────────
let LWC = null;
function lwcYukla() {
  if (window.LightweightCharts) return Promise.resolve(window.LightweightCharts);
  if (LWC) return LWC;
  LWC = new Promise((ok, yoq) => { const s = document.createElement("script");
    s.src = "https://unpkg.com/lightweight-charts@4.2.3/dist/lightweight-charts.standalone.production.js";
    s.onload = () => ok(window.LightweightCharts); s.onerror = yoq; document.head.appendChild(s); });
  return LWC;
}
function NarxGrafik({ nuqtalar }) {
  const ref = useRef(null); const [svg, setSvg] = useState(false);
  useEffect(() => {
    if (!nuqtalar || !nuqtalar.length) return;
    let ch = null, ro = null, tirik = true;
    lwcYukla().then(LC => {
      if (!tirik || !ref.current) return;
      ch = LC.createChart(ref.current, { height: 300, layout: { background: { color: "transparent" }, textColor: R.faint, fontFamily: "Manrope, sans-serif" },
        grid: { vertLines: { color: R.grid }, horzLines: { color: R.grid } }, rightPriceScale: { borderColor: R.line }, timeScale: { borderColor: R.line }, crosshair: { mode: 0 } });
      const s = ch.addCandlestickSeries({ upColor: R.up, downColor: R.down, borderVisible: false, wickUpColor: R.up, wickDownColor: R.down });
      s.setData(nuqtalar.filter(p => p.o != null).map(p => ({ time: p.t, open: p.o, high: p.h, low: p.l, close: p.c })));
      ch.timeScale().fitContent();
      ro = new ResizeObserver(() => ref.current && ch.applyOptions({ width: ref.current.clientWidth })); ro.observe(ref.current);
    }).catch(() => tirik && setSvg(true));
    return () => { tirik = false; ro && ro.disconnect(); ch && ch.remove(); };
  }, [nuqtalar, R.bg]);
  if (svg) { const c = nuqtalar.map(p => p.c), mn = Math.min(...c), mx = Math.max(...c);
    const d = c.map((v, i) => (i ? "L" : "M") + (i * 600 / (c.length - 1)).toFixed(1) + " " + (290 - (v - mn) / (mx - mn || 1) * 280).toFixed(1)).join(" ");
    return <svg viewBox="0 0 600 300" width="100%" height="300" preserveAspectRatio="none" aria-hidden="true"><path d={d} fill="none" stroke={R.blueLt} strokeWidth="2" /></svg>; }
  return <div ref={ref} style={{ width: "100%", height: 300 }} />;
}

// ── Kompaniya ─────────────────────────────────────────────────────────────
const TABLAR = [["kompas", "SVR"], ["umumiy", "DES"], ["moliya", "FA"], ["baholash", "RV"], ["halol", "HALOL"], ["egalar", "INS"], ["yangilik", "NEWS"], ["ai", "AI"]];
const BUYRUQ = { SVR: "kompas", KOMPAS: "kompas", DES: "umumiy", FA: "moliya", RV: "baholash", DCF: "baholash", HALOL: "halol", HALAL: "halol", INS: "egalar", OWN: "egalar", NEWS: "yangilik", AI: "ai" };

function Kompaniya({ L, sym, tab0 }) {
  const { yuk, d, xato, qayta } = useApi("/api/terminal?a=company&sym=" + encodeURIComponent(sym));
  const [tab, setTab] = useState(tab0 || "kompas");
  useEffect(() => { setTab(tab0 || "kompas"); }, [sym, tab0]);
  if (yuk && !d) return <Yuk L={L} />;
  if (xato) return <Xato L={L} qayta={qayta} />;
  if (!d || d.topilmadi) return <Xato L={L} matn={tr(L, "topilmadi")} />;
  const narx = d.narx?.narx, old = d.narx?.oldingi, oz = narx && old ? (narx / old - 1) * 100 : null;
  const k = d.kompaniya || {}, dt = k.data || {}, fh = d.finnhub || {}, pr = fh.profil || {};
  const nom = d.sec?.nom || pr.nom || k.nom || d.narx?.nom || sym;
  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <section className="tr-hero" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 18, justifyContent: "space-between", padding: "22px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Logo t={sym} size={44} />
          <h1 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 30 }}>{sym}</h1>
          <span style={{ color: R.dim, fontSize: 16 }}>{nom}{k.sektor ? ", " + k.sektor : ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 32 }}>{pul(narx)}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: rang(oz) }}>{ozg(oz)}</span>
          <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "kech")}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start" }}><HolatBelgi L={L} holat={k.halol?.holat} />
          {k.halol?.tekshirilgan && <span style={{ fontSize: 11, color: R.faint }}>Halal Terminal, {k.halol.tekshirilgan}</span>}</span>
        <a href={"https://t.me/savurabot?start=" + sym} target="_blank" rel="noopener" className="tr-btn">{tr(L, "demoSavdo")}</a>
      </div>
    </section>
    <nav role="tablist" style={{ display: "flex", gap: 2, borderBottom: `1px solid ${R.line}`, overflowX: "auto" }}>
      {TABLAR.map(([id, kod]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className="tr-tab"
        style={{ borderBottom: `2px solid ${tab === id ? R.blue : "transparent"}`, color: tab === id ? R.text : R.faint }}>{tr(L, id)}<span style={{ fontSize: 10, opacity: .6, marginInlineStart: 5 }}>{kod}</span></button>)}
    </nav>
    {tab === "kompas" && <Kompas L={L} k={d.kompas} />}
    {tab === "umumiy" && <Umumiy L={L} d={d} />}
    {tab === "moliya" && <Moliya L={L} sec={d.sec} />}
    {tab === "baholash" && <Baholash L={L} d={d} />}
    {tab === "halol" && <Halol L={L} h={k.halol} />}
    {tab === "egalar" && <Insayder L={L} arr={fh.insayder} />}
    {tab === "yangilik" && <Yangilik L={L} arr={fh.yangilik} />}
    {tab === "ai" && <AiXulosa L={L} sym={sym} />}
  </div>;
}

// ── Savura kompasi ────────────────────────────────────────────────────────
const FOIZLI = new Set(["marja", "yalpi", "roa", "roe", "fcfMarja", "revCagr", "fcfCagr", "osish", "epsKut", "fcfYield", "dividend", "dpsOsish", "yalpiOrt", "yalpiTeb", "foydali"]);
function Kompas({ L, k }) {
  const yon = k?.yon || [];
  const [tan, setTan] = useState(() => { const i = yon.findIndex(x => x.ball != null); return i < 0 ? 0 : i; });
  if (!yon.length || k.umumiy == null) return <Xato L={L} matn={tr(L, "malYetmas")} />;
  const cx = 170, cy = 160, Rr = 112;
  const pt = (i, r) => { const a = (-90 + i * 45) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const P = (i, r) => pt(i, r).map(v => v.toFixed(1)).join(" ");
  const panjara = [0.25, 0.5, 0.75, 1].map(f => yon.map((_, i) => (i ? "L" : "M") + P(i, Rr * f)).join(" ") + " Z").join(" ")
    + " " + yon.map((_, i) => "M" + cx + " " + cy + " L" + P(i, Rr)).join(" ");
  const nuq = yon.map((x, i) => pt(i, Rr * (x.ball || 0) / 10).map(v => v.toFixed(1)).join(",")).join(" ");
  const rangi = v => (v == null ? R.faint : v >= 7 ? R.up : v >= 5 ? R.amber : R.red);
  const sel = yon[tan], d = pt(tan, Rr * (sel.ball || 0) / 10);
  const qiymat = (kk, v) => (v == null ? "—" : FOIZLI.has(kk) ? foiz(v, 1) : fx(v, kk === "qarzFcf" ? 1 : 2));
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
    <section style={{ ...card, flex: "1.3 1 540px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h2 style={h2}>{tr(L, "kompas")}</h2>
        <span style={{ color: R.faint, fontSize: 14 }}>{tr(L, "umumiyBaho")} <b style={{ fontFamily: "Sora, sans-serif", fontSize: 28, color: R.text }}>{fx(k.umumiy, 1)}</b> / 10</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <svg viewBox="-70 0 480 320" width="420" height="280" role="img" aria-label={tr(L, "kompas")} style={{ maxWidth: "100%", flex: "0 1 auto" }}>
          <path d={panjara} fill="none" stroke={R.line} />
          <polygon points={nuq} fill={R.up + "33"} stroke={R.up} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx={d[0]} cy={d[1]} r="6" fill={R.up} stroke={R.card} strokeWidth="3" />
          {yon.map((x, i) => { const p = pt(i, Rr + 24), dx = p[0] - cx;
            return <text key={x.id} x={p[0]} y={p[1] + 4} textAnchor={Math.abs(dx) < 8 ? "middle" : dx > 0 ? "start" : "end"} fontSize="12" fontWeight={i === tan ? 800 : 600} fill={i === tan ? R.text : R.faint}
              style={{ direction: "ltr", unicodeBidi: "plaintext" }}>{tr(L, "k_" + x.id)}</text>; })}
        </svg>
        <div role="group" aria-label={tr(L, "kompas")} style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {yon.map((x, i) => <button key={x.id} onClick={() => setTan(i)} aria-pressed={i === tan} className="tr-kat"
            style={{ background: i === tan ? R.greenBg : "transparent", borderColor: i === tan ? R.greenLine : "transparent", fontWeight: i === tan ? 800 : 600 }}>
            <span style={{ flex: 1, textAlign: "start" }}>{tr(L, "k_" + x.id)}</span>
            <span style={{ width: 72, height: 6, borderRadius: 3, background: R.line, overflow: "hidden" }}><span style={{ display: "block", height: 6, width: (x.ball || 0) * 10 + "%", background: rangi(x.ball) }} /></span>
            <b style={{ width: 30, textAlign: "end" }}>{x.ball == null ? "—" : fx(x.ball, 1)}</b></button>)}
        </div>
      </div>
      <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "kompasIzoh")}</span>
    </section>
    <section style={{ ...card, flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12, alignSelf: "flex-start" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={h2}>{tr(L, "k_" + sel.id)}</h2>
        <b style={{ fontFamily: "Sora, sans-serif", fontSize: 24, color: rangi(sel.ball) }}>{sel.ball == null ? "—" : fx(sel.ball, 1)}</b>
      </div>
      <p style={{ margin: 0, color: R.dim, lineHeight: 1.6, fontSize: 14.5 }}>{tr(L, "i_" + sel.id)}</p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {Object.entries(sel.dalil || {}).map(([kk, v]) => <div key={kk} className="tr-qator" style={{ justifyContent: "space-between" }}>
          <span style={{ color: R.dim }}>{tr(L, "d_" + kk)}</span><b>{qiymat(kk, v)}</b></div>)}
      </div>
    </section>
  </div>;
}

function Umumiy({ L, d }) {
  const k = d.kompaniya || {}, dt = k.data || {}, pr = d.finnhub?.profil || {}, so = (d.sec?.yillar || []).at(-1) || {};
  const qatorlar = [["kap", katta(dt.kapitalizatsiya)], ["pe", fx(dt.pe, 1)], ["peK", fx(dt.pe_kelajak, 1)], ["ps", fx(dt.ps, 1)], ["ev", fx(dt.ev_ebitda, 1)],
    ["roe", foiz(dt.roe)], ["yalpi", foiz(dt.yalpi)], ["marja", foiz(dt.marja)], ["div", dt.dividend ? foiz(dt.dividend, 2) : "—"], ["osish", foiz(dt.osish)],
    ["beta", fx(dt.beta, 2)], ["de", fx(dt.de, 2)], ["fcf", katta(dt.fcf ?? so.fcf)], ["sanoat", k.sanoat || pr.sanoat || "—"]];
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
    <section style={{ ...card, flex: "2 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      <h2 style={h2}>{tr(L, "narx1y")}</h2>
      {d.narx?.nuqtalar?.length ? <NarxGrafik nuqtalar={d.narx.nuqtalar} /> : <span style={{ color: R.faint }}>{tr(L, "yoq")}</span>}
      <span style={{ fontSize: 11, color: R.faint }}>TradingView Lightweight Charts™</span>
    </section>
    <section style={{ ...card, flex: "1 1 280px", minWidth: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14, alignContent: "start" }}>
      {qatorlar.map(([kk, v]) => <div key={kk} style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        <span style={{ fontSize: 12, color: R.faint }}>{tr(L, kk)}</span><span style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis" }}>{v}</span></div>)}
      {pr.sayt && <a href={pr.sayt} target="_blank" rel="noopener" style={{ gridColumn: "span 2", color: R.blueLt, fontSize: 14 }}>{pr.sayt.replace(/^https?:\/\//, "")}</a>}
    </section>
  </div>;
}

function Moliya({ L, sec }) {
  const [k, setK] = useState("daromad");
  const y = sec?.yillar || [];
  if (!y.length) return <Xato L={L} matn={tr(L, "yoq")} />;
  const vals = y.map(r => r[k]).filter(v => n(v) != null), mx = Math.max(1, ...vals.map(Math.abs));
  const QAT = ["daromad", "yalpi", "opfoyda", "sof", "fcf", "eps", "qarz", "pul", "kapital"];
  const kalit = { opfoyda: "operatsion" };
  const qiymat = (r, q) => { const v = r[kalit[q] || q]; return q === "eps" ? (n(v) == null ? "—" : fx(v, 2)) : q === "yalpi" && n(v) != null && n(r.daromad) ? iz(fx0(v / 1e9, 1) + " (" + fx0(v / r.daromad * 100, 1) + "%)") : mlrd(v); };
  return <section style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <h2 style={h2}>{tr(L, "moliya")}, {y[0].yil}–{y.at(-1).yil} ({tr(L, "mlrd")})</h2>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["daromad", "sof", "fcf"].map(q => <Chip key={q} on={k === q} onClick={() => setK(q)}>{tr(L, q)}</Chip>)}</div>
    </div>
    <div style={{ height: 190, display: "flex", alignItems: "flex-end", gap: 8 }}>
      {y.map(r => { const v = r[k]; const h = n(v) == null ? 2 : Math.max(3, Math.abs(v) / mx * 140);
        return <div key={r.yil} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 11, color: R.dim }}>{mlrd(v)}</span>
          <div style={{ width: "100%", height: h, borderRadius: "6px 6px 2px 2px", background: n(v) != null && v < 0 ? R.red : k === "daromad" ? R.blue : k === "sof" ? R.up : R.amber }} />
          <span style={{ fontSize: 11, color: R.faint }}>{r.yil}</span></div>; })}
    </div>
    <div style={{ overflowX: "auto" }}>
      <table className="tr-jadval" style={{ minWidth: 760 }}>
        <thead><tr><th scope="col" style={{ textAlign: "start" }}>{tr(L, "korsatkich")}</th>{y.map(r => <th scope="col" key={r.yil}>{r.yil}</th>)}</tr></thead>
        <tbody>{QAT.map(q => <tr key={q}><th scope="row" style={{ textAlign: "start" }}>{tr(L, q)}</th>{y.map(r => <td key={r.yil}>{qiymat(r, q)}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "manbaSec")}</span>
  </section>;
}

function Baholash({ L, d }) {
  const dt = d.kompaniya?.data || {}, s = d.sektor || {};
  const y = d.sec?.yillar || [], so = y.at(-1) || {};
  const fcf0 = n(so.fcf) ?? n(dt.fcf), sh = n(d.sec?.aksiyalar) ?? n(dt.aksiyalar), narx = d.narx?.narx;
  const [g, setG] = useState(8), [r, setR] = useState(9), [m, setM] = useState(20);
  let fair = null;
  if (fcf0 && sh && fcf0 > 0) { let f = fcf0, pv = 0; for (let i = 1; i <= 5; i++) { f *= 1 + g / 100; pv += f / Math.pow(1 + r / 100, i); } pv += f * m / Math.pow(1 + r / 100, 5); fair = pv / sh; }
  const gap = fair && narx ? (fair / narx - 1) * 100 : null;
  const M = [["pe", dt.pe, s.pe], ["ps", dt.ps, s.ps], ["ev", dt.ev_ebitda, s.ev_ebitda]];
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
    <section style={{ ...card, flex: "1 1 400px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={h2}>{tr(L, "multip")}</h2>
      {M.map(([kk, v, sv]) => { const mx = Math.max(v || 0, sv || 0) * 1.4 || 1;
        return <div key={kk} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span>{tr(L, kk)}</span><span><b>{fx(v, 1)}</b> <span style={{ color: R.faint }}>/ {tr(L, "sektorMed")} {fx(sv, 1)}</span></span></div>
          <div style={{ position: "relative", height: 8, borderRadius: 4, background: R.line }}>
            {n(v) != null && <div style={{ position: "absolute", insetBlock: 0, insetInlineStart: 0, width: Math.min(100, v / mx * 100) + "%", borderRadius: 4, background: R.blue }} />}
            {n(sv) != null && <div style={{ position: "absolute", top: -4, bottom: -4, width: 2, background: R.text, insetInlineStart: Math.min(100, sv / mx * 100) + "%" }} />}
          </div></div>; })}
    </section>
    <section style={{ ...card, flex: "1 1 400px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={h2}>{tr(L, "dcf")}</h2>
      {!fair ? <span style={{ color: R.faint }}>{tr(L, "dcfYoq")}</span> : <>
        {[["g", g, setG, 0, 25, 1, "%"], ["r", r, setR, 6, 14, 0.5, "%"], ["m", m, setM, 8, 35, 1, "×"]].map(([kk, v, set, a, b, st, u]) =>
          <label key={kk} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
            <span style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: R.dim }}>{tr(L, kk)}</span><b>{v}{u}</b></span>
            <input type="range" min={a} max={b} step={st} value={v} onChange={e => set(parseFloat(e.target.value))} /></label>)}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 10, borderTop: `1px solid ${R.line}` }}>
          <span style={{ color: R.dim }}>{tr(L, "adolat")}</span><span style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 28 }}>{pul(fair)}</span></div>
        {gap != null && <span style={{ fontWeight: 700, color: gap >= 0 ? R.green : R.amber }}>{tr(L, gap >= 0 ? "arzon" : "qimmat", { x: fx(Math.abs(gap), 1) })}</span>}
        <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "dcfIzoh")} FCF {katta(fcf0)}</span>
      </>}
    </section>
  </div>;
}

function Halol({ L, h }) {
  if (!h) return <Xato L={L} matn={tr(L, "halolYoq")} />;
  const Q = [["qarzUlush", h.qarz, 0.30], ["tozalash", h.tozalash, 0.05]];
  return <section style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}><HolatBelgi L={L} holat={h.holat} />
      <span style={{ color: R.faint, fontSize: 13 }}>{tr(L, "tekshirilgan")}: {h.tekshirilgan || h.sana || "—"}</span></div>
    {Q.map(([kk, v, lim]) => { const mx = lim * 1.35;
      return <div key={kk} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, gap: 8 }}><span>{tr(L, kk)}</span><span><b>{v == null ? "—" : foiz(v, 1)}</b> <span style={{ color: R.faint }}>{tr(L, "chegara")} {foiz(lim, 0)}</span></span></div>
        <div style={{ position: "relative", height: 10, borderRadius: 5, background: R.line }}>
          {v != null && <div style={{ position: "absolute", insetBlock: 0, insetInlineStart: 0, width: Math.min(100, v / mx * 100) + "%", borderRadius: 5, background: v <= lim ? R.up : R.red }} />}
          <div style={{ position: "absolute", top: -4, bottom: -4, width: 2, background: R.text, insetInlineStart: (lim / mx * 100) + "%" }} />
        </div></div>; })}
    <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "halolManba")}</span>
  </section>;
}

function Insayder({ L, arr }) {
  if (!arr || !arr.length) return <Xato L={L} matn={tr(L, "yoq")} />;
  return <section style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
    <div style={{ overflowX: "auto" }}><table className="tr-jadval" style={{ minWidth: 600 }}>
      <thead><tr><th scope="col" style={{ textAlign: "start" }}>{tr(L, "sana")}</th><th scope="col" style={{ textAlign: "start" }}>{tr(L, "shaxs")}</th><th scope="col" style={{ textAlign: "start" }}>{tr(L, "amal")}</th><th scope="col">{tr(L, "soni")}</th><th scope="col">{tr(L, "narx")}</th></tr></thead>
      <tbody>{arr.map((x, i) => <tr key={i}><td style={{ textAlign: "start" }}>{x.sana}</td><td style={{ textAlign: "start" }}>{x.ism}</td>
        <td style={{ textAlign: "start", color: x.amal === "xarid" ? R.green : R.red, fontWeight: 700 }}>{tr(L, x.amal === "xarid" ? "xarid" : "sotuv")}</td>
        <td>{fx(Math.abs(x.soni || 0), 0)}</td><td>{pul(x.narx)}</td></tr>)}</tbody></table></div>
    <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "manbaFh")}</span></section>;
}

function Yangilik({ L, arr }) {
  if (!arr || !arr.length) return <Xato L={L} matn={tr(L, "yoq")} />;
  return <section style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
    {arr.map((x, i) => <a key={i} href={x.url} target="_blank" rel="noopener" className="tr-qator" style={{ alignItems: "flex-start", flexDirection: "column", gap: 4 }}>
      <span style={{ fontWeight: 600, lineHeight: 1.45 }}>{x.sarlavha}</span>
      <span style={{ fontSize: 12, color: R.faint }}>{x.manba}, {x.vaqt ? new Date(x.vaqt * 1000).toISOString().slice(0, 10) : ""}</span></a>)}
  </section>;
}

function AiXulosa({ L, sym }) {
  const [url, setUrl] = useState(null);
  const { yuk, d, xato, qayta } = useApi(url);
  if (!url) return <section style={{ ...card, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
    <button className="tr-btn" onClick={() => setUrl(`/api/terminal?a=ai&sym=${encodeURIComponent(sym)}&lang=${L}`)}>{tr(L, "aiTugma")}</button>
    <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "aiIzoh")}</span></section>;
  if (yuk) return <Yuk L={L} />;
  if (xato || !d || d.xato) return <Xato L={L} qayta={qayta} />;
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
    {[["kuchli", d.kuchli, R.green], ["risk", d.risk, R.amber]].map(([kk, arr, c]) =>
      <section key={kk} style={{ ...card, flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={{ ...h2, color: c }}>{tr(L, kk)}</h2>
        <ul style={{ margin: 0, paddingInlineStart: 18, display: "flex", flexDirection: "column", gap: 8, color: R.dim, lineHeight: 1.55 }}>{(arr || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
      </section>)}
    {d.xulosa && <p style={{ ...card, margin: 0, flex: "1 1 100%", lineHeight: 1.6 }}>{d.xulosa}</p>}
    <span style={{ fontSize: 12, color: R.faint, flex: "1 1 100%" }}>{tr(L, "aiIzoh")} {d.sana}</span>
  </div>;
}

// ── Skaner ────────────────────────────────────────────────────────────────
function Skaner({ L }) {
  const { yuk, d, xato, qayta } = useApi("/api/terminal?a=list");
  const [f, setF] = useState({ q: "", sek: "", pe: 60, os: -50, halol: true, div: false, sort: "cap", dir: -1, soni: 50 });
  const set = o => setF(p => ({ ...p, ...o }));
  const arr = d?.royxat || [];
  const sektorlar = useMemo(() => [...new Set(arr.map(x => x.sektor).filter(Boolean))].sort(), [arr]);
  const qatorlar = useMemo(() => {
    const q = f.q.trim().toUpperCase();
    const r = arr.map(x => ({ t: x.ticker, nom: x.nom, sek: x.sektor, cap: x.data?.kapitalizatsiya, pe: x.data?.pe, os: x.data?.osish, dv: x.data?.dividend, yalpi: x.data?.yalpi, h: x.halol?.holat }))
      .filter(x => (!q || x.t.includes(q) || (x.nom || "").toUpperCase().includes(q)) && (!f.sek || x.sek === f.sek)
        && (f.pe >= 60 || (n(x.pe) != null && x.pe > 0 && x.pe <= f.pe)) && (f.os <= -50 || (n(x.os) != null && x.os * 100 >= f.os))
        && (!f.halol || x.h === "halol") && (!f.div || (x.dv || 0) > 0));
    r.sort((a, b) => { const x = a[f.sort], y = b[f.sort]; if (x == null) return 1; if (y == null) return -1; return (typeof x === "string" ? x.localeCompare(y) : x - y) * f.dir; });
    return r;
  }, [arr, f]);
  if (yuk && !d) return <Yuk L={L} />;
  if (xato || !d) return <Xato L={L} qayta={qayta} />;
  const U = [["t", "Ticker"], ["nom", tr(L, "nomi")], ["cap", tr(L, "kap")], ["pe", tr(L, "pe")], ["os", tr(L, "osish")], ["dv", tr(L, "div")], ["yalpi", tr(L, "yalpi")], ["h", tr(L, "halol")]];
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start" }}>
    <aside style={{ ...card, flex: "1 1 240px", maxWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={h2}>{tr(L, "filtr")}</h2>
      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: R.faint }}>{tr(L, "qidirNom")}
        <input value={f.q} onChange={e => set({ q: e.target.value, soni: 50 })} className="tr-input" /></label>
      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: R.faint }}>{tr(L, "sektor")}
        <select value={f.sek} onChange={e => set({ sek: e.target.value, soni: 50 })} className="tr-input"><option value="">{tr(L, "hammasi")}</option>{sektorlar.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}><span style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: R.dim }}>{tr(L, "peMax")}</span><b>{f.pe >= 60 ? "∞" : f.pe}</b></span>
        <input type="range" min="5" max="60" value={f.pe} onChange={e => set({ pe: +e.target.value, soni: 50 })} /></label>
      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}><span style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: R.dim }}>{tr(L, "osishMin")}</span><b>{f.os <= -50 ? "—" : f.os + "%"}</b></span>
        <input type="range" min="-50" max="50" value={f.os} onChange={e => set({ os: +e.target.value, soni: 50 })} /></label>
      <label className="tr-check"><input type="checkbox" checked={f.halol} onChange={() => set({ halol: !f.halol, soni: 50 })} />{tr(L, "faqatHalol")}</label>
      <label className="tr-check"><input type="checkbox" checked={f.div} onChange={() => set({ div: !f.div, soni: 50 })} />{tr(L, "divBor")}</label>
      <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "royxatIzoh")}</span>
    </aside>
    <section style={{ ...card, flex: "999 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={h2}>{tr(L, "topildi", { n: qatorlar.length })}</h2>
      <div style={{ overflowX: "auto" }}><table className="tr-jadval" style={{ minWidth: 760 }}>
        <thead><tr>{U.map(([k, nm]) => { const on = f.sort === k;
          return <th key={k} scope="col" aria-sort={on ? (f.dir > 0 ? "ascending" : "descending") : "none"} style={{ textAlign: k === "t" || k === "nom" ? "start" : "end" }}>
            <button className="tr-sort" style={{ color: on ? R.text : R.faint }} onClick={() => set({ sort: k, dir: on ? -f.dir : (k === "t" || k === "nom" ? 1 : -1) })}>{nm}{on ? (f.dir > 0 ? " ↑" : " ↓") : ""}</button></th>; })}</tr></thead>
        <tbody>{qatorlar.slice(0, f.soni).map(x => <tr key={x.t}>
          <td style={{ textAlign: "start" }}><a href={"/terminal/" + x.t} onClick={e => { e.preventDefault(); ot("/terminal/" + x.t); }} style={{ fontWeight: 800, color: R.text }}>{x.t}</a></td>
          <td style={{ textAlign: "start", color: R.dim, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.nom}</td>
          <td>{katta(x.cap)}</td><td>{fx(x.pe, 1)}</td><td style={{ color: rang(x.os) }}>{foiz(x.os)}</td><td>{x.dv ? foiz(x.dv, 2) : "—"}</td><td>{foiz(x.yalpi)}</td>
          <td><HolatBelgi L={L} holat={x.h} kichik /></td></tr>)}</tbody></table></div>
      {qatorlar.length > f.soni && <button className="tr-btn2" style={{ alignSelf: "center" }} onClick={() => set({ soni: f.soni + 50 })}>{tr(L, "yana")}</button>}
    </section>
  </div>;
}

// ── Solishtirish ──────────────────────────────────────────────────────────
function useKompaniyalar(syms) {
  const [m, setM] = useState({});
  useEffect(() => { syms.forEach(s => { if (m[s] || KESH["c:" + s]) { if (!m[s]) setM(p => ({ ...p, [s]: KESH["c:" + s] })); return; }
    olish("/api/terminal?a=company&sym=" + s).then(({ j }) => { KESH["c:" + s] = j; setM(p => ({ ...p, [s]: j })); }).catch(() => setM(p => ({ ...p, [s]: { xato: 1 } }))); }); }, [syms.join(",")]);
  return m;
}
function Solishtirish({ L, boshlang }) {
  const [syms, setSyms] = useState(boshlang && boshlang.length ? boshlang.slice(0, 4) : ["AAPL", "MSFT", "NVDA"]);
  const [inp, setInp] = useState("");
  const m = useKompaniyalar(syms);
  const qosh = () => { const s = inp.trim().toUpperCase().replace(/[^A-Z.\-]/g, ""); if (s && !syms.includes(s) && syms.length < 4) setSyms([...syms, s]); setInp(""); };
  const tayyor = syms.map(s => m[s]).filter(x => x && !x.xato && !x.topilmadi);
  // 1 yillik natija, foizda
  const chiz = syms.map((s, i) => { const p = m[s]?.narx?.nuqtalar || []; if (p.length < 2) return null; const b = p[0].c; return { s, c: R.rang[i], v: p.map(x => (x.c / b - 1) * 100) }; }).filter(Boolean);
  const all = chiz.flatMap(x => x.v), mn = Math.min(0, ...all), mx = Math.max(1, ...all);
  const Y = v => 210 - (v - mn) / (mx - mn || 1) * 200;
  const MET = [["pe", x => x.kompaniya?.data?.pe, -1, v => fx(v, 1)], ["ps", x => x.kompaniya?.data?.ps, -1, v => fx(v, 1)], ["ev", x => x.kompaniya?.data?.ev_ebitda, -1, v => fx(v, 1)],
    ["osish", x => x.kompaniya?.data?.osish, 1, foiz], ["yalpi", x => x.kompaniya?.data?.yalpi, 1, foiz], ["marja", x => x.kompaniya?.data?.marja, 1, foiz], ["roe", x => x.kompaniya?.data?.roe, 1, foiz],
    ["div", x => x.kompaniya?.data?.dividend || null, 1, v => foiz(v, 2)], ["kap", x => x.kompaniya?.data?.kapitalizatsiya, 1, katta],
    ["natija1y", x => { const p = x.narx?.nuqtalar || []; return p.length > 1 ? p.at(-1).c / p[0].c - 1 : null; }, 1, foiz]];
  return <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {syms.map((s, i) => <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 38, padding: "0 6px 0 12px", borderRadius: 10, border: `1px solid ${R.line2}`, fontWeight: 700 }}>
        <span style={{ width: 9, height: 9, borderRadius: 5, background: R.rang[i] }} />{s}
        <button aria-label={tr(L, "olib") + " " + s} onClick={() => syms.length > 1 && setSyms(syms.filter(x => x !== s))} className="tr-x">×</button></span>)}
      {syms.length < 4 && <form onSubmit={e => { e.preventDefault(); qosh(); }} style={{ display: "flex", gap: 6 }}>
        <input value={inp} onChange={e => setInp(e.target.value)} placeholder={tr(L, "solQosh")} aria-label={tr(L, "solQosh")} className="tr-input" style={{ width: 140 }} />
        <button className="tr-btn2" type="submit">{tr(L, "qosh")}</button></form>}
      <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "max4")}</span>
    </div>
    <section style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
      <h2 style={h2}>{tr(L, "natija1y")}</h2>
      {chiz.length ? <svg viewBox="0 0 800 220" width="100%" height="240" preserveAspectRatio="none" role="img" aria-label={tr(L, "natija1y")}>
        <line x1="0" x2="800" y1={Y(0)} y2={Y(0)} stroke={R.zero} strokeDasharray="4 6" />
        {chiz.map(x => <path key={x.s} d={x.v.map((v, k) => (k ? "L" : "M") + (k * 800 / (x.v.length - 1)).toFixed(1) + " " + Y(v).toFixed(1)).join(" ")} fill="none" stroke={x.c} strokeWidth="2.2" />)}
      </svg> : <Yuk L={L} />}
    </section>
    <section style={{ ...card, overflowX: "auto" }}>
      <table className="tr-jadval" style={{ minWidth: 560 }}>
        <thead><tr><th scope="col" style={{ textAlign: "start" }}>{tr(L, "korsatkich")}</th>{syms.map((s, i) => <th key={s} scope="col" style={{ color: R.rang[i], fontFamily: "Sora, sans-serif" }}>{s}</th>)}</tr></thead>
        <tbody>{MET.map(([k, ol, yon, fmt]) => { const v = syms.map(s => (m[s] && !m[s].xato ? n(ol(m[s])) : null)); const ok = v.filter(x => x != null && (yon > 0 || x > 0));
          const eng = ok.length > 1 ? (yon > 0 ? Math.max(...ok) : Math.min(...ok)) : null;
          return <tr key={k}><th scope="row" style={{ textAlign: "start", color: R.dim }}>{tr(L, k)}</th>
            {v.map((x, i) => <td key={i} style={x != null && x === eng ? { background: R.greenBg, color: R.green, fontWeight: 800 } : { fontWeight: 600 }}>{x == null ? (m[syms[i]] ? "—" : "…") : fmt(x)}</td>)}</tr>; })}</tbody>
      </table>
      <p style={{ margin: "12px 0 0", fontSize: 12, color: R.faint }}>{tr(L, "engYaxshi")}</p>
    </section>
  </div>;
}

// ── Botni ulash oynasi ────────────────────────────────────────────────────
function UlashOyna({ L, ulash, yop }) {
  const [kod, setKod] = useState(""), [band, setBand] = useState(false), [xabar, setXabar] = useState(null);
  const inp = useRef(null);
  useEffect(() => { inp.current?.focus(); const f = e => { if (e.key === "Escape") yop(); }; window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, []);
  const yubor = async e => { e.preventDefault(); if (kod.length !== 6 || band) return; setBand(true); setXabar(null);
    try { const r = await ulash(kod); if (r && r.ok) { setXabar({ ok: true, m: tr(L, "ulashOk") + (r.tarif ? " · " + String(r.tarif).toUpperCase() : "") }); setTimeout(yop, 1200); }
      else setXabar({ ok: false, m: tr(L, r && r.xato === "kop" ? "kop" : "kodXato") }); }
    catch (er) { setXabar({ ok: false, m: tr(L, "xato") }); }
    setBand(false); };
  return <div role="dialog" aria-modal="true" aria-labelledby="ulash-sar" onClick={e => { if (e.target === e.currentTarget) yop(); }}
    style={{ position: "fixed", inset: 0, background: R.backdrop, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <form onSubmit={yubor} style={{ ...card, width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 14, padding: 24 }}>
      <h2 id="ulash-sar" style={{ ...h2, fontSize: 20 }}>{tr(L, "ulashSar")}</h2>
      <p style={{ margin: 0, color: R.dim, lineHeight: 1.6, fontSize: 14 }}>{tr(L, "ulashMat")}</p>
      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: R.faint }}>{tr(L, "kod")}
        <input ref={inp} value={kod} onChange={e => setKod(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code"
          className="tr-input" dir="ltr" style={{ height: 52, fontSize: 24, letterSpacing: "0.4em", textAlign: "center", fontFamily: "Sora, sans-serif", fontWeight: 700 }} /></label>
      {xabar && <span role="status" style={{ color: xabar.ok ? R.green : R.red, fontWeight: 700, fontSize: 14 }}>{xabar.m}</span>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="submit" className="tr-btn" disabled={kod.length !== 6 || band} style={{ flex: 1, opacity: kod.length === 6 ? 1 : 0.6 }}>{tr(L, "ulashTugma")}</button>
        <a href="https://t.me/savurabot?start=sayt" target="_blank" rel="noopener" className="tr-btn2">{tr(L, "botgaOt")}</a>
        <button type="button" className="tr-btn2" onClick={yop}>{tr(L, "yopish")}</button>
      </div>
    </form>
  </div>;
}

// ── Botdagi hisob: portfel, kuzatuv, demo savdo (app.savurainvest.com oynasi) ──
const ILOVA = "https://app.savurainvest.com/";
function IlovaBolim({ L, tab }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <span style={{ fontSize: 13, color: R.faint }}>{tr(L, "ilovaIzoh")}</span>
    <iframe key={tab} title={tr(L, tab)} src={ILOVA + "?tab=" + tab + "&lg=" + L}
      style={{ width: "100%", maxWidth: 520, height: "calc(100vh - 190px)", minHeight: 640, border: `1px solid ${R.line}`, borderRadius: 20, background: R.card, alignSelf: "center" }}
      allow="clipboard-write" />
  </div>;
}

// ── Terminal qobig'i ──────────────────────────────────────────────────────
function tahlilYol(p) {
  const q = p.replace(/^\/terminal/i, "").split("/").filter(Boolean);
  if (!q.length) return { sahifa: "bozor" };
  const a = q[0].toLowerCase();
  if (a === "skaner") return { sahifa: "skaner" };
  if (a === "kalendar") return { sahifa: "kalendar" };
  if (a === "portfel" || a === "kuzatuv" || a === "savdo") return { sahifa: a };
  if (a === "solishtir" || a === "solishtirish") return { sahifa: "solish", syms: (q[1] || "").toUpperCase().split(",").filter(Boolean) };
  return { sahifa: "kompaniya", sym: q[0].toUpperCase().replace(/[^A-Z.\-]/g, ""), tab: BUYRUQ[(q[1] || "").toUpperCase()] };
}
function buyruq(s) {
  const p = s.trim().toUpperCase().split(/\s+/).filter(Boolean); if (!p.length) return null;
  if (p[0] === "SKANER" || p[0] === "SCREEN") return "/terminal/skaner";
  if (p[0] === "BOZOR" || p[0] === "MARKET") return "/terminal";
  if (p[0] === "SOL" || p[0] === "COMP") return "/terminal/solishtir/" + p.slice(1, 5).join(",");
  return "/terminal/" + p[0].replace(/[^A-Z.\-]/g, "") + (p[1] && BUYRUQ[p[1]] ? "/" + p[1] : "");
}

export default function Terminal({ kirish = { holat: "ok" }, token = "", ulash = null }) {
  TOKEN = token || "";
  const [tema, setTema] = useState(temaOl);
  Object.assign(R, tema === "light" ? KUN : TUN);
  useEffect(() => { try { localStorage.setItem("savura_theme", tema); } catch (e) {} document.body.style.background = R.bg;
    const mt = document.querySelector('meta[name="theme-color"]'); if (mt) mt.setAttribute("content", R.bg); }, [tema]);
  const [ulashOchiq, setUlashOchiq] = useState(() => { try { return new URLSearchParams(window.location.search).get("ulash") === "1"; } catch (e) { return false; } });
  const ulashOch = ulash ? () => setUlashOchiq(true) : null;
  const [p, setP] = useState(yol());
  const [L, setL] = useState(() => { try { return localStorage.getItem("savura_til") || "uz"; } catch (e) { return "uz"; } });
  const [q, setQ] = useState("");
  const inp = useRef(null);
  useEffect(() => { const f = () => setP(yol()); window.addEventListener("popstate", f); return () => window.removeEventListener("popstate", f); }, []);
  useEffect(() => { const f = e => { if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") { e.preventDefault(); inp.current?.focus(); } };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, []);
  useEffect(() => { try { localStorage.setItem("savura_til", L); } catch (e) {} document.documentElement.lang = L; }, [L]);
  const y = tahlilYol(p);
  useEffect(() => { document.title = (y.sym ? y.sym + " — " : "") + "Savura Terminal"; }, [p]);
  const nav = [["bozor", "/terminal"], ["skaner", "/terminal/skaner"], ["solish", "/terminal/solishtir"], ["kalendar", "/terminal/kalendar"]];
  const nav2 = [["portfel", "/terminal/portfel"], ["kuzatuv", "/terminal/kuzatuv"], ["savdo", "/terminal/savdo"]];
  return <div dir={L === "ar" ? "rtl" : "ltr"} className="tr-ildiz" style={{ minHeight: "100vh", background: R.bg, backgroundImage: `linear-gradient(${R.grid}66 1px, transparent 1px), linear-gradient(90deg, ${R.grid}66 1px, transparent 1px)`, backgroundSize: "56px 56px", color: R.text, fontFamily: "Manrope, system-ui, sans-serif", fontVariantNumeric: "tabular-nums" }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
      body{margin:0;background:${R.bg}} .tr-ildiz a{text-decoration:none}
      .tr-nav{flex:1 1 190px;max-width:230px;box-sizing:border-box;padding:16px 12px;display:flex;flex-direction:column;gap:2px}
      .tr-nav-ajr{height:1px;background:${R.line};margin:10px 8px}
      @media(max-width:760px){.tr-nav{flex:1 1 100%;max-width:none;flex-direction:row;overflow-x:auto;padding:8px 12px;border-bottom:1px solid ${R.line}}.tr-nav a{white-space:nowrap}.tr-nav-ajr{width:1px;height:auto;margin:6px 4px}}
      .tr-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:12px;background:${R.blue};color:#fff;font-weight:700;font-size:14px;border:0;cursor:pointer;text-decoration:none}
      .tr-btn2{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 16px;border-radius:11px;background:transparent;color:${R.text};font-weight:700;font-size:14px;border:1px solid ${R.line2};cursor:pointer;text-decoration:none}
      .tr-btn:hover{filter:brightness(1.08)} .tr-btn2:hover{border-color:${R.blueLt}}
      .tr-chip{cursor:pointer;font-family:inherit}
      @keyframes trOqim{0%{background-position:0% 30%}50%{background-position:100% 70%}100%{background-position:0% 30%}}
      @keyframes trLenta{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      .tr-hero{position:relative;overflow:hidden;border-radius:24px;border:1px solid ${R.line};
        background:linear-gradient(120deg, ${R.greenBg} 0%, ${R.card} 35%, ${R.bg2} 55%, ${R.greenBg} 75%, ${R.card} 100%);background-size:260% 260%;animation:trOqim 22s ease-in-out infinite}
      .tr-hero::before{content:"";position:absolute;inset:0;pointer-events:none;
        background:radial-gradient(520px 220px at 12% 0%, ${R.up}2e, transparent 70%), radial-gradient(420px 200px at 92% 100%, ${R.amber}24, transparent 70%)}
      .tr-hero > *{position:relative}
      .tr-hero-ind{display:flex;gap:10px;flex-wrap:wrap}
      @media(max-width:640px){.tr-hero-ind{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:100%}.tr-tel-yoq{display:none}}
      .tr-shisha{display:flex;flex-direction:column;gap:2px;min-width:118px;padding:10px 14px;border-radius:14px;background:${R.card}cc;border:1px solid ${R.line};backdrop-filter:blur(6px)}
      .tr-lenta-oyna{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
      .tr-lenta{display:flex;gap:10px;width:max-content;animation:trLenta 70s linear infinite}
      .tr-lenta.teskari{animation-direction:reverse;animation-duration:85s}
      .tr-lenta-oyna:hover .tr-lenta{animation-play-state:paused}
      .tr-lchip{display:inline-flex;align-items:center;gap:9px;padding:7px 12px 7px 8px;border-radius:999px;background:${R.card}e6;border:1px solid ${R.line};color:${R.text};font-size:13.5px;white-space:nowrap;transition:border-color .2s,transform .2s}
      .tr-lchip:hover{border-color:${R.up};transform:translateY(-2px)}
      .tr-makro{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:14px;background:linear-gradient(160deg, ${R.card}, ${R.bg2});border:1px solid ${R.line}}
      @media (prefers-reduced-motion: reduce){.tr-hero,.tr-lenta{animation:none}.tr-lenta-oyna{overflow-x:auto}}
      .tr-kat{display:flex;align-items:center;gap:10px;min-height:40px;padding:0 12px;border-radius:11px;border:1px solid transparent;color:${R.text};font:inherit;font-size:14px;cursor:pointer} .tr-tab{min-height:44px;padding:0 14px;background:transparent;border:0;font:inherit;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:-1px;white-space:nowrap}
      .tr-qator{display:flex;align-items:center;gap:12px;padding:9px 4px;border-bottom:1px solid ${R.line};font-size:14px;color:${R.text};text-decoration:none}
      .tr-qator:hover{background:${R.hover}}
      .tr-jadval{width:100%;border-collapse:collapse;font-size:13.5px} .tr-jadval th,.tr-jadval td{padding:9px 8px;text-align:end;border-top:1px solid ${R.line}} .tr-jadval thead th{color:${R.faint};font-weight:600;border-top:0}
      .tr-sort{background:transparent;border:0;font:inherit;font-weight:700;cursor:pointer;padding:4px 0;min-height:32px}
      .tr-input{height:40px;border-radius:10px;border:1px solid ${R.line2};background:${R.input};color:${R.text};padding:0 10px;font:inherit;font-size:14px}
      .tr-check{display:flex;align-items:center;gap:10px;font-size:14px;min-height:36px;cursor:pointer} .tr-check input{width:18px;height:18px;accent-color:${R.up}}
      input[type=range]{accent-color:${R.blue};width:100%}
      .tr-x{width:28px;height:28px;border-radius:7px;border:0;background:transparent;color:${R.faint};font-size:18px;cursor:pointer}
      .tr-xarita{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-auto-rows:58px;gap:4px;grid-auto-flow:dense}
      @media(max-width:640px){.tr-xarita{grid-template-columns:repeat(6,minmax(0,1fr))}}
      .tr-spin{width:16px;height:16px;border-radius:50%;border:2px solid ${R.line2};border-top-color:${R.blueLt};animation:trs 0.8s linear infinite;display:inline-block}
      @keyframes trs{to{transform:rotate(360deg)}}
      a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid ${R.blueLt};outline-offset:2px}
      @media (prefers-reduced-motion: reduce){.tr-spin{animation-duration:3s}}
      .tr-uy{transition:border-color .15s,background .15s}.tr-uy:hover{border-color:${R.blueLt}}
      @media (max-width: 560px){.tr-uy{padding:0 11px!important}.tr-uy-y{display:none}}
    `}</style>
    <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: `1px solid ${R.line}`, background: R.bg2, position: "sticky", top: 0, zIndex: 20 }}>
      <a href="/" className="tr-uy" aria-label={tr(L, "bosh")} title={tr(L, "bosh")}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", borderRadius: 11, border: `1px solid ${R.line2}`, background: R.card, color: R.text, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h5v-6h4v6h5V9.5" /></svg>
        <span className="tr-uy-y">{tr(L, "bosh")}</span></a>
      <a href="/terminal" onClick={e => { e.preventDefault(); ot("/terminal"); }} style={{ display: "flex", alignItems: "center", gap: 10, color: R.text, textDecoration: "none" }}>
        <svg width="34" height="34" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="tlB" x1="20" y1="15" x2="85" y2="60" gradientUnits="userSpaceOnUse"><stop stopColor="#127A4C" /><stop offset="1" stopColor="#2BC27D" /></linearGradient><linearGradient id="tlG" x1="30" y1="55" x2="80" y2="92" gradientUnits="userSpaceOnUse"><stop stopColor="#5FE3A8" /><stop offset="1" stopColor="#1E9E66" /></linearGradient></defs><path d="M70 16 C40 16 24 30 24 47 C24 60 35 66 47 60 C36 62 33 52 41 45 C49 38 64 40 70 30 C73 24 73 18 70 16 Z" fill="url(#tlB)" /><path d="M30 84 C60 84 76 70 76 53 C76 40 65 34 53 40 C64 38 67 48 59 55 C51 62 36 60 30 70 C27 76 27 82 30 84 Z" fill="url(#tlG)" /><path d="M40 62 L62 47 L57 44 L66 40 L67 51 L62 49 L43 66 Z" fill="#E2B65C" /></svg>
        <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 17 }}>Savura Terminal</span></a>
      <form role="search" onSubmit={e => { e.preventDefault(); const u = buyruq(q); if (u) { ot(u); setQ(""); inp.current?.blur(); } }}
        style={{ flex: "1 1 320px", display: "flex", alignItems: "center", gap: 10, height: 42, borderRadius: 12, background: R.card, border: `1px solid ${R.line2}`, padding: "0 12px" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={R.faint} strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
        <input ref={inp} value={q} onChange={e => setQ(e.target.value)} placeholder={tr(L, "qidir")} aria-label={tr(L, "qidir")}
          style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, color: R.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
        <kbd style={{ fontSize: 12, color: R.faint, border: `1px solid ${R.line2}`, borderRadius: 6, padding: "1px 7px", fontFamily: "inherit" }}>/</kbd>
      </form>
      <div role="group" aria-label="Til" style={{ display: "flex", gap: 2, background: R.card, border: `1px solid ${R.line2}`, borderRadius: 10, padding: 3 }}>
        {TILLAR.map(([k, nm]) => <button key={k} onClick={() => setL(k)} aria-pressed={L === k} lang={k}
          style={{ minWidth: 38, minHeight: 32, borderRadius: 7, border: 0, fontSize: 13, fontWeight: 700, cursor: "pointer", background: L === k ? R.line2 : "transparent", color: L === k ? R.text : R.faint }}>{nm}</button>)}
      </div>
      <button onClick={() => setTema(tema === "light" ? "dark" : "light")} aria-label={tr(L, "tema")} title={tr(L, "tema")}
        style={{ width: 40, height: 40, borderRadius: 11, border: `1px solid ${R.line2}`, background: R.card, color: R.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {tema === "light"
          ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
          : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>}
      </button>
      {kirish.holat === "sinov" && <span style={{ fontSize: 12, fontWeight: 700, color: R.amber, border: `1px solid ${R.amberLine}`, borderRadius: 999, padding: "5px 10px" }}>{tr(L, "sinov", { n: kirish.qoldi })}</span>}
      {kirish.bot && kirish.tarif && kirish.tarif !== "bepul" && <span style={{ fontSize: 12, fontWeight: 700, color: R.green, border: `1px solid ${R.greenLine}`, borderRadius: 999, padding: "5px 10px" }}>{tr(L, "botBor", { t: String(kirish.tarif).toUpperCase() })}</span>}
      {ulash && !kirish.bot && kirish.holat !== "yuk" && <button className="tr-btn2" onClick={ulashOch}>{tr(L, "ulash")}</button>}
      {kirish.holat === "mehmon" && <a href="/?p=auth&keyin=/terminal" onClick={() => { try { sessionStorage.setItem("savura_keyin", window.location.pathname); } catch (e) {} }} className="tr-btn2">{tr(L, "kirish")}</a>}
    </header>
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start" }}>
      <nav aria-label="Terminal" className="tr-nav">
        {nav.map(([k, u]) => { const on = y.sahifa === k || (k === "bozor" && y.sahifa === "kompaniya" && false);
          return <a key={k} href={u} aria-current={on ? "page" : undefined} onClick={e => { e.preventDefault(); ot(u); }}
            style={{ padding: "10px 12px", borderRadius: 10, fontSize: 14, fontWeight: on ? 800 : 600, textDecoration: "none", background: on ? R.sel : "transparent", color: on ? R.blueLt : R.dim }}>{tr(L, k)}</a>; })}
        <span className="tr-nav-ajr" />
        {nav2.map(([k, u]) => { const on = y.sahifa === k;
          return <a key={k} href={u} aria-current={on ? "page" : undefined} onClick={e => { e.preventDefault(); ot(u); }}
            style={{ padding: "10px 12px", borderRadius: 10, fontSize: 14, fontWeight: on ? 800 : 600, textDecoration: "none", background: on ? R.sel : "transparent", color: on ? R.blueLt : R.dim }}>{tr(L, k)}</a>; })}
        <span className="tr-nav-ajr" />
        <a href="/" style={{ padding: "10px 12px", borderRadius: 10, fontSize: 14, color: R.dim, textDecoration: "none" }}>{tr(L, "bosh")}</a>
        <a href="https://t.me/savurabot" target="_blank" rel="noopener" style={{ padding: "10px 12px", borderRadius: 10, fontSize: 14, color: R.dim, textDecoration: "none" }}>@savurabot</a>
      </nav>
      <main style={{ flex: "999 1 560px", minWidth: 0, boxSizing: "border-box", padding: "18px 20px 48px", display: "flex", flexDirection: "column", gap: 16 }}>
        {y.sahifa === "bozor" && <>
          <Bozor L={L} />
          <span style={{ fontSize: 12, color: R.faint }}>{tr(L, "kech")}</span></>}
        {y.sahifa === "kalendar" && <><h1 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: 26, fontWeight: 700 }}>{tr(L, "kalendar")}</h1>
          <KalendarQism L={L} toliq /></>}
        {(y.sahifa === "portfel" || y.sahifa === "kuzatuv" || y.sahifa === "savdo") && <><h1 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: 26, fontWeight: 700 }}>{tr(L, y.sahifa)}</h1>
          <IlovaBolim L={L} tab={y.sahifa} /></>}
        {y.sahifa === "kompaniya" && <Darvoza L={L} kirish={kirish} ulashOch={ulashOch}><Kompaniya key={y.sym} L={L} sym={y.sym} tab0={y.tab} /></Darvoza>}
        {y.sahifa === "skaner" && <><h1 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: 26, fontWeight: 700 }}>{tr(L, "skaner")}</h1>
          <Darvoza L={L} kirish={kirish} ulashOch={ulashOch}><Skaner L={L} /></Darvoza></>}
        {y.sahifa === "solish" && <><h1 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: 26, fontWeight: 700 }}>{tr(L, "solish")}</h1>
          <Darvoza L={L} kirish={kirish} ulashOch={ulashOch}><Solishtirish L={L} boshlang={y.syms} /></Darvoza></>}
      </main>
    </div>
    {ulashOchiq && ulash && <UlashOyna L={L} ulash={ulash} yop={() => { setUlashOchiq(false); try { const u = new URL(window.location.href); if (u.searchParams.has("ulash")) { u.searchParams.delete("ulash"); window.history.replaceState({}, "", u.pathname + u.search); } } catch (e) {} }} />}
  </div>;
}
