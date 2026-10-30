// Jonli (cheksiz) mashqlar generatorlari. Har chaqiriq yangi savol qaytaradi:
// {kind, d, q, opts, ans, expl, card?, chart?}
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const f1=x=>(Math.round(x*10)/10).toString();
const f0=x=>Math.round(x).toString();
// to'g'ri javob + 3 ta noto'g'ri; tartib aralashadi
function mk(correct,wrongs){const set=[];const all=[correct,...wrongs.filter(w=>w!==correct)];
  for(const x of all){if(!set.includes(x))set.push(x);} let k=1;
  while(set.length<4&&k<30){const c=String(correct).replace(/[\d.]+/,m=>f1(parseFloat(m)*(1+0.13*k)));if(!set.includes(c))set.push(c);k++;}
  while(set.length<4)set.push("Ma'lumot yetarli emas"+" ".repeat(set.length));
  const o=shuf(set.slice(0,4));return {opts:o,ans:o.indexOf(correct)};}

// ───────── 1. HALOLLIK KARTASI ─────────
const NAMES=["Nur Tech","Baraka Soft","Orient Pharma","Silk Road Foods","Tulpar Energy","Zarafshon Retail","Amir Devices","Karvon Logistics","Sabr Health","Navo Cloud","Bahor Materials","Chamanzor Foods","Ziyo Medical","Sogdiana Auto","Oltin Steel"];
const GOOD=["Dasturiy ta'minot","Tibbiy asboblar","Farmatsevtika","Oziq-ovqat ishlab chiqarish","Yarim o'tkazgichlar","Logistika","Chakana savdo (oziq-ovqat)","Bulutli xizmatlar"];
const BAD=[["An'anaviy bank (foizli kreditlar)","ribo"],["Pivo va spirtli ichimliklar","alkogol"],["Kazino va qimor","qimor"],["Tamaki mahsulotlari","tamaki"],["Foizli sug'urta (an'anaviy)","sug'urta"]];
export function genHalal(){
  const name=pick(NAMES);const cap=R(20,400)*10; // mlrd $
  const bad=Math.random()<0.2;
  if(bad){const [sec,why]=pick(BAD);
    const card={name,sector:sec,cap,debt:R(2,18)*cap/100|0,cash:R(3,20)*cap/100|0,haram:R(1,4)};
    const {opts,ans}=mk("Harom — faoliyat taqiqlangan",["Halol — ko'rsatkichlar yaxshi","Harom — qarz filtri","Harom — harom daromad 5% dan ko'p"]);
    return {kind:"halal",d:2,q:"Quyidagi kompaniya halollik filtridan o'tadimi? Avval FAOLIYATga qarang.",card,opts,ans,
      expl:`Faoliyat: ${sec}. ${why[0].toUpperCase()+why.slice(1)} bilan bog'liq soha — AAOIFI bo'yicha taqiqlangan. Nisbatlarni hisoblashning keragi yo'q: faoliyat filtri birinchi turadi.`};}
  const sector=pick(GOOD);
  // 4 ssenariy: halol / qarz oshgan / likvid oshgan / harom daromad oshgan
  const sc=pick(["ok","debt","cash","inc"]);
  let dPct=R(5,25),cPct=R(5,25),inc=+(R(5,40)/10).toFixed(1);
  if(sc==="debt")dPct=R(31,52);if(sc==="cash")cPct=R(31,55);if(sc==="inc")inc=+(R(52,95)/10).toFixed(1);
  const card={name,sector,cap,debt:Math.round(cap*dPct/100),cash:Math.round(cap*cPct/100),haram:inc};
  const dr=card.debt/cap*100,cr=card.cash/cap*100;
  const labels={ok:"Halol — barcha filtrlardan o'tdi",debt:"Harom — foizli qarz 30% dan oshdi",cash:"Harom — naqd/foizli aktivlar 30% dan oshdi",inc:"Harom — harom daromad 5% dan oshdi"};
  const o=shuf(Object.values(labels));
  const det=`Qarz: ${card.debt}/${cap} = ${f1(dr)}% (${dr<=30?"≤30% ✓":">30% ✗"}). Likvid/foizli aktiv: ${card.cash}/${cap} = ${f1(cr)}% (${cr<=30?"✓":"✗"}). Harom daromad: ${inc}% (${inc<5?"<5% ✓":"≥5% ✗"}).`;
  let tail="";if(sc==="ok")tail=` Dividend $100 olsangiz, tathir: ${inc}% = $${f1(inc)} sadaqa.`;
  return {kind:"halal",d:sc==="ok"?2:3,q:"Faoliyat joiz. Moliyaviy filtrlarni hisoblab, hukm chiqaring (AAOIFI: qarz ≤30%, likvid ≤30%, harom daromad <5%).",card,opts:o,ans:o.indexOf(labels[sc]),expl:det+tail};
}

// ───────── 2. BAHOLASH ─────────
function rate(v,lo,hi){return v<lo?"arzon":v>hi?"qimmat":"o'rtacha";}
export function genValuation(){
  const t=pick(["pe","ps","growth","netm","peg","pb"]);
  const rev=R(20,300)*10,ni=Math.round(rev*R(3,30)/100);const cap=Math.round(ni*R(8,45));
  const card={name:pick(NAMES),cap,rev,ni};
  if(t==="pe"){const v=cap/ni;const ans=f1(v);
    const {opts,ans:a}=mk(ans,[f1(v*1.7),f1(v/2.1),f1(cap/rev)]);
    return {kind:"val",d:1,q:"P/E ni hisoblang (Market cap / sof foyda).",card,opts,ans:a,expl:`P/E = ${cap}/${ni} = ${ans}. Mezon: <15 arzon, 15–25 o'rta, >25 qimmat → ${rate(v,15,25)}.`};}
  if(t==="ps"){const v=cap/rev;const ans=f1(v);const {opts,ans:a}=mk(ans,[f1(cap/ni),f1(v*2.2),f1(v/2.6)]);
    return {kind:"val",d:1,q:"P/S ni hisoblang (Market cap / daromad).",card,opts,ans:a,expl:`P/S = ${cap}/${rev} = ${ans}. Mezon: <1 arzon, 1–2 o'rta, >2 qimmat → ${rate(v,1,2)}.`};}
  if(t==="pb"){const eq=Math.round(cap/R(8,60)*10);const card2={...card,eq};const v=cap/eq;const ans=f1(v);const {opts,ans:a}=mk(ans,[f1(cap/ni),f1(eq/cap),f1(v*2.3)]);
    return {kind:"val",d:2,q:"P/B ni hisoblang (Market cap / xususiy kapital).",card:card2,opts,ans:a,expl:`P/B = ${cap}/${eq} = ${ans}. Mezon: <1.2 arzon, >3 qimmat → ${rate(v,1.2,3)}.`};}
  if(t==="growth"){const prev=Math.round(rev/(1+R(-6,25)/100));const g=(rev-prev)/prev*100;const ans=f1(g)+"%";
    const lab=g>10?"kuchli":g>=5?"o'rta":"zaif";const {opts,ans:a}=mk(ans,[f1((rev-prev)/rev*100)+"%",f1(g*2)+"%",f1(-g)+"%"]);
    return {kind:"val",d:2,q:`Daromad o'tgan yil ${prev} mlrd edi, bu yil ${rev} mlrd. O'sish foizi?`,card:{name:card.name,cap,rev,ni},opts,ans:a,expl:`(${rev}−${prev})/${prev} = ${ans}. >10% kuchli, 5–10% o'rta, <5% zaif → ${lab}. Eslatma: bazaga (o'tgan yilga) bo'linadi.`};}
  if(t==="netm"){const v=ni/rev*100;const ans=f1(v)+"%";const lab=v>15?"kuchli":v>=5?"o'rta":"zaif";
    const {opts,ans:a}=mk(ans,[f1(rev/ni)+"%",f1(v/2)+"%",f1(cap/rev)+"%"]);
    return {kind:"val",d:1,q:"Sof marjani hisoblang (sof foyda / daromad).",card,opts,ans:a,expl:`${ni}/${rev} = ${ans}. >15% kuchli, 5–15% o'rta, <5% zaif → ${lab}.`};}
  const pe=cap/ni;const gr=R(5,45);const v=pe/gr;const ans=f1(v);
  const {opts,ans:a}=mk(ans,[f1(pe),f1(gr/pe),f1(v*2.4)]);
  return {kind:"val",d:3,q:`P/E = ${f1(pe)}, kutilayotgan EPS o'sishi yiliga ${gr}%. PEG nechaga teng?`,card:null,opts,ans:a,expl:`PEG = P/E / o'sish = ${f1(pe)}/${gr} = ${ans}. PEG <1 — o'sishga nisbatan arzon, >1 — qimmat → ${v<1?"arzon":"qimmat"}.`};
}

// ───────── 3. RISK HISOBI ─────────
export function genRisk(){
  const t=pick(["size","rr","rec","be","tp"]);
  if(t==="size"){const dep=pick([2000,3000,5000,8000,10000,15000,20000]),rp=pick([1,1.5,2]);const e=R(20,150),dist=pick([1,1.5,2,2.5,3,4]);const risk=dep*rp/100;const n=Math.floor(risk/dist);
    const {opts,ans}=mk(n+" dona",[Math.floor(risk/dist*2)+" dona",Math.floor(dep/e)+" dona",Math.max(1,Math.floor(risk/e))+" dona"]);
    return {kind:"risk",d:2,q:`Hisob ${dep}$, risk ${rp}%. Kirish ${e}$, stop ${(e-dist).toFixed(1)}$. Necha dona aksiya olasiz?`,opts,ans,expl:`Risk = ${dep}×${rp}% = ${risk}$. Bir aksiyada risk = ${dist}$. Hajm = ${risk}/${dist} = ${n} dona (pozitsiya ${n*e}$).`};}
  if(t==="rr"){const e=R(30,120),r=pick([2,3,4,5]),k=pick([1,1.5,2,2.5,3,4]);const rw=r*k;const v=k;
    const ans="1:"+f1(k);const {opts,ans:a}=mk(ans,["1:"+f1(k*2),"1:"+f1(Math.max(0.5,k/2)),k+":1"]);
    return {kind:"risk",d:1,q:`Kirish ${e}$, stop ${e-r}$, maqsad ${e+rw}$. R:R nisbati?`,opts,ans:a,expl:`Risk = ${r}$, mukofot = ${rw}$ → 1:${f1(k)}. Kamida 1:2 bo'lmasa savdo olinmaydi.`};}
  if(t==="rec"){const l=pick([10,20,25,30,40,50,60]);const need=l/(100-l)*100;const ans="+"+f1(need)+"%";
    const {opts,ans:a}=mk(ans,["+"+l+"%","+"+f1(need+10)+"%","+"+f1(l*1.5)+"%"]);
    return {kind:"risk",d:2,q:`Hisob ${l}% zarar ko'rdi. Qaytarish uchun qancha foyda kerak?`,opts,ans:a,expl:`100→${100-l}. ${100-l}→100 uchun ${l}/${100-l} = ${f1(need)}%. Zarar assimetrik: shuning uchun katta zararning oldini oling.`};}
  if(t==="be"){const k=pick([1,2,3,4]);const v=100/(1+k);const ans=f1(v)+"%";const {opts,ans:a}=mk(ans,["50%",f1(v+15)+"%",f1(v/2)+"%"]);
    return {kind:"risk",d:3,q:`R:R = 1:${k}. Foyda/zararsiz (break-even) uchun minimal g'alaba foizi?`,opts,ans:a,expl:`Break-even = 1/(1+${k}) = ${ans}. Undan yuqori g'alaba foizi — foyda. R:R katta bo'lsa, ko'p marta yutmasangiz ham foydada qolasiz.`};}
  const n=R(8,20),w=R(2,Math.floor(n/2)),k=pick([2,3]);const net=w*k-(n-w);const ans=(net>=0?"+":"")+net+"R";
  const {opts,ans:a}=mk(ans,[(net+2>=0?"+":"")+(net+2)+"R",(net-3>=0?"+":"")+(net-3)+"R",(-net>=0?"+":"")+(-net)+"R"]);
  return {kind:"risk",d:3,q:`${n} ta savdo, ${w} tasi g'alaba. Har g'alaba +${k}R, har zarar −1R. Jami natija?`,opts,ans:a,expl:`${w}×${k} − ${n-w}×1 = ${net}R. Natija ${net>=0?"foyda":"zarar"}: ${w}/${n} = ${f0(w/n*100)}% g'alaba foizi bilan.`};
}

// ───────── 4. GRAFIK (SVG ma'lumotlari) ─────────
// shamcha: [o,h,l,c]
function noise(n,s){return Array.from({length:n},()=>(Math.random()-0.5)*s);}
function path(points,step=1,vol=0.6){ // piecewise-linear closes
  const cs=[];for(let i=0;i<points.length-1;i++){const [a,b]=[points[i],points[i+1]];for(let k=0;k<step;k++)cs.push(a+(b-a)*k/step);}
  cs.push(points[points.length-1]);return cs.map(c=>c+(Math.random()-0.5)*vol);}
function candlesFromCloses(cs,wick=0.5){const out=[];for(let i=0;i<cs.length;i++){const o=i?cs[i-1]+(Math.random()-0.5)*0.15:cs[0]-0.2;const c=cs[i];const h=Math.max(o,c)+Math.random()*wick,l=Math.min(o,c)-Math.random()*wick;out.push([o,h,l,c]);}return out;}
export function ema(cs,p){const k=2/(p+1);const r=[];cs.forEach((c,i)=>r.push(i?c*k+r[i-1]*(1-k):c));return r;}

const PATS={
 hammer:{n:"Hammer (bullish reversal)",e:"Hammer: kichik tana yuqorida, uzun pastki soya (≥2× tana). Tushish oxirida va support yaqinida paydo bo'lsa, xaridorlar qaytib kelganini bildiradi.",bull:true,
   mk:()=>{const base=candlesFromCloses(path([30,26,22,19],2,0.4));const h=[18,18.4,15.2,18.2];return [...base,h];}},
 star:{n:"Shooting star (bearish reversal)",e:"Shooting star: kichik tana pastda, uzun yuqori soya. O'sish oxirida va resistance yaqinida sotuvchilar kuch olganini bildiradi.",bull:false,
   mk:()=>{const base=candlesFromCloses(path([18,22,26,29],2,0.4));const h=[29.2,33.4,29,29.6];return [...base,h];}},
 bull_eng:{n:"Bullish engulfing",e:"Bullish engulfing: katta yashil shamcha oldingi qizil shamchani to'liq yutadi. Tushishdan keyin kuchli reversal belgisi.",bull:true,
   mk:()=>{const base=candlesFromCloses(path([30,26,22,20],2,0.3));return [...base,[20.4,20.8,18.6,19],[18.6,22.2,18.3,21.8]];}},
 bear_eng:{n:"Bearish engulfing",e:"Bearish engulfing: katta qizil shamcha oldingi yashilni to'liq yutadi. O'sishdan keyin tushish xavfi.",bull:false,
   mk:()=>{const base=candlesFromCloses(path([18,22,26,29],2,0.3));return [...base,[29.2,31,29,30.6],[31.0,31.3,27.4,27.8]];}},
 doji:{n:"Doji (ikkilanish)",e:"Doji: ochilish ≈ yopilish. Bozor ikkilanishda — xaridor va sotuvchi teng. Trend oxirida bo'lsa, burilish ehtimoli, lekin tasdiq (keyingi shamcha) kerak.",bull:null,
   mk:()=>{const base=candlesFromCloses(path([20,23,26,28],2,0.3));return [...base,[28.1,30.5,25.8,28.15]];}},
 marubozu:{n:"Marubozu (kuchli yashil)",e:"Marubozu: deyarli soyasiz uzun tana — bir tomon to'liq nazoratda. Yashil marubozu xaridorlar kuchini ko'rsatadi.",bull:true,
   mk:()=>{const base=candlesFromCloses(path([22,22.5,22,22.4,22.1],2,0.3));return [...base,[22.1,26.4,22.0,26.3]];}},
 mstar:{n:"Morning star (bullish reversal)",e:"Morning star: 3 shamcha — katta qizil, kichik ikkilanish (tana kichik), katta yashil. Tushish oxirida kuchli o'sish reversali.",bull:true,
   mk:()=>{const base=candlesFromCloses(path([32,28,25,22],2,0.3));return [...base,[22.4,22.6,18.8,19.2],[18.8,19.4,17.9,18.4],[18.9,23.0,18.7,22.6]];}},
};
export function genCandle(){
  const keys=Object.keys(PATS);const k=pick(keys);const p=PATS[k];
  const wrong=shuf(keys.filter(x=>x!==k)).slice(0,3).map(x=>PATS[x].n);
  const {opts,ans}=mk(p.n,wrong);
  return {kind:"candle",d:k==="mstar"||k==="doji"?3:2,q:"Grafikdagi OXIRGI shamcha(lar) qaysi shaklni hosil qildi?",chart:{candles:p.mk()},opts,ans,expl:p.e};
}
// Trend aniqlash
export function genTrend(){
  const t=pick(["up","down","side"]);
  const pts=t==="up"?[10,16,13,20,17,25,22,30]:t==="down"?[30,24,27,19,22,14,17,10]:[20,25,21,25.5,20.5,25,21,24.5];
  const cs=path(pts,3,0.8);
  const L={up:"Uptrend (HH va HL)",down:"Downtrend (LH va LL)",side:"Sideways (yon harakat)"};
  const {opts,ans}=mk(L[t],Object.values(L).filter(x=>x!==L[t]).concat(["Reversal tasdiqlangan"]));
  return {kind:"trend",d:1,q:"Narx qanday trendda?",chart:{candles:candlesFromCloses(cs,0.8)},opts,ans,
    expl:t==="up"?"Har yangi cho'qqi (HH) va har yangi tub (HL) oldingisidan yuqori — uptrend. Trend yo'nalishida kirish ehtimoli yuqori.":t==="down"?"Cho'qqilar va tublar ketma-ket pasaymoqda (LH, LL) — downtrend. Long ochishdan ehtiyot bo'ling.":"Narx gorizontal oraliqda aylanmoqda — sideways. Oraliq chegarasi (support/resistance) buzilishini kuting."};
}
// Strategiya signali: pullback / breakout / false breakout / reversal
const STR={
 pullback:{n:"Pullback (trend ichidagi qaytish)",e:"Narx kuchli uptrendda, EMA ga qaytib (tuzatma) yana ko'tarila boshladi. Pullback: trend yo'nalishida, EMA20/50 yoki Fibonacci zonasidan kirish; stop — tuzatma tubi ostida.",
   pts:[10,18,26,33,38,34,31,29,33,38,42]},
 breakout:{n:"Breakout (zonani buzish)",e:"Narx bir necha marta resistance'ga tegib qaytdi, so'ng uni yuqoriga buzib o'tdi. Breakout: yopilish zona ustida, hajm o'rtachadan yuqori bo'lishi shart; retest'da kirish yaxshiroq.",
   pts:[20,26,31,30,31,29.5,31,30.2,31,36,40]},
 reversal:{n:"Reversal (yo'nalish o'zgarishi)",e:"Downtrend liniyasi buzildi, narx EMA20 ustiga chiqdi va HL, HH hosil bo'ldi. Reversal: kamida 2 HL va 2 HH, tasdiqlanguncha kichik hajm bilan.",
   pts:[40,34,30,25,21,18,19.5,17.5,21,19.5,25,23,28]},
 fake:{n:"Soxta breakout (false breakout)",e:"Narx resistance ustiga chiqdi, lekin yopilish zona ostiga qaytdi — buzilish tasdiqlanmadi. Hajmsiz, close tasdiqsiz kirish xavfli; kutish kerak.",
   pts:[20,26,31,30,31,29.5,31,33,30,27,24]},
};
export function genStrategy(){
  const k=pick(Object.keys(STR));const s=STR[k];
  const cs=path(s.pts,2,0.5);const cd=candlesFromCloses(cs,0.6);
  let lvl=null;if(k==="breakout"||k==="fake")lvl={y:31,label:"Resistance"};
  const {opts,ans}=mk(s.n,Object.keys(STR).filter(x=>x!==k).map(x=>STR[x].n));
  return {kind:"strat",d:3,q:"Grafikdagi vaziyat qaysi strategiya (yoki xato signal)ga mos?",chart:{candles:cd,ema:true,level:lvl},opts,ans,expl:s.e};
}
// Indikator o'qish
export function genIndicator(){
  const t=pick(["rsi","macd","bb","gc","div"]);
  if(t==="rsi"){const v=R(12,88);const z=v>=70?"Overbought — tuzatma ehtimoli yuqori; yangi long uchun kutish":v<=30?"Oversold — support yaqinida reversal kuzatiladi":"Neytral zona — RSI o'zi signal bermaydi";
    const all=["Overbought — tuzatma ehtimoli yuqori; yangi long uchun kutish","Oversold — support yaqinida reversal kuzatiladi","Neytral zona — RSI o'zi signal bermaydi"];
    const {opts,ans}=mk(z,all.filter(x=>x!==z).concat(["Dividend sanasi yaqin"]));
    return {kind:"ind",d:1,q:`RSI(14) = ${v}. Bu nimani bildiradi?`,opts,ans,expl:`RSI >70 overbought, <30 oversold, oralig'i neytral. Kuchli trendda RSI uzoq vaqt ekstremumda qolishi mumkin — doim zona va hajm bilan birga ko'ring.`};}
  if(t==="macd"){const up=Math.random()<0.5;const z=up?"Bullish — MACD signaldan yuqoriga o'tdi":"Bearish — MACD signaldan pastga o'tdi";
    const {opts,ans}=mk(z,[up?"Bearish — MACD signaldan pastga o'tdi":"Bullish — MACD signaldan yuqoriga o'tdi","Signal yo'q","Aksiya halol emas"]);
    return {kind:"ind",d:2,q:`MACD chizig'i signal chizig'ini ${up?"pastdan yuqoriga":"yuqoridan pastga"} kesib o'tdi (gistogramma nol chizig'i yaqinida). Qanday xulosa?`,opts,ans,expl:"MACD = EMA12 − EMA26, signal = MACD ning EMA9'i. Pastdan yuqoriga kesish — bullish, yuqoridan pastga — bearish. Nol chizig'i va trend yo'nalishi bilan tasdiqlang."};}
  if(t==="bb"){const sq=Math.random()<0.5;const z=sq?"Squeeze — volatillik portlashi yaqin, breakout yo'nalishini kuting":"Kengaygan — harakat kuchli, davom/tuzatma ehtimoli";
    const {opts,ans}=mk(z,[sq?"Kengaygan — harakat kuchli, davom/tuzatma ehtimoli":"Squeeze — volatillik portlashi yaqin, breakout yo'nalishini kuting","Halol aksiya","Dividend"]);
    return {kind:"ind",d:2,q:`Bollinger Bands lentasi ${sq?"juda tor (squeeze)":"keskin kengaygan"}. Bu nimani anglatadi?`,opts,ans,expl:"Squeeze past volatillikni ko'rsatadi, ortidan ko'pincha kuchli harakat keladi. Yo'nalishni hajm bilan tasdiqlangan buzilish ko'rsatadi."};}
  if(t==="gc"){const g=Math.random()<0.5;const z=g?"Golden cross — o'sish signali":"Death cross — tushish signali";
    const {opts,ans}=mk(z,[g?"Death cross — tushish signali":"Golden cross — o'sish signali","Reversal emas, doji","Gap"]);
    return {kind:"ind",d:2,q:`EMA50 EMA200 ni ${g?"pastdan yuqoriga":"yuqoridan pastga"} kesib o'tdi. Bu qanday signal?`,opts,ans,expl:"Golden cross — uzoq muddatli o'sishga o'tish ehtimoli; Death cross — aksincha. Sekin (kechikuvchi) signal: kirish nuqtasini kunlik/1 soatlik grafikdan aniqlang."};}
  const bear=Math.random()<0.5;const z=bear?"Bearish divergence — kuchsizlanish ogohlantirishi":"Bullish divergence — tushish kuchsizlanmoqda";
  const {opts,ans}=mk(z,[bear?"Bullish divergence — tushish kuchsizlanmoqda":"Bearish divergence — kuchsizlanish ogohlantirishi","Trend kuchayyapti","Signal yo'q"]);
  return {kind:"ind",d:3,q:bear?"Narx yangi cho'qqi qildi (HH), RSI esa oldingi cho'qqidan past. Qanday xulosa?":"Narx yangi tub qildi (LL), RSI esa oldingi tubdan yuqori. Qanday xulosa?",opts,ans,expl:"Narx va indikator ajralganda (divergence) harakat kuchsizlanadi. Bu signal emas, ogohlantirish: tasdiq uchun trend chizig'i buzilishi yoki reversal shamcha kuting."};
}

export const GENS={halal:{n:"Halollik kartasi",ic:"🕌",fn:genHalal,mods:[2,10]},val:{n:"Baholash hisobi",ic:"📊",fn:genValuation,mods:[3]},
  candle:{n:"Shamcha shakllari",ic:"🕯️",fn:genCandle,mods:[4]},trend:{n:"Trendni aniqlash",ic:"📈",fn:genTrend,mods:[4]},
  strat:{n:"Strategiya signali",ic:"🎯",fn:genStrategy,mods:[5]},ind:{n:"Indikator o'qish",ic:"🧭",fn:genIndicator,mods:[5]},
  risk:{n:"Risk hisobi",ic:"🛡️",fn:genRisk,mods:[6,7,8]}};
export const SHUF=shuf;
