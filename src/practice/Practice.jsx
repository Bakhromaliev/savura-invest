import React, { useState, useEffect, useMemo, useRef } from "react";
import { B1, B2 } from "./bank1.js";
import { B3, B4, B5 } from "./bank2.js";
import { B6, B7, B8, B9, B10 } from "./bank3.js";
import { GENS, SHUF, ema } from "./gen.js";

const BANK = {1:B1,2:B2,3:B3,4:B4,5:B5,6:B6,7:B7,8:B8,9:B9,10:B10};
const LS = "savura_practice_v1";
const PTS = {1:10,2:15,3:25};
const DAILY_CAP = 8; // bir kunda har jonli mashq turidan ball beriladigan savollar
const RANKS = [[0,"Yangi o'quvchi","🌱"],[150,"Shogird","📘"],[500,"Treyder","📈"],[1200,"Usta treyder","🎯"],[2500,"Ustoz-treyder","🏆"],[5000,"Bozor bo'ri","🐺"],[9000,"Afsonaviy","👑"]];
const PRAISE = ["Gap yo'q, treyder! 🔥","Barakalla, usta! 👏","Ofarin! Bozor sizdan qo'rqadi 😎","Zo'r-ku! Aynan shunday 🎯","Ana xolos, haqiqiy treyder! 💪","Mana bu ish, ustoz! 🚀","Qoyilman! Aniq nishonga 🏹","Bahaybat! Davom eting ⚡","Tilla fikr — to'g'ri topdingiz ✨","Barakalla, bozorni o'qiyapsiz 📊"];
const STREAKP = {3:"3 ta ketma-ket! Olov bo'lib ketdingiz 🔥",5:"5 ta ketma-ket — to'xtovsiz treyder! ⚡",7:"7 ta ketma-ket — zo'r intizom! 💎",10:"10 ta ketma-ket — AFSONAVIY! 👑",15:"15 ta ketma-ket — bozor sizniki! 🦅"};
const MISS = ["Zarar yo'q — saboq bor. Tushuntirishni o'qing 📖","Xato — o'qituvchi. Keyingisida aniq topasiz 💡","Yaqin edi! Sababini ko'rib oling 🔍","Treyder xatodan o'sadi. Tushuntirish pastda 👇"];
const pick = a => a[Math.floor(Math.random()*a.length)];
const today = () => new Date().toISOString().slice(0,10).replace(/-/g,"");
const rankOf = p => { let r = RANKS[0], nx = null; for (let i=0;i<RANKS.length;i++){ if (p>=RANKS[i][0]) { r=RANKS[i]; nx=RANKS[i+1]||null; } } return {r,nx}; };

function lsLoad(){ try { return JSON.parse(localStorage.getItem(LS)) || {done:{}, mod:{}}; } catch { return {done:{}, mod:{}}; } }
function lsSave(v){ try { localStorage.setItem(LS, JSON.stringify(v)); } catch {} }

// ── Grafik (SVG) ──
function Chart({chart, C}){
  const cs = chart.candles, W=320, H=170, P=10, n=cs.length;
  const hi = Math.max(...cs.map(c=>c[1])), lo = Math.min(...cs.map(c=>c[2]));
  const y = v => P + (hi - v) / (hi - lo || 1) * (H - 2*P);
  const bw = (W - 2*P) / n, x = i => P + bw*i + bw/2;
  const e = chart.ema ? ema(cs.map(c=>c[3]), 5) : null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:460,display:"block",margin:"0 auto",background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:12}}>
      {chart.level && <g><line x1={P} x2={W-P} y1={y(chart.level.y)} y2={y(chart.level.y)} stroke={C.amber} strokeDasharray="4 4" strokeWidth="1"/><text x={W-P-2} y={y(chart.level.y)-3} fontSize="8" fill={C.amber} textAnchor="end">{chart.level.label}</text></g>}
      {cs.map((c,i)=>{ const up=c[3]>=c[0]; const col=up?C.greenLt:C.red; const top=y(Math.max(c[0],c[3])), bot=y(Math.min(c[0],c[3]));
        return <g key={i}><line x1={x(i)} x2={x(i)} y1={y(c[1])} y2={y(c[2])} stroke={col} strokeWidth="1.2"/><rect x={x(i)-bw*0.32} y={top} width={bw*0.64} height={Math.max(1.2,bot-top)} fill={col} rx="0.8"/></g>; })}
      {e && <polyline fill="none" stroke={C.blueLt} strokeWidth="1.4" points={e.map((v,i)=>`${x(i)},${y(v)}`).join(" ")}/>}
      {e && <text x={P+2} y={H-4} fontSize="8" fill={C.blueLt}>— EMA</text>}
    </svg>
  );
}

// ── Kartalar ──
function Card({q, C}){
  const c = q.card; if (!c) return null;
  const rows = q.gen==="halal"
    ? [["Kompaniya",c.name],["Faoliyat",c.sector],["Bozor kapitallashuvi",c.cap+" mlrd $"],["Foizli qarz",c.debt+" mlrd $"],["Naqd + foizli aktivlar",c.cash+" mlrd $"],["Harom daromad ulushi",c.haram+"%"]]
    : [["Kompaniya",c.name],["Bozor kapitallashuvi",c.cap+" mlrd $"],["Daromad (yillik)",c.rev+" mlrd $"],["Sof foyda",c.ni+" mlrd $"],...(c.eq?[["Xususiy kapital",c.eq+" mlrd $"]]:[])];
  return (
    <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",marginBottom:12}}>
      {rows.map(([k,v],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",gap:10,fontSize:13,padding:"4px 0",borderBottom:i<rows.length-1?`1px dashed ${C.border}`:"none"}}><span style={{color:C.dim}}>{k}</span><b style={{color:C.text,textAlign:"right"}}>{v}</b></div>))}
    </div>
  );
}

export default function PracticePage({ C, sb, getUid, BackBtn, setPage, lang, auth, modNames }){
  const names = modNames || [];
  const [store, setStore] = useState(lsLoad);
  const [view, setView] = useState("home"); // home | play | end | lb
  const [session, setSession] = useState(null);
  const [lb, setLb] = useState(null);
  const sync = useRef(false);

  // bulutdan yuklash
  useEffect(()=>{ (async()=>{
    if (!sb) return; const uid = await getUid(); if (!uid) return;
    try {
      const {data,error} = await sb.from("practice_done").select("qid,pts,module");
      if (error || !data) return;
      setStore(s=>{ const d={...s.done}; const m={...s.mod}; data.forEach(r=>{ d[r.qid]=Math.max(d[r.qid]||0,r.pts); m[r.qid]=r.module; }); const v={done:d,mod:m}; lsSave(v); return v; });
      sync.current = true;
    } catch {}
  })(); }, []);

  const total = useMemo(()=>Object.values(store.done).reduce((a,b)=>a+b,0), [store]);
  const {r:rank, nx} = rankOf(total);
  const solvedIn = m => Object.keys(store.done).filter(k=>k.startsWith("m"+m+"-")).length;
  const ptsIn = m => Object.keys(store.done).filter(k=>k.startsWith("m"+m+"-")).reduce((a,k)=>a+store.done[k],0);

  const prep = (item) => { const o = SHUF(item.opts.map((t,i)=>({t,ok:i===item.ans}))); return {...item, opts:o.map(x=>x.t), ans:o.findIndex(x=>x.ok)}; };
  const bankItem = (m,i) => { const b = BANK[m][i]; return prep({qid:`m${m}-${i}`, mod:m, d:b[0], q:b[1], opts:b[2], ans:b[3], expl:b[4]}); };
  const genItem = (kind, mod) => { const g = GENS[kind].fn(); return prep({...g, gen:kind, mod}); };

  function start(mode, arg){
    let items = [];
    if (mode==="mod"){
      const m = arg; const idx = BANK[m].map((_,i)=>i);
      const fresh = SHUF(idx.filter(i=>!(`m${m}-${i}` in store.done))), old = SHUF(idx.filter(i=>`m${m}-${i}` in store.done));
      const gens = Object.keys(GENS).filter(k=>GENS[k].mods.includes(m));
      const nG = gens.length ? 4 : 0, nB = 10 - nG;
      const pickB = [...fresh, ...old].slice(0, nB);
      items = pickB.map(i=>bankItem(m,i));
      for (let k=0;k<nG;k++) items.push(genItem(gens[k%gens.length], m));
      items = SHUF(items);
    } else if (mode==="gen"){
      for (let k=0;k<10;k++) items.push(genItem(arg, GENS[arg].mods[0]));
    } else { // aralash
      const all = []; for (let m=1;m<=10;m++) BANK[m].forEach((_,i)=>all.push([m,i]));
      const fresh = SHUF(all.filter(([m,i])=>!(`m${m}-${i}` in store.done))), old = SHUF(all.filter(([m,i])=>`m${m}-${i}` in store.done));
      items = [...fresh, ...old].slice(0,7).map(([m,i])=>bankItem(m,i));
      const gk = Object.keys(GENS); for (let k=0;k<3;k++){ const g = pick(gk); items.push(genItem(g, GENS[g].mods[0])); }
      items = SHUF(items);
    }
    setSession({items, i:0, sel:null, streak:0, best:0, right:0, gained:0, msg:"", mode, arg});
    setView("play");
    window.scrollTo({top:0});
  }

  function award(it, ok, streak){
    if (!ok) return 0;
    let qid = it.qid, repeat = false;
    if (it.gen){
      const pre = `g-${it.gen}-${today()}-`;
      const used = Object.keys(store.done).filter(k=>k.startsWith(pre)).length;
      if (used >= DAILY_CAP) return 0; qid = pre + used;
    } else if (qid in store.done) return 0;
    const bonus = streak>=3 ? Math.min(10,(streak-2)*2) : 0;
    const pts = PTS[it.d||1] + bonus;
    setStore(s=>{ const v = {done:{...s.done,[qid]:pts}, mod:{...s.mod,[qid]:it.mod}}; lsSave(v); return v; });
    (async()=>{ try { if (!sb) return; const uid = await getUid(); if (!uid) return; await sb.from("practice_done").upsert({user_id:uid,qid,module:it.mod,pts},{onConflict:"user_id,qid"}); } catch {} })();
    return pts;
  }

  function choose(k){
    if (!session || session.sel!==null) return;
    const it = session.items[session.i]; const ok = k===it.ans;
    const streak = ok ? session.streak+1 : 0;
    const g = award(it, ok, streak);
    const msg = ok ? (STREAKP[streak] || pick(PRAISE)) : pick(MISS);
    setSession({...session, sel:k, streak, best:Math.max(session.best,streak), right:session.right+(ok?1:0), gained:session.gained+g, msg, last:g, ok});
  }
  function next(){
    if (session.i+1 >= session.items.length) { setView("end"); window.scrollTo({top:0}); return; }
    setSession({...session, i:session.i+1, sel:null, msg:""}); window.scrollTo({top:0});
  }
  async function openLb(){
    setView("lb"); setLb(null);
    try { if (!sb) { setLb([]); return; } const {data,error} = await sb.rpc("practice_lb"); setLb(error?{err:true}:(data||[])); } catch { setLb({err:true}); }
  }

  const card = {background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px"};
  const me = (auth?.profile?.full_name||"").trim();
  const wrap = {padding:"96px 16px 60px",maxWidth:720,margin:"0 auto"};

  const css = <style>{`@keyframes pop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}.pr-pop{animation:pop .35s ease}.pr-opt{transition:transform .12s,border-color .15s}.pr-opt:hover{transform:translateY(-1px)}`}</style>;

  // ── Bosh sahifa ──
  if (view==="home") return (
    <div style={wrap}>{css}
      {BackBtn && <BackBtn setPage={setPage} lang={lang}/>}
      <div style={{...card,background:`linear-gradient(135deg,rgba(47,125,246,.18),rgba(55,178,77,.14))`,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{fontSize:38}}>{rank[2]}</div>
          <div style={{flex:1,minWidth:150}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:C.text}}>AMALIYOT</div>
            <div style={{fontSize:12.5,color:C.dim}}>Videodarsni ko'ring → shu yerda mashq qiling. Ball yig'ing, reytingda ko'tariling!</div>
          </div>
          <div style={{textAlign:"right"}}><div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:26,color:C.amber}}>{total}</div><div style={{fontSize:11,color:C.dim}}>ball</div></div>
        </div>
        <div style={{marginTop:10,fontSize:12.5,color:C.text,fontWeight:700}}>{rank[1]}{nx?<span style={{color:C.dim,fontWeight:500}}> · keyingi daraja «{nx[1]}» {nx[0]-total} ballda</span>:" · eng yuqori daraja"}</div>
        {nx && <div style={{height:7,borderRadius:9,background:"rgba(255,255,255,0.1)",marginTop:6,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,((total-rank[0])/(nx[0]-rank[0]))*100)+"%",background:`linear-gradient(90deg,${C.blue},${C.green})`}}/></div>}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <button onClick={()=>start("mix")} style={{flex:1,minWidth:150,background:`linear-gradient(135deg,${C.blue},${C.green})`,border:"none",borderRadius:12,color:"#fff",fontWeight:800,fontSize:14,padding:"13px",cursor:"pointer"}}>⚡ Aralash mashq</button>
        <button onClick={openLb} style={{flex:1,minWidth:150,background:"var(--w05)",border:`1px solid ${C.amber}`,borderRadius:12,color:C.amber,fontWeight:800,fontSize:14,padding:"13px",cursor:"pointer"}}>🏆 Reyting</button>
      </div>
      <div style={{fontSize:12,fontWeight:800,color:C.dim,letterSpacing:1,margin:"4px 2px 8px"}}>JONLI MASHQLAR (cheksiz, har safar yangi)</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:9,marginBottom:18}}>
        {Object.entries(GENS).map(([k,g])=>(
          <button key={k} onClick={()=>start("gen",k)} style={{...card,cursor:"pointer",textAlign:"left",color:C.text}}>
            <div style={{fontSize:22}}>{g.ic}</div><div style={{fontSize:13,fontWeight:700,marginTop:3}}>{g.n}</div>
          </button>))}
      </div>
      <div style={{fontSize:12,fontWeight:800,color:C.dim,letterSpacing:1,margin:"4px 2px 8px"}}>MODULLAR BO'YICHA</div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {Array.from({length:10},(_,i)=>i+1).map(m=>{ const tot=BANK[m].length, s=solvedIn(m), p=Math.round(s/tot*100);
          return (<button key={m} onClick={()=>start("mod",m)} style={{...card,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:11,background:"rgba(47,125,246,.15)",color:C.blueLt,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontFamily:"'Sora',sans-serif",flexShrink:0}}>{m}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>{names[m-1]||("Modul "+m)}</div>
              <div style={{height:5,borderRadius:9,background:"rgba(255,255,255,0.1)",margin:"6px 0 3px",overflow:"hidden"}}><div style={{height:"100%",width:p+"%",background:p===100?C.greenLt:C.blue}}/></div>
              <div style={{fontSize:11.5,color:C.dim}}>{s}/{tot} savol · {ptsIn(m)} ball{p===100?" ✅":""}</div>
            </div><div style={{color:C.faint,fontSize:18}}>›</div></button>); })}
      </div>
    </div>);

  // ── Reyting ──
  if (view==="lb") return (
    <div style={wrap}>{css}
      <button onClick={()=>setView("home")} style={{background:"var(--glass)",border:`1px solid ${C.border}`,borderRadius:10,color:C.dim,padding:"8px 14px",cursor:"pointer",marginBottom:14}}>← Amaliyotga qaytish</button>
      <h2 style={{fontFamily:"'Sora',sans-serif",color:C.text,fontSize:22,margin:"0 0 4px"}}>🏆 Amaliyot reytingi</h2>
      <div style={{fontSize:12.5,color:C.dim,marginBottom:14}}>Sizning ballingiz: <b style={{color:C.amber}}>{total}</b> · daraja: {rank[2]} {rank[1]}</div>
      {lb===null && <div style={{color:C.dim,padding:20,textAlign:"center"}}>Yuklanmoqda…</div>}
      {lb && lb.err && <div style={{...card,color:C.dim,fontSize:13}}>Reyting jadvali hozircha mavjud emas. Ballaringiz saqlanmoqda — tez orada ko'rinadi.</div>}
      {Array.isArray(lb) && lb.length===0 && <div style={{...card,color:C.dim,fontSize:13,textAlign:"center"}}>Hali hech kim ball to'plamagan. Birinchi bo'ling! 🚀</div>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {Array.isArray(lb) && lb.map((r,i)=>{ const isMe = me && r.full_name===me; const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":String(i+1); const rk=rankOf(Number(r.total)).r;
          return (<div key={i} style={{...card,display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderColor:isMe?C.blue:C.border,background:isMe?"rgba(47,125,246,0.1)":C.card}}>
            <div style={{width:32,textAlign:"center",fontSize:i<3?20:14,fontWeight:800,color:i<3?"inherit":C.faint}}>{medal}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.full_name}{isMe&&" (siz)"}</div><div style={{fontSize:11.5,color:C.dim}}>{rk[2]} {rk[1]} · {r.solved} savol · {r.mods} modul</div></div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:C.amber}}>{r.total}</div>
          </div>); })}
      </div>
    </div>);

  // ── Yakun ──
  if (view==="end" && session){ const n=session.items.length, pc=Math.round(session.right/n*100);
    const t = pc===100?"Mukammal! Gap yo'q, ustoz-treyder! 👑":pc>=80?"Barakalla, usta treyder! 🔥":pc>=50?"Yaxshi natija — yana bir urinib ko'ring 💪":"Boshlanish shunday. Videodarsni qayta ko'rib, yana urinib ko'ring 📚";
    return (<div style={{...wrap,textAlign:"center"}}>{css}
      <div className="pr-pop" style={{...card,padding:"26px 18px"}}>
        <div style={{fontSize:54}}>{pc>=80?"🏆":"🎯"}</div>
        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:C.text,margin:"6px 0"}}>{session.right}/{n} to'g'ri ({pc}%)</div>
        <div style={{color:C.dim,fontSize:14,marginBottom:14}}>{t}</div>
        <div style={{display:"flex",justifyContent:"center",gap:22,marginBottom:16,flexWrap:"wrap"}}>
          <div><div style={{fontSize:24,fontWeight:800,color:C.amber}}>+{session.gained}</div><div style={{fontSize:11,color:C.dim}}>ball</div></div>
          <div><div style={{fontSize:24,fontWeight:800,color:C.greenLt}}>{session.best}</div><div style={{fontSize:11,color:C.dim}}>eng uzun seriya</div></div>
          <div><div style={{fontSize:24,fontWeight:800,color:C.text}}>{total}</div><div style={{fontSize:11,color:C.dim}}>jami ball</div></div>
        </div>
        <div style={{display:"flex",gap:9,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>start(session.mode,session.arg)} style={{background:`linear-gradient(135deg,${C.blue},${C.green})`,border:"none",borderRadius:11,color:"#fff",fontWeight:800,padding:"11px 20px",cursor:"pointer"}}>Yana mashq</button>
          <button onClick={openLb} style={{background:"var(--w05)",border:`1px solid ${C.amber}`,borderRadius:11,color:C.amber,fontWeight:800,padding:"11px 20px",cursor:"pointer"}}>🏆 Reyting</button>
          <button onClick={()=>setView("home")} style={{background:"var(--w05)",border:`1px solid ${C.border}`,borderRadius:11,color:C.dim,fontWeight:700,padding:"11px 20px",cursor:"pointer"}}>Bosh sahifa</button>
        </div>
      </div></div>);
  }

  // ── Savol ──
  if (view==="play" && session){ const it = session.items[session.i]; const answered = session.sel!==null;
    const scored = it.gen ? true : !(it.qid in store.done) || (answered && session.ok && session.last>0);
    return (<div style={wrap}>{css}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <button onClick={()=>setView("home")} style={{background:"var(--glass)",border:`1px solid ${C.border}`,borderRadius:9,color:C.dim,padding:"6px 12px",cursor:"pointer",fontSize:13}}>✕</button>
        <div style={{flex:1,height:7,borderRadius:9,background:"rgba(255,255,255,0.1)",overflow:"hidden"}}><div style={{height:"100%",width:((session.i+(answered?1:0))/session.items.length*100)+"%",background:`linear-gradient(90deg,${C.blue},${C.green})`,transition:"width .3s"}}/></div>
        <div style={{fontSize:12.5,color:C.dim,fontWeight:700}}>{session.i+1}/{session.items.length}</div>
        <div style={{fontSize:13,fontWeight:800,color:C.amber}}>{session.streak>=2?"🔥"+session.streak+" ":""}{total}★</div>
      </div>
      <div style={{...card}}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:800,color:C.blueLt,background:"rgba(47,125,246,.14)",borderRadius:7,padding:"3px 8px"}}>{it.gen?GENS[it.gen].ic+" "+GENS[it.gen].n:("Modul "+it.mod)}</span>
          <span style={{fontSize:11,color:C.dim}}>{["","Oson","O'rta","Qiyin"][it.d||1]} · {PTS[it.d||1]} ball</span>
        </div>
        <div style={{fontSize:15.5,fontWeight:700,color:C.text,lineHeight:1.55,marginBottom:12}}>{it.q}</div>
        <Card q={it} C={C}/>
        {it.chart && <div style={{marginBottom:12}}><Chart chart={it.chart} C={C}/></div>}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {it.opts.map((o,k)=>{ const right = answered && k===it.ans, wrong = answered && k===session.sel && k!==it.ans;
            return (<button key={k} className="pr-opt" disabled={answered} onClick={()=>choose(k)} style={{textAlign:"left",background:right?"rgba(55,178,77,.16)":wrong?"rgba(229,72,77,.14)":"var(--w04)",border:`1.5px solid ${right?C.greenLt:wrong?C.red:C.border}`,borderRadius:11,color:C.text,fontSize:14,padding:"11px 13px",cursor:answered?"default":"pointer",lineHeight:1.45}}>
              <b style={{color:C.dim,marginRight:7}}>{String.fromCharCode(65+k)}</b>{o}</button>); })}
        </div>
        {answered && <div className="pr-pop" style={{marginTop:14}}>
          <div style={{fontWeight:800,fontSize:15,color:session.ok?C.greenLt:C.amber,marginBottom:6}}>{session.msg}{session.ok&&session.last>0&&<span style={{color:C.amber}}> +{session.last} ball</span>}{session.ok&&session.last===0&&<span style={{color:C.dim,fontWeight:500,fontSize:12}}> (bu savol uchun ball olingan / kunlik limit)</span>}</div>
          <div style={{background:"rgba(255,255,255,0.05)",borderLeft:`3px solid ${session.ok?C.greenLt:C.amber}`,borderRadius:8,padding:"10px 12px",fontSize:13.5,color:C.dim,lineHeight:1.6}}><b style={{color:C.text}}>Tushuntirish: </b>{it.expl}</div>
          <button onClick={next} style={{marginTop:12,width:"100%",background:`linear-gradient(135deg,${C.blue},${C.green})`,border:"none",borderRadius:11,color:"#fff",fontWeight:800,fontSize:14.5,padding:"12px",cursor:"pointer"}}>{session.i+1>=session.items.length?"Yakunlash":"Keyingisi →"}</button>
        </div>}
      </div>
    </div>);
  }
  return null;
}
