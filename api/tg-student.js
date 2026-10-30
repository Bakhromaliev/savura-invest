// api/tg-student.js — yangi o'quvchi ro'yxatdan o'tganda Telegramga xabar + tugmalar (tasdiqlash/rad)
// Vercel env: TELEGRAM_BOT_TOKEN (mavjud), TELEGRAM_CHAT_ID (ixtiyoriy), TG_HOOK_SECRET (yangi, maxfiy)
const DEFAULT_CHAT_ID = "-5296428638";
const SB_URL = "https://xxrjcyofbgmcqzoaaktq.supabase.co";
const ANON = "";
const esc = (t) => String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tg = async (token, method, body) => {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  try { return await r.json(); } catch { return { ok: false }; }
};

export default async function handler(req, res) {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN, SECRET = process.env.TG_HOOK_SECRET;
  const CHAT = String(process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID);
  if (!TOKEN || !SECRET) return res.status(500).json({ ok: false, error: "config" });

  // 1) Bir martalik sozlash: /api/tg-student?setup=SECRET  → Telegram webhook o'rnatadi
  if (req.method === "GET") {
    if (req.query.setup !== SECRET) return res.status(403).json({ ok: false });
    const r = await tg(TOKEN, "setWebhook", { url: "https://savurainvest.com/api/tg-student", secret_token: SECRET, allowed_updates: ["callback_query"] });
    return res.status(200).json(r);
  }
  if (req.method !== "POST") return res.status(405).end();
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

  // 2) Telegram tugma bosildi
  if (body.callback_query) {
    if (req.headers["x-telegram-bot-api-secret-token"] !== SECRET) return res.status(403).end();
    const cq = body.callback_query, msg = cq.message;
    if (!msg || String(msg.chat.id) !== CHAT) { await tg(TOKEN, "answerCallbackQuery", { callback_query_id: cq.id, text: "Ruxsat yo'q" }); return res.status(200).json({ ok: true }); }
    const m = /^s:([0-9a-f-]{36}):(\d+)$/.exec(cq.data || "");
    if (!m) return res.status(200).json({ ok: true });
    const months = parseInt(m[2], 10);
    const r = await fetch(SB_URL + "/rest/v1/rpc/tg_decide", { method: "POST",
      headers: { "Content-Type": "application/json", apikey: process.env.SUPABASE_ANON_KEY || ANON, Authorization: "Bearer " + (process.env.SUPABASE_ANON_KEY || ANON) },
      body: JSON.stringify({ p_secret: SECRET, p_id: m[1], p_months: months }) });
    const ok = r.ok;
    const who = cq.from && (cq.from.first_name || cq.from.username) || "admin";
    const label = months === 0 ? "❌ RAD QILINDI" : `✅ TASDIQLANDI — ${months} oy`;
    await tg(TOKEN, "answerCallbackQuery", { callback_query_id: cq.id, text: ok ? label : "Xatolik" });
    if (ok) await tg(TOKEN, "editMessageText", { chat_id: msg.chat.id, message_id: msg.message_id, parse_mode: "HTML",
      text: (msg.text || "") + `\n\n<b>${label}</b> (${esc(who)})` });
    return res.status(200).json({ ok: true });
  }

  // 3) Bazadan (trigger) yangi o'quvchi haqida xabar
  if (req.headers["x-hook-secret"] !== SECRET) return res.status(403).end();
  const { id, email, name } = body;
  if (!id || !email) return res.status(400).end();
  const text = `🆕 <b>Yangi o'quvchi arizasi</b>\n\n👤 ${esc(name) || "—"}\n📧 ${esc(email)}\n\nNecha oyga tasdiqlaysiz?`;
  const k = (m) => ({ text: `✅ ${m} oy`, callback_data: `s:${id}:${m}` });
  const r = await tg(TOKEN, "sendMessage", { chat_id: CHAT, text, parse_mode: "HTML",
    reply_markup: { inline_keyboard: [[k(1), k(3), k(6)], [k(12), { text: "❌ Rad qilish", callback_data: `s:${id}:0` }]] } });
  return res.status(200).json({ ok: !!r.ok });
}
