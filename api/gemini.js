// api/gemini.js — Savura Invest AI yordamchisi (bepul)
// 1) Google Gemini — faqat bepul Flash / Flash-Lite modellari (avtomatik aniqlanadi)
// 2) Groq — ikkinchi bepul AI (GROQ_KEY bo'lsa), Gemini limitga yetsa ishga tushadi
// 3) Ichki javoblar bazasi — ikkala AI ham javob bermasa, sayt haqidagi savollarga o'zi javob beradi

const LANG_RULE = {
  uz: "MUHIM: Faqat O'ZBEK tilida (lotin yozuvida) javob bering.",
  en: "IMPORTANT: Respond ONLY in ENGLISH.",
  tr: "ÖNEMLİ: Yalnızca TÜRKÇE yanıt verin.",
  ru: "ВАЖНО: Отвечайте ТОЛЬКО на РУССКОМ языке.",
  ar: "مهم: أجب باللغة العربية فقط.",
};

const SYSTEM = (lang) => `Siz "Savura Invest" saytining AI yordamchisisiz. Saytga kirgan mehmonlar va o'quvchilarga yordam berasiz.
${LANG_RULE[lang] || LANG_RULE.uz}

=== SAVURA INVEST HAQIDA ===
AQSh aksiya bozorida halol investitsiya va fundamental tahlilni o'rgatadigan o'zbek platformasi. Sayt 5 tilda (o'zbek, ingliz, turk, rus, arab), kun va tun rejimi bor.
Asoschi: Bahromaliyev Muhammadyusuf — 2020-yildan AQSh aksiya bozorida, Turkiyada iqtisod yo'nalishida tahsil oladi, Savura Invest va Savura Edu (savuraedu.com) asoschisi.
Aloqa: Telegram @savura_invest, Instagram savura_invest.

=== SAYT BO'LIMLARI (menyu ☰ orqali) ===
- "Treyding halolmi?" — forex, CFD, fyuchers, opsion, spot savdo bo'yicha shariat hukmlari (AAOIFI, islommoliyasi.uz fatvosi). Hamma uchun ochiq.
- "Ochiq darslar" — YouTube'dagi 24 ta bepul video dars, sayt ichida ketma-ket ko'riladi. Hamma uchun ochiq.
- "Aksiyalar savdosi kursi" — 8 ta modul va 100+ video dars. Asosiy mavzular: treydingga kirish, aksiyalar bilan halol treyding, fundamental tahlil, texnik tahlil, strategiyalar, risk menejment va psixologiya, real treydingni boshlash. Kursga yozilish va narx — Telegram @savura_invest orqali.
- Faqat tasdiqlangan o'quvchilar uchun: Fundamental tahlil vositasi, Kundalik (savdo jurnali, 15 savollik tekshiruv, kuzatuv ro'yxati), Demo treyding (virtual pul, real narxlar, kasr aksiyalar, T+2 belgisi), Imtihon (7 modul × 20 savol, 15 daqiqa, 70% dan o'tsa keyingi modul ochiladi, 7 tasi o'tilsa PDF sertifikat), Pattern Trainer (Breakout, Reversal, Pullback strategiyalari bo'yicha grafik mashqlari, reyting).
- Kirish tartibi: saytda email va parol bilan ro'yxatdan o'tiladi → administrator tasdiqlaydi va muddat belgilaydi → bo'limlar ochiladi.
- Sayt tepasida AQSh birjasi ochilish/yopilish vaqti turli shaharlar vaqtida ko'rsatiladi (NYSE: dush–jum, 09:30–16:00 Nyu-York vaqti; Toshkentda yozda 18:30–01:00, qishda 19:30–02:00).

=== FUNDAMENTAL TAHLIL METODOLOGIYASI ===
5 toifa: O'sish, Baholanish, Rentabellik, Moliyaviy sog'lomlik, Samaradorlik. Ma'lumotlar stockanalysis.com saytining Statistics sahifasidan olinadi.
15 savollik risk modeli: "Yo'q" javoblar soni 0–3 → PAST, 4–5 → O'RTA, 6–9 → YUQORI, 10+ → JUDA YUQORI.

=== HALOL TREYDING ===
Ruxsat etilgan: real aksiyalarni haqiqiy egalik bilan sotib olish (spot), kamida T+2 muddat ushlab turish, shariat skriningidan o'tgan kompaniyalar.
Savura Invest o'rgatmaydi va tavsiya qilmaydi: Forex, CFD, fyuchers, opsion, marja, short, kripto spekulyatsiyasi.

=== QOIDALAR ===
- Qisqa va aniq javob bering (odatda 2–5 jumla), kerak bo'lsa ro'yxat bilan.
- Hech qachon aniq "shu aksiyani sotib oling/soting" demang va narx prognozi bermang — o'quv maqsadida tushuntiring.
- Bilmagan narsangizni o'ylab topmang; kurs narxi, chegirma kabi savollarga Telegram @savura_invest ga murojaat qilishni ayting.
- Savol sayt yoki investitsiyaga aloqasiz bo'lsa, muloyimlik bilan mavzuga qaytaring.`;

// ── Ichki javoblar bazasi (AI ishlamasa) ─────────────────────────────────
const FAQ = [
  { k: ["kurs", "course", "курс", "modul", "module", "модул", "دورة", "narx", "price", "цена", "fiyat", "سعر"],
    a: {
      uz: "Aksiyalar savdosi kursi 8 ta modul va 100+ video darsdan iborat: treydingga kirish, halol treyding, fundamental tahlil, texnik tahlil, strategiyalar, risk menejment va real treydingni boshlash. Kurs dasturini menyudagi 🎓 bo'limda ko'rasiz. Narx va yozilish uchun Telegram: @savura_invest.",
      en: "The stock trading course has 8 modules and 100+ video lessons: intro to trading, halal trading, fundamental analysis, technical analysis, strategies, risk management and starting real trading. See the 🎓 course section in the menu. For price and enrollment, message us on Telegram: @savura_invest.",
      ru: "Курс по торговле акциями — 8 модулей и 100+ видеоуроков: введение, халяльный трейдинг, фундаментальный и технический анализ, стратегии, риск-менеджмент и старт реальной торговли. Программа — в разделе 🎓 меню. Цена и запись — в Telegram: @savura_invest.",
      tr: "Hisse ticareti kursu 8 modül ve 100+ video dersten oluşur: giriş, helal trading, temel ve teknik analiz, stratejiler, risk yönetimi ve gerçek işleme başlama. Program menüdeki 🎓 bölümünde. Fiyat ve kayıt için Telegram: @savura_invest.",
      ar: "تتكون دورة تداول الأسهم من 8 وحدات وأكثر من 100 درس فيديو: مقدمة، التداول الحلال، التحليل الأساسي والفني، الاستراتيجيات، إدارة المخاطر وبدء التداول الحقيقي. البرنامج في قسم 🎓 بالقائمة. للسعر والتسجيل: تيليجرام @savura_invest." } },
  { k: ["halol", "halal", "халял", "helal", "حلال", "harom", "haram", "forex", "форекс", "cfd", "kripto", "crypto"],
    a: {
      uz: "Savura Invest metodologiyasida faqat real aksiyalarni haqiqiy egalik bilan sotib olish (spot) va kamida T+2 muddat ushlab turish halol deb o'rgatiladi. Forex, CFD, fyuchers, opsion, marja va short savdolar o'rgatilmaydi. Batafsil — menyudagi ☪️ «Treyding halolmi?» bo'limida.",
      en: "In the Savura Invest methodology, only buying real shares with actual ownership (spot) and holding at least T+2 is taught as halal. Forex, CFDs, futures, options, margin and short selling are not taught. Details: the ☪️ “Is trading halal?” section in the menu.",
      ru: "В методологии Savura Invest халяльной считается только покупка реальных акций с фактическим владением (спот) и удержание минимум T+2. Форекс, CFD, фьючерсы, опционы, маржа и шорт не преподаются. Подробнее — раздел ☪️ «Халяль ли трейдинг?».",
      tr: "Savura Invest metodolojisinde yalnızca gerçek hisseleri fiili mülkiyetle almak (spot) ve en az T+2 tutmak helal olarak öğretilir. Forex, CFD, vadeli, opsiyon, marjin ve açığa satış öğretilmez. Ayrıntılar: menüdeki ☪️ «Trading helal mi?» bölümü.",
      ar: "في منهجية Savura Invest يُعلَّم أن الحلال هو شراء الأسهم الحقيقية بتملك فعلي (فوري) والاحتفاظ بها T+2 على الأقل. لا يتم تدريس الفوركس وCFD والعقود الآجلة والخيارات والهامش والبيع على المكشوف. التفاصيل في قسم ☪️ «هل التداول حلال؟»." } },
  { k: ["ro'yxat", "royxat", "kirish", "parol", "register", "sign up", "login", "password", "регистр", "войти", "пароль", "kayıt", "giriş", "şifre", "تسجيل", "دخول", "tasdiq", "approve"],
    a: {
      uz: "Menyudagi «Kirish / Ro'yxatdan o'tish» tugmasi orqali email va parol bilan ro'yxatdan o'ting. Administrator hisobingizni tasdiqlagach, Fundamental tahlil, Kundalik, Demo, Imtihon va Pattern Trainer bo'limlari ochiladi. Tezlashtirish uchun Telegram: @savura_invest.",
      en: "Use “Login / Sign up” in the menu to register with your email and a password. Once an administrator approves your account, the Fundamental analysis, Journal, Demo, Exam and Pattern Trainer sections unlock. To speed it up, message us on Telegram: @savura_invest.",
      ru: "Зарегистрируйтесь через «Вход / Регистрация» в меню (email и пароль). После одобрения администратором откроются Фундаментальный анализ, Журнал, Демо, Экзамен и Pattern Trainer. Чтобы ускорить — Telegram: @savura_invest.",
      tr: "Menüdeki «Giriş / Kayıt ol» ile e-posta ve şifreyle kayıt olun. Yönetici hesabınızı onayladığında Temel analiz, Günlük, Demo, Sınav ve Pattern Trainer açılır. Hızlandırmak için Telegram: @savura_invest.",
      ar: "سجّل من زر «دخول / تسجيل» في القائمة بالبريد وكلمة المرور. بعد موافقة المشرف تُفتح أقسام التحليل الأساسي والمفكرة والتجريبي والامتحان وPattern Trainer. للتسريع: تيليجرام @savura_invest." } },
  { k: ["imtihon", "sertifikat", "exam", "certificate", "экзамен", "сертификат", "sınav", "sertifika", "امتحان", "شهادة"],
    a: {
      uz: "Imtihon 7 moduldan iborat: har birida 20 ta savol va 15 daqiqa vaqt, savollar va variantlar har safar aralashadi. 70% dan yuqori natija keyingi modulni ochadi, xatolar to'g'ri javob bilan ko'rsatiladi. 7 modul tugagach ismingiz yozilgan PDF sertifikat olasiz.",
      en: "The exam has 7 modules, each with 20 questions and 15 minutes; questions and answer order are shuffled every time. Scoring above 70% unlocks the next module, and mistakes are shown with the right answers. After all 7 you get a PDF certificate with your name.",
      ru: "Экзамен — 7 модулей по 20 вопросов и 15 минут, вопросы и варианты каждый раз перемешиваются. Результат выше 70% открывает следующий модуль, ошибки показываются с правильными ответами. После 7 модулей — именной PDF-сертификат.",
      tr: "Sınav 7 modülden oluşur: her birinde 20 soru ve 15 dakika, sorular ve şıklar her seferinde karışır. %70 üzeri sonraki modülü açar, hatalar doğru cevaplarla gösterilir. 7 modül bitince adınıza PDF sertifika alırsınız.",
      ar: "الامتحان من 7 وحدات، في كل منها 20 سؤالاً و15 دقيقة، وتُخلط الأسئلة والخيارات كل مرة. النتيجة فوق 70% تفتح الوحدة التالية وتُعرض الأخطاء مع الإجابات الصحيحة. بعد الوحدات السبع تحصل على شهادة PDF باسمك." } },
  { k: ["p/e", "pe ", "fundamental", "фундамент", "temel", "أساسي", "tahlil", "analysis", "анализ", "analiz", "تحليل"],
    a: {
      uz: "P/E — aksiya narxining bir aksiyaga to'g'ri keladigan yillik foydaga nisbati: investor 1 dollar foyda uchun necha dollar to'layotganini ko'rsatadi. Saytdagi 🔬 Fundamental tahlil vositasi aksiyani 5 toifa (o'sish, baholanish, rentabellik, moliyaviy sog'lomlik, samaradorlik) va 15 savollik risk modeli bo'yicha baholaydi.",
      en: "P/E is the share price divided by annual earnings per share — how many dollars investors pay for each dollar of profit. The site’s 🔬 Fundamental analysis tool rates a stock across 5 categories (growth, valuation, profitability, financial health, efficiency) plus a 15-question risk model.",
      ru: "P/E — отношение цены акции к годовой прибыли на акцию: сколько долларов инвестор платит за 1 доллар прибыли. Инструмент 🔬 Фундаментальный анализ оценивает акцию по 5 категориям (рост, оценка, рентабельность, финансовое здоровье, эффективность) и 15-вопросной модели риска.",
      tr: "F/K (P/E), hisse fiyatının hisse başına yıllık kâra oranıdır: yatırımcının 1 dolar kâr için kaç dolar ödediğini gösterir. Sitedeki 🔬 Temel analiz aracı hisseyi 5 kategoride (büyüme, değerleme, kârlılık, finansal sağlık, verimlilik) ve 15 soruluk risk modeliyle değerlendirir.",
      ar: "مكرر الربحية P/E هو سعر السهم مقسوماً على الربح السنوي للسهم: كم دولاراً يدفع المستثمر مقابل دولار ربح. أداة 🔬 التحليل الأساسي في الموقع تقيّم السهم في 5 فئات (النمو، التقييم، الربحية، الصحة المالية، الكفاءة) مع نموذج مخاطر من 15 سؤالاً." } },
  { k: ["pattern", "trainer", "patern", "strategiya", "strategy", "стратег", "strateji", "استراتيج", "breakout", "reversal", "pullback"],
    a: {
      uz: "Pattern Trainer — grafik mashqlari: strategiyani tanlaysiz (Breakout, Reversal, Pullback yoki aralash), trend chizig'ini chizasiz, shamlarni ochib sinishni topasiz va narx yo'nalishini bashorat qilasiz. Oxirida bitim tahlili, ball va alohida reyting bor.",
      en: "Pattern Trainer is chart practice: pick a strategy (Breakout, Reversal, Pullback or mixed), draw the trend line, reveal candles to spot the break and predict the direction. You get a trade review, points and a separate leaderboard.",
      ru: "Pattern Trainer — тренажёр графиков: выбираете стратегию (Breakout, Reversal, Pullback или смешанную), рисуете трендовую линию, открываете свечи, находите пробой и прогнозируете направление. В конце — разбор сделки, баллы и отдельный рейтинг.",
      tr: "Pattern Trainer grafik alıştırmasıdır: strateji seçersiniz (Breakout, Reversal, Pullback veya karışık), trend çizgisi çizer, mumları açıp kırılımı bulur ve yönü tahmin edersiniz. Sonunda işlem analizi, puan ve ayrı sıralama var.",
      ar: "Pattern Trainer تمارين على الرسوم البيانية: تختار استراتيجية (اختراق، انعكاس، ارتداد أو مختلط)، ترسم خط الاتجاه، تكشف الشموع لتجد الاختراق وتتوقع الاتجاه. في النهاية تحليل للصفقة ونقاط ولوحة ترتيب." } },
  { k: ["demo", "демо", "تجريبي", "virtual", "sinov"],
    a: {
      uz: "Demo treyding — virtual pul bilan real narxlarda aksiya sotib olish va sotishni mashq qilish. Dona yoki summa bilan (kasr aksiya) olish, Stop Loss/Take Profit, T+2 belgisi bor, savdolar kundalikka avtomatik yoziladi.",
      en: "Demo trading lets you practice buying and selling stocks at real prices with virtual money. You can buy by shares or by amount (fractional), set Stop Loss/Take Profit, see the T+2 indicator, and trades go to your journal automatically.",
      ru: "Демо-трейдинг — тренировка покупки и продажи акций по реальным ценам на виртуальные деньги. Покупка по штукам или сумме (дробные акции), Stop Loss/Take Profit, индикатор T+2, сделки автоматически попадают в журнал.",
      tr: "Demo trading, sanal parayla gerçek fiyatlardan hisse alıp satmayı çalışmanızı sağlar. Adet veya tutarla (kesirli) alım, Stop Loss/Take Profit, T+2 göstergesi var; işlemler günlüğe otomatik yazılır.",
      ar: "التداول التجريبي يتيح التدرب على شراء وبيع الأسهم بأسعار حقيقية بأموال افتراضية، بالعدد أو بالمبلغ (أسهم كسرية)، مع وقف الخسارة وجني الربح ومؤشر T+2، وتُسجَّل الصفقات في المفكرة تلقائياً." } },
  { k: ["dars", "video", "youtube", "урок", "ders", "درس", "bepul", "free"],
    a: {
      uz: "Menyudagi 🎬 «Ochiq darslar» bo'limida 24 ta bepul video dars bor — ro'yxatdan o'tmasdan, sayt ichida 1-darsdan boshlab ketma-ket ko'rishingiz mumkin.",
      en: "The 🎬 “Free lessons” section in the menu has 24 free video lessons — watch them right on the site, in order from lesson 1, no sign-up needed.",
      ru: "В разделе 🎬 «Открытые уроки» 24 бесплатных видеоурока — смотрите прямо на сайте по порядку, без регистрации.",
      tr: "Menüdeki 🎬 «Açık dersler» bölümünde 24 ücretsiz video ders var — kayıt olmadan sitede 1. dersten itibaren sırayla izleyebilirsiniz.",
      ar: "في قسم 🎬 «دروس مجانية» 24 درس فيديو مجاني — شاهدها بالترتيب داخل الموقع دون تسجيل." } },
  { k: ["muhammadyusuf", "asoschi", "founder", "основател", "kurucu", "مؤسس", "kim", "who"],
    a: {
      uz: "Savura Invest asoschisi — Bahromaliyev Muhammadyusuf. 2020-yildan AQSh aksiya bozorida, Turkiyada iqtisod yo'nalishida tahsil oladi, Savura Invest va Savura Edu asoschisi. Batafsil — «Biz haqimizda» bo'limida.",
      en: "Savura Invest was founded by Muhammadyusuf Bahromaliyev. He has been in the US stock market since 2020, studies economics in Turkey, and founded Savura Invest and Savura Edu. More in the “About us” section.",
      ru: "Основатель Savura Invest — Мухаммадюсуф Бахромалиев. На рынке акций США с 2020 года, учится на экономическом в Турции, основатель Savura Invest и Savura Edu. Подробнее — «О нас».",
      tr: "Savura Invest'in kurucusu Muhammadyusuf Bahromaliyev'dir. 2020'den beri ABD hisse piyasasında, Türkiye'de iktisat okuyor; Savura Invest ve Savura Edu'nun kurucusu. Ayrıntılar «Hakkımızda» bölümünde.",
      ar: "مؤسس Savura Invest هو محمد يوسف بهرملييف، في سوق الأسهم الأمريكية منذ 2020، يدرس الاقتصاد في تركيا، ومؤسس Savura Invest وSavura Edu. المزيد في قسم «من نحن»." } },
  { k: ["soat", "vaqt", "ochil", "yopil", "hours", "open", "close", "время", "открыт", "закрыт", "saat", "açılış", "kapanış", "ساعات", "افتتاح"],
    a: {
      uz: "AQSh birjasi (NYSE/NASDAQ) dushanba–juma 09:30–16:00 Nyu-York vaqti bilan ishlaydi. Toshkent vaqti bilan yozda 18:30–01:00, qishda 19:30–02:00. Sayt tepasidagi lentada ochilish/yopilishigacha qolgan vaqt jonli ko'rsatiladi.",
      en: "The US market (NYSE/NASDAQ) trades Monday–Friday, 09:30–16:00 New York time — 18:30–01:00 Tashkent time in summer and 19:30–02:00 in winter. The strip at the top of the site shows a live countdown to the open/close.",
      ru: "Биржа США (NYSE/NASDAQ) работает пн–пт 09:30–16:00 по Нью-Йорку: по Ташкенту летом 18:30–01:00, зимой 19:30–02:00. Лента вверху сайта показывает обратный отсчёт до открытия/закрытия.",
      tr: "ABD borsası (NYSE/NASDAQ) pazartesi–cuma New York saatiyle 09:30–16:00 açıktır; Taşkent saatiyle yazın 18:30–01:00, kışın 19:30–02:00. Sitenin üstündeki şerit açılış/kapanışa kalan süreyi canlı gösterir.",
      ar: "تعمل البورصة الأمريكية (NYSE/NASDAQ) من الاثنين إلى الجمعة 09:30–16:00 بتوقيت نيويورك، أي 18:30–01:00 بتوقيت طشقند صيفاً و19:30–02:00 شتاءً. يعرض الشريط أعلى الموقع العد التنازلي للافتتاح والإغلاق." } },
];
const FAQ_DEFAULT = {
  uz: "Hozir AI yordamchi band, lekin sizga yo'l ko'rsataman: kurs haqida 🎓 bo'limda, bepul darslar 🎬 «Ochiq darslar»da, halol treyding ☪️ «Treyding halolmi?»da. Savolingizni Telegram orqali ham yuborishingiz mumkin: @savura_invest.",
  en: "The AI assistant is busy right now, but here’s where to look: the course is in 🎓, free lessons in 🎬 “Free lessons”, halal trading in ☪️ “Is trading halal?”. You can also send your question on Telegram: @savura_invest.",
  ru: "AI-помощник сейчас занят, но подскажу: о курсе — раздел 🎓, бесплатные уроки — 🎬 «Открытые уроки», халяльный трейдинг — ☪️ «Халяль ли трейдинг?». Вопрос можно задать и в Telegram: @savura_invest.",
  tr: "AI asistan şu anda meşgul ama yol göstereyim: kurs 🎓 bölümünde, ücretsiz dersler 🎬 «Açık dersler»de, helal trading ☪️ «Trading helal mi?»de. Sorunuzu Telegram'dan da iletebilirsiniz: @savura_invest.",
  ar: "المساعد الذكي مشغول الآن، لكن إليك أين تبحث: الدورة في 🎓، الدروس المجانية في 🎬 «دروس مجانية»، والتداول الحلال في ☪️ «هل التداول حلال؟». يمكنك أيضاً إرسال سؤالك عبر تيليجرام: @savura_invest.",
};
function faqAnswer(text, lang) {
  const t = " " + String(text || "").toLowerCase() + " ";
  let best = null, bestScore = 0;
  for (const item of FAQ) {
    const score = item.k.reduce((s, k) => s + (t.includes(k) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = item; }
  }
  const L = ["uz", "en", "ru", "tr", "ar"].includes(lang) ? lang : "uz";
  return best ? best.a[L] : FAQ_DEFAULT[L];
}

// ── Yordamchi funksiyalar ────────────────────────────────────────────────
const CACHE = { gemini: null, geminiTs: 0, groq: null, groqTs: 0 };
const MODEL_TTL = 6 * 60 * 60 * 1000;
const HITS = new Map(); // IP → [vaqtlar] — bepul limitni himoya qilish

function limited(ip) {
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now); HITS.set(ip, arr);
  if (HITS.size > 5000) HITS.clear();
  return arr.length > 12; // 1 daqiqada 12 dan ortiq xabar
}

async function fetchJson(url, opts = {}, ms = 8000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: ac.signal });
    let data = null; try { data = await r.json(); } catch (e) {}
    return { ok: r.ok, status: r.status, data };
  } finally { clearTimeout(t); }
}

const GEMINI_STATIC = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-3.1-flash-lite-preview", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

async function geminiModels(key) {
  if (CACHE.gemini && Date.now() - CACHE.geminiTs < MODEL_TTL) return CACHE.gemini;
  let found = [];
  try {
    const r = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${key}`, {}, 4000);
    const list = (r.data && r.data.models) || [];
    found = list
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => String(m.name || "").replace(/^models\//, ""))
      .filter((n) => /^gemini-/.test(n) && /flash/.test(n) && !/(pro|image|tts|audio|live|embed|native|thinking|computer|robotics|8b)/.test(n))
      .sort((a, b) => {
        const la = /lite/.test(a) ? 1 : 0, lb = /lite/.test(b) ? 1 : 0;
        if (la !== lb) return la - lb;                        // avval Flash, keyin Flash-Lite
        const va = parseFloat((a.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
        const vb = parseFloat((b.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
        if (vb !== va) return vb - va;                       // yangi versiya oldin
        const pa = /(preview|exp)/.test(a) ? 1 : 0, pb = /(preview|exp)/.test(b) ? 1 : 0;
        return pa - pb;                                       // barqaror versiya oldin
      })
      .slice(0, 6);
  } catch (e) {}
  const merged = [...new Set([...found, ...GEMINI_STATIC])];
  CACHE.gemini = merged; CACHE.geminiTs = Date.now();
  return merged;
}

async function askGemini(key, lang, messages, deadline, diag) {
  const models = await geminiModels(key);
  const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  for (const model of models) {
    const left = deadline - Date.now();
    if (left < 1500) break;
    const gen = { temperature: 0.6, maxOutputTokens: 2048 };
    if (/^gemini-2\.5-flash/.test(model)) gen.thinkingConfig = { thinkingBudget: 0 };
    try {
      const r = await fetchJson(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM(lang) }] }, contents, generationConfig: gen }) },
        Math.min(9000, left - 500)
      );
      if (!r.ok) { diag.push(`gemini:${model}:${r.status}`); continue; }   // limit/topilmadi → keyingi model
      const parts = (((r.data || {}).candidates || [])[0] || {}).content?.parts || [];
      const text = parts.filter((p) => !p.thought).map((p) => p.text || "").join("").trim();
      if (text) return { text, model };
      diag.push(`gemini:${model}:empty`);
    } catch (e) { diag.push(`gemini:${model}:${e.name}`); }
  }
  return null;
}

const GROQ_PREF = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "qwen/qwen3-32b", "meta-llama/llama-4-scout-17b-16e-instruct", "openai/gpt-oss-20b", "llama-3.1-8b-instant"];

async function groqModels(key) {
  if (CACHE.groq && Date.now() - CACHE.groqTs < MODEL_TTL) return CACHE.groq;
  let ids = [];
  try {
    const r = await fetchJson("https://api.groq.com/openai/v1/models", { headers: { Authorization: `Bearer ${key}` } }, 4000);
    ids = ((r.data && r.data.data) || []).map((m) => m.id).filter((id) => !/(whisper|guard|tts|orpheus|playai|compound|distil)/i.test(id));
  } catch (e) {}
  const ordered = ids.length ? [...GROQ_PREF.filter((p) => ids.includes(p)), ...ids.filter((i) => !GROQ_PREF.includes(i))] : GROQ_PREF;
  CACHE.groq = ordered.slice(0, 4); CACHE.groqTs = Date.now();
  return CACHE.groq;
}

async function askGroq(key, lang, messages, deadline, diag) {
  const models = await groqModels(key);
  for (const model of models) {
    const left = deadline - Date.now();
    if (left < 1500) break;
    try {
      const r = await fetchJson("https://api.groq.com/openai/v1/chat/completions",
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({ model, temperature: 0.6, max_tokens: 700,
            messages: [{ role: "system", content: SYSTEM(lang) }, ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))] }) },
        Math.min(9000, left - 500));
      if (!r.ok) { diag.push(`groq:${model}:${r.status}`); continue; }
      let text = (((r.data || {}).choices || [])[0] || {}).message?.content || "";
      text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      if (text) return { text, model };
      diag.push(`groq:${model}:empty`);
    } catch (e) { diag.push(`groq:${model}:${e.name}`); }
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(200).end();

  const GEMINI_KEY = process.env.GEMINI_KEY;
  const GROQ_KEY = process.env.GROQ_KEY || process.env.GROQ_API_KEY;

  // Holatni tekshirish: /api/gemini?diag=1
  if (req.method === "GET") {
    const out = { gemini_key: !!GEMINI_KEY, groq_key: !!GROQ_KEY };
    if (req.query && req.query.diag === "1") {
      if (GEMINI_KEY) out.gemini_models = await geminiModels(GEMINI_KEY);
      if (GROQ_KEY) out.groq_models = await groqModels(GROQ_KEY);
    }
    return res.status(200).json(out);
  }
  if (req.method !== "POST") return res.status(405).end();

  const { messages, lang = "uz" } = req.body || {};
  const L = ["uz", "en", "ru", "tr", "ar"].includes(lang) ? lang : "uz";
  const clean = (Array.isArray(messages) ? messages : [])
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content.slice(0, 1500) }));
  while (clean.length && clean[0].role === "assistant") clean.shift();   // suhbat foydalanuvchidan boshlanadi
  if (!clean.length) return res.status(400).json({ error: "messages required" });
  const lastUser = [...clean].reverse().find((m) => m.role === "user")?.content || "";

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  if (limited(ip)) return res.status(200).json({ reply: faqAnswer(lastUser, L), source: "faq-rate" });

  const deadline = Date.now() + 9500;
  const diag = [];
  if (GEMINI_KEY) {
    const g = await askGemini(GEMINI_KEY, L, clean, deadline, diag);
    if (g) return res.status(200).json({ reply: g.text, source: "gemini", model: g.model });
  }
  if (GROQ_KEY) {
    const q = await askGroq(GROQ_KEY, L, clean, deadline, diag);
    if (q) return res.status(200).json({ reply: q.text, source: "groq", model: q.model });
  }
  console.error("AI javob bermadi:", diag.join(" | "));
  return res.status(200).json({ reply: faqAnswer(lastUser, L), source: "faq", diag });
}