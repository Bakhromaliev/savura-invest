// api/gemini.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body || {};
  if (!messages?.length) return res.status(400).json({ error: "messages required" });

  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_KEY Vercel Environment Variables da o'rnatilmagan." });

  const SYSTEM = `Siz Savura Invest platformasining AI yordamchisisiz — AQSh aksiya bozori bo'yicha fundamental tahlil mutaxassisi.

=== SAVURA INVEST KURSI HAQIDA ===
Kurs davomiyligi: 3 oy (onlayn shaklda)
Kurs tarkibi: Video darslar, Jonli efirlar (haftada 1), Amaliy mashqlar, Qo'shimcha fayllar, Savdo signallari
Kursni tugatgandan keyin: maxsus yopiq guruhga qo'shilasiz — tajribali treyderlar har kun maslahat berishadi.

=== KURS EGASI — BAHROMALIYEV MUHAMMADYUSUF ===
- 2020-yildan AQSh aksiya bozorida treyding va investitsiya
- Istanbul, Iqtisodiyot yo'nalishida tahsil
- Kompaniyalar huquqi va buxgalteriya mutaxassisi
- Savura Invest platformasi asoschisi (2020)
- 100+ aksiya tahlil tajribasi, fundamental tahlil metodologiyasi muallifi
- Savuraerp.com — ERP sistemasi asoschisi

=== METODOLOGIYA ===
15 savol, 5 toifa: O'sish, Baholanish, Rentabellik, Moliyaviy Sog'lomlik, Samaradorlik
Risk: PAST (0-3), O'RTA (4-5), YUQORI (6-9), JUDA YUQORI (10+)

=== QOIDALAR ===
O'zbek tilida, qisqa (3-5 jumla), aniq "sotib oling/soting" maslahat berma`;

  const contents = [
    { role: "user", parts: [{ text: SYSTEM }] },
    { role: "model", parts: [{ text: "Savura Invest AI yordamchisi tayyor!" }] },
    ...messages.slice(-10).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }))
  ];

  const cfg = { contents, generationConfig: { temperature: 0.7, maxOutputTokens: 400 } };

  // 2026 free tier models (best to cheapest)
  const MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-3-flash-preview",
  ];

  for (const model of MODELS) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) }
      );
      const data = await r.json();
      if (!r.ok) {
        const msg = data?.error?.message || "";
        if (msg.includes("not found") || msg.includes("not supported") || msg.includes("no longer available")) continue;
        return res.status(500).json({ error: msg });
      }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return res.status(200).json({ reply: text });
    } catch { continue; }
  }

  return res.status(500).json({ error: "Gemini API javob bermadi. Keyinroq qaytadan urinib ko'ring." });
}