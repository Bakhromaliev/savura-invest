// Bosh sahifadagi "Savura Terminal" e'loni: harakatlanuvchi gradient ramka
import React, { useState } from "react";

const M = {
  uz: { yangi: "Yangi qo'shildi", sar: "Savura Terminal", mat: "Har bir kompaniyani bitta sahifada ko'ring: 10 yillik hisobotlar, baholash, halollik holati, insayder savdolari va Savura AI xulosasi.", och: "Terminalni ochish", sin: "3 kun bepul sinab ko'rish", izoh: "Ro'yxatdan o'ting: 3 kun bepul. Narxlar ~15 daqiqa kechikadi.", tab: ["Daromad", "Sof foyda", "Dividend", "Halollik", "AI xulosa"] },
  ru: { yangi: "Новинка", sar: "Savura Terminal", mat: "Вся компания на одной странице: отчёты за 10 лет, оценка, халяльность, сделки инсайдеров и вывод Savura AI.", och: "Открыть терминал", sin: "3 дня бесплатно", izoh: "Зарегистрируйтесь — 3 дня бесплатно. Цены с задержкой ~15 минут.", tab: ["Выручка", "Прибыль", "Дивиденд", "Халяльность", "AI-вывод"] },
  en: { yangi: "New", sar: "Savura Terminal", mat: "See every company on one page: 10 years of filings, valuation, halal status, insider trades and a Savura AI summary.", och: "Open the terminal", sin: "Try 3 days free", izoh: "Sign up for a 3-day free trial. Prices delayed ~15 minutes.", tab: ["Revenue", "Net income", "Dividend", "Halal", "AI summary"] },
  tr: { yangi: "Yeni", sar: "Savura Terminal", mat: "Her şirketi tek sayfada görün: 10 yıllık raporlar, değerleme, helallik durumu, içeriden işlemler ve Savura AI özeti.", och: "Terminali aç", sin: "3 gün ücretsiz dene", izoh: "Kaydolun, 3 gün ücretsiz. Fiyatlar ~15 dakika gecikmeli.", tab: ["Gelir", "Net kâr", "Temettü", "Helallik", "AI özeti"] },
  ar: { yangi: "جديد", sar: "Savura Terminal", mat: "كل شركة في صفحة واحدة: تقارير 10 سنوات، التقييم، حالة الحلال، صفقات المطلعين وملخص Savura AI.", och: "افتح المنصة", sin: "جرّب 3 أيام مجاناً", izoh: "سجّل واحصل على 3 أيام مجاناً. الأسعار متأخرة نحو 15 دقيقة.", tab: ["الإيرادات", "صافي الربح", "التوزيعات", "الحلال", "ملخص AI"] },
};
// Namuna (AAPL, yillik): sahifa ochilishini kutmasdan ko'rsatiladigan bezak grafigi
const NAMUNA = [[216, 229, 266, 260, 274, 366, 394, 383, 391, 416], [46, 48, 60, 55, 57, 95, 100, 97, 94, 112], [0.6, 0.68, 0.75, 0.8, 0.85, 0.9, 0.94, 0.98, 1, 1.04], [6, 5.5, 5, 4.6, 4.1, 3.8, 3.5, 3.2, 3, 2.9], [58, 61, 60, 64, 70, 69, 67, 71, 72, 74]];
const RANG = ["#2f7df6", "#37b24d", "#4aa3ff", "#52d869", "#f0a92b"];
const KOD = ["AAPL FA", "AAPL FA", "AAPL DVD", "AAPL HALOL", "AAPL AI"];

export default function TerminalPromo({ lang = "uz" }) {
  const T = M[lang] || M.uz;
  const [i, setI] = useState(0);
  const v = NAMUNA[i], mx = Math.max(...v);
  const och = e => { e.preventDefault(); window.location.href = "/terminal"; };
  return <section dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "40px 16px", position: "relative" }}>
    <style>{`
      @keyframes tpOqim{0%{background-position:0% 50%}100%{background-position:300% 50%}}
      @keyframes tpNur{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
      .tp-ramka{background:linear-gradient(90deg,#2f7df6,#37b24d,#4aa3ff,#52d869,#2f7df6);background-size:300% 100%;animation:tpOqim 8s linear infinite}
      .tp-nur{animation:tpNur 3.5s ease-in-out infinite}
      .tp-btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 26px;border-radius:14px;font-weight:700;font-size:16px;text-decoration:none;transition:transform .2s,filter .2s}
      .tp-btn:hover{transform:translateY(-2px);filter:brightness(1.08)}
      .tp-btn:focus-visible,.tp-chip:focus-visible{outline:2px solid #4aa3ff;outline-offset:3px}
      @media (prefers-reduced-motion: reduce){.tp-ramka,.tp-nur{animation:none}}
    `}</style>
    <div className="tp-ramka" style={{ maxWidth: 1200, margin: "0 auto", borderRadius: 28, padding: 2 }}>
      <div style={{ borderRadius: 26, background: "#0b1628", padding: "clamp(22px, 4vw, 40px)", display: "flex", flexWrap: "wrap", gap: 36, alignItems: "center", color: "#edf2ff" }}>
        <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#52d869", background: "#0f2a1c", border: "1px solid #1f5a33", padding: "6px 12px", borderRadius: 999 }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: "#52d869" }} />{T.yangi}</span>
          <h2 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "clamp(30px, 4.4vw, 44px)", lineHeight: 1.08, letterSpacing: "-0.02em", color: "#edf2ff" }}>{T.sar}</h2>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "#b9c6e2", maxWidth: 540 }}>{T.mat}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, paddingTop: 4 }}>
            <a href="/terminal" onClick={och} className="tp-btn" style={{ background: "#2f7df6", color: "#fff" }}>{T.och}</a>
            <a href="/terminal" onClick={och} className="tp-btn" style={{ border: "1px solid #2a3d63", color: "#edf2ff" }}>{T.sin}</a>
          </div>
          <span style={{ fontSize: 13, color: "#8ea0c4" }}>{T.izoh}</span>
        </div>
        <div style={{ flex: "1 1 400px", minWidth: 0 }}>
          <div style={{ borderRadius: 18, background: "#060a14", border: "1px solid #1c2c4c", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, height: 42, borderRadius: 12, background: "#0b1628", border: "1px solid #1c2c4c", padding: "0 14px", position: "relative", overflow: "hidden" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8ea0c4" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
              <span dir="ltr" style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: 14 }}>{KOD[i]}</span>
              <span style={{ width: 2, height: 18, background: "#4aa3ff" }} />
              <span className="tp-nur" aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, #4aa3ff22, transparent)" }} />
            </div>
            <div role="group" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {T.tab.map((x, k) => <button key={k} className="tp-chip" onClick={() => setI(k)} aria-pressed={i === k}
                style={{ minHeight: 34, padding: "0 12px", borderRadius: 10, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  background: i === k ? "#2f7df6" : "transparent", color: i === k ? "#fff" : "#b9c6e2", border: `1px solid ${i === k ? "#2f7df6" : "#1c2c4c"}` }}>{x}</button>)}
            </div>
            <div dir="ltr" aria-hidden="true" style={{ height: 150, display: "flex", alignItems: "flex-end", gap: 10, padding: "0 4px" }}>
              {v.map((x, k) => <div key={k} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "100%", borderRadius: "6px 6px 2px 2px", background: RANG[i], opacity: 0.45 + 0.55 * k / 9, height: Math.round(10 + x / mx * 110), transition: "height .4s ease" }} />
                <span style={{ fontSize: 10, color: "#8ea0c4" }}>'{16 + k}</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
