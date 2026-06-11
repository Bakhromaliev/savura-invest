// api/gemini.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { messages, lang = "uz" } = req.body || {};
  if (!messages?.length) return res.status(400).json({ error: "messages required" });

  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_KEY sozlanmagan." });

  const LANG_INSTRUCTION = {
    uz: "MUHIM: Faqat O'ZBEK tilida javob bering.",
    en: "IMPORTANT: Respond ONLY in ENGLISH.",
    tr: "ÖNEMLI: Yalnızca TÜRKÇE yanıt verin.",
    ru: "ВАЖНО: Отвечайте ТОЛЬКО НА РУССКОМ языке.",
    ar: "مهم: أجب باللغة العربية فقط.",
  };

  const SYSTEM = `Siz Savura Invest platformasining AI yordamchisisiz.

${LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.uz}

=== SAVURA INVEST KURSI ===
Kurs: 3 oy onlayn, 7 modul:
1. Investitsiya asoslari | 2. Halol treyding (AAOIFI) | 3. Fundamental tahlil
4. Texnik tahlil (kirish) | 5. Texnik tahlil va strategiyalar
6. Risk menejment va psixologiya | 7. Real treydingni boshlash
Format: Video, Jonli efir, Praktika, Fayllar, Signallar
Kurs so'ngida: maxsus yopiq guruh, tajribali treyderlar har kun maslahat beradi.

=== KURS EGASI ===
Bahromaliyev Muhammadyusuf: 2020-yildan AQSh bozorida, Istanbul Iqtisodiyot talabasci,
Savura Invest va Savuraerp.com asoschisi, 100+ aksiya tajribasi.

=== HALOL TREYDING ===
Halol: Real aksiyalar, long-term, swing. Harom: Forex, Kripto, CFD, Margin, Short.

=== METODOLOGIYA ===
15 savol, 5 toifa: O'sish/Baholanish/Rentabellik/Moliyaviy sog'lomlik/Samaradorlik.
Risk: PAST(0-3) → O'RTA(4-5) → YUQORI(6-9) → JUDA YUQORI(10+).

=== QOIDALAR ===
- Qisqa va aniq javob (3-5 jumla)
- Aniq "sotib oling/soting" maslahat berma
- Narx prognozi berma`;

  const contents = [
    { role: "user", parts: [{ text: SYSTEM }] },
    { role: "model", parts: [{ text: "Savura Invest AI yordamchisi tayyor!" }] },
    ...messages.slice(-10).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }))
  ];

  const cfg = { contents, generationConfig: { temperature: 0.7, maxOutputTokens: 450 } };
  const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"];

  for (const model of MODELS) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) }
      );
      const data = await r.json();
      if (!r.ok) {
        const msg = data?.error?.message || "";
        if (msg.includes("not found") || msg.includes("no longer available")) continue;
        return res.status(500).json({ error: msg });
      }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return res.status(200).json({ reply: text });
    } catch { continue; }
  }

  return res.status(500).json({ error: "Javob olmadi. Qaytadan urinib ko'ring." });
}