// savurainvest.com/admin — bot va sayt uchun yagona boshqaruv paneli.
// O'qish: Supabase (faqat is_admin). Bot amallari: admin_amal navbati -> bot ~6 soniyada bajaradi.
import React, { useEffect, useMemo, useState, useCallback } from "react";

const TUN = { bg: "#06140F", side: "#081A13", card: "#0C1F18", card2: "#12291F", line: "#1C3A2D", line2: "#2A4D3E", text: "#E8F1EA", dim: "#C2D6CA", faint: "#9DBBAB", mint: "#4BE0A0", brand: "#178A56", green: "#2BC27D", gold: "#E2B65C", red: "#F2766A", goldBg: "#2E2610", goldLine: "#6B5320", redBg: "#2E1412", redLine: "#6B2A25", greenBg: "#0F2E21", greenLine: "#22553F" };
const KUN = { bg: "#F4F6EF", side: "#ECF1E7", card: "#FFFFFF", card2: "#F4F6EF", line: "#DCE4D6", line2: "#C3D0BE", text: "#0E2118", dim: "#2F4A3C", faint: "#46604F", mint: "#0E7C4A", brand: "#127A4C", green: "#159A5C", gold: "#9A6B12", red: "#C4382E", goldBg: "#FBF3E0", goldLine: "#E3CB8F", redBg: "#FBE9E7", redLine: "#EDB5AE", greenBg: "#E2F3E8", greenLine: "#B5DDC4" };
const P = { ...TUN };
const TARIF_NOM = { start: "Start", pro: "Pro", shogird: "Shogird", bepul: "Bepul", sayt: "Sayt o'quvchi", sinov: "Sinov", blok: "Bloklangan" };
const BOT_PANEL = "https://app.savurainvest.com/admin";

const som = x => Math.round(+x || 0).toLocaleString("ru-RU").replace(/,/g, " ");
const summaYoz = (x, v) => v === "UZS" ? som(x) + " so'm" : v === "USDT" ? (+x) + " USDT" : v === "XTR" ? som(x) + " Stars" : som(x) + " " + (v || "");
const UZ_OY = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const sana = d => { if (!d) return "—"; const t = new Date(d); return isNaN(t) ? "—" : t.getDate() + "-" + UZ_OY[t.getMonth()] + (t.getFullYear() !== new Date().getFullYear() ? " " + t.getFullYear() : ""); };
const oldin = d => { if (!d) return "—"; const s = (Date.now() - new Date(d)) / 1000; if (s < 90) return "hozir"; if (s < 3600) return Math.round(s / 60) + " daqiqa oldin"; if (s < 86400) return Math.round(s / 3600) + " soat oldin"; return Math.round(s / 86400) + " kun oldin"; };
const pastga = id => { if (window.innerWidth < 980) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); };
const kunQoldi = d => d ? Math.ceil((new Date(d) - Date.now()) / 864e5) : null;

async function hammasi(sb, jadval, select, order) {
  const out = [];
  for (let i = 0; i < 20; i++) {
    let q = sb.from(jadval).select(select).range(i * 1000, i * 1000 + 999);
    if (order) q = q.order(order, { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    out.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

// ── Umumiy kichik bo'laklar ──────────────────────────────────────────────
const karta = () => ({ borderRadius: 18, background: P.card, border: `1px solid ${P.line}`, padding: 20, boxSizing: "border-box" });
const h2 = { margin: 0, fontFamily: "Sora, sans-serif", fontSize: 18, fontWeight: 700 };
function Tugma({ turi = "ikkinchi", children, ...p }) {
  const s = { primary: { background: P.brand, color: "#fff", border: 0 }, ikkinchi: { background: "transparent", color: P.text, border: `1px solid ${P.line2}` },
    oltin: { background: "transparent", color: P.gold, border: `1px solid ${P.goldLine}` }, qizil: { background: "transparent", color: P.red, border: `1px solid ${P.redLine}` } }[turi];
  return <button {...p} className="ad-btn" style={{ minHeight: 44, padding: "0 14px", borderRadius: 12, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: p.disabled ? "default" : "pointer", opacity: p.disabled ? .55 : 1, ...s, ...(p.style || {}) }}>{children}</button>;
}
function Chip({ on, children, ...p }) {
  return <button {...p} aria-pressed={on} className="ad-btn" style={{ minHeight: 38, padding: "0 14px", borderRadius: 999, fontFamily: "inherit", fontWeight: 700, fontSize: 13.5, cursor: "pointer", border: `1px solid ${on ? P.brand : P.line2}`, background: on ? P.brand : "transparent", color: on ? "#fff" : P.dim }}>{children}</button>;
}
function TarifBelgi({ t }) {
  const r = { pro: [P.green, P.greenBg], start: [P.mint, P.greenBg], shogird: [P.gold, P.goldBg], sayt: [P.gold, P.goldBg], blok: [P.red, P.redBg] }[t] || [P.faint, P.card2];
  return <span style={{ display: "inline-flex", padding: "4px 10px", borderRadius: 999, fontSize: 12.5, fontWeight: 800, color: r[0], background: r[1], whiteSpace: "nowrap" }}>{TARIF_NOM[t] || t}</span>;
}
const AI_R = () => ({ mos: ["summa mos", P.green, P.greenBg, P.greenLine], kam: ["summa kam", P.gold, P.goldBg, P.goldLine], shubha: ["tekshiring", P.red, P.redBg, P.redLine], aniq_emas: ["aniq emas", P.faint, P.card2, P.line2] });

// ── Ma'lumotlarni birlashtirish ─────────────────────────────────────────
function odamlarYig(obunachilar, talabalar, boglar) {
  const bogC = {}, bogU = {};
  boglar.forEach(b => { bogC[b.chat_id] = b.user_id; bogU[b.user_id] = b.chat_id; });
  const st = {}; talabalar.forEach(s => { st[s.id] = s; });
  const out = [];
  const saytHolat = s => {
    if (!s) return null;
    if (s.is_admin) return { tarif: "sayt", tugaydi: null, izoh: "admin" };
    if (s.approved && (!s.expires_at || new Date(s.expires_at) > new Date())) return { tarif: "sayt", tugaydi: s.expires_at };
    if (!s.approved && (Date.now() - new Date(s.created_at)) < 3 * 864e5) return { tarif: "sinov", tugaydi: new Date(new Date(s.created_at).getTime() + 3 * 864e5).toISOString() };
    return null;
  };
  obunachilar.forEach(o => {
    const s = st[bogC[o.chat_id]];
    const botFaol = o.faol && o.tarif && o.tarif !== "bepul";
    const sh = saytHolat(s);
    out.push({ key: "b" + o.chat_id, chat_id: o.chat_id, user_id: s?.id || null, ism: o.ism || s?.full_name || String(o.chat_id),
      username: o.username, email: s?.email || "", ulanish: s ? "Bot va sayt" : "Bot",
      tarif: botFaol ? o.tarif : (sh?.tarif || "bepul"), tugaydi: botFaol ? o.tugaydi : (sh?.tugaydi || null),
      manba: o.manba || (s ? "sayt" : ""), holat: o.holat, til: o.til, botTarif: botFaol ? o.tarif : null, talaba: s || null });
  });
  talabalar.forEach(s => {
    if (bogU[s.id]) return;
    const sh = saytHolat(s);
    out.push({ key: "s" + s.id, chat_id: null, user_id: s.id, ism: s.full_name || s.email, username: "", email: s.email, ulanish: "Sayt",
      tarif: sh?.tarif || "bepul", tugaydi: sh?.tugaydi || null, manba: "sayt", holat: s.approved ? "faol" : "kutmoqda", talaba: s, botTarif: null });
  });
  return out;
}

// ── Asosiy komponent ────────────────────────────────────────────────────
export default function Admin({ sb, ism }) {
  const [tema, setTema] = useState(() => { try { return localStorage.getItem("savura_theme") || "dark"; } catch (e) { return "dark"; } });
  Object.assign(P, tema === "light" ? KUN : TUN);
  const [bolim, setBolim] = useState(() => (new URLSearchParams(window.location.search).get("b")) || "bosh");
  const [d, setD] = useState(null);
  const [xato, setXato] = useState("");
  const [toast, setToast] = useState("");
  const [qidir, setQidir] = useState("");
  const [tfa, setTfa] = useState(null);   // Telegram kodi bilan tasdiq holati
  useEffect(() => { sb.rpc("admin_2fa_holat").then(({ data }) => setTfa(data && data.ok ? data : { ok: false })); }, [sb]);

  const yukla = useCallback(async () => {
    try {
      const [ob, tal, bog, tol, stat, narx] = await Promise.all([
        hammasi(sb, "bot_obunachilar", "chat_id,ism,username,til,tarif,holat,boshlangan,tugaydi,manba,faol,yangilandi"),
        hammasi(sb, "students", "id,email,full_name,approved,expires_at,created_at,is_admin"),
        hammasi(sb, "sayt_bog", "user_id,chat_id"),
        sb.from("bot_tolovlar").select("*").order("id", { ascending: false }).limit(600).then(r => { if (r.error) throw r.error; return r.data; }),
        sb.from("bot_statistika").select("*").order("kun", { ascending: false }).limit(1).then(r => r.data?.[0] || null),
        sb.from("terminal_narx").select("yangilandi").order("yangilandi", { ascending: false }).limit(1).then(r => r.data?.[0]?.yangilandi || null)]);
      setD({ ob, tal, bog, tol, stat, narx, odam: odamlarYig(ob, tal, bog), vaqt: Date.now() });
      setXato("");
    } catch (e) { setXato(String(e.message || e)); }
  }, [sb]);
  useEffect(() => { yukla(); const t = setInterval(yukla, 60000); return () => clearInterval(t); }, [yukla]);
  useEffect(() => { try { localStorage.setItem("savura_theme", tema); } catch (e) {} }, [tema]);
  const ot = b => { setBolim(b); try { history.replaceState(null, "", "/admin" + (b === "bosh" ? "" : "?b=" + b)); } catch (e) {} window.scrollTo(0, 0); };
  const xabar = m => { setToast(m); setTimeout(() => setToast(""), 3500); };

  // Bot amali: navbatga yozish va natijani kutish
  const amal = useCallback(async (turi, data, okMatn) => {
    const { data: r, error } = await sb.from("admin_amal").insert({ turi, data }).select("id").single();
    if (error) { xabar("Xato: " + error.message); return null; }
    xabar("Botga yuborildi…");
    for (let i = 0; i < 25; i++) {
      await new Promise(f => setTimeout(f, 2000));
      const { data: a } = await sb.from("admin_amal").select("holat,natija").eq("id", r.id).single();
      if (a && (a.holat === "bajarildi" || a.holat === "xato")) {
        xabar(a.holat === "bajarildi" ? (okMatn || "Bajarildi") : "Bajarilmadi: " + (a.natija?.xato || a.natija?.sabab || "xato"));
        await yukla();
        return a;
      }
    }
    xabar("Bot hali javob bermadi — bir daqiqadan keyin yangilang");
    return null;
  }, [sb, yukla]);

  // Bot admin API (kodlar, sozlamalar, xabarlar...): natijani to'liq qaytaradi
  const botApi = useCallback(async (nom, dd) => {
    const { data: r, error } = await sb.from("admin_amal").insert({ turi: "api", data: { amal: nom, d: dd || {} } }).select("id").single();
    if (error) return { ok: false, xato: error.message };
    for (let i = 0; i < 40; i++) {
      await new Promise(f => setTimeout(f, i < 5 ? 1000 : 2000));
      const { data: a } = await sb.from("admin_amal").select("holat,natija").eq("id", r.id).single();
      if (a && (a.holat === "bajarildi" || a.holat === "xato")) return a.natija?.toliq || a.natija || { ok: false };
    }
    return { ok: false, xato: "bot javob bermadi" };
  }, [sb]);

  const kutTolov = d ? d.tol.filter(t => t.holat === "kutilmoqda").length : 0;
  const murSon = d?.stat?.malumot?.murojaat_7kun || 0;
  const nav = [["bosh", "Bosh sahifa"], ["odamlar", "Foydalanuvchilar"], ["tolov", "To'lovlar", kutTolov], ["tarif", "Tariflar va to'lov"],
    ["kod", "Kirish kodlari"], ["xabar", "Ommaviy xabar"], ["murojaat", "Murojaatlar", murSon], ["jurnal", "Jurnal"]];
  if (tfa && !tfa.ok) return <TfaEkran sb={sb} tayyor={g => setTfa({ ok: true, gacha: g })} />;

  return <div style={{ minHeight: "100vh", background: P.bg, color: P.text, fontFamily: "Manrope, system-ui, sans-serif", display: "flex", flexWrap: "wrap", alignItems: "stretch" }}>
    <style>{`
      .ad-btn{transition:filter .15s,border-color .15s}.ad-btn:hover{filter:brightness(1.08)}
      .ad-btn:focus-visible,.ad-q:focus-visible,.ad-nav:focus-visible{outline:2px solid ${P.mint};outline-offset:2px}
      .ad-qator{cursor:pointer}.ad-qator:hover{background:${P.card2}}
      .ad-side{flex:1 1 232px;max-width:260px}
      @media (max-width: 860px){.ad-side{max-width:none;flex-basis:100%}.ad-navlar{flex-direction:row!important;flex-wrap:wrap}.ad-pastki{display:none!important}}
    `}</style>
    <nav aria-label="Admin" className="ad-side" style={{ boxSizing: "border-box", padding: "22px 14px", borderRight: `1px solid ${P.line}`, background: P.side, display: "flex", flexDirection: "column", gap: 4 }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 16px", color: P.text, textDecoration: "none" }}>
        <svg width="30" height="30" viewBox="0 0 100 100" aria-hidden="true"><path d="M70 16 C40 16 24 30 24 47 C24 60 35 66 47 60 C36 62 33 52 41 45 C49 38 64 40 70 30 C73 24 73 18 70 16 Z" fill="#2BC27D" /><path d="M30 84 C60 84 76 70 76 53 C76 40 65 34 53 40 C64 38 67 48 59 55 C51 62 36 60 30 70 C27 76 27 82 30 84 Z" fill="#5FE3A8" /><path d="M40 62 L62 47 L57 44 L66 40 L67 51 L62 49 L43 66 Z" fill="#E2B65C" /></svg>
        <span style={{ display: "flex", flexDirection: "column" }}><b style={{ fontFamily: "Sora, sans-serif", fontSize: 16 }}>Savura</b><span style={{ fontSize: 12, color: P.faint }}>Boshqaruv paneli</span></span>
      </a>
      <div className="ad-navlar" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {nav.map(([k, nom, b]) => <button key={k} className="ad-nav" onClick={() => ot(k)} aria-current={bolim === k ? "page" : undefined}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 42, padding: "0 12px", borderRadius: 11, border: 0, fontFamily: "inherit", fontSize: 14, cursor: "pointer", textAlign: "left",
            fontWeight: bolim === k ? 800 : 600, background: bolim === k ? P.card2 : "transparent", color: bolim === k ? P.mint : P.dim }}>
          <span>{nom}</span>{b ? <span style={{ minWidth: 22, height: 22, borderRadius: 11, background: "#E2B65C", color: "#1A1405", fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{b}</span> : null}</button>)}
        <a href={BOT_PANEL} target="_blank" rel="noopener" className="ad-nav" style={{ display: "flex", alignItems: "center", minHeight: 42, padding: "0 12px", borderRadius: 11, fontSize: 14, fontWeight: 600, color: P.dim, textDecoration: "none" }}>Bot paneli ↗</a>
        <a href="/terminal" className="ad-nav" style={{ display: "flex", alignItems: "center", minHeight: 42, padding: "0 12px", borderRadius: 11, fontSize: 14, fontWeight: 600, color: P.dim, textDecoration: "none" }}>Terminal</a>
      </div>
      <div className="ad-pastki" style={{ marginTop: "auto", padding: "14px 10px 0", borderTop: `1px solid ${P.line}`, display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: P.dim }}>
        <span style={{ color: P.text, fontWeight: 700 }}>{ism || "Admin"}</span>
        <span>{d ? "Yangilandi: " + oldin(d.vaqt) : "Yuklanmoqda…"}</span>
      </div>
    </nav>

    <main style={{ flex: "999 1 560px", minWidth: 0, boxSizing: "border-box", padding: "26px clamp(16px, 3vw, 32px) 48px", display: "flex", flexDirection: "column", gap: 20 }}>
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0, flex: "1 1 260px", fontFamily: "Sora, sans-serif", fontSize: 26, fontWeight: 800 }}>{nav.find(n => n[0] === bolim)?.[1] || "Bosh sahifa"}</h1>
        <label style={{ display: "flex", alignItems: "center", gap: 8, height: 42, padding: "0 14px", borderRadius: 12, border: `1px solid ${P.line2}`, background: P.card, color: P.faint, flex: "0 1 340px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input className="ad-q" aria-label="Qidirish" value={qidir} onChange={e => { setQidir(e.target.value); if (e.target.value && bolim === "bosh") ot("odamlar"); }} placeholder="Ism, @username, email yoki ID"
            style={{ flex: 1, minWidth: 0, border: 0, background: "transparent", color: P.text, font: "inherit", fontSize: 14, outline: "none" }} />
        </label>
        <button onClick={yukla} className="ad-btn" aria-label="Yangilash" title="Yangilash" style={{ width: 42, height: 42, borderRadius: 12, border: `1px solid ${P.line2}`, background: P.card, color: P.text, cursor: "pointer" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" /></svg></button>
        <button onClick={() => setTema(tema === "light" ? "dark" : "light")} className="ad-btn" aria-label="Kun yoki tun rejimi" title="Kun / tun" style={{ width: 42, height: 42, borderRadius: 12, border: `1px solid ${P.line2}`, background: P.card, color: P.text, cursor: "pointer" }}>
          {tema === "light" ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
            : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" /></svg>}</button>
      </header>
      {xato && <div role="alert" style={{ ...karta(), borderColor: P.redLine, color: P.red }}>Ma'lumot yuklanmadi: {xato}</div>}
      {!d && !xato && <div style={{ ...karta(), color: P.faint }}>Yuklanmoqda…</div>}
      {d && bolim === "bosh" && <Bosh d={d} ot={ot} />}
      {d && bolim === "odamlar" && <Odamlar d={d} qidir={qidir} amal={amal} sb={sb} yukla={yukla} xabar={xabar} />}
      {d && bolim === "tolov" && <Tolovlar d={d} amal={amal} sb={sb} />}
      {bolim === "tarif" && <Sozlamalar botApi={botApi} xabar={xabar} />}
      {bolim === "kod" && <Kodlar botApi={botApi} xabar={xabar} />}
      {bolim === "xabar" && <Ommaviy botApi={botApi} xabar={xabar} />}
      {bolim === "murojaat" && <Murojaatlar botApi={botApi} amal={amal} />}
      {bolim === "jurnal" && <Jurnal botApi={botApi} />}
    </main>
    {toast && <div role="status" style={{ position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)", background: P.text, color: P.bg, padding: "12px 18px", borderRadius: 12, fontWeight: 700, fontSize: 14, zIndex: 50, maxWidth: "90vw" }}>{toast}</div>}
  </div>;
}

// ── Bosh sahifa ─────────────────────────────────────────────────────────
function Bosh({ d, ot }) {
  const s = d.stat?.malumot || {};
  const hozir = Date.now();
  const kut = d.tol.filter(t => t.holat === "kutilmoqda");
  const aiMos = kut.filter(t => t.ai_chek?.belgi === "mos").length;
  const faol = d.odam.filter(o => ["start", "pro", "shogird", "sayt"].includes(o.tarif));
  const tug7 = d.odam.filter(o => { const k = kunQoldi(o.tugaydi); return o.tarif !== "sinov" && o.tarif !== "bepul" && k != null && k >= 0 && k <= 7; });
  const tasdiq = d.tol.filter(t => t.holat === "tasdiqlandi" && t.korildi && hozir - new Date(t.korildi) < 30 * 864e5);
  const uzs = tasdiq.filter(t => t.valyuta === "UZS").reduce((a, t) => a + (+t.summa || 0), 0);
  const usdt = tasdiq.filter(t => t.valyuta === "USDT").reduce((a, t) => a + (+t.summa || 0), 0);
  const stars = tasdiq.filter(t => t.valyuta === "XTR").reduce((a, t) => a + (+t.summa || 0), 0);
  const kunlar = Array.from({ length: 30 }, (_, i) => { const k = new Date(hozir - (29 - i) * 864e5); k.setHours(0, 0, 0, 0); return { k: k.getTime(), v: 0 }; });
  tasdiq.forEach(t => { if (t.valyuta !== "UZS") return; const k = new Date(t.korildi); k.setHours(0, 0, 0, 0); const x = kunlar.find(z => z.k === k.getTime()); if (x) x.v += +t.summa || 0; });
  const mx = Math.max(1, ...kunlar.map(x => x.v));
  const yangiSayt = d.tal.filter(x => hozir - new Date(x.created_at) < 7 * 864e5).length;
  const kutTalaba = d.tal.filter(x => !x.approved && !x.is_admin).length;
  const tarifSon = ["pro", "start", "shogird", "sayt"].map(t => [t, faol.filter(o => o.tarif === t).length]);
  const tmx = Math.max(1, ...tarifSon.map(x => x[1]));
  const ai = s.ai || {};
  const od = s.odat || {};
  const DAR = [["boshlovchi", "Boshlovchi"], ["intizomli", "Intizomli"], ["savura", "Savura treyderi"], ["usta", "Usta"]];
  const dmx = Math.max(1, ...DAR.map(([k]) => (od.darajalar || {})[k] || 0));
  const KPI = ({ nom, q, izoh, rang }) => <div style={{ ...karta(), display: "flex", flexDirection: "column", gap: 8 }}>
    <span style={{ fontSize: 13, fontWeight: 700, color: P.dim }}>{nom}</span>
    <b style={{ fontFamily: "Sora, sans-serif", fontSize: 32, lineHeight: 1 }}>{q}</b>
    <span style={{ fontSize: 13, color: rang || P.dim }}>{izoh}</span></div>;
  const diqqat = [
    kut.length && { sar: `${kut.length} ta to'lov tekshirilmagan`, izoh: `Eng eskisi ${oldin(kut[kut.length - 1].yaratildi)}`, b: "tolov", r: P.gold },
    tug7.length && { sar: `${tug7.length} ta obuna 7 kunda tugaydi`, izoh: "Eslatma bot orqali avtomatik ketadi", b: "odamlar", r: P.mint },
    kutTalaba && { sar: `Saytda ${kutTalaba} kishi tasdiq kutyapti`, izoh: "Email bilan ro'yxatdan o'tgan", b: "odamlar", r: P.red },
    s.murojaat_7kun && { sar: `${s.murojaat_7kun} ta murojaat (7 kun)`, izoh: "Bot panelida javob berish mumkin", href: BOT_PANEL, r: P.mint }].filter(Boolean);
  const tizim = [["Bot sinxroni", d.stat ? oldin(d.stat.yangilandi) : "—"], ["Terminal narxlari", oldin(d.narx)],
    ["AI kaliti (bot)", ai.holat ? (ai.holat.ok ? "ishlayapti" : "xato") : "—"], ["Foydalanuvchilar", `${s.jami_user || d.ob.length} bot · ${d.tal.length} sayt`]];
  return <>
    <section aria-label="Ko'rsatkichlar" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
      <button onClick={() => ot("tolov")} className="ad-btn" style={{ textAlign: "left", fontFamily: "inherit", cursor: "pointer", borderRadius: 18, padding: 20, background: kut.length ? "linear-gradient(135deg, #3A2C0C, #1B1A0C)" : P.card, border: `1px solid ${kut.length ? "#6B5320" : P.line}`, color: kut.length ? "#F6E7C3" : P.text, display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: kut.length ? "#E2B65C" : P.dim }}>Tekshirilmagan to'lovlar</span>
        <b style={{ fontFamily: "Sora, sans-serif", fontSize: 38, lineHeight: 1 }}>{kut.length}</b>
        <span style={{ fontSize: 13 }}>{kut.length ? `AI: ${aiMos} tasi summa mos` : "Navbat bo'sh"}</span></button>
      <KPI nom="Faol obunalar" q={faol.length} izoh={`${tug7.length} tasi 7 kunda tugaydi`} />
      <KPI nom="30 kunlik tushum" q={som(uzs) + " so'm"} izoh={`${+usdt.toFixed(2)} USDT · ${som(stars)} Stars`} rang={P.mint} />
      <KPI nom="Yangi (7 kun)" q={(s.yangi_7kun || 0) + yangiSayt} izoh={`bot ${s.yangi_7kun || 0} · sayt ${yangiSayt}`} />
    </section>
    <section style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
      <div style={{ ...karta(), flex: "2 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "baseline" }}><h2 style={h2}>Tushum, oxirgi 30 kun</h2><span style={{ color: P.faint, fontSize: 13 }}>so'm, tasdiqlangan karta to'lovlari</span></div>
        <div role="img" aria-label={`30 kunda ${som(uzs)} so'm`} style={{ height: 180, display: "flex", alignItems: "flex-end", gap: 5, borderBottom: `1px solid ${P.line}` }}>
          {kunlar.map((x, i) => <div key={i} title={`${sana(x.k)}: ${som(x.v)} so'm`} style={{ flex: 1, height: Math.max(4, Math.round(x.v / mx * 170)), borderRadius: "5px 5px 2px 2px", background: x.v ? P.green : P.line }} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: P.faint, fontSize: 12 }}><span>{sana(kunlar[0].k)}</span><span>{sana(kunlar[15].k)}</span><span>bugun</span></div>
      </div>
      <div style={{ ...karta(), flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={h2}>Faol obunalar</h2>
        {tarifSon.map(([t, n]) => <div key={t} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span style={{ fontWeight: 700 }}>{TARIF_NOM[t]}</span><span style={{ color: P.dim }}>{n}</span></div>
          <div style={{ height: 8, borderRadius: 4, background: P.line }}><div style={{ width: `${Math.round(n / tmx * 100)}%`, minWidth: n ? 6 : 0, height: 8, borderRadius: 4, background: t === "shogird" || t === "sayt" ? P.gold : t === "pro" ? P.green : P.mint }} /></div></div>)}
      </div>
    </section>
    <section style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
      <div style={{ ...karta(), flex: "2 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "baseline" }}><h2 style={h2}>Odat va faollik</h2><span style={{ color: P.faint, fontSize: 13 }}>bot va ilova, ish kunlari</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          {[["Bugun faol", od.dau], ["7 kunda", od.wau], ["30 kunda", od.mau], ["Seriya 3+ kun", od.seriya_3plus], ["Eng uzun seriya", od.eng_uzun]].map(([n, v]) =>
            <div key={n} style={{ background: P.card2, borderRadius: 12, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, color: P.dim }}>{n}</span><b style={{ fontFamily: "Sora, sans-serif", fontSize: 24 }}>{v ?? "—"}</b></div>)}
        </div>
        <span style={{ fontSize: 13, color: P.dim }}>WAU / MAU: {od.mau ? Math.round(od.wau / od.mau * 100) + "%" : "—"} — foydalanuvchilar botga qanchalik muntazam qaytishi</span>
      </div>
      <div style={{ ...karta(), flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Darajalar</h2>
        {DAR.map(([k, n]) => { const v = (od.darajalar || {})[k] || 0; return <div key={k} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span style={{ fontWeight: 700 }}>{n}</span><span style={{ color: P.dim }}>{v}</span></div>
          <div style={{ height: 8, borderRadius: 4, background: P.line }}><div style={{ width: `${Math.round(v / dmx * 100)}%`, minWidth: v ? 6 : 0, height: 8, borderRadius: 4, background: k === "usta" ? P.gold : P.green }} /></div></div>; })}
        <div style={{ borderTop: `1px solid ${P.line}`, paddingTop: 10, fontSize: 14, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700 }}>Do'st taklifi</span><span style={{ color: P.dim }}>{od.referal_faol || 0} faol / {od.referal_jami || 0} · 30 kunda {od.referal_30 || 0}</span></div>
        <div style={{ fontSize: 14, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700 }}>Savura Ligasi</span><span style={{ color: P.dim }}>{od.liga || 0} ishtirokchi · <a href="/liga" target="_blank" rel="noopener" style={{ color: P.mint }}>reyting</a></span></div>
        <div style={{ fontSize: 14, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700 }}>Haqiqiy portfel</span><span style={{ color: P.dim }}>{od.real_portfel || 0} foydalanuvchi</span></div>
      </div>
    </section>
    <section style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
      <div style={{ ...karta(), flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={h2}>Diqqat talab qiladi</h2>
        {!diqqat.length && <span style={{ color: P.faint, fontSize: 14 }}>Hammasi joyida.</span>}
        {diqqat.map((x, i) => { const ich = <>
          <span style={{ width: 10, height: 10, borderRadius: 5, flex: "none", background: x.r }} />
          <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}><b style={{ fontSize: 14 }}>{x.sar}</b><span style={{ fontSize: 13, color: P.dim }}>{x.izoh}</span></span>
          <span style={{ fontSize: 13, fontWeight: 700, color: P.mint }}>Ochish</span></>;
          const st = { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: P.card2, border: 0, color: P.text, fontFamily: "inherit", cursor: "pointer", textDecoration: "none" };
          return x.href ? <a key={i} href={x.href} target="_blank" rel="noopener" style={st}>{ich}</a> : <button key={i} className="ad-btn" onClick={() => ot(x.b)} style={st}>{ich}</button>; })}
      </div>
      <div style={{ ...karta(), flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={h2}>Tizim holati</h2>
        {tizim.map(([n, h]) => <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, padding: "6px 0", borderBottom: `1px solid ${P.line}` }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: h === "xato" ? P.red : P.green }} /><span style={{ flex: 1 }}>{n}</span><span style={{ color: P.dim }}>{h}</span></div>)}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span style={{ fontWeight: 700 }}>AI sarfi (30 kun)</span><span style={{ color: P.dim }}>${(+ai.davr || 0).toFixed(2)} / $100</span></div>
          <div style={{ height: 8, borderRadius: 4, background: P.line }}><div style={{ width: `${Math.min(100, (+ai.davr || 0))}%`, minWidth: 6, height: 8, borderRadius: 4, background: P.gold }} /></div>
          <span style={{ fontSize: 12, color: P.faint }}>Bugun ${(+ai.bugun || 0).toFixed(3)} · {Object.entries(ai.xizmat || {}).map(([k, v]) => `${k} ${v.soni}`).join(" · ") || "hali so'rov yo'q"}</span>
        </div>
      </div>
    </section>
  </>;
}

// ── Foydalanuvchilar ────────────────────────────────────────────────────
const FILTR = [["hammasi", "Hammasi"], ["faol", "Faol"], ["tug7", "7 kunda tugaydi"], ["kutmoqda", "Saytda tasdiq kutmoqda"], ["sinov", "Sinovda"], ["blok", "Bloklangan"]];
function filtrla(o, f) {
  const k = kunQoldi(o.tugaydi);
  if (f === "faol") return ["start", "pro", "shogird", "sayt"].includes(o.tarif);
  if (f === "tug7") return o.tarif !== "bepul" && o.tarif !== "sinov" && k != null && k >= 0 && k <= 7;
  if (f === "kutmoqda") return o.talaba && !o.talaba.approved && !o.talaba.is_admin;
  if (f === "sinov") return o.tarif === "sinov";
  if (f === "blok") return o.holat === "blok";
  return true;
}
function Odamlar({ d, qidir, amal, sb, yukla, xabar }) {
  const [f, setF] = useState("hammasi");
  const [tanlangan, setTanlangan] = useState(null);
  const [n, setN] = useState(80);
  const q = qidir.trim().toLowerCase().replace(/^@/, "");
  const royxat = useMemo(() => d.odam.filter(o => filtrla(o, f) && (!q || [o.ism, o.username, o.email, String(o.chat_id || "")].some(x => (x || "").toLowerCase().includes(q))))
    .sort((a, b) => (b.tugaydi ? new Date(b.tugaydi) : 0) - (a.tugaydi ? new Date(a.tugaydi) : 0)), [d, f, q]);
  const s = royxat.find(o => o.key === tanlangan) || royxat[0] || null;
  return <>
    <div role="group" aria-label="Filtr" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {FILTR.map(([k, nom]) => <Chip key={k} on={f === k} onClick={() => setF(k)}>{nom} <span style={{ opacity: .75 }}>{d.odam.filter(o => filtrla(o, k)).length}</span></Chip>)}
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
      <div style={{ flex: "3 1 560px", minWidth: 0, borderRadius: 18, background: P.card, border: `1px solid ${P.line}`, overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 620, borderCollapse: "collapse", fontSize: 14 }}>
          <thead><tr style={{ textAlign: "left", color: P.faint, fontSize: 12.5 }}>
            {["Ism", "Bot / Sayt", "Tarif", "Muddat", "Manba"].map((h, i) => <th key={h} style={{ padding: i ? "14px 8px" : "14px 16px", fontWeight: 700 }}>{h}</th>)}</tr></thead>
          <tbody>
            {royxat.slice(0, n).map(o => { const k = kunQoldi(o.tugaydi); const on = s && s.key === o.key;
              return <tr key={o.key} className="ad-qator" tabIndex={0} onClick={() => { setTanlangan(o.key); pastga("ad-odam"); }} onKeyDown={e => { if (e.key === "Enter") { setTanlangan(o.key); pastga("ad-odam"); } }}
                aria-selected={on} style={{ borderTop: `1px solid ${P.line}`, background: on ? P.card2 : "transparent" }}>
                <td style={{ padding: "12px 16px" }}><div style={{ display: "flex", flexDirection: "column", gap: 2 }}><b>{o.ism}</b><span style={{ color: P.faint, fontSize: 12.5 }}>{o.username ? "@" + o.username : o.email}{o.chat_id ? " · " + o.chat_id : ""}</span></div></td>
                <td style={{ padding: "12px 8px", color: P.dim }}>{o.ulanish}</td>
                <td style={{ padding: "12px 8px" }}><TarifBelgi t={o.holat === "blok" ? "blok" : o.tarif} /></td>
                <td style={{ padding: "12px 8px", color: k != null && k <= 7 && k >= 0 ? P.gold : P.dim, whiteSpace: "nowrap" }}>{o.tugaydi ? sana(o.tugaydi) + (k != null && k >= 0 && k <= 7 ? ` (${k} kun)` : "") : "—"}</td>
                <td style={{ padding: "12px 16px", color: P.dim }}>{o.manba || "—"}</td></tr>; })}
          </tbody>
        </table>
        {royxat.length > n && <div style={{ padding: 14 }}><Tugma onClick={() => setN(n + 100)} style={{ width: "100%" }}>Yana ko'rsatish ({royxat.length - n})</Tugma></div>}
        {!royxat.length && <div style={{ padding: 20, color: P.faint }}>Hech kim topilmadi.</div>}
      </div>
      {s && <OdamKarta key={s.key} o={s} d={d} amal={amal} sb={sb} yukla={yukla} xabar={xabar} />}
    </div>
  </>;
}
function OdamKarta({ o, d, amal, sb, yukla, xabar }) {
  const [band, setBand] = useState(false);
  const [tarif, setTarif] = useState(o.botTarif || "pro");
  const [matn, setMatn] = useState("");
  const [msgOch, setMsgOch] = useState(false);
  const qil = async (turi, data, ok) => { setBand(true); await amal(turi, data, ok); setBand(false); };
  const saytTasdiq = async oy => {
    setBand(true);
    const t = o.talaba; const asos = t.expires_at && new Date(t.expires_at) > new Date() ? new Date(t.expires_at) : new Date();
    if (oy) asos.setMonth(asos.getMonth() + oy);
    const { error } = await sb.from("students").update(oy ? { approved: true, expires_at: asos.toISOString() } : { approved: false, expires_at: null }).eq("id", t.id);
    xabar(error ? "Xato: " + error.message : oy ? `Saytda tasdiqlandi: ${sana(asos)} gacha` : "Saytdagi ruxsat olib qo'yildi");
    await yukla(); setBand(false);
  };
  const tarix = d.tol.filter(t => o.chat_id && t.chat_id === o.chat_id).slice(0, 6);
  const bosh = (o.ism || "?").split(/\s+/).map(x => x[0]).join("").slice(0, 2).toUpperCase();
  const Maydon = ({ k, v }) => <div style={{ borderRadius: 12, background: P.card2, padding: 12, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}><span style={{ fontSize: 12, color: P.faint }}>{k}</span><b style={{ fontSize: 14, overflowWrap: "anywhere" }}>{v}</b></div>;
  return <aside id="ad-odam" aria-label="Tanlangan foydalanuvchi" style={{ ...karta(), flex: "2 1 360px", minWidth: 0, padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 16, background: P.card2, border: `1px solid ${P.line2}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 18, color: P.mint, flex: "none" }}>{bosh}</span>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}><b style={{ fontFamily: "Sora, sans-serif", fontSize: 19, overflowWrap: "anywhere" }}>{o.ism}</b>
        <span style={{ color: P.faint, fontSize: 13, overflowWrap: "anywhere" }}>{[o.username && "@" + o.username, o.email, o.chat_id].filter(Boolean).join(" · ")}</span></div>
      <TarifBelgi t={o.holat === "blok" ? "blok" : o.tarif} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
      <Maydon k="Muddat" v={o.tugaydi ? sana(o.tugaydi) : "—"} /><Maydon k="Manba" v={o.manba || "—"} />
      <Maydon k="Ulangan" v={o.ulanish} /><Maydon k="Holat" v={o.holat || "—"} />
    </div>
    {o.chat_id ? <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: P.dim }}>Botda muddat berish</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: P.dim }}>Tarif
            <select value={tarif} onChange={e => setTarif(e.target.value)} style={{ height: 40, borderRadius: 10, border: `1px solid ${P.line2}`, background: P.card2, color: P.text, fontFamily: "inherit", fontSize: 14, padding: "0 8px" }}>
              <option value="start">Start</option><option value="pro">Pro</option><option value="shogird">Shogird</option></select></label>
          {[[30, "+30 kun"], [90, "+90 kun"], [365, "+1 yil"]].map(([k, t]) => <Tugma key={k} disabled={band} onClick={() => { if (confirm(`${o.ism}: ${TARIF_NOM[tarif]} ${t}?`)) qil("muddat", { chat_id: o.chat_id, kun: k, tarif }, `${t} berildi`); }} style={{ flex: "1 1 70px" }}>{t}</Tugma>)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        <Tugma turi="primary" disabled={band || !o.botTarif || o.botTarif === tarif} onClick={() => qil("tarif", { chat_id: o.chat_id, tarif }, `Tarif: ${TARIF_NOM[tarif]}`)}>Tarifni {TARIF_NOM[tarif]} qilish</Tugma>
        <Tugma disabled={band} onClick={() => setMsgOch(!msgOch)}>Xabar yuborish</Tugma>
        {o.holat === "blok"
          ? <Tugma disabled={band} onClick={() => qil("holat", { chat_id: o.chat_id, amal: "faol" }, "Blokdan chiqarildi")}>Blokdan chiqarish</Tugma>
          : <Tugma turi="qizil" disabled={band} onClick={() => { if (confirm(`${o.ism} bloklansinmi?`)) qil("holat", { chat_id: o.chat_id, amal: "blok" }, "Bloklandi"); }}>Bloklash</Tugma>}
      </div>
      {msgOch && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="ad-msg" style={{ fontSize: 13, fontWeight: 700, color: P.dim }}>Botdan shaxsiy xabar</label>
        <textarea id="ad-msg" value={matn} onChange={e => setMatn(e.target.value)} rows={4} style={{ borderRadius: 12, border: `1px solid ${P.line2}`, background: P.card2, color: P.text, fontFamily: "inherit", fontSize: 14, padding: 12, resize: "vertical" }} />
        <Tugma turi="primary" disabled={band || !matn.trim()} onClick={async () => { await qil("xabar", { chat_id: o.chat_id, matn }, "Xabar yuborildi"); setMatn(""); setMsgOch(false); }}>Yuborish</Tugma>
      </div>}
    </> : <span style={{ fontSize: 13, color: P.faint }}>Botga ulanmagan: botdagi amallar uchun u botda /sayt buyrug'i bilan hisobini ulashi kerak.</span>}
    {o.talaba && !o.talaba.is_admin && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: P.dim }}>Sayt (email) ruxsati: {o.talaba.approved ? (o.talaba.expires_at ? sana(o.talaba.expires_at) + " gacha" : "muddatsiz") : "tasdiqlanmagan"}</span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[[1, "+1 oy"], [3, "+3 oy"], [12, "+12 oy"]].map(([m, t]) => <Tugma key={m} disabled={band} onClick={() => saytTasdiq(m)} style={{ flex: "1 1 70px" }}>{t}</Tugma>)}
        {o.talaba.approved && <Tugma turi="qizil" disabled={band} onClick={() => { if (confirm("Saytdagi ruxsat olib qo'yilsinmi?")) saytTasdiq(0); }}>Olib qo'yish</Tugma>}
      </div>
      <span style={{ fontSize: 12, color: P.faint }}>Botga ulangan bo'lsa, 5 daqiqada botda ham Shogird ochiladi.</span>
    </div>}
    {tarix.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: P.dim }}>To'lovlar</span>
      {tarix.map(t => <div key={t.id} style={{ display: "flex", gap: 12, fontSize: 13.5 }}><span style={{ width: 70, flex: "none", color: P.faint }}>{sana(t.yaratildi)}</span>
        <span>#{t.id} · {TARIF_NOM[t.tarif] || t.tarif} {t.oy} oy · {summaYoz(t.summa, t.valyuta)} · {t.holat}</span></div>)}
    </div>}
  </aside>;
}

// ── To'lovlar ───────────────────────────────────────────────────────────
const TAB = [["kutilmoqda", "Kutilmoqda"], ["tasdiqlandi", "Tasdiqlangan"], ["kam", "Summa kam"], ["rad", "Rad etilgan"], ["", "Hammasi"]];
function Tolovlar({ d, amal, sb }) {
  const [tab, setTab] = useState("kutilmoqda");
  const [tid, setTid] = useState(null);
  const royxat = d.tol.filter(t => !tab || t.holat === tab);
  const s = royxat.find(t => t.id === tid) || royxat[0] || null;
  const csv = () => {
    const q = [["id", "sana", "ism", "username", "chat_id", "tarif", "oy", "usul", "summa", "valyuta", "holat"]].concat(d.tol.map(t => [t.id, t.yaratildi, t.ism, t.username, t.chat_id, t.tarif, t.oy, t.usul, t.summa, t.valyuta, t.holat]));
    const b = new Blob(["﻿" + q.map(r => r.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "savura-tolovlar.csv"; a.click();
  };
  return <>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <div role="tablist" aria-label="Holat" style={{ display: "flex", flexWrap: "wrap", gap: 8, flex: "1 1 auto" }}>
        {TAB.map(([k, nom]) => <Chip key={k} role="tab" aria-selected={tab === k} on={tab === k} onClick={() => { setTab(k); setTid(null); }}>{nom}{k === "kutilmoqda" ? ` · ${d.tol.filter(t => t.holat === k).length}` : ""}</Chip>)}
      </div>
      <Tugma onClick={csv}>Excel'ga yuklash</Tugma>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
      <div style={{ flex: "2 1 400px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {!royxat.length && <div style={{ ...karta(), color: P.faint }}>{tab === "kutilmoqda" ? "Tekshirilmagan to'lov yo'q." : "To'lov yo'q."}</div>}
        {royxat.slice(0, 120).map(t => { const on = s && s.id === t.id; const a = AI_R()[t.ai_chek?.belgi];
          return <button key={t.id} onClick={() => { setTid(t.id); pastga("ad-tolov"); }} className="ad-btn" aria-pressed={on}
            style={{ textAlign: "left", fontFamily: "inherit", color: P.text, cursor: "pointer", borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 7, background: on ? P.card2 : P.card, border: `1px solid ${on ? P.green : P.line}` }}>
            <span style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}><b style={{ fontSize: 15 }}>#{t.id} · {t.ism || t.chat_id}</b><span style={{ fontSize: 12.5, color: P.faint }}>{oldin(t.yaratildi)}</span></span>
            <span style={{ fontSize: 13.5, color: P.dim }}>{TARIF_NOM[t.tarif] || t.tarif} · {t.oy} oy · <b style={{ color: P.text }}>{summaYoz(t.summa, t.valyuta)}</b> · {t.usul} · {t.manba === "web" ? "ilova/sayt" : "bot"}</span>
            {a && <span style={{ alignSelf: "flex-start", fontSize: 12.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, color: a[1], background: a[2] }}>AI: {a[0]}</span>}
            {t.holat !== "kutilmoqda" && <span style={{ fontSize: 12.5, color: P.faint }}>{t.holat}{t.korildi ? " · " + sana(t.korildi) : ""}</span>}
          </button>; })}
      </div>
      {s && <TolovKarta key={s.id} t={s} amal={amal} sb={sb} />}
    </div>
  </>;
}
function TolovKarta({ t, amal, sb }) {
  const [rasm, setRasm] = useState(null);
  const [holat, setHolat] = useState("yuk");
  const [band, setBand] = useState(false);
  useEffect(() => {
    let tirik = true;
    const ol = async () => { const { data } = await sb.from("bot_chek").select("mime,rasm").eq("tolov_id", t.id).maybeSingle(); return data; };
    (async () => {
      let r = await ol();
      if (!r && t.usul !== "stars") {
        if (tirik) setHolat("sorov");
        await sb.from("admin_amal").insert({ turi: "chek_rasm", data: { id: t.id } });
        for (let i = 0; i < 10 && tirik && !r; i++) { await new Promise(f => setTimeout(f, 2000)); r = await ol(); }
      }
      if (!tirik) return;
      if (r && r.rasm) { setRasm(`data:${r.mime || "image/jpeg"};base64,${r.rasm}`); setHolat(r.mime === "application/pdf" ? "pdf" : "ok"); }
      else setHolat("yoq");
    })();
    return () => { tirik = false; };
  }, [t.id]);
  const a = AI_R()[t.ai_chek?.belgi];
  const o = t.ai_chek?.oqildi || {};
  const hal = async x => {
    const sv = { ok: "To'lov tasdiqlansin va tarif ochilsinmi?", kam: "“Summa kam” deb rad etilsinmi?", rad: "To'lov rad etilsinmi?" }[x];
    if (!confirm(sv)) return;
    setBand(true); await amal("tolov_hal", { id: t.id, amal: x }, x === "ok" ? "Tasdiqlandi, obunachiga xabar ketdi" : "Rad etildi, obunachiga xabar ketdi"); setBand(false);
  };
  return <section id="ad-tolov" aria-label={`To'lov ${t.id}`} style={{ ...karta(), flex: "3 1 500px", minWidth: 0, padding: 22, display: "flex", flexWrap: "wrap", gap: 22 }}>
    <div style={{ flex: "1 1 220px", maxWidth: 320, minHeight: 300, borderRadius: 14, background: P.card2, border: `1px solid ${P.line}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {holat === "ok" && <a href={rasm} target="_blank" rel="noopener" style={{ display: "block", width: "100%" }}><img src={rasm} alt={`To'lov ${t.id} cheki`} style={{ width: "100%", display: "block" }} /></a>}
      {holat === "pdf" && <a href={rasm} download={`chek_${t.id}.pdf`} style={{ color: P.mint, fontWeight: 700 }}>PDF chekni ochish</a>}
      {holat !== "ok" && holat !== "pdf" && <span style={{ color: P.faint, fontSize: 13, padding: 20, textAlign: "center" }}>{holat === "yuk" ? "Chek yuklanmoqda…" : holat === "sorov" ? "Chek botdan olinmoqda…" : t.usul === "stars" ? "Telegram Stars — chek kerak emas" : t.izoh ? "TxID: " + t.izoh : "Chek topilmadi"}</span>}
    </div>
    <div style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <b style={{ fontFamily: "Sora, sans-serif", fontSize: 20 }}>#{t.id} · {t.ism || t.chat_id}</b>
        <span style={{ fontSize: 13.5, color: P.faint }}>{t.username ? "@" + t.username + " · " : ""}{t.chat_id} · {new Date(t.yaratildi).toLocaleString("ru-RU")}</span>
        <span style={{ fontSize: 14, color: P.dim }}>{TARIF_NOM[t.tarif] || t.tarif} · {t.oy} oy · <b style={{ color: P.text }}>{summaYoz(t.summa, t.valyuta)}</b> · {t.usul}</span>
      </div>
      {a ? <div style={{ borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, background: a[2], border: `1px solid ${a[3]}`, color: a[1] }}>
        <b style={{ fontSize: 14 }}>AI tekshiruvi: {a[0]}</b>
        {[["Kutilgan summa", summaYoz(t.summa, t.valyuta)], ["Chekdan o'qildi", o.summa != null ? som(o.summa) + " " + (o.valyuta || "") : "—"], ["Qabul qiluvchi karta", o.qabul_karta_oxirgi4 ? "*" + o.qabul_karta_oxirgi4 : "—"], ["Chek sanasi", o.sana || "—"]].map(([k, v]) =>
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13.5 }}><span style={{ color: P.dim }}>{k}</span><b>{v}</b></div>)}
        {t.ai_chek?.matn && t.ai_chek.belgi !== "mos" && <span style={{ fontSize: 13, color: P.dim }}>{t.ai_chek.matn}</span>}
        <span style={{ fontSize: 12, color: P.faint }}>Qaror sizda: AI faqat chekni o'qiydi</span>
      </div> : t.usul === "karta" && t.holat === "kutilmoqda" ? <span style={{ fontSize: 13, color: P.faint }}>AI tekshiruvi hali yo'q.</span> : null}
      {t.sabab && t.holat !== "tasdiqlandi" && <span style={{ fontSize: 13, color: P.dim }}>Sabab: {t.sabab}</span>}
      {t.holat === "kutilmoqda" ? <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
        <Tugma turi="primary" disabled={band} onClick={() => hal("ok")} style={{ minHeight: 48, fontSize: 15 }}>Tasdiqlash va tarifni ochish</Tugma>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          <Tugma turi="oltin" disabled={band} onClick={() => hal("kam")}>Summa kam</Tugma>
          <Tugma turi="qizil" disabled={band} onClick={() => hal("rad")}>Rad etish</Tugma>
        </div></div>
        : <span style={{ fontSize: 14, fontWeight: 700, color: t.holat === "tasdiqlandi" ? P.green : P.red }}>{t.holat === "tasdiqlandi" ? "Tasdiqlangan" : t.holat === "kam" ? "Summa kam deb rad etilgan" : "Rad etilgan"}{t.korildi ? " · " + sana(t.korildi) : ""}</span>}
    </div>
  </section>;
}

// ── Telegram kodi bilan tasdiq (12 soat) ───────────────────────────────
function TfaEkran({ sb, tayyor }) {
  const [kod, setKod] = useState("");
  const [holat, setHolat] = useState("");
  const [band, setBand] = useState(false);
  const yubor = async () => {
    setBand(true); setHolat("");
    const { error } = await sb.from("admin_amal").insert({ turi: "kod2fa", data: {} });
    setHolat(error ? "Xato: " + error.message : "Kod Telegram'ga yuborildi (@savurabot). 10 daqiqa amal qiladi.");
    setBand(false);
  };
  const tasdiq = async e => {
    e.preventDefault(); setBand(true);
    const { data, error } = await sb.rpc("admin_2fa_tasdiq", { p_kod: kod.trim() });
    setBand(false);
    if (!error && data && data.ok) tayyor(data.gacha);
    else setHolat(error ? error.message : data?.xato || "Kod noto'g'ri");
  };
  return <div style={{ minHeight: "100vh", background: P.bg, color: P.text, fontFamily: "Manrope, system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" }}>
    <form onSubmit={tasdiq} style={{ ...karta(), width: "100%", maxWidth: 420, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
      <h1 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: 22 }}>Panelga kirishni tasdiqlang</h1>
      <p style={{ margin: 0, color: P.dim, lineHeight: 1.55, fontSize: 14 }}>Xavfsizlik uchun Telegram'ingizga 6 xonali kod yuboriladi. Tasdiqdan keyin panel 12 soat ochiq turadi.</p>
      <Tugma type="button" onClick={yubor} disabled={band}>Telegram'ga kod yuborish</Tugma>
      <label htmlFor="ad-kod" style={{ fontSize: 13, fontWeight: 700, color: P.dim }}>Kod</label>
      <input id="ad-kod" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={kod} onChange={e => setKod(e.target.value.replace(/\D/g, ""))}
        style={{ height: 52, borderRadius: 12, border: `1px solid ${P.line2}`, background: P.card2, color: P.text, fontFamily: "Sora, sans-serif", fontSize: 24, letterSpacing: 8, textAlign: "center" }} />
      <Tugma turi="primary" type="submit" disabled={band || kod.length !== 6}>Tasdiqlash</Tugma>
      {holat && <span role="status" style={{ fontSize: 13.5, color: P.dim }}>{holat}</span>}
    </form>
  </div>;
}

// ── Umumiy: bot API dan yuklash ─────────────────────────────────────────
function useBotApi(botApi, nom, dd, deps) {
  const [r, setR] = useState(null);
  const yangila = useCallback(async () => { setR(null); setR(await botApi(nom, dd)); }, deps || []);
  useEffect(() => { yangila(); }, [yangila]);
  return [r, yangila];
}
const kiritma = () => ({ height: 44, borderRadius: 11, border: `1px solid ${P.line2}`, background: P.card2, color: P.text, fontFamily: "inherit", fontSize: 14, padding: "0 12px", boxSizing: "border-box", width: "100%", minWidth: 0 });
const Yuk = ({ r }) => !r ? <div style={{ ...karta(), color: P.faint }}>Botdan olinmoqda…</div> : !r.ok ? <div role="alert" style={{ ...karta(), color: P.red }}>Xato: {r.xato || "bot javob bermadi"}</div> : null;

// ── Tariflar va to'lov sozlamalari ──────────────────────────────────────
const SOZ_MAYDON = [
  ["Narxlar (so'm / oy)", [["narx_start", "Start"], ["narx_pro", "Pro"]]],
  ["Narxlar (USDT / oy)", [["narx_start_usdt", "Start"], ["narx_pro_usdt", "Pro"]]],
  ["Narxlar (Stars / oy)", [["narx_start_stars", "Start"], ["narx_pro_stars", "Pro"]]],
  ["Yillik to'lov", [["yillik_oy", "12 oy = necha oy narxi"]]],
  ["USDT", [["usdt_manzil", "Hamyon manzili"], ["usdt_tarmoq", "Tarmoq"]]],
  ["Boshqa", [["admin_username", "Obuna uchun admin (@)"], ["qurilma_limit", "Bir vaqtda qurilmalar"], ["kod_kun", "Yangi kod muddati (kun)"]]]];
function Sozlamalar({ botApi, xabar }) {
  const [r, yangila] = useBotApi(botApi, "stat");
  const [q, setQ] = useState(null);
  const [band, setBand] = useState(false);
  useEffect(() => { if (r?.ok) { const s = { ...r.sozlamalar }; try { s.kartalar = JSON.parse(s.kartalar || "[]"); } catch (e) { s.kartalar = []; } setQ(s); } }, [r]);
  if (!r || !r.ok || !q) return <Yuk r={r} />;
  const asl = r.sozlamalar;
  const saqla = async () => {
    const ozg = Object.keys(asl).filter(k => k !== "kartalar" && String(q[k] ?? "") !== String(asl[k] ?? ""));
    const kart = JSON.stringify(q.kartalar.filter(k => k.raqam.trim()));
    if (kart !== JSON.stringify(JSON.parse(asl.kartalar || "[]"))) ozg.push("kartalar");
    if (!ozg.length) { xabar("O'zgarish yo'q"); return; }
    if (!confirm("Saqlansinmi? " + ozg.join(", "))) return;
    setBand(true);
    const nat = await Promise.all(ozg.map(k => botApi("sozlama", { kalit: k, qiymat: k === "kartalar" ? kart : String(q[k]) })));
    const yom = nat.filter(x => !x.ok);
    xabar(yom.length ? `${ozg.length - yom.length} saqlandi, ${yom.length} xato: ${yom.map(x => x.xato).join(", ")}` : "Saqlandi — botda darhol kuchga kirdi");
    setBand(false); yangila();
  };
  const ust = (k, v) => setQ({ ...q, [k]: v });
  const kartUst = (i, k, v) => { const ks = q.kartalar.map((x, j) => j === i ? { ...x, [k]: v } : x); setQ({ ...q, kartalar: ks }); };
  return <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
      {SOZ_MAYDON.map(([sar, ms]) => <section key={sar} style={{ ...karta(), display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>{sar}</h2>
        {ms.map(([k, nom]) => <label key={k} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700, color: P.dim }}>{nom}
          <input value={q[k] ?? ""} onChange={e => ust(k, e.target.value)} style={kiritma()} /></label>)}
      </section>)}
      <section style={{ ...karta(), display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Rejimlar</h2>
        {[["texnik_rejim", "Texnik rejim (bot faqat adminlarga ochiq)"], ["robot_toxtatilgan", "Barcha savdo robotlari pauzada"]].map(([k, nom]) =>
          <label key={k} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={q[k] === "1"} onChange={e => ust(k, e.target.checked ? "1" : "0")} style={{ width: 20, height: 20 }} />{nom}</label>)}
      </section>
    </div>
    <section style={{ ...karta(), display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={h2}>To'lov kartalari</h2>
      {q.kartalar.map((k, i) => <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <input aria-label="Karta raqami" placeholder="8600 …" value={k.raqam} onChange={e => kartUst(i, "raqam", e.target.value)} style={{ ...kiritma(), flex: "2 1 200px", width: "auto" }} />
        <input aria-label="Egasi" placeholder="Egasi" value={k.egasi} onChange={e => kartUst(i, "egasi", e.target.value)} style={{ ...kiritma(), flex: "2 1 160px", width: "auto" }} />
        <input aria-label="Bank" placeholder="Bank" value={k.bank} onChange={e => kartUst(i, "bank", e.target.value)} style={{ ...kiritma(), flex: "1 1 120px", width: "auto" }} />
        <Tugma turi="qizil" onClick={() => setQ({ ...q, kartalar: q.kartalar.filter((_, j) => j !== i) })}>O'chirish</Tugma>
      </div>)}
      {q.kartalar.length < 5 && <Tugma onClick={() => setQ({ ...q, kartalar: [...q.kartalar, { raqam: "", egasi: "", bank: "" }] })} style={{ alignSelf: "flex-start" }}>Karta qo'shish</Tugma>}
    </section>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Tugma turi="primary" disabled={band} onClick={saqla} style={{ minWidth: 200 }}>{band ? "Saqlanmoqda…" : "O'zgarishlarni saqlash"}</Tugma>
      <Tugma disabled={band} onClick={yangila}>Qayta yuklash</Tugma>
    </div>
  </div>;
}

// ── Kirish kodlari ──────────────────────────────────────────────────────
function Kodlar({ botApi, xabar }) {
  const [filtr, setFiltr] = useState("faol");
  const [r, yangila] = useBotApi(botApi, "kodlar", { filtr, limit: 150 }, [filtr]);
  const [f, setF] = useState({ tarif: "shogird", kun: 365, soni: 1, max_soni: 1, izoh: "" });
  const [yangi, setYangi] = useState(null);
  const [band, setBand] = useState(false);
  const nusxa = t => { try { navigator.clipboard.writeText(t); xabar("Nusxa olindi"); } catch (e) {} };
  const yarat = async e => {
    e.preventDefault(); setBand(true);
    const n = await botApi("kod_yarat", f);
    setBand(false);
    if (n.ok) { setYangi(n.kodlar); yangila(); } else xabar("Xato: " + (n.xato || ""));
  };
  const bekor = async k => { if (!confirm(k.korinish + " bekor qilinsinmi?")) return; const n = await botApi("kod_bekor", { kod: k.kod }); xabar(n.ok ? "Bekor qilindi" : "Xato"); yangila(); };
  return <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <form onSubmit={yarat} style={{ ...karta(), display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={h2}>Yangi kod</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700, color: P.dim }}>Tarif
          <select value={f.tarif} onChange={e => setF({ ...f, tarif: e.target.value })} style={kiritma()}><option value="start">Start</option><option value="pro">Pro</option><option value="shogird">Shogird</option></select></label>
        {[["kun", "Muddat (kun)"], ["soni", "Nechta kod"], ["max_soni", "Har kod necha kishiga"]].map(([k, nom]) =>
          <label key={k} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700, color: P.dim }}>{nom}
            <input type="number" min="1" value={f[k]} onChange={e => setF({ ...f, [k]: +e.target.value })} style={kiritma()} /></label>)}
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700, color: P.dim }}>Izoh
          <input value={f.izoh} onChange={e => setF({ ...f, izoh: e.target.value })} placeholder="masalan: 5-oqim" style={kiritma()} /></label>
      </div>
      <Tugma turi="primary" type="submit" disabled={band} style={{ alignSelf: "flex-start", minWidth: 180 }}>{band ? "Yaratilmoqda…" : "Kod yaratish"}</Tugma>
      {yangi && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {yangi.map(k => <div key={k.kod} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", padding: 12, borderRadius: 12, background: P.card2 }}>
          <b style={{ fontFamily: "Sora, sans-serif", fontSize: 16, flex: "1 1 160px" }}>{k.korinish}</b>
          <Tugma onClick={() => nusxa(k.korinish)}>Kod</Tugma><Tugma turi="primary" onClick={() => nusxa(k.havola)}>Havola</Tugma></div>)}
      </div>}
    </form>
    <div role="group" aria-label="Filtr" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {[["faol", "Bo'sh"], ["ishlatilgan", "Ishlatilgan"], ["bekor", "Bekor"], ["hammasi", "Hammasi"]].map(([k, n]) => <Chip key={k} on={filtr === k} onClick={() => setFiltr(k)}>{n}</Chip>)}
    </div>
    {(!r || !r.ok) ? <Yuk r={r} /> : <div style={{ borderRadius: 18, background: P.card, border: `1px solid ${P.line}`, overflowX: "auto" }}>
      <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: 14 }}>
        <thead><tr style={{ textAlign: "left", color: P.faint, fontSize: 12.5 }}>{["Kod", "Tarif", "Muddat", "Ishlatildi", "Izoh", ""].map(h => <th key={h} style={{ padding: "12px 14px" }}>{h}</th>)}</tr></thead>
        <tbody>{r.kodlar.map(k => <tr key={k.kod} style={{ borderTop: `1px solid ${P.line}` }}>
          <td style={{ padding: "10px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>{k.korinish}</td>
          <td style={{ padding: "10px 14px" }}><TarifBelgi t={k.tarif} /></td>
          <td style={{ padding: "10px 14px", color: P.dim }}>{k.kun} kun</td>
          <td style={{ padding: "10px 14px", color: P.dim }}>{k.ishlatildi}/{k.max_soni}{k.kimlar?.length ? " · " + k.kimlar.map(x => x.ism || x.chat_id).join(", ") : ""}</td>
          <td style={{ padding: "10px 14px", color: P.dim }}>{k.bekor ? "bekor · " : ""}{k.izoh}</td>
          <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>{!k.bekor && k.ishlatildi < k.max_soni && <><Tugma onClick={() => nusxa(k.havola)} style={{ minHeight: 36 }}>Havola</Tugma> <Tugma turi="qizil" onClick={() => bekor(k)} style={{ minHeight: 36 }}>Bekor</Tugma></>}</td>
        </tr>)}</tbody></table>
      {!r.kodlar.length && <div style={{ padding: 20, color: P.faint }}>Kod yo'q.</div>}
    </div>}
  </div>;
}

// ── Ommaviy xabar ───────────────────────────────────────────────────────
const MAQSAD = [["hammasi", "Hamma foydalanuvchilar"], ["faol", "Faol obunachilar"], ["tugaydi7", "7 kunda tugaydiganlar"], ["tugagan", "Obunasi tugaganlar"], ["obunasiz", "Obunasizlar"]];
function Ommaviy({ botApi, xabar }) {
  const [maqsad, setMaqsad] = useState("faol");
  const [matn, setMatn] = useState("");
  const [son, setSon] = useState(null);
  const [band, setBand] = useState(false);
  useEffect(() => { let t = true; setSon(null); botApi("xabar_soni", { maqsad }).then(r => { if (t) setSon(r.ok ? r.soni : "?"); }); return () => { t = false; }; }, [maqsad]);
  const yubor = async test => {
    if (!test && !confirm(`${son} kishiga yuborilsinmi?`)) return;
    setBand(true);
    const r = await botApi("xabar", { matn, maqsad, test });
    setBand(false);
    xabar(r.ok ? (test ? "Sinov xabari sizga yuborildi" : `Yuborish boshlandi: ${r.soni} kishi`) : "Xato: " + (r.xato || ""));
    if (r.ok && !test) setMatn("");
  };
  return <section style={{ ...karta(), display: "flex", flexDirection: "column", gap: 14, maxWidth: 760 }}>
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700, color: P.dim }}>Kimga
      <select value={maqsad} onChange={e => setMaqsad(e.target.value)} style={kiritma()}>{MAQSAD.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
    <span style={{ fontSize: 13.5, color: P.dim }}>{son == null ? "Hisoblanmoqda…" : `${son} kishi`}</span>
    <label htmlFor="ad-om" style={{ fontSize: 13, fontWeight: 700, color: P.dim }}>Xabar (Telegram HTML: &lt;b&gt;, &lt;i&gt;, havolalar)</label>
    <textarea id="ad-om" rows={8} value={matn} onChange={e => setMatn(e.target.value)} style={{ borderRadius: 12, border: `1px solid ${P.line2}`, background: P.card2, color: P.text, fontFamily: "inherit", fontSize: 14, padding: 12, resize: "vertical" }} />
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Tugma disabled={band || !matn.trim()} onClick={() => yubor(true)}>Avval o'zimga sinov</Tugma>
      <Tugma turi="primary" disabled={band || !matn.trim() || !son} onClick={() => yubor(false)}>Yuborish</Tugma>
    </div>
  </section>;
}

// ── Murojaatlar ─────────────────────────────────────────────────────────
function Murojaatlar({ botApi, amal }) {
  const [r, yangila] = useBotApi(botApi, "murojaatlar");
  const [och, setOch] = useState(null);
  const [matn, setMatn] = useState("");
  if (!r || !r.ok) return <Yuk r={r} />;
  return <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 860 }}>
    <span style={{ fontSize: 13.5, color: P.faint }}>Murojaat matnlari admin guruhida. Bu yerdan foydalanuvchiga bot orqali javob yozishingiz mumkin.</span>
    {!r.murojaatlar.length && <div style={{ ...karta(), color: P.faint }}>Murojaat yo'q.</div>}
    {r.murojaatlar.map(m => <div key={m.ticket} style={{ ...karta(), padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "baseline" }}>
        <b style={{ flex: "1 1 200px" }}>#{m.ticket} · {m.ism || m.chat_id}{m.username ? " @" + m.username : ""}</b>
        <span style={{ fontSize: 13, color: P.faint }}>{m.soni} xabar · {oldin(m.vaqt)}</span>
        <Tugma onClick={() => { setOch(och === m.ticket ? null : m.ticket); setMatn(""); }}>Javob yozish</Tugma>
      </div>
      {och === m.ticket && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <textarea aria-label="Javob" rows={4} value={matn} onChange={e => setMatn(e.target.value)} style={{ borderRadius: 12, border: `1px solid ${P.line2}`, background: P.card2, color: P.text, fontFamily: "inherit", fontSize: 14, padding: 12 }} />
        <Tugma turi="primary" disabled={!matn.trim()} onClick={async () => { await amal("xabar", { chat_id: m.chat_id, matn: `💬 Savura qo'llab-quvvatlash (#${m.ticket}):\n\n${matn}` }, "Javob yuborildi"); setOch(null); }} style={{ alignSelf: "flex-start" }}>Yuborish</Tugma>
      </div>}
    </div>)}
    <Tugma onClick={yangila} style={{ alignSelf: "flex-start" }}>Yangilash</Tugma>
  </div>;
}

// ── Jurnal ──────────────────────────────────────────────────────────────
function Jurnal({ botApi }) {
  const [r] = useBotApi(botApi, "jurnal", { limit: 150 });
  if (!r || !r.ok) return <Yuk r={r} />;
  return <div style={{ borderRadius: 18, background: P.card, border: `1px solid ${P.line}`, overflowX: "auto" }}>
    <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 13.5 }}>
      <thead><tr style={{ textAlign: "left", color: P.faint, fontSize: 12.5 }}>{["Vaqt", "Admin", "Amal", "Tafsilot"].map(h => <th key={h} style={{ padding: "12px 14px" }}>{h}</th>)}</tr></thead>
      <tbody>{r.jurnal.map(j => <tr key={j.id} style={{ borderTop: `1px solid ${P.line}` }}>
        <td style={{ padding: "9px 14px", color: P.faint, whiteSpace: "nowrap" }}>{new Date(j.vaqt * 1000).toLocaleString("ru-RU")}</td>
        <td style={{ padding: "9px 14px" }}>{j.admin_ism || j.admin}</td><td style={{ padding: "9px 14px", fontWeight: 700 }}>{j.amal}</td>
        <td style={{ padding: "9px 14px", color: P.dim, overflowWrap: "anywhere" }}>{j.tafsilot}</td></tr>)}</tbody></table>
  </div>;
}
