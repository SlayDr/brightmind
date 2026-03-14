import { useState, useEffect, useCallback, useRef, Component } from "react";

class ErrorBoundary extends Component{
  constructor(p){super(p);this.state={err:null};}
  static getDerivedStateFromError(e){return{err:e};}
  componentDidCatch(e,info){console.error("BrightMind crash:",e,info);}
  render(){
    if(this.state.err)return(
      <div style={{padding:24,fontFamily:"sans-serif",maxWidth:400,margin:"40px auto",background:"#FEF2F2",borderRadius:16,border:"2px solid #EF4444"}}>
        <div style={{fontSize:24,marginBottom:8}}>⚠️ Oops!</div>
        <div style={{fontWeight:700,marginBottom:8,color:"#7F1D1D"}}>Something went wrong</div>
        <div style={{fontSize:13,color:"#991B1B",marginBottom:16,wordBreak:"break-all"}}>{this.state.err.message}</div>
        <button onClick={()=>this.setState({err:null})} style={{background:"#EF4444",color:"white",border:"none",borderRadius:10,padding:"10px 20px",fontWeight:700,cursor:"pointer"}}>Try again</button>
      </div>
    );
    return this.props.children;
  }
}

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
  { id:"science", label:"Science",     emoji:"🔬", mascot:"rabbit",  bg:"#F0FFFE", border:"#06B6D4", btn:"#06B6D4", dark:"#0e7490", desc:"Explore the world!"   },
  { id:"social",  label:"Social Studies",emoji:"🌍",mascot:"giraffe", bg:"#FFF8F0", border:"#F97316", btn:"#F97316", dark:"#c2410c", desc:"People & places!"     },
];

const TOTAL = 20;

const GROUPS = [
  { id:"literacy",  label:"Literacy",        emoji:"📚", color:"#4A9EE0", bg:"#E8F5FF", subjects:["english","reading","spelling","gaps"],           desc:"Reading, writing & words"   },
  { id:"numeracy",  label:"Numeracy",         emoji:"🔢", color:"#F6A800", bg:"#FFF3CD", subjects:["maths","quant","times"],                          desc:"Numbers, maths & patterns"  },
  { id:"language",  label:"Language & Logic", emoji:"💬", color:"#D45EBC", bg:"#FFF0FB", subjects:["verbal","spanish","cogat"],                        desc:"Thinking, logic & language" },
  { id:"science",   label:"Science & Nature", emoji:"🔬", color:"#06B6D4", bg:"#F0FFFE", subjects:["science"],                                         desc:"Explore the natural world"  },
  { id:"world",     label:"World & Society",  emoji:"🌍", color:"#F97316", bg:"#FFF8F0", subjects:["social"],                                          desc:"People, places & history"   },
];

/* ─── Difficulty / Grade Config ─────────────────────────────────────────── */
const DIFFICULTY = {
  easy:  { label:"Easy",   emoji:"🌱", grade:"Kindergarten",  color:"#34C76F", bg:"#EDFFF4", border:"#34C76F", desc:"Perfect starting point!" },
  medium:{ label:"Medium", emoji:"🌟", grade:"Grade 1–2",     color:"#F6A800", bg:"#FFFBEB", border:"#F6A800", desc:"A fun challenge!"         },
  hard:  { label:"Hard",   emoji:"🔥", grade:"Grade 3–4",     color:"#EF4444", bg:"#FEF2F2", border:"#EF4444", desc:"Show what you know!"      },
};

/* ─── Achievement Definitions ──────────────────────────────────────────── */
const ACHIEVEMENTS = [
  { id:"first_quiz",   icon:"🎯", label:"First Steps",     desc:"Complete your first quiz!",           check:(s,h)=>h.total>=1 },
  { id:"perfect",      icon:"💯", label:"Perfect Score!",  desc:"Get 20/20 on any quiz!",              check:(s,h)=>h.perfectScores>=1 },
  { id:"hat_trick",    icon:"🎩", label:"Hat Trick",       desc:"Get 3 stars on any subject!",         check:(s,h)=>Object.values(s).some(x=>x.stars===3) },
  { id:"all_subjects", icon:"🌍", label:"Explorer",        desc:"Try all 12 subjects!",                check:(s,h)=>Object.values(s).filter(x=>x.best>0).length===12 },
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
  { id:"science_star", icon:"🔬", label:"Science Whiz",    desc:"Score 15+ in Science!",                 check:(s,h)=>(s.science?.best||0)>=15 },
  { id:"social_star",  icon:"🌍", label:"World Explorer",  desc:"Score 15+ in Social Studies!",          check:(s,h)=>(s.social?.best||0)>=15 },
  { id:"all_stars",    icon:"🌟", label:"All-Star",        desc:"3 stars on ALL subjects!",              check:(s,h)=>Object.keys(s).length===12&&Object.values(s).every(x=>x.stars===3) },
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
  if(type==="rabbit")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}><ellipse cx="30"cy="18"rx="7"ry="18"fill="#e5e7eb"/><ellipse cx="50"cy="18"rx="7"ry="18"fill="#e5e7eb"/><ellipse cx="30"cy="18"rx="4"ry="14"fill="#f9a8d4"/><ellipse cx="50"cy="18"rx="4"ry="14"fill="#f9a8d4"/><circle cx="40"cy="44"r="22"fill="#f3f4f6"/><ellipse cx="32"cy="40"rx="5"ry="6"fill="#1a1a1a"/><ellipse cx="48"cy="40"rx="5"ry="6"fill="#1a1a1a"/><circle cx="32"cy="39"r="2"fill="white"/><circle cx="48"cy="39"r="2"fill="white"/><ellipse cx="40"cy="48"rx="5"ry="3"fill="#f9a8d4"/><path d="M35 50 Q40 55 45 50"stroke="#9ca3af"strokeWidth="1.5"fill="none"strokeLinecap="round"/><ellipse cx="19"cy="50"rx="9"ry="7"fill="#f3f4f6"/><ellipse cx="61"cy="50"rx="9"ry="7"fill="#f3f4f6"/></svg>;
  if(type==="giraffe")return<svg width={size}height={size}viewBox="0 0 80 80"className={cls}><rect x="35"y="4"width="10"height="32"rx="5"fill="#F59E0B"/><ellipse cx="40"cy="46"rx="18"ry="20"fill="#F59E0B"/>{[[35,4],[45,4]].map(([x,y],i)=><g key={i}><rect x={x-2}y={y-6}width="4"height="8"rx="2"fill="#92400E"/><circle cx={x}cy={y-6}r="3"fill="#92400E"/></g>)}<circle cx="40"cy="20"r="12"fill="#FBBF24"/><ellipse cx="34"cy="18"rx="4"ry="5"fill="#1a1a1a"/><ellipse cx="46"cy="18"rx="4"ry="5"fill="#1a1a1a"/><circle cx="34"cy="17"r="1.5"fill="white"/><circle cx="46"cy="17"r="1.5"fill="white"/><ellipse cx="40"cy="24"rx="4"ry="3"fill="#F97316"/><path d="M36 26 Q40 30 44 26"stroke="#92400E"strokeWidth="1.5"fill="none"strokeLinecap="round"/>{[[28,35],[38,30],[48,38],[32,45],[46,42]].map(([x,y],i)=><ellipse key={i}cx={x}cy={y}rx="4"ry="3"fill="#92400E"opacity="0.6"/>)}</svg>;
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
    // ── EASY (Kindergarten) ──
    {level:"easy",q:"What is 2 + 3?",options:["4","5","6","7"],answer:"5",hint:"Count on your fingers!"},
    {level:"easy",q:"What is 4 + 4?",options:["6","7","8","9"],answer:"8",hint:"Double 4 is 8!"},
    {level:"easy",q:"What is 6 + 3?",options:["8","9","10","7"],answer:"9",hint:"Start at 6 and count up 3."},
    {level:"easy",q:"How many sides does a square have?",options:["3","4","5","6"],answer:"4",hint:"Count the sides!"},
    {level:"easy",q:"Which shape has no corners?",options:["Square","Triangle","Circle","Rectangle"],answer:"Circle",hint:"A circle is perfectly round!"},
    {level:"easy",q:"Count by 2s: 2,4,6,8,__",options:["9","10","11","12"],answer:"10",hint:"Add 2 each time!"},
    {level:"easy",q:"There are 5 birds.\n3 more arrive. How many?",options:["6","7","8","9"],answer:"8",hint:"5 + 3 = ?"},
    {level:"easy",q:"What is double 4?",options:["6","7","8","9"],answer:"8",hint:"4 + 4 = ?"},
    {level:"easy",q:"How many days in a week?",options:["5","6","7","8"],answer:"7",hint:"Mon, Tue, Wed, Thu, Fri, Sat, Sun!"},
    {level:"easy",q:"A bag has 6 sweets.\nYou eat 2. How many left?",options:["2","3","4","5"],answer:"4",hint:"6 − 2 = ?"},
    // ── MEDIUM (Grade 1–2) ──
    {level:"medium",q:"What is 7 + 5?",options:["10","11","12","13"],answer:"12",hint:"7+3=10, then +2 more!"},
    {level:"medium",q:"What is 9 + 9?",options:["16","17","18","19"],answer:"18",hint:"Double 9 is 18!"},
    {level:"medium",q:"What is 15 − 6?",options:["7","8","9","10"],answer:"9",hint:"Count back 6 from 15."},
    {level:"medium",q:"What is 2 × 3?",options:["4","5","6","7"],answer:"6",hint:"2 groups of 3: 3+3=?"},
    {level:"medium",q:"What is 5 × 3?",options:["12","13","14","15"],answer:"15",hint:"Count by 5s: 5,10,15!"},
    {level:"medium",q:"What is half of 20?",options:["5","8","10","12"],answer:"10",hint:"Split 20 into 2 equal groups!"},
    {level:"medium",q:"Count by 5s: 5,10,15,__",options:["18","19","20","21"],answer:"20",hint:"Add 5 each time!"},
    {level:"medium",q:"How many minutes in an hour?",options:["30","45","60","100"],answer:"60",hint:"60 minutes = 1 hour!"},
    {level:"medium",q:"What is 10 more than 25?",options:["30","35","40","45"],answer:"35",hint:"Add 10 to 25!"},
    {level:"medium",q:"How many months in a year?",options:["10","11","12","13"],answer:"12",hint:"January through December!"},
    // ── HARD (Grade 3–4) ──
    {level:"hard",q:"What is 8 × 7?",options:["54","56","58","63"],answer:"56",hint:"8×7: think 8×5=40, 8×2=16, add!"},
    {level:"hard",q:"What is 144 ÷ 12?",options:["10","11","12","13"],answer:"12",hint:"12 × 12 = 144"},
    {level:"hard",q:"What is 25% of 80?",options:["15","20","25","30"],answer:"20",hint:"25% = ¼. What is 80 ÷ 4?"},
    {level:"hard",q:"A rectangle is 8cm × 5cm.\nWhat is its area?",options:["26cm²","36cm²","40cm²","45cm²"],answer:"40cm²",hint:"Area = length × width"},
    {level:"hard",q:"What is 3² + 4²?",options:["14","24","25","49"],answer:"25",hint:"3²=9, 4²=16, 9+16=?"},
    {level:"hard",q:"Round 347 to the nearest 10.",options:["340","345","350","400"],answer:"350",hint:"Look at the units digit: 7 rounds up!"},
    {level:"hard",q:"What is the next prime number after 7?",options:["8","9","10","11"],answer:"11",hint:"A prime has only 2 factors: 1 and itself!"},
    {level:"hard",q:"A train travels 60km/h.\nHow far in 2.5 hours?",options:["120km","130km","150km","160km"],answer:"150km",hint:"60 × 2.5 = 60×2 + 60×0.5"},
    {level:"hard",q:"What is ³⁄₄ + ¹⁄₂?",options:["1","1¼","1½","2"],answer:"1¼",hint:"Convert: ¾ + ²⁄₄ = ?"},
    {level:"hard",q:"What is the perimeter of a regular hexagon\nwith sides of 4cm?",options:["20cm","24cm","28cm","32cm"],answer:"24cm",hint:"Hexagon has 6 sides: 6 × 4 = ?"},
  ],

  english:[
    // ── EASY (Kindergarten) ──
    {level:"easy",q:"Which word rhymes with 'cat'?",options:["dog","car","mat","cup"],answer:"mat",hint:"Cat... mat... both end in -at!"},
    {level:"easy",q:"What letter does 'apple' start with?",options:["B","A","E","O"],answer:"A",hint:"A is for Apple!"},
    {level:"easy",q:"Which word is an animal?",options:["jump","blue","dog","run"],answer:"dog",hint:"An animal is a living creature!"},
    {level:"easy",q:"What punctuation ends a sentence?",options:[",",".","?","!"],answer:".",hint:"Sentences end with a full stop!"},
    {level:"easy",q:"Which word rhymes with 'big'?",options:["bat","pig","run","cat"],answer:"pig",hint:"Big... pig... both end in -ig!"},
    {level:"easy",q:"How many letters in 'cat'?",options:["2","3","4","5"],answer:"3",hint:"C-A-T — count them!"},
    {level:"easy",q:"Which word names a colour?",options:["jump","red","swim","fast"],answer:"red",hint:"Colours describe how things look!"},
    {level:"easy",q:"Which word is a number?",options:["dog","run","five","hot"],answer:"five",hint:"Numbers count things!"},
    {level:"easy",q:"What sound does 'sh' make?\n(as in ship)",options:["s sound","ch sound","sh sound","th sound"],answer:"sh sound",hint:"Ship, shop, shell — all start with sh!"},
    {level:"easy",q:"Which is a fruit?",options:["carrot","potato","apple","onion"],answer:"apple",hint:"Fruits are sweet and grow on trees!"},
    // ── MEDIUM (Grade 1–2) ──
    {level:"medium",q:"Which word is a noun?",options:["jump","blue","table","quickly"],answer:"table",hint:"A noun is a thing you can touch!"},
    {level:"medium",q:"Which word is a verb?",options:["house","blue","swim","tree"],answer:"swim",hint:"A verb is something you DO!"},
    {level:"medium",q:"Which word is an adjective?",options:["jump","fluffy","cat","run"],answer:"fluffy",hint:"An adjective describes a noun!"},
    {level:"medium",q:"Which sentence is correct?",options:["the cat sat.","The cat sat.","The Cat sat","the cat Sat."],answer:"The cat sat.",hint:"Start with capital, end with full stop!"},
    {level:"medium",q:"What does 'enormous' mean?",options:["Very small","Very fast","Very big","Very loud"],answer:"Very big",hint:"Enormous means really, really big!"},
    {level:"medium",q:"Which word means the same as 'happy'?",options:["sad","angry","joyful","tired"],answer:"joyful",hint:"Joyful = full of joy = happy!"},
    {level:"medium",q:"Which word is the opposite of 'fast'?",options:["quick","slow","speed","run"],answer:"slow",hint:"Fast and slow are opposites!"},
    {level:"medium",q:"Which word is a pronoun?",options:["dog","run","she","blue"],answer:"she",hint:"She, he, it, they replace names!"},
    {level:"medium",q:"How many syllables in 'elephant'?",options:["1","2","3","4"],answer:"3",hint:"El-e-phant = 3 claps!"},
    {level:"medium",q:"Which uses apostrophe correctly?",options:["the dogs bone","the dog's bone","the dogs' bone","the dogs bone'"],answer:"the dog's bone",hint:"The bone belongs to the dog!"},
    // ── HARD (Grade 3–4) ──
    {level:"hard",q:"Which sentence uses a semicolon correctly?",options:["I like cats; and dogs.","I like cats; they are friendly.","I like; cats and dogs.","I; like cats and dogs."],answer:"I like cats; they are friendly.",hint:"A semicolon joins two related complete sentences!"},
    {level:"hard",q:"What is the plural of 'cactus'?",options:["cactuses","cactuss","cacti","cactis"],answer:"cacti",hint:"Latin origin words often use -i for plural!"},
    {level:"hard",q:"Which word is a conjunction?",options:["quickly","beautiful","although","jumped"],answer:"although",hint:"Conjunctions join clauses — although, because, since..."},
    {level:"hard",q:"What is an antonym of 'benevolent'?",options:["kind","generous","malevolent","helpful"],answer:"malevolent",hint:"Benevolent = kind. Its opposite starts with mal-!"},
    {level:"hard",q:"Which is a compound sentence?",options:["The dog ran.","Because it rained.","I like dogs and I have two.","Running fast."],answer:"I like dogs and I have two.",hint:"A compound sentence has two independent clauses joined by a conjunction!"},
    {level:"hard",q:"What does the prefix 'mis-' mean?",options:["again","not","wrongly","before"],answer:"wrongly",hint:"Misbehave, misread, mistake — all mean doing something wrongly!"},
    {level:"hard",q:"Which sentence is in the passive voice?",options:["The cat ate the fish.","The fish was eaten by the cat.","The cat is eating.","Cats eat fish."],answer:"The fish was eaten by the cat.",hint:"Passive: the subject receives the action!"},
    {level:"hard",q:"What is an 'oxymoron'?",options:["A very long word","Two contradictory words together","A word that sounds like its meaning","A word borrowed from another language"],answer:"Two contradictory words together",hint:"'Deafening silence' and 'bitter sweet' are oxymorons!"},
    {level:"hard",q:"Which word is spelled correctly?",options:["recieve","neice","achieve","beleive"],answer:"achieve",hint:"i before e except after c — ach-i-e-ve!"},
    {level:"hard",q:"What literary device is used in:\n'The wind whispered through the trees'?",options:["Simile","Metaphor","Personification","Alliteration"],answer:"Personification",hint:"Giving human qualities (whispered) to non-human things!"},
  ],

  reading:[
    // ── EASY (Kindergarten) ──
    {level:"easy",passage:"Lily loves the rain. She puts on her yellow boots and splashes in puddles. Her dog Max jumps in too! They both get very wet but they are very happy.",q:"What colour are Lily's boots?",options:["Red","Blue","Yellow","Green"],answer:"Yellow",hint:"Read the second sentence!"},
    {level:"easy",passage:"Tom found a tiny seed in the garden. He planted it in the soil and watered it every day. After two weeks, a small green shoot appeared. Tom was so excited!",q:"How did Tom feel when the shoot appeared?",options:["Sad","Excited","Tired","Angry"],answer:"Excited",hint:"Look at the last sentence!"},
    {level:"easy",passage:"Mia has three pets: a fluffy rabbit called Snowball, a goldfish called Bubbles, and a parrot named Polly. Polly can say 'hello' and 'goodnight'. Mia feeds them every morning.",q:"Which pet can talk?",options:["Snowball","Bubbles","Polly","All of them"],answer:"Polly",hint:"Which animal is known for talking?"},
    {level:"easy",passage:"Every morning, Rosa helped her grandmother make breakfast. They made toast with butter and a big pot of tea. Rosa liked this time because her grandmother told her funny stories.",q:"Why did Rosa like breakfast time?",options:["The food was yummy","She got to watch TV","Her grandmother told funny stories","She could sleep in"],answer:"Her grandmother told funny stories",hint:"Look at the last sentence!"},
    {level:"easy",passage:"Maya wanted to make a card for her mum's birthday. She got out glitter, stickers, coloured paper and felt-tip pens. She spent an hour cutting and sticking.",q:"Why did Maya make the card?",options:["For Christmas","For her teacher","For her mum's birthday","For a school project"],answer:"For her mum's birthday",hint:"Read the first sentence!"},
    // ── MEDIUM (Grade 1–2) ──
    {level:"medium",passage:"The library is a quiet place. People go there to read books and learn new things. You must whisper so you don't disturb others. Sam loves visiting every Saturday.",q:"Why must you whisper in the library?",options:["It is dark","The librarian says so","To not disturb others","Books are fragile"],answer:"To not disturb others",hint:"The passage explains the reason!"},
    {level:"medium",passage:"Jack loved space. He had posters of planets on his walls and could name all eight of them. His favourite was Saturn because of its beautiful rings. He wanted to be an astronaut one day.",q:"What was Jack's favourite planet?",options:["Jupiter","Mars","Saturn","Earth"],answer:"Saturn",hint:"Find the sentence with 'favourite'!"},
    {level:"medium",passage:"Jack loved space. He had posters of planets on his walls and could name all eight of them. His favourite was Saturn because of its beautiful rings. He wanted to be an astronaut one day.",q:"What did Jack want to be?",options:["A scientist","A pilot","An astronaut","A teacher"],answer:"An astronaut",hint:"Look at the last sentence!"},
    {level:"medium",passage:"The old lighthouse stood on a rocky cliff. Every night its light flashed to warn ships of the dangerous rocks below. Without it, many ships might have crashed.",q:"Why did the lighthouse flash its light?",options:["To look pretty","To wake people up","To warn ships of rocks","To attract fish"],answer:"To warn ships of rocks",hint:"Read the second sentence!"},
    {level:"medium",passage:"Penguins cannot fly but they are excellent swimmers. They use their wings as flippers to zoom through the water. A penguin can swim as fast as 25 kilometres per hour!",q:"What do penguins use as flippers?",options:["Their feet","Their tails","Their wings","Their beaks"],answer:"Their wings",hint:"Read the second sentence!"},
    {level:"medium",passage:"The sun was setting and the sky turned orange and pink. Birds flew home to their nests. The flowers closed their petals. It was the end of a perfect day.",q:"What happened to the flowers?",options:["They grew taller","They closed their petals","They changed colour","They fell off"],answer:"They closed their petals",hint:"Find the sentence about flowers!"},
    // ── HARD (Grade 3–4) ──
    {level:"hard",passage:"The giant tortoise is one of the longest-living animals on Earth. Some tortoises have lived for over 150 years! They move very slowly and eat plants. Scientists believe their slow metabolism is key to their long lives.",q:"Why do scientists think tortoises live so long?",options:["They eat plants","They move slowly","Their slow metabolism","They live on islands"],answer:"Their slow metabolism",hint:"Find the sentence about what scientists believe!"},
    {level:"hard",passage:"In 1969, astronaut Neil Armstrong became the first human to walk on the moon. He described the surface as 'magnificent desolation'. The mission, called Apollo 11, lasted eight days in total.",q:"What did Armstrong call the moon's surface?",options:["Beautiful wilderness","Magnificent desolation","Lunar paradise","Silent emptiness"],answer:"Magnificent desolation",hint:"Find his direct quote in the passage!"},
    {level:"hard",passage:"Bees communicate by dancing. The 'waggle dance' tells other bees the direction and distance of flowers. The longer the waggle, the farther away the flowers are. Scientists spent decades decoding this language.",q:"What does the length of the waggle tell other bees?",options:["The type of flower","The direction of flowers","How far the flowers are","How many flowers there are"],answer:"How far the flowers are",hint:"Read the sentence about the 'longer the waggle'!"},
    {level:"hard",passage:"The Amazon rainforest produces about 20% of the world's oxygen and is home to 10% of all species on Earth. Despite covering only 5% of Earth's surface, it plays a critical role in regulating the global climate.",q:"What percentage of the world's oxygen does the Amazon produce?",options:["5%","10%","15%","20%"],answer:"20%",hint:"Find the statistic about oxygen in the first sentence!"},
  ],

  verbal:[
    // ── EASY (Kindergarten) ──
    {level:"easy",q:"Which word doesn't belong?\n🍎 Apple  🍌 Banana  🥕 Carrot  🍇 Grape",options:["Apple","Banana","Carrot","Grape"],answer:"Carrot",hint:"Three are fruits. One is a vegetable!"},
    {level:"easy",q:"Which word doesn't belong?\n🐶 Dog  🐱 Cat  🐟 Fish  🌹 Rose",options:["Dog","Cat","Fish","Rose"],answer:"Rose",hint:"Three are animals. One is a plant!"},
    {level:"easy",q:"Cat is to kitten as\ndog is to...?",options:["kennel","puppy","bark","leash"],answer:"puppy",hint:"A baby cat is a kitten. A baby dog is...?"},
    {level:"easy",q:"What comes next?\nMonday, Tuesday, Wednesday, __",options:["Friday","Saturday","Thursday","Sunday"],answer:"Thursday",hint:"Days of the week in order!"},
    {level:"easy",q:"Eye is to see as\near is to...?",options:["smell","taste","hear","touch"],answer:"hear",hint:"Eyes see. Ears...?"},
    {level:"easy",q:"Which word goes with\n'shoes, boots, sandals'?",options:["hat","gloves","trainers","scarf"],answer:"trainers",hint:"All worn on your FEET!"},
    {level:"easy",q:"Hot is to cold as\nfast is to...?",options:["quick","speed","slow","run"],answer:"slow",hint:"Opposites! Hot↔cold, fast↔?"},
    // ── MEDIUM (Grade 1–2) ──
    {level:"medium",q:"Which word doesn't belong?\n⚽ Football  🎾 Tennis  🏊 Swimming  🏀 Basketball",options:["Football","Tennis","Swimming","Basketball"],answer:"Swimming",hint:"Three use a ball. One doesn't!"},
    {level:"medium",q:"Sun is to day as\nmoon is to...?",options:["sky","star","night","cloud"],answer:"night",hint:"The sun is out in the day. The moon is out at..."},
    {level:"medium",q:"Bird is to nest as\nbee is to...?",options:["flower","honey","hive","wing"],answer:"hive",hint:"A bird lives in a nest. A bee lives in a..."},
    {level:"medium",q:"What comes next?\nSpring, Summer, Autumn, __",options:["January","Winter","Monday","Morning"],answer:"Winter",hint:"The four seasons in order!"},
    {level:"medium",q:"Sam is taller than Ella.\nElla is taller than Ben.\nWho is shortest?",options:["Sam","Ella","Ben","They're the same"],answer:"Ben",hint:"Sam > Ella > Ben. Who's last?"},
    {level:"medium",q:"Which word means the same as 'brave'?",options:["scared","funny","courageous","clumsy"],answer:"courageous",hint:"Brave = courageous!"},
    {level:"medium",q:"Doctor is to hospital as\nteacher is to...?",options:["office","library","school","home"],answer:"school",hint:"Where does a teacher work?"},
    {level:"medium",q:"Cow is to milk as\nhen is to...?",options:["wool","meat","eggs","feathers"],answer:"eggs",hint:"A cow gives milk. A hen gives...?"},
    // ── HARD (Grade 3–4) ──
    {level:"hard",q:"Which word doesn't belong?\nNovella  Biography  Autobiography  Memoir",options:["Novella","Biography","Autobiography","Memoir"],answer:"Novella",hint:"Three are types of non-fiction. One is fiction!"},
    {level:"hard",q:"Architect is to building as\nchoreographer is to...?",options:["music","dance","theatre","painting"],answer:"dance",hint:"An architect designs buildings. A choreographer designs...?"},
    {level:"hard",q:"Which is the odd one out?\nTriangle  Pentagon  Hexagon  Oval",options:["Triangle","Pentagon","Hexagon","Oval"],answer:"Oval",hint:"Three have straight sides and angles. One is curved!"},
    {level:"hard",q:"If all Bloops are Razzles,\nand all Razzles are Lazzles,\nare all Bloops definitely Lazzles?",options:["Yes","No","Sometimes","Can't tell"],answer:"Yes",hint:"If A=B and B=C, then A=C! Logical chain!"},
    {level:"hard",q:"Optimist is to pessimist as\ngenerous is to...?",options:["kind","stingy","wealthy","honest"],answer:"stingy",hint:"Optimist and pessimist are opposites. What's the opposite of generous?"},
    {level:"hard",q:"What comes next?\n1, 1, 2, 3, 5, 8, __",options:["11","12","13","14"],answer:"13",hint:"Each number is the sum of the two before it! (Fibonacci)"},
  ],

  /* ── QUANTITATIVE REASONING ─────────────────────────────────────────── */
  quant:[
    // ── EASY (Kindergarten) ──
    {level:"easy",q:"What comes next?\n2, 4, 6, 8, __",options:["9","10","11","12"],answer:"10",hint:"Add 2 each time! ➕"},
    {level:"easy",q:"What comes next?\n5, 10, 15, 20, __",options:["22","24","25","30"],answer:"25",hint:"Count by 5s!"},
    {level:"easy",q:"🔲 + 3 = 7\nWhat is 🔲?",options:["2","3","4","5"],answer:"4",hint:"What number plus 3 equals 7?"},
    {level:"easy",q:"How many corners does\na triangle have?",options:["2","3","4","5"],answer:"3",hint:"Tri means three!"},
    {level:"easy",q:"Which number is both\ngreater than 5\nand less than 9?",options:["4","5","7","9"],answer:"7",hint:"Greater than 5 AND less than 9!"},
    {level:"easy",q:"If 🍎=3 and 🍌=2,\nwhat is 🍎+🍎+🍌?",options:["6","7","8","9"],answer:"8",hint:"3+3+2=?"},
    {level:"easy",q:"What comes next?\n1, 3, 5, 7, __",options:["8","9","10","11"],answer:"9",hint:"Add 2 each time — odd numbers!"},
    // ── MEDIUM (Grade 1–2) ──
    {level:"medium",q:"What comes next?\n3, 6, 9, 12, __",options:["13","14","15","16"],answer:"15",hint:"Count by 3s!"},
    {level:"medium",q:"What comes next?\n100, 90, 80, 70, __",options:["50","55","60","65"],answer:"60",hint:"Count backwards by 10!"},
    {level:"medium",q:"🔲 × 2 = 10\nWhat is 🔲?",options:["3","4","5","6"],answer:"5",hint:"What number times 2 equals 10?"},
    {level:"medium",q:"12 ÷ 🔲 = 4\nWhat is 🔲?",options:["2","3","4","5"],answer:"3",hint:"12 divided by what equals 4?"},
    {level:"medium",q:"There are 4 boxes.\nEach has 3 balls.\nHow many balls total?",options:["7","10","12","14"],answer:"12",hint:"4 groups of 3: 3+3+3+3=?"},
    {level:"medium",q:"What fraction of this shape\nis shaded?\n⬛⬜⬜⬜",options:["1/2","1/3","1/4","1/5"],answer:"1/4",hint:"1 square out of 4 total = 1/4!"},
    {level:"medium",q:"🔲 + 🔲 = 14\nWhat is 🔲?",options:["5","6","7","8"],answer:"7",hint:"A number plus itself equals 14. Half of 14?"},
    // ── HARD (Grade 3–4) ──
    {level:"hard",q:"What comes next?\n1, 2, 4, 8, __",options:["10","12","16","18"],answer:"16",hint:"Each number is doubled!"},
    {level:"hard",q:"What comes next?\n1, 4, 9, 16, __",options:["20","22","25","28"],answer:"25",hint:"1×1=1, 2×2=4, 3×3=9, 4×4=16, 5×5=?"},
    {level:"hard",q:"What comes next?\n2, 6, 18, 54, __",options:["108","126","162","180"],answer:"162",hint:"Multiply by 3 each time!"},
    {level:"hard",q:"3 + 🔲 = 3 × 4\nWhat is 🔲?",options:["6","7","8","9"],answer:"9",hint:"First find 3×4, then subtract 3!"},
    {level:"hard",q:"If ⭐=5 and 🌙=2,\nwhat is ⭐×🌙?",options:["7","8","10","12"],answer:"10",hint:"5×2=?"},
    {level:"hard",q:"A snail moves 3cm\nevery minute.\nHow far in 4 minutes?",options:["7cm","10cm","12cm","15cm"],answer:"12cm",hint:"3×4=?"},
    {level:"hard",q:"A number is between 10 and 20.\nIt is even.\nIt has a 4 in it.\nWhat is it?",options:["12","14","16","18"],answer:"14",hint:"Even numbers between 10-20 with a 4: 14!"},
  ],

  /* ── SPANISH ─────────────────────────────────────────────────────────── */
  spanish:[
    // ── EASY (Kindergarten) ──
    {level:"easy",q:"How do you say 'Hello' in Spanish? 👋",options:["Adiós","Hola","Gracias","Por favor"],answer:"Hola",hint:"Hola sounds like 'Oh-la'!"},
    {level:"easy",q:"How do you say 'Yes' in Spanish?",options:["No","Sí","Hola","Bien"],answer:"Sí",hint:"Sí sounds just like 'see'!"},
    {level:"easy",q:"How do you say '1' in Spanish?",options:["Dos","Tres","Uno","Cuatro"],answer:"Uno",hint:"Uno — like the card game!"},
    {level:"easy",q:"How do you say 'Cat' in Spanish? 🐱",options:["Perro","Gato","Pájaro","Pez"],answer:"Gato",hint:"Gato sounds like 'Gah-toe'!"},
    {level:"easy",q:"How do you say 'Red' in Spanish? 🔴",options:["Azul","Verde","Rojo","Amarillo"],answer:"Rojo",hint:"Rojo sounds like 'Ro-ho'!"},
    {level:"easy",q:"How do you say 'Thank you' in Spanish?",options:["De nada","Por favor","Hola","Gracias"],answer:"Gracias",hint:"Gracias sounds like 'Gra-see-as'!"},
    {level:"easy",q:"How do you say 'Dog' in Spanish? 🐶",options:["Gato","Pájaro","Perro","Caballo"],answer:"Perro",hint:"Perro sounds like 'Peh-ro'!"},
    // ── MEDIUM (Grade 1–2) ──
    {level:"medium",q:"How do you say 'Goodbye' in Spanish?",options:["Hola","Buenas","Adiós","Gracias"],answer:"Adiós",hint:"Adiós sounds like 'Ad-ee-os'!"},
    {level:"medium",q:"How do you say '5' in Spanish?",options:["Cuatro","Cinco","Seis","Siete"],answer:"Cinco",hint:"Cinco sounds like 'Seen-co'!"},
    {level:"medium",q:"How do you say 'Blue' in Spanish? 🔵",options:["Rojo","Azul","Verde","Negro"],answer:"Azul",hint:"Azul sounds like 'Ah-zool'!"},
    {level:"medium",q:"How do you say 'Apple' in Spanish? 🍎",options:["Naranja","Manzana","Plátano","Uva"],answer:"Manzana",hint:"Manzana sounds like 'Man-sah-na'!"},
    {level:"medium",q:"How do you say 'Mother' in Spanish? 👩",options:["Padre","Hermano","Madre","Abuela"],answer:"Madre",hint:"Madre sounds like 'Mah-dray'!"},
    {level:"medium",q:"What does '¿Cómo te llamas?' mean?",options:["How are you?","What is your name?","Where do you live?","How old are you?"],answer:"What is your name?",hint:"Llamas comes from llamarse = to be called!"},
    {level:"medium",q:"How do you say 'Water' in Spanish? 💧",options:["Leche","Jugo","Agua","Pan"],answer:"Agua",hint:"Agua sounds like 'Ah-gwa'!"},
    // ── HARD (Grade 3–4) ──
    {level:"hard",q:"How do you say '10' in Spanish?",options:["Ocho","Nueve","Diez","Once"],answer:"Diez",hint:"Diez sounds like 'dee-eth'!"},
    {level:"hard",q:"What does 'Me llamo...' mean?",options:["I live in...","I am... years old","My name is...","I like..."],answer:"My name is...",hint:"Me llamo = I call myself!"},
    {level:"hard",q:"What does '¿Cómo estás?' mean?",options:["What is your name?","How old are you?","How are you?","Where are you?"],answer:"How are you?",hint:"Estás comes from estar = to be!"},
    {level:"hard",q:"How do you say 'Father' in Spanish? 👨",options:["Madre","Padre","Hermana","Abuelo"],answer:"Padre",hint:"Padre sounds like 'Pah-dray'!"},
    {level:"hard",q:"What does 'Me gusta' mean?",options:["I don't like","I like","I want","I have"],answer:"I like",hint:"Me gusta = it pleases me = I like!"},
    {level:"hard",q:"How do you say 'Green' in Spanish? 🟢",options:["Rojo","Azul","Verde","Blanco"],answer:"Verde",hint:"Verde sounds like 'Vair-day'!"},
    {level:"hard",q:"What does 'Muy bien' mean?",options:["Very bad","Very big","Very well","Very small"],answer:"Very well",hint:"Bien means good/well, muy means very!"},
  ],

  /* ── CogAT ───────────────────────────────────────────────────────────── */
  cogat:[
    // === VERBAL BATTERY (Easy) ===
    {level:"easy",type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nA bird uses its wings to ___.",options:["swim","dig","fly","bark"],answer:"fly",hint:"What do birds do with their wings?"},
    {level:"easy",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nPuppy is to dog as\nkitten is to ___.",options:["lion","rabbit","cat","tiger"],answer:"cat",hint:"A puppy grows into a dog. A kitten grows into a...?"},
    {level:"easy",type:"CogAT Verbal",q:"VERBAL CLASSIFICATION:\nWhich word belongs with\n'rose, tulip, daisy'?",options:["oak","sunflower","grass","fern"],answer:"sunflower",hint:"Rose, tulip, daisy are all...?"},
    {level:"easy",type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nWe put on our coats because\nit was very ___.",options:["hot","sunny","cold","bright"],answer:"cold",hint:"Why do you wear a coat?"},
    // === VERBAL BATTERY (Medium) ===
    {level:"medium",type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nThe boy was very tired so he went to ___.",options:["school","bed","swim","run"],answer:"bed",hint:"When you are very tired, what do you do?"},
    {level:"medium",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nFish is to water as\nbird is to ___.",options:["nest","worm","air","feather"],answer:"air",hint:"Fish lives in water. Bird lives in/flies through...?"},
    {level:"medium",type:"CogAT Verbal",q:"VERBAL CLASSIFICATION:\nWhich word belongs with\n'happy, joyful, cheerful'?",options:["sad","angry","delighted","tired"],answer:"delighted",hint:"Happy, joyful, cheerful all mean feeling...?"},
    {level:"medium",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nLibrary is to books as\nmuseum is to ___.",options:["paintings","music","food","sport"],answer:"paintings",hint:"A library contains books. A museum contains...?"},
    // === VERBAL BATTERY (Hard) ===
    {level:"hard",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nHot is to cold as\nday is to ___.",options:["sun","bright","night","morning"],answer:"night",hint:"Hot and cold are opposites. Day and ___ are opposites!"},
    {level:"hard",type:"CogAT Verbal",q:"VERBAL CLASSIFICATION:\nWhich word belongs with\n'hammer, saw, drill'?",options:["spoon","wrench","plate","cup"],answer:"wrench",hint:"Hammer, saw, drill are all...?"},
    // === QUANTITATIVE BATTERY (Easy) ===
    {level:"easy",type:"CogAT Quantitative",q:"NUMBER SERIES:\n2, 4, 6, 8, 10, __",options:["11","12","13","14"],answer:"12",hint:"Add 2 each time!"},
    {level:"easy",type:"CogAT Quantitative",q:"NUMBER SERIES:\n3, 6, 9, 12, __",options:["13","14","15","16"],answer:"15",hint:"Count by 3s!"},
    {level:"easy",type:"CogAT Quantitative",q:"NUMBER PUZZLES:\nIf 🍎 + 🍎 = 10,\nwhat does 🍎 equal?",options:["3","4","5","6"],answer:"5",hint:"Half of 10 is...?"},
    // === QUANTITATIVE BATTERY (Medium) ===
    {level:"medium",type:"CogAT Quantitative",q:"NUMBER SERIES:\n1, 2, 4, 7, 11, __",options:["14","15","16","17"],answer:"16",hint:"Add 1, then 2, then 3, then 4, then 5!"},
    {level:"medium",type:"CogAT Quantitative",q:"NUMBER PUZZLES:\nIf 🌟 × 3 = 15,\nwhat does 🌟 equal?",options:["3","4","5","6"],answer:"5",hint:"What times 3 equals 15?"},
    {level:"medium",type:"CogAT Quantitative",q:"EQUATION BUILDING:\nWhich makes this TRUE?\n5 __ 3 = 8",options:["×","÷","−","+"],answer:"+",hint:"5 plus 3 equals 8!"},
    {level:"medium",type:"CogAT Quantitative",q:"NUMBER SERIES:\n20, 17, 14, 11, __",options:["7","8","9","10"],answer:"8",hint:"Subtract 3 each time!"},
    // === QUANTITATIVE BATTERY (Hard) ===
    {level:"hard",type:"CogAT Quantitative",q:"NUMBER PUZZLES:\n🔲 + 4 = 2 × 6\nWhat is 🔲?",options:["6","7","8","9"],answer:"8",hint:"First find 2×6=12, then 12−4=?"},
    {level:"hard",type:"CogAT Quantitative",q:"EQUATION BUILDING:\nWhich makes this TRUE?\n10 __ 2 = 5",options:["+","−","×","÷"],answer:"÷",hint:"10 divided by 2 equals 5!"},
    {level:"hard",type:"CogAT Quantitative",q:"NUMBER PUZZLES:\nIf ▲ + ▲ + ▲ = 12,\nwhat does ▲ equal?",options:["3","4","5","6"],answer:"4",hint:"3 triangles equal 12. 12 ÷ 3 = ?"},
    // === NON-VERBAL BATTERY (Easy) ===
    {level:"easy",type:"CogAT Non-Verbal",q:"PATTERN REASONING:\n🔴🔵🔴🔵🔴 __",options:["🔴","🔵","🟢","🟡"],answer:"🔵",hint:"Red, blue, red, blue... what's next?"},
    {level:"easy",type:"CogAT Non-Verbal",q:"FIGURE CLASSIFICATION:\nWhich shape belongs with\n🔺 🔺 🔺 (triangles)?",options:["⬛ Square","⭕ Circle","🔻 Triangle","💎 Diamond"],answer:"🔻 Triangle",hint:"Find the shape that matches the group!"},
    {level:"easy",type:"CogAT Non-Verbal",q:"SPATIAL REASONING:\nHow many small squares make\none big 2×2 square?",options:["2","3","4","6"],answer:"4",hint:"2 rows × 2 columns = ?"},
    // === NON-VERBAL BATTERY (Medium) ===
    {level:"medium",type:"CogAT Non-Verbal",q:"PATTERN REASONING:\n⭐⭐🌙⭐⭐🌙 __",options:["🌙","⭐","☀️","💫"],answer:"⭐",hint:"Star, star, moon, star, star, moon, ...?"},
    {level:"medium",type:"CogAT Non-Verbal",q:"PAPER FOLDING:\nA square paper is folded in half.\nHow many layers are there?",options:["1","2","3","4"],answer:"2",hint:"Fold once = 2 layers!"},
    {level:"medium",type:"CogAT Non-Verbal",q:"FIGURE CLASSIFICATION:\nWhich has EXACTLY 4 sides?",options:["Triangle","Circle","Rectangle","Pentagon"],answer:"Rectangle",hint:"Count the sides of each shape!"},
    // === NON-VERBAL BATTERY (Hard) ===
    {level:"hard",type:"CogAT Non-Verbal",q:"FIGURE MATRICES:\nBig → Small :: Dark → ___",options:["Bigger","Darker","Light","Heavy"],answer:"Light",hint:"Big and small are opposites. Dark and ___ are opposites!"},
    {level:"hard",type:"CogAT Non-Verbal",q:"PAPER FOLDING:\nA square is folded in half TWICE.\nHow many layers?",options:["2","3","4","5"],answer:"4",hint:"Fold once=2, fold again=4!"},
    {level:"hard",type:"CogAT Non-Verbal",q:"FIGURE MATRICES:\nIf 🔺 rotated = 🔻,\nwhat does ➡️ rotated become?",options:["⬆️","⬇️","⬅️","↗️"],answer:"⬇️",hint:"Rotating 90° clockwise: right arrow points down!"},
  ],

  /* ── SPELLING ────────────────────────────────────────────────────────── */
  spelling:[
    // ── EASY (Kindergarten) ──
    {level:"easy",word:"cat",q:"Which is the correct spelling?",options:["kat","cat","cet","cot"],answer:"cat",hint:"c-a-t"},
    {level:"easy",word:"dog",q:"Which is the correct spelling?",options:["dag","dug","dog","dof"],answer:"dog",hint:"d-o-g"},
    {level:"easy",word:"run",q:"Which is the correct spelling?",options:["rnn","ran","ren","run"],answer:"run",hint:"r-u-n"},
    {level:"easy",word:"big",q:"Which is the correct spelling?",options:["bag","bug","beg","big"],answer:"big",hint:"b-i-g"},
    {level:"easy",word:"sun",q:"Which is the correct spelling?",options:["san","son","sun","sin"],answer:"sun",hint:"s-u-n"},
    {level:"easy",word:"red",q:"Which is the correct spelling?",options:["rad","rid","rod","red"],answer:"red",hint:"r-e-d"},
    {level:"easy",word:"hop",q:"Which is the correct spelling?",options:["hap","hep","hip","hop"],answer:"hop",hint:"h-o-p"},
    // ── MEDIUM (Grade 1–2) ──
    {level:"medium",word:"because",q:"Which is the correct spelling?",options:["becaus","because","becorse","becuase"],answer:"because",hint:"b-e-c-a-u-s-e"},
    {level:"medium",word:"people",q:"Which is the correct spelling?",options:["peopel","peeple","people","peaple"],answer:"people",hint:"p-e-o-p-l-e"},
    {level:"medium",word:"again",q:"Which is the correct spelling?",options:["agen","agian","agin","again"],answer:"again",hint:"a-g-a-i-n"},
    {level:"medium",word:"every",q:"Which is the correct spelling?",options:["evry","every","evrey","everry"],answer:"every",hint:"e-v-e-r-y"},
    {level:"medium",word:"garden",q:"Which is the correct spelling?",options:["gardin","garden","gaarden","gardan"],answer:"garden",hint:"g-a-r-d-e-n"},
    {level:"medium",word:"night",q:"Which is the correct spelling?",options:["nite","nigt","nyght","night"],answer:"night",hint:"n-i-g-h-t — silent gh!"},
    {level:"medium",word:"friend",q:"Which is the correct spelling?",options:["freind","frend","friend","friand"],answer:"friend",hint:"i before e in friend!"},
    // ── HARD (Grade 3–4) ──
    {level:"hard",word:"beautiful",q:"Which is the correct spelling?",options:["beutiful","beautifull","beautiful","butiful"],answer:"beautiful",hint:"b-e-a-u-t-i-f-u-l"},
    {level:"hard",word:"thought",q:"Which is the correct spelling?",options:["thort","thougt","thought","thougth"],answer:"thought",hint:"th-ough-t — tricky ough!"},
    {level:"hard",word:"through",q:"Which is the correct spelling?",options:["threw","throgh","through","throo"],answer:"through",hint:"thr-ough — another ough word!"},
    {level:"hard",word:"daughter",q:"Which is the correct spelling?",options:["darter","doughter","dawter","daughter"],answer:"daughter",hint:"d-a-u-g-h-t-e-r — tricky!"},
    {level:"hard",word:"favourite",q:"Which is the correct spelling?",options:["favorit","favrite","favourite","faverite"],answer:"favourite",hint:"f-a-v-o-u-r-i-t-e"},
    {level:"hard",word:"chocolate",q:"Which is the correct spelling?",options:["choclate","chokolate","chockolate","chocolate"],answer:"chocolate",hint:"choc-o-late — three syllables!"},
    {level:"hard",word:"surprise",q:"Which is the correct spelling?",options:["suprise","surpise","surprize","surprise"],answer:"surprise",hint:"sur-prise: s-u-r-p-r-i-s-e"},
  ],

  /* ── FILL THE GAP ────────────────────────────────────────────────────── */
  gaps:[
    // ── EASY (Kindergarten) ──
    {level:"easy",type:"sentence",q:"The cat sat on the ___.",options:["mat","dog","run","blue"],answer:"mat",hint:"Cats like to sit on flat things!"},
    {level:"easy",type:"sentence",q:"The children played in the ___ after school.",options:["bed","park","book","spoon"],answer:"park",hint:"Where do children go to play outside?"},
    {level:"easy",type:"word",q:"Complete the word:\nc _ t",display:"c _ t",options:["a","e","i","o"],answer:"a",hint:"This animal says meow! c_a_t"},
    {level:"easy",type:"word",q:"Complete the word:\nd _ g",display:"d _ g",options:["a","e","i","o"],answer:"o",hint:"This animal barks! d_o_g"},
    {level:"easy",type:"word",q:"Complete the word:\ns _ n",display:"s _ n",options:["a","e","i","o","u"],answer:"u",hint:"It shines in the sky! s_u_n"},
    {level:"easy",type:"word",q:"Complete the word:\nb _ d",display:"b _ d",options:["a","e","i","o","u"],answer:"e",hint:"You sleep in it! b_e_d"},
    {level:"easy",type:"word",q:"Complete the word:\nf _ sh",display:"f _ sh",options:["a","e","i","o"],answer:"i",hint:"It lives in water and swims! f_i_sh"},
    // ── MEDIUM (Grade 1–2) ──
    {level:"medium",type:"sentence",q:"She put on her coat because\nit was ___.",options:["sunny","hot","cold","funny"],answer:"cold",hint:"Why do you wear a coat?"},
    {level:"medium",type:"sentence",q:"He was very ___ so he drank\na glass of water.",options:["hungry","tired","thirsty","happy"],answer:"thirsty",hint:"When you need water, you feel...?"},
    {level:"medium",type:"sentence",q:"Birds fly with their ___.",options:["legs","tails","wings","beaks"],answer:"wings",hint:"What do birds flap to fly?"},
    {level:"medium",type:"sentence",q:"A baby cat is called a ___.",options:["puppy","calf","kitten","foal"],answer:"kitten",hint:"A baby dog is a puppy. A baby cat is a...?"},
    {level:"medium",type:"word",q:"Complete the word:\nt _ ee",display:"t _ ee",options:["a","e","r","n"],answer:"r",hint:"It has leaves and branches! t_r_ee"},
    {level:"medium",type:"word",q:"Complete the word:\nfl _ wer",display:"fl _ wer",options:["a","e","o","u"],answer:"o",hint:"It blooms in the garden! fl_o_wer"},
    {level:"medium",type:"word",q:"Complete the word:\nfr _ g",display:"fr _ g",options:["a","e","o","u"],answer:"o",hint:"It hops and says ribbit! fr_o_g"},
    // ── HARD (Grade 3–4) ──
    {level:"hard",type:"sentence",q:"The sun rises in the ___ and sets in the west.",options:["north","south","east","sky"],answer:"east",hint:"The sun comes up in the east!"},
    {level:"hard",type:"sentence",q:"We use an ___ when it rains.",options:["hat","umbrella","coat","boot"],answer:"umbrella",hint:"It keeps rain off your head!"},
    {level:"hard",type:"sentence",q:"Fish live in ___ water.",options:["hot","dry","salty","rocky"],answer:"salty",hint:"The sea tastes salty — and fish live there!"},
    {level:"hard",type:"sentence",q:"A spider has ___ legs.",options:["4","6","8","10"],answer:"8",hint:"Count the legs on a spider!"},
    {level:"hard",type:"word",q:"Complete the word:\ndr _ gon",display:"dr _ gon",options:["a","e","i","o"],answer:"a",hint:"A mythical fire-breathing creature! dr_a_gon"},
    {level:"hard",type:"word",q:"Complete the word:\nsp _ der",display:"sp _ der",options:["a","e","i","o"],answer:"i",hint:"It has 8 legs and spins webs! sp_i_der"},
    {level:"hard",type:"word",q:"Complete the word:\nch _ ir",display:"ch _ ir",options:["a","e","i","o"],answer:"a",hint:"You sit on it! ch_a_ir"},
  ],

  /* ── SCIENCE ─────────────────────────────────────────────────────────── */
  science:[
    // ── EASY: Animals & Plants ──
    {level:"easy",q:"What do plants need to grow? 🌱",options:["Milk","Sunlight","Darkness","Sand"],answer:"Sunlight",hint:"Plants make food using sunlight!"},
    {level:"easy",q:"Which animal is a mammal? 🐾",options:["Frog","Eagle","Dog","Shark"],answer:"Dog",hint:"Mammals have fur and feed babies milk!"},
    {level:"easy",q:"What do caterpillars turn into? 🦋",options:["Bees","Beetles","Butterflies","Ants"],answer:"Butterflies",hint:"It's called metamorphosis!"},
    {level:"easy",q:"Where do fish live? 🐟",options:["In trees","Underground","In water","In the sky"],answer:"In water",hint:"Fish breathe through gills underwater!"},
    {level:"easy",q:"What do bees collect from flowers? 🍯",options:["Water","Pollen & nectar","Leaves","Dirt"],answer:"Pollen & nectar",hint:"Bees use nectar to make honey!"},
    {level:"easy",q:"Which part of the plant is underground? 🌿",options:["Leaves","Flowers","Roots","Stem"],answer:"Roots",hint:"Roots drink up water from the soil!"},
    {level:"easy",q:"What do frogs start life as? 🐸",options:["Caterpillars","Tadpoles","Chicks","Larvae"],answer:"Tadpoles",hint:"Tadpoles swim in water before growing legs!"},
    {level:"easy",q:"Which season comes after Winter? ❄️",options:["Summer","Autumn","Spring","Monsoon"],answer:"Spring",hint:"Spring brings flowers after winter cold!"},
    {level:"easy",q:"What organ pumps blood around your body? ❤️",options:["Brain","Lungs","Heart","Stomach"],answer:"Heart",hint:"Your heart beats about 100,000 times a day!"},
    {level:"easy",q:"Which planet do we live on? 🌍",options:["Mars","Jupiter","Venus","Earth"],answer:"Earth",hint:"The third planet from the Sun!"},
    // ── MEDIUM: Body, Weather, Space ──
    {level:"medium",q:"What is the largest organ in the human body? 🧬",options:["Heart","Brain","Liver","Skin"],answer:"Skin",hint:"It covers your entire body!"},
    {level:"medium",q:"What gas do plants release during photosynthesis? 🌿",options:["Carbon dioxide","Nitrogen","Oxygen","Hydrogen"],answer:"Oxygen",hint:"Plants breathe in CO₂ and breathe out what we need!"},
    {level:"medium",q:"What causes thunder during a storm? ⛈️",options:["Clouds crashing","Wind speed","Lightning heating air rapidly","Rain falling hard"],answer:"Lightning heating air rapidly",hint:"Lightning superheats the air so fast it creates a shockwave!"},
    {level:"medium",q:"How many bones are in the adult human body?",options:["106","206","306","406"],answer:"206",hint:"Babies have about 270 — some fuse together as you grow!"},
    {level:"medium",q:"What is the closest star to Earth? ☀️",options:["Sirius","Polaris","Alpha Centauri","The Sun"],answer:"The Sun",hint:"It's only 93 million miles away — our nearest star!"},
    {level:"medium",q:"Which force pulls objects towards Earth? 🍎",options:["Magnetism","Friction","Gravity","Electricity"],answer:"Gravity",hint:"Isaac Newton observed this when an apple fell!"},
    {level:"medium",q:"What are clouds made of? ☁️",options:["Cotton","Smoke","Tiny water droplets","Dust"],answer:"Tiny water droplets",hint:"Clouds form when water vapour cools and condenses!"},
    {level:"medium",q:"Which planet is known as the Red Planet? 🔴",options:["Venus","Saturn","Mars","Jupiter"],answer:"Mars",hint:"Its red colour comes from iron oxide (rust)!"},
    {level:"medium",q:"What is the process where water turns to vapour? 💧",options:["Condensation","Evaporation","Precipitation","Freezing"],answer:"Evaporation",hint:"Heat turns liquid water into water vapour!"},
    {level:"medium",q:"What material is the hardest natural substance? 💎",options:["Gold","Iron","Diamond","Quartz"],answer:"Diamond",hint:"Diamond scores 10 on the Mohs hardness scale!"},
    // ── HARD: Forces, Space, Biology ──
    {level:"hard",q:"What is the correct order of the water cycle?",options:["Rain→Evaporate→Condense","Evaporate→Condense→Precipitate","Condense→Rain→Evaporate","Precipitate→Condense→Evaporate"],answer:"Evaporate→Condense→Precipitate",hint:"Water heats up, rises, cools into clouds, then falls as rain!"},
    {level:"hard",q:"Which planet has the most moons?",options:["Jupiter","Saturn","Uranus","Neptune"],answer:"Saturn",hint:"Saturn has over 140 confirmed moons — more than any other planet!"},
    {level:"hard",q:"What is photosynthesis? 🌱",options:["How animals breathe","How plants make food from sunlight","How rocks are formed","How clouds form"],answer:"How plants make food from sunlight",hint:"Plants use sunlight, CO₂ and water to make glucose!"},
    {level:"hard",q:"What are the three states of matter?",options:["Hot, warm, cold","Solid, liquid, gas","Metal, wood, plastic","Heavy, light, medium"],answer:"Solid, liquid, gas",hint:"Ice (solid), water (liquid), steam (gas) are all H₂O!"},
    {level:"hard",q:"What is the function of white blood cells? 🩸",options:["Carry oxygen","Fight infection","Digest food","Pump blood"],answer:"Fight infection",hint:"White blood cells are your body's immune defence!"},
    {level:"hard",q:"Which gas makes up most of Earth's atmosphere?",options:["Oxygen","Carbon dioxide","Nitrogen","Argon"],answer:"Nitrogen",hint:"Nitrogen makes up about 78% of air — oxygen is about 21%!"},
    {level:"hard",q:"What force opposes motion between surfaces? ⚙️",options:["Gravity","Magnetism","Friction","Tension"],answer:"Friction",hint:"Friction is why brakes slow down a bike!"},
    {level:"hard",q:"How long does it take Earth to orbit the Sun? ☀️",options:["24 hours","28 days","365 days","100 years"],answer:"365 days",hint:"One orbit = one year = about 365 days!"},
    {level:"hard",q:"What is the powerhouse of the cell? 🔬",options:["Nucleus","Cell membrane","Mitochondria","Ribosome"],answer:"Mitochondria",hint:"Mitochondria produce energy (ATP) for the cell!"},
    {level:"hard",q:"Which type of rock is formed from cooled lava? 🌋",options:["Sedimentary","Metamorphic","Igneous","Limestone"],answer:"Igneous",hint:"Igneous comes from the Latin 'ignis' meaning fire!"},
  ],

  /* ── SOCIAL STUDIES ──────────────────────────────────────────────────── */
  social:[
    // ── EASY: Community & Jobs ──
    {level:"easy",q:"What does a firefighter do? 🚒",options:["Fixes teeth","Puts out fires","Teaches children","Delivers post"],answer:"Puts out fires",hint:"Firefighters are community heroes who battle fires!"},
    {level:"easy",q:"Which community helper keeps us safe? 👮",options:["Chef","Police officer","Farmer","Artist"],answer:"Police officer",hint:"Police officers protect communities and uphold the law!"},
    {level:"easy",q:"What is the capital city of the USA? 🇺🇸",options:["New York","Los Angeles","Washington D.C.","Chicago"],answer:"Washington D.C.",hint:"It's named after the first US president, George Washington!"},
    {level:"easy",q:"How many continents are there on Earth? 🌍",options:["5","6","7","8"],answer:"7",hint:"Africa, Asia, Europe, North America, South America, Australia, Antarctica!"},
    {level:"easy",q:"What colour is the flag of the United Kingdom? 🇬🇧",options:["Red and white","Blue and white","Red, white and blue","Green and gold"],answer:"Red, white and blue",hint:"The Union Jack combines crosses of St George, St Andrew and St Patrick!"},
    {level:"easy",q:"What does a doctor do? 🩺",options:["Grows food","Builds houses","Treats sick people","Drives buses"],answer:"Treats sick people",hint:"Doctors help people get better when they are ill!"},
    {level:"easy",q:"Which ocean is the largest? 🌊",options:["Atlantic","Indian","Arctic","Pacific"],answer:"Pacific",hint:"The Pacific covers more area than all land combined!"},
    {level:"easy",q:"What is the job of a farmer? 🌾",options:["Fights fires","Grows food","Fixes cars","Teaches"],answer:"Grows food",hint:"Farmers grow the food we eat every day!"},
    {level:"easy",q:"Which continent is Egypt in? 🏺",options:["Asia","Europe","Africa","South America"],answer:"Africa",hint:"Egypt is in the northeast corner of Africa!"},
    {level:"easy",q:"What is a map used for? 🗺️",options:["Cooking","Finding places","Playing games","Building things"],answer:"Finding places",hint:"Maps show us where places are in the world!"},
    // ── MEDIUM: Countries, History ──
    {level:"medium",q:"What is the capital city of France? 🇫🇷",options:["Lyon","Marseille","Paris","Bordeaux"],answer:"Paris",hint:"The Eiffel Tower is in this city!"},
    {level:"medium",q:"Who was the first person to walk on the Moon? 🌙",options:["Buzz Aldrin","Yuri Gagarin","Neil Armstrong","John Glenn"],answer:"Neil Armstrong",hint:"He said 'One small step for man...' in 1969!"},
    {level:"medium",q:"What is the longest river in the world? 🌊",options:["Amazon","Mississippi","Yangtze","Nile"],answer:"Nile",hint:"The Nile flows through Egypt and Sudan in Africa!"},
    {level:"medium",q:"Which continent has the most countries? 🌍",options:["Asia","Europe","Africa","Americas"],answer:"Africa",hint:"Africa has 54 recognised countries!"},
    {level:"medium",q:"What does a senator or MP do? 🏛️",options:["Delivers letters","Makes laws for the country","Teaches at school","Drives ambulances"],answer:"Makes laws for the country",hint:"Elected officials represent citizens and create laws!"},
    {level:"medium",q:"Which country has the most people? 🌏",options:["USA","Russia","India","China"],answer:"India",hint:"India recently overtook China as the most populous country!"},
    {level:"medium",q:"What is the flag of Japan called? 🇯🇵",options:["Rising Moon","Red Circle","Hinomaru","Sun Flag"],answer:"Hinomaru",hint:"Hinomaru means 'circle of the sun' — a red disc on white!"},
    {level:"medium",q:"Where is the Amazon Rainforest? 🌿",options:["Africa","Asia","South America","Australia"],answer:"South America",hint:"The Amazon covers much of Brazil and neighbouring countries!"},
    {level:"medium",q:"Who was Rosa Parks? ✊",options:["A famous scientist","A civil rights hero who refused to give up her bus seat","The first female president","A famous explorer"],answer:"A civil rights hero who refused to give up her bus seat",hint:"Her brave act in 1955 helped spark the civil rights movement!"},
    {level:"medium",q:"What is the capital of Australia? 🇦🇺",options:["Sydney","Melbourne","Brisbane","Canberra"],answer:"Canberra",hint:"Many people guess Sydney — but it's actually Canberra!"},
    // ── HARD: Citizenship, Geography, History ──
    {level:"hard",q:"What does 'democracy' mean? 🗳️",options:["Rule by one person","Rule by the people","Rule by the military","Rule by religion"],answer:"Rule by the people",hint:"From Greek: 'demos' (people) + 'kratos' (power)!"},
    {level:"hard",q:"Which ocean lies between Europe/Africa and the Americas?",options:["Pacific","Indian","Arctic","Atlantic"],answer:"Atlantic",hint:"The Titanic sank in the Atlantic Ocean in 1912!"},
    {level:"hard",q:"What year did World War II end? 🕊️",options:["1939","1942","1945","1950"],answer:"1945",hint:"VE Day (Victory in Europe) was May 8th, 1945!"},
    {level:"hard",q:"What is the United Nations? 🌐",options:["A sports competition","An international organisation promoting peace","A type of government","A trade agreement"],answer:"An international organisation promoting peace",hint:"Founded in 1945, the UN has 193 member states!"},
    {level:"hard",q:"Which ancient wonder of the world still exists? 🏺",options:["Colossus of Rhodes","Lighthouse of Alexandria","Great Pyramid of Giza","Hanging Gardens of Babylon"],answer:"Great Pyramid of Giza",hint:"Built around 2560 BC — the only ancient wonder still standing!"},
    {level:"hard",q:"What does the equator divide? 🌍",options:["East and West hemispheres","North and South hemispheres","Asia and Africa","Land and sea"],answer:"North and South hemispheres",hint:"The equator is an imaginary line around Earth's middle!"},
    {level:"hard",q:"Who wrote the Declaration of Independence? 📜",options:["George Washington","Benjamin Franklin","Thomas Jefferson","Abraham Lincoln"],answer:"Thomas Jefferson",hint:"Jefferson was the primary author in 1776!"},
    {level:"hard",q:"What is the purpose of a constitution? 📋",options:["To list all laws","To set out the fundamental rules of a country","To record history","To organise elections"],answer:"To set out the fundamental rules of a country",hint:"A constitution is the supreme law that all other laws must follow!"},
    {level:"hard",q:"Which mountain range separates Europe from Asia? ⛰️",options:["Alps","Himalayas","Andes","Ural Mountains"],answer:"Ural Mountains",hint:"The Urals run through Russia and mark the Europe-Asia boundary!"},
    {level:"hard",q:"What is the name of South Africa's system of racial segregation that ended in 1994?",options:["Colonialism","Apartheid","Segregation","Partition"],answer:"Apartheid",hint:"Nelson Mandela spent 27 years in prison fighting against apartheid!"},
  ],
};

async function fetchAIQ(subject, level="medium"){
  const grade={easy:"Kindergarten",medium:"Grade 1-2",hard:"Grade 3-4"}[level];
  const prompts={
    maths:`Generate 1 maths question for ${grade}. Return ONLY valid JSON: {"q":"...","options":["a","b","c","d"],"answer":"...","hint":"..."}`,
    english:`Generate 1 English question for ${grade}. Return ONLY valid JSON: {"q":"...","options":["a","b","c","d"],"answer":"...","hint":"..."}`,
    reading:`Generate a short passage with 1 question for ${grade}. Return ONLY valid JSON: {"passage":"...","q":"...","options":["a","b","c","d"],"answer":"...","hint":"..."}`,
    verbal:`Generate 1 verbal reasoning question for ${grade}. Return ONLY valid JSON: {"q":"...","options":["a","b","c","d"],"answer":"...","hint":"..."}`,
    quant:`Generate 1 quantitative reasoning question for ${grade} (number patterns or puzzles). Return ONLY valid JSON: {"q":"...","options":["a","b","c","d"],"answer":"...","hint":"..."}`,
    spanish:`Generate 1 Spanish vocabulary question for ${grade}. Return ONLY valid JSON: {"q":"...","options":["a","b","c","d"],"answer":"...","hint":"..."}`,
    cogat:`Generate 1 CogAT-style question for ${grade}. Return ONLY valid JSON: {"q":"...","options":["a","b","c","d"],"answer":"...","hint":"..."}`,
    spelling:`Generate 1 spelling question for ${grade}. Return ONLY valid JSON: {"word":"...","q":"Which is the correct spelling?","options":["a","b","c","d"],"answer":"...","hint":"..."}`,
    gaps:`Generate 1 fill-in-the-gap sentence for ${grade}. Return ONLY valid JSON: {"type":"sentence","q":"sentence with ___ gap","options":["a","b","c","d"],"answer":"...","hint":"..."}`,
    science:`Generate 1 science question for ${grade} (animals, plants, human body, space, weather, or materials). Return ONLY valid JSON: {"q":"...","options":["a","b","c","d"],"answer":"...","hint":"..."}`,
    social:`Generate 1 social studies question for ${grade} (countries, history, community helpers, or geography). Return ONLY valid JSON: {"q":"...","options":["a","b","c","d"],"answer":"...","hint":"..."}`,
  };
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,system:"You are a friendly teacher. Respond ONLY with valid JSON, no markdown.",messages:[{role:"user",content:prompts[subject]}]})});
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
.logo{font-family:'Boogaloo',cursive;font-size:clamp(30px,7vw,46px);line-height:1.1;display:flex;align-items:center;gap:6px}
.logo-sub{font-size:clamp(11px,2.8vw,14px);color:#6b7280;font-weight:700;margin-top:3px}
.vine{height:4px;background:repeating-linear-gradient(90deg,#4ade80 0,#4ade80 12px,transparent 12px,transparent 20px);border-radius:99px;margin:8px 0}

.nav-tabs{display:flex;gap:6px;margin-bottom:12px;overflow-x:auto;padding-bottom:2px}
.nav-tab{flex:0 0 auto;padding:9px 14px;border-radius:14px;border:2.5px solid #e5e7eb;background:white;font-family:'Boogaloo',cursive;font-size:clamp(13px,3vw,16px);cursor:pointer;color:#6b7280;transition:all 0.15s;touch-action:manipulation;white-space:nowrap}
.nav-tab.active{background:#16a34a;color:white;border-color:#16a34a}
.nav-tab:active{transform:scale(0.97)}

.subject-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:8px}
@media(min-width:500px){.subject-grid{grid-template-columns:repeat(3,1fr)}}
@media(min-width:680px){.subject-grid{grid-template-columns:repeat(4,1fr)}}

/* ── Subject Groups ── */
.group-card{border-radius:20px;padding:14px 16px;cursor:pointer;border:3px solid transparent;transition:all 0.18s;margin-bottom:10px;position:relative;overflow:hidden;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.group-card:active{transform:scale(0.98)}
.group-header{display:flex;align-items:center;gap:12px}
.group-emoji{font-size:34px;flex-shrink:0}
.group-info{flex:1}
.group-label{font-family:'Boogaloo',cursive;font-size:clamp(17px,4vw,22px);line-height:1.1}
.group-desc{font-size:11px;font-weight:700;opacity:0.7;margin-top:1px}
.group-meta{display:flex;align-items:center;gap:6px;margin-top:5px;flex-wrap:wrap}
.group-pill{font-size:9px;font-weight:800;padding:2px 8px;border-radius:99px;background:rgba(0,0,0,0.08)}
.group-chevron{font-size:18px;transition:transform 0.2s;flex-shrink:0}
.group-chevron.open{transform:rotate(90deg)}
.group-subjects{overflow:hidden;transition:max-height 0.3s ease,opacity 0.3s ease}
.group-subjects.closed{max-height:0;opacity:0;pointer-events:none}
.group-subjects.open{max-height:600px;opacity:1}
.group-subject-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding-top:10px}
@media(min-width:400px){.group-subject-grid{grid-template-columns:repeat(3,1fr)}}

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

/* ── Difficulty Picker ── */
.diff-card{border-radius:20px;padding:16px 14px;cursor:pointer;border:3px solid transparent;transition:all 0.18s;text-align:center;user-select:none;touch-action:manipulation;position:relative;overflow:hidden}
.diff-card:active{transform:scale(0.96)}
.diff-card.selected{box-shadow:0 6px 24px rgba(0,0,0,0.15);transform:scale(1.03)}
.diff-emoji{font-size:36px;margin-bottom:6px}
.diff-label{font-family:'Boogaloo',cursive;font-size:22px;margin-bottom:2px}
.diff-grade{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;opacity:0.75;margin-bottom:4px}
.diff-desc{font-size:12px;font-weight:700;opacity:0.65}
.diff-badge{position:absolute;top:8px;right:8px;font-size:9px;font-weight:900;padding:3px 8px;border-radius:99px;background:rgba(0,0,0,0.1)}

/* ── Avatar Builder ── */
.av-section{background:white;border-radius:16px;padding:12px 14px;margin-bottom:10px;box-shadow:0 2px 10px rgba(0,0,0,0.05)}
.av-section-title{font-family:'Boogaloo',cursive;font-size:15px;color:#374151;margin-bottom:8px;display:flex;align-items:center;gap:5px}
.av-option-row{display:flex;gap:7px;flex-wrap:wrap}
.av-opt{border-radius:12px;border:3px solid #e5e7eb;padding:6px 10px;cursor:pointer;font-size:18px;transition:all 0.15s;background:white;touch-action:manipulation;min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center}
.av-opt.selected{border-color:#F6A800;background:#FFFBEB;transform:scale(1.1)}
.av-opt:active{transform:scale(0.95)}
.av-color-opt{width:32px;height:32px;border-radius:50%;border:3px solid transparent;cursor:pointer;transition:all 0.15s;touch-action:manipulation}
.av-color-opt.selected{border-color:#1a1a1a;transform:scale(1.15);box-shadow:0 0 0 2px white,0 0 0 4px #1a1a1a}
.av-preview{background:linear-gradient(135deg,#F0FDF4,#EFF6FF);border-radius:20px;padding:20px;text-align:center;border:3px solid #e5e7eb;margin-bottom:14px}

/* ── Welcome / Profile screens ── */
.welcome-wrap{min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 20px;text-align:center}
.welcome-logo{font-family:'Boogaloo',cursive;font-size:clamp(36px,9vw,54px);margin-bottom:4px;display:flex;align-items:center;justify-content:center;gap:8px}
.welcome-logo-text{background:linear-gradient(135deg,#16a34a,#F6A800,#D45EBC);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.welcome-sub{font-size:clamp(13px,3vw,16px);font-weight:700;color:#6b7280;margin-bottom:28px}
.who-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;width:100%;max-width:380px;margin-bottom:24px}
.who-card{border-radius:22px;padding:22px 14px;cursor:pointer;border:3px solid transparent;transition:all 0.18s;text-align:center;user-select:none;touch-action:manipulation}
.who-card:active{transform:scale(0.96)}
.who-icon{font-size:46px;margin-bottom:8px}
.who-label{font-family:'Boogaloo',cursive;font-size:22px}
.who-desc{font-size:11px;font-weight:700;opacity:0.65;margin-top:3px}
.profile-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;width:100%;max-width:400px;margin-bottom:18px}
.profile-card{border-radius:20px;padding:16px 10px;cursor:pointer;border:3px solid #e5e7eb;background:white;text-align:center;transition:all 0.18s;position:relative;touch-action:manipulation;user-select:none}
.profile-card:active{transform:scale(0.96)}
.profile-card.active-profile{border-color:#F6A800;background:#FFFBEB;box-shadow:0 4px 16px rgba(246,168,0,0.2)}
.profile-card.add-profile{border-style:dashed;border-color:#d1d5db;background:#f9fafb}
.profile-name{font-family:'Boogaloo',cursive;font-size:15px;color:#111;margin-top:5px}
.profile-stats{font-size:10px;font-weight:700;color:#9ca3af;margin-top:2px}
.profile-delete{position:absolute;top:6px;right:6px;background:#fee2e2;border:none;border-radius:50%;width:20px;height:20px;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#ef4444}
.setup-card{background:white;border-radius:24px;padding:24px 20px;width:100%;max-width:380px;box-shadow:0 8px 32px rgba(0,0,0,0.1)}
`;

/* ─── Home ─────────────────────────────────────────────────────────────── */
function Home({progress,history,earned,onSelect,sounds,muted,toggleMute,tab,setTab,defaultLevel,onSetDefaultLevel,avatar,onEditAvatar,onSwitchProfile}){
  const [openGroup,setOpenGroup]=useState("literacy"); // first group open by default

  const toggleGroup=(id)=>{
    sounds.tap();
    setOpenGroup(g=>g===id?null:id);
  };

  // compute group progress summary
  const groupStats=(g)=>{
    const subs=g.subjects.map(id=>SUBJECTS.find(s=>s.id===id)).filter(Boolean);
    const done=subs.filter(s=>(progress[s.id]?.best||0)>0).length;
    const stars=subs.reduce((sum,s)=>sum+(progress[s.id]?.stars||0),0);
    return{done,total:subs.length,stars};
  };

  return(
    <div>
      <div className="home-hero">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
            <span style={{fontSize:10,fontWeight:800,color:"#6b7280"}}>Level:</span>
            {["easy","medium","hard"].map(lv=>{
              const d=DIFFICULTY[lv];
              return<button key={lv} onClick={()=>onSetDefaultLevel(lv)} style={{border:`2px solid ${defaultLevel===lv?d.color:"#e5e7eb"}`,background:defaultLevel===lv?d.bg:"white",borderRadius:99,padding:"3px 9px",fontSize:10,fontWeight:800,color:defaultLevel===lv?d.color:"#9ca3af",cursor:"pointer",transition:"all 0.15s"}}>{d.emoji} {d.label}</button>;
            })}
          </div>
          <div style={{display:"flex",gap:5}}>
            <button className="icon-btn" onClick={toggleMute}>{muted?"🔇":"🔊"}</button>
            <button className="icon-btn" onClick={onSwitchProfile} title="Switch profile">👥</button>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:4}}>
          <div style={{position:"relative",cursor:"pointer"}} onClick={onEditAvatar}>
            <AvatarSVG av={avatar} size={64}/>
            <div style={{position:"absolute",bottom:-2,right:-2,background:"#F6A800",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}>✏️</div>
          </div>
          <div>
            <div className="logo"><span>🌿</span><span style={{background:"linear-gradient(135deg,#16a34a,#F6A800,#D45EBC)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>BrightMind</span></div>
            <div className="logo-sub">Hi {avatar?.name||"Explorer"}! Ready to learn? 🌟</div>
          </div>
        </div>
      </div>
      <div className="vine"/>
      <div className="nav-tabs">
        {[["📚","Subjects"],["🏅","Badges"],["👨‍👩‍👧","Progress"]].map(([icon,label],i)=>(
          <button key={label} className={`nav-tab${tab===i?" active":""}`} onClick={()=>{sounds.tap();setTab(i);}}>{icon} {label}</button>
        ))}
      </div>

      {tab===0&&(
        <div style={{marginTop:4}}>
          {GROUPS.map((g,gi)=>{
            const isOpen=openGroup===g.id;
            const {done,total,stars}=groupStats(g);
            const groupSubjects=g.subjects.map(id=>SUBJECTS.find(s=>s.id===id)).filter(Boolean);
            const diff=DIFFICULTY[defaultLevel];
            return(
              <div key={g.id} className="group-card slide-up"
                style={{background:g.bg,borderColor:isOpen?g.color:"transparent",animationDelay:`${gi*0.08}s`}}>
                {/* Group header — tap to expand */}
                <div className="group-header" onClick={()=>toggleGroup(g.id)}>
                  <div className="group-emoji">{g.emoji}</div>
                  <div className="group-info">
                    <div className="group-label" style={{color:g.color}}>{g.label}</div>
                    <div className="group-desc" style={{color:g.color}}>{g.desc}</div>
                    <div className="group-meta">
                      <span className="group-pill" style={{color:g.color}}>{total} subject{total>1?"s":""}</span>
                      {done>0&&<span className="group-pill" style={{color:g.color}}>{done}/{total} tried</span>}
                      {stars>0&&<span className="group-pill" style={{color:g.color}}>{"⭐".repeat(Math.min(stars,5))}</span>}
                    </div>
                  </div>
                  <div className={`group-chevron${isOpen?" open":""}`} style={{color:g.color}}>›</div>
                </div>

                {/* Subject tiles — slide open */}
                <div className={`group-subjects${isOpen?" open":" closed"}`}>
                  <div className="group-subject-grid">
                    {groupSubjects.map((s,i)=>{
                      const p=progress[s.id]||{};
                      const levelBest=p[`best_${defaultLevel}`]||0;
                      return(
                        <div key={s.id} className="subject-card"
                          style={{background:"white",borderColor:s.border,animationDelay:`${i*0.06}s`,minHeight:90}}
                          onClick={()=>{sounds.tap();onSelect(s.id);}}>
                          {levelBest>0&&<div className="badge-best" style={{color:s.dark}}>{diff.emoji}{levelBest}/{TOTAL}</div>}
                          {s.id==="cogat"&&<div className="cogat-badge">GIFTED</div>}
                          {s.id==="times"&&<div className="cogat-badge" style={{background:"#10B981"}}>✖️</div>}
                          <div style={{marginBottom:3}}><Mascot type={s.mascot} size={40} animate/></div>
                          <div className="card-label" style={{color:s.dark,fontSize:"clamp(12px,3vw,15px)"}}>{s.label}</div>
                          <div className="card-stars"><Stars count={p.stars||0} size={15}/></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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

const PRAISE_PHRASES = [
  "Well done!","Correct!","Amazing!","Brilliant!",
  "Super star!","You got it!","Wahoo!","Yes! That's right!",
];
const WRONG_PHRASES = [
  "Oops, try again!","Not quite!","Almost — keep going!",
  "Don't give up!","So close — you've got this!",
];
let praiseIdx=0;
let wrongIdx=0;
function nextPraise(){const p=PRAISE_PHRASES[praiseIdx%PRAISE_PHRASES.length];praiseIdx++;return p;}
function nextWrong(){const p=WRONG_PHRASES[wrongIdx%WRONG_PHRASES.length];wrongIdx++;return p;}

/* ─── Avatar System ─────────────────────────────────────────────────────── */
const SKIN_TONES=[
  {id:"s1",color:"#FDDBB4",shadow:"#E8A96A",lip:"#C97B7B"},
  {id:"s2",color:"#F5C28A",shadow:"#D4956A",lip:"#B8725A"},
  {id:"s3",color:"#E8A96A",shadow:"#C47A45",lip:"#A85F3A"},
  {id:"s4",color:"#C68642",shadow:"#9A6130",lip:"#8B4A2A"},
  {id:"s5",color:"#8D5524",shadow:"#6B3A10",lip:"#7A3520"},
  {id:"s6",color:"#5C3317",shadow:"#3E2009",lip:"#5A2510"},
  {id:"s7",color:"#FAEBD7",shadow:"#E8C9A0",lip:"#D4A0A0"},
  {id:"s8",color:"#FFE0BD",shadow:"#E8BA8A",lip:"#CC8888"},
];
const HAIR_COLORS=[
  {id:"h1",color:"#1a1a1a"},{id:"h2",color:"#2C1810"},{id:"h3",color:"#4a3728"},
  {id:"h4",color:"#8B4513"},{id:"h5",color:"#C19A6B"},{id:"h6",color:"#DAA520"},
  {id:"h7",color:"#E8D5B7"},{id:"h8",color:"#F5F5DC"},{id:"h9",color:"#FF6B6B"},
  {id:"h10",color:"#9B59B6"},{id:"h11",color:"#3498DB"},{id:"h12",color:"#2ECC71"},
];
const HAIR_STYLES=["short_straight","short_wave","medium_straight","medium_curly","long_straight","long_curly","afro","fade","bun","ponytail","braids","locs"];
const EYE_COLORS=["#1a1a1a","#4a3728","#1565C0","#2E7D32","#7B3F00","#546E7A"];
const ACCESSORIES=["none","glasses_round","glasses_square","sunglasses","bow","cap","crown","headband","earrings","beanie"];
const TOPS=["tshirt","hoodie","dress","polo","blazer","sweater","tank","uniform"];
const TOP_COLORS=["#EF4444","#3B82F6","#10B981","#F59E0B","#8B5CF6","#EC4899","#06B6D4","#F97316","#1a1a1a","#ffffff","#374151","#7C3AED"];
const EXPRESSIONS=["happy","big_smile","cool","surprised","thoughtful","cheeky"];
const BASE_AVATARS=[
  {id:"b1",label:"Alex",   skin:"s1",hair:"h1",hairStyle:"short_straight",eye:"#1a1a1a",accessory:"none",top:"tshirt",topColor:"#3B82F6",expression:"happy"},
  {id:"b2",label:"Maya",   skin:"s4",hair:"h4",hairStyle:"long_straight",eye:"#4a3728",accessory:"none",top:"dress",topColor:"#EC4899",expression:"big_smile"},
  {id:"b3",label:"Jordan", skin:"s5",hair:"h2",hairStyle:"fade",eye:"#1a1a1a",accessory:"none",top:"hoodie",topColor:"#10B981",expression:"cool"},
  {id:"b4",label:"Zara",   skin:"s3",hair:"h5",hairStyle:"afro",eye:"#4a3728",accessory:"none",top:"tshirt",topColor:"#F59E0B",expression:"happy"},
  {id:"b5",label:"Sam",    skin:"s2",hair:"h3",hairStyle:"medium_curly",eye:"#1565C0",accessory:"none",top:"sweater",topColor:"#8B5CF6",expression:"thoughtful"},
  {id:"b6",label:"Priya",  skin:"s6",hair:"h1",hairStyle:"braids",eye:"#1a1a1a",accessory:"none",top:"dress",topColor:"#06B6D4",expression:"big_smile"},
  {id:"b7",label:"Kai",    skin:"s7",hair:"h8",hairStyle:"short_wave",eye:"#2E7D32",accessory:"none",top:"polo",topColor:"#374151",expression:"cheeky"},
  {id:"b8",label:"Imani",  skin:"s5",hair:"h2",hairStyle:"locs",eye:"#1a1a1a",accessory:"none",top:"blazer",topColor:"#7C3AED",expression:"happy"},
];

const DEFAULT_AVATAR={skin:"s1",hair:"h1",hairStyle:"short_straight",eye:"#1a1a1a",accessory:"none",top:"tshirt",topColor:"#3B82F6",expression:"happy",name:"Explorer"};

const getSkin=(id)=>SKIN_TONES.find(s=>s.id===id)||SKIN_TONES[0];
const getHair=(id)=>HAIR_COLORS.find(h=>h.id===id)||HAIR_COLORS[0];

function AvatarSVG({av,size=80}){
  const a=av||DEFAULT_AVATAR;
  const sk=getSkin(a.skin);
  const hr=getHair(a.hair);
  const sc=sk.color, sh=sk.shadow, lp=sk.lip, hc=hr.color, ec=a.eye||"#1a1a1a";

  // ── Hair shapes ──────────────────────────────────────────────────
  const hairMap={
    short_straight:<><path d="M18 38 Q16 18 40 14 Q64 18 62 38 Q58 22 40 20 Q22 22 18 38Z" fill={hc}/><rect x="16" y="32" width="5" height="14" rx="2.5" fill={hc}/><rect x="59" y="32" width="5" height="14" rx="2.5" fill={hc}/></>,
    short_wave:<><path d="M17 38 Q15 16 40 13 Q65 16 63 38 Q55 18 48 22 Q40 18 32 22 Q24 18 17 38Z" fill={hc}/><rect x="15" y="30" width="5" height="15" rx="2.5" fill={hc}/><rect x="60" y="30" width="5" height="15" rx="2.5" fill={hc}/></>,
    medium_straight:<><path d="M16 38 Q14 16 40 12 Q66 16 64 38 Q60 20 40 18 Q20 20 16 38Z" fill={hc}/><rect x="14" y="30" width="6" height="28" rx="3" fill={hc}/><rect x="60" y="30" width="6" height="28" rx="3" fill={hc}/></>,
    medium_curly:<><path d="M16 36 Q14 15 40 12 Q66 15 64 36 Q58 16 48 20 Q40 16 32 20 Q22 16 16 36Z" fill={hc}/>{[18,24,30].map((x,i)=><ellipse key={i} cx={x} cy={45+i*8} rx="4" ry="5" fill={hc}/>)}{[58,62,58].map((x,i)=><ellipse key={i} cx={x} cy={45+i*8} rx="4" ry="5" fill={hc}/>)}</>,
    long_straight:<><path d="M15 38 Q13 14 40 11 Q67 14 65 38 Q61 18 40 16 Q19 18 15 38Z" fill={hc}/><rect x="13" y="28" width="7" height="46" rx="3.5" fill={hc}/><rect x="60" y="28" width="7" height="46" rx="3.5" fill={hc}/></>,
    long_curly:<><path d="M15 36 Q13 13 40 11 Q67 13 65 36 Q58 14 48 18 Q40 14 32 18 Q22 14 15 36Z" fill={hc}/>{[14,12,16,14].map((x,i)=><ellipse key={i} cx={x+i*2} cy={44+i*10} rx="5" ry="6" fill={hc}/>)}{[64,66,62,64].map((x,i)=><ellipse key={i} cx={x-i*2} cy={44+i*10} rx="5" ry="6" fill={hc}/>)}</>,
    afro:<><ellipse cx="40" cy="26" rx="28" ry="24" fill={hc}/><ellipse cx="40" cy="26" rx="24" ry="20" fill={hc}/>{[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>{const r=27,x=40+r*Math.cos(a*Math.PI/180),y=26+r*Math.sin(a*Math.PI/180);return<circle key={i} cx={x} cy={y} r="5" fill={hc}/>})}</>,
    fade:<><path d="M19 48 Q17 26 40 22 Q63 26 61 48 Q56 30 40 28 Q24 30 19 48Z" fill={hc}/><path d="M19 48 Q17 34 21 30" stroke={hc} strokeWidth="3" fill="none"/><path d="M61 48 Q63 34 59 30" stroke={hc} strokeWidth="3" fill="none"/></>,
    bun:<><ellipse cx="40" cy="34" rx="22" ry="14" fill={hc}/><circle cx="40" cy="14" r="12" fill={hc}/><circle cx="40" cy="14" r="8" fill={hc} opacity="0.7"/></>,
    ponytail:<><path d="M17 38 Q15 16 40 13 Q65 16 63 38 Q59 20 40 18 Q21 20 17 38Z" fill={hc}/><path d="M55 22 Q68 30 65 55 Q62 65 58 68" stroke={hc} strokeWidth="8" fill="none" strokeLinecap="round"/></>,
    braids:<><path d="M17 36 Q15 14 40 12 Q65 14 63 36 Q58 18 40 16 Q22 18 17 36Z" fill={hc}/>{[[14,38],[16,52],[14,66],[18,78]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="4" ry="6" fill={hc}/>)}{[[64,38],[62,52],[64,66],[60,78]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="4" ry="6" fill={hc}/>)}</>,
    locs:<><path d="M16 36 Q14 14 40 12 Q66 14 64 36 Q58 18 40 16 Q22 18 16 36Z" fill={hc}/>{[[13,42],[11,56],[13,70],[15,80]].map(([x,y],i)=><path key={i} d={`M${x} ${y-8} Q${x-3} ${y} ${x} ${y+8}`} stroke={hc} strokeWidth="6" fill="none" strokeLinecap="round"/>)}{[[67,42],[69,56],[67,70],[65,80]].map(([x,y],i)=><path key={i} d={`M${x} ${y-8} Q${x+3} ${y} ${x} ${y+8}`} stroke={hc} strokeWidth="6" fill="none" strokeLinecap="round"/>)}</>,
  };

  // ── Expressions ─────────────────────────────────────────────────
  const exprMap={
    happy:<><path d="M30 52 Q40 60 50 52" stroke={lp} strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M30 52 Q40 58 50 52" stroke="none" fill={lp} opacity="0.3"/></>,
    big_smile:<><path d="M27 50 Q40 63 53 50" stroke={lp} strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M29 52 Q40 62 51 52 Q40 65 29 52Z" fill={lp} opacity="0.25"/><path d="M33 53 Q40 57 47 53" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/></>,
    cool:<path d="M31 53 Q40 58 49 53" stroke={lp} strokeWidth="2" fill="none" strokeLinecap="round"/>,
    surprised:<><ellipse cx="40" cy="54" rx="6" ry="4" fill={lp} opacity="0.4"/><path d="M34 54 Q40 58 46 54" stroke={lp} strokeWidth="2" fill="none"/></>,
    thoughtful:<path d="M33 54 Q38 52 43 54 Q46 56 48 53" stroke={lp} strokeWidth="2" fill="none" strokeLinecap="round"/>,
    cheeky:<><path d="M30 52 Q36 58 42 54 Q46 58 52 52" stroke={lp} strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="51" cy="47" r="4" fill="#F9A8D4" opacity="0.5"/></>,
  };

  // ── Accessories ─────────────────────────────────────────────────
  const accMap={
    none:null,
    glasses_round:<><circle cx="32" cy="37" r="6" fill="none" stroke="#374151" strokeWidth="1.8"/><circle cx="48" cy="37" r="6" fill="none" stroke="#374151" strokeWidth="1.8"/><line x1="38" y1="37" x2="42" y2="37" stroke="#374151" strokeWidth="1.5"/><line x1="14" y1="36" x2="26" y2="37" stroke="#374151" strokeWidth="1.5"/><line x1="66" y1="36" x2="54" y2="37" stroke="#374151" strokeWidth="1.5"/></>,
    glasses_square:<><rect x="25" y="32" width="13" height="10" rx="2" fill="none" stroke="#374151" strokeWidth="1.8"/><rect x="42" y="32" width="13" height="10" rx="2" fill="none" stroke="#374151" strokeWidth="1.8"/><line x1="38" y1="37" x2="42" y2="37" stroke="#374151" strokeWidth="1.5"/><line x1="14" y1="35" x2="25" y2="36" stroke="#374151" strokeWidth="1.5"/><line x1="66" y1="35" x2="55" y2="36" stroke="#374151" strokeWidth="1.5"/></>,
    sunglasses:<><rect x="24" y="33" width="14" height="9" rx="4" fill="#1a1a1a" opacity="0.85"/><rect x="42" y="33" width="14" height="9" rx="4" fill="#1a1a1a" opacity="0.85"/><line x1="38" y1="37" x2="42" y2="37" stroke="#374151" strokeWidth="2"/><line x1="13" y1="35" x2="24" y2="36" stroke="#374151" strokeWidth="1.5"/><line x1="67" y1="35" x2="56" y2="36" stroke="#374151" strokeWidth="1.5"/></>,
    bow:<><path d="M26 14 Q32 8 34 16 Q36 8 42 14 Q36 20 34 12 Q32 20 26 14Z" fill="#EF4444"/><circle cx="34" cy="14" r="3.5" fill="#DC2626"/></>,
    cap:<><path d="M16 36 Q16 22 40 20 Q64 22 64 36" fill={a.topColor}/><rect x="10" y="33" width="60" height="7" rx="3.5" fill={a.topColor}/><path d="M10 36 Q8 40 10 40 L14 40 L14 36Z" fill={a.topColor} opacity="0.7"/></>,
    crown:<><path d="M20 28 L26 14 L33 24 L40 10 L47 24 L54 14 L60 28 Z" fill="#F59E0B"/><rect x="20" y="26" width="40" height="6" rx="2" fill="#F59E0B"/>{[26,40,54].map((x,i)=><circle key={i} cx={x} cy="14" r="3.5" fill={["#EF4444","#3B82F6","#10B981"][i]}/>)}</>,
    headband:<><rect x="14" y="28" width="52" height="8" rx="4" fill="#8B5CF6"/><circle cx="40" cy="28" r="5" fill="#A78BFA"/></>,
    earrings:<><circle cx="14" cy="44" r="4" fill="#F59E0B" stroke="#D97706" strokeWidth="1"/><circle cx="66" cy="44" r="4" fill="#F59E0B" stroke="#D97706" strokeWidth="1"/></>,
    beanie:<><path d="M13 38 Q13 16 40 13 Q67 16 67 38 Q60 20 40 18 Q20 20 13 38Z" fill={hc}/><rect x="13" y="34" width="54" height="8" rx="4" fill={hc} opacity="0.7"/><ellipse cx="40" cy="14" r="6" fill={hc} opacity="0.5"/></>,
  };

  // ── Outfit ──────────────────────────────────────────────────────
  const topMap={
    tshirt:<><path d="M14 80 L14 62 Q14 56 22 54 Q28 58 40 58 Q52 58 58 54 Q66 56 66 62 L66 80Z" fill={a.topColor}/><path d="M14 62 Q8 58 6 66 L6 80 L14 80Z" fill={a.topColor}/><path d="M66 62 Q72 58 74 66 L74 80 L66 80Z" fill={a.topColor}/></>,
    hoodie:<><path d="M13 80 L13 61 Q13 54 22 52 Q30 58 40 58 Q50 58 58 52 Q67 54 67 61 L67 80Z" fill={a.topColor}/><path d="M13 61 Q6 57 4 66 L4 80 L13 80Z" fill={a.topColor}/><path d="M67 61 Q74 57 76 66 L76 80 L67 80Z" fill={a.topColor}/><path d="M30 52 Q40 62 50 52" stroke="rgba(0,0,0,0.2)" strokeWidth="2" fill="none"/><rect x="34" y="58" width="12" height="8" rx="4" fill="rgba(0,0,0,0.1)"/></>,
    dress:<><path d="M24 56 Q20 64 14 80 L66 80 Q60 64 56 56 Q48 62 40 62 Q32 62 24 56Z" fill={a.topColor}/><path d="M24 56 Q24 50 32 50 Q36 56 40 56 Q44 56 48 50 Q56 50 56 56" fill={a.topColor}/></>,
    polo:<><path d="M14 80 L14 62 Q14 56 22 54 Q28 58 40 58 Q52 58 58 54 Q66 56 66 62 L66 80Z" fill={a.topColor}/><path d="M14 62 Q8 58 6 66 L6 80 L14 80Z" fill={a.topColor}/><path d="M66 62 Q72 58 74 66 L74 80 L66 80Z" fill={a.topColor}/><rect x="37" y="54" width="6" height="12" rx="3" fill="rgba(255,255,255,0.35)"/><circle cx="40" cy="58" r="1.5" fill="rgba(255,255,255,0.5)"/><circle cx="40" cy="62" r="1.5" fill="rgba(255,255,255,0.5)"/></>,
    blazer:<><path d="M14 80 L14 60 Q14 54 22 52 Q28 58 40 58 Q52 58 58 52 Q66 54 66 60 L66 80Z" fill={a.topColor}/><path d="M14 60 Q7 56 5 65 L5 80 L14 80Z" fill={a.topColor}/><path d="M66 60 Q73 56 75 65 L75 80 L66 80Z" fill={a.topColor}/><path d="M40 58 L36 80" stroke="rgba(255,255,255,0.25)" strokeWidth="8" fill="none"/><path d="M40 58 L44 80" stroke="rgba(0,0,0,0.15)" strokeWidth="8" fill="none"/><rect x="38" y="62" width="4" height="3" rx="1" fill="rgba(255,255,255,0.4)"/></>,
    sweater:<><path d="M13 80 L13 61 Q13 55 21 53 Q28 58 40 58 Q52 58 59 53 Q67 55 67 61 L67 80Z" fill={a.topColor}/><path d="M13 61 Q6 57 4 66 L4 80 L13 80Z" fill={a.topColor}/><path d="M67 61 Q74 57 76 66 L76 80 L67 80Z" fill={a.topColor}/>{[62,66,70,74,78].map((y,i)=><line key={i} x1="13" y1={y} x2="67" y2={y} stroke="rgba(0,0,0,0.08)" strokeWidth="2"/>)}</>,
    tank:<><path d="M20 80 L20 60 Q20 56 28 54 Q32 58 40 58 Q48 58 52 54 Q60 56 60 60 L60 80Z" fill={a.topColor}/></>,
    uniform:<><path d="M14 80 L14 61 Q14 55 22 53 Q28 58 40 58 Q52 58 58 53 Q66 55 66 61 L66 80Z" fill={a.topColor}/><path d="M14 61 Q7 57 5 66 L5 80 L14 80Z" fill={a.topColor}/><path d="M66 61 Q73 57 75 66 L75 80 L66 80Z" fill={a.topColor}/><rect x="38" y="53" width="4" height="18" fill="white" opacity="0.3"/>{[58,62,66,70].map((y,i)=><rect key={i} x="37" y={y} width="6" height="2" rx="1" fill="rgba(255,215,0,0.6)"/>)}</>,
  };

  const isCurlyStyle=["medium_curly","long_curly","afro","braids","locs"].includes(a.hairStyle||"short_straight");

  return(
    <svg width={size} height={size} viewBox="0 0 80 80" style={{display:"block",borderRadius:"50%",overflow:"hidden"}}>
      {/* Background */}
      <rect x="0" y="0" width="80" height="80" fill="#F0FDF4"/>
      {/* Outfit */}
      {topMap[a.top||"tshirt"]}
      {/* Neck */}
      <rect x="34" y="56" width="12" height="8" rx="4" fill={sc}/>
      {/* Ears */}
      <ellipse cx="17" cy="42" rx="5" ry="7" fill={sc}/>
      <ellipse cx="63" cy="42" rx="5" ry="7" fill={sc}/>
      <ellipse cx="17" cy="42" rx="3" ry="5" fill={sh} opacity="0.4"/>
      <ellipse cx="63" cy="42" rx="3" ry="5" fill={sh} opacity="0.4"/>
      {/* Earrings behind ears */}
      {a.accessory==="earrings"&&<>
        <circle cx="14" cy="47" r="3.5" fill="#F59E0B"/>
        <circle cx="66" cy="47" r="3.5" fill="#F59E0B"/>
      </>}
      {/* Head */}
      <path d="M20 42 Q18 22 40 18 Q62 22 60 42 Q60 62 40 66 Q20 62 20 42Z" fill={sc}/>
      {/* Face shadow/contour */}
      <path d="M20 42 Q18 22 40 18 Q62 22 60 42 Q60 62 40 66 Q20 62 20 42Z" fill={sh} opacity="0.08"/>
      {/* Forehead highlight */}
      <ellipse cx="40" cy="26" rx="12" ry="6" fill="white" opacity="0.12"/>
      {/* Hair — behind if long/back styles */}
      {hairMap[a.hairStyle||"short_straight"]}
      {/* Eyebrows */}
      <path d="M25 32 Q30 29 36 31" stroke={hc} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M44 31 Q50 29 55 32" stroke={hc} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {/* Eye whites */}
      <ellipse cx="31" cy="38" rx="6.5" ry="5" fill="white"/>
      <ellipse cx="49" cy="38" rx="6.5" ry="5" fill="white"/>
      {/* Eye shadow */}
      <ellipse cx="31" cy="36" rx="6.5" ry="3" fill={sh} opacity="0.15"/>
      <ellipse cx="49" cy="36" rx="6.5" ry="3" fill={sh} opacity="0.15"/>
      {/* Irises */}
      <circle cx="31" cy="38" r="4" fill={ec}/>
      <circle cx="49" cy="38" r="4" fill={ec}/>
      {/* Pupils */}
      <circle cx="31" cy="38" r="2.2" fill="#0a0a0a"/>
      <circle cx="49" cy="38" r="2.2" fill="#0a0a0a"/>
      {/* Eye shine */}
      <circle cx="32.5" cy="36.5" r="1.2" fill="white"/>
      <circle cx="50.5" cy="36.5" r="1.2" fill="white"/>
      {/* Upper eyelids */}
      <path d="M24.5 35 Q31 32 37.5 35" stroke={hc} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M42.5 35 Q49 32 55.5 35" stroke={hc} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Nose */}
      <path d="M38 42 Q36 48 38 50 Q40 51 42 50 Q44 48 42 42" stroke={sh} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
      <ellipse cx="38" cy="50" rx="2.5" ry="1.5" fill={sh} opacity="0.25"/>
      <ellipse cx="42" cy="50" rx="2.5" ry="1.5" fill={sh} opacity="0.25"/>
      {/* Cheeks */}
      <ellipse cx="23" cy="48" rx="6" ry="4" fill="#F9A8D4" opacity="0.3"/>
      <ellipse cx="57" cy="48" rx="6" ry="4" fill="#F9A8D4" opacity="0.3"/>
      {/* Mouth */}
      {exprMap[a.expression||"happy"]}
      {/* Accessories (on top) */}
      {a.accessory!=="earrings"&&accMap[a.accessory||"none"]}
    </svg>
  );
}

function AvatarBuilder({avatar,onSave,onBack,sounds}){
  const [step,setStep]=useState(avatar&&avatar.skin!==DEFAULT_AVATAR.skin?"customise":"base");
  const [av,setAv]=useState(()=>{
    if(avatar&&avatar.skin){
      const base=BASE_AVATARS.find(b=>b.skin===avatar.skin&&b.hairStyle===avatar.hairStyle)||null;
      return{...DEFAULT_AVATAR,...avatar};
    }
    return{...DEFAULT_AVATAR};
  });
  const [name,setName]=useState(av.name||"Explorer");
  const upd=(k,v)=>setAv(a=>({...a,[k]:v}));

  const Section=({title,children})=>(
    <div className="av-section">
      <div className="av-section-title">{title}</div>
      {children}
    </div>
  );

  if(step==="base"){
    return(
      <div>
        <div className="topbar">
          <button className="back-btn" onClick={()=>{sounds.tap();onBack();}}>← Back</button>
          <div className="topbar-label" style={{color:"#F6A800"}}>🎨 Choose your look!</div>
        </div>
        <div style={{textAlign:"center",padding:"8px 0 12px",fontWeight:700,color:"#6b7280",fontSize:13}}>Pick a starting character, then customise!</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {BASE_AVATARS.map(b=>(
            <div key={b.id} onClick={()=>{sounds.tap();setAv({...b,name:av.name||"Explorer"});setStep("customise");}}
              style={{cursor:"pointer",borderRadius:16,padding:"8px 4px",textAlign:"center",border:`3px solid ${av.skin===b.skin&&av.hairStyle===b.hairStyle?"#F6A800":"#e5e7eb"}`,background:av.skin===b.skin&&av.hairStyle===b.hairStyle?"#FFFBEB":"white",transition:"all 0.15s"}}>
              <AvatarSVG av={b} size={60}/>
              <div style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:"#374151",marginTop:4}}>{b.label}</div>
            </div>
          ))}
        </div>
        <button className="next-btn" style={{background:"#F6A800"}} onClick={()=>{sounds.tap();setStep("customise");}}>
          Customise this one! ✏️
        </button>
      </div>
    );
  }

  return(
    <div>
      <div className="topbar">
        <button className="back-btn" onClick={()=>{sounds.tap();setStep("base");}}>← Choose base</button>
        <div className="topbar-label" style={{color:"#F6A800"}}>✏️ Customise</div>
      </div>
      <div className="av-preview">
        <AvatarSVG av={av} size={110}/>
        <div style={{marginTop:10}}>
          <input value={name} onChange={e=>setName(e.target.value)} maxLength={14}
            placeholder="Your name"
            style={{fontFamily:"'Boogaloo',cursive",fontSize:20,textAlign:"center",border:"2.5px solid #e5e7eb",borderRadius:12,padding:"6px 12px",width:"190px",color:"#111",background:"white",outline:"none"}}
            onFocus={e=>e.target.style.borderColor="#F6A800"}
            onBlur={e=>e.target.style.borderColor="#e5e7eb"}
          />
        </div>
      </div>

      <Section title="😄 Expression">
        <div className="av-option-row">
          {[["happy","😊"],["big_smile","😁"],["cool","😎"],["surprised","😮"],["thoughtful","🤔"],["cheeky","😜"]].map(([e,em])=>(
            <button key={e} className={`av-opt${av.expression===e?" selected":""}`} onClick={()=>{sounds.tap();upd("expression",e);}}>{em}</button>
          ))}
        </div>
      </Section>

      <Section title="🎨 Skin Tone">
        <div className="av-option-row">
          {SKIN_TONES.map(s=>(
            <div key={s.id} className={`av-color-opt${av.skin===s.id?" selected":""}`}
              style={{background:s.color,width:34,height:34}} onClick={()=>{sounds.tap();upd("skin",s.id);}}/>
          ))}
        </div>
      </Section>

      <Section title="👁️ Eye Colour">
        <div className="av-option-row">
          {EYE_COLORS.map(c=>(
            <div key={c} className={`av-color-opt${av.eye===c?" selected":""}`}
              style={{background:c,width:30,height:30}} onClick={()=>{sounds.tap();upd("eye",c);}}/>
          ))}
        </div>
      </Section>

      <Section title="💇 Hair Style">
        <div className="av-option-row" style={{flexWrap:"wrap"}}>
          {[["short_straight","✂️ Short"],["short_wave","〜 Wave"],["medium_straight","⬇️ Med"],["medium_curly","🌀 Curly"],["long_straight","📏 Long"],["long_curly","💫 Long Curl"],["afro","✊ Afro"],["fade","▲ Fade"],["bun","🎀 Bun"],["ponytail","🐴 Ponytail"],["braids","🪢 Braids"],["locs","🪨 Locs"]].map(([h,label])=>(
            <button key={h} className={`av-opt${av.hairStyle===h?" selected":""}`}
              style={{fontSize:11,padding:"6px 8px",minWidth:60}} onClick={()=>{sounds.tap();upd("hairStyle",h);}}>
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="🎨 Hair Colour">
        <div className="av-option-row">
          {HAIR_COLORS.map(h=>(
            <div key={h.id} className={`av-color-opt${av.hair===h.id?" selected":""}`}
              style={{background:h.color,width:30,height:30,border:h.id==="h8"?"2px solid #e5e7eb":""}}
              onClick={()=>{sounds.tap();upd("hair",h.id);}}/>
          ))}
        </div>
      </Section>

      <Section title="🎩 Accessory">
        <div className="av-option-row" style={{flexWrap:"wrap"}}>
          {[["none","🚫"],["glasses_round","👓"],["glasses_square","🔲"],["sunglasses","🕶️"],["bow","🎀"],["cap","🧢"],["crown","👑"],["headband","🌸"],["earrings","💛"],["beanie","🧣"]].map(([a_,em])=>(
            <button key={a_} className={`av-opt${av.accessory===a_?" selected":""}`} onClick={()=>{sounds.tap();upd("accessory",a_);}}>{em}</button>
          ))}
        </div>
      </Section>

      <Section title="👕 Outfit Style">
        <div className="av-option-row" style={{flexWrap:"wrap"}}>
          {[["tshirt","👕 T-shirt"],["hoodie","🧥 Hoodie"],["dress","👗 Dress"],["polo","👔 Polo"],["blazer","🤵 Blazer"],["sweater","🧶 Sweater"],["tank","🦺 Tank"],["uniform","⚓ Uniform"]].map(([t,label])=>(
            <button key={t} className={`av-opt${av.top===t?" selected":""}`}
              style={{fontSize:11,padding:"6px 8px",minWidth:64}} onClick={()=>{sounds.tap();upd("top",t);}}>
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="🎨 Outfit Colour">
        <div className="av-option-row">
          {TOP_COLORS.map(c=>(
            <div key={c} className={`av-color-opt${av.topColor===c?" selected":""}`}
              style={{background:c,width:30,height:30,border:c==="#ffffff"?"2px solid #e5e7eb":""}}
              onClick={()=>{sounds.tap();upd("topColor",c);}}/>
          ))}
        </div>
      </Section>

      <button className="next-btn" style={{background:"#F6A800",marginBottom:24}}
        onClick={()=>{sounds.tap();sounds.fanfare();onSave({...av,name});}}>
        Save my avatar! 🎉
      </button>
    </div>
  );
}

/* ─── Difficulty Picker ─────────────────────────────────────────────────── */
function DifficultyPicker({subject, defaultLevel, onStart, onBack, sounds, progress}){
  const s=SUBJECTS.find(x=>x.id===subject);
  if(!s)return null;
  const [sel,setSel]=useState(defaultLevel||"medium");
  const levels=["easy","medium","hard"];
  const subjectProgress=progress[subject]||{};
  return(
    <div>
      <div className="topbar">
        <button className="back-btn" onClick={()=>{sounds.tap();onBack();}}>← Home</button>
        <div className="topbar-label" style={{color:s.btn}}>{s.emoji} {s.label}</div>
      </div>
      <div style={{background:"white",borderRadius:20,padding:"16px",marginBottom:12,boxShadow:"0 4px 20px rgba(0,0,0,0.07)"}}>
        <div style={{textAlign:"center",marginBottom:14}}>
          <Mascot type={s.mascot} size={52} animate/>
          <div style={{fontFamily:"'Boogaloo',cursive",fontSize:20,color:s.dark,marginTop:6}}>Choose your level!</div>
          <div style={{fontSize:12,fontWeight:700,color:"#6b7280"}}>Pick the grade that's right for you</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
          {levels.map(lv=>{
            const d=DIFFICULTY[lv];
            const isSelected=sel===lv;
            const bestAtLevel=subjectProgress[`best_${lv}`]||0;
            return(
              <div key={lv} className={`diff-card${isSelected?" selected":""}`}
                style={{background:d.bg,borderColor:isSelected?d.color:"transparent"}}
                onClick={()=>{sounds.tap();setSel(lv);}}>
                {bestAtLevel>0&&<div className="diff-badge" style={{color:d.color}}>Best {bestAtLevel}</div>}
                <div className="diff-emoji">{d.emoji}</div>
                <div className="diff-label" style={{color:d.color}}>{d.label}</div>
                <div className="diff-grade" style={{color:d.color}}>{d.grade}</div>
                <div className="diff-desc" style={{color:d.color}}>{d.desc}</div>
              </div>
            );
          })}
        </div>
        <button className="next-btn" style={{background:DIFFICULTY[sel].color,maxWidth:280,margin:"0 auto",display:"block"}}
          onClick={()=>{sounds.tap();onStart(sel);}}>
          Start {DIFFICULTY[sel].label}! {DIFFICULTY[sel].emoji}
        </button>
      </div>
      <div style={{background:"white",borderRadius:16,padding:"12px 14px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
        <div style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:s.dark,marginBottom:8}}>📊 Your Progress</div>
        {levels.map(lv=>{
          const d=DIFFICULTY[lv];
          const best=subjectProgress[`best_${lv}`]||0;
          const pct=Math.round((best/TOTAL)*100);
          return(
            <div key={lv} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
              <div style={{width:20,textAlign:"center",fontSize:14}}>{d.emoji}</div>
              <div style={{width:60,fontSize:11,fontWeight:800,color:d.color}}>{d.label}</div>
              <div style={{flex:1,height:7,background:"#f3f4f6",borderRadius:99,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:d.color,borderRadius:99,transition:"width 0.5s"}}/>
              </div>
              <div style={{width:44,fontSize:10,fontWeight:800,color:"#6b7280",textAlign:"right"}}>{best>0?`${best}/${TOTAL}`:"-"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


const CHEERS=["Amazing! 🎉","Brilliant! 🌟","Super star! ⭐","Wow! 🏆","Great job! 🎊","Fantastic! 🦁","You got it! 🎯","Excellent! 🌈","¡Muy bien! 🇪🇸","Bravo! 🎺"];

const BATTERY_COLORS={"CogAT Verbal":"#10B981","CogAT Quantitative":"#F59E0B","CogAT Non-Verbal":"#6366F1"};

const clampWord="clamp(22px,6vw,34px)";

function Quiz({subjectId,level,onBack,onDone,sounds,muted,toggleMute}){
  const s=SUBJECTS.find(x=>x.id===subjectId);
  if(!s)return null;
  const isSpelling=subjectId==="spelling";
  const isGaps=subjectId==="gaps";
  const d=DIFFICULTY[level]||DIFFICULTY.medium;
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
    // Filter bank by level, fallback to all if too few
    const all=BANK[subjectId];
    const levelled=all.filter(q=>q.level===level);
    const bank=[...(levelled.length>=10?levelled:all)].sort(()=>Math.random()-0.5);
    const aiResults=await Promise.all([fetchAIQ(subjectId,level),fetchAIQ(subjectId,level),fetchAIQ(subjectId,level)]);
    const aiQs=aiResults.filter(q=>q?.q&&q?.options&&q?.answer).map(q=>({...q,isAI:true,level}));
    const fixed=bank.slice(0,TOTAL-aiQs.length);
    const combined=[...fixed,...aiQs].sort(()=>Math.random()-0.5).slice(0,TOTAL);
    setQs(combined);setLoading(false);
  },[subjectId,level]);

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
      setConfetti(true);setTimeout(()=>setConfetti(false),1300);
      sounds.correct();
      if(!muted)setTimeout(()=>speak(nextPraise()),420);
    }else{
      setStreak(0);
      sounds.wrong();
      if(!muted)setTimeout(()=>speak(nextWrong()),320);
    }
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
        <div style={{background:d.bg,border:`2px solid ${d.color}`,borderRadius:99,padding:"3px 9px",fontSize:10,fontWeight:800,color:d.color,whiteSpace:"nowrap"}}>{d.emoji} {d.grade}</div>
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
      setConfetti(true);setTimeout(()=>setConfetti(false),1200);
      sounds.correct();
      if(!muted)setTimeout(()=>speak(nextPraise()),420);
    }else{
      setStreak(0);
      sounds.wrong();
      if(!muted)setTimeout(()=>speak(nextWrong()),320);
    }
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
/* ─── Profile Helpers ───────────────────────────────────────────────────── */
const makeEmptyProgress=()=>{const p={};SUBJECTS.forEach(s=>{p[s.id]={stars:0,best:0,best_easy:0,best_medium:0,best_hard:0};});return p;};
const makeProfile=(name,avatar)=>({
  id:Date.now()+Math.random(),
  name,
  avatar:{...DEFAULT_AVATAR,...avatar,name},
  progress:makeEmptyProgress(),
  history:{total:0,perfectScores:0,bestStreak:0,improvements:0,spellPerfect:0,timesPerfect:0},
  earned:[],
  defaultLevel:"easy",
  ttMastery:{},
});

/* ─── Welcome Screen ────────────────────────────────────────────────────── */
function WelcomeScreen({profiles,activeId,onSelectProfile,onAddProfile,onDeleteProfile,sounds}){
  const [showAdd,setShowAdd]=useState(profiles.length===0);
  const [whoType,setWhoType]=useState(null); // "kid" | "parent"
  const [name,setName]=useState("");
  const [nameError,setNameError]=useState("");

  const startAdd=(type)=>{sounds.tap();setWhoType(type);setName("");setNameError("");};
  const cancelAdd=()=>{sounds.tap();setShowAdd(false);setWhoType(null);if(profiles.length===0)setShowAdd(true);};

  const submitProfile=()=>{
    const trimmed=name.trim();
    if(!trimmed){setNameError("Please enter a name!");return;}
    if(trimmed.length<2){setNameError("Name needs at least 2 letters!");return;}
    sounds.fanfare();
    onAddProfile(trimmed,whoType);
    setShowAdd(false);setWhoType(null);setName("");
  };

  if(showAdd){
    return(
      <div className="welcome-wrap">
        <JungleBg/>
        <div style={{position:"relative",zIndex:1,width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div className="welcome-logo"><span>🌿</span><span className="welcome-logo-text">BrightMind</span></div>
          {!whoType?(
            <>
              <div className="welcome-sub">Who's learning today?</div>
              <div className="who-grid">
                <div className="who-card" style={{background:"#EFF6FF",borderColor:"#4A9EE0"}} onClick={()=>startAdd("kid")}>
                  <div className="who-icon">🧒</div>
                  <div className="who-label" style={{color:"#2272b5"}}>It's me!</div>
                  <div className="who-desc" style={{color:"#2272b5"}}>I want to learn</div>
                </div>
                <div className="who-card" style={{background:"#F0FDF4",borderColor:"#34C76F"}} onClick={()=>startAdd("parent")}>
                  <div className="who-icon">👨‍👩‍👧</div>
                  <div className="who-label" style={{color:"#1e9c53"}}>Parent</div>
                  <div className="who-desc" style={{color:"#1e9c53"}}>Set up my child</div>
                </div>
              </div>
              {profiles.length>0&&(
                <button onClick={cancelAdd} style={{background:"none",border:"2px solid #e5e7eb",borderRadius:14,padding:"10px 22px",fontFamily:"'Quicksand',sans-serif",fontWeight:800,fontSize:14,color:"#6b7280",cursor:"pointer"}}>
                  ← Back to profiles
                </button>
              )}
            </>
          ):(
            <div className="setup-card">
              <div style={{fontSize:40,marginBottom:8,textAlign:"center"}}>{whoType==="kid"?"🧒":"👨‍👩‍👧"}</div>
              <div style={{fontFamily:"'Boogaloo',cursive",fontSize:22,color:"#111",marginBottom:4,textAlign:"center"}}>
                {whoType==="kid"?"What's your name?":"Child's name?"}
              </div>
              <div style={{fontSize:12,fontWeight:700,color:"#9ca3af",marginBottom:16,textAlign:"center"}}>
                {whoType==="kid"?"We'll personalise BrightMind just for you!":"We'll create a profile for your child"}
              </div>
              <input
                autoFocus
                value={name}
                onChange={e=>{setName(e.target.value);setNameError("");}}
                onKeyDown={e=>e.key==="Enter"&&submitProfile()}
                maxLength={14}
                placeholder={whoType==="kid"?"e.g. Lily":"e.g. James"}
                style={{width:"100%",padding:"12px 14px",fontSize:18,fontFamily:"'Boogaloo',cursive",border:`2.5px solid ${nameError?"#ef4444":"#e5e7eb"}`,borderRadius:14,outline:"none",marginBottom:6,textAlign:"center",color:"#111"}}
              />
              {nameError&&<div style={{color:"#ef4444",fontSize:12,fontWeight:700,marginBottom:8,textAlign:"center"}}>{nameError}</div>}
              <button className="next-btn" style={{background:"#16a34a",marginTop:10}} onClick={submitProfile}>
                {whoType==="kid"?"Let's go! 🚀":"Create profile 🌟"}
              </button>
              <button onClick={()=>{sounds.tap();setWhoType(null);}} style={{display:"block",margin:"10px auto 0",background:"none",border:"none",color:"#9ca3af",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return(
    <div className="welcome-wrap">
      <JungleBg/>
      <div style={{position:"relative",zIndex:1,width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div className="welcome-logo"><span>🌿</span><span className="welcome-logo-text">BrightMind</span></div>
        <div className="welcome-sub">Who's learning today? 👇</div>
        <div className="profile-grid">
          {profiles.map(p=>(
            <div key={p.id} className={`profile-card${p.id===activeId?" active-profile":""}`}
              onClick={()=>{sounds.tap();onSelectProfile(p.id);}}>
              {profiles.length>1&&(
                <button className="profile-delete" onClick={e=>{e.stopPropagation();onDeleteProfile(p.id);}}>✕</button>
              )}
              <AvatarSVG av={p.avatar} size={64}/>
              <div className="profile-name">{p.name}</div>
              <div className="profile-stats">
                {p.history.total} quizzes · {p.earned.length} badges
              </div>
              {p.id===activeId&&<div style={{fontSize:10,fontWeight:900,color:"#F6A800",marginTop:3}}>● Active</div>}
            </div>
          ))}
          {profiles.length<4&&(
            <div className="profile-card add-profile" onClick={()=>{sounds.tap();setShowAdd(true);}}>
              <div style={{fontSize:36,color:"#d1d5db",marginBottom:4}}>＋</div>
              <div className="profile-name" style={{color:"#9ca3af"}}>Add child</div>
              <div className="profile-stats">up to 4 profiles</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ─── Root ─────────────────────────────────────────────────────────────── */
export default function App(){
  const [profiles,setProfiles]=useState([]);
  const [activeId,setActiveId]=useState(null);
  const activeProfile=profiles.find(p=>p.id===activeId)||null;
  const progress=activeProfile?.progress||makeEmptyProgress();
  const history=activeProfile?.history||{total:0,perfectScores:0,bestStreak:0,improvements:0,spellPerfect:0,timesPerfect:0};
  const earned=activeProfile?.earned||[];
  const avatar=activeProfile?.avatar||DEFAULT_AVATAR;
  const defaultLevel=activeProfile?.defaultLevel||"easy";
  const ttMastery=activeProfile?.ttMastery||{};
  const updateProfile=(fields)=>setProfiles(ps=>ps.map(p=>p.id===activeId?{...p,...fields}:p));
  const [screen,setScreen]=useState("welcome");
  const [subject,setSubject]=useState(null);
  const [quizLevel,setQuizLevel]=useState("easy");
  const [ttTable,setTtTable]=useState(null);
  const [muted,setMuted]=useState(false);
  const [tab,setTab]=useState(0);
  const [toastQueue,setToastQueue]=useState([]);
  const rawSounds=useRef(null);
  if(!rawSounds.current)rawSounds.current=createSounds();
  const sounds={
    tap:()=>{if(!muted)rawSounds.current.tap();},
    correct:()=>{if(!muted)rawSounds.current.correct();},
    wrong:()=>{if(!muted)rawSounds.current.wrong();},
    fanfare:()=>{if(!muted)rawSounds.current.fanfare();},
    badge:()=>{if(!muted)rawSounds.current.badge();},
  };
  const addProfile=(name)=>{
    const p=makeProfile(name,{name});
    setProfiles(ps=>[...ps,p]);
    setActiveId(p.id);
    setScreen("avatar");
  };
  const selectProfile=(id)=>{setActiveId(id);setScreen("home");setTab(0);};
  const deleteProfile=(id)=>{
    setProfiles(ps=>ps.filter(p=>p.id!==id));
    if(activeId===id){setActiveId(null);setScreen("welcome");}
  };
  const checkAch=(np,nh,ce)=>ACHIEVEMENTS.filter(a=>!ce.includes(a.id)&&a.check(np,nh));
  const done=(score,streak)=>{
    const pct=score/TOTAL;
    const stars=pct===1?3:pct>=0.6?2:pct>=0.3?1:0;
    const old=progress[subject]||{stars:0,best:0,best_easy:0,best_medium:0,best_hard:0};
    const lk="best_"+quizLevel;
    const np={...progress,[subject]:{...old,stars:Math.max(old.stars,stars),best:Math.max(old.best,score),[lk]:Math.max(old[lk]||0,score)}};
    const nh={total:history.total+1,perfectScores:history.perfectScores+(score===TOTAL?1:0),bestStreak:Math.max(history.bestStreak,streak||0),improvements:history.improvements+(score>(old.best||0)&&(old.best||0)>0?1:0),spellPerfect:(history.spellPerfect||0)+(subject==="spelling"&&score===TOTAL?1:0),timesPerfect:history.timesPerfect||0};
    const nb=checkAch(np,nh,earned);
    const ne=nb.length>0?[...earned,...nb.map(b=>b.id)]:earned;
    updateProfile({progress:np,history:nh,earned:ne});
    if(nb.length>0)nb.forEach((b,i)=>{setTimeout(()=>{sounds.badge();setToastQueue(q=>[...q,b]);},i*3400);});
  };
  const doneTT=(score)=>{
    const nm={...ttMastery,[ttTable]:Math.max(ttMastery[ttTable]||0,score)};
    const pct=score/TT_QUESTIONS_PER_SESSION;
    const stars=pct===1?3:pct>=0.6?2:pct>=0.3?1:0;
    const ot=progress.times||{stars:0,best:0,best_easy:0,best_medium:0,best_hard:0};
    const np={...progress,times:{...ot,stars:Math.max(ot.stars,stars),best:Math.max(ot.best,score)}};
    const nh={...history,total:history.total+1,timesPerfect:(history.timesPerfect||0)+(score===TT_QUESTIONS_PER_SESSION?1:0)};
    const nb=checkAch(np,nh,earned);
    const ne=nb.length>0?[...earned,...nb.map(b=>b.id)]:earned;
    updateProfile({progress:np,history:nh,earned:ne,ttMastery:nm});
    if(nb.length>0)nb.forEach((b,i)=>{setTimeout(()=>{sounds.badge();setToastQueue(q=>[...q,b]);},i*3400);});
  };
  return(
    <ErrorBoundary>
      <style>{CSS}</style>
      <JungleBg/>
      {toastQueue.length>0&&<BadgeToast badge={toastQueue[0]} onDone={()=>setToastQueue(q=>q.slice(1))}/>}
      <div className="app">
        {screen==="welcome"&&<WelcomeScreen profiles={profiles} activeId={activeId} onSelectProfile={selectProfile} onAddProfile={addProfile} onDeleteProfile={deleteProfile} sounds={sounds}/>}
        {screen==="avatar"&&<AvatarBuilder avatar={avatar} onSave={av=>{updateProfile({avatar:{...av,name:av.name||activeProfile?.name||"Explorer"}});setScreen("home");}} onBack={()=>setScreen(profiles.length>0&&activeId?"home":"welcome")} sounds={sounds}/>}
        {screen==="home"&&activeProfile&&<Home progress={progress} history={history} earned={earned} defaultLevel={defaultLevel} onSetDefaultLevel={lv=>{sounds.tap();updateProfile({defaultLevel:lv});}} avatar={avatar} onEditAvatar={()=>{sounds.tap();setScreen("avatar");}} onSwitchProfile={()=>{sounds.tap();setScreen("welcome");}} onSelect={id=>{sounds.tap();if(id==="times"){setScreen("times-pick");setSubject("times");}else{setSubject(id);setScreen("diff-pick");}}} sounds={sounds} muted={muted} toggleMute={()=>setMuted(m=>!m)} tab={tab} setTab={setTab}/>}
        {screen==="diff-pick"&&subject&&<DifficultyPicker subject={subject} defaultLevel={defaultLevel} progress={progress} onStart={lv=>{setQuizLevel(lv);setScreen("quiz");}} onBack={()=>{setScreen("home");setSubject(null);}} sounds={sounds}/>}
        {screen==="quiz"&&subject&&<Quiz subjectId={subject} level={quizLevel} onBack={()=>setScreen("diff-pick")} onDone={done} sounds={sounds} muted={muted} toggleMute={()=>setMuted(m=>!m)}/>}
        {screen==="times-pick"&&<TimesTablePicker onStart={t=>{setTtTable(t);setScreen("times-quiz");}} onBack={()=>{setScreen("home");setSubject(null);}} sounds={sounds} mastery={ttMastery}/>}
        {screen==="times-quiz"&&ttTable&&<TimesTableQuiz table={ttTable} onBack={()=>setScreen("times-pick")} onDone={doneTT} sounds={sounds} muted={muted} toggleMute={()=>setMuted(m=>!m)}/>}
      </div>
    </ErrorBoundary>
  );
}
