import { useState, useEffect, useCallback, useRef } from "react";

const FONTS = "https://fonts.googleapis.com/css2?family=Boogaloo&family=Quicksand:wght@500;600;700&display=swap";

const SUBJECTS = [
  { id:"maths",   label:"Maths",   emoji:"🔢", mascot:"lion",   bg:"#FFF3CD", border:"#F6A800", btn:"#F6A800", dark:"#b87d00", desc:"Numbers & shapes" },
  { id:"english", label:"English", emoji:"✏️",  mascot:"parrot", bg:"#E8F5FF", border:"#4A9EE0", btn:"#4A9EE0", dark:"#2272b5", desc:"Words & grammar"  },
  { id:"reading", label:"Reading", emoji:"📖", mascot:"owl",    bg:"#EDFFF4", border:"#34C76F", btn:"#34C76F", dark:"#1e9c53", desc:"Stories & meaning" },
  { id:"verbal",  label:"Verbal",  emoji:"💬", mascot:"monkey", bg:"#FFF0FB", border:"#D45EBC", btn:"#D45EBC", dark:"#a83c93", desc:"Logic & language"  },
];

const TOTAL = 20;

/* ─── Achievement Definitions ──────────────────────────────────────────── */
const ACHIEVEMENTS = [
  { id:"first_quiz",    icon:"🎯", label:"First Steps",      desc:"Complete your first quiz!",            check:(s,h) => h.total >= 1 },
  { id:"perfect",       icon:"💯", label:"Perfect Score!",   desc:"Get 20/20 on any quiz!",               check:(s,h) => h.perfectScores >= 1 },
  { id:"hat_trick",     icon:"🎩", label:"Hat Trick",        desc:"Get 3 stars on any subject!",          check:(s,h) => Object.values(s).some(x => x.stars===3) },
  { id:"all_subjects",  icon:"🌍", label:"Explorer",         desc:"Try all 4 subjects!",                  check:(s,h) => Object.values(s).filter(x => x.best>0).length===4 },
  { id:"ten_quizzes",   icon:"🏃", label:"Quiz Marathoner",  desc:"Complete 10 quizzes!",                 check:(s,h) => h.total >= 10 },
  { id:"maths_star",    icon:"🔢", label:"Maths Wizard",     desc:"Score 15+ in Maths!",                  check:(s,h) => (s.maths?.best||0) >= 15 },
  { id:"english_star",  icon:"✏️",  label:"Word Master",      desc:"Score 15+ in English!",                check:(s,h) => (s.english?.best||0) >= 15 },
  { id:"reading_star",  icon:"📖", label:"Bookworm",         desc:"Score 15+ in Reading!",                check:(s,h) => (s.reading?.best||0) >= 15 },
  { id:"verbal_star",   icon:"💬", label:"Logic Legend",     desc:"Score 15+ in Verbal!",                 check:(s,h) => (s.verbal?.best||0) >= 15 },
  { id:"streak3",       icon:"🔥", label:"On Fire!",         desc:"Get 3 correct in a row!",              check:(s,h) => h.bestStreak >= 3 },
  { id:"streak5",       icon:"⚡", label:"Lightning!",       desc:"Get 5 correct in a row!",              check:(s,h) => h.bestStreak >= 5 },
  { id:"all_stars",     icon:"🌟", label:"All-Star",         desc:"Get 3 stars on ALL subjects!",         check:(s,h) => Object.values(s).every(x => x.stars===3) },
  { id:"comeback",      icon:"💪", label:"Never Give Up",    desc:"Retry a quiz and improve your score!", check:(s,h) => h.improvements >= 1 },
  { id:"twenty_five",   icon:"🏆", label:"Champion",         desc:"Complete 25 quizzes!",                 check:(s,h) => h.total >= 25 },
];

/* ─── Sound Engine ─────────────────────────────────────────────────────── */
function createSounds() {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const play = (fn) => { try { fn(getCtx()); } catch(e) {} };
  return {
    tap() { play(ctx => { const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.frequency.setValueAtTime(600,ctx.currentTime); o.frequency.exponentialRampToValueAtTime(400,ctx.currentTime+0.06); g.gain.setValueAtTime(0.18,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.08); o.start();o.stop(ctx.currentTime+0.08); }); },
    correct() { play(ctx => { [523,659,784,1047].forEach((freq,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sine"; const t=ctx.currentTime+i*0.1; o.frequency.setValueAtTime(freq,t); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.25,t+0.02); g.gain.exponentialRampToValueAtTime(0.001,t+0.35); o.start(t);o.stop(t+0.35); }); }); },
    wrong() { play(ctx => { const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sawtooth"; o.frequency.setValueAtTime(220,ctx.currentTime); o.frequency.exponentialRampToValueAtTime(110,ctx.currentTime+0.3); g.gain.setValueAtTime(0.2,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.35); o.start();o.stop(ctx.currentTime+0.35); }); },
    fanfare() { play(ctx => { [{f:523,t:0,d:0.15},{f:659,t:0.15,d:0.15},{f:784,t:0.3,d:0.15},{f:1047,t:0.45,d:0.3},{f:784,t:0.55,d:0.1},{f:1047,t:0.65,d:0.5}].forEach(({f,t,d})=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="triangle"; o.frequency.setValueAtTime(f,ctx.currentTime+t); g.gain.setValueAtTime(0,ctx.currentTime+t); g.gain.linearRampToValueAtTime(0.3,ctx.currentTime+t+0.02); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+t+d); o.start(ctx.currentTime+t);o.stop(ctx.currentTime+t+d+0.05); }); }); },
    badge() { play(ctx => { [784,1047,1319,1568].forEach((freq,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sine"; const t=ctx.currentTime+i*0.09; o.frequency.setValueAtTime(freq,t); g.gain.setValueAtTime(0.2,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.25); o.start(t);o.stop(t+0.3); }); }); },
  };
}

/* ─── TTS Read-aloud ───────────────────────────────────────────────────── */
function speak(text, onEnd) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.88;
  u.pitch = 1.1;
  u.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Samantha")||v.name.includes("Karen")||v.name.includes("Moira")||v.name.includes("Daniel")||v.name.toLowerCase().includes("female")));
  if (preferred) u.voice = preferred;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
}
function stopSpeaking() { if (window.speechSynthesis) window.speechSynthesis.cancel(); }

/* ─── SVG Mascots ──────────────────────────────────────────────────────── */
const Mascot = ({ type, size=80, animate=false }) => {
  const cls = animate ? "mascot-bounce" : "";
  if (type==="lion") return <svg width={size} height={size} viewBox="0 0 80 80" className={cls}>{[0,45,90,135,180,225,270,315].map((a,i)=><ellipse key={i} cx={40} cy={40} rx={6} ry={14} fill="#F6A800" transform={`rotate(${a} 40 40)`} opacity="0.85"/>)}<circle cx="40" cy="40" r="20" fill="#FBBF24"/><ellipse cx="34" cy="37" rx="4" ry="5" fill="#1a1a1a"/><ellipse cx="46" cy="37" rx="4" ry="5" fill="#1a1a1a"/><circle cx="34" cy="36" r="1.5" fill="white"/><circle cx="46" cy="36" r="1.5" fill="white"/><ellipse cx="40" cy="44" rx="6" ry="4" fill="#F97316"/><path d="M36 44 Q40 49 44 44" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/><circle cx="33" cy="42" r="1" fill="#F9A8D4"/><circle cx="47" cy="42" r="1" fill="#F9A8D4"/><ellipse cx="25" cy="35" rx="5" ry="6" fill="#FBBF24"/><ellipse cx="55" cy="35" rx="5" ry="6" fill="#FBBF24"/></svg>;
  if (type==="parrot") return <svg width={size} height={size} viewBox="0 0 80 80" className={cls}><ellipse cx="40" cy="50" rx="18" ry="22" fill="#34D399"/><circle cx="40" cy="26" r="16" fill="#34D399"/><ellipse cx="32" cy="24" rx="5" ry="6" fill="#1a1a1a"/><ellipse cx="48" cy="24" rx="5" ry="6" fill="#1a1a1a"/><circle cx="32" cy="23" r="2" fill="white"/><circle cx="48" cy="23" r="2" fill="white"/><path d="M35 32 Q40 38 45 32" fill="#F59E0B"/><path d="M20 45 Q10 35 15 25" stroke="#60A5FA" strokeWidth="8" fill="none" strokeLinecap="round"/><path d="M60 45 Q70 35 65 25" stroke="#F87171" strokeWidth="8" fill="none" strokeLinecap="round"/><ellipse cx="40" cy="16" rx="8" ry="5" fill="#10B981"/><path d="M36 12 L40 4 L44 12" fill="#10B981"/></svg>;
  if (type==="owl") return <svg width={size} height={size} viewBox="0 0 80 80" className={cls}><ellipse cx="40" cy="48" rx="22" ry="26" fill="#8B5CF6"/><circle cx="40" cy="28" r="18" fill="#7C3AED"/><circle cx="31" cy="26" r="9" fill="white"/><circle cx="49" cy="26" r="9" fill="white"/><circle cx="31" cy="26" r="6" fill="#1a1a1a"/><circle cx="49" cy="26" r="6" fill="#1a1a1a"/><circle cx="32" cy="25" r="2" fill="white"/><circle cx="50" cy="25" r="2" fill="white"/><path d="M36 35 L40 40 L44 35" fill="#F59E0B"/><path d="M22 18 L28 10 L34 18" fill="#6D28D9"/><path d="M46 18 L52 10 L58 18" fill="#6D28D9"/><path d="M18 55 Q10 65 20 70" stroke="#6D28D9" strokeWidth="6" fill="none" strokeLinecap="round"/><path d="M62 55 Q70 65 60 70" stroke="#6D28D9" strokeWidth="6" fill="none" strokeLinecap="round"/></svg>;
  if (type==="monkey") return <svg width={size} height={size} viewBox="0 0 80 80" className={cls}><ellipse cx="20" cy="32" rx="10" ry="10" fill="#92400E"/><ellipse cx="60" cy="32" rx="10" ry="10" fill="#92400E"/><circle cx="40" cy="38" r="22" fill="#B45309"/><ellipse cx="40" cy="46" rx="14" ry="10" fill="#D97706"/><ellipse cx="31" cy="34" rx="5" ry="6" fill="#1a1a1a"/><ellipse cx="49" cy="34" rx="5" ry="6" fill="#1a1a1a"/><circle cx="31" cy="33" r="2" fill="white"/><circle cx="49" cy="33" r="2" fill="white"/><ellipse cx="37" cy="44" rx="3" ry="2" fill="#92400E"/><ellipse cx="43" cy="44" rx="3" ry="2" fill="#92400E"/><path d="M33 50 Q40 56 47 50" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="22" cy="30" r="5" fill="#D97706"/><circle cx="58" cy="30" r="5" fill="#D97706"/></svg>;
  return <span style={{fontSize:size*0.6}}>🐾</span>;
};

const JungleBg = () => (
  <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    {[{x:0,y:4,r:-5,s:1.1,c:"#4ade80"},{x:86,y:6,r:12,s:0.9,c:"#86efac"},{x:2,y:78,r:-10,s:1.0,c:"#22c55e"},{x:90,y:72,r:18,s:0.85,c:"#4ade80"},{x:42,y:0,r:4,s:0.75,c:"#86efac"},{x:96,y:42,r:8,s:0.9,c:"#4ade80"}].map((l,i)=>(
      <svg key={i} width="56" height="56" viewBox="0 0 60 60" style={{position:"absolute",left:`${l.x}%`,top:`${l.y}%`,transform:`rotate(${l.r}deg) scale(${l.s})`,opacity:0.3,animation:`sway ${3+i*0.4}s ease-in-out infinite alternate`}}>
        <ellipse cx="30" cy="30" rx="12" ry="28" fill={l.c}/><path d="M30 5 Q30 30 30 55" stroke="#15803d" strokeWidth="2" fill="none"/>
      </svg>
    ))}
  </div>
);

const Confetti = ({ active }) => {
  if (!active) return null;
  const pieces = Array.from({length:24},(_,i)=>({x:Math.random()*100,delay:Math.random()*0.4,color:["#F6A800","#4A9EE0","#34C76F","#D45EBC","#FF6B6B","#FFD700"][i%6],size:8+Math.random()*8,rot:Math.random()*360}));
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999}}>{pieces.map((p,i)=><div key={i} style={{position:"absolute",left:`${p.x}%`,top:"-20px",width:p.size,height:p.size,background:p.color,borderRadius:Math.random()>0.5?"50%":"3px",animation:`confettiFall 1.2s ${p.delay}s ease-in forwards`,transform:`rotate(${p.rot}deg)`}}/>)}</div>;
};

const Stars = ({ count, max=3, size=26 }) => (
  <span style={{display:"inline-flex",gap:2}}>
    {Array.from({length:max}).map((_,i)=>(
      <span key={i} style={{fontSize:size,filter:i<count?"drop-shadow(0 0 4px gold)":"none",opacity:i<count?1:0.2,animation:i<count?`starPop 0.4s ${i*0.12}s ease both`:"none"}}>⭐</span>
    ))}
  </span>
);

/* ─── Badge Toast ──────────────────────────────────────────────────────── */
function BadgeToast({ badge, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []);
  return (
    <div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",zIndex:1000,background:"white",borderRadius:20,padding:"14px 22px",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",display:"flex",alignItems:"center",gap:12,animation:"slideUp 0.4s ease",border:"3px solid #F6A800",minWidth:260,maxWidth:"90vw"}}>
      <div style={{fontSize:36}}>{badge.icon}</div>
      <div>
        <div style={{fontFamily:"'Boogaloo',cursive",fontSize:17,color:"#F6A800"}}>Badge Unlocked!</div>
        <div style={{fontWeight:800,fontSize:15,color:"#111"}}>{badge.label}</div>
        <div style={{fontSize:12,color:"#6b7280",fontWeight:700}}>{badge.desc}</div>
      </div>
    </div>
  );
}

/* ─── Question Bank ─────────────────────────────────────────────────────── */
const BANK = {
  maths:[
    {q:"What is 2 + 3?",options:["4","5","6","7"],answer:"5",hint:"Count on your fingers! 🖐️"},
    {q:"What is 4 + 4?",options:["6","7","8","9"],answer:"8",hint:"4 and 4 make double 4!"},
    {q:"What is 6 + 3?",options:["8","9","10","7"],answer:"9",hint:"Start at 6 and count up 3 more."},
    {q:"What is 7 + 5?",options:["10","11","12","13"],answer:"12",hint:"7 + 3 = 10, then + 2 more!"},
    {q:"What is 8 + 6?",options:["12","13","14","15"],answer:"14",hint:"8 + 2 = 10, then + 4 more!"},
    {q:"What is 9 + 9?",options:["16","17","18","19"],answer:"18",hint:"Double 9 is 18!"},
    {q:"What is 5 + 7?",options:["10","11","12","13"],answer:"12",hint:"5 + 5 = 10, then + 2 more!"},
    {q:"What is 6 + 6?",options:["10","11","12","13"],answer:"12",hint:"Double 6 is 12!"},
    {q:"What is 3 + 8?",options:["9","10","11","12"],answer:"11",hint:"Start at 8 and count up 3 more."},
    {q:"What is 10 + 7?",options:["15","16","17","18"],answer:"17",hint:"10 + 7, just add 7 to 10!"},
    {q:"What is 10 − 4?",options:["5","6","7","8"],answer:"6",hint:"Start at 10 and count back 4 steps."},
    {q:"What is 9 − 3?",options:["4","5","6","7"],answer:"6",hint:"Start at 9 and count back 3 steps."},
    {q:"What is 15 − 6?",options:["7","8","9","10"],answer:"9",hint:"15 take away 6. Try counting back!"},
    {q:"What is 12 − 5?",options:["5","6","7","8"],answer:"7",hint:"Start at 12, count back 5 steps."},
    {q:"What is 20 − 8?",options:["10","11","12","13"],answer:"12",hint:"20 − 10 = 10, then + 2!"},
    {q:"What is 14 − 7?",options:["5","6","7","8"],answer:"7",hint:"Half of 14 is 7!"},
    {q:"What is 2 × 3?",options:["4","5","6","7"],answer:"6",hint:"2 groups of 3: 3 + 3 = ?"},
    {q:"What is 4 × 2?",options:["6","7","8","9"],answer:"8",hint:"4 groups of 2: 2+2+2+2 = ?"},
    {q:"What is 5 × 3?",options:["12","13","14","15"],answer:"15",hint:"Count by 5s three times: 5, 10, 15!"},
    {q:"What is 3 × 3?",options:["6","7","8","9"],answer:"9",hint:"3 groups of 3: 3+3+3 = ?"},
    {q:"What is 4 × 5?",options:["15","20","25","30"],answer:"20",hint:"Count by 5s four times: 5,10,15,20!"},
    {q:"What is 3 × 4?",options:["10","11","12","13"],answer:"12",hint:"3 groups of 4: 4+4+4 = ?"},
    {q:"Which number comes after 19?",options:["18","20","21","22"],answer:"20",hint:"Count on from 19!"},
    {q:"What is 10 more than 15?",options:["20","25","30","35"],answer:"25",hint:"Add 10 to 15!"},
    {q:"What is double 7?",options:["12","13","14","15"],answer:"14",hint:"Double means add it to itself: 7 + 7 = ?"},
    {q:"Count by 2s: 2, 4, 6, 8, __",options:["9","10","11","12"],answer:"10",hint:"Add 2 each time!"},
    {q:"Count by 5s: 5, 10, 15, __",options:["18","19","20","21"],answer:"20",hint:"Add 5 each time!"},
    {q:"How many sides does a square have?",options:["3","4","5","6"],answer:"4",hint:"Count the sides of a square!"},
    {q:"Which shape has no corners?",options:["Square","Triangle","Circle","Rectangle"],answer:"Circle",hint:"A circle is perfectly round with no corners!"},
    {q:"How many corners does a triangle have?",options:["2","3","4","5"],answer:"3",hint:"A triangle has 3 sides and 3 corners!"},
    {q:"What is half of 8?",options:["2","3","4","5"],answer:"4",hint:"Split 8 into 2 equal groups!"},
    {q:"What is half of 20?",options:["5","8","10","12"],answer:"10",hint:"Split 20 into 2 equal groups!"},
    {q:"There are 5 birds on a tree.\n3 more land. How many now?",options:["6","7","8","9"],answer:"8",hint:"Add the birds together: 5 + 3 = ?"},
    {q:"A bag has 10 sweets.\nYou eat 4. How many left?",options:["4","5","6","7"],answer:"6",hint:"10 take away 4 = ?"},
    {q:"Mia has 6 stickers.\nShe gets 8 more. How many total?",options:["12","13","14","15"],answer:"14",hint:"Add 6 + 8!"},
    {q:"A class has 20 children.\n9 go home. How many stay?",options:["9","10","11","12"],answer:"11",hint:"20 take away 9 = ?"},
    {q:"How many minutes in an hour?",options:["30","45","60","100"],answer:"60",hint:"There are always 60 minutes in 1 hour!"},
    {q:"How many days in a week?",options:["5","6","7","8"],answer:"7",hint:"Monday, Tuesday... count the days!"},
    {q:"How many months in a year?",options:["10","11","12","13"],answer:"12",hint:"January, February... count them all!"},
  ],
  english:[
    {q:"Which word is a noun?",options:["jump","blue","table","quickly"],answer:"table",hint:"A noun is a thing you can touch! 🪑"},
    {q:"Which word is a noun?",options:["run","happy","London","slowly"],answer:"London",hint:"Names of places are nouns!"},
    {q:"Which word is a noun?",options:["sing","beautiful","elephant","softly"],answer:"elephant",hint:"An elephant is an animal — a thing! 🐘"},
    {q:"Which is a proper noun?",options:["city","girl","Sarah","teacher"],answer:"Sarah",hint:"Names of specific people start with a capital letter!"},
    {q:"Which word is a verb?",options:["house","blue","swim","tree"],answer:"swim",hint:"A verb is something you can DO! 🏊"},
    {q:"Which word is a verb?",options:["tall","quickly","elephant","dance"],answer:"dance",hint:"Can you do it? Dance — yes! That's a verb!"},
    {q:"Which word is a verb?",options:["cloudy","mountain","whisper","purple"],answer:"whisper",hint:"You can whisper — that's an action!"},
    {q:"Pick the verb:\n'The dog runs fast.'",options:["dog","runs","fast","The"],answer:"runs",hint:"What is the dog doing? That's the verb!"},
    {q:"Which word is an adjective?",options:["jump","fluffy","cat","run"],answer:"fluffy",hint:"An adjective describes what something is LIKE!"},
    {q:"Pick the adjective:\n'She has a shiny red bag.'",options:["She","has","bag","shiny"],answer:"shiny",hint:"Which word describes the bag?"},
    {q:"Pick the correct spelling:",options:["becaus","because","becorse","becuase"],answer:"because",hint:"Be-cause: sounds like 'bee-coz'!"},
    {q:"Pick the correct spelling:",options:["peopel","peeple","people","peaple"],answer:"people",hint:"People: p-e-o-p-l-e!"},
    {q:"Pick the correct spelling:",options:["wich","which","whitch","wihch"],answer:"which",hint:"Which starts with wh- like 'where' and 'when'!"},
    {q:"Pick the correct spelling:",options:["there","thier","thear","theyr"],answer:"there",hint:"There — like 'here' with a T in front!"},
    {q:"Pick the correct spelling:",options:["woud","wood","would","wuld"],answer:"would",hint:"Would has a silent L: w-o-u-l-d!"},
    {q:"Pick the correct spelling:",options:["realy","realla","really","relly"],answer:"really",hint:"Really has double L: r-e-a-l-l-y!"},
    {q:"Which sentence is correct?",options:["the cat sat on the mat","The cat sat on the mat.","The cat sat on the mat","the Cat sat on the mat."],answer:"The cat sat on the mat.",hint:"Sentences start with a capital and end with a full stop!"},
    {q:"What punctuation ends a question?",options:[".","!","?",","],answer:"?",hint:"Questions always end with a question mark!"},
    {q:"What punctuation ends an exclamation?",options:[".",",","?","!"],answer:"!",hint:"Wow! Amazing! Those end with an exclamation mark!"},
    {q:"Which uses an apostrophe correctly?",options:["the dogs bone","the dog's bone","the dogs' bone","the dogs bone'"],answer:"the dog's bone",hint:"The apostrophe shows the bone belongs to the dog!"},
    {q:"What does 'enormous' mean?",options:["Very small","Very fast","Very big","Very loud"],answer:"Very big",hint:"An enormous elephant is a HUGE elephant!"},
    {q:"What does 'furious' mean?",options:["Very happy","Very angry","Very tired","Very scared"],answer:"Very angry",hint:"When you're furious, you're really, really cross!"},
    {q:"Which word means the same as 'happy'?",options:["sad","angry","joyful","tired"],answer:"joyful",hint:"Joyful means full of joy — just like happy!"},
    {q:"Which word is the opposite of 'fast'?",options:["quick","slow","speed","run"],answer:"slow",hint:"Fast and slow are opposites!"},
    {q:"Which word means the same as 'scared'?",options:["brave","frightened","excited","happy"],answer:"frightened",hint:"Frightened and scared mean the same thing!"},
    {q:"Which is a complete sentence?",options:["The big brown","Running fast","The cat sat.","Jumped high"],answer:"The cat sat.",hint:"A sentence needs a subject and a verb!"},
    {q:"Which word is an adverb?",options:["dog","happy","quickly","run"],answer:"quickly",hint:"Adverbs often end in -ly and describe verbs!"},
    {q:"Which word is a pronoun?",options:["dog","run","she","blue"],answer:"she",hint:"She, he, it, they are pronouns!"},
    {q:"Pick the conjunction:",options:["run","blue","and","fast"],answer:"and",hint:"'And' joins two things together!"},
    {q:"Which word rhymes with 'cat'?",options:["dog","car","mat","cup"],answer:"mat",hint:"Cat... mat... they both end in -at!"},
    {q:"How many syllables in 'elephant'?",options:["1","2","3","4"],answer:"3",hint:"El-e-phant — clap each part! 3 claps!"},
  ],
  reading:[
    {passage:"Lily loves the rain. She puts on her yellow boots and splashes in puddles. Her dog Max jumps in too! They both get very wet but they are very happy.",q:"What colour are Lily's boots?",options:["Red","Blue","Yellow","Green"],answer:"Yellow",hint:"Read the second sentence again! 👀"},
    {passage:"Lily loves the rain. She puts on her yellow boots and splashes in puddles. Her dog Max jumps in too! They both get very wet but they are very happy.",q:"How did Lily and Max feel?",options:["Sad and cold","Wet and unhappy","Very happy","Bored and tired"],answer:"Very happy",hint:"Look at the last sentence!"},
    {passage:"Tom found a tiny seed in the garden. He planted it in the soil and watered it every day. After two weeks, a small green shoot appeared. Tom was so excited!",q:"How did Tom feel when the shoot appeared?",options:["Sad","Excited","Tired","Angry"],answer:"Excited",hint:"Look at the last sentence! 🌱"},
    {passage:"Tom found a tiny seed in the garden. He planted it in the soil and watered it every day. After two weeks, a small green shoot appeared. Tom was so excited!",q:"What did Tom do with the seed?",options:["Ate it","Threw it away","Planted it in soil","Gave it to a friend"],answer:"Planted it in soil",hint:"Read the second sentence!"},
    {passage:"The library is a quiet place. People go there to read books and learn new things. You must whisper so you don't disturb others. Sam loves visiting every Saturday.",q:"Why must you whisper in the library?",options:["It is dark","The librarian says so","To not disturb others","Books are fragile"],answer:"To not disturb others",hint:"The passage explains the reason! 📚"},
    {passage:"Mia has three pets: a fluffy rabbit called Snowball, a goldfish called Bubbles, and a parrot named Polly. Polly can say 'hello' and 'goodnight'. Mia feeds them every morning.",q:"Which pet can talk?",options:["Snowball","Bubbles","Polly","All of them"],answer:"Polly",hint:"Which animal is known for talking? 🦜"},
    {passage:"The sun was setting and the sky turned orange and pink. Birds flew home to their nests. The flowers closed their petals. It was the end of a perfect day.",q:"What happened to the flowers?",options:["They grew taller","They closed their petals","They changed colour","They fell off"],answer:"They closed their petals",hint:"Find the sentence about flowers!"},
    {passage:"Jack loved space. He had posters of planets on his walls and could name all eight of them. His favourite was Saturn because of its beautiful rings. He wanted to be an astronaut one day.",q:"What was Jack's favourite planet?",options:["Jupiter","Mars","Saturn","Earth"],answer:"Saturn",hint:"Find the sentence with 'favourite'!"},
    {passage:"Jack loved space. He had posters of planets on his walls and could name all eight of them. His favourite was Saturn because of its beautiful rings. He wanted to be an astronaut one day.",q:"What did Jack want to be?",options:["A scientist","A pilot","An astronaut","A teacher"],answer:"An astronaut",hint:"Look at the last sentence!"},
    {passage:"Every morning, Rosa helped her grandmother make breakfast. They made toast with butter and a big pot of tea. Rosa liked this time because her grandmother told her funny stories.",q:"What did Rosa and her grandmother make?",options:["Porridge and juice","Toast and tea","Eggs and milk","Soup and bread"],answer:"Toast and tea",hint:"Read the second sentence!"},
    {passage:"Every morning, Rosa helped her grandmother make breakfast. They made toast with butter and a big pot of tea. Rosa liked this time because her grandmother told her funny stories.",q:"Why did Rosa like breakfast time?",options:["The food was yummy","She got to watch TV","Her grandmother told funny stories","She could sleep in"],answer:"Her grandmother told funny stories",hint:"Look at the last sentence!"},
    {passage:"The old lighthouse stood on a rocky cliff. Every night its light flashed to warn ships of the dangerous rocks below. Without it, many ships might have crashed.",q:"Why did the lighthouse flash its light?",options:["To look pretty","To wake people up","To warn ships of rocks","To attract fish"],answer:"To warn ships of rocks",hint:"Read the second sentence!"},
    {passage:"Penguins cannot fly but they are excellent swimmers. They use their wings as flippers to zoom through the water. A penguin can swim as fast as 25 kilometres per hour!",q:"What do penguins use as flippers?",options:["Their feet","Their tails","Their wings","Their beaks"],answer:"Their wings",hint:"Read the second sentence!"},
    {passage:"Penguins cannot fly but they are excellent swimmers. They use their wings as flippers to zoom through the water. A penguin can swim as fast as 25 kilometres per hour!",q:"How fast can a penguin swim?",options:["10 km/h","15 km/h","20 km/h","25 km/h"],answer:"25 km/h",hint:"Find the sentence with numbers in it!"},
    {passage:"On Saturday morning, the whole family went to the farmers' market. Dad bought fresh strawberries and Mum chose a bunch of sunflowers. Everyone walked home smiling.",q:"What did Mum buy?",options:["Strawberries","Sunflowers","Cinnamon rolls","Vegetables"],answer:"Sunflowers",hint:"Read the sentence about Mum!"},
    {passage:"The giant tortoise is one of the longest-living animals on Earth. Some tortoises have lived for over 150 years! They move very slowly and eat plants.",q:"What do giant tortoises eat?",options:["Fish","Insects","Plants","Meat"],answer:"Plants",hint:"Find the sentence about what they eat!"},
    {passage:"Maya wanted to make a card for her mum's birthday. She got out glitter, stickers, coloured paper and felt-tip pens. She spent an hour cutting and sticking.",q:"Why did Maya make the card?",options:["For Christmas","For her teacher","For her mum's birthday","For a school project"],answer:"For her mum's birthday",hint:"Read the very first sentence!"},
    {passage:"Maya wanted to make a card for her mum's birthday. She got out glitter, stickers, coloured paper and felt-tip pens. She spent an hour cutting and sticking.",q:"How long did Maya spend making the card?",options:["10 minutes","30 minutes","An hour","All day"],answer:"An hour",hint:"Find the sentence about time!"},
  ],
  verbal:[
    {q:"Which word doesn't belong?\n🍎 Apple  🍌 Banana  🥕 Carrot  🍇 Grape",options:["Apple","Banana","Carrot","Grape"],answer:"Carrot",hint:"Three are fruits. One is a vegetable! 🥕"},
    {q:"Which word doesn't belong?\n🐶 Dog  🐱 Cat  🐟 Fish  🌹 Rose",options:["Dog","Cat","Fish","Rose"],answer:"Rose",hint:"Three are animals. One is a plant!"},
    {q:"Which word doesn't belong?\n🔴 Red  🔵 Blue  🟢 Green  🦘 Jump",options:["Red","Blue","Green","Jump"],answer:"Jump",hint:"Three are colours. One is an action!"},
    {q:"Which word doesn't belong?\n⚽ Football  🎾 Tennis  🏊 Swimming  🏀 Basketball",options:["Football","Tennis","Swimming","Basketball"],answer:"Swimming",hint:"Three use a ball. One doesn't!"},
    {q:"Which word doesn't belong?\n🚗 Car  🚌 Bus  🚂 Train  ✈️ Plane",options:["Car","Bus","Train","Plane"],answer:"Plane",hint:"Three travel on the ground. One travels in the air!"},
    {q:"Which word doesn't belong?\n👁️ Eye  👂 Ear  👃 Nose  🧢 Hat",options:["Eye","Ear","Nose","Hat"],answer:"Hat",hint:"Three are parts of the face. One is worn on it!"},
    {q:"Which word doesn't belong?\n🎹 Piano  🎸 Guitar  🥁 Drums  🎨 Painting",options:["Piano","Guitar","Drums","Painting"],answer:"Painting",hint:"Three are musical instruments. One is art!"},
    {q:"Cat is to kitten as\ndog is to...?",options:["kennel","puppy","bark","leash"],answer:"puppy",hint:"A baby cat is a kitten. A baby dog is...? 🐶"},
    {q:"Sun is to day as\nmoon is to...?",options:["sky","star","night","cloud"],answer:"night",hint:"The sun is out in the day. The moon is out at..."},
    {q:"Bird is to nest as\nbee is to...?",options:["flower","honey","hive","wing"],answer:"hive",hint:"A bird lives in a nest. A bee lives in a..."},
    {q:"Book is to read as\npencil is to...?",options:["draw","eat","sleep","jump"],answer:"draw",hint:"You use a book to read. You use a pencil to..."},
    {q:"Fish is to swim as\nbird is to...?",options:["run","hop","fly","crawl"],answer:"fly",hint:"A fish swims. A bird...?"},
    {q:"Hot is to cold as\nfast is to...?",options:["quick","speed","slow","run"],answer:"slow",hint:"Hot and cold are opposites. Fast and... are opposites!"},
    {q:"Doctor is to hospital as\nteacher is to...?",options:["office","library","school","home"],answer:"school",hint:"A doctor works in a hospital. A teacher works in a..."},
    {q:"What comes next?\nMonday, Tuesday, Wednesday, __",options:["Friday","Saturday","Thursday","Sunday"],answer:"Thursday",hint:"The days of the week go in order!"},
    {q:"What comes next?\nSpring, Summer, Autumn, __",options:["January","Winter","Monday","Morning"],answer:"Winter",hint:"The four seasons go in order!"},
    {q:"What comes next?\n10, 20, 30, 40, __",options:["45","48","50","55"],answer:"50",hint:"Count up by 10 each time!"},
    {q:"Which word means the same as 'brave'?",options:["scared","funny","courageous","clumsy"],answer:"courageous",hint:"A firefighter is brave and courageous!"},
    {q:"Which word means the same as 'big'?",options:["tiny","huge","fast","cold"],answer:"huge",hint:"Huge means really, really big!"},
    {q:"Which word means the same as 'sad'?",options:["happy","angry","unhappy","excited"],answer:"unhappy",hint:"Sad and unhappy mean the same thing!"},
    {q:"Which word means the same as 'fast'?",options:["slow","quick","heavy","tall"],answer:"quick",hint:"Quick and fast both mean speedy!"},
    {q:"Which word goes with\n'shoes, boots, sandals'?",options:["hat","gloves","trainers","scarf"],answer:"trainers",hint:"All the others are things you wear on your FEET!"},
    {q:"If all cats are animals\nand Whiskers is a cat,\nthen Whiskers is...?",options:["a plant","a vehicle","an animal","a vegetable"],answer:"an animal",hint:"If cats are animals, and Whiskers is a cat..."},
    {q:"Sam is taller than Ella.\nElla is taller than Ben.\nWho is shortest?",options:["Sam","Ella","Ben","They're the same"],answer:"Ben",hint:"Work through it: Sam > Ella > Ben. Who's last?"},
  ],
};

async function fetchAIQ(subject) {
  const prompts = {
    maths:"Generate 1 simple maths question for a 5-7 year old. Return ONLY valid JSON: {\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
    english:"Generate 1 English question for a 5-7 year old. Return ONLY valid JSON: {\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
    reading:"Generate a 3-sentence story for ages 5-7 with 1 question. Return ONLY valid JSON: {\"passage\":\"...\",\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
    verbal:"Generate 1 verbal reasoning question for ages 5-7. Return ONLY valid JSON: {\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
  };
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,system:"You are a friendly teacher for children aged 5-7. Respond ONLY with valid JSON, no markdown.",messages:[{role:"user",content:prompts[subject]}]})});
    const d = await r.json();
    const txt=(d.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
    return JSON.parse(txt);
  } catch{return null;}
}

/* ─── CSS ──────────────────────────────────────────────────────────────── */
const CSS = `
@import url('${FONTS}');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;touch-action:manipulation}
body{font-family:'Quicksand',sans-serif;background:#F0FDF4;min-height:100vh;min-height:100dvh;overscroll-behavior:none;-webkit-tap-highlight-color:transparent}
.app{max-width:680px;margin:0 auto;padding:12px 14px;padding-top:max(12px,env(safe-area-inset-top));padding-bottom:max(20px,env(safe-area-inset-bottom));padding-left:max(14px,env(safe-area-inset-left));padding-right:max(14px,env(safe-area-inset-right));position:relative;z-index:1;min-height:100vh;min-height:100dvh}
@keyframes sway{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}
@keyframes float{from{transform:translateY(0)}to{transform:translateY(-10px)}}
@keyframes mascot-bounce{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-8px) rotate(3deg)}}
@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}
@keyframes starPop{0%{transform:scale(0)}70%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes badgePop{0%{transform:translateX(-50%) scale(0.5);opacity:0}70%{transform:translateX(-50%) scale(1.08)}100%{transform:translateX(-50%) scale(1);opacity:1}}
.mascot-bounce{animation:mascot-bounce 1.4s ease-in-out infinite}
.slide-up{animation:slideUp 0.3s ease both}
.home-hero{text-align:center;padding:16px 0 8px}
.logo{font-family:'Boogaloo',cursive;font-size:clamp(32px,8vw,48px);background:linear-gradient(135deg,#16a34a,#F6A800,#D45EBC);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.1}
.logo-sub{font-size:clamp(12px,3vw,15px);color:#6b7280;font-weight:700;margin-top:3px}
.vine{height:4px;background:repeating-linear-gradient(90deg,#4ade80 0,#4ade80 12px,transparent 12px,transparent 20px);border-radius:99px;margin:8px 0}
.nav-tabs{display:flex;gap:8px;margin-bottom:12px}
.nav-tab{flex:1;padding:10px;border-radius:14px;border:2.5px solid #e5e7eb;background:white;font-family:'Boogaloo',cursive;font-size:clamp(14px,3.5vw,17px);cursor:pointer;color:#6b7280;transition:all 0.15s;touch-action:manipulation}
.nav-tab.active{background:#16a34a;color:white;border-color:#16a34a}
.nav-tab:active{transform:scale(0.97)}
.subject-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px}
@media(min-width:600px){.subject-grid{grid-template-columns:repeat(4,1fr)}}
.subject-card{border-radius:20px;padding:clamp(12px,3vw,20px) clamp(10px,2.5vw,16px);cursor:pointer;border:3px solid transparent;position:relative;overflow:hidden;transition:transform 0.18s,box-shadow 0.18s;text-align:center;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none}
.subject-card:active{transform:scale(0.96)}
@media(hover:hover){.subject-card:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 10px 28px rgba(0,0,0,0.13)}}
.card-label{font-family:'Boogaloo',cursive;font-size:clamp(17px,4vw,22px);margin-bottom:2px}
.card-desc{font-size:clamp(10px,2.2vw,12px);font-weight:700;opacity:0.7}
.card-stars{margin-top:5px}
.badge-best{position:absolute;top:7px;right:7px;background:white;border-radius:99px;padding:2px 7px;font-size:10px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,0.1)}
.topbar{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.back-btn{background:white;border:2.5px solid #e5e7eb;border-radius:14px;padding:9px 14px;font-size:clamp(13px,3vw,15px);font-weight:700;cursor:pointer;font-family:'Quicksand',sans-serif;white-space:nowrap;min-height:44px;touch-action:manipulation}
.back-btn:active{background:#f0f0f0}
.topbar-label{font-family:'Boogaloo',cursive;font-size:clamp(17px,4vw,22px);flex:1}
.score-chip{background:white;border:2px solid #e5e7eb;border-radius:99px;padding:5px 10px;font-size:clamp(12px,3vw,14px);font-weight:800;white-space:nowrap}
.icon-btn{background:white;border:2px solid #e5e7eb;border-radius:99px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;flex-shrink:0;touch-action:manipulation}
.icon-btn:active{background:#f0f0f0}
.prog-row{display:flex;align-items:center;gap:5px;margin-bottom:10px;flex-wrap:wrap}
.prog-dot{width:10px;height:10px;border-radius:50%;background:#e5e7eb;transition:all 0.3s;flex-shrink:0}
.prog-dot.done{background:#34C76F}.prog-dot.active{transform:scale(1.35)}
.prog-track{flex:1;min-width:60px;height:7px;background:#e5e7eb;border-radius:99px;overflow:hidden}
.prog-fill{height:100%;border-radius:99px;transition:width 0.4s ease}
.q-wrap{animation:slideUp 0.3s ease both}
.q-card{background:white;border-radius:22px;padding:clamp(14px,4vw,24px) clamp(12px,4vw,20px);box-shadow:0 4px 24px rgba(0,0,0,0.08);border:2.5px solid #f3f4f6;margin-bottom:10px}
.ai-badge{display:inline-flex;align-items:center;gap:5px;background:#EDE9FE;color:#7C3AED;border-radius:99px;font-size:11px;font-weight:800;padding:3px 10px;margin-bottom:8px}
.passage{background:#FFFBEB;border-left:4px solid #F6A800;border-radius:14px;padding:clamp(10px,3vw,14px);font-size:clamp(13px,3.2vw,15px);line-height:1.75;margin-bottom:12px;color:#555;font-weight:600}
.q-num{font-size:11px;font-weight:800;color:#9ca3af;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px}
.q-text{font-size:clamp(14px,3.8vw,18px);font-weight:700;color:#111;line-height:1.4;white-space:pre-line}
.read-btn{background:none;border:2px solid #e5e7eb;border-radius:99px;padding:5px 13px;font-size:12px;font-weight:800;cursor:pointer;color:#6b7280;margin-top:8px;display:inline-flex;align-items:center;gap:5px;touch-action:manipulation;font-family:'Quicksand',sans-serif}
.read-btn.reading{border-color:#4A9EE0;color:#4A9EE0;background:#EFF8FF}
.read-btn:active{background:#f0f0f0}
.options{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}
@media(max-width:340px){.options{grid-template-columns:1fr}}
.opt{border-radius:16px;padding:clamp(11px,3vw,15px) clamp(7px,2vw,11px);font-size:clamp(13px,3.2vw,15px);font-weight:700;border:3px solid transparent;cursor:pointer;transition:all 0.15s;font-family:'Quicksand',sans-serif;text-align:center;line-height:1.3;min-height:50px;display:flex;align-items:center;justify-content:center;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.opt:active:not(:disabled){transform:scale(0.96)}
@media(hover:hover){.opt:hover:not(:disabled){transform:scale(1.03)}}
.opt:disabled{cursor:default}
.opt-default{background:#F5F7FF;color:#374151;border-color:#e5e7eb}
.opt-correct{background:#D1FAE5;color:#065F46;border-color:#34D399;animation:pulse 0.4s}
.opt-wrong{background:#FEE2E2;color:#7F1D1D;border-color:#F87171}
.hint-btn{background:none;border:2.5px dashed #FBBF24;color:#D97706;border-radius:14px;padding:9px 16px;font-size:clamp(13px,3vw,14px);font-weight:800;cursor:pointer;margin-top:10px;font-family:'Quicksand',sans-serif;display:block;width:100%;min-height:44px;touch-action:manipulation}
.hint-btn:active{background:#FFFBEB}
.hint-box{background:#FFFBEB;border-radius:14px;padding:9px 13px;margin-top:8px;font-size:clamp(13px,3vw,14px);color:#B45309;font-weight:700;border:2px dashed #FBBF24}
.feedback{border-radius:16px;padding:11px 14px;margin-top:10px;font-size:clamp(13px,3.2vw,15px);font-weight:700;animation:slideUp 0.2s}
.fb-correct{background:#D1FAE5;color:#065F46;border:2px solid #34D399}
.fb-wrong{background:#FEE2E2;color:#7F1D1D;border:2px solid #F87171}
.streak-banner{background:linear-gradient(90deg,#FF6B6B,#F6A800);color:white;border-radius:14px;padding:8px 14px;margin-top:8px;font-family:'Boogaloo',cursive;font-size:17px;text-align:center;animation:pulse 0.5s}
.next-btn{width:100%;padding:clamp(12px,3.5vw,16px);border-radius:18px;font-family:'Boogaloo',cursive;font-size:clamp(17px,4.5vw,21px);border:none;cursor:pointer;margin-top:10px;color:white;transition:transform 0.15s;min-height:52px;touch-action:manipulation}
.next-btn:active{transform:scale(0.97)}
.loading{text-align:center;padding:clamp(32px,8vw,50px) 24px}
.spin{width:42px;height:42px;border:5px solid #e5e7eb;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto 14px}
.results{background:white;border-radius:26px;padding:clamp(24px,6vw,38px) clamp(18px,5vw,30px);box-shadow:0 4px 28px rgba(0,0,0,0.1);text-align:center;animation:slideUp 0.35s}
.results-title{font-family:'Boogaloo',cursive;font-size:clamp(26px,7vw,36px);margin-bottom:4px}
.results-score{font-family:'Boogaloo',cursive;font-size:clamp(44px,12vw,60px);margin:8px 0}
.results-msg{font-size:clamp(12px,3vw,15px);color:#6b7280;font-weight:700;margin-bottom:18px}
.results-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.res-btn{border-radius:16px;padding:clamp(10px,3vw,13px) clamp(16px,5vw,24px);font-family:'Boogaloo',cursive;font-size:clamp(16px,4vw,20px);border:none;cursor:pointer;color:white;transition:transform 0.15s;min-height:50px;touch-action:manipulation;flex:1;max-width:170px}
.res-btn:active{transform:scale(0.97)}

/* Achievements */
.achievements-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:10px}
.ach-card{background:white;border-radius:18px;padding:14px 12px;text-align:center;border:2.5px solid #e5e7eb;transition:transform 0.15s}
.ach-card.earned{border-color:#F6A800;background:#FFFBEB}
.ach-card.locked{opacity:0.45;filter:grayscale(0.6)}
.ach-icon{font-size:32px;margin-bottom:6px}
.ach-label{font-family:'Boogaloo',cursive;font-size:14px;color:#111;margin-bottom:2px}
.ach-desc{font-size:11px;color:#6b7280;font-weight:700}

/* Parent Dashboard */
.dash-section{background:white;border-radius:20px;padding:16px 18px;margin-bottom:12px;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.dash-title{font-family:'Boogaloo',cursive;font-size:20px;color:#111;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.dash-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f3f4f6}
.dash-row:last-child{border-bottom:none}
.dash-bar-wrap{flex:1;height:10px;background:#f3f4f6;border-radius:99px;overflow:hidden}
.dash-bar{height:100%;border-radius:99px;transition:width 0.6s ease}
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.stat-box{background:#F0FDF4;border-radius:16px;padding:12px;text-align:center}
.stat-num{font-family:'Boogaloo',cursive;font-size:28px;color:#16a34a}
.stat-label{font-size:11px;font-weight:800;color:#6b7280}
`;

/* ─── Home ─────────────────────────────────────────────────────────────── */
function Home({ progress, history, earned, onSelect, sounds, muted, toggleMute, tab, setTab }) {
  return (
    <div>
      <div className="home-hero">
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginBottom:4}}>
          <button className="icon-btn" onClick={toggleMute}>{muted?"🔇":"🔊"}</button>
        </div>
        <div className="logo">🌿 BrightMind 🌿</div>
        <div className="logo-sub">Learning adventures for little explorers!</div>
      </div>
      <div className="vine"/>

      <div className="nav-tabs">
        {[["📚","Subjects"],["🏅","Badges"],["👨‍👩‍👧","Progress"]].map(([icon,label],i)=>(
          <button key={label} className={`nav-tab${tab===i?" active":""}`} onClick={()=>{ sounds.tap(); setTab(i); }}>{icon} {label}</button>
        ))}
      </div>

      {tab===0 && (
        <div className="subject-grid">
          {SUBJECTS.map((s,i)=>{
            const p=progress[s.id]||{};
            return (
              <div key={s.id} className="subject-card slide-up" style={{background:s.bg,borderColor:s.border,animationDelay:`${i*0.08}s`}} onClick={()=>{sounds.tap();onSelect(s.id);}}>
                {p.best>0&&<div className="badge-best" style={{color:s.dark}}>Best {p.best}/{TOTAL}</div>}
                <div style={{fontSize:36,marginBottom:4}}><Mascot type={s.mascot} size={52} animate/></div>
                <div className="card-label" style={{color:s.dark}}>{s.label}</div>
                <div className="card-desc" style={{color:s.dark}}>{s.desc}</div>
                <div className="card-stars"><Stars count={p.stars||0} size={20}/></div>
              </div>
            );
          })}
        </div>
      )}

      {tab===1 && (
        <div>
          <div style={{fontWeight:700,color:"#6b7280",fontSize:13,marginBottom:10}}>{earned.length} of {ACHIEVEMENTS.length} badges earned 🏅</div>
          <div className="achievements-grid">
            {ACHIEVEMENTS.map(a=>{
              const got=earned.includes(a.id);
              return (
                <div key={a.id} className={`ach-card ${got?"earned":"locked"}`}>
                  <div className="ach-icon">{got?a.icon:"🔒"}</div>
                  <div className="ach-label">{a.label}</div>
                  <div className="ach-desc">{a.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab===2 && <ParentDash progress={progress} history={history} earned={earned}/>}
    </div>
  );
}

/* ─── Parent Dashboard ─────────────────────────────────────────────────── */
function ParentDash({ progress, history, earned }) {
  return (
    <div>
      <div className="dash-section">
        <div className="dash-title">📊 Overall Stats</div>
        <div className="stat-grid">
          <div className="stat-box"><div className="stat-num">{history.total||0}</div><div className="stat-label">Quizzes Done</div></div>
          <div className="stat-box"><div className="stat-num">{history.perfectScores||0}</div><div className="stat-label">Perfect Scores</div></div>
          <div className="stat-box"><div className="stat-num">{earned.length}</div><div className="stat-label">Badges Earned</div></div>
          <div className="stat-box"><div className="stat-num">{history.bestStreak||0}</div><div className="stat-label">Best Streak 🔥</div></div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-title">📚 Subject Progress</div>
        {SUBJECTS.map(s=>{
          const p=progress[s.id]||{};
          const pct=p.best?Math.round((p.best/TOTAL)*100):0;
          return (
            <div key={s.id} className="dash-row">
              <div style={{width:28,textAlign:"center",fontSize:18}}>{s.emoji}</div>
              <div style={{width:70,fontWeight:800,fontSize:13,color:s.dark}}>{s.label}</div>
              <div className="dash-bar-wrap"><div className="dash-bar" style={{width:`${pct}%`,background:s.btn}}/></div>
              <div style={{width:55,textAlign:"right",fontSize:12,fontWeight:800,color:"#6b7280"}}>{p.best||0}/{TOTAL}</div>
              <div style={{width:44}}><Stars count={p.stars||0} size={14}/></div>
            </div>
          );
        })}
      </div>

      <div className="dash-section">
        <div className="dash-title">🏅 Recent Badges</div>
        {earned.length===0 ? <div style={{color:"#9ca3af",fontWeight:700,fontSize:14}}>No badges yet — keep playing! 🌱</div> : (
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {earned.slice(-8).map(id=>{
              const a=ACHIEVEMENTS.find(x=>x.id===id);
              return a?<div key={id} style={{background:"#FFFBEB",border:"2px solid #F6A800",borderRadius:12,padding:"6px 12px",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",gap:6}}><span>{a.icon}</span>{a.label}</div>:null;
            })}
          </div>
        )}
      </div>

      <div style={{textAlign:"center",fontSize:11,color:"#9ca3af",fontWeight:700,marginTop:8,padding:"0 12px"}}>
        💡 Tip: Aim for 3 stars on every subject! Encourage your child to try all 4 subjects to unlock the Explorer badge.
      </div>
    </div>
  );
}

/* ─── Quiz ─────────────────────────────────────────────────────────────── */
const CHEERS=["Amazing! 🎉","Brilliant! 🌟","Super star! ⭐","Wow! 🏆","Great job! 🎊","Fantastic! 🦁","You got it! 🎯","Excellent! 🌈"];

function Quiz({ subjectId, onBack, onDone, sounds, muted, toggleMute }) {
  const s=SUBJECTS.find(x=>x.id===subjectId);
  const [qs,setQs]=useState([]);
  const [idx,setIdx]=useState(0);
  const [sel,setSel]=useState(null);
  const [hint,setHint]=useState(false);
  const [score,setScore]=useState(0);
  const [done,setDone]=useState(false);
  const [loading,setLoading]=useState(true);
  const [confetti,setConfetti]=useState(false);
  const [streak,setStreak]=useState(0);
  const [bestStreak,setBestStreak]=useState(0);
  const [reading,setReading]=useState(false);

  const build=useCallback(async()=>{
    setLoading(true);
    const bank=[...BANK[subjectId]].sort(()=>Math.random()-0.5);
    const aiResults=await Promise.all([fetchAIQ(subjectId),fetchAIQ(subjectId),fetchAIQ(subjectId)]);
    const aiQs=aiResults.filter(q=>q?.q&&q?.options&&q?.answer).map(q=>({...q,isAI:true}));
    const fixed=bank.slice(0,TOTAL-aiQs.length);
    const combined=[...fixed,...aiQs].sort(()=>Math.random()-0.5).slice(0,TOTAL);
    setQs(combined);
    setLoading(false);
  },[subjectId]);

  useEffect(()=>{build();},[build]);
  useEffect(()=>{return()=>stopSpeaking();},[]);

  const cur=qs[idx];

  const readQuestion=()=>{
    if(reading){stopSpeaking();setReading(false);return;}
    setReading(true);
    const txt=cur.passage?`${cur.passage}. Question: ${cur.q}`:`Question ${idx+1}. ${cur.q}`;
    speak(txt,()=>setReading(false));
  };

  const pick=(opt)=>{
    if(sel!==null)return;
    stopSpeaking();setReading(false);
    setSel(opt);
    if(opt===cur.answer){
      const newStreak=streak+1;
      setScore(n=>n+1);
      setStreak(newStreak);
      setBestStreak(b=>Math.max(b,newStreak));
      setConfetti(true);
      setTimeout(()=>setConfetti(false),1300);
      sounds.correct();
    } else {
      setStreak(0);
      sounds.wrong();
    }
  };

  const next=()=>{
    sounds.tap();
    stopSpeaking();setReading(false);
    const finalScore=score+(sel===cur.answer?0:0);
    if(idx+1>=TOTAL){onDone(score,bestStreak);setDone(true);}
    else{setIdx(i=>i+1);setSel(null);setHint(false);}
  };

  if(loading) return (
    <div>
      <div className="topbar">
        <button className="back-btn" onClick={()=>{sounds.tap();onBack();}}>← Back</button>
        <div className="topbar-label" style={{color:s.btn}}>{s.emoji} {s.label}</div>
        <button className="icon-btn" onClick={toggleMute}>{muted?"🔇":"🔊"}</button>
      </div>
      <div className="loading">
        <div className="spin" style={{borderTopColor:s.btn}}/>
        <div style={{fontWeight:700,color:"#9ca3af",fontSize:14}}>Loading {TOTAL} questions... 🌿</div>
        <div style={{marginTop:14}}><Mascot type={s.mascot} size={66} animate/></div>
      </div>
    </div>
  );

  if(done) return <Results score={score} total={TOTAL} subject={s}
    onBack={()=>{sounds.tap();onBack();}}
    onRetry={()=>{sounds.tap();setQs([]);setIdx(0);setSel(null);setHint(false);setScore(0);setDone(false);setStreak(0);build();}}
    sounds={sounds} muted={muted} toggleMute={toggleMute}/>;

  const correct=sel===cur?.answer;

  return (
    <div>
      <Confetti active={confetti}/>
      <div className="topbar">
        <button className="back-btn" onClick={()=>{sounds.tap();stopSpeaking();onBack();}}>← Home</button>
        <div className="topbar-label" style={{color:s.btn}}>{s.emoji} {s.label}</div>
        <div className="score-chip" style={{color:s.btn}}>{score} ⭐</div>
        <button className="icon-btn" onClick={toggleMute}>{muted?"🔇":"🔊"}</button>
      </div>

      <div className="prog-row">
        {Array.from({length:TOTAL}).map((_,i)=>(
          <div key={i} className={`prog-dot ${i<idx?"done":i===idx?"active":""}`} style={i===idx?{background:s.btn}:{}}/>
        ))}
        <div className="prog-track"><div className="prog-fill" style={{width:`${(idx/TOTAL)*100}%`,background:s.btn}}/></div>
        <span style={{fontSize:11,fontWeight:800,color:"#9ca3af"}}>{idx+1}/{TOTAL}</span>
      </div>

      {streak>=3&&sel===null&&<div className="streak-banner">🔥 {streak} in a row! Keep going!</div>}

      <div className="q-wrap" key={idx}>
        <div className="q-card" style={{borderColor:s.border}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <Mascot type={s.mascot} size={40} animate={sel!==null&&correct}/>
            <div style={{flex:1}}>
              {cur.isAI&&<div className="ai-badge">✨ AI question</div>}
              <div className="q-num">Question {idx+1} of {TOTAL}</div>
            </div>
          </div>
          {cur.passage&&<div className="passage">{cur.passage}</div>}
          <div className="q-text">{cur.q}</div>
          <button className={`read-btn${reading?" reading":""}`} onClick={readQuestion}>
            {reading?"⏹ Stop":"🔈 Read to me"}
          </button>

          <div className="options">
            {cur.options.map(opt=>{
              let cls="opt opt-default";
              if(sel!==null){if(opt===cur.answer)cls="opt opt-correct";else if(opt===sel)cls="opt opt-wrong";}
              return <button key={opt} className={cls} disabled={sel!==null} onClick={()=>pick(opt)} style={sel===null?{borderColor:s.border+"66"}:{}}>{opt}</button>;
            })}
          </div>

          {sel===null&&!hint&&<button className="hint-btn" onClick={()=>{sounds.tap();setHint(true);}}>💡 I need a hint!</button>}
          {hint&&sel===null&&<div className="hint-box">💡 {cur.hint}</div>}
          {sel!==null&&(
            <>
              <div className={`feedback ${correct?"fb-correct":"fb-wrong"}`}>
                {correct?`✅ ${CHEERS[Math.floor(Math.random()*CHEERS.length)]}`:`❌ The answer is: ${cur.answer}`}
              </div>
              {!correct&&<div className="hint-box">💡 {cur.hint}</div>}
              <button className="next-btn" style={{background:s.btn}} onClick={next}>
                {idx+1>=TOTAL?"See my results! 🎉":"Next question →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Results ──────────────────────────────────────────────────────────── */
function Results({ score, total, subject:s, onBack, onRetry, sounds }) {
  const pct=score/total;
  const stars=pct===1?3:pct>=0.6?2:pct>=0.3?1:0;
  const [show,setShow]=useState(false);
  useEffect(()=>{setTimeout(()=>{setShow(true);sounds.fanfare();},300);},[]);
  const msgs=["Keep practicing — you can do it! 💪","Good try! Practice makes perfect! 🌱","Great work! Keep it up! 🌟","Perfect score! You're a superstar! 🏆"];
  return (
    <div>
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>← Home</button>
        <div className="topbar-label" style={{color:s.btn}}>{s.emoji} {s.label}</div>
      </div>
      <div className="results">
        <Mascot type={s.mascot} size={80} animate/>
        <div className="results-title" style={{color:s.btn}}>Quiz done!</div>
        {show&&<Stars count={stars} max={3} size={32}/>}
        <div className="results-score" style={{color:s.btn}}>{score}/{total}</div>
        <div className="results-msg">{msgs[stars]}</div>
        <div className="results-btns">
          <button className="res-btn" style={{background:s.btn}} onClick={onRetry}>Try again 🔄</button>
          <button className="res-btn" style={{background:"#6b7280"}} onClick={onBack}>Home 🏠</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Root ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [screen,setScreen]=useState("home");
  const [subject,setSubject]=useState(null);
  const [muted,setMuted]=useState(false);
  const [tab,setTab]=useState(0);
  const [toastQueue,setToastQueue]=useState([]);

  const [progress,setProgress]=useState(()=>{
    const p={};SUBJECTS.forEach(s=>{p[s.id]={stars:0,best:0};});return p;
  });
  const [history,setHistory]=useState({total:0,perfectScores:0,bestStreak:0,improvements:0});
  const [earned,setEarned]=useState([]);

  const rawSounds=useRef(null);
  if(!rawSounds.current) rawSounds.current=createSounds();
  const sounds={
    tap:()=>{if(!muted)rawSounds.current.tap();},
    correct:()=>{if(!muted)rawSounds.current.correct();},
    wrong:()=>{if(!muted)rawSounds.current.wrong();},
    fanfare:()=>{if(!muted)rawSounds.current.fanfare();},
    badge:()=>{if(!muted)rawSounds.current.badge();},
  };

  const checkAchievements=(newProgress,newHistory,currentEarned)=>{
    const newlyEarned=[];
    ACHIEVEMENTS.forEach(a=>{
      if(!currentEarned.includes(a.id)&&a.check(newProgress,newHistory)){
        newlyEarned.push(a);
      }
    });
    return newlyEarned;
  };

  const done=(score,streak)=>{
    const pct=score/TOTAL;
    const stars=pct===1?3:pct>=0.6?2:pct>=0.3?1:0;
    const oldBest=progress[subject]?.best||0;

    const newProgress={...progress,[subject]:{stars:Math.max(progress[subject].stars,stars),best:Math.max(oldBest,score)}};
    const newHistory={
      total:history.total+1,
      perfectScores:history.perfectScores+(score===TOTAL?1:0),
      bestStreak:Math.max(history.bestStreak,streak||0),
      improvements:history.improvements+(score>oldBest&&oldBest>0?1:0),
    };

    setProgress(newProgress);
    setHistory(newHistory);

    const newBadges=checkAchievements(newProgress,newHistory,earned);
    if(newBadges.length>0){
      const newEarned=[...earned,...newBadges.map(b=>b.id)];
      setEarned(newEarned);
      newBadges.forEach((b,i)=>{ setTimeout(()=>{ sounds.badge(); setToastQueue(q=>[...q,b]); },i*3400); });
    }
  };

  const dismissToast=()=>setToastQueue(q=>q.slice(1));

  return (
    <>
      <style>{CSS}</style>
      <JungleBg/>
      {toastQueue.length>0&&<BadgeToast badge={toastQueue[0]} onDone={dismissToast}/>}
      <div className="app">
        {screen==="home"&&<Home progress={progress} history={history} earned={earned} onSelect={id=>{setSubject(id);setScreen("quiz");}} sounds={sounds} muted={muted} toggleMute={()=>setMuted(m=>!m)} tab={tab} setTab={setTab}/>}
        {screen==="quiz"&&subject&&<Quiz subjectId={subject} onBack={()=>{setScreen("home");setSubject(null);}} onDone={done} sounds={sounds} muted={muted} toggleMute={()=>setMuted(m=>!m)}/>}
      </div>
    </>
  );
}
