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
Kurs tarkibi:
- Video darslar: har bir mavzu bo'yicha professional video darslar
- Jonli efirlar: haftada 1 marta muallif bilan to'g'ridan-to'g'ri suhbat
- Amaliy mashqlar (praktika): real aksiyalar tahlili
- Qo'shimcha fayllar va materiallar: har bir dars uchun alohida
- Signallar: kurs davomida savdo signallari beriladi
Kursni tugatgandan keyin: maxsus yopiq guruhga qo'shilasiz. U guruhda tajribali treyderlar har kun o'z hisoblarini boshqarish, yangi imkoniyatlar va strategiyalar haqida maslahat berishadi.

=== KURS EGASI ===
Bahromaliyev Muhammadyusuf:
- 2020-yildan buyon AQSh aksiya bozorida treyding va investitsiya sohasida
- Istanbul shahrida Iqtisodiyot yo'nalishida tahsil olmoqda
- Kompaniyalar huquqi va buxgalteriya mutaxassisi
- Savura Invest platformasi asoschisi (2020-yildan)
- 100+ aksiya tahlili tajribasi
- Savura Invest fundamental tahlil metodologiyasi muallifi
- Savuraerp.com — ERP sistemasi asoschisi

=== FUNDAMENTAL TAHLIL METODOLOGIYASI ===
15 savol asosida risk baholanadi. 5 toifa: O'sish, Baholanish, Rentabellik, Moliyaviy Sog'lomlik, Samaradorlik.
Risk darajalari: PAST (0-3 yoq), O'RTA (4-5), YUQORI (6-9), JUDA YUQORI (10+).

=== QOIDALAR ===
- O'zbek tilida javob bering
- Qisqa va aniq (3-5 jumla)
- Aniq "sotib oling/soting" maslahat bermang`;

  const contents = [
    { role: "user", parts: [{ text: SYSTEM }] },
    { role: "model", parts: [{ text: "Savura Invest AI yordamchisi tayyor. Savol bering!" }] },
    ...messages.slice(-10).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }))
  ];

  // Try models in order until one works
  const MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro"
  ];

  for (const model of MODELS) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
          })
        }
      );
      const data = await r.json();

      // Skip if model not found
      if (!r.ok) {
        const errMsg = data?.error?.message || "";
        if (errMsg.includes("not found") || errMsg.includes("not supported")) continue;
        return res.status(500).json({ error: errMsg });
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return res.status(200).json({ reply: text, model });

    } catch (e) { continue; }
  }

  return res.status(500).json({ error: "Hech bir Gemini modeli javob bermadi. API keyni tekshiring." });
}