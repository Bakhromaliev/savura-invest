// api/playlist.js — YouTube playlist videolarini tartib bilan qaytaradi (1, 2, 3 ... 24)
// API kalit kerak emas. Natija serverda 30 daqiqa keshlanadi.
const PL_DEFAULT = "PLDSRKA6X73aE";
const CACHE = {};                 // { listId: { data, ts } }
const TTL = 30 * 60 * 1000;

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  "Cookie": "CONSENT=YES+1; SOCS=CAI",
};

function unesc(s) {
  try { return JSON.parse('"' + s + '"'); } catch (e) { return s; }
}

// 1-usul: playlist sahifasidagi ytInitialData (playlistVideoRenderer)
function parseRenderer(html) {
  const items = []; const seen = new Set();
  const re = /"playlistVideoRenderer":\{"videoId":"([\w-]{11})"/g;
  let m;
  while ((m = re.exec(html))) {
    const id = m[1];
    if (seen.has(id)) continue;
    seen.add(id);
    const next = html.indexOf('"playlistVideoRenderer"', m.index + 30);
    const chunk = html.slice(m.index, next > 0 ? next : m.index + 8000);
    let title = null;
    const t1 = chunk.match(/"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/);
    const t2 = chunk.match(/"title":\{"simpleText":"((?:[^"\\]|\\.)*)"/);
    if (t1) title = unesc(t1[1]); else if (t2) title = unesc(t2[1]);
    const lm = chunk.match(/"lengthText":\{.*?"simpleText":"([\d:]+)"/);
    items.push({ id, title, length: lm ? lm[1] : null });
  }
  return items;
}

// 2-usul: yangi dizayn (lockupViewModel)
function parseLockup(html) {
  const items = []; const seen = new Set();
  const re = /"contentId":"([\w-]{11})","contentType":"LOCKUP_CONTENT_TYPE_VIDEO"/g;
  let m;
  while ((m = re.exec(html))) {
    const id = m[1];
    if (seen.has(id)) continue;
    seen.add(id);
    const chunk = html.slice(m.index, m.index + 12000);
    const t = chunk.match(/"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/);
    const l = chunk.match(/"text":"(\d{1,2}:\d{2}(?::\d{2})?)"/);
    items.push({ id, title: t ? unesc(t[1]) : null, length: l ? l[1] : null });
  }
  return items;
}

// 3-usul: RSS (faqat oxirgi 15 ta videoni beradi)
function parseRss(xml) {
  const items = [];
  const re = /<entry>[\s\S]*?<yt:videoId>([\w-]{11})<\/yt:videoId>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<\/entry>/g;
  let m;
  while ((m = re.exec(xml))) {
    const title = m[2].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    items.push({ id: m[1], title, length: null });
  }
  return items;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const list = String(req.query.list || PL_DEFAULT).replace(/[^\w-]/g, "");
  const now = Date.now();
  const c = CACHE[list];
  if (c && now - c.ts < TTL) {
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");
    return res.status(200).json({ ...c.data, cached: true });
  }

  let items = []; let source = null; const errors = [];
  try {
    const r = await fetch(`https://www.youtube.com/playlist?list=${list}&hl=en`, { headers: HEADERS });
    const html = await r.text();
    items = parseRenderer(html); source = "renderer";
    if (!items.length) { items = parseLockup(html); source = "lockup"; }
    if (!items.length) errors.push("html: " + r.status + " (" + html.length + " bayt)");
  } catch (e) { errors.push("html: " + e.message); }

  if (!items.length) {
    try {
      const r = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${list}`, { headers: HEADERS });
      items = parseRss(await r.text()); source = "rss";
    } catch (e) { errors.push("rss: " + e.message); }
  }

  if (!items.length) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ list, count: 0, items: [], source: null, errors });
  }

  const data = { list, count: items.length, items, source };
  CACHE[list] = { data, ts: now };
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");
  return res.status(200).json(data);
}
