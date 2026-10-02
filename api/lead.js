// api/lead.js — Shogirdlik dasturi arizalarini Telegram guruhiga yuboradi
// Vercel → Settings → Environment Variables:
//   TELEGRAM_BOT_TOKEN = bot tokeni (BotFather'dan)      ← MAXFIY, kodga yozilmaydi
//   TELEGRAM_CHAT_ID   = guruh ID'si (masalan -5296428638) ← ixtiyoriy, yozilmasa quyidagisi ishlatiladi
const DEFAULT_CHAT_ID = "-5296428638";
const HITS = new Map(); // IP → [vaqtlar] — spamdan himoya

function limited(ip) {
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  arr.push(now); HITS.set(ip, arr);
  if (HITS.size > 5000) HITS.clear();
  return arr.length > 4; // 10 daqiqada 4 tadan ortiq ariza bo'lmaydi
}
const esc = (t) => String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clean = (t, max) => String(t || "").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim().slice(0, max);

const SRC = { home: "Bosh sahifa", program: "Shogirdlik dasturi sahifasi" };
const CONTACT = { call: "📞 Qo'ng'iroq orqali", telegram: "✈️ Telegram orqali" };

async function tgSend(token, chatId, text) {
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  let data = null; try { data = await r.json(); } catch (e) {}
  return data || { ok: false, description: "HTTP " + r.status };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method" });

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT = process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID;
  if (!TOKEN) { console.error("TELEGRAM_BOT_TOKEN o'rnatilmagan"); return res.status(500).json({ ok: false, error: "config" }); }

  const b = req.body || {};
  // Spam-bot tuzog'i: oddiy foydalanuvchi bu yashirin maydonni ko'rmaydi
  if (b.website) return res.status(200).json({ ok: true });

  const name = clean(b.name, 60);
  const phone = clean(b.phone, 24);
  const contact = b.contact === "telegram" ? "telegram" : "call";
  const tgUser = clean(b.tg, 40).replace(/^@?/, "@");
  const message = clean(b.message, 1000);
  const lang = ["uz", "en", "ru", "tr", "ar"].includes(b.lang) ? b.lang : "uz";
  const source = SRC[b.source] || "Sayt";

  const digits = phone.replace(/\D/g, "");
  if (name.length < 2) return res.status(400).json({ ok: false, error: "name" });
  const badPhone = !/^[+\d\s()\-]+$/.test(phone) || (digits.startsWith("998") ? digits.length !== 12 : (digits.length < 9 || digits.length > 15));
  if (badPhone) return res.status(400).json({ ok: false, error: "phone" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  if (limited(ip)) return res.status(429).json({ ok: false, error: "rate" });

  const time = new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date());
  const lines = [
    "🆕 <b>Shogirdlik dasturi — yangi ariza</b>",
    "",
    `👤 <b>Ism:</b> ${esc(name)}`,
    `📱 <b>Telefon:</b> <code>${esc(phone)}</code>`,
    `💬 <b>Bog'lanish:</b> ${CONTACT[contact]}${contact === "telegram" && tgUser.length > 1 ? " — " + esc(tgUser) : ""}`,
  ];
  if (message) lines.push("", `📝 <b>Xabar:</b>\n${esc(message)}`);
  lines.push("", `🌐 ${lang.toUpperCase()} · ${esc(source)} · 🕒 ${time} (Toshkent)`);
  const text = lines.join("\n");

  let r = await tgSend(TOKEN, CHAT, text);
  // Guruh "supergroup"ga aylangan bo'lsa, Telegram yangi ID beradi — o'sha bilan qayta yuboramiz
  if (!r.ok && r.parameters && r.parameters.migrate_to_chat_id) {
    console.warn("Guruh ID'si o'zgargan, yangisi:", r.parameters.migrate_to_chat_id, "— TELEGRAM_CHAT_ID ni yangilang");
    r = await tgSend(TOKEN, String(r.parameters.migrate_to_chat_id), text);
  }
  if (!r.ok) { console.error("Telegram xatosi:", r.description); return res.status(502).json({ ok: false, error: "telegram", detail: r.description }); }
  return res.status(200).json({ ok: true });
}
