// api/gemini.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body || {};
  if (!messages?.length) return res.status(400).json({ error: "messages required" });

  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_KEY Vercel Environment Variables da yo'q. Settings → Environment Variables → GEMINI_KEY qo'shing." });

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
- 2020-yildan buyon AQSh aksiya bozorida treyding va investitsiya sohasida faoliyat ko'rsatadi
- Istanbul shahrida Iqtisodiyot yo'nalishida tahsil olmoqda
- Kompaniyalar huquqi va buxgalteriya mutaxassisi
- Savura Invest platformasi asoschisi (2020-yildan)
- 100+ aksiya tahlili tajribasi bor
- Savura Invest fundamental tahlil metodologiyasi muallifi
- Savuraerp.com — ERP sistemasi asoschisi
- Savura Invest — O'zbekiston investorlari uchun AQSh aksiya bozorida ongli va halol investitsiya yo'lini ko'rsatib kelayotgan platforma

=== FUNDAMENTAL TAHLIL METODOLOGIYASI ===
15 savol asosida risk baholanadi. 5 toifa: O'sish, Baholanish, Rentabellik, Moliyaviy Sog'lomlik, Samaradorlik.
Risk darajalari: PAST (0-3 yo'q), O'RTA (4-5), YUQORI (6-9), JUDA YUQORI (10+).
14 va 15-savollar har doim "Yo'q" — kutilmagan risklar har doim mavjud.

=== QOIDALAR ===
- O'zbek tilida javob bering
- Qisqa va aniq (4-6 jumla)
- "Bu aksiyani sotib oling/soting" kabi aniq maslahat bermang
- Agar aloqasiz savol bo'lsa: "Bu mavzu bo'yicha yordam bera olmayman, fundamental tahlil yoki kurs haqida so'rang"`;

  const history = messages.slice(-10);
  const contents = [
    { role: "user", parts: [{ text: SYSTEM }] },
    { role: "model", parts: [{ text: "Tushunarli! Savura Invest AI yordamchisi sifatida xizmat qilishga tayyorman." }] },
    ...history.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }))
  ];

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 400 } })
      }
    );
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data?.error?.message || "Gemini API xatosi" });
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Javob topilmadi.";
    res.status(200).json({ reply: text });
  } catch (e) {
    res.status(500).json({ error: "Tarmoq xatosi: " + e.message });
  }
}
