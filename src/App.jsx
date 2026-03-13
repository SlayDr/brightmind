import { useState, useEffect, useCallback, useRef } from "react";

const FONTS = "https://fonts.googleapis.com/css2?family=Boogaloo&family=Quicksand:wght@500;600;700&display=swap";

const SUBJECTS = [
  { id:"maths",   label:"Maths",       emoji:"🔢", mascot:"lion",   bg:"#FFF3CD", border:"#F6A800", btn:"#F6A800", dark:"#b87d00", desc:"Numbers & shapes" },
  { id:"english", label:"English",     emoji:"✏️",  mascot:"parrot", bg:"#E8F5FF", border:"#4A9EE0", btn:"#4A9EE0", dark:"#2272b5", desc:"Words & grammar"  },
  { id:"reading", label:"Reading",     emoji:"📖", mascot:"owl",    bg:"#EDFFF4", border:"#34C76F", btn:"#34C76F", dark:"#1e9c53", desc:"Stories & meaning" },
  { id:"verbal",  label:"Verbal",      emoji:"💬", mascot:"monkey", bg:"#FFF0FB", border:"#D45EBC", btn:"#D45EBC", dark:"#a83c93", desc:"Logic & language"  },
  { id:"quant",   label:"Quantitative",emoji:"📐", mascot:"fox",    bg:"#FFF5F0", border:"#FF6B35", btn:"#FF6B35", dark:"#c44a15", desc:"Patterns & logic"  },
  { id:"spanish", label:"Spanish",     emoji:"🇪🇸", mascot:"toucan", bg:"#FFF0E0", border:"#E07B00", btn:"#E07B00", dark:"#b05f00", desc:"¡Hola! Learn Spanish"},
  { id:"cogat",   label:"CogAT",       emoji:"🧠", mascot:"eagle",  bg:"#F0F0FF", border:"#6366F1", btn:"#6366F1", dark:"#4338CA", desc:"Gifted test prep"  },
  { id:"spelling",label:"Spelling",    emoji:"🔤", mascot:"bee",    bg:"#FFFDE7", border:"#F59E0B", btn:"#F59E0B", dark:"#B45309", desc:"Hear it, spell it!" },
  { id:"gaps",    label:"Fill the Gap",emoji:"🧩", mascot:"hedgehog",bg:"#F3F0FF",border:"#8B5CF6", btn:"#8B5CF6", dark:"#6D28D9", desc:"Complete the words!" },
  { id:"times",   label:"Times Tables",emoji:"✖️", mascot:"panda",   bg:"#F0FFF4", border:"#10B981", btn:"#10B981", dark:"#065F46", desc:"2× to 12× with visuals!"},
];

const TOTAL = 20;

/* ─── Achievement Definitions ──────────────────────────────────────────── */
const ACHIEVEMENTS = [
  { id:"first_quiz",   icon:"🎯", label:"First Steps",     desc:"Complete your first quiz!",           check:(s,h)=>h.total>=1 },
  { id:"perfect",      icon:"💯", label:"Perfect Score!",  desc:"Get 20/20 on any quiz!",              check:(s,h)=>h.perfectScores>=1 },
  { id:"hat_trick",    icon:"🎩", label:"Hat Trick",       desc:"Get 3 stars on any subject!",         check:(s,h)=>Object.values(s).some(x=>x.stars===3) },
  { id:"all_subjects", icon:"🌍", label:"Explorer",        desc:"Try all 9 subjects!",                 check:(s,h)=>Object.values(s).filter(x=>x.best>0).length===9 },
  { id:"ten_quizzes",  icon:"🏃", label:"Marathoner",      desc:"Complete 10 quizzes!",                check:(s,h)=>h.total>=10 },
  { id:"maths_star",   icon:"🔢", label:"Maths Wizard",    desc:"Score 15+ in Maths!",                 check:(s,h)=>(s.maths?.best||0)>=15 },
  { id:"english_star", icon:"✏️",  label:"Word Master",     desc:"Score 15+ in English!",               check:(s,h)=>(s.english?.best||0)>=15 },
  { id:"reading_star", icon:"📖", label:"Bookworm",        desc:"Score 15+ in Reading!",               check:(s,h)=>(s.reading?.best||0)>=15 },
  { id:"verbal_star",  icon:"💬", label:"Logic Legend",    desc:"Score 15+ in Verbal!",                check:(s,h)=>(s.verbal?.best||0)>=15 },
  { id:"quant_star",   icon:"📐", label:"Number Ninja",    desc:"Score 15+ in Quantitative!",          check:(s,h)=>(s.quant?.best||0)>=15 },
  { id:"spanish_star", icon:"🇪🇸", label:"Spanish Star",   desc:"Score 15+ in Spanish!",               check:(s,h)=>(s.spanish?.best||0)>=15 },
  { id:"cogat_star",   icon:"🧠", label:"Gifted Mind",     desc:"Score 15+ in CogAT!",                 check:(s,h)=>(s.cogat?.best||0)>=15 },
  { id:"streak3",      icon:"🔥", label:"On Fire!",        desc:"Get 3 correct in a row!",             check:(s,h)=>h.bestStreak>=3 },
  { id:"streak5",      icon:"⚡", label:"Lightning!",      desc:"Get 5 correct in a row!",             check:(s,h)=>h.bestStreak>=5 },
  { id:"all_stars",    icon:"🌟", label:"All-Star",        desc:"3 stars on ALL subjects!",            check:(s,h)=>Object.values(s).length===9&&Object.values(s).every(x=>x.stars===3) },
  { id:"twenty_five",  icon:"🏆", label:"Champion",        desc:"Complete 25 quizzes!",                check:(s,h)=>h.total>=25 },
  { id:"hola",         icon:"🌮", label:"¡Hola!",          desc:"Complete your first Spanish quiz!",   check:(s,h)=>(s.spanish?.best||0)>0 },
  { id:"cogat_first",  icon:"🎓", label:"Brain Trainer",   desc:"Complete your first CogAT quiz!",     check:(s,h)=>(s.cogat?.best||0)>0 },
  { id:"spelling_star",icon:"🔤", label:"Spelling Bee",    desc:"Score 15+ in Spelling!",              check:(s,h)=>(s.spelling?.best||0)>=15 },
  { id:"gaps_star",    icon:"🧩", label:"Gap Filler",      desc:"Score 15+ in Fill the Gap!",          check:(s,h)=>(s.gaps?.best||0)>=15 },
  { id:"spell_perfect",icon:"🐝", label:"Queen Bee",       desc:"Perfect score in Spelling!",          check:(s,h)=>h.spellPerfect>=1 },
  { id:"times_first",  icon:"✖️", label:"Table Starter",   desc:"Complete your first Times Tables quiz!",check:(s,h)=>(s.times?.best||0)>0 },
  { id:"times_star",   icon:"🌠", label:"Times Champ",     desc:"Score 15+ in Times Tables!",           check:(s,h)=>(s.times?.best||0)>=15 },
  { id:"times_perfect",icon:"🐼", label:"Panda Perfect",   desc:"Perfect score in Times Tables!",        check:(s,h)=>h.timesPerfect>=1 },
];

/* ─── Sound Engine ─────────────────────────────────────────────────────── */
function createSounds() {
  let ctx=null;
  const getCtx=()=>{if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();return ctx;};
  const play=(fn)=>{try{fn(getCtx());}catch(e){}};
  return {
    tap(){play(ctx=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.setValueAtTime(600,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(400,ctx.currentTime+0.06);g.gain.setValueAtTime(0.18,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.08);o.start();o.stop(ctx.currentTime+0.08);});},
    correct(){play(ctx=>{[523,659,784,1047].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";const t=ctx.currentTime+i*0.1;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.25,t+0.02);g.gain.exponentialRampToValueAtTime(0.001,t+0.35);o.start(t);o.stop(t+0.35);});});},
    wrong(){play(ctx=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sawtooth";o.frequency.setValueAtTime(220,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(110,ctx.currentTime+0.3);g.gain.setValueAtTime(0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.35);o.start();o.stop(ctx.currentTime+0.35);});},
    fanfare(){play(ctx=>{[{f:523,t:0,d:0.15},{f:659,t:0.15,d:0.15},{f:784,t:0.3,d:0.15},{f:1047,t:0.45,d:0.3},{f:784,t:0.55,d:0.1},{f:1047,t:0.65,d:0.5}].forEach(({f,t,d})=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="triangle";o.frequency.setValueAtTime(f,ctx.currentTime+t);g.gain.setValueAtTime(0,ctx.currentTime+t);g.gain.linearRampToValueAtTime(0.3,ctx.currentTime+t+0.02);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+t+d);o.start(ctx.currentTime+t);o.stop(ctx.currentTime+t+d+0.05);});});},
    badge(){play(ctx=>{[784,1047,1319,1568].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";const t=ctx.currentTime+i*0.09;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0.2,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.25);o.start(t);o.stop(t+0.3);});});},
  };
}

/* ─── TTS ──────────────────────────────────────────────────────────────── */
function speak(text,onEnd){if(!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=0.88;u.pitch=1.1;u.volume=1;const voices=window.speechSynthesis.getVoices();const preferred=voices.find(v=>v.lang.startsWith("en")&&(v.name.includes("Samantha")||v.name.includes("Karen")||v.name.includes("Daniel")));if(preferred)u.voice=preferred;if(onEnd)u.onend=onEnd;window.speechSynthesis.speak(u);}
function stopSpeaking(){if(window.speechSynthesis)window.speechSynthesis.cancel();}

/* ─── Mascots ───────────────────────────────────────────────────────────── */
const Mascot=({type,size=80,animate=false})=>{
  const cls=animate?"mascot-bounce":"";
  if(type==="lion")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}>{[0,45,90,135,180,225,270,315].map((a,i)=><ellipse key={i}cx={40}cy={40}rx={6}ry={14}fill="#F6A800"transform={`rotate(${a} 40 40)`}opacity="0.85"/>)}<circle cx="40"cy="40"r="20"fill="#FBBF24"/><ellipse cx="34"cy="37"rx="4"ry="5"fill="#1a1a1a"/><ellipse cx="46"cy="37"rx="4"ry="5"fill="#1a1a1a"/><circle cx="34"cy="36"r="1.5"fill="white"/><circle cx="46"cy="36"r="1.5"fill="white"/><ellipse cx="40"cy="44"rx="6"ry="4"fill="#F97316"/><path d="M36 44 Q40 49 44 44"stroke="#1a1a1a"strokeWidth="1.5"fill="none"strokeLinecap="round"/><circle cx="33"cy="42"r="1"fill="#F9A8D4"/><circle cx="47"cy="42"r="1"fill="#F9A8D4"/><ellipse cx="25"cy="35"rx="5"ry="6"fill="#FBBF24"/><ellipse cx="55"cy="35"rx="5"ry="6"fill="#FBBF24"/></svg>;
  if(type==="parrot")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}><ellipse cx="40"cy="50"rx="18"ry="22"fill="#34D399"/><circle cx="40"cy="26"r="16"fill="#34D399"/><ellipse cx="32"cy="24"rx="5"ry="6"fill="#1a1a1a"/><ellipse cx="48"cy="24"rx="5"ry="6"fill="#1a1a1a"/><circle cx="32"cy="23"r="2"fill="white"/><circle cx="48"cy="23"r="2"fill="white"/><path d="M35 32 Q40 38 45 32"fill="#F59E0B"/><path d="M20 45 Q10 35 15 25"stroke="#60A5FA"strokeWidth="8"fill="none"strokeLinecap="round"/><path d="M60 45 Q70 35 65 25"stroke="#F87171"strokeWidth="8"fill="none"strokeLinecap="round"/><ellipse cx="40"cy="16"rx="8"ry="5"fill="#10B981"/><path d="M36 12 L40 4 L44 12"fill="#10B981"/></svg>;
  if(type==="owl")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}><ellipse cx="40"cy="48"rx="22"ry="26"fill="#8B5CF6"/><circle cx="40"cy="28"r="18"fill="#7C3AED"/><circle cx="31"cy="26"r="9"fill="white"/><circle cx="49"cy="26"r="9"fill="white"/><circle cx="31"cy="26"r="6"fill="#1a1a1a"/><circle cx="49"cy="26"r="6"fill="#1a1a1a"/><circle cx="32"cy="25"r="2"fill="white"/><circle cx="50"cy="25"r="2"fill="white"/><path d="M36 35 L40 40 L44 35"fill="#F59E0B"/><path d="M22 18 L28 10 L34 18"fill="#6D28D9"/><path d="M46 18 L52 10 L58 18"fill="#6D28D9"/></svg>;
  if(type==="monkey")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}><ellipse cx="20"cy="32"rx="10"ry="10"fill="#92400E"/><ellipse cx="60"cy="32"rx="10"ry="10"fill="#92400E"/><circle cx="40"cy="38"r="22"fill="#B45309"/><ellipse cx="40"cy="46"rx="14"ry="10"fill="#D97706"/><ellipse cx="31"cy="34"rx="5"ry="6"fill="#1a1a1a"/><ellipse cx="49"cy="34"rx="5"ry="6"fill="#1a1a1a"/><circle cx="31"cy="33"r="2"fill="white"/><circle cx="49"cy="33"r="2"fill="white"/><path d="M33 50 Q40 56 47 50"stroke="#92400E"strokeWidth="2"fill="none"strokeLinecap="round"/><circle cx="22"cy="30"r="5"fill="#D97706"/><circle cx="58"cy="30"r="5"fill="#D97706"/></svg>;
  if(type==="fox")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}><path d="M15 20 L28 38 L15 45"fill="#FF6B35"/><path d="M65 20 L52 38 L65 45"fill="#FF6B35"/><ellipse cx="40"cy="46"rx="22"ry="20"fill="#FF6B35"/><circle cx="40"cy="34"r="18"fill="#FF6B35"/><ellipse cx="40"cy="42"rx="12"ry="9"fill="#FED7AA"/><ellipse cx="32"cy="31"rx="4"ry="5"fill="#1a1a1a"/><ellipse cx="48"cy="31"rx="4"ry="5"fill="#1a1a1a"/><circle cx="32"cy="30"r="1.5"fill="white"/><circle cx="48"cy="30"r="1.5"fill="white"/><ellipse cx="40"cy="38"rx="4"ry="3"fill="#1a1a1a"/><path d="M36 40 Q40 44 44 40"stroke="#1a1a1a"strokeWidth="1.5"fill="none"strokeLinecap="round"/><path d="M22 15 L30 28 L18 30 Z"fill="#FF6B35"/><path d="M58 15 L50 28 L62 30 Z"fill="#FF6B35"/></svg>;
  if(type==="toucan")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}><ellipse cx="40"cy="48"rx="18"ry="22"fill="#1a1a1a"/><circle cx="40"cy="28"r="16"fill="#1a1a1a"/><ellipse cx="40"cy="30"rx="10"ry="8"fill="white"/><ellipse cx="34"cy="24"rx="4"ry="5"fill="#1a1a1a"/><circle cx="34"cy="23"r="2"fill="white"/><circle cx="34"cy="23"r="1"fill="#1a1a1a"/><path d="M44 26 Q62 22 62 30 Q62 38 44 34 Z"fill="#F59E0B"/><path d="M44 28 Q58 25 58 30 Q58 35 44 32"fill="#EF4444"/><path d="M44 30 Q56 28 56 30"stroke="#10B981"strokeWidth="2"fill="none"/><path d="M22 52 Q14 58 18 65"stroke="#1a1a1a"strokeWidth="7"fill="none"strokeLinecap="round"/><path d="M58 52 Q66 58 62 65"stroke="#1a1a1a"strokeWidth="7"fill="none"strokeLinecap="round"/></svg>;
  if(type==="eagle")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}><path d="M10 35 Q5 20 20 25 L35 38"fill="#8B4513"/><path d="M70 35 Q75 20 60 25 L45 38"fill="#8B4513"/><ellipse cx="40"cy="46"rx="18"ry="20"fill="#6B3A10"/><circle cx="40"cy="30"r="18"fill="#8B4513"/><ellipse cx="40"cy="28"rx="12"ry="8"fill="white"/><ellipse cx="33"cy="26"rx="5"ry="6"fill="#1a1a1a"/><ellipse cx="47"cy="26"rx="5"ry="6"fill="#1a1a1a"/><circle cx="33"cy="25"r="2"fill="#FFD700"/><circle cx="47"cy="25"r="2"fill="#FFD700"/><circle cx="33"cy="25"r="1"fill="#1a1a1a"/><circle cx="47"cy="25"r="1"fill="#1a1a1a"/><path d="M35 34 L40 40 L45 34"fill="#F59E0B"/><path d="M36 36 Q40 42 44 36"stroke="#E07B00"strokeWidth="1"fill="none"/></svg>;
  if(type==="bee")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}><ellipse cx="40"cy="44"rx="16"ry="20"fill="#F59E0B"/><ellipse cx="40"cy="34"rx="10"ry="8"fill="#1a1a1a"/><rect x="28"y="40"width="24"height="5"rx="2"fill="#1a1a1a"/><rect x="28"y="49"width="24"height="5"rx="2"fill="#1a1a1a"/><rect x="28"y="58"width="24"height="4"rx="2"fill="#1a1a1a"/><ellipse cx="35"cy="31"rx="4"ry="5"fill="#1a1a1a"/><ellipse cx="45"cy="31"rx="4"ry="5"fill="#1a1a1a"/><circle cx="35"cy="30"r="2"fill="white"/><circle cx="45"cy="30"r="2"fill="white"/><path d="M26 38 Q14 28 18 18"stroke="#D1FAE5"strokeWidth="8"fill="none"strokeLinecap="round"opacity="0.8"/><path d="M54 38 Q66 28 62 18"stroke="#D1FAE5"strokeWidth="8"fill="none"strokeLinecap="round"opacity="0.8"/><ellipse cx="40"cy="26"rx="6"ry="4"fill="#1a1a1a"/><path d="M38 22 L40 16 L42 22"fill="#1a1a1a"/></svg>;
  if(type==="hedgehog")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}><ellipse cx="40"cy="52"rx="24"ry="18"fill="#92400E"/>{[{x:26,y:28},{x:32,y:22},{x:40,y:20},{x:48,y:22},{x:54,y:28},{x:22,y:36},{x:58,y:36},{x:28,y:42},{x:52,y:42}].map((p,i)=><ellipse key={i}cx={p.x}cy={p.y}rx="3"ry="7"fill="#1a1a1a"transform={`rotate(${(p.x-40)*2} ${p.x} ${p.y})`}/>)}<ellipse cx="40"cy="48"rx="18"ry="14"fill="#D97706"/><ellipse cx="32"cy="44"rx="4"ry="5"fill="#1a1a1a"/><ellipse cx="48"cy="44"rx="4"ry="5"fill="#1a1a1a"/><circle cx="32"cy="43"r="1.5"fill="white"/><circle cx="48"cy="43"r="1.5"fill="white"/><ellipse cx="40"cy="50"rx="5"ry="3.5"fill="#92400E"/><path d="M36 52 Q40 56 44 52"stroke="#92400E"strokeWidth="1.5"fill="none"strokeLinecap="round"/></svg>;
  if(type==="panda")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}><circle cx="40"cy="40"r="24"fill="white"/><ellipse cx="28"cy="22"rx="10"ry="10"fill="#1a1a1a"/><ellipse cx="52"cy="22"rx="10"ry="10"fill="#1a1a1a"/><ellipse cx="32"cy="36"rx="7"ry="8"fill="#1a1a1a"/><ellipse cx="48"cy="36"rx="7"ry="8"fill="#1a1a1a"/><circle cx="32"cy="35"r="3"fill="white"/><circle cx="48"cy="35"r="3"fill="white"/><circle cx="32"cy="35"r="1.5"fill="#1a1a1a"/><circle cx="48"cy="35"r="1.5"fill="#1a1a1a"/><ellipse cx="40"cy="46"rx="7"ry="5"fill="#f9a8d4"/><path d="M35 48 Q40 53 45 48"stroke="#1a1a1a"strokeWidth="1.5"fill="none"strokeLinecap="round"/><ellipse cx="20"cy="48"rx="9"ry="8"fill="#1a1a1a"/><ellipse cx="60"cy="48"rx="9"ry="8"fill="#1a1a1a"/></svg>;
  return<span style={{fontSize:size*0.6}}>🐾</span>;
};

const JungleBg=()=>(
  <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    {[{x:0,y:4,r:-5,s:1.1,c:"#4ade80"},{x:86,y:6,r:12,s:0.9,c:"#86efac"},{x:2,y:78,r:-10,s:1.0,c:"#22c55e"},{x:90,y:72,r:18,s:0.85,c:"#4ade80"},{x:42,y:0,r:4,s:0.75,c:"#86efac"},{x:96,y:42,r:8,s:0.9,c:"#4ade80"}].map((l,i)=>(
      <svg key={i}width="56"height="56"viewBox="0 0 60 60"style={{position:"absolute",left:`${l.x}%`,top:`${l.y}%`,transform:`rotate(${l.r}deg) scale(${l.s})`,opacity:0.3,animation:`sway ${3+i*0.4}s ease-in-out infinite alternate`}}>
        <ellipse cx="30"cy="30"rx="12"ry="28"fill={l.c}/><path d="M30 5 Q30 30 30 55"stroke="#15803d"strokeWidth="2"fill="none"/>
      </svg>
    ))}
  </div>
);

const Confetti=({active})=>{
  if(!active)return null;
  const pieces=Array.from({length:24},(_,i)=>({x:Math.random()*100,delay:Math.random()*0.4,color:["#F6A800","#4A9EE0","#34C76F","#D45EBC","#FF6B6B","#FFD700"][i%6],size:8+Math.random()*8,rot:Math.random()*360}));
  return<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999}}>{pieces.map((p,i)=><div key={i}style={{position:"absolute",left:`${p.x}%`,top:"-20px",width:p.size,height:p.size,background:p.color,borderRadius:Math.random()>0.5?"50%":"3px",animation:`confettiFall 1.2s ${p.delay}s ease-in forwards`,transform:`rotate(${p.rot}deg)`}}/>)}</div>;
};

const Stars=({count,max=3,size=26})=>(
  <span style={{display:"inline-flex",gap:2}}>
    {Array.from({length:max}).map((_,i)=>(
      <span key={i}style={{fontSize:size,filter:i<count?"drop-shadow(0 0 4px gold)":"none",opacity:i<count?1:0.2,animation:i<count?`starPop 0.4s ${i*0.12}s ease both`:"none"}}>⭐</span>
    ))}
  </span>
);

function BadgeToast({badge,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t);},[]);
  return(
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

/* ─── QUESTION BANKS ───────────────────────────────────────────────────── */
const BANK = {

  maths:[
    {q:"What is 2 + 3?",options:["4","5","6","7"],answer:"5",hint:"Count on your fingers!"},
    {q:"What is 4 + 4?",options:["6","7","8","9"],answer:"8",hint:"Double 4 is 8!"},
    {q:"What is 6 + 3?",options:["8","9","10","7"],answer:"9",hint:"Start at 6 and count up 3."},
    {q:"What is 7 + 5?",options:["10","11","12","13"],answer:"12",hint:"7+3=10, then +2 more!"},
    {q:"What is 9 + 9?",options:["16","17","18","19"],answer:"18",hint:"Double 9 is 18!"},
    {q:"What is 8 + 6?",options:["12","13","14","15"],answer:"14",hint:"8+2=10, then +4 more!"},
    {q:"What is 10 − 4?",options:["5","6","7","8"],answer:"6",hint:"Count back 4 from 10."},
    {q:"What is 15 − 6?",options:["7","8","9","10"],answer:"9",hint:"Count back 6 from 15."},
    {q:"What is 12 − 5?",options:["5","6","7","8"],answer:"7",hint:"Count back 5 from 12."},
    {q:"What is 2 × 3?",options:["4","5","6","7"],answer:"6",hint:"2 groups of 3: 3+3=?"},
    {q:"What is 5 × 3?",options:["12","13","14","15"],answer:"15",hint:"Count by 5s: 5,10,15!"},
    {q:"What is 4 × 5?",options:["15","20","25","30"],answer:"20",hint:"Count by 5s four times!"},
    {q:"What is half of 8?",options:["2","3","4","5"],answer:"4",hint:"Split 8 into 2 equal groups!"},
    {q:"What is half of 20?",options:["5","8","10","12"],answer:"10",hint:"Split 20 into 2 equal groups!"},
    {q:"How many sides does a square have?",options:["3","4","5","6"],answer:"4",hint:"Count the sides!"},
    {q:"Which shape has no corners?",options:["Square","Triangle","Circle","Rectangle"],answer:"Circle",hint:"A circle is perfectly round!"},
    {q:"Count by 2s: 2,4,6,8,__",options:["9","10","11","12"],answer:"10",hint:"Add 2 each time!"},
    {q:"Count by 5s: 5,10,15,__",options:["18","19","20","21"],answer:"20",hint:"Add 5 each time!"},
    {q:"How many minutes in an hour?",options:["30","45","60","100"],answer:"60",hint:"60 minutes = 1 hour!"},
    {q:"There are 5 birds.\n3 more arrive. How many?",options:["6","7","8","9"],answer:"8",hint:"5 + 3 = ?"},
    {q:"A bag has 10 sweets.\nYou eat 4. How many left?",options:["4","5","6","7"],answer:"6",hint:"10 − 4 = ?"},
    {q:"What is 10 more than 25?",options:["30","35","40","45"],answer:"35",hint:"Add 10 to 25!"},
    {q:"What is double 7?",options:["12","13","14","15"],answer:"14",hint:"7 + 7 = ?"},
    {q:"How many days in a week?",options:["5","6","7","8"],answer:"7",hint:"Mon, Tue, Wed, Thu, Fri, Sat, Sun!"},
    {q:"How many months in a year?",options:["10","11","12","13"],answer:"12",hint:"January through December!"},
  ],

  english:[
    {q:"Which word is a noun?",options:["jump","blue","table","quickly"],answer:"table",hint:"A noun is a thing you can touch!"},
    {q:"Which word is a verb?",options:["house","blue","swim","tree"],answer:"swim",hint:"A verb is something you DO!"},
    {q:"Which word is an adjective?",options:["jump","fluffy","cat","run"],answer:"fluffy",hint:"An adjective describes a noun!"},
    {q:"Pick the correct spelling:",options:["becaus","because","becorse","becuase"],answer:"because",hint:"b-e-c-a-u-s-e!"},
    {q:"Pick the correct spelling:",options:["peopel","peeple","people","peaple"],answer:"people",hint:"p-e-o-p-l-e!"},
    {q:"Which sentence is correct?",options:["the cat sat.","The cat sat.","The Cat sat","the cat Sat."],answer:"The cat sat.",hint:"Start with capital, end with full stop!"},
    {q:"What punctuation ends a question?",options:[".","!","?",","],answer:"?",hint:"Questions end with a question mark!"},
    {q:"What does 'enormous' mean?",options:["Very small","Very fast","Very big","Very loud"],answer:"Very big",hint:"Enormous means really, really big!"},
    {q:"Which word means the same as 'happy'?",options:["sad","angry","joyful","tired"],answer:"joyful",hint:"Joyful = full of joy = happy!"},
    {q:"Which word is the opposite of 'fast'?",options:["quick","slow","speed","run"],answer:"slow",hint:"Fast and slow are opposites!"},
    {q:"Which word is a pronoun?",options:["dog","run","she","blue"],answer:"she",hint:"She, he, it, they replace names!"},
    {q:"Pick the conjunction:",options:["run","blue","and","fast"],answer:"and",hint:"And joins two things together!"},
    {q:"Which word rhymes with 'cat'?",options:["dog","car","mat","cup"],answer:"mat",hint:"Cat... mat... both end in -at!"},
    {q:"How many syllables in 'elephant'?",options:["1","2","3","4"],answer:"3",hint:"El-e-phant = 3 claps!"},
    {q:"Pick the verb:\n'The dog runs fast.'",options:["dog","runs","fast","The"],answer:"runs",hint:"What is the dog doing?"},
    {q:"Which uses apostrophe correctly?",options:["the dogs bone","the dog's bone","the dogs' bone","the dogs bone'"],answer:"the dog's bone",hint:"The bone belongs to the dog!"},
    {q:"What does 'furious' mean?",options:["Very happy","Very angry","Very tired","Very scared"],answer:"Very angry",hint:"Furious means really angry!"},
    {q:"Which is a complete sentence?",options:["The big brown","Running fast","The cat sat.","Jumped high"],answer:"The cat sat.",hint:"A sentence needs a subject and verb!"},
    {q:"Which word means the same as 'scared'?",options:["brave","frightened","excited","happy"],answer:"frightened",hint:"Frightened = scared!"},
    {q:"Which word is an adverb?",options:["dog","happy","quickly","run"],answer:"quickly",hint:"Adverbs describe HOW — often end in -ly!"},
  ],

  reading:[
    {passage:"Lily loves the rain. She puts on her yellow boots and splashes in puddles. Her dog Max jumps in too! They both get very wet but they are very happy.",q:"What colour are Lily's boots?",options:["Red","Blue","Yellow","Green"],answer:"Yellow",hint:"Read the second sentence!"},
    {passage:"Tom found a tiny seed in the garden. He planted it in the soil and watered it every day. After two weeks, a small green shoot appeared. Tom was so excited!",q:"How did Tom feel when the shoot appeared?",options:["Sad","Excited","Tired","Angry"],answer:"Excited",hint:"Look at the last sentence!"},
    {passage:"The library is a quiet place. People go there to read books and learn new things. You must whisper so you don't disturb others. Sam loves visiting every Saturday.",q:"Why must you whisper in the library?",options:["It is dark","The librarian says so","To not disturb others","Books are fragile"],answer:"To not disturb others",hint:"The passage explains the reason!"},
    {passage:"Mia has three pets: a fluffy rabbit called Snowball, a goldfish called Bubbles, and a parrot named Polly. Polly can say 'hello' and 'goodnight'. Mia feeds them every morning.",q:"Which pet can talk?",options:["Snowball","Bubbles","Polly","All of them"],answer:"Polly",hint:"Which animal is known for talking?"},
    {passage:"Jack loved space. He had posters of planets on his walls and could name all eight of them. His favourite was Saturn because of its beautiful rings. He wanted to be an astronaut one day.",q:"What was Jack's favourite planet?",options:["Jupiter","Mars","Saturn","Earth"],answer:"Saturn",hint:"Find the sentence with 'favourite'!"},
    {passage:"Jack loved space. He had posters of planets on his walls and could name all eight of them. His favourite was Saturn because of its beautiful rings. He wanted to be an astronaut one day.",q:"What did Jack want to be?",options:["A scientist","A pilot","An astronaut","A teacher"],answer:"An astronaut",hint:"Look at the last sentence!"},
    {passage:"Every morning, Rosa helped her grandmother make breakfast. They made toast with butter and a big pot of tea. Rosa liked this time because her grandmother told her funny stories.",q:"Why did Rosa like breakfast time?",options:["The food was yummy","She got to watch TV","Her grandmother told funny stories","She could sleep in"],answer:"Her grandmother told funny stories",hint:"Look at the last sentence!"},
    {passage:"The old lighthouse stood on a rocky cliff. Every night its light flashed to warn ships of the dangerous rocks below. Without it, many ships might have crashed.",q:"Why did the lighthouse flash its light?",options:["To look pretty","To wake people up","To warn ships of rocks","To attract fish"],answer:"To warn ships of rocks",hint:"Read the second sentence!"},
    {passage:"Penguins cannot fly but they are excellent swimmers. They use their wings as flippers to zoom through the water. A penguin can swim as fast as 25 kilometres per hour!",q:"What do penguins use as flippers?",options:["Their feet","Their tails","Their wings","Their beaks"],answer:"Their wings",hint:"Read the second sentence!"},
    {passage:"The giant tortoise is one of the longest-living animals on Earth. Some tortoises have lived for over 150 years! They move very slowly and eat plants.",q:"What do giant tortoises eat?",options:["Fish","Insects","Plants","Meat"],answer:"Plants",hint:"Find the sentence about what they eat!"},
    {passage:"Maya wanted to make a card for her mum's birthday. She got out glitter, stickers, coloured paper and felt-tip pens. She spent an hour cutting and sticking.",q:"Why did Maya make the card?",options:["For Christmas","For her teacher","For her mum's birthday","For a school project"],answer:"For her mum's birthday",hint:"Read the first sentence!"},
    {passage:"The sun was setting and the sky turned orange and pink. Birds flew home to their nests. The flowers closed their petals. It was the end of a perfect day.",q:"What happened to the flowers?",options:["They grew taller","They closed their petals","They changed colour","They fell off"],answer:"They closed their petals",hint:"Find the sentence about flowers!"},
  ],

  verbal:[
    {q:"Which word doesn't belong?\n🍎 Apple  🍌 Banana  🥕 Carrot  🍇 Grape",options:["Apple","Banana","Carrot","Grape"],answer:"Carrot",hint:"Three are fruits. One is a vegetable!"},
    {q:"Which word doesn't belong?\n🐶 Dog  🐱 Cat  🐟 Fish  🌹 Rose",options:["Dog","Cat","Fish","Rose"],answer:"Rose",hint:"Three are animals. One is a plant!"},
    {q:"Which word doesn't belong?\n⚽ Football  🎾 Tennis  🏊 Swimming  🏀 Basketball",options:["Football","Tennis","Swimming","Basketball"],answer:"Swimming",hint:"Three use a ball. One doesn't!"},
    {q:"Which word doesn't belong?\n🚗 Car  🚌 Bus  🚂 Train  ✈️ Plane",options:["Car","Bus","Train","Plane"],answer:"Plane",hint:"Three travel on the ground. One travels in the air!"},
    {q:"Cat is to kitten as\ndog is to...?",options:["kennel","puppy","bark","leash"],answer:"puppy",hint:"A baby cat is a kitten. A baby dog is...?"},
    {q:"Sun is to day as\nmoon is to...?",options:["sky","star","night","cloud"],answer:"night",hint:"The sun is out in the day. The moon is out at..."},
    {q:"Bird is to nest as\nbee is to...?",options:["flower","honey","hive","wing"],answer:"hive",hint:"A bird lives in a nest. A bee lives in a..."},
    {q:"Book is to read as\npencil is to...?",options:["draw","eat","sleep","jump"],answer:"draw",hint:"You use a pencil to..."},
    {q:"Hot is to cold as\nfast is to...?",options:["quick","speed","slow","run"],answer:"slow",hint:"Opposites! Hot↔cold, fast↔?"},
    {q:"Doctor is to hospital as\nteacher is to...?",options:["office","library","school","home"],answer:"school",hint:"Where does a teacher work?"},
    {q:"What comes next?\nMonday, Tuesday, Wednesday, __",options:["Friday","Saturday","Thursday","Sunday"],answer:"Thursday",hint:"Days of the week in order!"},
    {q:"What comes next?\nSpring, Summer, Autumn, __",options:["January","Winter","Monday","Morning"],answer:"Winter",hint:"The four seasons in order!"},
    {q:"What comes next?\n10, 20, 30, 40, __",options:["45","48","50","55"],answer:"50",hint:"Count up by 10!"},
    {q:"Which word means the same as 'brave'?",options:["scared","funny","courageous","clumsy"],answer:"courageous",hint:"Brave = courageous!"},
    {q:"Which word means the same as 'big'?",options:["tiny","huge","fast","cold"],answer:"huge",hint:"Huge means really big!"},
    {q:"Sam is taller than Ella.\nElla is taller than Ben.\nWho is shortest?",options:["Sam","Ella","Ben","They're the same"],answer:"Ben",hint:"Sam > Ella > Ben. Who's last?"},
    {q:"Which word doesn't belong?\n🌞 Summer ❄️ Winter 🍂 Autumn 🌙 Night",options:["Summer","Winter","Autumn","Night"],answer:"Night",hint:"Three are seasons. One is a time of day!"},
    {q:"Eye is to see as\near is to...?",options:["smell","taste","hear","touch"],answer:"hear",hint:"Eyes see. Ears...?"},
    {q:"Which word goes with\n'shoes, boots, sandals'?",options:["hat","gloves","trainers","scarf"],answer:"trainers",hint:"All worn on your FEET!"},
    {q:"Cow is to milk as\nhen is to...?",options:["wool","meat","eggs","feathers"],answer:"eggs",hint:"A cow gives milk. A hen gives...?"},
  ],

  /* ── QUANTITATIVE REASONING ─────────────────────────────────────────── */
  quant:[
    // Number patterns
    {q:"What comes next?\n2, 4, 6, 8, __",options:["9","10","11","12"],answer:"10",hint:"Add 2 each time! ➕"},
    {q:"What comes next?\n1, 3, 5, 7, __",options:["8","9","10","11"],answer:"9",hint:"Add 2 each time — odd numbers!"},
    {q:"What comes next?\n5, 10, 15, 20, __",options:["22","24","25","30"],answer:"25",hint:"Count by 5s!"},
    {q:"What comes next?\n3, 6, 9, 12, __",options:["13","14","15","16"],answer:"15",hint:"Count by 3s!"},
    {q:"What comes next?\n1, 2, 4, 8, __",options:["10","12","16","18"],answer:"16",hint:"Each number is doubled!"},
    {q:"What comes next?\n100, 90, 80, 70, __",options:["50","55","60","65"],answer:"60",hint:"Count backwards by 10!"},
    {q:"What comes next?\n1, 4, 9, 16, __",options:["20","22","25","28"],answer:"25",hint:"1×1=1, 2×2=4, 3×3=9, 4×4=16, 5×5=?"},
    {q:"What comes next?\n2, 6, 18, 54, __",options:["108","126","162","180"],answer:"162",hint:"Multiply by 3 each time!"},
    // Number puzzles / missing numbers
    {q:"🔲 + 3 = 7\nWhat is 🔲?",options:["2","3","4","5"],answer:"4",hint:"What number plus 3 equals 7?"},
    {q:"🔲 − 4 = 6\nWhat is 🔲?",options:["8","9","10","11"],answer:"10",hint:"What number minus 4 equals 6?"},
    {q:"🔲 × 2 = 10\nWhat is 🔲?",options:["3","4","5","6"],answer:"5",hint:"What number times 2 equals 10?"},
    {q:"12 ÷ 🔲 = 4\nWhat is 🔲?",options:["2","3","4","5"],answer:"3",hint:"12 divided by what equals 4?"},
    {q:"3 + 🔲 = 3 × 4\nWhat is 🔲?",options:["6","7","8","9"],answer:"9",hint:"First find 3×4, then subtract 3!"},
    {q:"🔲 + 🔲 = 14\nWhat is 🔲?",options:["5","6","7","8"],answer:"7",hint:"A number plus itself equals 14. Half of 14?"},
    // Comparison & logic
    {q:"Which is greatest?\n3+5,  4+3,  6+1,  2+6",options:["3+5","4+3","6+1","2+6"],answer:"3+5",hint:"Work out each sum: 8, 7, 7, 8. Which appears first?"},
    {q:"Which is smallest?\n10−3,  5+1,  4×2,  15−8",options:["10−3","5+1","4×2","15−8"],answer:"5+1",hint:"Work out each: 7, 6, 8, 7. Which is smallest?"},
    {q:"If 🍎=3 and 🍌=2,\nwhat is 🍎+🍎+🍌?",options:["6","7","8","9"],answer:"8",hint:"3+3+2=?"},
    {q:"If ⭐=5 and 🌙=2,\nwhat is ⭐×🌙?",options:["7","8","10","12"],answer:"10",hint:"5×2=?"},
    // Visual/spatial quantities
    {q:"A rectangle has 2 long sides\nand 2 short sides.\nHow many sides total?",options:["2","3","4","6"],answer:"4",hint:"Count all sides: 2+2=?"},
    {q:"How many corners does\na triangle have?",options:["2","3","4","5"],answer:"3",hint:"Tri means three!"},
    {q:"There are 4 boxes.\nEach has 3 balls.\nHow many balls total?",options:["7","10","12","14"],answer:"12",hint:"4 groups of 3: 3+3+3+3=?"},
    {q:"A number is between 10 and 20.\nIt is even.\nIt has a 4 in it.\nWhat is it?",options:["12","14","16","18"],answer:"14",hint:"Even numbers between 10-20 with a 4: 14!"},
    {q:"What fraction of this shape\nis shaded?\n⬛⬜⬜⬜",options:["1/2","1/3","1/4","1/5"],answer:"1/4",hint:"1 square out of 4 total = 1/4!"},
    {q:"Which number is both\ngreater than 5\nand less than 9?",options:["4","5","7","9"],answer:"7",hint:"Greater than 5 AND less than 9!"},
    {q:"A snail moves 3cm\nevery minute.\nHow far in 4 minutes?",options:["7cm","10cm","12cm","15cm"],answer:"12cm",hint:"3×4=?"},
  ],

  /* ── SPANISH ─────────────────────────────────────────────────────────── */
  spanish:[
    // Greetings
    {q:"How do you say 'Hello' in Spanish? 👋",options:["Adiós","Hola","Gracias","Por favor"],answer:"Hola",hint:"Hola sounds like 'Oh-la'!"},
    {q:"How do you say 'Goodbye' in Spanish?",options:["Hola","Buenas","Adiós","Gracias"],answer:"Adiós",hint:"Adiós sounds like 'Ad-ee-os'!"},
    {q:"How do you say 'Thank you' in Spanish?",options:["De nada","Por favor","Hola","Gracias"],answer:"Gracias",hint:"Gracias sounds like 'Gra-see-as'!"},
    {q:"How do you say 'Please' in Spanish?",options:["Gracias","Por favor","Adiós","Hola"],answer:"Por favor",hint:"Por favor means 'for favour'!"},
    {q:"How do you say 'Yes' in Spanish?",options:["No","Sí","Hola","Bien"],answer:"Sí",hint:"Sí sounds just like 'see'!"},
    {q:"How do you say 'No' in Spanish?",options:["Sí","Bien","No","Mal"],answer:"No",hint:"No is the same in English and Spanish!"},
    // Numbers
    {q:"How do you say '1' in Spanish?",options:["Dos","Tres","Uno","Cuatro"],answer:"Uno",hint:"Uno — like the card game!"},
    {q:"How do you say '2' in Spanish?",options:["Uno","Dos","Tres","Cuatro"],answer:"Dos",hint:"Dos sounds like 'dose'!"},
    {q:"How do you say '3' in Spanish?",options:["Uno","Dos","Tres","Cuatro"],answer:"Tres",hint:"Tres sounds like 'trace' without the -ace!"},
    {q:"How do you say '5' in Spanish?",options:["Cuatro","Cinco","Seis","Siete"],answer:"Cinco",hint:"Cinco sounds like 'Seen-co'!"},
    {q:"How do you say '10' in Spanish?",options:["Ocho","Nueve","Diez","Once"],answer:"Diez",hint:"Diez sounds like 'dee-eth'!"},
    // Colours
    {q:"How do you say 'Red' in Spanish? 🔴",options:["Azul","Verde","Rojo","Amarillo"],answer:"Rojo",hint:"Rojo sounds like 'Ro-ho'!"},
    {q:"How do you say 'Blue' in Spanish? 🔵",options:["Rojo","Azul","Verde","Negro"],answer:"Azul",hint:"Azul sounds like 'Ah-zool'!"},
    {q:"How do you say 'Green' in Spanish? 🟢",options:["Rojo","Azul","Verde","Blanco"],answer:"Verde",hint:"Verde sounds like 'Vair-day'!"},
    {q:"How do you say 'Yellow' in Spanish? 🟡",options:["Rojo","Azul","Amarillo","Verde"],answer:"Amarillo",hint:"Amarillo sounds like 'Am-a-ree-yo'!"},
    {q:"How do you say 'White' in Spanish? ⬜",options:["Negro","Blanco","Rojo","Azul"],answer:"Blanco",hint:"Blanco sounds like 'Blan-co'!"},
    // Animals
    {q:"How do you say 'Cat' in Spanish? 🐱",options:["Perro","Gato","Pájaro","Pez"],answer:"Gato",hint:"Gato sounds like 'Gah-toe'!"},
    {q:"How do you say 'Dog' in Spanish? 🐶",options:["Gato","Pájaro","Perro","Caballo"],answer:"Perro",hint:"Perro sounds like 'Peh-ro'!"},
    {q:"How do you say 'Bird' in Spanish? 🐦",options:["Pez","Gato","Perro","Pájaro"],answer:"Pájaro",hint:"Pájaro sounds like 'Pa-ha-ro'!"},
    {q:"How do you say 'Fish' in Spanish? 🐟",options:["Perro","Pez","Gato","Caballo"],answer:"Pez",hint:"Pez sounds like 'Peth'!"},
    // Food
    {q:"How do you say 'Apple' in Spanish? 🍎",options:["Naranja","Manzana","Plátano","Uva"],answer:"Manzana",hint:"Manzana sounds like 'Man-sah-na'!"},
    {q:"How do you say 'Water' in Spanish? 💧",options:["Leche","Jugo","Agua","Pan"],answer:"Agua",hint:"Agua sounds like 'Ah-gwa'!"},
    {q:"How do you say 'Bread' in Spanish? 🍞",options:["Leche","Pan","Agua","Queso"],answer:"Pan",hint:"Pan sounds like 'pahn' — not the cooking pan!"},
    // Family
    {q:"How do you say 'Mother' in Spanish? 👩",options:["Padre","Hermano","Madre","Abuela"],answer:"Madre",hint:"Madre sounds like 'Mah-dray'!"},
    {q:"How do you say 'Father' in Spanish? 👨",options:["Madre","Padre","Hermana","Abuelo"],answer:"Padre",hint:"Padre sounds like 'Pah-dray'!"},
    // Simple sentences
    {q:"What does '¿Cómo te llamas?' mean?",options:["How are you?","What is your name?","Where do you live?","How old are you?"],answer:"What is your name?",hint:"Llamas comes from llamarse = to be called!"},
    {q:"What does 'Me llamo...' mean?",options:["I live in...","I am... years old","My name is...","I like..."],answer:"My name is...",hint:"Me llamo = I call myself!"},
    {q:"What does '¿Cómo estás?' mean?",options:["What is your name?","How old are you?","How are you?","Where are you?"],answer:"How are you?",hint:"Estás comes from estar = to be!"},
    {q:"What does 'Muy bien' mean?",options:["Very bad","Very big","Very well","Very small"],answer:"Very well",hint:"Bien means good/well, muy means very!"},
    {q:"What does 'Me gusta' mean?",options:["I don't like","I like","I want","I have"],answer:"I like",hint:"Me gusta = it pleases me = I like!"},
  ],

  /* ── CogAT ───────────────────────────────────────────────────────────── */
  cogat:[
    // === VERBAL BATTERY ===
    {type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nThe boy was very tired so he went to ___.",options:["school","bed","swim","run"],answer:"bed",hint:"When you are very tired, what do you do?"},
    {type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nA bird uses its wings to ___.",options:["swim","dig","fly","bark"],answer:"fly",hint:"What do birds do with their wings?"},
    {type:"CogAT Verbal",q:"VERBAL ANALOGY:\nFish is to water as\nbird is to ___.",options:["nest","worm","air","feather"],answer:"air",hint:"Fish lives in water. Bird lives in/flies through...?"},
    {type:"CogAT Verbal",q:"VERBAL ANALOGY:\nHot is to cold as\nday is to ___.",options:["sun","bright","night","morning"],answer:"night",hint:"Hot and cold are opposites. Day and ___ are opposites!"},
    {type:"CogAT Verbal",q:"VERBAL ANALOGY:\nPuppy is to dog as\nkitten is to ___.",options:["lion","rabbit","cat","tiger"],answer:"cat",hint:"A puppy grows into a dog. A kitten grows into a...?"},
    {type:"CogAT Verbal",q:"VERBAL CLASSIFICATION:\nWhich word belongs with\n'rose, tulip, daisy'?",options:["oak","sunflower","grass","fern"],answer:"sunflower",hint:"Rose, tulip, daisy are all...?"},
    {type:"CogAT Verbal",q:"VERBAL CLASSIFICATION:\nWhich word belongs with\n'happy, joyful, cheerful'?",options:["sad","angry","delighted","tired"],answer:"delighted",hint:"Happy, joyful, cheerful all mean feeling...?"},
    {type:"CogAT Verbal",q:"VERBAL CLASSIFICATION:\nWhich word belongs with\n'hammer, saw, drill'?",options:["spoon","wrench","plate","cup"],answer:"wrench",hint:"Hammer, saw, drill are all...?"},
    {type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nWe put on our coats because\nit was very ___.",options:["hot","sunny","cold","bright"],answer:"cold",hint:"Why do you wear a coat?"},
    {type:"CogAT Verbal",q:"VERBAL ANALOGY:\nLibrary is to books as\nmuseum is to ___.",options:["paintings","music","food","sport"],answer:"paintings",hint:"A library contains books. A museum contains...?"},

    // === QUANTITATIVE BATTERY ===
    {type:"CogAT Quantitative",q:"NUMBER SERIES:\n2, 4, 6, 8, 10, __",options:["11","12","13","14"],answer:"12",hint:"Add 2 each time!"},
    {type:"CogAT Quantitative",q:"NUMBER SERIES:\n1, 2, 4, 7, 11, __",options:["14","15","16","17"],answer:"16",hint:"Add 1, then 2, then 3, then 4, then 5!"},
    {type:"CogAT Quantitative",q:"NUMBER SERIES:\n3, 6, 9, 12, __",options:["13","14","15","16"],answer:"15",hint:"Count by 3s!"},
    {type:"CogAT Quantitative",q:"NUMBER PUZZLES:\nIf 🍎 + 🍎 = 10,\nwhat does 🍎 equal?",options:["3","4","5","6"],answer:"5",hint:"Half of 10 is...?"},
    {type:"CogAT Quantitative",q:"NUMBER PUZZLES:\nIf 🌟 × 3 = 15,\nwhat does 🌟 equal?",options:["3","4","5","6"],answer:"5",hint:"What times 3 equals 15?"},
    {type:"CogAT Quantitative",q:"NUMBER PUZZLES:\n🔲 + 4 = 2 × 6\nWhat is 🔲?",options:["6","7","8","9"],answer:"8",hint:"First find 2×6=12, then 12−4=?"},
    {type:"CogAT Quantitative",q:"EQUATION BUILDING:\nWhich makes this TRUE?\n5 __ 3 = 8",options:["×","÷","−","+"],answer:"+",hint:"5 plus 3 equals 8!"},
    {type:"CogAT Quantitative",q:"EQUATION BUILDING:\nWhich makes this TRUE?\n10 __ 2 = 5",options:["+","−","×","÷"],answer:"÷",hint:"10 divided by 2 equals 5!"},
    {type:"CogAT Quantitative",q:"NUMBER SERIES:\n20, 17, 14, 11, __",options:["7","8","9","10"],answer:"8",hint:"Subtract 3 each time!"},
    {type:"CogAT Quantitative",q:"NUMBER PUZZLES:\nIf ▲ + ▲ + ▲ = 12,\nwhat does ▲ equal?",options:["3","4","5","6"],answer:"4",hint:"3 triangles equal 12. 12 ÷ 3 = ?"},

    // === NON-VERBAL BATTERY ===
    {type:"CogAT Non-Verbal",q:"FIGURE CLASSIFICATION:\nWhich shape belongs with\n🔺 🔺 🔺 (triangles)?",options:["⬛ Square","⭕ Circle","🔻 Triangle","💎 Diamond"],answer:"🔻 Triangle",hint:"Find the shape that matches the group!"},
    {type:"CogAT Non-Verbal",q:"FIGURE CLASSIFICATION:\n⬛ ⬜ 🟫 are all squares.\nWhich also belongs?",options:["⭕ Circle","🔷 Diamond","🟥 Square","🔺 Triangle"],answer:"🟥 Square",hint:"Look for the same type of shape!"},
    {type:"CogAT Non-Verbal",q:"FIGURE MATRICES:\nBig → Small :: Dark → ___",options:["Bigger","Darker","Light","Heavy"],answer:"Light",hint:"Big and small are opposites. Dark and ___ are opposites!"},
    {type:"CogAT Non-Verbal",q:"PATTERN REASONING:\n🔴🔵🔴🔵🔴 __",options:["🔴","🔵","🟢","🟡"],answer:"🔵",hint:"Red, blue, red, blue... what's next?"},
    {type:"CogAT Non-Verbal",q:"PATTERN REASONING:\n⭐⭐🌙⭐⭐🌙 __",options:["🌙","⭐","☀️","💫"],answer:"⭐",hint:"Star, star, moon, star, star, moon, ...?"},
    {type:"CogAT Non-Verbal",q:"PAPER FOLDING:\nA square paper is folded in half.\nHow many layers are there?",options:["1","2","3","4"],answer:"2",hint:"Fold once = 2 layers!"},
    {type:"CogAT Non-Verbal",q:"PAPER FOLDING:\nA square is folded in half TWICE.\nHow many layers?",options:["2","3","4","5"],answer:"4",hint:"Fold once=2, fold again=4!"},
    {type:"CogAT Non-Verbal",q:"FIGURE MATRICES:\nIf 🔺 rotated = 🔻,\nwhat does ➡️ rotated become?",options:["⬆️","⬇️","⬅️","↗️"],answer:"⬇️",hint:"Rotating 90° clockwise: right arrow points down!"},
    {type:"CogAT Non-Verbal",q:"SPATIAL REASONING:\nHow many small squares make\none big 2×2 square?",options:["2","3","4","6"],answer:"4",hint:"2 rows × 2 columns = ?"},
    {type:"CogAT Non-Verbal",q:"FIGURE CLASSIFICATION:\nWhich has EXACTLY 4 sides?",options:["Triangle","Circle","Rectangle","Pentagon"],answer:"Rectangle",hint:"Count the sides of each shape!"},
  ],

  /* ── SPELLING ────────────────────────────────────────────────────────── */
  /* Each question: word to spell shown + spoken, pick correct spelling    */
  spelling:[
    // The 'word' field = the correct word shown/spoken before options appear
    {word:"because",q:"Which is the correct spelling?",options:["becaus","because","becorse","becuase"],answer:"because",hint:"b-e-c-a-u-s-e"},
    {word:"people",q:"Which is the correct spelling?",options:["peopel","peeple","people","peaple"],answer:"people",hint:"p-e-o-p-l-e"},
    {word:"which",q:"Which is the correct spelling?",options:["wich","whitch","which","wihch"],answer:"which",hint:"starts with wh- like where and when"},
    {word:"there",q:"Which is the correct spelling?",options:["thier","there","thear","theyr"],answer:"there",hint:"like 'here' with a T in front"},
    {word:"would",q:"Which is the correct spelling?",options:["woud","wood","wuld","would"],answer:"would",hint:"has a silent L: w-o-u-l-d"},
    {word:"really",q:"Which is the correct spelling?",options:["realy","relly","realla","really"],answer:"really",hint:"double L: r-e-a-l-l-y"},
    {word:"beautiful",q:"Which is the correct spelling?",options:["beutiful","beautifull","beautiful","butiful"],answer:"beautiful",hint:"b-e-a-u-t-i-f-u-l"},
    {word:"friend",q:"Which is the correct spelling?",options:["freind","frend","friend","friand"],answer:"friend",hint:"i before e in friend!"},
    {word:"school",q:"Which is the correct spelling?",options:["scool","shcool","school","skhool"],answer:"school",hint:"sch- then -ool"},
    {word:"again",q:"Which is the correct spelling?",options:["agen","agian","agin","again"],answer:"again",hint:"a-g-a-i-n"},
    {word:"different",q:"Which is the correct spelling?",options:["diferent","diffrent","different","diferrent"],answer:"different",hint:"double f: d-i-f-f-e-r-e-n-t"},
    {word:"garden",q:"Which is the correct spelling?",options:["gardin","garden","gaarden","gardan"],answer:"garden",hint:"g-a-r-d-e-n"},
    {word:"answer",q:"Which is the correct spelling?",options:["anser","answar","asnwer","answer"],answer:"answer",hint:"silent w: a-n-s-w-e-r"},
    {word:"every",q:"Which is the correct spelling?",options:["evry","every","evrey","everry"],answer:"every",hint:"e-v-e-r-y"},
    {word:"thought",q:"Which is the correct spelling?",options:["thort","thougt","thought","thougth"],answer:"thought",hint:"th-ough-t — tricky ough!"},
    {word:"enough",q:"Which is the correct spelling?",options:["enuf","enouf","enougth","enough"],answer:"enough",hint:"e-n-o-u-g-h — tricky ough!"},
    {word:"through",q:"Which is the correct spelling?",options:["threw","throgh","through","throo"],answer:"through",hint:"thr-ough — another ough word!"},
    {word:"might",q:"Which is the correct spelling?",options:["mite","migt","myght","might"],answer:"might",hint:"m-i-g-h-t — silent gh!"},
    {word:"night",q:"Which is the correct spelling?",options:["nite","nigt","nyght","night"],answer:"night",hint:"n-i-g-h-t — like light and right!"},
    {word:"light",q:"Which is the correct spelling?",options:["lite","lght","lyght","light"],answer:"light",hint:"l-i-g-h-t — silent gh!"},
    {word:"caught",q:"Which is the correct spelling?",options:["cort","caght","cawght","caught"],answer:"caught",hint:"c-a-u-g-h-t — tricky aught!"},
    {word:"taught",q:"Which is the correct spelling?",options:["tort","taght","tawght","taught"],answer:"taught",hint:"t-a-u-g-h-t — like caught!"},
    {word:"island",q:"Which is the correct spelling?",options:["iland","eiland","ilsand","island"],answer:"island",hint:"silent s: i-s-l-a-n-d"},
    {word:"climb",q:"Which is the correct spelling?",options:["clim","clime","climm","climb"],answer:"climb",hint:"silent b at the end: c-l-i-m-b"},
    {word:"knee",q:"Which is the correct spelling?",options:["nee","kne","knea","knee"],answer:"knee",hint:"silent k: k-n-e-e"},
    {word:"whole",q:"Which is the correct spelling?",options:["hole","whol","wole","whole"],answer:"whole",hint:"silent wh-: w-h-o-l-e"},
    {word:"daughter",q:"Which is the correct spelling?",options:["darter","doughter","dawter","daughter"],answer:"daughter",hint:"d-a-u-g-h-t-e-r — tricky!"},
    {word:"favourite",q:"Which is the correct spelling?",options:["favorit","favrite","favourite","faverite"],answer:"favourite",hint:"f-a-v-o-u-r-i-t-e"},
    {word:"chocolate",q:"Which is the correct spelling?",options:["choclate","chokolate","chockolate","chocolate"],answer:"chocolate",hint:"choc-o-late — three syllables!"},
    {word:"surprise",q:"Which is the correct spelling?",options:["suprise","surpise","surprize","surprise"],answer:"surprise",hint:"sur-prise: s-u-r-p-r-i-s-e"},
  ],

  /* ── FILL THE GAP ────────────────────────────────────────────────────── */
  gaps:[
    // type:"sentence" = full sentence with ___ | type:"word" = missing letters
    {type:"sentence",q:"The cat sat on the ___.",options:["mat","dog","run","blue"],answer:"mat",hint:"Cats like to sit on flat things!"},
    {type:"sentence",q:"She put on her coat because\nit was ___.",options:["sunny","hot","cold","funny"],answer:"cold",hint:"Why do you wear a coat?"},
    {type:"sentence",q:"The children played in the ___ after school.",options:["bed","park","book","spoon"],answer:"park",hint:"Where do children go to play outside?"},
    {type:"sentence",q:"He was very ___ so he drank\na glass of water.",options:["hungry","tired","thirsty","happy"],answer:"thirsty",hint:"When you need water, you feel...?"},
    {type:"sentence",q:"We use a ___ to cut paper.",options:["spoon","pen","scissors","pillow"],answer:"scissors",hint:"What has two blades and cuts?"},
    {type:"sentence",q:"Birds fly with their ___.",options:["legs","tails","wings","beaks"],answer:"wings",hint:"What do birds flap to fly?"},
    {type:"sentence",q:"The sun rises in the ___ and sets in the west.",options:["north","south","east","sky"],answer:"east",hint:"The sun comes up in the east!"},
    {type:"sentence",q:"A baby cat is called a ___.",options:["puppy","calf","kitten","foal"],answer:"kitten",hint:"A baby dog is a puppy. A baby cat is a...?"},
    {type:"sentence",q:"We read and write at ___.",options:["home","school","hospital","shop"],answer:"school",hint:"Where do you go to learn?"},
    {type:"sentence",q:"Fish live in ___ water.",options:["hot","dry","salty","rocky"],answer:"salty",hint:"The sea tastes salty — and fish live there!"},
    {type:"sentence",q:"A doctor works in a ___.",options:["school","shop","hospital","library"],answer:"hospital",hint:"Where do sick people go for help?"},
    {type:"sentence",q:"We use an ___ when it rains.",options:["hat","umbrella","coat","boot"],answer:"umbrella",hint:"It keeps rain off your head!"},
    {type:"sentence",q:"The opposite of hot is ___.",options:["warm","cold","big","fast"],answer:"cold",hint:"Hot and ___ are opposites!"},
    {type:"sentence",q:"A spider has ___ legs.",options:["4","6","8","10"],answer:"8",hint:"Count the legs on a spider!"},
    {type:"sentence",q:"We plant seeds in the ___ to grow flowers.",options:["sea","soil","sky","snow"],answer:"soil",hint:"Seeds go into the ground — into the...?"},
    // Word gap questions — missing letters shown with underscores
    {type:"word",q:"Complete the word:\nc _ t",display:"c _ t",options:["a","e","i","o"],answer:"a",hint:"This animal says meow! c_a_t"},
    {type:"word",q:"Complete the word:\nd _ g",display:"d _ g",options:["a","e","i","o"],answer:"o",hint:"This animal barks! d_o_g"},
    {type:"word",q:"Complete the word:\ns _ n",display:"s _ n",options:["a","e","i","o","u"],answer:"u",hint:"It shines in the sky! s_u_n"},
    {type:"word",q:"Complete the word:\nb _ d",display:"b _ d",options:["a","e","i","o","u"],answer:"e",hint:"You sleep in it! b_e_d"},
    {type:"word",q:"Complete the word:\nt _ ee",display:"t _ ee",options:["a","e","r","n"],answer:"r",hint:"It has leaves and branches! t_r_ee"},
    {type:"word",q:"Complete the word:\nfl _ wer",display:"fl _ wer",options:["a","e","o","u"],answer:"o",hint:"It blooms in the garden! fl_o_wer"},
    {type:"word",q:"Complete the word:\nf _ sh",display:"f _ sh",options:["a","e","i","o"],answer:"i",hint:"It lives in water and swims! f_i_sh"},
    {type:"word",q:"Complete the word:\nfr _ g",display:"fr _ g",options:["a","e","o","u"],answer:"o",hint:"It hops and says ribbit! fr_o_g"},
    {type:"word",q:"Complete the word:\ndr _ gon",display:"dr _ gon",options:["a","e","i","o"],answer:"a",hint:"A mythical fire-breathing creature! dr_a_gon"},
    {type:"word",q:"Complete the word:\nj _ mp",display:"j _ mp",options:["a","e","i","u"],answer:"u",hint:"What you do on a trampoline! j_u_mp"},
    {type:"word",q:"Complete the word:\nst _ r",display:"st _ r",options:["a","e","i","o"],answer:"a",hint:"It twinkles in the night sky! st_a_r"},
    {type:"word",q:"Complete the word:\nch _ ir",display:"ch _ ir",options:["a","e","i","o"],answer:"a",hint:"You sit on it! ch_a_ir"},
    {type:"word",q:"Complete the word:\ntr _ in",display:"tr _ in",options:["a","e","i","o"],answer:"a",hint:"It runs on railway tracks! tr_a_in"},
    {type:"word",q:"Complete the word:\nsp _ der",display:"sp _ der",options:["a","e","i","o"],answer:"i",hint:"It has 8 legs and spins webs! sp_i_der"},
    {type:"word",q:"Complete the word:\ncl _ ud",display:"cl _ ud",options:["a","e","o","u"],answer:"o",hint:"Fluffy white things in the sky! cl_o_ud"},
  ],
};

async function fetchAIQ(subject){
  const prompts={
    maths:"Generate 1 simple maths question for a 5-7 year old. Return ONLY valid JSON: {\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
    english:"Generate 1 English question for a 5-7 year old. Return ONLY valid JSON: {\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
    reading:"Generate a 3-sentence story for ages 5-7 with 1 question. Return ONLY valid JSON: {\"passage\":\"...\",\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
    verbal:"Generate 1 verbal reasoning question for ages 5-7. Return ONLY valid JSON: {\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
    quant:"Generate 1 quantitative reasoning question for ages 5-7 (number patterns, missing numbers, or puzzles). Return ONLY valid JSON: {\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
    spanish:"Generate 1 beginner Spanish vocabulary question for ages 5-7. Return ONLY valid JSON: {\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
    cogat:"Generate 1 CogAT-style question for ages 5-7 (verbal analogy, number series, or pattern recognition). Return ONLY valid JSON: {\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
    spelling:"Generate 1 spelling question for ages 5-7. Pick a common English word and give 4 spellings (1 correct, 3 plausible misspellings). Return ONLY valid JSON: {\"word\":\"...\",\"q\":\"Which is the correct spelling?\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
    gaps:"Generate 1 fill-in-the-gap sentence for ages 5-7 with one missing word. Return ONLY valid JSON: {\"type\":\"sentence\",\"q\":\"sentence with ___ for the gap\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"...\",\"hint\":\"...\"}",
  };
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,system:"You are a friendly teacher for children aged 5-7. Respond ONLY with valid JSON, no markdown.",messages:[{role:"user",content:prompts[subject]}]})});
    const d=await r.json();
    const txt=(d.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
    return JSON.parse(txt);
  }catch{return null;}
}

/* ─── CSS ──────────────────────────────────────────────────────────────── */
const CSS=`
@import url('${FONTS}');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;touch-action:manipulation}
body{font-family:'Quicksand',sans-serif;background:#F0FDF4;min-height:100vh;min-height:100dvh;overscroll-behavior:none;-webkit-tap-highlight-color:transparent}
.app{max-width:720px;margin:0 auto;padding:12px 14px;padding-top:max(12px,env(safe-area-inset-top));padding-bottom:max(20px,env(safe-area-inset-bottom));padding-left:max(14px,env(safe-area-inset-left));padding-right:max(14px,env(safe-area-inset-right));position:relative;z-index:1;min-height:100vh;min-height:100dvh}
@keyframes sway{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}
@keyframes mascot-bounce{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-8px) rotate(3deg)}}
@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}
@keyframes starPop{0%{transform:scale(0)}70%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes spin{to{transform:rotate(360deg)}}
.mascot-bounce{animation:mascot-bounce 1.4s ease-in-out infinite}
.slide-up{animation:slideUp 0.3s ease both}

.home-hero{text-align:center;padding:14px 0 8px}
.logo{font-family:'Boogaloo',cursive;font-size:clamp(30px,7vw,46px);background:linear-gradient(135deg,#16a34a,#F6A800,#D45EBC);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.1}
.logo-sub{font-size:clamp(11px,2.8vw,14px);color:#6b7280;font-weight:700;margin-top:3px}
.vine{height:4px;background:repeating-linear-gradient(90deg,#4ade80 0,#4ade80 12px,transparent 12px,transparent 20px);border-radius:99px;margin:8px 0}

.nav-tabs{display:flex;gap:6px;margin-bottom:12px;overflow-x:auto;padding-bottom:2px}
.nav-tab{flex:0 0 auto;padding:9px 14px;border-radius:14px;border:2.5px solid #e5e7eb;background:white;font-family:'Boogaloo',cursive;font-size:clamp(13px,3vw,16px);cursor:pointer;color:#6b7280;transition:all 0.15s;touch-action:manipulation;white-space:nowrap}
.nav-tab.active{background:#16a34a;color:white;border-color:#16a34a}
.nav-tab:active{transform:scale(0.97)}

.subject-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:8px}
@media(min-width:500px){.subject-grid{grid-template-columns:repeat(3,1fr)}}
@media(min-width:680px){.subject-grid{grid-template-columns:repeat(4,1fr)}}

.subject-card{border-radius:18px;padding:clamp(11px,2.5vw,18px) clamp(9px,2vw,14px);cursor:pointer;border:3px solid transparent;position:relative;overflow:hidden;transition:transform 0.18s,box-shadow 0.18s;text-align:center;min-height:110px;display:flex;flex-direction:column;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none}
.subject-card:active{transform:scale(0.96)}
@media(hover:hover){.subject-card:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 10px 28px rgba(0,0,0,0.13)}}
.card-label{font-family:'Boogaloo',cursive;font-size:clamp(14px,3.2vw,19px);margin-bottom:1px}
.card-desc{font-size:clamp(9px,2vw,11px);font-weight:700;opacity:0.7}
.card-stars{margin-top:4px}
.badge-best{position:absolute;top:6px;right:6px;background:white;border-radius:99px;padding:2px 7px;font-size:9px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,0.1)}
.cogat-badge{position:absolute;top:6px;left:6px;background:#6366F1;color:white;border-radius:99px;padding:2px 6px;font-size:8px;font-weight:800}

.topbar{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.back-btn{background:white;border:2.5px solid #e5e7eb;border-radius:14px;padding:8px 13px;font-size:clamp(12px,3vw,14px);font-weight:700;cursor:pointer;font-family:'Quicksand',sans-serif;white-space:nowrap;min-height:42px;touch-action:manipulation}
.back-btn:active{background:#f0f0f0}
.topbar-label{font-family:'Boogaloo',cursive;font-size:clamp(15px,3.8vw,20px);flex:1}
.score-chip{background:white;border:2px solid #e5e7eb;border-radius:99px;padding:5px 10px;font-size:clamp(12px,2.8vw,14px);font-weight:800;white-space:nowrap}
.icon-btn{background:white;border:2px solid #e5e7eb;border-radius:99px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;flex-shrink:0;touch-action:manipulation}
.icon-btn:active{background:#f0f0f0}

.prog-row{display:flex;align-items:center;gap:4px;margin-bottom:10px;flex-wrap:wrap}
.prog-dot{width:9px;height:9px;border-radius:50%;background:#e5e7eb;transition:all 0.3s;flex-shrink:0}
.prog-dot.done{background:#34C76F}.prog-dot.active{transform:scale(1.35)}
.prog-track{flex:1;min-width:50px;height:7px;background:#e5e7eb;border-radius:99px;overflow:hidden}
.prog-fill{height:100%;border-radius:99px;transition:width 0.4s ease}

.q-wrap{animation:slideUp 0.3s ease both}
.q-card{background:white;border-radius:20px;padding:clamp(13px,3.5vw,22px) clamp(11px,3.5vw,18px);box-shadow:0 4px 24px rgba(0,0,0,0.08);border:2.5px solid #f3f4f6;margin-bottom:10px}
.battery-badge{display:inline-flex;align-items:center;gap:4px;border-radius:99px;font-size:10px;font-weight:800;padding:3px 10px;margin-bottom:8px}
.ai-badge{display:inline-flex;align-items:center;gap:4px;background:#EDE9FE;color:#7C3AED;border-radius:99px;font-size:10px;font-weight:800;padding:3px 9px;margin-bottom:7px}
.passage{background:#FFFBEB;border-left:4px solid #F6A800;border-radius:13px;padding:clamp(9px,2.5vw,13px);font-size:clamp(12px,3vw,14px);line-height:1.75;margin-bottom:11px;color:#555;font-weight:600}
.q-num{font-size:10px;font-weight:800;color:#9ca3af;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px}
.q-text{font-size:clamp(13px,3.5vw,17px);font-weight:700;color:#111;line-height:1.4;white-space:pre-line}
.read-btn{background:none;border:2px solid #e5e7eb;border-radius:99px;padding:5px 12px;font-size:11px;font-weight:800;cursor:pointer;color:#6b7280;margin-top:7px;display:inline-flex;align-items:center;gap:4px;touch-action:manipulation;font-family:'Quicksand',sans-serif}
.read-btn.reading{border-color:#4A9EE0;color:#4A9EE0;background:#EFF8FF}

.options{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}
@media(max-width:320px){.options{grid-template-columns:1fr}}
.opt{border-radius:14px;padding:clamp(10px,2.8vw,14px) clamp(6px,2vw,10px);font-size:clamp(12px,3vw,14px);font-weight:700;border:3px solid transparent;cursor:pointer;transition:all 0.15s;font-family:'Quicksand',sans-serif;text-align:center;line-height:1.3;min-height:48px;display:flex;align-items:center;justify-content:center;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.opt:active:not(:disabled){transform:scale(0.96)}
@media(hover:hover){.opt:hover:not(:disabled){transform:scale(1.03)}}
.opt:disabled{cursor:default}
.opt-default{background:#F5F7FF;color:#374151;border-color:#e5e7eb}
.opt-correct{background:#D1FAE5;color:#065F46;border-color:#34D399;animation:pulse 0.4s}
.opt-wrong{background:#FEE2E2;color:#7F1D1D;border-color:#F87171}

.hint-btn{background:none;border:2.5px dashed #FBBF24;color:#D97706;border-radius:13px;padding:8px 14px;font-size:clamp(12px,2.8vw,13px);font-weight:800;cursor:pointer;margin-top:9px;font-family:'Quicksand',sans-serif;display:block;width:100%;min-height:42px;touch-action:manipulation}
.hint-btn:active{background:#FFFBEB}
.hint-box{background:#FFFBEB;border-radius:13px;padding:8px 12px;margin-top:7px;font-size:clamp(12px,2.8vw,13px);color:#B45309;font-weight:700;border:2px dashed #FBBF24}
.feedback{border-radius:14px;padding:10px 13px;margin-top:9px;font-size:clamp(12px,3vw,14px);font-weight:700;animation:slideUp 0.2s}
.fb-correct{background:#D1FAE5;color:#065F46;border:2px solid #34D399}
.fb-wrong{background:#FEE2E2;color:#7F1D1D;border:2px solid #F87171}
.streak-banner{background:linear-gradient(90deg,#FF6B6B,#F6A800);color:white;border-radius:13px;padding:7px 13px;margin-top:7px;font-family:'Boogaloo',cursive;font-size:16px;text-align:center;animation:pulse 0.5s}
.next-btn{width:100%;padding:clamp(11px,3vw,15px);border-radius:16px;font-family:'Boogaloo',cursive;font-size:clamp(16px,4vw,20px);border:none;cursor:pointer;margin-top:9px;color:white;transition:transform 0.15s;min-height:50px;touch-action:manipulation}
.next-btn:active{transform:scale(0.97)}

.loading{text-align:center;padding:clamp(30px,7vw,48px) 24px}
.spin{width:40px;height:40px;border:5px solid #e5e7eb;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto 13px}

.results{background:white;border-radius:24px;padding:clamp(22px,5vw,36px) clamp(16px,4vw,28px);box-shadow:0 4px 28px rgba(0,0,0,0.1);text-align:center;animation:slideUp 0.35s}
.results-title{font-family:'Boogaloo',cursive;font-size:clamp(24px,6vw,34px);margin-bottom:4px}
.results-score{font-family:'Boogaloo',cursive;font-size:clamp(42px,11vw,58px);margin:8px 0}
.results-msg{font-size:clamp(12px,2.8vw,15px);color:#6b7280;font-weight:700;margin-bottom:16px}
.results-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.res-btn{border-radius:14px;padding:clamp(10px,2.8vw,13px) clamp(14px,4vw,22px);font-family:'Boogaloo',cursive;font-size:clamp(15px,3.8vw,19px);border:none;cursor:pointer;color:white;min-height:48px;touch-action:manipulation;flex:1;max-width:160px}
.res-btn:active{transform:scale(0.97)}

.achievements-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:9px;margin-top:10px}
.ach-card{background:white;border-radius:16px;padding:12px 10px;text-align:center;border:2.5px solid #e5e7eb;transition:transform 0.15s}
.ach-card.earned{border-color:#F6A800;background:#FFFBEB}
.ach-card.locked{opacity:0.4;filter:grayscale(0.6)}
.ach-icon{font-size:28px;margin-bottom:5px}
.ach-label{font-family:'Boogaloo',cursive;font-size:13px;color:#111;margin-bottom:1px}
.ach-desc{font-size:10px;color:#6b7280;font-weight:700}

.dash-section{background:white;border-radius:18px;padding:14px 16px;margin-bottom:11px;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.dash-title{font-family:'Boogaloo',cursive;font-size:18px;color:#111;margin-bottom:10px;display:flex;align-items:center;gap:7px}
.dash-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #f3f4f6}
.dash-row:last-child{border-bottom:none}
.dash-bar-wrap{flex:1;height:9px;background:#f3f4f6;border-radius:99px;overflow:hidden}
.dash-bar{height:100%;border-radius:99px;transition:width 0.6s ease}
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.stat-box{background:#F0FDF4;border-radius:14px;padding:11px;text-align:center}
.stat-num{font-family:'Boogaloo',cursive;font-size:26px;color:#16a34a}
.stat-label{font-size:10px;font-weight:800;color:#6b7280}

/* ── Times Tables ── */
.tt-table-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}
@media(min-width:400px){.tt-table-grid{grid-template-columns:repeat(6,1fr)}}
.tt-table-btn{border-radius:14px;padding:10px 4px;font-family:'Boogaloo',cursive;font-size:18px;border:3px solid #10B981;background:white;color:#065F46;cursor:pointer;transition:all 0.15s;text-align:center;touch-action:manipulation;min-height:52px}
.tt-table-btn.selected{background:#10B981;color:white;transform:scale(1.06)}
.tt-table-btn:active{transform:scale(0.95)}
.tt-table-btn.mastered{border-color:#F6A800;background:#FFFBEB}
.tt-visual{border-radius:16px;padding:12px;margin:10px 0;min-height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2.5px solid #10B981;background:#F0FFF4}
.tt-visual-label{font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
.tt-dot-row{display:flex;gap:4px;margin:2px 0;flex-wrap:wrap;justify-content:center}
.tt-dot{width:14px;height:14px;border-radius:50%;background:#10B981;display:inline-block;transition:transform 0.2s}
.tt-nl-wrap{width:100%;overflow-x:auto;padding:4px 0}
.tt-nl-track{display:flex;align-items:center;gap:0;position:relative;padding:0 8px}
.tt-nl-seg{display:flex;flex-direction:column;align-items:center}
.tt-nl-hop{width:36px;height:20px;border-top:3px solid #10B981;border-radius:50% 50% 0 0;margin-bottom:2px}
.tt-nl-line{height:4px;background:#10B981;flex:1;min-width:20px}
.tt-nl-num{font-size:10px;font-weight:800;color:#065F46;margin-top:2px}
.tt-array-wrap{display:flex;flex-direction:column;gap:3px;align-items:center}
.tt-array-row{display:flex;gap:3px}
.tt-array-cell{font-size:clamp(12px,3vw,18px);line-height:1}
`;

/* ─── Home ─────────────────────────────────────────────────────────────── */
function Home({progress,history,earned,onSelect,sounds,muted,toggleMute,tab,setTab}){
  return(
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
          <button key={label} className={`nav-tab${tab===i?" active":""}`} onClick={()=>{sounds.tap();setTab(i);}}>{icon} {label}</button>
        ))}
      </div>
      {tab===0&&(
        <div className="subject-grid">
          {SUBJECTS.map((s,i)=>{
            const p=progress[s.id]||{};
            return(
              <div key={s.id} className="subject-card slide-up" style={{background:s.bg,borderColor:s.border,animationDelay:`${i*0.07}s`}} onClick={()=>{sounds.tap();onSelect(s.id);}}>
                {p.best>0&&<div className="badge-best" style={{color:s.dark}}>Best {p.best}/{TOTAL}</div>}
                {s.id==="cogat"&&<div className="cogat-badge">GIFTED</div>}
                {s.id==="spelling"&&<div className="cogat-badge" style={{background:"#F59E0B"}}>🐝 SPELL</div>}
                {s.id==="gaps"&&<div className="cogat-badge" style={{background:"#8B5CF6"}}>🧩 GAPS</div>}
                <div style={{marginBottom:4}}><Mascot type={s.mascot} size={46} animate/></div>
                <div className="card-label" style={{color:s.dark}}>{s.label}</div>
                <div className="card-desc" style={{color:s.dark}}>{s.desc}</div>
                <div className="card-stars"><Stars count={p.stars||0} size={18}/></div>
              </div>
            );
          })}
        </div>
      )}
      {tab===1&&(
        <div>
          <div style={{fontWeight:700,color:"#6b7280",fontSize:12,marginBottom:9}}>{earned.length} of {ACHIEVEMENTS.length} badges earned 🏅</div>
          <div className="achievements-grid">
            {ACHIEVEMENTS.map(a=>{
              const got=earned.includes(a.id);
              return(
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
      {tab===2&&<ParentDash progress={progress} history={history} earned={earned}/>}
    </div>
  );
}

/* ─── Parent Dashboard ─────────────────────────────────────────────────── */
function ParentDash({progress,history,earned}){
  return(
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
          return(
            <div key={s.id} className="dash-row">
              <div style={{width:24,textAlign:"center",fontSize:16}}>{s.emoji}</div>
              <div style={{width:80,fontWeight:800,fontSize:12,color:s.dark}}>{s.label}</div>
              <div className="dash-bar-wrap"><div className="dash-bar" style={{width:`${pct}%`,background:s.btn}}/></div>
              <div style={{width:48,textAlign:"right",fontSize:11,fontWeight:800,color:"#6b7280"}}>{p.best||0}/{TOTAL}</div>
              <div style={{width:40}}><Stars count={p.stars||0} size={12}/></div>
            </div>
          );
        })}
      </div>
      <div className="dash-section">
        <div className="dash-title">🏅 Recent Badges</div>
        {earned.length===0?<div style={{color:"#9ca3af",fontWeight:700,fontSize:13}}>No badges yet — keep playing! 🌱</div>:(
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {earned.slice(-8).map(id=>{
              const a=ACHIEVEMENTS.find(x=>x.id===id);
              return a?<div key={id} style={{background:"#FFFBEB",border:"2px solid #F6A800",borderRadius:11,padding:"5px 11px",fontSize:12,fontWeight:800,display:"flex",alignItems:"center",gap:5}}><span>{a.icon}</span>{a.label}</div>:null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Quiz ─────────────────────────────────────────────────────────────── */
const CHEERS=["Amazing! 🎉","Brilliant! 🌟","Super star! ⭐","Wow! 🏆","Great job! 🎊","Fantastic! 🦁","You got it! 🎯","Excellent! 🌈","¡Muy bien! 🇪🇸","Bravo! 🎺"];

const BATTERY_COLORS={"CogAT Verbal":"#10B981","CogAT Quantitative":"#F59E0B","CogAT Non-Verbal":"#6366F1"};

const clampWord="clamp(22px,6vw,34px)";

function Quiz({subjectId,onBack,onDone,sounds,muted,toggleMute}){
  const s=SUBJECTS.find(x=>x.id===subjectId);
  const isSpelling=subjectId==="spelling";
  const isGaps=subjectId==="gaps";
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
  // Spelling: "show" = display word phase, "quiz" = pick spelling phase
  const [spellPhase,setSpellPhase]=useState("show");

  const build=useCallback(async()=>{
    setLoading(true);
    const bank=[...BANK[subjectId]].sort(()=>Math.random()-0.5);
    const aiResults=await Promise.all([fetchAIQ(subjectId),fetchAIQ(subjectId),fetchAIQ(subjectId)]);
    const aiQs=aiResults.filter(q=>q?.q&&q?.options&&q?.answer).map(q=>({...q,isAI:true}));
    const fixed=bank.slice(0,TOTAL-aiQs.length);
    const combined=[...fixed,...aiQs].sort(()=>Math.random()-0.5).slice(0,TOTAL);
    setQs(combined);setLoading(false);
  },[subjectId]);

  useEffect(()=>{build();},[build]);
  useEffect(()=>{return()=>stopSpeaking();},[]);

  // Auto-speak word when spelling phase starts
  useEffect(()=>{
    if(isSpelling&&spellPhase==="show"&&qs.length>0&&qs[idx]?.word&&!muted){
      const w=qs[idx].word;
      setTimeout(()=>speak(`The word is: ${w}. ${w}.`),400);
    }
  },[idx,spellPhase,qs,isSpelling,muted]);

  const cur=qs[idx];

  const readQuestion=()=>{
    if(reading){stopSpeaking();setReading(false);return;}
    setReading(true);
    let txt;
    if(isSpelling&&cur.word) txt=`The word is: ${cur.word}. ${cur.word}. Can you spell it?`;
    else if(cur.passage) txt=`${cur.passage}. Question: ${cur.q}`;
    else txt=`Question ${idx+1}. ${cur.q}`;
    speak(txt,()=>setReading(false));
  };

  const pick=(opt)=>{
    if(sel!==null)return;
    stopSpeaking();setReading(false);
    setSel(opt);
    if(opt===cur.answer){
      const ns=streak+1;setScore(n=>n+1);setStreak(ns);setBestStreak(b=>Math.max(b,ns));
      setConfetti(true);setTimeout(()=>setConfetti(false),1300);sounds.correct();
    }else{setStreak(0);sounds.wrong();}
  };

  const next=()=>{
    sounds.tap();stopSpeaking();setReading(false);
    if(idx+1>=TOTAL){onDone(score,bestStreak);setDone(true);}
    else{setIdx(i=>i+1);setSel(null);setHint(false);if(isSpelling)setSpellPhase("show");}
  };

  const proceedToSpell=()=>{
    sounds.tap();
    speak(cur.word,()=>{});
    setSpellPhase("quiz");
  };

  if(loading)return(
    <div>
      <div className="topbar">
        <button className="back-btn" onClick={()=>{sounds.tap();onBack();}}>← Back</button>
        <div className="topbar-label" style={{color:s.btn}}>{s.emoji} {s.label}</div>
        <button className="icon-btn" onClick={toggleMute}>{muted?"🔇":"🔊"}</button>
      </div>
      <div className="loading">
        <div className="spin" style={{borderTopColor:s.btn}}/>
        <div style={{fontWeight:700,color:"#9ca3af",fontSize:13}}>Loading {TOTAL} questions... 🌿</div>
        <div style={{marginTop:13}}><Mascot type={s.mascot} size={62} animate/></div>
      </div>
    </div>
  );

  if(done)return<Results score={score} total={TOTAL} subject={s}
    onBack={()=>{sounds.tap();onBack();}}
    onRetry={()=>{sounds.tap();setQs([]);setIdx(0);setSel(null);setHint(false);setScore(0);setDone(false);setStreak(0);if(isSpelling)setSpellPhase("show");build();}}
    sounds={sounds} muted={muted} toggleMute={toggleMute}/>;

  const correct=sel===cur?.answer;
  const batteryColor=cur?.type?BATTERY_COLORS[cur.type]:"";

  // ── Spelling "show word" phase ──────────────────────────────────────────
  if(isSpelling&&spellPhase==="show"&&cur){
    return(
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
          <span style={{fontSize:10,fontWeight:800,color:"#9ca3af"}}>{idx+1}/{TOTAL}</span>
        </div>
        <div className="q-wrap" key={`show-${idx}`}>
          <div className="q-card" style={{borderColor:s.border,textAlign:"center"}}>
            <div style={{marginBottom:10}}><Mascot type={s.mascot} size={52} animate/></div>
            <div style={{fontSize:12,fontWeight:800,color:"#9ca3af",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>Word {idx+1} of {TOTAL}</div>
            <div style={{fontSize:clampWord,fontFamily:"'Boogaloo',cursive",color:s.dark,letterSpacing:"0.05em",marginBottom:8,padding:"14px 8px",background:s.bg,borderRadius:14,border:`3px solid ${s.border}`}}>
              {cur.word}
            </div>
            <div style={{fontSize:13,fontWeight:700,color:"#6b7280",marginBottom:14}}>
              Listen carefully, then pick the correct spelling!
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="read-btn" style={{fontSize:13,padding:"8px 16px"}} onClick={readQuestion}>
                🔈 Hear it again
              </button>
              <button className="next-btn" style={{background:s.btn,width:"auto",padding:"10px 28px",fontSize:18,marginTop:0}} onClick={proceedToSpell}>
                I'm ready to spell! →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal quiz card (also used for spelling "quiz" phase and gaps) ─────
  // For gaps word type: render display field if present
  const gapWordDisplay=isGaps&&cur?.type==="word"&&cur?.display;

  return(
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
        <span style={{fontSize:10,fontWeight:800,color:"#9ca3af"}}>{idx+1}/{TOTAL}</span>
      </div>
      {streak>=3&&sel===null&&<div className="streak-banner">🔥 {streak} in a row! Keep going!</div>}
      <div className="q-wrap" key={idx}>
        <div className="q-card" style={{borderColor:s.border}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
            <Mascot type={s.mascot} size={38} animate={sel!==null&&correct}/>
            <div style={{flex:1}}>
              {cur.type&&!isGaps&&<div className="battery-badge" style={{background:batteryColor+"22",color:batteryColor}}>🧠 {cur.type}</div>}
              {isGaps&&cur.type&&<div className="battery-badge" style={{background:cur.type==="word"?"#EDE9FE":"#DCFCE7",color:cur.type==="word"?"#7C3AED":"#15803d"}}>{cur.type==="word"?"🔤 Missing Letter":"📝 Missing Word"}</div>}
              {cur.isAI&&<div className="ai-badge">✨ AI question</div>}
              <div className="q-num">Question {idx+1} of {TOTAL}</div>
            </div>
          </div>
          {/* Spelling: show the word again small as reminder */}
          {isSpelling&&cur.word&&(
            <div style={{textAlign:"center",marginBottom:8}}>
              <div style={{display:"inline-block",background:s.bg,border:`2px solid ${s.border}`,borderRadius:10,padding:"6px 18px",fontFamily:"'Boogaloo',cursive",fontSize:22,color:s.dark,letterSpacing:"0.05em"}}>{cur.word}</div>
              <button className={`read-btn${reading?" reading":""}`} style={{display:"inline-flex",marginLeft:8}} onClick={readQuestion}>{reading?"⏹":"🔈"}</button>
            </div>
          )}
          {cur.passage&&<div className="passage">{cur.passage}</div>}
          {/* Gap word display box */}
          {gapWordDisplay&&(
            <div style={{textAlign:"center",margin:"8px 0 12px"}}>
              <div style={{display:"inline-block",background:"#F3F0FF",border:"3px dashed #8B5CF6",borderRadius:12,padding:"10px 24px",fontFamily:"'Boogaloo',cursive",fontSize:clampWord,color:"#6D28D9",letterSpacing:"0.12em"}}>{cur.display}</div>
            </div>
          )}
          <div className="q-text">{cur.q}</div>
          {!isSpelling&&(
            <button className={`read-btn${reading?" reading":""}`} onClick={readQuestion}>
              {reading?"⏹ Stop":"🔈 Read to me"}
            </button>
          )}
          <div className="options">
            {cur.options.map(opt=>{
              let cls="opt opt-default";
              if(sel!==null){if(opt===cur.answer)cls="opt opt-correct";else if(opt===sel)cls="opt opt-wrong";}
              return<button key={opt} className={cls} disabled={sel!==null} onClick={()=>pick(opt)} style={sel===null?{borderColor:s.border+"66"}:{}}>{opt}</button>;
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

/* ─── Results ─────────────────────────────────────────────────────────── */
function Results({score,total,subject:s,onBack,onRetry,sounds}){
  const pct=score/total;
  const stars=pct===1?3:pct>=0.6?2:pct>=0.3?1:0;
  const [show,setShow]=useState(false);
  useEffect(()=>{setTimeout(()=>{setShow(true);sounds.fanfare();},300);},[]);
  const msgs=["Keep practicing — you can do it! 💪","Good try! Practice makes perfect! 🌱","Great work! Keep it up! 🌟","Perfect score! You're a superstar! 🏆"];
  return(
    <div>
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>← Home</button>
        <div className="topbar-label" style={{color:s.btn}}>{s.emoji} {s.label}</div>
      </div>
      <div className="results">
        <Mascot type={s.mascot} size={76} animate/>
        <div className="results-title" style={{color:s.btn}}>Quiz done!</div>
        {show&&<Stars count={stars} max={3} size={30}/>}
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

/* ─── Times Tables ──────────────────────────────────────────────────────── */
const TIMES_EMOJIS=["🐼","🦁","🐸","🌟","🍕","🚀","🎈","🦋","🐠","🍎","⚽","🎯"];
const TT_QUESTIONS_PER_SESSION=20;

function DotGrid({a,b}){
  const rows=Math.min(a,12),cols=Math.min(b,12);
  return(
    <div className="tt-visual">
      <div className="tt-visual-label">🟢 {a} rows of {b} dots = {a*b}</div>
      <div>{Array.from({length:rows}).map((_,r)=>(
        <div key={r} className="tt-dot-row">
          {Array.from({length:cols}).map((_,c)=>(
            <div key={c} className="tt-dot" style={{animationDelay:`${(r*cols+c)*0.03}s`}}/>
          ))}
        </div>
      ))}</div>
    </div>
  );
}

function NumberLine({a,b}){
  const product=a*b;
  const steps=Math.min(a,8);
  const stepSize=b;
  const points=Array.from({length:steps+1},(_,i)=>i*stepSize);
  return(
    <div className="tt-visual">
      <div className="tt-visual-label">📏 Hop by {b}, {a} times = {product}</div>
      <div className="tt-nl-wrap">
        <div className="tt-nl-track">
          {points.map((p,i)=>(
            <div key={i} className="tt-nl-seg">
              {i>0&&<div className="tt-nl-hop" style={{borderColor:i<=steps?"#10B981":"#d1fae5"}}/>}
              {i===0&&<div style={{height:20}}/>}
              <div style={{width:i<points.length-1?36:4,height:4,background:i<steps?"#10B981":"#d1fae5",borderRadius:99}}/>
              <div className="tt-nl-num" style={{color:i===steps?"#F6A800":"#065F46",fontWeight:i===steps?900:700}}>{p}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArrayViz({a,b}){
  const rows=Math.min(a,8),cols=Math.min(b,8);
  const emoji=TIMES_EMOJIS[(a+b)%TIMES_EMOJIS.length];
  return(
    <div className="tt-visual">
      <div className="tt-visual-label">🎯 {a}×{b} array = {a*b} {emoji}</div>
      <div className="tt-array-wrap">
        {Array.from({length:rows}).map((_,r)=>(
          <div key={r} className="tt-array-row">
            {Array.from({length:cols}).map((_,c)=>(
              <span key={c} className="tt-array-cell">{emoji}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Visual({a,b,type}){
  if(type==="dot")return<DotGrid a={a} b={b}/>;
  if(type==="line")return<NumberLine a={a} b={b}/>;
  return<ArrayViz a={a} b={b}/>;
}

function TimesTablePicker({onStart,onBack,sounds,mastery}){
  const [selected,setSelected]=useState(null);
  const tables=Array.from({length:11},(_,i)=>i+2); // 2–12
  return(
    <div>
      <div className="topbar">
        <button className="back-btn" onClick={()=>{sounds.tap();onBack();}}>← Home</button>
        <div className="topbar-label" style={{color:"#10B981"}}>✖️ Times Tables</div>
      </div>
      <div style={{background:"white",borderRadius:20,padding:"16px",marginBottom:12,boxShadow:"0 4px 20px rgba(0,0,0,0.07)"}}>
        <div style={{textAlign:"center",marginBottom:10}}>
          <Mascot type="panda" size={56} animate/>
          <div style={{fontFamily:"'Boogaloo',cursive",fontSize:20,color:"#065F46",marginTop:6}}>Pick a times table!</div>
          <div style={{fontSize:12,fontWeight:700,color:"#6b7280"}}>Then practice all 20 questions with cool visuals</div>
        </div>
        <div className="tt-table-grid">
          {tables.map(t=>{
            const m=mastery[t]||0;
            const isMastered=m>=20;
            return(
              <button key={t}
                className={`tt-table-btn${selected===t?" selected":""}${isMastered?" mastered":""}`}
                onClick={()=>{sounds.tap();setSelected(t);}}
              >
                {t}×
                {isMastered&&<div style={{fontSize:9,fontWeight:900,color:selected===t?"white":"#F6A800"}}>⭐</div>}
              </button>
            );
          })}
        </div>
        {selected&&(
          <div style={{textAlign:"center",marginTop:4}}>
            <div style={{fontSize:13,fontWeight:700,color:"#6b7280",marginBottom:10}}>
              The <strong style={{color:"#10B981"}}>{selected}× table</strong> — ready? Let's go!
            </div>
            <button className="next-btn" style={{background:"#10B981",maxWidth:260,margin:"0 auto",display:"block"}}
              onClick={()=>{sounds.tap();onStart(selected);}}>
              Start {selected}× table! 🐼
            </button>
          </div>
        )}
        {!selected&&<div style={{textAlign:"center",fontSize:13,fontWeight:700,color:"#9ca3af",marginTop:4}}>Tap a table above to begin</div>}
      </div>
      <div style={{background:"white",borderRadius:16,padding:"12px 14px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
        <div style={{fontFamily:"'Boogaloo',cursive",fontSize:16,color:"#065F46",marginBottom:8}}>📊 Your Mastery</div>
        {tables.map(t=>{
          const m=mastery[t]||0;
          const pct=Math.round((m/20)*100);
          return(
            <div key={t} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
              <div style={{width:28,fontFamily:"'Boogaloo',cursive",fontSize:14,color:"#10B981"}}>{t}×</div>
              <div style={{flex:1,height:7,background:"#f3f4f6",borderRadius:99,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:pct===100?"#F6A800":"#10B981",borderRadius:99,transition:"width 0.5s"}}/>
              </div>
              <div style={{width:36,fontSize:10,fontWeight:800,color:"#6b7280",textAlign:"right"}}>{pct===100?"⭐":pct+"%"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const VISUAL_TYPES=["dot","line","array"];

function TimesTableQuiz({table,onBack,onDone,sounds,muted,toggleMute}){
  // Generate 20 questions: all 12 facts × some repeated, shuffled
  const buildQs=useCallback(()=>{
    const all=Array.from({length:12},(_,i)=>({a:table,b:i+1,answer:table*(i+1)}));
    const extra=Array.from({length:8},()=>all[Math.floor(Math.random()*12)]);
    return [...all,...extra].sort(()=>Math.random()-0.5).slice(0,TT_QUESTIONS_PER_SESSION).map((q,i)=>({
      ...q,
      visualType:VISUAL_TYPES[i%3],
      options:shuffle4(q.answer,table),
    }));
  },[table]);

  function shuffle4(correct,tbl){
    const wrongs=new Set();
    while(wrongs.size<3){
      const b=Math.floor(Math.random()*12)+1;
      const w=tbl*b;
      if(w!==correct)wrongs.add(w);
    }
    return [...wrongs,correct].sort(()=>Math.random()-0.5);
  }

  const [qs]=useState(buildQs);
  const [idx,setIdx]=useState(0);
  const [sel,setSel]=useState(null);
  const [score,setScore]=useState(0);
  const [done,setDone]=useState(false);
  const [confetti,setConfetti]=useState(false);
  const [streak,setStreak]=useState(0);
  const [showVisual,setShowVisual]=useState(true);

  const cur=qs[idx];
  const correct=sel===cur?.answer;

  const pick=(opt)=>{
    if(sel!==null)return;
    setSel(opt);
    if(opt===cur.answer){
      setScore(n=>n+1);setStreak(s=>s+1);
      setConfetti(true);setTimeout(()=>setConfetti(false),1200);sounds.correct();
    }else{setStreak(0);sounds.wrong();}
  };

  const next=()=>{
    sounds.tap();
    if(idx+1>=TT_QUESTIONS_PER_SESSION){onDone(score);setDone(true);}
    else{setIdx(i=>i+1);setSel(null);setShowVisual(true);}
  };

  if(done){
    const pct=score/TT_QUESTIONS_PER_SESSION;
    const stars=pct===1?3:pct>=0.6?2:pct>=0.3?1:0;
    const msgs=["Keep practising! 💪","Good try! 🌱","Great work! 🌟","Table master! 🏆"];
    return(
      <div>
        <div className="topbar">
          <button className="back-btn" onClick={()=>{sounds.tap();onBack();}}>← Tables</button>
          <div className="topbar-label" style={{color:"#10B981"}}>✖️ {table}× Table</div>
        </div>
        <div className="results">
          <Mascot type="panda" size={76} animate/>
          <div className="results-title" style={{color:"#10B981"}}>{table}× done!</div>
          <Stars count={stars} max={3} size={30}/>
          <div className="results-score" style={{color:"#10B981"}}>{score}/{TT_QUESTIONS_PER_SESSION}</div>
          <div className="results-msg">{msgs[stars]}</div>
          <div style={{background:"#F0FFF4",borderRadius:14,padding:"12px 16px",margin:"10px 0",textAlign:"left"}}>
            <div style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:"#065F46",marginBottom:8}}>📋 {table}× Table</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 16px"}}>
              {Array.from({length:12},(_,i)=>(
                <div key={i} style={{fontSize:13,fontWeight:700,color:"#065F46"}}>{table} × {i+1} = <strong style={{color:"#10B981"}}>{table*(i+1)}</strong></div>
              ))}
            </div>
          </div>
          <div className="results-btns">
            <button className="res-btn" style={{background:"#10B981"}} onClick={()=>{sounds.tap();onBack();}}>Try another! 🔄</button>
            <button className="res-btn" style={{background:"#6b7280"}} onClick={()=>{sounds.tap();onBack();}}>Home 🏠</button>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div>
      <Confetti active={confetti}/>
      <div className="topbar">
        <button className="back-btn" onClick={()=>{sounds.tap();onBack();}}>← Tables</button>
        <div className="topbar-label" style={{color:"#10B981"}}>✖️ {table}× Table</div>
        <div className="score-chip" style={{color:"#10B981"}}>{score} ⭐</div>
        <button className="icon-btn" onClick={toggleMute}>{muted?"🔇":"🔊"}</button>
      </div>
      <div className="prog-row">
        {Array.from({length:TT_QUESTIONS_PER_SESSION}).map((_,i)=>(
          <div key={i} className={`prog-dot ${i<idx?"done":i===idx?"active":""}`} style={i===idx?{background:"#10B981"}:{}}/>
        ))}
        <div className="prog-track"><div className="prog-fill" style={{width:`${(idx/TT_QUESTIONS_PER_SESSION)*100}%`,background:"#10B981"}}/></div>
        <span style={{fontSize:10,fontWeight:800,color:"#9ca3af"}}>{idx+1}/{TT_QUESTIONS_PER_SESSION}</span>
      </div>
      {streak>=3&&sel===null&&<div className="streak-banner">🔥 {streak} in a row! You're on fire!</div>}
      <div className="q-wrap" key={idx}>
        <div className="q-card" style={{borderColor:"#10B981"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:6}}>
            <Mascot type="panda" size={38} animate={sel!==null&&correct}/>
            <div style={{flex:1}}>
              <div style={{fontSize:9,fontWeight:800,color:"#9ca3af",letterSpacing:".06em",textTransform:"uppercase"}}>Question {idx+1} of {TT_QUESTIONS_PER_SESSION}</div>
              <div style={{fontFamily:"'Boogaloo',cursive",fontSize:clamp(18,5,26),color:"#065F46"}}>{table}× Table</div>
            </div>
            <button onClick={()=>setShowVisual(v=>!v)} style={{background:"#F0FFF4",border:"2px solid #10B981",borderRadius:10,padding:"5px 10px",fontSize:11,fontWeight:800,color:"#065F46",cursor:"pointer"}}>
              {showVisual?"Hide visual":"Show visual"}
            </button>
          </div>
          {showVisual&&sel===null&&<Visual a={Math.min(cur.a,8)} b={Math.min(cur.b,8)} type={cur.visualType}/>}
          {sel!==null&&correct&&<Visual a={Math.min(cur.a,8)} b={Math.min(cur.b,8)} type={cur.visualType}/>}
          <div style={{fontSize:clamp(22,6,32),fontWeight:900,color:"#111",margin:"10px 0 4px",textAlign:"center",fontFamily:"'Boogaloo',cursive"}}>
            {cur.a} × {cur.b} = ?
          </div>
          <div className="options">
            {cur.options.map(opt=>{
              let cls="opt opt-default";
              if(sel!==null){if(opt===cur.answer)cls="opt opt-correct";else if(opt===sel)cls="opt opt-wrong";}
              return<button key={opt} className={cls} disabled={sel!==null} onClick={()=>pick(opt)} style={sel===null?{borderColor:"#10B98166",fontSize:"clamp(16px,4vw,22px)",fontFamily:"'Boogaloo',cursive"}:{fontSize:"clamp(16px,4vw,22px)",fontFamily:"'Boogaloo',cursive"}}>{opt}</button>;
            })}
          </div>
          {sel!==null&&(
            <>
              <div className={`feedback ${correct?"fb-correct":"fb-wrong"}`}>
                {correct?`✅ ${cur.a} × ${cur.b} = ${cur.answer}! ${["Amazing!","Brilliant!","Nailed it!","Super!","Yes!"][Math.floor(Math.random()*5)]}`:`❌ ${cur.a} × ${cur.b} = ${cur.answer}`}
              </div>
              <button className="next-btn" style={{background:"#10B981"}} onClick={next}>
                {idx+1>=TT_QUESTIONS_PER_SESSION?"See my results! 🎉":"Next question →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// tiny helper used inline in TimesTableQuiz
function clamp(min,vw,max){return`clamp(${min}px,${vw}vw,${max}px)`;}

/* ─── Root ─────────────────────────────────────────────────────────────── */
export default function App(){
  const [screen,setScreen]=useState("home");
  const [subject,setSubject]=useState(null);
  const [ttTable,setTtTable]=useState(null); // which times table is active
  const [muted,setMuted]=useState(false);
  const [tab,setTab]=useState(0);
  const [toastQueue,setToastQueue]=useState([]);
  const [ttMastery,setTtMastery]=useState({}); // {2: bestScore, 3: bestScore, ...}
  const [progress,setProgress]=useState(()=>{const p={};SUBJECTS.forEach(s=>{p[s.id]={stars:0,best:0};});return p;});
  const [history,setHistory]=useState({total:0,perfectScores:0,bestStreak:0,improvements:0,spellPerfect:0,timesPerfect:0});
  const [earned,setEarned]=useState([]);

  const rawSounds=useRef(null);
  if(!rawSounds.current)rawSounds.current=createSounds();
  const sounds={
    tap:()=>{if(!muted)rawSounds.current.tap();},
    correct:()=>{if(!muted)rawSounds.current.correct();},
    wrong:()=>{if(!muted)rawSounds.current.wrong();},
    fanfare:()=>{if(!muted)rawSounds.current.fanfare();},
    badge:()=>{if(!muted)rawSounds.current.badge();},
  };

  const checkAchievements=(newProgress,newHistory,currentEarned)=>{
    return ACHIEVEMENTS.filter(a=>!currentEarned.includes(a.id)&&a.check(newProgress,newHistory));
  };

  const done=(score,streak)=>{
    const pct=score/TOTAL;
    const stars=pct===1?3:pct>=0.6?2:pct>=0.3?1:0;
    const oldBest=progress[subject]?.best||0;
    const newProgress={...progress,[subject]:{stars:Math.max(progress[subject].stars,stars),best:Math.max(oldBest,score)}};
    const newHistory={total:history.total+1,perfectScores:history.perfectScores+(score===TOTAL?1:0),bestStreak:Math.max(history.bestStreak,streak||0),improvements:history.improvements+(score>oldBest&&oldBest>0?1:0),spellPerfect:(history.spellPerfect||0)+(subject==="spelling"&&score===TOTAL?1:0),timesPerfect:history.timesPerfect||0};
    setProgress(newProgress);setHistory(newHistory);
    const newBadges=checkAchievements(newProgress,newHistory,earned);
    if(newBadges.length>0){
      const newEarned=[...earned,...newBadges.map(b=>b.id)];
      setEarned(newEarned);
      newBadges.forEach((b,i)=>{setTimeout(()=>{sounds.badge();setToastQueue(q=>[...q,b]);},i*3400);});
    }
  };

  const doneTimesTable=(score)=>{
    const oldBest=ttMastery[ttTable]||0;
    const newMastery={...ttMastery,[ttTable]:Math.max(oldBest,score)};
    setTtMastery(newMastery);
    const pct=score/TT_QUESTIONS_PER_SESSION;
    const stars=pct===1?3:pct>=0.6?2:pct>=0.3?1:0;
    const oldTimesProgress=progress.times||{stars:0,best:0};
    const newProgress={...progress,times:{stars:Math.max(oldTimesProgress.stars,stars),best:Math.max(oldTimesProgress.best,score)}};
    const newHistory={...history,total:history.total+1,timesPerfect:(history.timesPerfect||0)+(score===TT_QUESTIONS_PER_SESSION?1:0)};
    setProgress(newProgress);setHistory(newHistory);
    const newBadges=checkAchievements(newProgress,newHistory,earned);
    if(newBadges.length>0){
      const newEarned=[...earned,...newBadges.map(b=>b.id)];
      setEarned(newEarned);
      newBadges.forEach((b,i)=>{setTimeout(()=>{sounds.badge();setToastQueue(q=>[...q,b]);},i*3400);});
    }
  };

  return(
    <>
      <style>{CSS}</style>
      <JungleBg/>
      {toastQueue.length>0&&<BadgeToast badge={toastQueue[0]} onDone={()=>setToastQueue(q=>q.slice(1))}/>}
      <div className="app">
        {screen==="home"&&<Home progress={progress} history={history} earned={earned}
          onSelect={id=>{
            sounds.tap();
            if(id==="times"){setScreen("times-pick");setSubject("times");}
            else{setSubject(id);setScreen("quiz");}
          }}
          sounds={sounds} muted={muted} toggleMute={()=>setMuted(m=>!m)} tab={tab} setTab={setTab}/>}
        {screen==="quiz"&&subject&&<Quiz subjectId={subject} onBack={()=>{setScreen("home");setSubject(null);}} onDone={done} sounds={sounds} muted={muted} toggleMute={()=>setMuted(m=>!m)}/>}
        {screen==="times-pick"&&<TimesTablePicker
          onStart={t=>{setTtTable(t);setScreen("times-quiz");}}
          onBack={()=>{setScreen("home");setSubject(null);}}
          sounds={sounds} mastery={ttMastery}/>}
        {screen==="times-quiz"&&ttTable&&<TimesTableQuiz
          table={ttTable}
          onBack={()=>setScreen("times-pick")}
          onDone={doneTimesTable}
          sounds={sounds} muted={muted} toggleMute={()=>setMuted(m=>!m)}/>}
      </div>
    </>
  );
}
