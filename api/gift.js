// api/gift.js — "Kitob sovg'a" testi. GET: 10 ta savol. POST: tekshirish (70% dan o'tsa kitob havolasi).
import BANK from "./_bank.js";

const TOTAL = 20;
const PASS = 14; // 70%
const SB_URL = process.env.SUPABASE_URL || "https://xxrjcyofbgmcqzoaaktq.supabase.co";
const SB_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cmpjeW9mYmdtY3F6b2Fha3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjQwNDYsImV4cCI6MjA5Njk0MDA0Nn0.EAA4GKKQx6VjXQsa753A0hijVIh6dIw-csb6HhtVoUk";
// Kitob fayli Supabase Storage'dagi ochiq "kitob" bucket'iga shu nom bilan yuklanadi
const BOOK_BASE = SB_URL + "/storage/v1/object/public/kitob/";
const BOOKS = [
  { lang:"uz", label:"O'zbekcha", file:"halol-uz-k7Qx2.pdf" },
  { lang:"ru", label:"Русский",   file:"halol-ru-k7Qx2.pdf" },
  { lang:"tr", label:"Türkçe",    file:"halol-tr-k7Qx2.pdf" },
  { lang:"en", label:"English",   file:"halol-en-k7Qx2.pdf" },
  { lang:"ar", label:"العربية",   file:"halol-ar-k7Qx2.pdf" },
].map(b=>({ lang:b.lang, label:b.label, url:BOOK_BASE+b.file }));

function shuffle(a){ const r=a.slice(); for(let i=r.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [r[i],r[j]]=[r[j],r[i]]; } return r; }

function pickQuestions(){
  const byT={}; BANK.forEach((q,i)=>{ (byT[q.t]=byT[q.t]||[]).push(i); });
  const chosen=[];
  Object.keys(byT).forEach(t=>{ shuffle(byT[t]).slice(0,2).forEach(i=>chosen.push(i)); }); // har mavzudan ikkitadan
  const rest=shuffle(BANK.map((_,i)=>i).filter(i=>!chosen.includes(i)));
  while(chosen.length<TOTAL && rest.length) chosen.push(rest.shift());
  return shuffle(chosen).map(id=>({ id, t:BANK[id].t, q:BANK[id].q, o:shuffle(BANK[id].o) }));
}

async function saveResult(row){
  try{
    await fetch(SB_URL+"/rest/v1/gift_results",{ method:"POST",
      headers:{ apikey:SB_KEY, Authorization:"Bearer "+SB_KEY, "Content-Type":"application/json", Prefer:"return=minimal" },
      body:JSON.stringify(row) });
  }catch(e){}
}
async function notify(text){
  const tk=process.env.TELEGRAM_BOT_TOKEN, ch=process.env.TELEGRAM_CHAT_ID; if(!tk||!ch) return;
  try{ await fetch("https://api.telegram.org/bot"+tk+"/sendMessage",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ chat_id:ch, text }) }); }catch(e){}
}

export default async function handler(req, res){
  res.setHeader("Cache-Control","no-store");
  if(req.method==="GET") return res.status(200).json({ total:TOTAL, pass:PASS, questions:pickQuestions() });
  if(req.method!=="POST") return res.status(405).json({ error:"method" });

  let b=req.body; if(typeof b==="string"){ try{ b=JSON.parse(b); }catch(e){ b={}; } } b=b||{};
  const email=String(b.email||"").trim().toLowerCase();
  if(!/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length>120) return res.status(400).json({ error:"email" });
  const ans=Array.isArray(b.answers)?b.answers:[];
  const seen=new Set(); let score=0; const wrong=[];
  ans.slice(0,TOTAL).forEach(x=>{
    const id=Number(x&&x.id); if(!Number.isInteger(id)||id<0||id>=BANK.length||seen.has(id)) return; seen.add(id);
    const q=BANK[id];
    if(String(x.a)===q.o[0]) score++; else wrong.push({ id, q:q.q, correct:q.o[0], e:q.e });
  });
  if(seen.size<TOTAL) return res.status(400).json({ error:"answers" });
  const passed=score>=PASS;
  await saveResult({ email, score, total:TOTAL, passed });
  if(passed) await notify("Sovg'a testi: "+email+" — "+score+"/"+TOTAL+" (kitob berildi)");
  return res.status(200).json({ score, total:TOTAL, pass:PASS, passed, wrong, books: passed?BOOKS:null });
}
