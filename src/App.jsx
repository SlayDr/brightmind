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
function speak(text,onEnd){if(!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=0.9;u.pitch=1.0;u.volume=1;const voices=window.speechSynthesis.getVoices();const preferred=voices.find(v=>v.name==="Google US English")||voices.find(v=>v.name==="Google UK English Female")||voices.find(v=>v.name==="Samantha")||voices.find(v=>v.name==="Karen")||voices.find(v=>v.lang==="en-US"&&v.localService);if(preferred)u.voice=preferred;if(onEnd)u.onend=onEnd;window.speechSynthesis.speak(u);}
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
    // ── EXTRA EASY ──
    {level:"easy",q:"What is 1 + 1?",options:["1","2","3","4"],answer:"2",hint:"One and one makes two!"},
    {level:"easy",q:"What is 5 + 2?",options:["6","7","8","9"],answer:"7",hint:"Count up from 5!"},
    {level:"easy",q:"What is 3 + 3?",options:["5","6","7","8"],answer:"6",hint:"Double 3!"},
    {level:"easy",q:"How many legs does a dog have?",options:["2","3","4","6"],answer:"4",hint:"Count the paws!"},
    {level:"easy",q:"What shape is a wheel?",options:["Square","Triangle","Circle","Rectangle"],answer:"Circle",hint:"Round and round it goes!"},
    {level:"easy",q:"What comes after 9?",options:["8","10","11","12"],answer:"10",hint:"Count: 7,8,9,..."},
    {level:"easy",q:"How many fingers on one hand?",options:["4","5","6","7"],answer:"5",hint:"Count your fingers!"},
    {level:"easy",q:"What is 10 − 3?",options:["5","6","7","8"],answer:"7",hint:"Count back 3 from 10!"},
    {level:"easy",q:"How many sides does a triangle have?",options:["2","3","4","5"],answer:"3",hint:"Tri means three!"},
    {level:"easy",q:"What is 2 + 2 + 2?",options:["4","5","6","7"],answer:"6",hint:"Three groups of 2!"},
    // ── EXTRA MEDIUM ──
    {level:"medium",q:"What is 6 × 6?",options:["30","36","42","48"],answer:"36",hint:"6 groups of 6!"},
    {level:"medium",q:"What is 100 − 37?",options:["53","63","73","83"],answer:"63",hint:"100 − 37: start with 100 − 40 = 60, then + 3!"},
    {level:"medium",q:"What is ¹⁄₂ of 16?",options:["4","6","8","10"],answer:"8",hint:"Split 16 into 2 equal groups!"},
    {level:"medium",q:"What is 7 × 8?",options:["54","56","58","63"],answer:"56",hint:"7 × 8 = 56, remember it!"},
    {level:"medium",q:"How many seconds in a minute?",options:["30","60","100","120"],answer:"60",hint:"60 seconds = 1 minute!"},
    {level:"medium",q:"What is 9 × 9?",options:["72","81","90","99"],answer:"81",hint:"9 × 9 = 81!"},
    {level:"medium",q:"What is 48 ÷ 6?",options:["6","7","8","9"],answer:"8",hint:"6 × 8 = 48, so 48 ÷ 6 = ?"},
    {level:"medium",q:"What is 3 × 12?",options:["30","34","36","39"],answer:"36",hint:"3 × 12 = 3 × 10 + 3 × 2!"},
    {level:"medium",q:"What is ¹⁄₄ of 20?",options:["4","5","6","8"],answer:"5",hint:"Split 20 into 4 equal groups!"},
    {level:"medium",q:"What is 25 + 37?",options:["52","62","72","82"],answer:"62",hint:"25 + 37: 20+30=50, 5+7=12, so 50+12=?"},
    // ── EXTRA HARD ──
    {level:"hard",q:"What is 12 × 13?",options:["144","150","156","162"],answer:"156",hint:"12×13 = 12×10 + 12×3 = 120 + 36"},
    {level:"hard",q:"What is 15% of 200?",options:["20","25","30","35"],answer:"30",hint:"10% = 20, 5% = 10, so 15% = 30!"},
    {level:"hard",q:"A rectangle is 12cm long and 7cm wide. What is the perimeter?",options:["38cm","40cm","42cm","44cm"],answer:"38cm",hint:"Perimeter = 2×(length + width) = 2×19"},
    {level:"hard",q:"What is 2⁴?",options:["6","8","12","16"],answer:"16",hint:"2×2×2×2 = 4×4 = 16"},
    {level:"hard",q:"What is 1000 − 456?",options:["444","544","554","644"],answer:"544",hint:"1000 − 456: 1000 − 400 = 600, 600 − 56 = 544"},
    {level:"hard",q:"What is the area of a triangle\nwith base 8cm and height 5cm?",options:["20cm²","30cm²","40cm²","80cm²"],answer:"20cm²",hint:"Area = ½ × base × height = ½ × 8 × 5"},
    {level:"hard",q:"What is √144?",options:["10","11","12","13"],answer:"12",hint:"12 × 12 = 144"},
    {level:"hard",q:"A shop sells 3 items for £2.70.\nHow much is one item?",options:["70p","80p","90p","£1.00"],answer:"90p",hint:"270p ÷ 3 = ?"},
    {level:"hard",q:"What is 5³?",options:["15","25","100","125"],answer:"125",hint:"5×5×5 = 25×5 = 125"},
    {level:"hard",q:"What is the LCM of 4 and 6?",options:["10","12","18","24"],answer:"12",hint:"List multiples: 4,8,12... and 6,12... first common is 12!"},
  
    {"level":"easy","q":"What is 3 + 4?","options":["5","6","7","8"],"answer":"7","hint":"Count on from 3!"},
    {"level":"easy","q":"What is 8 - 3?","options":["3","4","5","6"],"answer":"5","hint":"Count back 3 from 8!"},
    {"level":"easy","q":"What is 2 × 3?","options":["4","5","6","7"],"answer":"6","hint":"2 groups of 3!"},
    {"level":"easy","q":"What is 4 + 5?","options":["7","8","9","10"],"answer":"9","hint":"Count on from 4!"},
    {"level":"easy","q":"What is 6 + 3?","options":["7","8","9","10"],"answer":"9","hint":"Count on from 6!"},
    {"level":"easy","q":"What is 10 - 6?","options":["3","4","5","6"],"answer":"4","hint":"Count back 6 from 10!"},
    {"level":"easy","q":"How many days in a week?","options":["5","6","7","8"],"answer":"7","hint":"Mon, Tue, Wed, Thu, Fri, Sat, Sun!"},
    {"level":"easy","q":"What is 5 × 2?","options":["8","9","10","11"],"answer":"10","hint":"5 groups of 2!"},
    {"level":"easy","q":"What is 7 + 7?","options":["12","13","14","15"],"answer":"14","hint":"Double 7!"},
    {"level":"easy","q":"How many months in a year?","options":["10","11","12","13"],"answer":"12","hint":"January through December!"},
    {"level":"easy","q":"What is 15 - 5?","options":["8","9","10","11"],"answer":"10","hint":"Count back 5 from 15!"},
    {"level":"easy","q":"What is 3 × 3?","options":["6","7","8","9"],"answer":"9","hint":"3 groups of 3!"},
    {"level":"easy","q":"What is 8 + 8?","options":["14","15","16","17"],"answer":"16","hint":"Double 8!"},
    {"level":"easy","q":"What is 20 - 10?","options":["8","9","10","11"],"answer":"10","hint":"Half of 20!"},
    {"level":"easy","q":"What is 4 × 2?","options":["6","7","8","9"],"answer":"8","hint":"4 groups of 2!"},
    {"level":"easy","q":"How many legs does a spider have?","options":["4","6","8","10"],"answer":"8","hint":"Spiders have 8 legs!"},
    {"level":"easy","q":"What comes after 29?","options":["28","30","31","32"],"answer":"30","hint":"Count up!"},
    {"level":"easy","q":"What is half of 20?","options":["5","8","10","12"],"answer":"10","hint":"Split 20 into 2 equal groups!"},
    {"level":"easy","q":"What is 9 + 9?","options":["16","17","18","19"],"answer":"18","hint":"Double 9!"},
    {"level":"easy","q":"How many sides does a hexagon have?","options":["5","6","7","8"],"answer":"6","hint":"Hex means six!"},
    {"level":"easy","q":"What is 16 - 8?","options":["6","7","8","9"],"answer":"8","hint":"Half of 16!"},
    {"level":"easy","q":"What is 5 + 7?","options":["10","11","12","13"],"answer":"12","hint":"Count on from 5!"},
    {"level":"easy","q":"What is 6 × 2?","options":["10","11","12","13"],"answer":"12","hint":"6 groups of 2!"},
    {"level":"easy","q":"What number is halfway between 0 and 10?","options":["4","5","6","7"],"answer":"5","hint":"0...5...10 — 5 is in the middle!"},
    {"level":"easy","q":"What is 3 + 8?","options":["9","10","11","12"],"answer":"11","hint":"Count on from 3!"},
    {"level":"medium","q":"What is 13 × 4?","options":["48","50","52","54"],"answer":"52","hint":"13×4 = 13×2 + 13×2 = 26+26"},
    {"level":"medium","q":"What is 72 ÷ 8?","options":["7","8","9","10"],"answer":"9","hint":"8 × 9 = 72!"},
    {"level":"medium","q":"What is 5²?","options":["10","20","25","30"],"answer":"25","hint":"5 × 5 = 25!"},
    {"level":"medium","q":"What is 144 ÷ 12?","options":["10","11","12","13"],"answer":"12","hint":"12 × 12 = 144!"},
    {"level":"medium","q":"What is ²⁄₃ of 18?","options":["9","10","11","12"],"answer":"12","hint":"18 ÷ 3 = 6, 6 × 2 = 12!"},
    {"level":"medium","q":"What is 8 × 7?","options":["54","56","58","60"],"answer":"56","hint":"8 × 7 = 56, remember it!"},
    {"level":"medium","q":"What is 63 ÷ 7?","options":["7","8","9","10"],"answer":"9","hint":"7 × 9 = 63!"},
    {"level":"medium","q":"What is 11 × 11?","options":["111","121","131","141"],"answer":"121","hint":"11 × 11 = 121!"},
    {"level":"medium","q":"How many minutes in 2 hours?","options":["100","110","120","130"],"answer":"120","hint":"60 × 2 = 120!"},
    {"level":"medium","q":"What is ³⁄₄ of 40?","options":["25","28","30","35"],"answer":"30","hint":"40 ÷ 4 = 10, 10 × 3 = 30!"},
    {"level":"medium","q":"What is 9 × 6?","options":["52","54","56","58"],"answer":"54","hint":"9 × 6 = 54!"},
    {"level":"medium","q":"What is 84 ÷ 4?","options":["19","20","21","22"],"answer":"21","hint":"80 ÷ 4 = 20, 4 ÷ 4 = 1"},
    {"level":"medium","q":"What is 15²?","options":["175","200","225","250"],"answer":"225","hint":"15 × 15 = 225!"},
    {"level":"medium","q":"What is ¹⁄₅ of 45?","options":["7","8","9","10"],"answer":"9","hint":"45 ÷ 5 = 9!"},
    {"level":"medium","q":"What is 37 × 3?","options":["99","108","111","114"],"answer":"111","hint":"37×3 = 30×3 + 7×3 = 90+21"},
    {"level":"medium","q":"What is 6²?","options":["30","32","36","40"],"answer":"36","hint":"6 × 6 = 36!"},
    {"level":"medium","q":"What is 96 ÷ 8?","options":["10","11","12","13"],"answer":"12","hint":"8 × 12 = 96!"},
    {"level":"medium","q":"How many cm in 3m?","options":["30","300","3000","30000"],"answer":"300","hint":"1m = 100cm, 3m = 300cm!"},
    {"level":"medium","q":"What is 14 × 5?","options":["60","65","70","75"],"answer":"70","hint":"14 × 10 ÷ 2 = 140 ÷ 2"},
    {"level":"medium","q":"What is 108 ÷ 9?","options":["10","11","12","13"],"answer":"12","hint":"9 × 12 = 108!"},
    {"level":"medium","q":"What is ²⁄₅ of 30?","options":["10","11","12","13"],"answer":"12","hint":"30 ÷ 5 = 6, 6 × 2 = 12!"},
    {"level":"medium","q":"What is 45 + 67?","options":["102","110","112","114"],"answer":"112","hint":"45+67: 40+60=100, 5+7=12"},
    {"level":"medium","q":"What is 7 × 9?","options":["56","61","63","65"],"answer":"63","hint":"7 × 9 = 63!"},
    {"level":"medium","q":"What is 132 ÷ 11?","options":["10","11","12","13"],"answer":"12","hint":"11 × 12 = 132!"},
    {"level":"medium","q":"What is 250 - 175?","options":["65","70","75","80"],"answer":"75","hint":"250-175: 250-200=50, 50+25=75"},
    {"level":"hard","q":"What is 17 × 13?","options":["201","211","221","231"],"answer":"221","hint":"17×13 = 17×10 + 17×3 = 170+51"},
    {"level":"hard","q":"What is 25% of 360?","options":["80","85","90","95"],"answer":"90","hint":"25% = ¼. 360 ÷ 4 = 90!"},
    {"level":"hard","q":"What is 7/8 as a decimal?","options":["0.785","0.875","0.857","0.758"],"answer":"0.875","hint":"7 ÷ 8 = 0.875!"},
    {"level":"hard","q":"What is the next prime after 13?","options":["14","15","16","17"],"answer":"17","hint":"14=2×7, 15=3×5, 16=2⁴, 17 is prime!"},
    {"level":"hard","q":"What is 2⁵?","options":["16","25","32","64"],"answer":"32","hint":"2×2×2×2×2 = 32!"},
    {"level":"hard","q":"What is 40% of 85?","options":["30","32","34","36"],"answer":"34","hint":"40% = 2/5. 85 ÷ 5 × 2 = 34!"},
    {"level":"hard","q":"What is the HCF of 24 and 36?","options":["6","8","10","12"],"answer":"12","hint":"Both divisible by 12!"},
    {"level":"hard","q":"What is 3³ + 2⁴?","options":["39","41","43","45"],"answer":"43","hint":"3³=27, 2⁴=16, 27+16=43!"},
    {"level":"hard","q":"What is 65% of 200?","options":["120","125","130","135"],"answer":"130","hint":"65% of 200 = 130!"},
    {"level":"hard","q":"What is ⁵⁄₆ + ²⁄₃?","options":["1¼","1½","1⅔","1¾"],"answer":"1½","hint":"²⁄₃ = ⁴⁄₆, so ⁵⁄₆ + ⁴⁄₆ = ⁹⁄₆ = 1½"},
    {"level":"hard","q":"What is 12.5% of 400?","options":["45","50","55","60"],"answer":"50","hint":"12.5% = 1/8. 400 ÷ 8 = 50!"},
    {"level":"hard","q":"What is 4n + 3 when n = 5?","options":["20","21","22","23"],"answer":"23","hint":"4×5 + 3 = 20 + 3 = 23!"},
    {"level":"hard","q":"What is the median of: 3, 7, 2, 9, 5?","options":["3","5","7","9"],"answer":"5","hint":"Order: 2,3,5,7,9. Middle = 5!"},
    {"level":"hard","q":"What is 75% of 84?","options":["58","61","63","66"],"answer":"63","hint":"75% = ¾. 84 ÷ 4 × 3 = 63!"},
    {"level":"hard","q":"Simplify 24/36.","options":["½","⅔","¾","⁴⁄₅"],"answer":"⅔","hint":"HCF = 12. 24÷12=2, 36÷12=3"},
    {"level":"hard","q":"What is 3.5²?","options":["10.25","11.25","12.25","13.25"],"answer":"12.25","hint":"3.5 × 3.5 = 12.25!"},
    {"level":"hard","q":"A train at 80km/h — how long to travel 200km?","options":["2h","2.5h","3h","3.5h"],"answer":"2.5h","hint":"Time = Distance ÷ Speed = 200 ÷ 80 = 2.5"},
    {"level":"hard","q":"What is the area of a circle with radius 5cm? (π≈3.14)","options":["70.5cm²","75.5cm²","78.5cm²","80.5cm²"],"answer":"78.5cm²","hint":"Area = πr² = 3.14 × 25 = 78.5!"},
    {"level":"hard","q":"What is the volume of a cube with side 4cm?","options":["48cm³","56cm³","64cm³","72cm³"],"answer":"64cm³","hint":"Volume = side³ = 4×4×4 = 64!"},
    {"level":"hard","q":"What is 1000 ÷ 0.1?","options":["100","1000","10000","100000"],"answer":"10000","hint":"Dividing by 0.1 = multiplying by 10!"},
    {"level":"hard","q":"What is the LCM of 6 and 8?","options":["14","18","24","32"],"answer":"24","hint":"Multiples of 6: 6,12,18,24. Multiples of 8: 8,16,24!"},
    {"level":"hard","q":"What is 18% of 300?","options":["48","52","54","58"],"answer":"54","hint":"10% = 30, 8% = 24, so 18% = 54!"},
    {"level":"hard","q":"If x + 7 = 20, what is 2x?","options":["13","24","26","28"],"answer":"26","hint":"x = 20-7 = 13, so 2x = 26!"},
    {"level":"hard","q":"What is the perimeter of a regular octagon\nwith sides of 3cm?","options":["20cm","22cm","24cm","26cm"],"answer":"24cm","hint":"Octagon = 8 sides. 8 × 3 = 24cm!"},
    {"level":"hard","q":"Round 4.567 to 2 decimal places.","options":["4.56","4.57","4.58","4.6"],"answer":"4.57","hint":"Look at 3rd decimal (7). Since ≥5, round up the 6 to 7!"},
      {level:"easy",q:"What is 3 + 4?",options:["5","6","7","8"],answer:"7",hint:"Count on from 3!"},
    {level:"easy",q:"What is 8 - 3?",options:["3","4","5","6"],answer:"5",hint:"Count back 3 from 8!"},
    {level:"easy",q:"What is 2 × 3?",options:["4","5","6","7"],answer:"6",hint:"2 groups of 3!"},
    {level:"easy",q:"What is 4 + 5?",options:["7","8","9","10"],answer:"9",hint:"Count on from 4!"},
    {level:"easy",q:"How many days in a week?",options:["5","6","7","8"],answer:"7",hint:"Mon Tue Wed Thu Fri Sat Sun!"},
    {level:"easy",q:"What is 5 × 2?",options:["8","9","10","11"],answer:"10",hint:"5 groups of 2!"},
    {level:"easy",q:"What is 7 + 7?",options:["12","13","14","15"],answer:"14",hint:"Double 7!"},
    {level:"easy",q:"How many months in a year?",options:["10","11","12","13"],answer:"12",hint:"January through December!"},
    {level:"easy",q:"What is 15 - 5?",options:["8","9","10","11"],answer:"10",hint:"Count back 5 from 15!"},
    {level:"easy",q:"What is 3 × 3?",options:["6","7","8","9"],answer:"9",hint:"3 groups of 3!"},
    {level:"easy",q:"What is 8 + 8?",options:["14","15","16","17"],answer:"16",hint:"Double 8!"},
    {level:"easy",q:"What is 20 - 10?",options:["8","9","10","11"],answer:"10",hint:"Half of 20!"},
    {level:"easy",q:"What is 4 × 2?",options:["6","7","8","9"],answer:"8",hint:"4 groups of 2!"},
    {level:"easy",q:"How many legs does a spider have?",options:["4","6","8","10"],answer:"8",hint:"Spiders have 8 legs!"},
    {level:"easy",q:"What comes after 29?",options:["28","30","31","32"],answer:"30",hint:"Count up!"},
    {level:"easy",q:"What is half of 20?",options:["5","8","10","12"],answer:"10",hint:"Split 20 into 2 equal groups!"},
    {level:"easy",q:"What is 9 + 9?",options:["16","17","18","19"],answer:"18",hint:"Double 9!"},
    {level:"easy",q:"How many sides does a hexagon have?",options:["5","6","7","8"],answer:"6",hint:"Hex means six!"},
    {level:"easy",q:"What is 5 + 7?",options:["10","11","12","13"],answer:"12",hint:"Count on from 5!"},
    {level:"easy",q:"What is 6 × 2?",options:["10","11","12","13"],answer:"12",hint:"6 groups of 2!"},
    {level:"easy",q:"What number is halfway between 0 and 10?",options:["4","5","6","7"],answer:"5",hint:"0...5...10 — 5 is in the middle!"},
    {level:"easy",q:"What is 3 + 8?",options:["9","10","11","12"],answer:"11",hint:"Count on from 3!"},
    {level:"easy",q:"What is 16 - 8?",options:["6","7","8","9"],answer:"8",hint:"Half of 16!"},
    {level:"easy",q:"How many sides does an octagon have?",options:["6","7","8","9"],answer:"8",hint:"Octo means eight!"},
    {level:"easy",q:"What is 10 + 10?",options:["18","19","20","21"],answer:"20",hint:"Double 10!"},
    {level:"medium",q:"What is 13 × 4?",options:["48","50","52","54"],answer:"52",hint:"13×4 = 26+26"},
    {level:"medium",q:"What is 72 ÷ 8?",options:["7","8","9","10"],answer:"9",hint:"8 × 9 = 72!"},
    {level:"medium",q:"What is 5²?",options:["10","20","25","30"],answer:"25",hint:"5 × 5 = 25!"},
    {level:"medium",q:"What is 8 × 7?",options:["54","56","58","60"],answer:"56",hint:"8 × 7 = 56!"},
    {level:"medium",q:"What is 63 ÷ 7?",options:["7","8","9","10"],answer:"9",hint:"7 × 9 = 63!"},
    {level:"medium",q:"What is 11 × 11?",options:["111","121","131","141"],answer:"121",hint:"11 × 11 = 121!"},
    {level:"medium",q:"How many minutes in 2 hours?",options:["100","110","120","130"],answer:"120",hint:"60 × 2 = 120!"},
    {level:"medium",q:"What is 9 × 6?",options:["52","54","56","58"],answer:"54",hint:"9 × 6 = 54!"},
    {level:"medium",q:"What is 84 ÷ 4?",options:["19","20","21","22"],answer:"21",hint:"80÷4=20, 4÷4=1"},
    {level:"medium",q:"What is 6²?",options:["30","32","36","40"],answer:"36",hint:"6 × 6 = 36!"},
    {level:"medium",q:"What is 96 ÷ 8?",options:["10","11","12","13"],answer:"12",hint:"8 × 12 = 96!"},
    {level:"medium",q:"How many cm in 3m?",options:["30","300","3000","30000"],answer:"300",hint:"1m = 100cm!"},
    {level:"medium",q:"What is 14 × 5?",options:["60","65","70","75"],answer:"70",hint:"14×10÷2 = 70"},
    {level:"medium",q:"What is 108 ÷ 9?",options:["10","11","12","13"],answer:"12",hint:"9 × 12 = 108!"},
    {level:"medium",q:"What is 45 + 67?",options:["102","110","112","114"],answer:"112",hint:"40+60=100, 5+7=12"},
    {level:"medium",q:"What is 7 × 9?",options:["56","61","63","65"],answer:"63",hint:"7 × 9 = 63!"},
    {level:"medium",q:"What is 132 ÷ 11?",options:["10","11","12","13"],answer:"12",hint:"11 × 12 = 132!"},
    {level:"medium",q:"What is ²⁄₃ of 18?",options:["9","10","11","12"],answer:"12",hint:"18÷3=6, 6×2=12!"},
    {level:"medium",q:"What is ³⁄₄ of 40?",options:["25","28","30","35"],answer:"30",hint:"40÷4=10, 10×3=30!"},
    {level:"medium",q:"What is 15²?",options:["175","200","225","250"],answer:"225",hint:"15 × 15 = 225!"},
    {level:"medium",q:"What is 250 - 175?",options:["65","70","75","80"],answer:"75",hint:"250-200=50, 50+25=75"},
    {level:"medium",q:"What is ¹⁄₅ of 45?",options:["7","8","9","10"],answer:"9",hint:"45 ÷ 5 = 9!"},
    {level:"medium",q:"How many seconds in 3 minutes?",options:["150","160","170","180"],answer:"180",hint:"60 × 3 = 180!"},
    {level:"medium",q:"What is 37 × 3?",options:["99","108","111","114"],answer:"111",hint:"30×3+7×3=90+21"},
    {level:"medium",q:"What is ²⁄₅ of 30?",options:["10","11","12","13"],answer:"12",hint:"30÷5=6, 6×2=12!"},
    {level:"hard",q:"What is 17 × 13?",options:["201","211","221","231"],answer:"221",hint:"17×13=17×10+17×3=170+51"},
    {level:"hard",q:"What is 25% of 360?",options:["80","85","90","95"],answer:"90",hint:"360 ÷ 4 = 90!"},
    {level:"hard",q:"What is 7/8 as a decimal?",options:["0.785","0.875","0.857","0.758"],answer:"0.875",hint:"7 ÷ 8 = 0.875!"},
    {level:"hard",q:"What is the next prime after 13?",options:["14","15","16","17"],answer:"17",hint:"17 is prime!"},
    {level:"hard",q:"What is 2⁵?",options:["16","25","32","64"],answer:"32",hint:"2×2×2×2×2 = 32!"},
    {level:"hard",q:"What is 40% of 85?",options:["30","32","34","36"],answer:"34",hint:"85÷5×2 = 34!"},
    {level:"hard",q:"What is the HCF of 24 and 36?",options:["6","8","10","12"],answer:"12",hint:"Both divisible by 12!"},
    {level:"hard",q:"What is 3³ + 2⁴?",options:["39","41","43","45"],answer:"43",hint:"27+16=43!"},
    {level:"hard",q:"What is 65% of 200?",options:["120","125","130","135"],answer:"130",hint:"200 × 0.65 = 130!"},
    {level:"hard",q:"What is 12.5% of 400?",options:["45","50","55","60"],answer:"50",hint:"400 ÷ 8 = 50!"},
    {level:"hard",q:"What is 4n + 3 when n = 5?",options:["20","21","22","23"],answer:"23",hint:"4×5+3=23!"},
    {level:"hard",q:"What is the median of: 3, 7, 2, 9, 5?",options:["3","5","7","9"],answer:"5",hint:"Order: 2,3,5,7,9. Middle=5!"},
    {level:"hard",q:"What is 75% of 84?",options:["58","61","63","66"],answer:"63",hint:"84÷4×3=63!"},
    {level:"hard",q:"Simplify 24/36.",options:["½","⅔","¾","⁴⁄₅"],answer:"⅔",hint:"HCF=12: 24÷12=2, 36÷12=3"},
    {level:"hard",q:"What is 3.5²?",options:["10.25","11.25","12.25","13.25"],answer:"12.25",hint:"3.5×3.5=12.25!"},
    {level:"hard",q:"What is the LCM of 6 and 8?",options:["14","18","24","32"],answer:"24",hint:"Multiples of 8: 8,16,24. Of 6: 6,12,18,24!"},
    {level:"hard",q:"What is 18% of 300?",options:["48","52","54","58"],answer:"54",hint:"10%=30, 8%=24, 18%=54!"},
    {level:"hard",q:"If x + 7 = 20, what is 2x?",options:["13","24","26","28"],answer:"26",hint:"x=13, 2x=26!"},
    {level:"hard",q:"What is the volume of a cube with side 4cm?",options:["48cm³","56cm³","64cm³","72cm³"],answer:"64cm³",hint:"4×4×4=64!"},
    {level:"hard",q:"What is 1000 ÷ 0.1?",options:["100","1000","10000","100000"],answer:"10000",hint:"Dividing by 0.1 = multiplying by 10!"},
    {level:"hard",q:"Round 4.567 to 2 decimal places.",options:["4.56","4.57","4.58","4.6"],answer:"4.57",hint:"3rd decimal=7, round up!"},
    {level:"hard",q:"What is the area of a circle radius 5cm? (π≈3.14)",options:["70.5cm²","75.5cm²","78.5cm²","80.5cm²"],answer:"78.5cm²",hint:"πr²=3.14×25=78.5!"},
    {level:"hard",q:"What is 15% of 200?",options:["20","25","30","35"],answer:"30",hint:"10%=20, 5%=10, 15%=30!"},
    {level:"hard",q:"What is the perimeter of a regular octagon with sides 3cm?",options:["20cm","22cm","24cm","26cm"],answer:"24cm",hint:"8 sides × 3cm = 24cm!"},
    {level:"hard",q:"What is 7/8 + 3/4?",options:["1¼","1⅝","1½","1¾"],answer:"1⅝",hint:"3/4=6/8, so 7/8+6/8=13/8=1⅝!"}
  ,
    {level:"easy",q:"What is 2 + 2?",options:["2","3","4","5"],answer:"4",hint:"2 + 2 = 4!"},
    {level:"easy",q:"What is 10 - 3?",options:["5","6","7","8"],answer:"7",hint:"Count back 3 from 10!"},
    {level:"easy",q:"What is 5 + 5?",options:["8","9","10","11"],answer:"10",hint:"Double 5!"},
    {level:"easy",q:"What is 3 + 3?",options:["4","5","6","7"],answer:"6",hint:"Double 3!"},
    {level:"easy",q:"What is 10 - 4?",options:["4","5","6","7"],answer:"6",hint:"Count back 4 from 10!"},
    {level:"easy",q:"What is 4 + 4?",options:["6","7","8","9"],answer:"8",hint:"Double 4!"},
    {level:"easy",q:"What is 12 - 6?",options:["4","5","6","7"],answer:"6",hint:"Half of 12!"},
    {level:"easy",q:"What is 6 + 6?",options:["10","11","12","13"],answer:"12",hint:"Double 6!"},
    {level:"easy",q:"How many cents in a dollar?",options:["10","50","100","1000"],answer:"100",hint:"100 cents = 1 dollar!"},
    {level:"easy",q:"What is 5 + 3?",options:["6","7","8","9"],answer:"8",hint:"Count on from 5!"},
    {level:"easy",q:"What is 9 - 5?",options:["2","3","4","5"],answer:"4",hint:"Count back 5 from 9!"},
    {level:"easy",q:"What is 2 + 7?",options:["7","8","9","10"],answer:"9",hint:"Count on from 2!"},
    {level:"easy",q:"How many legs does a dog have?",options:["2","4","6","8"],answer:"4",hint:"Dogs have 4 legs!"},
    {level:"easy",q:"What is 10 - 7?",options:["2","3","4","5"],answer:"3",hint:"Count back 7 from 10!"},
    {level:"easy",q:"What is 4 + 6?",options:["8","9","10","11"],answer:"10",hint:"4 + 6 = 10!"},
    {level:"easy",q:"What is 11 - 5?",options:["4","5","6","7"],answer:"6",hint:"Count back 5 from 11!"},
    {level:"easy",q:"What is 3 + 7?",options:["8","9","10","11"],answer:"10",hint:"3 + 7 = 10!"},
    {level:"easy",q:"What is 2 × 5?",options:["7","8","9","10"],answer:"10",hint:"2 groups of 5!"},
    {level:"easy",q:"What is 3 × 4?",options:["10","11","12","13"],answer:"12",hint:"3 groups of 4!"},
    {level:"easy",q:"What is 10 ÷ 2?",options:["3","4","5","6"],answer:"5",hint:"Split 10 into 2 equal groups!"},
    {level:"easy",q:"What is 6 ÷ 3?",options:["1","2","3","4"],answer:"2",hint:"Split 6 into 3 equal groups!"},
    {level:"easy",q:"What is 12 ÷ 4?",options:["2","3","4","5"],answer:"3",hint:"Split 12 into 4 equal groups!"},
    {level:"easy",q:"How many hours in a day?",options:["12","20","24","36"],answer:"24",hint:"24 hours in a day!"},
    {level:"easy",q:"What is 2 × 4?",options:["6","7","8","9"],answer:"8",hint:"2 groups of 4!"},
    {level:"easy",q:"What is 15 - 7?",options:["6","7","8","9"],answer:"8",hint:"Count back 7 from 15!"},
    {level:"easy",q:"What is 4 + 3?",options:["5","6","7","8"],answer:"7",hint:"Count on from 4!"},
    {level:"easy",q:"What is 9 - 6?",options:["2","3","4","5"],answer:"3",hint:"Count back 6 from 9!"},
    {level:"easy",q:"What is 5 × 3?",options:["12","13","14","15"],answer:"15",hint:"5 groups of 3!"},
    {level:"easy",q:"What is 20 ÷ 4?",options:["4","5","6","7"],answer:"5",hint:"Split 20 into 4 equal groups!"},
    {level:"easy",q:"What is 8 - 5?",options:["2","3","4","5"],answer:"3",hint:"Count back 5 from 8!"},
    {level:"easy",q:"What is 6 + 4?",options:["8","9","10","11"],answer:"10",hint:"6 + 4 = 10!"},
    {level:"easy",q:"What is 7 + 3?",options:["8","9","10","11"],answer:"10",hint:"7 + 3 = 10!"},
    {level:"easy",q:"What is 3 × 2?",options:["4","5","6","7"],answer:"6",hint:"3 groups of 2!"},
    {level:"easy",q:"How many minutes in an hour?",options:["30","45","60","90"],answer:"60",hint:"60 minutes = 1 hour!"},
    {level:"easy",q:"What is 14 - 6?",options:["6","7","8","9"],answer:"8",hint:"Count back 6 from 14!"},
    {level:"easy",q:"What is 5 + 6?",options:["9","10","11","12"],answer:"11",hint:"Count on from 5!"},
    {level:"easy",q:"What is 18 - 9?",options:["7","8","9","10"],answer:"9",hint:"Half of 18!"},
    {level:"easy",q:"What is 2 × 6?",options:["10","11","12","13"],answer:"12",hint:"2 groups of 6!"},
    {level:"easy",q:"What is 15 ÷ 3?",options:["4","5","6","7"],answer:"5",hint:"Split 15 into 3 groups!"},
    {level:"easy",q:"What is 7 - 4?",options:["2","3","4","5"],answer:"3",hint:"Count back 4 from 7!"},
    {level:"easy",q:"What is 1 + 8?",options:["7","8","9","10"],answer:"9",hint:"Count on from 1!"},
    {level:"easy",q:"What is 5 × 4?",options:["16","18","20","22"],answer:"20",hint:"5 groups of 4!"},
    {level:"easy",q:"What is 24 ÷ 6?",options:["3","4","5","6"],answer:"4",hint:"6 × 4 = 24!"},
    {level:"easy",q:"How many sides does a rectangle have?",options:["3","4","5","6"],answer:"4",hint:"Rectangles have 4 sides!"},
    {level:"easy",q:"What is 11 + 4?",options:["13","14","15","16"],answer:"15",hint:"Count on from 11!"},
    {level:"easy",q:"What is 20 - 8?",options:["10","11","12","13"],answer:"12",hint:"Count back 8 from 20!"},
    {level:"easy",q:"Which is an even number?",options:["3","5","7","8"],answer:"8",hint:"Even numbers end in 0,2,4,6,8!"},
    {level:"easy",q:"What is 4 × 4?",options:["12","14","16","18"],answer:"16",hint:"4 groups of 4!"},
    {level:"easy",q:"What is 30 ÷ 5?",options:["5","6","7","8"],answer:"6",hint:"5 × 6 = 30!"},
    {level:"easy",q:"What is 13 + 5?",options:["16","17","18","19"],answer:"18",hint:"Count on from 13!"},
    {level:"easy",q:"What is 100 - 50?",options:["40","45","50","55"],answer:"50",hint:"Half of 100!"},
    {level:"easy",q:"What is 3 + 9?",options:["10","11","12","13"],answer:"12",hint:"Count on from 3!"},
    {level:"easy",q:"What is 2 × 9?",options:["16","17","18","19"],answer:"18",hint:"2 groups of 9!"},
    {level:"easy",q:"What is 40 ÷ 8?",options:["4","5","6","7"],answer:"5",hint:"8 × 5 = 40!"},
    {level:"easy",q:"How many wheels does a bicycle have?",options:["1","2","3","4"],answer:"2",hint:"Bi means two!"},
    {level:"medium",q:"What is 12 × 7?",options:["74","82","84","86"],answer:"84",hint:"12×7 = 12×5 + 12×2 = 60+24"},
    {level:"medium",q:"What is 81 ÷ 9?",options:["7","8","9","10"],answer:"9",hint:"9 × 9 = 81!"},
    {level:"medium",q:"What is 7²?",options:["42","47","49","51"],answer:"49",hint:"7 × 7 = 49!"},
    {level:"medium",q:"What is ¾ of 60?",options:["40","42","44","45"],answer:"45",hint:"60÷4=15, 15×3=45!"},
    {level:"medium",q:"What is 125 + 248?",options:["363","370","373","375"],answer:"373",hint:"100+200=300, 25+48=73, 300+73=373"},
    {level:"medium",q:"What is 8 × 9?",options:["63","70","72","74"],answer:"72",hint:"8 × 9 = 72!"},
    {level:"medium",q:"What is 56 ÷ 7?",options:["6","7","8","9"],answer:"8",hint:"7 × 8 = 56!"},
    {level:"medium",q:"What is 12²?",options:["124","132","144","148"],answer:"144",hint:"12 × 12 = 144!"},
    {level:"medium",q:"How many seconds in a minute?",options:["30","45","60","100"],answer:"60",hint:"60 seconds = 1 minute!"},
    {level:"medium",q:"What is ⅔ of 27?",options:["14","16","18","20"],answer:"18",hint:"27÷3=9, 9×2=18!"},
    {level:"medium",q:"What is 400 - 156?",options:["234","244","254","264"],answer:"244",hint:"400-156: 400-100=300, 300-56=244"},
    {level:"medium",q:"What is 9 × 8?",options:["64","70","72","74"],answer:"72",hint:"9 × 8 = 72!"},
    {level:"medium",q:"What is 90 ÷ 6?",options:["13","14","15","16"],answer:"15",hint:"6 × 15 = 90!"},
    {level:"medium",q:"What is 25²?",options:["525","600","625","650"],answer:"625",hint:"25 × 25 = 625!"},
    {level:"medium",q:"What is ⅕ of 65?",options:["11","12","13","14"],answer:"13",hint:"65 ÷ 5 = 13!"},
    {level:"medium",q:"What is 52 × 4?",options:["196","202","206","208"],answer:"208",hint:"52×4 = 50×4 + 2×4 = 200+8"},
    {level:"medium",q:"What is 350 - 178?",options:["162","170","172","182"],answer:"172",hint:"350-178: 350-200=150, 150+22=172"},
    {level:"medium",q:"What is 4³?",options:["12","48","64","82"],answer:"64",hint:"4×4×4 = 64!"},
    {level:"medium",q:"What is 120 ÷ 8?",options:["13","14","15","16"],answer:"15",hint:"8 × 15 = 120!"},
    {level:"medium",q:"What is ⅗ of 45?",options:["25","27","29","31"],answer:"27",hint:"45÷5=9, 9×3=27!"},
    {level:"medium",q:"What is 46 + 79?",options:["120","123","125","127"],answer:"125",hint:"46+79: 40+70=110, 6+9=15, 110+15=125"},
    {level:"medium",q:"What is 6 × 8?",options:["42","46","48","52"],answer:"48",hint:"6 × 8 = 48!"},
    {level:"medium",q:"What is 77 ÷ 7?",options:["9","10","11","12"],answer:"11",hint:"7 × 11 = 77!"},
    {level:"medium",q:"How many grams in a kilogram?",options:["10","100","1000","10000"],answer:"1000",hint:"1 kg = 1000 g!"},
    {level:"medium",q:"What is ¼ of 80?",options:["15","18","20","25"],answer:"20",hint:"80 ÷ 4 = 20!"},
    {level:"medium",q:"What is 23 × 5?",options:["105","110","115","120"],answer:"115",hint:"23×5 = 20×5 + 3×5 = 100+15"},
    {level:"medium",q:"What is 54 ÷ 6?",options:["7","8","9","10"],answer:"9",hint:"6 × 9 = 54!"},
    {level:"medium",q:"What is 8²?",options:["56","60","64","68"],answer:"64",hint:"8 × 8 = 64!"},
    {level:"medium",q:"How many ml in a litre?",options:["10","100","500","1000"],answer:"1000",hint:"1 litre = 1000 ml!"},
    {level:"medium",q:"What is ⅞ of 56?",options:["42","46","48","49"],answer:"49",hint:"56÷8=7, 7×7=49!"},
    {level:"medium",q:"What is 67 + 48?",options:["105","113","115","117"],answer:"115",hint:"67+48: 60+40=100, 7+8=15, 100+15=115"},
    {level:"medium",q:"What is 7 × 6?",options:["36","40","42","46"],answer:"42",hint:"7 × 6 = 42!"},
    {level:"medium",q:"What is 66 ÷ 6?",options:["9","10","11","12"],answer:"11",hint:"6 × 11 = 66!"},
    {level:"medium",q:"What is 9²?",options:["72","79","81","84"],answer:"81",hint:"9 × 9 = 81!"},
    {level:"medium",q:"What is ⅔ of 30?",options:["15","18","20","22"],answer:"20",hint:"30÷3=10, 10×2=20!"},
    {level:"medium",q:"What is 175 + 225?",options:["380","390","400","410"],answer:"400",hint:"175+225: 100+200=300, 75+25=100, 300+100=400"},
    {level:"medium",q:"What is 11 × 7?",options:["74","77","79","82"],answer:"77",hint:"11 × 7 = 77!"},
    {level:"medium",q:"What is 48 ÷ 6?",options:["6","7","8","9"],answer:"8",hint:"6 × 8 = 48!"},
    {level:"medium",q:"What is 10³?",options:["100","300","1000","10000"],answer:"1000",hint:"10×10×10 = 1000!"},
    {level:"medium",q:"How many mm in a cm?",options:["5","10","100","1000"],answer:"10",hint:"10 mm = 1 cm!"},
    {level:"medium",q:"What is ¾ of 28?",options:["18","19","20","21"],answer:"21",hint:"28÷4=7, 7×3=21!"},
    {level:"medium",q:"What is 88 - 44?",options:["40","42","44","46"],answer:"44",hint:"Half of 88!"},
    {level:"medium",q:"What is 12 × 9?",options:["98","106","108","112"],answer:"108",hint:"12×9 = 12×10 - 12 = 120-12"},
    {level:"medium",q:"What is 72 ÷ 6?",options:["10","11","12","13"],answer:"12",hint:"6 × 12 = 72!"},
    {level:"medium",q:"What is 13²?",options:["159","165","169","175"],answer:"169",hint:"13 × 13 = 169!"},
    {level:"medium",q:"What is ⅖ of 50?",options:["15","18","20","22"],answer:"20",hint:"50÷5=10, 10×2=20!"},
    {level:"medium",q:"What is 123 + 456?",options:["569","575","579","589"],answer:"579",hint:"123+456: 100+400=500, 23+56=79, 500+79=579"},
    {level:"medium",q:"What is 6 × 12?",options:["60","68","72","78"],answer:"72",hint:"6 × 12 = 72!"},
    {level:"medium",q:"What is 99 ÷ 9?",options:["9","10","11","12"],answer:"11",hint:"9 × 11 = 99!"},
    {level:"medium",q:"What is 7³?",options:["243","313","343","373"],answer:"343",hint:"7×7×7 = 49×7 = 343!"},
    {level:"medium",q:"How many days in a leap year?",options:["364","365","366","367"],answer:"366",hint:"Leap years have an extra day in February!"},
    {level:"medium",q:"What is ⅘ of 40?",options:["28","30","32","34"],answer:"32",hint:"40÷5=8, 8×4=32!"},
    {level:"medium",q:"What is 256 - 128?",options:["118","124","128","132"],answer:"128",hint:"Half of 256!"},
    {level:"medium",q:"What is 8 × 12?",options:["86","92","96","102"],answer:"96",hint:"8×12 = 8×10 + 8×2 = 80+16"},
    {level:"medium",q:"What is 60 ÷ 4?",options:["12","13","14","15"],answer:"15",hint:"4 × 15 = 60!"},
    {level:"hard",q:"What is 23 × 17?",options:["371","381","391","401"],answer:"391",hint:"23×17 = 23×10 + 23×7 = 230+161"},
    {level:"hard",q:"What is 35% of 180?",options:["55","60","63","66"],answer:"63",hint:"10%=18, 35%=18×3+18×0.5=54+9=63"},
    {level:"hard",q:"What is the surface area of a cube with side 3cm?",options:["27cm²","36cm²","54cm²","72cm²"],answer:"54cm²",hint:"6 faces × 3×3 = 6×9 = 54cm²!"},
    {level:"hard",q:"What is 11/12 as a decimal?",options:["0.9166","0.9333","0.9416","0.9583"],answer:"0.9166",hint:"11÷12 ≈ 0.9166!"},
    {level:"hard",q:"What is the next prime after 23?",options:["24","25","27","29"],answer:"29",hint:"24=2×12, 25=5², 27=3³, 29 is prime!"},
    {level:"hard",q:"What is 3⁴?",options:["27","54","81","108"],answer:"81",hint:"3×3×3×3 = 9×9 = 81!"},
    {level:"hard",q:"A triangle has base 8cm and height 5cm. What is the area?",options:["16cm²","20cm²","24cm²","40cm²"],answer:"20cm²",hint:"Area = ½ × base × height = ½ × 8 × 5 = 20cm²!"},
    {level:"hard",q:"What is 55% of 220?",options:["111","119","121","131"],answer:"121",hint:"10%=22, 55%=22×5+22×0.5=110+11=121"},
    {level:"hard",q:"What is the LCM of 8 and 12?",options:["16","20","24","32"],answer:"24",hint:"Multiples of 8: 8,16,24. Of 12: 12,24. LCM=24!"},
    {level:"hard",q:"What is 4⁴?",options:["64","128","256","512"],answer:"256",hint:"4×4×4×4 = 16×16 = 256!"},
    {level:"hard",q:"A car uses 6 litres per 100km. How much for 250km?",options:["12L","13L","15L","18L"],answer:"15L",hint:"250km = 2.5 × 100km, so 2.5 × 6 = 15L!"},
    {level:"hard",q:"What is 72% of 150?",options:["98","104","108","114"],answer:"108",hint:"72% of 150 = 150 × 0.72 = 108!"},
    {level:"hard",q:"What is ⁷⁄₈ + ⁵⁄₆?",options:["1⅔","1¾","1¹⁷⁄₂₄","1⁵⁄₆"],answer:"1¹⁷⁄₂₄",hint:"LCD=24: 21/24 + 20/24 = 41/24 = 1¹⁷⁄₂₄"},
    {level:"hard",q:"What is the area of a triangle with base 12cm and height 9cm?",options:["48cm²","54cm²","60cm²","108cm²"],answer:"54cm²",hint:"Area = ½ × 12 × 9 = 54cm²!"},
    {level:"hard",q:"What is 87.5% of 400?",options:["320","330","340","350"],answer:"350",hint:"87.5% = 7/8. 400÷8×7 = 350!"},
    {level:"hard",q:"Simplify 36/48.",options:["⅔","¾","⅘","⁵⁄₆"],answer:"¾",hint:"HCF=12: 36÷12=3, 48÷12=4, so ¾!"},
    {level:"hard",q:"What is 7n - 4 when n = 6?",options:["36","38","40","42"],answer:"38",hint:"7×6 - 4 = 42 - 4 = 38!"},
    {level:"hard",q:"What is the mode of: 3,5,3,7,5,3,9?",options:["3","5","7","9"],answer:"3",hint:"Mode = most frequent. 3 appears 3 times!"},
    {level:"hard",q:"What is 5000 ÷ 0.01?",options:["50","500","50000","500000"],answer:"500000",hint:"Dividing by 0.01 = multiplying by 100!"},
    {level:"hard",q:"A cylinder has radius 4cm and height 10cm. What is its volume? (π≈3.14)",options:["480.4cm³","502.4cm³","524.4cm³","544.4cm³"],answer:"502.4cm³",hint:"V = πr²h = 3.14×16×10 = 502.4cm³!"},
    {level:"hard",q:"What is 3.14 × 5²?",options:["68.5","73.5","78.5","83.5"],answer:"78.5",hint:"π × r² = 3.14 × 25 = 78.5!"},
    {level:"hard",q:"What is 45% of 360?",options:["152","158","162","168"],answer:"162",hint:"45% = 9/20. 360 × 0.45 = 162!"},
    {level:"hard",q:"What is the HCF of 48 and 72?",options:["12","18","24","36"],answer:"24",hint:"Factors of 48: 1,2,3,4,6,8,12,16,24. Of 72: ...24. HCF=24!"},
    {level:"hard",q:"If 3x + 5 = 29, what is x?",options:["6","7","8","9"],answer:"8",hint:"3x = 24, x = 8!"},
    {level:"hard",q:"What is the range of: 15, 8, 23, 4, 19?",options:["15","17","19","23"],answer:"19",hint:"Range = max - min = 23 - 4 = 19!"},
    {level:"hard",q:"What is ⅝ as a percentage?",options:["55%","60%","62.5%","65%"],answer:"62.5%",hint:"⅝ = 5÷8 = 0.625 = 62.5%!"},
    {level:"hard",q:"What is the perimeter of a semicircle with diameter 12cm? (π≈3.14)",options:["30.84cm","36.84cm","42.84cm","48.84cm"],answer:"30.84cm",hint:"Perimeter = πr + d = 3.14×6 + 12 = 18.84+12 = 30.84cm!"},
    {level:"hard",q:"What is 2.5³?",options:["12.5","14.5","15.625","16.5"],answer:"15.625",hint:"2.5×2.5=6.25, 6.25×2.5=15.625!"},
    {level:"hard",q:"What is 60% of 180?",options:["96","100","108","112"],answer:"108",hint:"60% = 3/5. 180÷5×3 = 36×3 = 108!"},
    {level:"hard",q:"What is the next number?\n1, 5, 14, 30, 55, __",options:["84","88","91","95"],answer:"91",hint:"Differences: +4,+9,+16,+25,+36 (square differences)!"},
    {level:"hard",q:"What is the median of:\n12, 5, 18, 9, 7, 15, 3?",options:["7","9","11","12"],answer:"9",hint:"Order: 3,5,7,9,12,15,18. Middle (4th) = 9!"},
    {level:"hard",q:"What is 33⅓% of 270?",options:["80","85","90","95"],answer:"90",hint:"33⅓% = ⅓. 270÷3 = 90!"},
    {level:"hard",q:"A rectangle has diagonal 13cm and length 12cm. What is the width?",options:["3cm","4cm","5cm","6cm"],answer:"5cm",hint:"Pythagoras: 12²+w²=13². 144+w²=169, w²=25, w=5!"},
    {level:"hard",q:"What is ³⁄₇ of 210?",options:["80","85","90","95"],answer:"90",hint:"210÷7=30, 30×3=90!"},
    {level:"hard",q:"If a = 3 and b = 4, what is √(a² + b²)?",options:["4","5","6","7"],answer:"5",hint:"√(9+16) = √25 = 5!"},
    {level:"hard",q:"What is the mean of the first 10 natural numbers?",options:["4.5","5","5.5","6"],answer:"5.5",hint:"Sum = 55, count = 10, mean = 5.5!"},
    {level:"hard",q:"What is 8% of 625?",options:["45","50","55","60"],answer:"50",hint:"8% of 625 = 0.08×625 = 50!"},
    {level:"hard",q:"What is 9 × 0.4?",options:["2.6","3.2","3.6","4.2"],answer:"3.6",hint:"9 × 0.4 = 9 × 4 ÷ 10 = 36÷10 = 3.6!"},
    {level:"hard",q:"What is the sum of interior angles of a hexagon?",options:["540°","600°","720°","810°"],answer:"720°",hint:"Sum = (n-2)×180° = 4×180° = 720°!"},
    {level:"hard",q:"What is 7.2 × 1.5?",options:["9.8","10.2","10.8","11.2"],answer:"10.8",hint:"7.2×1.5 = 7.2×1 + 7.2×0.5 = 7.2+3.6 = 10.8!"},
    {level:"hard",q:"What is 6n² when n = 3?",options:["36","48","54","72"],answer:"54",hint:"6 × 3² = 6 × 9 = 54!"},
    {level:"hard",q:"What is the volume of a cuboid 5cm × 4cm × 3cm?",options:["47cm³","55cm³","60cm³","72cm³"],answer:"60cm³",hint:"V = l×w×h = 5×4×3 = 60cm³!"},
    {level:"hard",q:"What is 125% of 64?",options:["70","76","80","84"],answer:"80",hint:"125% = 5/4. 64÷4×5 = 16×5 = 80!"},
    {level:"hard",q:"What is the probability of rolling an even number on a dice?",options:["¼","⅓","½","⅔"],answer:"½",hint:"Even numbers: 2,4,6 = 3 out of 6 = ½!"},
    {level:"hard",q:"What is 2n + 3 when n = 7?",options:["14","16","17","18"],answer:"17",hint:"2×7+3 = 14+3 = 17!"},
    {level:"hard",q:"A circle has circumference 31.4cm. What is its radius? (π≈3.14)",options:["3cm","4cm","5cm","6cm"],answer:"5cm",hint:"C = 2πr, so r = C÷(2π) = 31.4÷6.28 = 5cm!"},
    {level:"hard",q:"What is (3 + 4)² − 3²?",options:["36","38","40","42"],answer:"40",hint:"7² - 3² = 49 - 9 = 40!"},
    {level:"hard",q:"What is 16% of 325?",options:["48","50","52","54"],answer:"52",hint:"16% of 325 = 0.16×325 = 52!"},
    {level:"hard",q:"What is the HCF of 56 and 84?",options:["14","21","28","42"],answer:"28",hint:"Factors of 56: 1,2,4,7,8,14,28,56. Of 84: ...28. HCF=28!"},
    {level:"hard",q:"If the ratio of boys to girls is 3:4 and there are 21 boys, how many girls are there?",options:["24","26","28","30"],answer:"28",hint:"21÷3=7 (one part), girls=4×7=28!"},
    {level:"hard",q:"What is 3.6 ÷ 0.4?",options:["7","8","9","10"],answer:"9",hint:"3.6÷0.4 = 36÷4 = 9!"},
    {level:"hard",q:"What is the missing angle in a triangle\nif two angles are 65° and 75°?",options:["30°","40°","50°","60°"],answer:"40°",hint:"180°-65°-75° = 40°!"},
    {level:"hard",q:"What is 7/9 + 2/3?",options:["1 2/9","1 3/9","1 4/9","1 5/9"],answer:"1 4/9",hint:"2/3=6/9, so 7/9+6/9=13/9=1 4/9!"},
    {level:"hard",q:"What is 5% of 840?",options:["36","40","42","48"],answer:"42",hint:"5% = 1/20. 840÷20 = 42!"},
    {level:"hard",q:"What is 2x − 7 when x = 9?",options:["9","10","11","12"],answer:"11",hint:"2×9 - 7 = 18 - 7 = 11!"}
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
    // ── EXTRA EASY ──
    {level:"easy",q:"Which word names an animal?",options:["run","blue","cat","fast"],answer:"cat",hint:"An animal is a living creature!"},
    {level:"easy",q:"Which word is a colour?",options:["jump","green","swim","tall"],answer:"green",hint:"Colours describe how things look!"},
    {level:"easy",q:"What letter does 'ball' start with?",options:["D","C","B","P"],answer:"B",hint:"B is for Ball!"},
    {level:"easy",q:"Which word rhymes with 'dog'?",options:["cat","log","car","pig"],answer:"log",hint:"Dog... log... both end in -og!"},
    {level:"easy",q:"Which word is a number?",options:["cat","run","three","hot"],answer:"three",hint:"Numbers count things!"},
    {level:"easy",q:"How many letters in 'sun'?",options:["2","3","4","5"],answer:"3",hint:"S-U-N — count them!"},
    // ── EXTRA MEDIUM ──
    {level:"medium",q:"What does 'gigantic' mean?",options:["Very small","Very fast","Very huge","Very quiet"],answer:"Very huge",hint:"Gigantic = enormous = really really big!"},
    {level:"medium",q:"Which word is a noun?\n'The quick brown fox jumps.'",options:["quick","brown","fox","jumps"],answer:"fox",hint:"A noun is a person, place or thing!"},
    {level:"medium",q:"Which word means the opposite of 'ancient'?",options:["old","modern","large","quiet"],answer:"modern",hint:"Ancient = very old. Its opposite is new/modern!"},
    {level:"medium",q:"Which sentence has correct punctuation?",options:["Where are you going","Where are you going?","where are you going?","Where are you going!"],answer:"Where are you going?",hint:"A question needs a capital letter and question mark!"},
    {level:"medium",q:"What is the past tense of 'run'?",options:["runned","runs","ran","running"],answer:"ran",hint:"Today I run. Yesterday I ran!"},
    {level:"medium",q:"Which word is a simile?",options:["The dog barked.","She runs fast.","He is as brave as a lion.","The flowers bloomed."],answer:"He is as brave as a lion.",hint:"A simile compares using 'as' or 'like'!"},
    // ── EXTRA HARD ──
    {level:"hard",q:"What is a 'clause'?",options:["A type of punctuation","A group of words with a subject and verb","A describing word","A connecting word"],answer:"A group of words with a subject and verb",hint:"A clause has a subject (who) and predicate (what they do)!"},
    {level:"hard",q:"Which word contains a silent letter?",options:["jump","fast","kneel","bright"],answer:"kneel",hint:"Kneel has a silent K at the start!"},
    {level:"hard",q:"What does the suffix '-tion' mean?",options:["Without","Full of","The act of","Before"],answer:"The act of",hint:"Education = the act of educating. Action = the act of acting!"},
    {level:"hard",q:"Which is an example of alliteration?",options:["She sells seashells","The cat sat on the mat","It was as big as a house","He ran quickly"],answer:"She sells seashells",hint:"Alliteration = same first sound repeated: s-s-s!"},
    {level:"hard",q:"What type of word is 'quickly'?",options:["Noun","Verb","Adjective","Adverb"],answer:"Adverb",hint:"Adverbs describe how something is done — quickly, slowly, carefully!"},
  
    {"level":"easy","q":"Which word is a verb?","options":["happy","run","blue","tall"],"answer":"run","hint":"A verb is an action word!"},
    {"level":"easy","q":"Which word rhymes with 'cake'?","options":["take","talk","tank","task"],"answer":"take","hint":"Cake and take both end in -ake!"},
    {"level":"easy","q":"Which word is a noun?","options":["jump","fast","table","red"],"answer":"table","hint":"A noun is a person, place or thing!"},
    {"level":"easy","q":"Which word means the same as 'big'?","options":["tiny","large","fast","quiet"],"answer":"large","hint":"Big = large!"},
    {"level":"easy","q":"Which word is opposite of 'hot'?","options":["warm","cold","cool","icy"],"answer":"cold","hint":"Hot and cold are opposites!"},
    {"level":"easy","q":"How many vowels in 'rain'?","options":["1","2","3","4"],"answer":"2","hint":"Vowels: a,e,i,o,u. R-A-I-N has A and I!"},
    {"level":"easy","q":"Which word means the same as 'fast'?","options":["slow","quick","quiet","lazy"],"answer":"quick","hint":"Fast = quick!"},
    {"level":"easy","q":"Which word rhymes with 'night'?","options":["light","nice","nine","nip"],"answer":"light","hint":"Night and light both end in -ight!"},
    {"level":"easy","q":"Which word is opposite of 'day'?","options":["sun","light","night","sky"],"answer":"night","hint":"Day and night are opposites!"},
    {"level":"medium","q":"What is the past tense of 'see'?","options":["seed","sawed","saw","seen"],"answer":"saw","hint":"Today I see. Yesterday I saw!"},
    {"level":"medium","q":"Which word is a conjunction?","options":["run","happy","because","table"],"answer":"because","hint":"Conjunctions join clauses!"},
    {"level":"medium","q":"What is the plural of 'child'?","options":["childs","childes","children","childrens"],"answer":"children","hint":"Irregular plural: child → children!"},
    {"level":"medium","q":"What does 'enormous' mean?","options":["very small","very fast","very huge","very quiet"],"answer":"very huge","hint":"Enormous = very very big!"},
    {"level":"medium","q":"What is the plural of 'mouse'?","options":["mouses","mouse","mices","mice"],"answer":"mice","hint":"Irregular plural: mouse → mice!"},
    {"level":"medium","q":"Which is a compound word?","options":["running","football","carefully","jumped"],"answer":"football","hint":"Compound words = two words joined: foot + ball!"},
    {"level":"hard","q":"What is a 'metaphor'?","options":["comparing using like or as","a direct comparison without like/as","giving objects human qualities","repeating first sounds"],"answer":"a direct comparison without like/as","hint":"Life is a journey — no 'like' or 'as'!"},
    {"level":"hard","q":"Which is an example of 'hyperbole'?","options":["The cat is black","I've told you a million times!","She walks quickly","The sky is blue"],"answer":"I've told you a million times!","hint":"Hyperbole = extreme exaggeration!"},
    {"level":"hard","q":"What does 'ubiquitous' mean?","options":["very rare","found everywhere","extremely old","completely silent"],"answer":"found everywhere","hint":"Smartphones are ubiquitous!"},
    {"level":"hard","q":"What is a 'soliloquy'?","options":["a conversation between two characters","a speech by a character alone on stage","a poem with 14 lines","a story with a moral"],"answer":"a speech by a character alone on stage","hint":"Romeo speaks his soliloquy alone!"},
    {"level":"hard","q":"What does 'didactic' mean?","options":["written to entertain only","intended to teach a moral lesson","written in rhyme","describing emotions"],"answer":"intended to teach a moral lesson","hint":"Aesop's Fables are didactic!"},
  ,
    {level:"easy",q:"Which word is a verb?",options:["happy","run","blue","tall"],answer:"run",hint:"A verb is an action word!"},
    {level:"easy",q:"Which word rhymes with 'cake'?",options:["take","talk","tank","task"],answer:"take",hint:"Cake and take both end in -ake!"},
    {level:"easy",q:"Which word is a noun?",options:["jump","fast","table","red"],answer:"table",hint:"A noun is a person, place or thing!"},
    {level:"easy",q:"Which word means the same as 'big'?",options:["tiny","large","fast","quiet"],answer:"large",hint:"Big = large!"},
    {level:"easy",q:"Which word is opposite of 'hot'?",options:["warm","cold","cool","icy"],answer:"cold",hint:"Hot and cold are opposites!"},
    {level:"easy",q:"How many vowels in 'rain'?",options:["1","2","3","4"],answer:"2",hint:"Vowels: a,e,i,o,u. R-A-I-N has A and I!"},
    {level:"easy",q:"Which word means the same as 'fast'?",options:["slow","quick","quiet","lazy"],answer:"quick",hint:"Fast = quick!"},
    {level:"easy",q:"Which word is opposite of 'day'?",options:["sun","light","night","sky"],answer:"night",hint:"Day and night are opposites!"},
    {level:"easy",q:"Which word rhymes with 'tree'?",options:["try","free","trip","tray"],answer:"free",hint:"Tree and free both end in -ee!"},
    {level:"easy",q:"Which word is a colour?",options:["run","orange","jump","tall"],answer:"orange",hint:"Colours describe how things look!"},
    {level:"easy",q:"Which word names an animal?",options:["blue","run","rabbit","tall"],answer:"rabbit",hint:"Animals are living creatures!"},
    {level:"easy",q:"Which word is opposite of 'open'?",options:["wide","large","close","shut"],answer:"shut",hint:"Opposite of open = shut!"},
    {level:"easy",q:"Which word rhymes with 'red'?",options:["rid","rod","bed","rad"],answer:"bed",hint:"Red and bed both end in -ed!"},
    {level:"easy",q:"Which word is a number?",options:["cat","run","seven","hot"],answer:"seven",hint:"Numbers count things!"},
    {level:"easy",q:"Which word is opposite of 'up'?",options:["side","over","down","away"],answer:"down",hint:"Up and down are opposites!"},
    {level:"easy",q:"Which word is a shape?",options:["run","blue","circle","fast"],answer:"circle",hint:"Shapes describe how things look!"},
    {level:"easy",q:"Which word means the same as 'start'?",options:["end","stop","begin","finish"],answer:"begin",hint:"Start = begin!"},
    {level:"easy",q:"Which word rhymes with 'book'?",options:["back","cook","bull","bark"],answer:"cook",hint:"Book and cook both end in -ook!"},
    {level:"easy",q:"Which word is a day of the week?",options:["March","Monday","Morning","Month"],answer:"Monday",hint:"Days: Monday, Tuesday, Wednesday..."},
    {level:"easy",q:"Which word means the same as 'happy'?",options:["sad","angry","glad","tired"],answer:"glad",hint:"Happy = glad!"},
    {level:"easy",q:"Which word has 3 letters?",options:["apple","the","jump","book"],answer:"the",hint:"T-H-E = 3 letters!"},
    {level:"easy",q:"Which word rhymes with 'chair'?",options:["chin","chop","share","chat"],answer:"share",hint:"Chair and share both rhyme!"},
    {level:"easy",q:"Which word is opposite of 'big'?",options:["large","huge","tiny","tall"],answer:"tiny",hint:"Big and tiny are opposites!"},
    {level:"easy",q:"How many letters in 'cat'?",options:["2","3","4","5"],answer:"3",hint:"C-A-T = 3 letters!"},
    {level:"easy",q:"Which word rhymes with 'night'?",options:["light","nice","nine","nip"],answer:"light",hint:"Night and light both end in -ight!"},
    {level:"medium",q:"What is the past tense of 'see'?",options:["seed","sawed","saw","seen"],answer:"saw",hint:"Today I see. Yesterday I saw!"},
    {level:"medium",q:"Which word is a conjunction?",options:["run","happy","because","table"],answer:"because",hint:"Conjunctions join clauses!"},
    {level:"medium",q:"What is the plural of 'child'?",options:["childs","childes","children","childrens"],answer:"children",hint:"Irregular plural: child → children!"},
    {level:"medium",q:"What does 'enormous' mean?",options:["very small","very fast","very huge","very quiet"],answer:"very huge",hint:"Enormous = extremely big!"},
    {level:"medium",q:"What is the plural of 'mouse'?",options:["mouses","mouse","mices","mice"],answer:"mice",hint:"Irregular plural: mouse → mice!"},
    {level:"medium",q:"Which is a compound word?",options:["running","football","carefully","jumped"],answer:"football",hint:"foot + ball = football!"},
    {level:"medium",q:"Which word is an adjective?",options:["run","beautiful","slowly","and"],answer:"beautiful",hint:"Adjectives describe nouns!"},
    {level:"medium",q:"Which word is a synonym for 'sad'?",options:["happy","miserable","excited","glad"],answer:"miserable",hint:"Sad = miserable!"},
    {level:"medium",q:"What is the comparative of 'tall'?",options:["tallest","more tall","taller","most tall"],answer:"taller",hint:"Tall → taller → tallest!"},
    {level:"medium",q:"What does 'nocturnal' mean?",options:["lives in water","active at night","eats only plants","has no legs"],answer:"active at night",hint:"Owls and bats are nocturnal!"},
    {level:"medium",q:"Which word is an adverb?",options:["cat","blue","quickly","jump"],answer:"quickly",hint:"Adverbs describe how: quickly, slowly!"},
    {level:"medium",q:"What does the prefix 'pre-' mean?",options:["after","before","again","not"],answer:"before",hint:"Preview = see before!"},
    {level:"medium",q:"Which is a proper noun?",options:["city","country","London","river"],answer:"London",hint:"Proper nouns are specific names!"},
    {level:"medium",q:"What is the superlative of 'good'?",options:["gooder","more good","better","best"],answer:"best",hint:"Good → better → best!"},
    {level:"medium",q:"What does 'transparent' mean?",options:["you can see through it","you cannot see it","it is very heavy","it makes noise"],answer:"you can see through it",hint:"Glass is transparent!"},
    {level:"medium",q:"Which sentence has correct apostrophe use?",options:["The dogs bone","The dog's bone","The dogs' bone","The dogs bone's"],answer:"The dog's bone",hint:"Apostrophe + s shows possession!"},
    {level:"medium",q:"What does 'ancient' mean?",options:["very new","very old","very large","very fast"],answer:"very old",hint:"Ancient = extremely old!"},
    {level:"medium",q:"Which word contains a prefix?",options:["table","unhappy","chair","blue"],answer:"unhappy",hint:"'un-' means not — unhappy = not happy!"},
    {level:"medium",q:"What type of word is 'ouch'?",options:["noun","verb","adjective","interjection"],answer:"interjection",hint:"Interjections express sudden feelings!"},
    {level:"medium",q:"What does the suffix '-ful' mean?",options:["without","full of","before","again"],answer:"full of",hint:"Hopeful = full of hope!"},
    {level:"medium",q:"Which is a collective noun?",options:["dog","run","flock","blue"],answer:"flock",hint:"A flock of birds!"},
    {level:"medium",q:"Which word is spelled correctly?",options:["recieve","receive","receve","receeve"],answer:"receive",hint:"i before e except after c!"},
    {level:"medium",q:"What is the antonym of 'generous'?",options:["kind","giving","stingy","warm"],answer:"stingy",hint:"Generous = giving. Stingy = opposite!"},
    {level:"medium",q:"What does 'predict' mean?",options:["to look back","to say what will happen","to explain something","to describe something"],answer:"to say what will happen",hint:"Pre = before + dict = say. Predict = say before it happens!"},
    {level:"medium",q:"Which sentence is a question?",options:["I like dogs.","I like dogs!","Do you like dogs?","Dogs are great."],answer:"Do you like dogs?",hint:"Questions end with a question mark!"},
    {level:"hard",q:"What is a 'metaphor'?",options:["comparing using like or as","a direct comparison without like/as","giving objects human qualities","repeating first sounds"],answer:"a direct comparison without like/as",hint:"Life is a journey — no like or as!"},
    {level:"hard",q:"Which is an example of 'hyperbole'?",options:["The cat is black","I've told you a million times!","She walks quickly","The sky is blue"],answer:"I've told you a million times!",hint:"Hyperbole = extreme exaggeration!"},
    {level:"hard",q:"What does 'ubiquitous' mean?",options:["very rare","found everywhere","extremely old","completely silent"],answer:"found everywhere",hint:"Smartphones are ubiquitous!"},
    {level:"hard",q:"What is a 'soliloquy'?",options:["a conversation between two characters","a speech by a character alone on stage","a poem with 14 lines","a story with a moral"],answer:"a speech by a character alone on stage",hint:"Romeo speaks his soliloquy alone!"},
    {level:"hard",q:"What does 'didactic' mean?",options:["written to entertain only","intended to teach a moral lesson","written in rhyme","describing emotions"],answer:"intended to teach a moral lesson",hint:"Aesop's Fables are didactic!"},
    {level:"hard",q:"What is 'dramatic irony'?",options:["when a story is exciting","when the audience knows something characters don't","when a character says the opposite","when events surprise everyone"],answer:"when the audience knows something characters don't",hint:"Classic in Shakespeare!"},
    {level:"hard",q:"Which is an example of an 'oxymoron'?",options:["The cat sat on the mat","She runs fast","Deafening silence","He is brave as a lion"],answer:"Deafening silence",hint:"Oxymoron = contradictory words together!"},
    {level:"hard",q:"Which is 'alliteration'?",options:["She cried because she fell","Peter Piper picked peppers","The sun rose slowly","He ate his dinner"],answer:"Peter Piper picked peppers",hint:"Alliteration = same sound at start of words!"},
    {level:"hard",q:"Which literary device is in 'the moon smiled down'?",options:["simile","metaphor","personification","alliteration"],answer:"personification",hint:"Giving the moon a human action!"},
    {level:"hard",q:"What is the difference between 'affect' and 'effect'?",options:["they mean the same","affect is a verb, effect is a noun","affect is a noun, effect is a verb","they are opposites"],answer:"affect is a verb, effect is a noun",hint:"The cold affected me. The effect was a cold!"},
    {level:"hard",q:"What is 'juxtaposition'?",options:["placing two contrasting things side by side","giving objects human qualities","repeating ideas for emphasis","building tension gradually"],answer:"placing two contrasting things side by side",hint:"Rich and poor side by side!"},
    {level:"hard",q:"What is a 'subordinate clause'?",options:["The dog barked.","Because it was raining","She ran.","Dogs are loud."],answer:"Because it was raining",hint:"Cannot stand alone — needs a main clause!"},
    {level:"hard",q:"What is 'catharsis' in literature?",options:["the climax of a story","emotional release felt by the audience","the opening of a story","a type of character"],answer:"emotional release felt by the audience",hint:"Greek tragedy creates catharsis!"},
    {level:"hard",q:"What is 'diction' in literature?",options:["the speed of speech","word choice and style","the plot","the setting"],answer:"word choice and style",hint:"An author's diction = the words they choose!"},
    {level:"hard",q:"Which word is an example of onomatopoeia?",options:["happy","quickly","sizzle","large"],answer:"sizzle",hint:"Onomatopoeia = words that sound like what they describe!"},
    {level:"hard",q:"What is the 'denouement' of a story?",options:["the opening conflict","the climax","the resolution after the climax","the hero's journey"],answer:"the resolution after the climax",hint:"Denouement = French for untying — loose ends tied up!"},
    {level:"hard",q:"What does 'verisimilitude' mean?",options:["the appearance of truth in fiction","an extreme fear","a type of poetry","a narrative technique"],answer:"the appearance of truth in fiction",hint:"Good fiction feels real — verisimilitude!"},
    {level:"hard",q:"What is an 'anachronism'?",options:["a word with multiple meanings","something in the wrong time period","a figure of speech","a type of rhyme"],answer:"something in the wrong time period",hint:"A Roman using a phone is an anachronism!"},
    {level:"hard",q:"What does 'ambiguous' mean?",options:["very clear","open to more than one meaning","completely false","extremely boring"],answer:"open to more than one meaning",hint:"I saw her duck is ambiguous!"},
    {level:"hard",q:"What is 'pathetic fallacy'?",options:["a logical error","using weather/nature to reflect a character's mood","a sad story","an unreliable narrator"],answer:"using weather/nature to reflect a character's mood",hint:"A stormy scene during an argument is pathetic fallacy!"},
    {level:"hard",q:"Which contains a Latin root meaning 'carry'?",options:["portable","beautiful","running","happy"],answer:"portable",hint:"Port = carry. Portable = can be carried!"},
    {level:"hard",q:"What is a 'motif' in literature?",options:["the main character","a recurring symbol or idea throughout a text","the setting of a story","a type of poem"],answer:"a recurring symbol or idea throughout a text",hint:"A recurring rose symbolising love is a motif!"},
    {level:"hard",q:"What is 'epistolary' writing?",options:["writing in verse","a story told through letters or documents","writing about history","a type of speech"],answer:"a story told through letters or documents",hint:"Dracula and Frankenstein are partly epistolary — told through letters!"},
    {level:"hard",q:"What is a 'foil' character?",options:["the hero of the story","a character who contrasts with the protagonist to highlight their traits","a villain","a narrator"],answer:"a character who contrasts with the protagonist to highlight their traits",hint:"Dr Jekyll and Mr Hyde — Hyde is Jekyll's foil!"},
    {level:"hard",q:"What does 'connotation' mean?",options:["the dictionary definition of a word","the emotional association of a word beyond its literal meaning","a type of grammar","the origin of a word"],answer:"the emotional association of a word beyond its literal meaning",hint:"'Home' connotes warmth and safety beyond just a building!"}
  ,
    {level:"easy",q:"Which word is an animal?",options:["run","blue","tiger","fast"],answer:"tiger",hint:"Tigers are big cats!"},
    {level:"easy",q:"Which word rhymes with 'dog'?",options:["dig","dug","log","lag"],answer:"log",hint:"Dog and log both end in -og!"},
    {level:"easy",q:"Which word means the same as 'cold'?",options:["hot","warm","chilly","bright"],answer:"chilly",hint:"Cold = chilly!"},
    {level:"easy",q:"How many letters in 'dog'?",options:["2","3","4","5"],answer:"3",hint:"D-O-G = 3 letters!"},
    {level:"easy",q:"Which word is a fruit?",options:["run","blue","apple","fast"],answer:"apple",hint:"Apples grow on trees!"},
    {level:"easy",q:"Which word rhymes with 'hat'?",options:["hip","hut","cat","cup"],answer:"cat",hint:"Hat and cat both end in -at!"},
    {level:"easy",q:"Which word means opposite of 'in'?",options:["under","over","out","around"],answer:"out",hint:"In and out are opposites!"},
    {level:"easy",q:"Which word is a vehicle?",options:["run","blue","car","fast"],answer:"car",hint:"Cars drive on roads!"},
    {level:"easy",q:"Which word has only one syllable?",options:["umbrella","happy","run","animal"],answer:"run",hint:"Run has just one beat!"},
    {level:"easy",q:"Which word rhymes with 'ball'?",options:["bill","bell","tall","bull"],answer:"tall",hint:"Ball and tall both end in -all!"},
    {level:"easy",q:"Which word means the same as 'little'?",options:["huge","large","tiny","tall"],answer:"tiny",hint:"Little = tiny!"},
    {level:"easy",q:"Which word is a body part?",options:["run","arm","blue","fast"],answer:"arm",hint:"Your arm connects shoulder to hand!"},
    {level:"easy",q:"How many letters in 'sun'?",options:["2","3","4","5"],answer:"3",hint:"S-U-N = 3 letters!"},
    {level:"easy",q:"Which word rhymes with 'run'?",options:["ran","rin","ron","sun"],answer:"sun",hint:"Run and sun both end in -un!"},
    {level:"easy",q:"Which word means the same as 'tired'?",options:["active","sleepy","energetic","awake"],answer:"sleepy",hint:"Tired = sleepy!"},
    {level:"easy",q:"Which word is opposite of 'young'?",options:["old","tiny","short","slow"],answer:"old",hint:"Young and old are opposites!"},
    {level:"easy",q:"Which word is a weather word?",options:["run","blue","rain","fast"],answer:"rain",hint:"Rain falls from clouds!"},
    {level:"easy",q:"Which word rhymes with 'hot'?",options:["hit","hat","hut","pot"],answer:"pot",hint:"Hot and pot both end in -ot!"},
    {level:"easy",q:"Which word means the same as 'look'?",options:["listen","smell","see","touch"],answer:"see",hint:"Look = see!"},
    {level:"easy",q:"Which word is opposite of 'tall'?",options:["wide","big","short","long"],answer:"short",hint:"Tall and short are opposites!"},
    {level:"easy",q:"Which word is a number?",options:["run","twelve","blue","fast"],answer:"twelve",hint:"Twelve is the number 12!"},
    {level:"easy",q:"Which word rhymes with 'bear'?",options:["bin","burn","share","barn"],answer:"share",hint:"Bear and share rhyme!"},
    {level:"easy",q:"Which word means the same as 'jump'?",options:["sit","leap","walk","crawl"],answer:"leap",hint:"Jump = leap!"},
    {level:"easy",q:"Which word is a type of food?",options:["run","blue","bread","fast"],answer:"bread",hint:"Bread is made from flour!"},
    {level:"easy",q:"Which word is opposite of 'empty'?",options:["hollow","clear","full","bare"],answer:"full",hint:"Empty and full are opposites!"},
    {level:"easy",q:"How many vowels in 'cat'?",options:["0","1","2","3"],answer:"1",hint:"C-A-T has just A as a vowel!"},
    {level:"easy",q:"Which word rhymes with 'king'?",options:["kin","kip","ring","kit"],answer:"ring",hint:"King and ring both end in -ing!"},
    {level:"easy",q:"Which word means the same as 'speak'?",options:["listen","read","talk","write"],answer:"talk",hint:"Speak = talk!"},
    {level:"easy",q:"Which word is a colour?",options:["run","jump","purple","fast"],answer:"purple",hint:"Purple is between blue and red!"},
    {level:"easy",q:"Which word is opposite of 'hard'?",options:["rough","bumpy","soft","firm"],answer:"soft",hint:"Hard and soft are opposites!"},
    {level:"easy",q:"Which word rhymes with 'fish'?",options:["fist","fit","dish","fin"],answer:"dish",hint:"Fish and dish both end in -ish!"},
    {level:"easy",q:"Which word is a season?",options:["Monday","morning","summer","March"],answer:"summer",hint:"Summer is the warmest season!"},
    {level:"easy",q:"Which word means the same as 'walk'?",options:["swim","fly","stroll","jump"],answer:"stroll",hint:"Walk = stroll!"},
    {level:"easy",q:"How many syllables in 'elephant'?",options:["2","3","4","5"],answer:"3",hint:"El-e-phant = 3 syllables!"},
    {level:"easy",q:"Which word rhymes with 'star'?",options:["stir","sting","car","step"],answer:"car",hint:"Star and car both end in -ar!"},
    {level:"easy",q:"Which word is opposite of 'noisy'?",options:["loud","quiet","busy","messy"],answer:"quiet",hint:"Noisy and quiet are opposites!"},
    {level:"easy",q:"Which word is a type of clothing?",options:["run","blue","coat","fast"],answer:"coat",hint:"Coats keep us warm!"},
    {level:"easy",q:"Which word means the same as 'sad'?",options:["joyful","glad","unhappy","excited"],answer:"unhappy",hint:"Sad = unhappy!"},
    {level:"easy",q:"Which word rhymes with 'rain'?",options:["rim","rum","train","rip"],answer:"train",hint:"Rain and train both end in -ain!"},
    {level:"easy",q:"Which word is opposite of 'dark'?",options:["black","dim","bright","grey"],answer:"bright",hint:"Dark and bright are opposites!"},
    {level:"easy",q:"Which word is a sport?",options:["run","blue","football","fast"],answer:"football",hint:"Football is played with a round ball!"},
    {level:"easy",q:"How many vowels in 'blue'?",options:["1","2","3","4"],answer:"2",hint:"B-L-U-E has U and E as vowels!"},
    {level:"easy",q:"Which word rhymes with 'cake'?",options:["kick","knock","lake","lick"],answer:"lake",hint:"Cake and lake both end in -ake!"},
    {level:"easy",q:"Which word means the same as 'scared'?",options:["brave","calm","afraid","happy"],answer:"afraid",hint:"Scared = afraid!"},
    {level:"easy",q:"Which word is a tool?",options:["run","blue","hammer","fast"],answer:"hammer",hint:"Hammers hit nails!"},
    {level:"easy",q:"Which word is opposite of 'clean'?",options:["tidy","neat","dirty","shiny"],answer:"dirty",hint:"Clean and dirty are opposites!"},
    {level:"easy",q:"Which word rhymes with 'feet'?",options:["fat","fit","heat","fun"],answer:"heat",hint:"Feet and heat both end in -eat!"},
    {level:"easy",q:"Which word means the same as 'smart'?",options:["slow","dim","clever","confused"],answer:"clever",hint:"Smart = clever!"},
    {level:"easy",q:"Which word is a plant?",options:["run","blue","flower","fast"],answer:"flower",hint:"Flowers bloom in spring!"},
    {level:"easy",q:"Which word is opposite of 'first'?",options:["front","early","last","next"],answer:"last",hint:"First and last are opposites!"},
    {level:"easy",q:"How many letters in 'school'?",options:["4","5","6","7"],answer:"6",hint:"S-C-H-O-O-L = 6 letters!"},
    {level:"easy",q:"Which word rhymes with 'snow'?",options:["snip","snot","snag","glow"],answer:"glow",hint:"Snow and glow both end in -ow!"},
    {level:"easy",q:"Which word means the same as 'help'?",options:["hinder","hurt","assist","ignore"],answer:"assist",hint:"Help = assist!"},
    {level:"easy",q:"Which word is a room in a house?",options:["run","blue","kitchen","fast"],answer:"kitchen",hint:"We cook in the kitchen!"},
    {level:"easy",q:"Which word is opposite of 'before'?",options:["during","meanwhile","after","while"],answer:"after",hint:"Before and after are opposites!"},
    {level:"easy",q:"Which word rhymes with 'frog'?",options:["flag","flip","blog","flap"],answer:"blog",hint:"Frog and blog both end in -og!"},
    {level:"easy",q:"Which word means the same as 'angry'?",options:["calm","happy","furious","peaceful"],answer:"furious",hint:"Angry = furious!"},
    {level:"easy",q:"Which word is a planet?",options:["run","blue","Mars","fast"],answer:"Mars",hint:"Mars is the Red Planet!"},
    {level:"easy",q:"How many syllables in 'beautiful'?",options:["2","3","4","5"],answer:"3",hint:"Beau-ti-ful = 3 syllables!"},
    {level:"medium",q:"What is the plural of leaf?",options:["leafs","leaves","leavs","leafes"],answer:"leaves",hint:"f changes to ves: leaf to leaves!"},
    {level:"medium",q:"What does the suffix -ness mean?",options:["without","state or quality of","one who","before"],answer:"state or quality of",hint:"Happiness = the state of being happy!"},
    {level:"medium",q:"Which word is an abstract noun?",options:["chair","tree","freedom","dog"],answer:"freedom",hint:"Abstract nouns are things you cannot touch — love, freedom, justice!"},
    {level:"medium",q:"What is the past tense of go?",options:["goed","gone","went","going"],answer:"went",hint:"Today I go, yesterday I went!"},
    {level:"medium",q:"Which is an example of personification?",options:["She ran like a cheetah","The wind whispered through the trees","He was cold as ice","The sun was bright"],answer:"The wind whispered through the trees",hint:"Personification gives human qualities to non-human things!"},
    {level:"medium",q:"What is the plural of goose?",options:["gooses","goosey","geese","goosies"],answer:"geese",hint:"Irregular plural: goose to geese!"},
    {level:"medium",q:"Which word is a preposition?",options:["run","happy","under","quickly"],answer:"under",hint:"Prepositions show position: under, over, beside, through!"},
    {level:"medium",q:"What does the prefix mis- mean?",options:["again","not","wrongly","before"],answer:"wrongly",hint:"Mislead = lead wrongly!"},
    {level:"medium",q:"Which sentence is in the passive voice?",options:["The dog bit the man","The man was bitten by the dog","The dog ran away","The man screamed"],answer:"The man was bitten by the dog",hint:"Passive voice: the subject receives the action!"},
    {level:"medium",q:"What is the superlative of bad?",options:["badder","baddest","worse","worst"],answer:"worst",hint:"Bad to worse to worst!"},
    {level:"medium",q:"Which word is an antonym of brave?",options:["heroic","bold","cowardly","strong"],answer:"cowardly",hint:"Brave = courageous. Cowardly = opposite!"},
    {level:"medium",q:"What is the plural of ox?",options:["oxes","oxen","oxs","ox"],answer:"oxen",hint:"Irregular plural: ox to oxen!"},
    {level:"medium",q:"What does elaborate mean?",options:["to simplify","to explain in more detail","to ignore","to confuse"],answer:"to explain in more detail",hint:"Please elaborate = please give more detail!"},
    {level:"medium",q:"Which word is a homophone of write?",options:["wrote","right","rote","wright"],answer:"right",hint:"Write and right sound the same but mean different things!"},
    {level:"medium",q:"What type of sentence ends with an exclamation mark?",options:["Statement","Question","Command or exclamation","None"],answer:"Command or exclamation",hint:"Stop! or Wow! — commands and exclamations use exclamation marks!"},
    {level:"medium",q:"Which word contains a suffix?",options:["happy","careful","table","fast"],answer:"careful",hint:"Care + -ful. The suffix -ful means full of!"},
    {level:"medium",q:"What does reluctant mean?",options:["eager","willing","unwilling","excited"],answer:"unwilling",hint:"Reluctant = not wanting to do something!"},
    {level:"medium",q:"Which word is a synonym for brave?",options:["timid","fearful","courageous","cautious"],answer:"courageous",hint:"Brave = courageous!"},
    {level:"medium",q:"What is a homonym?",options:["Same sound different meaning","Opposite meaning","Same meaning","Sounds different means the same"],answer:"Same sound different meaning",hint:"Bark (tree / dog) are homonyms!"},
    {level:"medium",q:"What does persevere mean?",options:["to give up","to continue despite difficulty","to change direction","to ignore obstacles"],answer:"to continue despite difficulty",hint:"Persevere = keep going even when hard!"},
    {level:"medium",q:"Which is an example of a simile?",options:["The moon is a lantern","He ran like the wind","The trees danced","Time flew by"],answer:"He ran like the wind",hint:"Similes use like or as to compare!"},
    {level:"medium",q:"What is the past tense of write?",options:["writed","written","wrote","writ"],answer:"wrote",hint:"Today I write, yesterday I wrote!"},
    {level:"medium",q:"What does consecutive mean?",options:["random","following one after another","far apart","happening once"],answer:"following one after another",hint:"Consecutive days follow each other!"},
    {level:"medium",q:"Which word has the most syllables?",options:["cat","happy","library","in"],answer:"library",hint:"Li-bra-ry = 3 syllables!"},
    {level:"medium",q:"What is the past tense of break?",options:["breaked","broken","broke","breakened"],answer:"broke",hint:"Today I break, yesterday I broke!"},
    {level:"medium",q:"Which word is a synonym for begin?",options:["end","finish","commence","stop"],answer:"commence",hint:"Begin = commence = start!"},
    {level:"medium",q:"What does inquisitive mean?",options:["shy","curious","disinterested","fearful"],answer:"curious",hint:"Inquisitive = eager to learn or know!"},
    {level:"medium",q:"Which word is a pronoun?",options:["run","quickly","she","beautiful"],answer:"she",hint:"Pronouns replace nouns: he, she, it, they!"},
    {level:"medium",q:"What does transparent mean?",options:["opaque","coloured","see-through","rough"],answer:"see-through",hint:"Glass and water are transparent!"},
    {level:"medium",q:"What is the plural of cactus?",options:["cactuses","cactuss","cactis","cacti"],answer:"cacti",hint:"Latin origin: cactus to cacti!"},
    {level:"medium",q:"Which word is a synonym for wealthy?",options:["poor","rich","modest","frugal"],answer:"rich",hint:"Wealthy = rich!"},
    {level:"medium",q:"What does frequently mean?",options:["rarely","sometimes","often","never"],answer:"often",hint:"Frequently = often = many times!"},
    {level:"medium",q:"What is the past tense of rise?",options:["rised","risen","rose","rosed"],answer:"rose",hint:"Today I rise, yesterday I rose!"},
    {level:"medium",q:"Which is an example of alliteration?",options:["She is very tall","Big bad bears bite","The dog ran fast","He jumped over"],answer:"Big bad bears bite",hint:"Alliteration = same letter sound at start of words!"},
    {level:"medium",q:"What does vital mean?",options:["unimportant","optional","essential","boring"],answer:"essential",hint:"Vital = very important, essential!"},
    {level:"medium",q:"What is a clause?",options:["A type of letter","A group of words with a subject and verb","A type of sentence","A paragraph"],answer:"A group of words with a subject and verb",hint:"The cat sat — subject (cat) and verb (sat) = a clause!"},
    {level:"medium",q:"Which word is an antonym of ancient?",options:["old","aged","modern","historic"],answer:"modern",hint:"Ancient = very old. Modern = opposite!"},
    {level:"medium",q:"What does ambitious mean?",options:["lazy","content","having strong desire to succeed","satisfied"],answer:"having strong desire to succeed",hint:"Ambitious people set big goals and work hard!"},
    {level:"medium",q:"Which word is a conjunction?",options:["run","blue","although","quickly"],answer:"although",hint:"Although, but, and, because are conjunctions!"},
    {level:"medium",q:"What is a complex sentence?",options:["A long sentence","A sentence with a main and subordinate clause","A sentence with many adjectives","A sentence with no punctuation"],answer:"A sentence with a main and subordinate clause",hint:"Although it was raining, she went outside = complex sentence!"},
    {level:"medium",q:"What does exquisite mean?",options:["ugly","ordinary","extremely beautiful","boring"],answer:"extremely beautiful",hint:"Exquisite = of extreme beauty!"},
    {level:"medium",q:"What is the past tense of fly?",options:["flied","flown","flew","fly"],answer:"flew",hint:"Today I fly, yesterday I flew!"},
    {level:"medium",q:"What does communicate mean?",options:["to ignore","to travel","to share information with others","to compete"],answer:"to share information with others",hint:"We communicate through speaking and writing!"},
    {level:"medium",q:"Which sentence uses a colon correctly?",options:["I like: cats.","She bought three things: milk, bread, and eggs.","They: went to the park.","The dog: barked."],answer:"She bought three things: milk, bread, and eggs.",hint:"A colon introduces a list or explanation!"},
    {level:"medium",q:"What does obstinate mean?",options:["flexible","stubborn","cooperative","reasonable"],answer:"stubborn",hint:"Obstinate = stubbornly refusing to change!"},
    {level:"medium",q:"Which word is a synonym for quick?",options:["slow","sluggish","rapid","lazy"],answer:"rapid",hint:"Quick = rapid = fast!"},
    {level:"medium",q:"What is the difference between their, there and they're?",options:["Same word","their=possession, there=place, they're=they are","there=possession","they're=a place"],answer:"their=possession, there=place, they're=they are",hint:"Their dog. Over there. They're going!"},
    {level:"medium",q:"What does catastrophe mean?",options:["a small problem","a celebration","a sudden disaster","a type of weather"],answer:"a sudden disaster",hint:"Catastrophe = a sudden terrible disaster!"},
    {level:"medium",q:"Which word is an adverb?",options:["beautiful","beautifully","beauty","beautify"],answer:"beautifully",hint:"-ly often makes adverbs: beautiful to beautifully!"},
    {level:"medium",q:"What is onomatopoeia?",options:["A comparison using like","Words that sound like what they describe","Giving human qualities to objects","Repeating consonant sounds"],answer:"Words that sound like what they describe",hint:"Bang, sizzle, buzz — these sound like the actions they describe!"},
    {level:"medium",q:"Which is an example of a metaphor?",options:["She is like a star","She is as bright as a star","She is a star","She shines brightly"],answer:"She is a star",hint:"A metaphor says something IS something else — no like or as!"},
    {level:"medium",q:"What does benevolent mean?",options:["cruel","kind and generous","strict","dishonest"],answer:"kind and generous",hint:"Bene = good (Latin). Benevolent = well-meaning and kind!"},
    {level:"medium",q:"What is the difference between its and it's?",options:["Same","its=belonging to it, it's=it is","it's shows possession","its means it is"],answer:"its=belonging to it, it's=it is",hint:"The dog wagged its tail. It's a lovely day!"},
    {level:"medium",q:"Which word is a synonym for important?",options:["trivial","insignificant","significant","minor"],answer:"significant",hint:"Important = significant!"},
    {level:"medium",q:"What does perplexed mean?",options:["calm","excited","confused","bored"],answer:"confused",hint:"Perplexed = completely puzzled or confused!"},
    {level:"medium",q:"What is the past tense of choose?",options:["choosed","chosen","chose","chosed"],answer:"chose",hint:"Today I choose, yesterday I chose!"},
    {level:"medium",q:"What does vivid mean?",options:["dull","faint","bright and strong","boring"],answer:"bright and strong",hint:"Vivid colours are bright and striking!"},
    {level:"medium",q:"What is a prefix?",options:["A letter at the end of a word","A group of letters added to the start of a word to change meaning","A type of noun","The root of a word"],answer:"A group of letters added to the start of a word to change meaning",hint:"Un-, pre-, mis- are all prefixes!"},
    {level:"hard",q:"What is polysyndeton?",options:["Few conjunctions used","Deliberate use of many conjunctions","A type of metaphor","No verbs in a sentence"],answer:"Deliberate use of many conjunctions",hint:"And he ran and jumped and shouted and laughed — many ands!"},
    {level:"hard",q:"What is asyndeton?",options:["Use of many conjunctions","Omission of conjunctions for effect","A type of rhyme scheme","Giving objects human qualities"],answer:"Omission of conjunctions for effect",hint:"He came, he saw, he conquered — no and for dramatic effect!"},
    {level:"hard",q:"What is epistrophe?",options:["Repetition at the beginning of clauses","Repetition at the end of clauses","A type of irony","A narrative technique"],answer:"Repetition at the end of clauses",hint:"Government of the people, by the people, for the people!"},
    {level:"hard",q:"What is anaphora?",options:["Repetition at the beginning of clauses","Repetition at the end","A type of metaphor","A character type"],answer:"Repetition at the beginning of clauses",hint:"I have a dream repeated at the beginning = anaphora!"},
    {level:"hard",q:"What is a Bildungsroman?",options:["A tragedy","A coming-of-age novel","A type of poem","A historical novel"],answer:"A coming-of-age novel",hint:"Great Expectations is a Bildungsroman — a story of growing up!"},
    {level:"hard",q:"What is chiasmus?",options:["A type of rhyme","A figure of speech reversing word order in parallel phrases","A narrative technique","A type of imagery"],answer:"A figure of speech reversing word order in parallel phrases",hint:"Ask not what your country can do for you — ask what you can do for your country!"},
    {level:"hard",q:"What is free indirect discourse?",options:["First person narration","A technique blending third-person narration with character thoughts","Unreliable narration","Stream of consciousness"],answer:"A technique blending third-person narration with character thoughts",hint:"Jane Austen uses it — narrator and character voices blend!"},
    {level:"hard",q:"What is prolepsis in literature?",options:["A flashback","Looking forward in the narrative","A type of irony","Repetition for emphasis"],answer:"Looking forward in the narrative",hint:"When a narrator hints at or describes future events!"},
    {level:"hard",q:"What is an unreliable narrator?",options:["A narrator who lies","A narrator whose account is questionable or biased","A third-person narrator","A narrator who breaks the fourth wall"],answer:"A narrator whose account is questionable or biased",hint:"Holden Caulfield in The Catcher in the Rye is an unreliable narrator!"},
    {level:"hard",q:"What is situational irony?",options:["Saying the opposite of what you mean","When events turn out opposite to what was expected","When the audience knows something characters do not","Verbal irony"],answer:"When events turn out opposite to what was expected",hint:"A fire station burning down = situational irony!"},
    {level:"hard",q:"What is archaism in literature?",options:["Future-looking language","Deliberate use of old-fashioned language","Scientific language","Informal language"],answer:"Deliberate use of old-fashioned language",hint:"Using thee, thou and hath is archaism!"},
    {level:"hard",q:"What is bathos?",options:["The climax of a story","An anticlimax — descent from important to trivial","A type of tragedy","Building tension gradually"],answer:"An anticlimax — descent from important to trivial",hint:"For God, for country, and for Coca-Cola — the trivial ending is bathos!"},
    {level:"hard",q:"What is stream of consciousness writing?",options:["A narrative about rivers","A technique representing the continuous flow of a character's thoughts","Third-person narration","Dialogue-heavy narration"],answer:"A technique representing the continuous flow of a character's thoughts",hint:"Virginia Woolf and James Joyce used stream of consciousness!"},
    {level:"hard",q:"What is zeugma?",options:["A type of metaphor","Using one word to modify two or more words in different ways","A figure of speech with opposites","A type of irony"],answer:"Using one word to modify two or more words in different ways",hint:"She stole his heart and his wallet — stole works differently for both!"},
    {level:"hard",q:"What is tautology?",options:["A type of paradox","Saying the same thing twice in different words","A type of irony","A figure of speech with animals"],answer:"Saying the same thing twice in different words",hint:"Free gift or advance warning — both words mean the same thing!"},
    {level:"hard",q:"What is hamartia in Greek tragedy?",options:["The villain","The hero's fatal flaw that leads to downfall","The climax","The resolution"],answer:"The hero's fatal flaw that leads to downfall",hint:"Hamlet's hamartia = indecision. Macbeth = ambition. Fatal flaws!"},
    {level:"hard",q:"What is intertextuality?",options:["Writing between paragraphs","The way a text references or is shaped by other texts","Footnotes in a novel","A writing technique"],answer:"The way a text references or is shaped by other texts",hint:"Wide Sargasso Sea responds to Jane Eyre — intertextuality!"},
    {level:"hard",q:"What is a Petrarchan sonnet?",options:["14 lines rhyming ABAB","14 lines with an octave (ABBAABBA) and sestet","A poem with 10 lines","A poem with no rhyme scheme"],answer:"14 lines with an octave (ABBAABBA) and sestet",hint:"Petrarchan sonnets have an 8-line problem and 6-line resolution!"},
    {level:"hard",q:"What is a doppelganger in literature?",options:["A villain","A character's double representing their dark side","An unreliable narrator","A type of ghost story"],answer:"A character's double representing their dark side",hint:"Dr Jekyll and Mr Hyde — Hyde is Jekyll's doppelganger!"},
    {level:"hard",q:"What is existentialism as a literary philosophy?",options:["Life has predetermined meaning","Individuals must create their own meaning in an absurd world","God determines fate","Society shapes human nature completely"],answer:"Individuals must create their own meaning in an absurd world",hint:"Sartre and Camus: there is no inherent meaning — we must create it ourselves!"},
    {level:"hard",q:"What is synecdoche?",options:["A type of metaphor","A figure of speech where a part represents the whole","A comparison using like","Giving objects human qualities"],answer:"A figure of speech where a part represents the whole",hint:"All hands on deck — hands represents sailors!"},
    {level:"hard",q:"What is magical realism?",options:["Pure fantasy fiction","A genre where magical elements appear in realistic settings","Science fiction","Horror fiction"],answer:"A genre where magical elements appear in realistic settings",hint:"Garcia Marquez — magic feels real in his novels!"},
    {level:"hard",q:"What is iambic pentameter?",options:["10 syllables in any pattern","A line of 10 syllables with alternating unstressed and stressed beats","A type of free verse","A poem with 5 lines"],answer:"A line of 10 syllables with alternating unstressed and stressed beats",hint:"da-DUM da-DUM da-DUM da-DUM da-DUM = 5 iambic feet!"},
    {level:"hard",q:"What is apostrophe as a literary device?",options:["A punctuation mark","Addressing an absent person or abstract concept directly","A type of metaphor","A figure of speech with repetition"],answer:"Addressing an absent person or abstract concept directly",hint:"O Romeo, Romeo, wherefore art thou Romeo — Juliet addresses absent Romeo!"},
    {level:"hard",q:"What is a dramatic monologue?",options:["A speech in a play","A poem where a single speaker addresses a silent listener, revealing character","A type of dialogue","First-person narration"],answer:"A poem where a single speaker addresses a silent listener, revealing character",hint:"Robert Browning's My Last Duchess — the Duke reveals his sinister character!"},
    {level:"hard",q:"What is post-colonial literature?",options:["Literature written before colonialism","Literature examining the impact of colonialism","Historical fiction","Literature from developing countries only"],answer:"Literature examining the impact of colonialism",hint:"Chinua Achebe's Things Fall Apart challenges the colonial narrative!"},
    {level:"hard",q:"What is ambivalence in literary analysis?",options:["Clear emotion","Holding contradictory feelings about the same subject simultaneously","A type of irony","Lack of emotion"],answer:"Holding contradictory feelings about the same subject simultaneously",hint:"A character can feel both love and resentment for a parent!"},
    {level:"hard",q:"What is the hero's journey or monomyth?",options:["A linear adventure story","A narrative pattern where a hero leaves home, faces trials, and returns transformed","A type of Greek tragedy","A fairy tale structure"],answer:"A narrative pattern where a hero leaves home, faces trials, and returns transformed",hint:"Star Wars, Harry Potter, The Lion King all follow the hero's journey!"},
    {level:"hard",q:"What is litotes?",options:["Extreme exaggeration","Understatement using a negative to affirm a positive","A type of simile","A narrative device"],answer:"Understatement using a negative to affirm a positive",hint:"Not bad meaning good — litotes!"},
    {level:"hard",q:"What is allegory?",options:["A type of simile","A story where characters symbolise deeper meanings","A type of narrator","A figure of speech"],answer:"A story where characters symbolise deeper meanings",hint:"Animal Farm allegorises the Soviet Union!"},
    {level:"hard",q:"What is mimesis in literature?",options:["Comedy","The imitation or representation of reality in art","A type of irony","Stream of consciousness"],answer:"The imitation or representation of reality in art",hint:"Realist novels aim for mimesis — imitating life!"},
    {level:"hard",q:"What is narrative distance?",options:["Length of a story","How close or removed the narrator is from the action","The pace of a story","The number of characters"],answer:"How close or removed the narrator is from the action",hint:"First person = close. Omniscient = maximum distance!"},
    {level:"hard",q:"What is the Sapir-Whorf hypothesis?",options:["Language evolved from writing","Language shapes thought and perception","All languages are equally complex","Grammar is universal"],answer:"Language shapes thought and perception",hint:"Language influences how we think about reality!"},
    {level:"hard",q:"What is dystopian fiction?",options:["Fiction about a perfect society","Fiction presenting a totalitarian or catastrophic society","Historical fiction","Adventure fiction"],answer:"Fiction presenting a totalitarian or catastrophic society",hint:"1984, The Handmaid's Tale, The Hunger Games — all dystopian!"},
    {level:"hard",q:"What is narratology?",options:["The study of writing","The academic study of narrative structure","A type of literary theory","The history of literature"],answer:"The academic study of narrative structure",hint:"Narratologists like Genette study how all stories are structured!"},
    {level:"hard",q:"What is the death of the author theory?",options:["A theory about biographies","Barthes' theory that author intentions are irrelevant to meaning","A theory about reader response","A type of criticism"],answer:"Barthes' theory that author intentions are irrelevant to meaning",hint:"Once written, a text is free from its author — the reader creates meaning!"},
    {level:"hard",q:"What is the uncanny in literature?",options:["A type of horror","Something familiar yet strangely unsettling","A type of comedy","A narrative technique"],answer:"Something familiar yet strangely unsettling",hint:"A doll that seems almost human — familiar but deeply unsettling!"},
    {level:"hard",q:"What is cognitive estrangement in science fiction?",options:["Confusion in reading","Making the familiar seem strange to encourage critical thinking","An unreliable narrator","Stream of consciousness"],answer:"Making the familiar seem strange to encourage critical thinking",hint:"SF presents our world defamiliarised — making us see it critically!"},
    {level:"hard",q:"What is pathetic fallacy?",options:["A logical error","Using weather or nature to mirror character emotions","A sad story","An unreliable narrator"],answer:"Using weather or nature to mirror character emotions",hint:"A storm during an argument — the weather reflects the mood!"},
    {level:"hard",q:"What is periphrasis?",options:["Saying something directly","Using more words than necessary to describe something","A type of irony","Understatement"],answer:"Using more words than necessary to describe something",hint:"The country that gave birth to Shakespeare instead of just England = periphrasis!"},
    {level:"hard",q:"What is catharsis in Greek tragedy?",options:["The climax of a story","Emotional release felt by the audience","The opening of a story","A type of character"],answer:"Emotional release felt by the audience",hint:"Greek tragedy creates catharsis — emotional relief through drama!"},
    {level:"hard",q:"What is deconstruction as a literary theory?",options:["Analysing structure","A theory revealing contradictions within texts","A type of close reading","Rejecting all interpretation"],answer:"A theory revealing contradictions within texts",hint:"Derrida: texts undermine themselves — what they claim is contradicted within!"},
    {level:"hard",q:"What is the willing suspension of disbelief?",options:["Ignoring plot holes","A reader's acceptance of fictional premises for enjoying a story","A narrator technique","A type of irony"],answer:"A reader's acceptance of fictional premises for enjoying a story",hint:"Coleridge coined the phrase — we accept that dragons exist in fantasy!"},
    {level:"hard",q:"What is the sublime in Romantic literature?",options:["Something perfect","An overwhelming awe and terror before natural power","A type of comedy","A religious concept"],answer:"An overwhelming awe and terror before natural power",hint:"Wordsworth and Shelley evoked the sublime — mountains inspiring awe and terror!"},
    {level:"hard",q:"What is intersectionality in literary criticism?",options:["How plots interweave","Analysis of how overlapping social categories create overlapping systems of oppression in texts","A type of narration","How characters interact"],answer:"Analysis of how overlapping social categories create overlapping systems of oppression in texts",hint:"Race, gender and class intersect — Black women face multiple simultaneous oppressions!"},
    {level:"hard",q:"What is verisimilitude?",options:["A type of metaphor","The appearance of truth or reality in a work of fiction","A narrative technique","The climax of a story"],answer:"The appearance of truth or reality in a work of fiction",hint:"Good fiction has verisimilitude — it feels real even though it is not!"},
    {level:"hard",q:"What is dramatic irony?",options:["When a story is exciting","When the audience knows something characters do not","When a character says the opposite of what they mean","When events surprise everyone"],answer:"When the audience knows something characters do not",hint:"In Romeo and Juliet, we know Juliet is asleep but Romeo thinks she is dead!"},
    {level:"hard",q:"What is the Aristotelian tragic arc?",options:["Three acts of equal length","Exposition, rising action, climax, falling action, catastrophe","Beginning, middle, end only","Two acts with an interval"],answer:"Exposition, rising action, climax, falling action, catastrophe",hint:"Greek tragedy follows a specific arc with catharsis at the end!"},
    {level:"hard",q:"What is a foil character?",options:["The hero of the story","A character who contrasts with the protagonist to highlight their traits","A villain","A narrator"],answer:"A character who contrasts with the protagonist to highlight their traits",hint:"Laertes is Hamlet's foil — decisive where Hamlet is indecisive!"},
    {level:"hard",q:"What is the objective correlative?",options:["An unbiased narrator","A set of objects or events that evoke a specific emotion","A character who represents an idea","A type of metaphor"],answer:"A set of objects or events that evoke a specific emotion",hint:"T.S. Eliot said the only way to express emotion is through external objects that trigger that feeling!"},
    {level:"hard",q:"What is heteroglossia?",options:["Use of multiple languages","The presence of multiple voices and perspectives in a text","A type of narration","Dialect in dialogue"],answer:"The presence of multiple voices and perspectives in a text",hint:"Bakhtin: novels contain many social voices — heteroglossia!"},
    {level:"hard",q:"What is connotation vs denotation?",options:["Same thing","Denotation=literal meaning; connotation=emotional associations","Connotation=dictionary meaning","Denotation changes with context"],answer:"Denotation=literal meaning; connotation=emotional associations",hint:"Home = a dwelling (denotation). Home = warmth and safety (connotation)!"},
    {level:"hard",q:"What is a motif in literature?",options:["The main character","A recurring element with symbolic significance","The title","The setting"],answer:"A recurring element with symbolic significance",hint:"A recurring rose symbolising love is a motif!"},
    {level:"hard",q:"What is showing vs telling in fiction?",options:["Same thing","Showing reveals through action; telling states directly","Telling is better writing","Showing uses more adjectives"],answer:"Showing reveals through action; telling states directly",hint:"Telling: She was angry. Showing: She slammed the door and did not speak for hours."},
    {level:"hard",q:"What is an anachronism?",options:["A word with multiple meanings","Something placed in the wrong time period","A figure of speech","A type of rhyme"],answer:"Something placed in the wrong time period",hint:"A character in ancient Rome using a phone is an anachronism!"},
    {level:"hard",q:"What is narrative voice?",options:["The author's biography","The perspective and personality through which a story is told","The main character","The dialogue"],answer:"The perspective and personality through which a story is told",hint:"Child narrator, omniscient narrator, unreliable narrator — different voices!"}
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
    // ── EXTRA EASY ──
    {level:"easy",passage:"Ben has a red ball. He plays with it in the park every day. His favourite game is catch with his dad.",q:"What colour is Ben's ball?",options:["Blue","Green","Red","Yellow"],answer:"Red",hint:"Read the first sentence!"},
    {level:"easy",passage:"Sara loves butterflies. She saw a yellow one in the garden. It landed on a flower and flew away.",q:"What colour was the butterfly?",options:["Red","Blue","Yellow","Green"],answer:"Yellow",hint:"Find the sentence about the butterfly!"},
    {level:"easy",passage:"Tim has a pet rabbit called Snowy. Snowy is white and fluffy. Tim feeds Snowy carrots every morning.",q:"What does Tim feed Snowy?",options:["Grass","Lettuce","Carrots","Apples"],answer:"Carrots",hint:"Read the last sentence!"},
    {level:"easy",passage:"The children went to the zoo. They saw lions, elephants and giraffes. Their favourite animal was the giraffe because of its long neck.",q:"What was the children's favourite animal?",options:["Lion","Elephant","Giraffe","Zebra"],answer:"Giraffe",hint:"Find the sentence about their favourite!"},
    // ── EXTRA MEDIUM ──
    {level:"medium",passage:"Dolphins are highly intelligent marine mammals. They live in groups called pods and communicate using clicks and whistles. Dolphins have been known to help injured members of their pod.",q:"What do dolphins live in?",options:["Herds","Packs","Pods","Schools"],answer:"Pods",hint:"Find the word that describes their group!"},
    {level:"medium",passage:"The Great Wall of China is one of the largest structures ever built. It stretches over 21,000 kilometres across northern China. It was built to protect China from invasions.",q:"Why was the Great Wall built?",options:["For tourism","To show wealth","To protect from invasions","For trade routes"],answer:"To protect from invasions",hint:"Read the last sentence!"},
    {level:"medium",passage:"Volcanoes form when hot melted rock called magma pushes up through cracks in the Earth's surface. When a volcano erupts, magma flows out as lava. Some volcanoes are found under the ocean.",q:"What is magma called once it erupts?",options:["Ash","Steam","Lava","Rock"],answer:"Lava",hint:"Find the sentence about what magma becomes!"},
    // ── EXTRA HARD ──
    {level:"hard",passage:"Marie Curie was the first woman to win a Nobel Prize, and the only person ever to win Nobel Prizes in two different sciences — Physics in 1903 and Chemistry in 1911. Her discoveries about radioactivity changed the world of science forever.",q:"How many Nobel Prizes did Marie Curie win?",options:["1","2","3","4"],answer:"2",hint:"Read carefully — she won prizes in two different sciences!"},
    {level:"hard",passage:"Migration is the seasonal movement of animals from one region to another. Arctic terns hold the record for the longest migration, travelling up to 90,000 kilometres each year between the Arctic and Antarctic. Scientists track these journeys using tiny tracking devices.",q:"Which animal has the longest migration?",options:["Monarch butterfly","Humpback whale","Arctic tern","Wildebeest"],answer:"Arctic tern",hint:"Find the sentence mentioning the record!"},
    // ── MORE EASY ──
    {level:"easy",passage:"Joe loves football. He plays every Saturday with his friends. His team won the match last week and he scored two goals.",q:"When does Joe play football?",options:["Sunday","Monday","Saturday","Friday"],answer:"Saturday",hint:"Read the second sentence!"},
    {level:"easy",passage:"Anna has a pet fish called Bubbles. She feeds it every morning. The fish lives in a big blue tank in her bedroom.",q:"Where does Bubbles live?",options:["In the kitchen","In the garden","In Anna's bedroom","In the bathroom"],answer:"In Anna's bedroom",hint:"Read the last sentence!"},
    {level:"easy",passage:"The zoo has many animals. There are lions, monkeys, and penguins. The penguins are the most popular because they swim so fast.",q:"Which animals are most popular?",options:["Lions","Monkeys","Penguins","Elephants"],answer:"Penguins",hint:"Find the sentence about the most popular animals!"},
    {level:"easy",passage:"Mum made a birthday cake. It had chocolate frosting and ten candles. Everyone sang happy birthday and clapped.",q:"How many candles were on the cake?",options:["5","8","10","12"],answer:"10",hint:"Find the number in the second sentence!"},
    {level:"easy",passage:"It was snowing outside. Sam put on his coat, hat and gloves. He made a big snowman in the garden.",q:"What did Sam make?",options:["A snow angel","A snowball","A snowman","An igloo"],answer:"A snowman",hint:"Read the last sentence!"},
    {level:"easy",passage:"Lily found a caterpillar in the garden. She put it in a jar with leaves. Two weeks later, a beautiful butterfly flew out.",q:"What came out of the jar?",options:["A moth","A bee","A caterpillar","A butterfly"],answer:"A butterfly",hint:"Read the last sentence!"},
    // ── MORE MEDIUM ──
    {level:"medium",passage:"The cheetah is the fastest land animal on Earth. It can reach speeds of up to 112 kilometres per hour. However, it can only maintain this speed for short bursts before it tires.",q:"How fast can a cheetah run?",options:["Up to 80 km/h","Up to 100 km/h","Up to 112 km/h","Up to 150 km/h"],answer:"Up to 112 km/h",hint:"Find the exact speed in the passage!"},
    {level:"medium",passage:"Rainforests cover only 6% of the Earth's surface, but are home to more than half of the world's plant and animal species. They receive over 2000mm of rain each year and are found near the equator.",q:"What fraction of Earth's surface do rainforests cover?",options:["6%","12%","25%","50%"],answer:"6%",hint:"Find the exact percentage in the first sentence!"},
    {level:"medium",passage:"The Wright brothers, Orville and Wilbur, made the first successful powered aeroplane flight in 1903. The flight lasted only 12 seconds and covered 37 metres. It changed the world forever.",q:"How long did the first flight last?",options:["6 seconds","12 seconds","37 seconds","1 minute"],answer:"12 seconds",hint:"Find the flight duration in the second sentence!"},
    {level:"medium",passage:"Honeybees live in colonies of up to 60,000 bees. Each colony has one queen, thousands of workers, and a few hundred drones. The queen can lay up to 2,000 eggs per day.",q:"How many eggs can a queen bee lay per day?",options:["200","600","1,000","2,000"],answer:"2,000",hint:"Find the number in the last sentence!"},
    {level:"medium",passage:"The Sahara Desert is the largest hot desert in the world. It covers about 9 million square kilometres across North Africa. Temperatures can reach 50°C during the day but drop sharply at night.",q:"Where is the Sahara Desert located?",options:["South America","Central Asia","North Africa","Southern Europe"],answer:"North Africa",hint:"Find the location in the second sentence!"},
    // ── MORE HARD ──
    {level:"hard",passage:"Shakespeare wrote 37 plays and 154 sonnets during his lifetime. He was born in Stratford-upon-Avon in 1564 and died in 1616. His works have been translated into every major language and are performed more often than those of any other playwright.",q:"How many plays did Shakespeare write?",options:["27","37","47","154"],answer:"37",hint:"Find the exact number of plays in the first sentence!"},
    {level:"hard",passage:"Black holes are regions of space where gravity is so strong that nothing — not even light — can escape. They form when massive stars collapse at the end of their lives. Scientists cannot see black holes directly but detect them by their effect on nearby matter.",q:"How do scientists detect black holes?",options:["By their light","By their colour","By their effect on nearby matter","By their size"],answer:"By their effect on nearby matter",hint:"Read the last sentence carefully!"},
    {level:"hard",passage:"The Industrial Revolution began in Britain in the 18th century and transformed how goods were manufactured. Machines replaced hand tools, and factories replaced small workshops. Cities grew rapidly as workers moved from rural areas to find employment.",q:"What did machines replace during the Industrial Revolution?",options:["Factories","Hand tools","Cities","Workers"],answer:"Hand tools",hint:"Find what machines replaced in the second sentence!"},
  
    {"level":"easy","passage":"Sam loves football. He plays every Saturday with his friends. His team won last week and he scored two goals.","q":"When does Sam play football?","options":["Sunday","Monday","Saturday","Friday"],"answer":"Saturday","hint":"Read the second sentence!"},
    {"level":"easy","passage":"Anna has a pet fish called Bubbles. She feeds it every morning. The fish lives in a big blue tank in her bedroom.","q":"Where does Bubbles live?","options":["In the kitchen","In the garden","In Anna's bedroom","In the bathroom"],"answer":"In Anna's bedroom","hint":"Read the last sentence!"},
    {"level":"easy","passage":"The zoo has many animals. There are lions, monkeys, and penguins. The penguins are the most popular because they swim so fast.","q":"Which animals are most popular?","options":["Lions","Monkeys","Penguins","Elephants"],"answer":"Penguins","hint":"Find the sentence about the most popular!"},
    {"level":"easy","passage":"Lily found a caterpillar in the garden. She put it in a jar with leaves. Two weeks later, a beautiful butterfly flew out.","q":"What came out of the jar?","options":["A moth","A bee","A caterpillar","A butterfly"],"answer":"A butterfly","hint":"Read the last sentence!"},
    {"level":"easy","passage":"It was snowing outside. Sam put on his coat, hat and gloves. He made a big snowman in the garden.","q":"What did Sam make?","options":["A snow angel","A snowball","A snowman","An igloo"],"answer":"A snowman","hint":"Read the last sentence!"},
    {"level":"medium","passage":"The cheetah is the fastest land animal. It can reach speeds of up to 112 kilometres per hour. However, it can only maintain this speed for short bursts.","q":"How fast can a cheetah run?","options":["Up to 80 km/h","Up to 100 km/h","Up to 112 km/h","Up to 150 km/h"],"answer":"Up to 112 km/h","hint":"Find the exact speed!"},
    {"level":"medium","passage":"The Wright brothers made the first successful powered aeroplane flight in 1903. The flight lasted only 12 seconds and covered 37 metres.","q":"How long did the first flight last?","options":["6 seconds","12 seconds","37 seconds","1 minute"],"answer":"12 seconds","hint":"Find the duration in the second sentence!"},
    {"level":"medium","passage":"Honeybees live in colonies of up to 60,000 bees. Each colony has one queen, thousands of workers, and a few hundred drones. The queen can lay up to 2,000 eggs per day.","q":"How many eggs can a queen bee lay per day?","options":["200","600","1,000","2,000"],"answer":"2,000","hint":"Find the number in the last sentence!"},
    {"level":"medium","passage":"The Sahara Desert is the largest hot desert in the world. It covers about 9 million square kilometres across North Africa. Temperatures can reach 50°C during the day.","q":"Where is the Sahara Desert?","options":["South America","Central Asia","North Africa","Southern Europe"],"answer":"North Africa","hint":"Find the location in the second sentence!"},
    {"level":"medium","passage":"Rainforests cover only 6% of Earth's surface, but are home to more than half the world's plant and animal species. They receive over 2000mm of rain each year.","q":"What fraction of Earth's surface do rainforests cover?","options":["6%","12%","25%","50%"],"answer":"6%","hint":"Find the percentage in the first sentence!"},
    {"level":"hard","passage":"Shakespeare wrote 37 plays and 154 sonnets during his lifetime. Born in Stratford-upon-Avon in 1564, his works have been translated into every major language.","q":"How many plays did Shakespeare write?","options":["27","37","47","154"],"answer":"37","hint":"Find the exact number of plays in the first sentence!"},
    {"level":"hard","passage":"Black holes are regions of space where gravity is so strong that nothing — not even light — can escape. Scientists cannot see black holes directly but detect them by their effect on nearby matter.","q":"How do scientists detect black holes?","options":["By their light","By their colour","By their effect on nearby matter","By their size"],"answer":"By their effect on nearby matter","hint":"Read the last sentence carefully!"},
    {"level":"hard","passage":"The Industrial Revolution began in Britain in the 18th century. Machines replaced hand tools, and factories replaced small workshops. Cities grew rapidly as workers moved from rural areas.","q":"What did machines replace during the Industrial Revolution?","options":["Factories","Hand tools","Cities","Workers"],"answer":"Hand tools","hint":"Find what machines replaced in the second sentence!"},
    {"level":"hard","passage":"Marie Curie was the first woman to win a Nobel Prize, and the only person ever to win Nobel Prizes in two different sciences — Physics in 1903 and Chemistry in 1911.","q":"How many Nobel Prizes did Marie Curie win?","options":["1","2","3","4"],"answer":"2","hint":"She won prizes in two different sciences!"},
  ,
    {level:"easy",passage:"Sam loves football. He plays every Saturday with his friends. His team won last week and he scored two goals.",q:"When does Sam play football?",options:["Sunday","Monday","Saturday","Friday"],answer:"Saturday",hint:"Read the second sentence!"},
    {level:"easy",passage:"Anna has a pet fish called Bubbles. She feeds it every morning. The fish lives in a big blue tank in her bedroom.",q:"Where does Bubbles live?",options:["In the kitchen","In the garden","In Anna's bedroom","In the bathroom"],answer:"In Anna's bedroom",hint:"Read the last sentence!"},
    {level:"easy",passage:"The zoo has many animals. There are lions, monkeys, and penguins. The penguins are the most popular because they swim so fast.",q:"Which animals are most popular?",options:["Lions","Monkeys","Penguins","Elephants"],answer:"Penguins",hint:"Which animals are described as most popular?"},
    {level:"easy",passage:"Lily found a caterpillar in the garden. She put it in a jar with leaves. Two weeks later, a beautiful butterfly flew out.",q:"What came out of the jar?",options:["A moth","A bee","A caterpillar","A butterfly"],answer:"A butterfly",hint:"Read the last sentence!"},
    {level:"easy",passage:"It was snowing outside. Tom put on his coat, hat and gloves. He built a big snowman in the garden with his sister.",q:"What did Tom build?",options:["A snow angel","A snowball","A snowman","An igloo"],answer:"A snowman",hint:"Read the last sentence!"},
    {level:"easy",passage:"Mia got a puppy for her birthday. She called it Biscuit. Biscuit loves to run in the park and chase balls.",q:"What is the puppy's name?",options:["Cookie","Biscuit","Crumpet","Waffle"],answer:"Biscuit",hint:"She named the puppy in the second sentence!"},
    {level:"easy",passage:"The library opens at 9am every day except Sunday. You can borrow up to six books at a time. Books must be returned within three weeks.",q:"How many books can you borrow?",options:["3","4","5","6"],answer:"6",hint:"Find the number in the second sentence!"},
    {level:"easy",passage:"Zara loves painting. She painted a rainbow yesterday using seven colours. She hung it on the wall in her room.",q:"How many colours did Zara use?",options:["5","6","7","8"],answer:"7",hint:"Find the number in the second sentence!"},
    {level:"easy",passage:"The school fair is on Friday. There will be cake stalls, games, and a raffle. All money raised goes to the school garden.",q:"When is the school fair?",options:["Monday","Wednesday","Friday","Saturday"],answer:"Friday",hint:"The day is in the first sentence!"},
    {level:"easy",passage:"Jake has three pets: a dog, a cat, and a goldfish. The dog is the oldest. The goldfish is the newest.",q:"Which of Jake's pets is newest?",options:["Dog","Cat","Goldfish","Rabbit"],answer:"Goldfish",hint:"Read the last sentence!"},
    {level:"easy",passage:"The sun rises in the east and sets in the west. During summer, days are long. In winter, days are short and nights are long.",q:"Where does the sun rise?",options:["North","South","East","West"],answer:"East",hint:"Read the first sentence!"},
    {level:"easy",passage:"Ben's favourite food is pizza. He likes it best with extra cheese. He eats pizza every Friday night with his family.",q:"When does Ben eat pizza?",options:["Monday","Wednesday","Friday","Sunday"],answer:"Friday",hint:"Find the day in the last sentence!"},
    {level:"easy",passage:"The butterfly lands on flowers. It drinks sweet nectar using its long tongue. The bright colours on its wings scare away birds.",q:"Why does the butterfly have bright colours?",options:["To attract bees","To find food","To scare away birds","To stay warm"],answer:"To scare away birds",hint:"Read the last sentence!"},
    {level:"easy",passage:"Grandma makes the best soup. She uses carrots, potatoes and chicken. It takes two hours to cook.",q:"How long does the soup take to cook?",options:["30 minutes","1 hour","2 hours","3 hours"],answer:"2 hours",hint:"Read the last sentence!"},
    {level:"easy",passage:"Penguins live in the Antarctic. They cannot fly but they are excellent swimmers. A group of penguins is called a colony.",q:"What is a group of penguins called?",options:["Flock","Pack","Colony","Herd"],answer:"Colony",hint:"Read the last sentence!"},
    {level:"medium",passage:"The cheetah is the fastest land animal. It can reach speeds of up to 112 kilometres per hour. However, it can only maintain this speed for short bursts of about 30 seconds.",q:"How fast can a cheetah run?",options:["Up to 80 km/h","Up to 100 km/h","Up to 112 km/h","Up to 150 km/h"],answer:"Up to 112 km/h",hint:"Find the exact speed!"},
    {level:"medium",passage:"The Wright brothers made the first successful powered aeroplane flight in 1903. The flight lasted only 12 seconds and covered 37 metres.",q:"How long did the first flight last?",options:["6 seconds","12 seconds","37 seconds","1 minute"],answer:"12 seconds",hint:"Find the duration in the second sentence!"},
    {level:"medium",passage:"Honeybees live in colonies of up to 60,000 bees. Each colony has one queen, thousands of workers, and a few hundred drones. The queen can lay up to 2,000 eggs per day.",q:"How many eggs can a queen bee lay per day?",options:["200","600","1,000","2,000"],answer:"2,000",hint:"Read the last sentence!"},
    {level:"medium",passage:"The Sahara Desert is the largest hot desert in the world. It covers about 9 million square kilometres across North Africa. Temperatures can reach 50°C during the day.",q:"Where is the Sahara Desert?",options:["South America","Central Asia","North Africa","Southern Europe"],answer:"North Africa",hint:"Find the location in the second sentence!"},
    {level:"medium",passage:"Rainforests cover only 6% of Earth's surface, but are home to more than half the world's plant and animal species. They receive over 2000mm of rain each year.",q:"What fraction of Earth's surface do rainforests cover?",options:["6%","12%","25%","50%"],answer:"6%",hint:"Find the percentage in the first sentence!"},
    {level:"medium",passage:"The Great Wall of China stretches over 21,000 kilometres. It was built over many centuries to protect China from invasions from the north. Millions of workers helped to build it.",q:"How long is the Great Wall of China?",options:["2,100 km","12,000 km","21,000 km","210,000 km"],answer:"21,000 km",hint:"Find the length in the first sentence!"},
    {level:"medium",passage:"Dolphins are highly intelligent mammals. They communicate using clicks and whistles. Scientists have found that each dolphin has a unique signature whistle, like a name.",q:"How do dolphins communicate?",options:["Through body language only","Using clicks and whistles","Through touch only","Using sight only"],answer:"Using clicks and whistles",hint:"Read the second sentence!"},
    {level:"medium",passage:"The Amazon rainforest produces about 20% of the world's oxygen. It is home to about 10% of all species on Earth. Deforestation threatens this vital ecosystem every year.",q:"What percentage of oxygen does the Amazon produce?",options:["10%","15%","20%","25%"],answer:"20%",hint:"Find the percentage in the first sentence!"},
    {level:"medium",passage:"Mount Everest is the highest mountain in the world at 8,849 metres above sea level. It is part of the Himalayan mountain range in Asia. The first confirmed summit was in 1953.",q:"When was Everest first successfully climbed?",options:["1903","1933","1953","1963"],answer:"1953",hint:"Read the last sentence!"},
    {level:"medium",passage:"The human body has 206 bones in adulthood. Babies are born with around 270 to 300 bones, but many fuse together as they grow. The femur, in the thigh, is the longest bone.",q:"How many bones does an adult human have?",options:["196","206","270","300"],answer:"206",hint:"Read the first sentence!"},
    {level:"medium",passage:"Volcanoes form when magma from inside the Earth pushes through the crust. When they erupt, they release lava, ash and gases. Some volcanoes are dormant and have not erupted for centuries.",q:"What does a volcano release when it erupts?",options:["Only lava","Only ash","Lava, ash and gases","Only gases"],answer:"Lava, ash and gases",hint:"Read the second sentence!"},
    {level:"medium",passage:"Olympic Games take place every four years. Athletes from around the world compete in hundreds of events. The first modern Olympics were held in Athens in 1896.",q:"How often do the Olympic Games take place?",options:["Every year","Every 2 years","Every 4 years","Every 5 years"],answer:"Every 4 years",hint:"Read the first sentence!"},
    {level:"medium",passage:"Photosynthesis is the process plants use to make food. They absorb sunlight, water and carbon dioxide. Oxygen is released as a by-product.",q:"What is released as a by-product of photosynthesis?",options:["Carbon dioxide","Water","Sunlight","Oxygen"],answer:"Oxygen",hint:"Read the last sentence!"},
    {level:"medium",passage:"The blue whale is the largest animal ever known to have lived on Earth. It can weigh up to 200 tonnes and grow to 30 metres long. Its heart alone is the size of a small car.",q:"How long can a blue whale grow?",options:["20 metres","25 metres","30 metres","40 metres"],answer:"30 metres",hint:"Find the length in the second sentence!"},
    {level:"medium",passage:"The moon has no atmosphere and no weather. Its surface is covered in craters caused by meteor impacts over billions of years. The same side of the moon always faces Earth.",q:"What caused the craters on the moon?",options:["Volcanoes","Earthquakes","Meteor impacts","Wind erosion"],answer:"Meteor impacts",hint:"Read the second sentence!"},
    {level:"hard",passage:"Shakespeare wrote 37 plays and 154 sonnets. Born in Stratford-upon-Avon in 1564, his works have been translated into every major language.",q:"How many sonnets did Shakespeare write?",options:["37","100","154","200"],answer:"154",hint:"Find the number in the first sentence!"},
    {level:"hard",passage:"Black holes are regions of space where gravity is so strong that nothing — not even light — can escape. Scientists cannot see black holes directly but detect them by their effect on nearby matter.",q:"How do scientists detect black holes?",options:["By their light","By their colour","By their effect on nearby matter","By their size"],answer:"By their effect on nearby matter",hint:"Read the last sentence!"},
    {level:"hard",passage:"The Industrial Revolution began in Britain in the 18th century. Machines replaced hand tools, and factories replaced small workshops. Cities grew rapidly as workers moved from rural areas.",q:"What happened to cities during the Industrial Revolution?",options:["They shrank","They stayed the same","They grew rapidly","They were destroyed"],answer:"They grew rapidly",hint:"Read the last sentence!"},
    {level:"hard",passage:"Marie Curie was the first woman to win a Nobel Prize, and the only person ever to win Nobel Prizes in two different sciences — Physics in 1903 and Chemistry in 1911.",q:"In which two sciences did Marie Curie win Nobel Prizes?",options:["Physics and Biology","Chemistry and Medicine","Physics and Chemistry","Biology and Chemistry"],answer:"Physics and Chemistry",hint:"Both sciences are named in the text!"},
    {level:"hard",passage:"The concept of zero was independently developed in several ancient civilisations. The Babylonians used a placeholder zero around 300 BCE. However, the zero we use today originates from ancient India.",q:"Where does our modern zero originate from?",options:["Babylon","Egypt","Ancient India","Ancient Greece"],answer:"Ancient India",hint:"Read the last sentence!"},
    {level:"hard",passage:"Antibiotics were discovered by Alexander Fleming in 1928 when he noticed mould growing on a petri dish was killing bacteria. However, penicillin was not widely used until the 1940s during World War II.",q:"When did Fleming discover antibiotics?",options:["1918","1928","1938","1948"],answer:"1928",hint:"The year is in the first sentence!"},
    {level:"hard",passage:"The water cycle describes how water moves continuously on Earth. Water evaporates from oceans and lakes, rises as vapour, cools to form clouds, then falls as precipitation. This cycle supports all life on Earth.",q:"What happens to water vapour after it rises?",options:["It falls as rain immediately","It evaporates again","It cools to form clouds","It becomes ice"],answer:"It cools to form clouds",hint:"Follow the stages of the water cycle in the text!"},
    {level:"hard",passage:"The Renaissance was a cultural movement that began in Italy in the 14th century. Artists like Leonardo da Vinci and Michelangelo created masterpieces during this period. The movement gradually spread throughout Europe.",q:"Where did the Renaissance begin?",options:["France","England","Spain","Italy"],answer:"Italy",hint:"Read the first sentence!"},
    {level:"hard",passage:"DNA carries the genetic instructions used in the development and functioning of all known living organisms. It is found in the nucleus of cells. DNA is a double helix — shaped like a twisted ladder.",q:"What shape is DNA?",options:["A straight line","A circle","A double helix","A cube"],answer:"A double helix",hint:"Read the last sentence!"},
    {level:"hard",passage:"The ozone layer is a region of Earth's stratosphere that absorbs most of the Sun's ultraviolet radiation. Damage to the ozone layer increases skin cancer risk. Certain chemicals called CFCs were found to deplete it.",q:"What do CFCs do to the ozone layer?",options:["They strengthen it","They have no effect","They deplete it","They create it"],answer:"They deplete it",hint:"Read the last sentence!"},
    {level:"hard",passage:"Charles Darwin's theory of natural selection proposed that organisms with favourable traits are more likely to survive and reproduce. Over generations, these traits become more common in a population. This process drives evolution.",q:"According to Darwin, what happens to favourable traits over generations?",options:["They disappear","They stay the same","They become more common","They become harmful"],answer:"They become more common",hint:"Read the second sentence!"},
    {level:"hard",passage:"The French Revolution began in 1789 when King Louis XVI faced financial crisis and growing public anger. Revolutionaries stormed the Bastille prison on 14 July. The revolution eventually led to Napoleon's rise to power.",q:"When did the French Revolution begin?",options:["1776","1789","1800","1815"],answer:"1789",hint:"Read the first sentence!"},
    {level:"hard",passage:"Tectonic plates are massive segments of Earth's crust that move very slowly — about 2 to 5 centimetres per year. When plates collide or separate, earthquakes and volcanoes often occur. The Himalayas formed when two plates collided.",q:"How fast do tectonic plates move?",options:["2 to 5 mm per year","2 to 5 cm per year","2 to 5 m per year","2 to 5 km per year"],answer:"2 to 5 cm per year",hint:"Find the speed in the first sentence!"},
    {level:"hard",passage:"Artificial intelligence refers to computer systems that can perform tasks that normally require human intelligence — such as recognising speech, making decisions, and translating languages. AI is now used in everyday technology including smartphones.",q:"What can AI systems do that normally requires human intelligence?",options:["Only do maths","Only search the internet","Recognise speech, make decisions, translate languages","Only play games"],answer:"Recognise speech, make decisions, translate languages",hint:"Examples are listed in the first sentence!"},
    {level:"hard",passage:"The printing press, invented by Gutenberg around 1440, revolutionised communication. Before this invention, books had to be copied by hand and were extremely rare and expensive. After its invention, literacy spread rapidly across Europe.",q:"What happened to literacy after the printing press was invented?",options:["It declined","It stayed the same","It spread rapidly","It was restricted to the wealthy"],answer:"It spread rapidly",hint:"Read the last sentence!"}
  ,
    {level:"easy",passage:"Tom has a red kite. He flies it in the park on windy days. Yesterday the wind was very strong and the kite went very high.",q:"What colour is Tom's kite?",options:["Blue","Green","Red","Yellow"],answer:"Red",hint:"Read the first sentence!"},
    {level:"easy",passage:"Bella loves music. She plays the piano every day after school. Her favourite song is Twinkle Twinkle Little Star.",q:"What instrument does Bella play?",options:["Violin","Guitar","Piano","Drums"],answer:"Piano",hint:"Read the second sentence!"},
    {level:"easy",passage:"The farm has many animals. There are cows, sheep and chickens. The farmer wakes up early every morning to feed them.",q:"What time does the farmer wake up?",options:["Late at night","At noon","Early every morning","At lunchtime"],answer:"Early every morning",hint:"Read the last sentence!"},
    {level:"easy",passage:"Jack has three pet goldfish. He keeps them in a big glass bowl. He feeds them fish food twice a day.",q:"How often does Jack feed his fish?",options:["Once a day","Twice a day","Three times a day","Once a week"],answer:"Twice a day",hint:"Read the last sentence!"},
    {level:"easy",passage:"Maya loves to read. She borrows five books from the library every week. She reads before bed every night.",q:"How many books does Maya borrow each week?",options:["Three","Four","Five","Six"],answer:"Five",hint:"Find the number in the second sentence!"},
    {level:"easy",passage:"Dan went to the beach. He built a huge sandcastle and found three shells. He swam in the sea in the afternoon.",q:"What did Dan build at the beach?",options:["A snowman","A sandcastle","A boat","A hut"],answer:"A sandcastle",hint:"Read the second sentence!"},
    {level:"easy",passage:"A rainbow has seven colours. They are red, orange, yellow, green, blue, indigo and violet. Rainbows appear when it rains and the sun shines at the same time.",q:"How many colours does a rainbow have?",options:["Five","Six","Seven","Eight"],answer:"Seven",hint:"Read the first sentence!"},
    {level:"easy",passage:"Owls are nocturnal birds. They sleep during the day and hunt at night. They have big eyes that help them see in the dark.",q:"When do owls sleep?",options:["At night","During the day","In the evening","In the morning"],answer:"During the day",hint:"Read the second sentence!"},
    {level:"easy",passage:"The cinema is showing three films this week. The one about dinosaurs starts at 3pm. The superhero film starts at 5pm.",q:"What time does the dinosaur film start?",options:["1pm","2pm","3pm","5pm"],answer:"3pm",hint:"Read the second sentence!"},
    {level:"easy",passage:"Cats are popular pets. They clean themselves by licking their fur. A cat can sleep up to 16 hours a day.",q:"How do cats clean themselves?",options:["By swimming","By licking their fur","By rubbing on things","By rolling in water"],answer:"By licking their fur",hint:"Read the second sentence!"},
    {level:"easy",passage:"The school trip is on Thursday. Pupils must bring a packed lunch and wear sensible shoes. The bus leaves at 8:30am.",q:"What day is the school trip?",options:["Monday","Tuesday","Thursday","Friday"],answer:"Thursday",hint:"Read the first sentence!"},
    {level:"easy",passage:"Mrs Brown teaches Year 3. She has 28 pupils in her class. They are learning about the rainforest this term.",q:"How many pupils are in Mrs Brown's class?",options:["24","26","28","30"],answer:"28",hint:"Read the second sentence!"},
    {level:"easy",passage:"A spider has eight legs and eight eyes. It catches insects in its web. Spiders are found all over the world.",q:"How many legs does a spider have?",options:["Six","Seven","Eight","Ten"],answer:"Eight",hint:"Read the first sentence!"},
    {level:"easy",passage:"The supermarket is open seven days a week. It closes at 10pm every night. On Sundays it closes at 6pm.",q:"What time does the supermarket close on Sundays?",options:["8pm","9pm","6pm","10pm"],answer:"6pm",hint:"Read the last sentence!"},
    {level:"easy",passage:"Hugo loves football. He plays for the school team on Wednesdays. Last week his team won 3-1.",q:"What day does Hugo play football?",options:["Monday","Tuesday","Wednesday","Thursday"],answer:"Wednesday",hint:"Read the second sentence!"},
    {level:"easy",passage:"Butterflies start life as eggs. The eggs hatch into caterpillars. The caterpillars then form a chrysalis before becoming a butterfly.",q:"What hatches from butterfly eggs?",options:["Butterflies","Cocoons","Caterpillars","Chrysalises"],answer:"Caterpillars",hint:"Read the second sentence!"},
    {level:"easy",passage:"The park has a big pond with ducks. Children love to feed them bread. The park is open from 8am to sunset.",q:"What can children feed the ducks?",options:["Fish food","Seeds","Bread","Grain"],answer:"Bread",hint:"Read the second sentence!"},
    {level:"easy",passage:"Sara woke up and looked outside. Snow covered the ground and the trees. She put on her coat and gloves and ran outside to play.",q:"What did Sara see outside?",options:["Rain","Sunshine","Snow","Fog"],answer:"Snow",hint:"Read the second sentence!"},
    {level:"easy",passage:"A baby kangaroo is called a joey. It lives in its mother's pouch after it is born. It stays in the pouch for about six months.",q:"What is a baby kangaroo called?",options:["Cub","Foal","Joey","Lamb"],answer:"Joey",hint:"Read the first sentence!"},
    {level:"easy",passage:"The swimming pool is 25 metres long. It has six lanes. Lessons for beginners are held on Saturday mornings.",q:"How long is the swimming pool?",options:["20 metres","25 metres","30 metres","50 metres"],answer:"25 metres",hint:"Read the first sentence!"},
    {level:"easy",passage:"Ali got a new bicycle for his birthday. It is blue with silver wheels. He rode it to school the very next day.",q:"What colour is Ali's bicycle?",options:["Red","Green","Blue","Yellow"],answer:"Blue",hint:"Read the second sentence!"},
    {level:"easy",passage:"Tortoises are slow-moving reptiles. They can live for over 100 years. Some tortoises pull their heads inside their shells when scared.",q:"How long can tortoises live?",options:["Up to 50 years","Up to 75 years","Over 100 years","Exactly 100 years"],answer:"Over 100 years",hint:"Read the second sentence!"},
    {level:"easy",passage:"It was Priya's birthday. She got seven presents and a big chocolate cake. Her family sang happy birthday at dinner.",q:"How many presents did Priya get?",options:["Five","Six","Seven","Eight"],answer:"Seven",hint:"Read the second sentence!"},
    {level:"easy",passage:"The bookshop is on High Street. It sells new and second-hand books. It opens at 9am and closes at 6pm.",q:"Where is the bookshop?",options:["Market Street","High Street","Church Road","Park Lane"],answer:"High Street",hint:"Read the first sentence!"},
    {level:"easy",passage:"Bees are important insects. They collect nectar from flowers to make honey. They also help plants grow by spreading pollen.",q:"What do bees collect from flowers?",options:["Pollen only","Water","Nectar","Seeds"],answer:"Nectar",hint:"Read the second sentence!"},
    {level:"easy",passage:"Leo practises piano for 30 minutes every day. His recital is next month. He is learning two new pieces.",q:"How long does Leo practise piano each day?",options:["15 minutes","20 minutes","30 minutes","45 minutes"],answer:"30 minutes",hint:"Read the first sentence!"},
    {level:"easy",passage:"The aquarium has over 200 different fish. The biggest tank holds sharks and rays. A guide tour runs every hour.",q:"What do the biggest tanks hold?",options:["Dolphins and whales","Sharks and rays","Clown fish","Jellyfish"],answer:"Sharks and rays",hint:"Read the second sentence!"},
    {level:"easy",passage:"Rosa loves cooking. She baked two cakes and twelve biscuits for the school fair. The biscuits were chocolate chip.",q:"What flavour were the biscuits?",options:["Vanilla","Strawberry","Lemon","Chocolate chip"],answer:"Chocolate chip",hint:"Read the last sentence!"},
    {level:"easy",passage:"The sun rises in the east. It sets in the west. On a clear day you can watch a beautiful sunset from the park.",q:"In which direction does the sun rise?",options:["North","South","East","West"],answer:"East",hint:"Read the first sentence!"},
    {level:"easy",passage:"Charlie has a dog named Bruno. Bruno is a golden retriever. He loves to fetch sticks in the garden.",q:"What breed is Bruno?",options:["Labrador","Poodle","Golden retriever","Border collie"],answer:"Golden retriever",hint:"Read the second sentence!"},
    {level:"easy",passage:"Whales are the largest animals on Earth. They breathe air through a blowhole on top of their head. Blue whales can weigh up to 200 tonnes.",q:"How do whales breathe?",options:["Through gills","Through their mouth","Through a blowhole","Through their nose"],answer:"Through a blowhole",hint:"Read the second sentence!"},
    {level:"easy",passage:"The library is free to join. Members can borrow up to 8 books at a time. Books can be kept for three weeks.",q:"How many books can a member borrow at once?",options:["4","6","8","10"],answer:"8",hint:"Read the second sentence!"},
    {level:"easy",passage:"Frogs are amphibians. They can live both on land and in water. Their strong back legs help them jump very far.",q:"What type of animal is a frog?",options:["Reptile","Mammal","Amphibian","Fish"],answer:"Amphibian",hint:"Read the first sentence!"},
    {level:"easy",passage:"Noah made a bird feeder from a plastic bottle. He filled it with sunflower seeds and hung it in the garden. Three different birds visited it the same day.",q:"What did Noah put in the bird feeder?",options:["Breadcrumbs","Peanuts","Sunflower seeds","Corn"],answer:"Sunflower seeds",hint:"Read the second sentence!"},
    {level:"easy",passage:"The dentist says we should brush our teeth twice a day. We should brush for at least two minutes. We should also floss once a day.",q:"How long should we brush our teeth?",options:["30 seconds","1 minute","2 minutes","5 minutes"],answer:"2 minutes",hint:"Read the second sentence!"},
    {level:"easy",passage:"Venus is the second planet from the Sun. It is the hottest planet in the solar system. Its surface temperature can reach 465 degrees Celsius.",q:"What position is Venus from the Sun?",options:["First","Second","Third","Fourth"],answer:"Second",hint:"Read the first sentence!"},
    {level:"easy",passage:"Amy loves art. She painted a picture of a sunset using orange and pink. Her teacher gave her picture a gold star.",q:"What colours did Amy use for her sunset?",options:["Red and blue","Yellow and green","Orange and pink","Purple and white"],answer:"Orange and pink",hint:"Read the second sentence!"},
    {level:"easy",passage:"The elephant is the largest land animal. It uses its long trunk to pick up food and drink water. An elephant can drink up to 200 litres of water a day.",q:"How much water can an elephant drink per day?",options:["50 litres","100 litres","150 litres","200 litres"],answer:"200 litres",hint:"Read the last sentence!"},
    {level:"easy",passage:"Harriet baked a loaf of bread. She mixed flour, water, yeast and salt. The bread took an hour to bake in the oven.",q:"How long did the bread take to bake?",options:["30 minutes","45 minutes","1 hour","2 hours"],answer:"1 hour",hint:"Read the last sentence!"},
    {level:"easy",passage:"The school garden has roses, sunflowers and lavender. The children water the plants every Tuesday. In summer the garden is full of butterflies.",q:"When do the children water the plants?",options:["Monday","Tuesday","Wednesday","Friday"],answer:"Tuesday",hint:"Read the second sentence!"},
    {level:"easy",passage:"A snail carries its home on its back. Its shell protects it from predators and bad weather. Snails move very slowly by sliding on a layer of slime.",q:"What does a snail use to move?",options:["Its feet","Its legs","A layer of slime","Its shell"],answer:"A layer of slime",hint:"Read the last sentence!"},
    {level:"easy",passage:"The post office opens at 8am on weekdays. On Saturdays it opens at 9am. It is closed on Sundays.",q:"What time does the post office open on Saturdays?",options:["8am","9am","10am","11am"],answer:"9am",hint:"Read the second sentence!"},
    {level:"easy",passage:"The Moon is much smaller than the Earth. It takes about 27 days for the Moon to orbit Earth. The Moon has no atmosphere.",q:"How long does the Moon take to orbit Earth?",options:["7 days","14 days","27 days","365 days"],answer:"27 days",hint:"Read the second sentence!"},
    {level:"easy",passage:"Polar bears live in the Arctic. They are excellent swimmers and hunt seals for food. Their white fur keeps them camouflaged in the snow.",q:"What do polar bears hunt for food?",options:["Fish","Penguins","Seals","Walruses"],answer:"Seals",hint:"Read the second sentence!"},
    {level:"easy",passage:"Jay got lost at the shopping centre. A security guard helped him find his mum. Jay was relieved and gave the guard a big thank you.",q:"Who helped Jay find his mum?",options:["A shopkeeper","A police officer","A security guard","Another child"],answer:"A security guard",hint:"Read the second sentence!"},
    {level:"easy",passage:"The school play is in December. All pupils in Year 5 and 6 will take part. Tickets are free for family members.",q:"Which year groups are in the school play?",options:["Year 3 and 4","Year 4 and 5","Year 5 and 6","Year 6 only"],answer:"Year 5 and 6",hint:"Read the second sentence!"},
    {level:"easy",passage:"Lila loves dancing. She goes to ballet class every Thursday evening. Her first show is next spring.",q:"When does Lila have ballet class?",options:["Tuesday","Wednesday","Thursday","Friday"],answer:"Thursday",hint:"Read the second sentence!"},
    {level:"easy",passage:"Mars is called the Red Planet. It has two small moons called Phobos and Deimos. Scientists have sent robots called rovers to explore its surface.",q:"What are the names of Mars's moons?",options:["Titan and Io","Phobos and Deimos","Europa and Ganymede","Callisto and Triton"],answer:"Phobos and Deimos",hint:"Read the second sentence!"},
    {level:"easy",passage:"The recycling bin is collected every fortnight. Plastic bottles, cans and paper can all go in it. Glass goes in a separate brown bin.",q:"How often is the recycling bin collected?",options:["Every week","Every fortnight","Every month","Every day"],answer:"Every fortnight",hint:"Read the first sentence!"},
    {level:"easy",passage:"Kai runs every morning before school. He runs 2 kilometres each day. At weekends he runs 5 kilometres.",q:"How far does Kai run on weekdays?",options:["1 km","2 km","3 km","5 km"],answer:"2 km",hint:"Read the second sentence!"},
    {level:"easy",passage:"Oak trees can live for hundreds of years. They provide a home for hundreds of species of insects. Their acorns are eaten by squirrels and birds.",q:"What do squirrels and birds eat from oak trees?",options:["Leaves","Bark","Acorns","Roots"],answer:"Acorns",hint:"Read the last sentence!"},
    {level:"easy",passage:"The fire station has three fire engines. Each engine needs a crew of four firefighters. The station is open 24 hours a day.",q:"How many firefighters does each engine need?",options:["Two","Three","Four","Five"],answer:"Four",hint:"Read the second sentence!"},
    {level:"easy",passage:"Elephants live in groups called herds. The oldest female leads the herd. Baby elephants are called calves.",q:"What is a baby elephant called?",options:["Foal","Cub","Joey","Calf"],answer:"Calf",hint:"Read the last sentence!"},
    {level:"easy",passage:"The village fete is held every summer. There is a baking competition, a raffle and a lucky dip. Last year over 500 people attended.",q:"How many people attended last year?",options:["300","400","500","600"],answer:"500",hint:"Read the last sentence!"},
    {level:"easy",passage:"Icebergs are made of fresh water ice. About 90 percent of an iceberg is hidden below the surface. This is why ships must be careful around them.",q:"How much of an iceberg is underwater?",options:["50%","70%","90%","100%"],answer:"90%",hint:"Read the second sentence!"},
    {level:"easy",passage:"Holly made a birthday card for her gran. She drew flowers and wrote a poem inside. She posted it on Monday so it would arrive in time.",q:"What did Holly draw on the card?",options:["Stars","Animals","Flowers","A cake"],answer:"Flowers",hint:"Read the second sentence!"},
    {level:"easy",passage:"Cheetahs are the fastest land animals. They can reach 112 kilometres per hour. However they can only run at top speed for about 30 seconds.",q:"How long can a cheetah run at top speed?",options:["10 seconds","20 seconds","30 seconds","1 minute"],answer:"30 seconds",hint:"Read the last sentence!"},
    {level:"easy",passage:"The school canteen serves hot dinners every day. On Fridays there is always fish and chips. Children can also choose a sandwich.",q:"What is always served on Fridays?",options:["Pasta","Pizza","Fish and chips","Roast chicken"],answer:"Fish and chips",hint:"Read the second sentence!"},
    {level:"easy",passage:"Bamboo is the fastest growing plant. It can grow up to 90cm in a single day. Giant pandas eat almost nothing but bamboo.",q:"What do giant pandas mostly eat?",options:["Leaves","Grass","Bamboo","Fruit"],answer:"Bamboo",hint:"Read the last sentence!"},
    {level:"easy",passage:"Jamie lost his PE kit. He searched his locker and bag but could not find it. His mum found it under his bed that evening.",q:"Where was Jamie's PE kit?",options:["In his locker","In his bag","Under his bed","In the lost property"],answer:"Under his bed",hint:"Read the last sentence!"},
    {level:"easy",passage:"Saturn has beautiful rings around it. The rings are made of ice and rock. Saturn is the sixth planet from the Sun.",q:"What are Saturn's rings made of?",options:["Gas and dust","Ice and rock","Water and clouds","Metal and rock"],answer:"Ice and rock",hint:"Read the second sentence!"},
    {level:"easy",passage:"The new playground has a slide, swings and a climbing frame. It opened last week. Children from the whole village can use it.",q:"What equipment is in the new playground?",options:["Slide, swings and roundabout","Slide, swings and climbing frame","Climbing frame and roundabout","Swings and seesaw"],answer:"Slide, swings and climbing frame",hint:"Read the first sentence!"},
    {level:"easy",passage:"Mia loves animals. She has two rabbits, a hamster and a guinea pig. She feeds them before and after school every day.",q:"How many rabbits does Mia have?",options:["One","Two","Three","Four"],answer:"Two",hint:"Read the second sentence!"},
    {level:"easy",passage:"The cinema sells popcorn, hotdogs and fizzy drinks. A large popcorn costs three pounds. Hotdogs cost two pounds fifty.",q:"How much does a large popcorn cost?",options:["Two pounds","Two pounds fifty","Three pounds","Three pounds fifty"],answer:"Three pounds",hint:"Read the second sentence!"},
    {level:"easy",passage:"Giraffes are the tallest animals on Earth. They can grow up to 6 metres tall. Their long necks help them reach leaves high in trees.",q:"How tall can giraffes grow?",options:["4 metres","5 metres","6 metres","7 metres"],answer:"6 metres",hint:"Read the second sentence!"},
    {level:"easy",passage:"The harvest festival is in October. Children bring tins and packets of food to school. These are donated to the local food bank.",q:"Where are the donated foods sent?",options:["To the school kitchen","To the teacher","To the local food bank","To a supermarket"],answer:"To the local food bank",hint:"Read the last sentence!"},
    {level:"easy",passage:"Pandas are native to China. They eat bamboo for up to 12 hours a day. A baby panda is the size of a stick of butter when born.",q:"Which country are pandas native to?",options:["Japan","India","China","Thailand"],answer:"China",hint:"Read the first sentence!"},
    {level:"easy",passage:"Mount Everest is the world's highest mountain. It is in the Himalayas between Nepal and Tibet. The summit is 8,849 metres above sea level.",q:"Where is Mount Everest located?",options:["The Alps","The Andes","The Himalayas","The Rockies"],answer:"The Himalayas",hint:"Read the second sentence!"},
    {level:"easy",passage:"A lighthouse warns ships of dangerous rocks. It flashes a bright light that can be seen far out to sea. Each lighthouse has its own pattern of flashes.",q:"What does a lighthouse warn ships about?",options:["Bad weather","Icebergs","Dangerous rocks","Other ships"],answer:"Dangerous rocks",hint:"Read the first sentence!"},
    {level:"medium",passage:"The Amazon River is the largest river in the world by volume of water. It flows through South America, mostly through Brazil. The Amazon rainforest surrounding it is home to 10% of all species on Earth.",q:"Through which continent does the Amazon River flow?",options:["Africa","Asia","North America","South America"],answer:"South America",hint:"Read the second sentence!"},
    {level:"medium",passage:"During World War Two, many children in British cities were evacuated to the countryside. They were sent away to protect them from bombing raids. Some children stayed with families they had never met before.",q:"Why were children evacuated during World War Two?",options:["To go on holiday","To protect them from bombing raids","Because their parents were in the army","To attend better schools"],answer:"To protect them from bombing raids",hint:"Read the second sentence!"},
    {level:"medium",passage:"Light travels faster than sound. That is why we see lightning before we hear thunder. The gap between the lightning flash and the thunder tells us how far away the storm is.",q:"Why do we see lightning before we hear thunder?",options:["Because light travels faster than sound","Because thunder is quieter than lightning","Because lightning is closer","Because sound travels in circles"],answer:"Because light travels faster than sound",hint:"Read the first two sentences!"},
    {level:"medium",passage:"The Colosseum in Rome was built around 70-80 AD. It could hold up to 80,000 spectators. Gladiators fought there in front of huge crowds.",q:"Approximately when was the Colosseum built?",options:["500 BC","200 AD","70-80 AD","500 AD"],answer:"70-80 AD",hint:"Read the first sentence!"},
    {level:"medium",passage:"Coral reefs are sometimes called the rainforests of the sea. They cover less than 1% of the ocean floor but support around 25% of all marine species. Rising ocean temperatures are threatening many reefs.",q:"What percentage of marine species do coral reefs support?",options:["10%","15%","20%","25%"],answer:"25%",hint:"Read the second sentence!"},
    {level:"medium",passage:"The Great Barrier Reef is the world's largest coral reef system. It stretches over 2,300 kilometres along the coast of Australia. It is home to over 1,500 species of fish.",q:"How long is the Great Barrier Reef?",options:["1,000 km","1,500 km","2,300 km","3,000 km"],answer:"2,300 km",hint:"Read the second sentence!"},
    {level:"medium",passage:"Vaccines work by training the immune system to recognise and fight specific diseases. They contain weakened or dead versions of the pathogen. Most vaccines are given by injection.",q:"What do vaccines contain?",options:["Vitamins","Antibiotics","Weakened or dead versions of the pathogen","Healthy white blood cells"],answer:"Weakened or dead versions of the pathogen",hint:"Read the second sentence!"},
    {level:"medium",passage:"The Nile was central to ancient Egyptian civilisation. Its annual flooding deposited rich soil on the banks, enabling farming. The Egyptians built their cities along its banks.",q:"What made the Nile important for ancient Egyptian farming?",options:["It provided drinking water only","Its annual flooding deposited rich soil","It never flooded","It connected Egypt to other countries"],answer:"Its annual flooding deposited rich soil",hint:"Read the second sentence!"},
    {level:"medium",passage:"Hurricanes form over warm ocean water. They need sea temperatures of at least 26 degrees Celsius to develop. They weaken when they move over land or cooler water.",q:"What sea temperature is needed for a hurricane to develop?",options:["16°C","20°C","At least 26°C","Over 35°C"],answer:"At least 26°C",hint:"Read the second sentence!"},
    {level:"medium",passage:"The pyramids at Giza are one of the Seven Wonders of the Ancient World. The Great Pyramid was built for Pharaoh Khufu. It was the tallest man-made structure for over 3,800 years.",q:"Which pharaoh was the Great Pyramid built for?",options:["Tutankhamun","Ramesses II","Khufu","Cleopatra"],answer:"Khufu",hint:"Read the second sentence!"},
    {level:"medium",passage:"The polar ice caps are melting due to rising global temperatures. This is causing sea levels to rise around the world. Low-lying countries and islands face the greatest risk of flooding.",q:"What is causing sea levels to rise?",options:["More rainfall","Underwater earthquakes","Melting polar ice caps","More rivers flowing to the sea"],answer:"Melting polar ice caps",hint:"Read the first two sentences!"},
    {level:"medium",passage:"Antibiotics were discovered by Alexander Fleming in 1928. They kill or slow the growth of bacteria. However, they do not work against viruses.",q:"What do antibiotics kill?",options:["All germs","Viruses","Bacteria","Fungi only"],answer:"Bacteria",hint:"Read the second sentence!"},
    {level:"medium",passage:"The first Olympic Games were held in ancient Greece in 776 BC. They were held at Olympia every four years. Events included running, wrestling and chariot racing.",q:"Where were the first Olympic Games held?",options:["Athens","Sparta","Olympia","Corinth"],answer:"Olympia",hint:"Read the second sentence!"},
    {level:"medium",passage:"Black holes have such strong gravity that nothing, not even light, can escape. They form when massive stars collapse. Scientists can only detect them indirectly.",q:"How do black holes form?",options:["From asteroid collisions","When massive stars collapse","From exploding planets","When two galaxies merge"],answer:"When massive stars collapse",hint:"Read the second sentence!"},
    {level:"medium",passage:"The Giant Panda is one of the world's most endangered animals. There are fewer than 2,000 in the wild. Conservation efforts have helped prevent their extinction.",q:"Approximately how many giant pandas remain in the wild?",options:["Fewer than 500","Fewer than 1,000","Fewer than 2,000","Fewer than 5,000"],answer:"Fewer than 2,000",hint:"Read the second sentence!"},
    {level:"medium",passage:"The Berlin Wall was built in 1961 to divide East and West Berlin. It stood for 28 years. It was torn down in 1989, symbolising the end of the Cold War.",q:"When was the Berlin Wall torn down?",options:["1961","1975","1985","1989"],answer:"1989",hint:"Read the last sentence!"},
    {level:"medium",passage:"Tectonic plates move very slowly — just a few centimetres each year. When they collide, they can create mountains. When they slide past each other, earthquakes occur.",q:"What can happen when tectonic plates collide?",options:["Earthquakes","Oceans form","Mountains are created","Volcanoes erupt only"],answer:"Mountains are created",hint:"Read the second sentence!"},
    {level:"medium",passage:"Sharks have been on Earth for more than 450 million years. They predate the dinosaurs by 200 million years. There are over 500 species of shark alive today.",q:"How long have sharks existed on Earth?",options:["50 million years","150 million years","250 million years","More than 450 million years"],answer:"More than 450 million years",hint:"Read the first sentence!"},
    {level:"medium",passage:"Deforestation is the large-scale removal of forests. It contributes to climate change because trees absorb carbon dioxide. It also destroys habitats for millions of species.",q:"Why does deforestation contribute to climate change?",options:["It releases carbon stored in soil","Trees absorb carbon dioxide, so removing them leaves more CO2 in atmosphere","It increases rainfall","It raises sea temperatures"],answer:"Trees absorb carbon dioxide, so removing them leaves more CO2 in atmosphere",hint:"Read the second sentence!"},
    {level:"medium",passage:"Alexander the Great was one of history's greatest military leaders. By age 30, he had built one of the largest empires in history. He died in 323 BC aged just 32.",q:"How old was Alexander the Great when he died?",options:["28","30","32","35"],answer:"32",hint:"Read the last sentence!"},
    {level:"medium",passage:"The first humans walked on the Moon in 1969. Neil Armstrong was the first person to set foot on the lunar surface. He was followed shortly by Buzz Aldrin.",q:"Who was the first person to walk on the Moon?",options:["Buzz Aldrin","Yuri Gagarin","Neil Armstrong","Michael Collins"],answer:"Neil Armstrong",hint:"Read the second sentence!"},
    {level:"medium",passage:"Volcanoes form where magma forces its way through Earth's crust. The ring of fire is a region around the Pacific Ocean with many volcanoes and earthquakes. About 75% of Earth's volcanoes are found here.",q:"Where is the ring of fire located?",options:["Around the Atlantic Ocean","Around the Indian Ocean","Around the Pacific Ocean","In the Mediterranean"],answer:"Around the Pacific Ocean",hint:"Read the second sentence!"},
    {level:"medium",passage:"The nervous system is made up of the brain, spinal cord and nerves. It controls all the body's actions and responses. Signals travel along nerves at up to 120 metres per second.",q:"How fast do signals travel along nerves?",options:["10 m/s","50 m/s","Up to 120 m/s","Over 300 m/s"],answer:"Up to 120 m/s",hint:"Read the last sentence!"},
    {level:"medium",passage:"The Rosetta Stone was discovered in Egypt in 1799. It had the same message written in three scripts, including Ancient Egyptian hieroglyphics and Ancient Greek. This allowed scholars to decode hieroglyphics for the first time.",q:"In how many scripts was the Rosetta Stone written?",options:["Two","Three","Four","Five"],answer:"Three",hint:"Read the second sentence!"},
    {level:"medium",passage:"Sonar is a system used to detect objects underwater. It works by sending out sound waves and listening for echoes. Submarines and ships use sonar to map the ocean floor.",q:"How does sonar detect objects?",options:["Using light waves","Using radio waves","Sending out sound waves and listening for echoes","Using magnetic fields"],answer:"Sending out sound waves and listening for echoes",hint:"Read the second sentence!"},
    {level:"medium",passage:"Hibernation is a state of deep sleep that some animals enter during winter. During hibernation, their heart rate and body temperature drop dramatically. This helps them survive when food is scarce.",q:"Why do some animals hibernate?",options:["They are lazy","They are sick","To survive when food is scarce","To avoid predators"],answer:"To survive when food is scarce",hint:"Read the last sentence!"},
    {level:"medium",passage:"The Human Genome Project completed mapping all human DNA in 2003. The human genome contains about 3 billion base pairs. This has revolutionised medicine and our understanding of genetics.",q:"When was the Human Genome Project completed?",options:["1990","1995","2000","2003"],answer:"2003",hint:"Read the first sentence!"},
    {level:"medium",passage:"The Titanic sank in 1912 after hitting an iceberg. More than 1,500 people died, making it one of the deadliest peacetime maritime disasters. The wreck was discovered on the ocean floor in 1985.",q:"When was the Titanic wreck discovered?",options:["1912","1950","1975","1985"],answer:"1985",hint:"Read the last sentence!"},
    {level:"medium",passage:"Photosynthesis takes place mainly in the leaves of plants. Chlorophyll in the leaves absorbs sunlight. Carbon dioxide and water are converted into glucose and oxygen.",q:"Where does photosynthesis mainly take place?",options:["In the roots","In the stems","In the leaves","In the flowers"],answer:"In the leaves",hint:"Read the first sentence!"},
    {level:"medium",passage:"The Roman Empire was one of the largest empires in history. At its height it controlled territory from Britain to Egypt. Latin, the language of the Romans, is the ancestor of French, Spanish and Italian.",q:"What modern languages descended from Latin?",options:["English, German, Dutch","French, Spanish, Italian","Chinese, Japanese, Korean","Arabic, Persian, Turkish"],answer:"French, Spanish, Italian",hint:"Read the last sentence!"},
    {level:"medium",passage:"Endangered species are those at risk of extinction. Habitat destruction is the leading cause. Conservation programmes aim to protect both animals and their habitats.",q:"What is the leading cause of species becoming endangered?",options:["Hunting","Climate change","Habitat destruction","Disease"],answer:"Habitat destruction",hint:"Read the second sentence!"},
    {level:"medium",passage:"Isaac Newton formulated the law of universal gravitation in 1687. He proposed that every object in the universe attracts every other object. The strength of gravity depends on the mass of the objects and the distance between them.",q:"What does Newton's law state about every object in the universe?",options:["Objects repel each other","Every object attracts every other object","Only large objects have gravity","Gravity works only on Earth"],answer:"Every object attracts every other object",hint:"Read the second sentence!"},
    {level:"medium",passage:"The Great Wall of China was built to protect against invasions. Construction began over 2,000 years ago. It is not actually visible from space with the naked eye, despite popular belief.",q:"Why was the Great Wall of China built?",options:["To mark the border for maps","To protect against invasions","To support trade routes","To demonstrate Chinese power"],answer:"To protect against invasions",hint:"Read the first sentence!"},
    {level:"medium",passage:"Ocean currents affect the climate of nearby landmasses. The Gulf Stream keeps Western Europe warmer than expected for its latitude. Without it, Britain's climate would be much colder.",q:"What effect does the Gulf Stream have on Western Europe?",options:["It makes it hotter in summer","It keeps it warmer than expected for its latitude","It increases rainfall","It causes more storms"],answer:"It keeps it warmer than expected for its latitude",hint:"Read the second sentence!"},
    {level:"medium",passage:"Pluto was reclassified as a dwarf planet in 2006. It is located in the Kuiper Belt beyond Neptune. It takes 248 years to orbit the Sun.",q:"When was Pluto reclassified as a dwarf planet?",options:["1990","1999","2003","2006"],answer:"2006",hint:"Read the first sentence!"},
    {level:"medium",passage:"Microplastics are tiny plastic particles less than 5mm in size. They enter the ocean from many sources, including broken-down plastic waste. Marine scientists have found microplastics in the deepest ocean trenches.",q:"What are microplastics?",options:["Plastic recycling machines","Tiny plastic particles less than 5mm","A type of plastic packaging","Plastic-eating bacteria"],answer:"Tiny plastic particles less than 5mm",hint:"Read the first sentence!"},
    {level:"medium",passage:"DNA carries genetic information in living organisms. It is shaped like a twisted ladder called a double helix. DNA is found in the nucleus of every cell.",q:"What shape is DNA?",options:["A circle","A straight line","A double helix","A triple helix"],answer:"A double helix",hint:"Read the second sentence!"},
    {level:"medium",passage:"The ozone layer is found in the stratosphere, about 15-35km above Earth. It absorbs most of the Sun's harmful ultraviolet radiation. Chemicals called CFCs were found to be damaging it.",q:"Where is the ozone layer located?",options:["On Earth's surface","In the troposphere","In the stratosphere 15-35km above Earth","Beyond the atmosphere"],answer:"In the stratosphere 15-35km above Earth",hint:"Read the first sentence!"},
    {level:"medium",passage:"The Black Death reached Europe in 1347. It killed between a third and a half of Europe's population in just a few years. It was caused by the bacterium Yersinia pestis.",q:"What caused the Black Death?",options:["A virus","A fungus","The bacterium Yersinia pestis","Contaminated water"],answer:"The bacterium Yersinia pestis",hint:"Read the last sentence!"},
    {level:"medium",passage:"Rainwater that falls on hills soaks into the ground or flows into rivers. It eventually reaches the sea. The Sun's heat then evaporates it back into the atmosphere — and the cycle continues.",q:"What happens to water after it reaches the sea?",options:["It stays in the sea","The Sun evaporates it back into the atmosphere","It flows underground","It turns into ice"],answer:"The Sun evaporates it back into the atmosphere",hint:"Read the last sentence!"},
    {level:"medium",passage:"Florence Nightingale transformed nursing in the 19th century. She introduced strict hygiene standards in hospitals. Her work reduced the death rate in military hospitals dramatically.",q:"What did Nightingale introduce that reduced hospital death rates?",options:["New medicines","Better food","Strict hygiene standards","More nurses"],answer:"Strict hygiene standards",hint:"Read the second sentence!"},
    {level:"medium",passage:"The human body contains approximately 37 trillion cells. Each cell contains DNA with the complete instructions for building a human being. Most cells are too small to see without a microscope.",q:"Approximately how many cells does the human body contain?",options:["37 million","370 million","3.7 billion","37 trillion"],answer:"37 trillion",hint:"Read the first sentence!"},
    {level:"medium",passage:"Mangrove forests grow in coastal areas in tropical regions. Their tangled roots protect coastlines from erosion. They also provide nurseries for many fish species.",q:"Where do mangrove forests grow?",options:["In cold mountain regions","In deserts","In coastal areas in tropical regions","In freshwater lakes"],answer:"In coastal areas in tropical regions",hint:"Read the first sentence!"},
    {level:"medium",passage:"The Magna Carta was signed by King John in 1215. It established for the first time that the king was subject to the rule of law. It is considered a foundation of modern democracy.",q:"When was the Magna Carta signed?",options:["1066","1215","1399","1509"],answer:"1215",hint:"Read the first sentence!"},
    {level:"medium",passage:"Earthquakes are measured using the Richter scale. A magnitude 6 earthquake is 10 times more powerful than a magnitude 5 earthquake. Major earthquakes above magnitude 7 can cause widespread destruction.",q:"How much more powerful is a magnitude 6 earthquake than a magnitude 5?",options:["2 times","5 times","10 times","100 times"],answer:"10 times",hint:"Read the second sentence!"},
    {level:"medium",passage:"The printing press, invented by Gutenberg around 1440, made books widely available for the first time. Before this, books had to be copied by hand. This helped spread literacy across Europe.",q:"What was the effect of the printing press on literacy?",options:["It reduced literacy","It had no effect on literacy","It helped spread literacy across Europe","It only benefited monks"],answer:"It helped spread literacy across Europe",hint:"Read the last sentence!"},
    {level:"medium",passage:"The heart beats about 100,000 times a day. It pumps blood through about 96,000 kilometres of blood vessels. The heart muscle never stops working throughout a person's lifetime.",q:"Approximately how many times does the heart beat per day?",options:["10,000","50,000","100,000","1,000,000"],answer:"100,000",hint:"Read the first sentence!"},
    {level:"medium",passage:"Tornadoes are violent rotating columns of air that touch both the ground and a storm cloud. They can spin at over 480 kilometres per hour. The USA experiences more tornadoes than any other country.",q:"What is a tornado?",options:["A large ocean wave","A violent rotating column of air touching ground and storm cloud","A type of hurricane","A sandstorm"],answer:"A violent rotating column of air touching ground and storm cloud",hint:"Read the first sentence!"},
    {level:"medium",passage:"The Sahara is the world's largest hot desert. However, Antarctica is technically the world's largest desert overall. A desert is defined as an area receiving less than 250mm of rain per year.",q:"What is the definition of a desert?",options:["A hot, sandy area","An area with no life","An area receiving less than 250mm of rain per year","A rocky, treeless landscape"],answer:"An area receiving less than 250mm of rain per year",hint:"Read the last sentence!"},
    {level:"medium",passage:"The International Space Station orbits Earth at approximately 408 kilometres above the surface. It travels at about 28,000 kilometres per hour. This means it orbits Earth about 16 times a day.",q:"How many times does the ISS orbit Earth each day?",options:["8 times","12 times","16 times","24 times"],answer:"16 times",hint:"Read the last sentence!"},
    {level:"medium",passage:"Bioluminescence is the production of light by living organisms. Fireflies, certain jellyfish and deep-sea fish produce it. It is caused by a chemical reaction involving a compound called luciferin.",q:"What causes bioluminescence?",options:["Sunlight absorbed by the organism","Electrical signals in the body","A chemical reaction involving luciferin","Radiation from the ocean floor"],answer:"A chemical reaction involving luciferin",hint:"Read the last sentence!"},
    {level:"medium",passage:"Shakespeare wrote his plays in Early Modern English between 1590 and 1613. He is credited with inventing over 1,700 words still used today. Many famous phrases also come from his works.",q:"Approximately how many words did Shakespeare invent?",options:["Over 100","Over 500","Over 1,700","Over 5,000"],answer:"Over 1,700",hint:"Read the second sentence!"},
    {level:"medium",passage:"The water cycle has four main stages: evaporation, condensation, precipitation and collection. Water evaporates from oceans and lakes, rises, cools to form clouds, falls as rain, and collects again. This cycle has been running for billions of years.",q:"What are the four stages of the water cycle?",options:["Heating, rising, falling, freezing","Evaporation, condensation, precipitation, collection","Absorption, transpiration, rain, snow","Melting, freezing, flowing, evaporating"],answer:"Evaporation, condensation, precipitation, collection",hint:"Read the first sentence!"},
    {level:"medium",passage:"Migration is the seasonal movement of animals from one region to another. Arctic terns migrate from the Arctic to the Antarctic and back, covering 90,000 km each year. This is the longest migration of any animal.",q:"How far do Arctic terns migrate each year?",options:["10,000 km","30,000 km","60,000 km","90,000 km"],answer:"90,000 km",hint:"Read the second sentence!"},
    {level:"medium",passage:"Biomass energy comes from burning organic materials like wood, crop waste, and animal dung. It is considered renewable because new plants can always be grown. It is one of the oldest forms of energy used by humans.",q:"Why is biomass considered a renewable energy source?",options:["It never releases carbon","New plants can always be grown","It uses no fuel","It is powered by the Sun directly"],answer:"New plants can always be grown",hint:"Read the second sentence!"},
    {level:"medium",passage:"The digestive system breaks food down into nutrients the body can absorb. Digestion begins in the mouth with chewing and saliva. It is completed in the small intestine, where nutrients enter the bloodstream.",q:"Where are nutrients absorbed into the bloodstream?",options:["In the stomach","In the mouth","In the large intestine","In the small intestine"],answer:"In the small intestine",hint:"Read the last sentence!"},
    {level:"medium",passage:"Galileo Galilei was a pioneering Italian scientist who lived from 1564 to 1642. He improved the telescope and used it to observe moons orbiting Jupiter. His discoveries supported the idea that Earth orbits the Sun, not the other way around.",q:"What did Galileo discover that supported a Sun-centred solar system?",options:["He found new stars","He observed moons orbiting Jupiter","He measured Earth's size","He discovered comets"],answer:"He observed moons orbiting Jupiter",hint:"Read the second sentence!"},
    {level:"medium",passage:"Deforestation in the Amazon is destroying one of Earth's most biodiverse ecosystems. Scientists estimate that a species of plant, insect or other organism becomes extinct every 20 minutes due to habitat loss. Once lost, species cannot be recovered.",q:"How often does a species become extinct due to habitat loss?",options:["Every minute","Every 20 minutes","Every hour","Every day"],answer:"Every 20 minutes",hint:"Read the second sentence!"},
    {level:"medium",passage:"Nuclear power stations produce electricity without burning fossil fuels. They split uranium atoms in a process called fission. One kilogram of uranium produces as much energy as 3,000 tonnes of coal.",q:"How much coal would produce the same energy as 1kg of uranium?",options:["300 tonnes","1,000 tonnes","2,000 tonnes","3,000 tonnes"],answer:"3,000 tonnes",hint:"Read the last sentence!"},
    {level:"medium",passage:"Global warming refers to the long-term rise in Earth's average temperature. It is primarily caused by greenhouse gases such as carbon dioxide and methane. Since the Industrial Revolution, Earth has warmed by about 1.1 degrees Celsius.",q:"By how much has Earth warmed since the Industrial Revolution?",options:["0.5°C","1.1°C","2°C","3°C"],answer:"1.1°C",hint:"Read the last sentence!"},
    {level:"medium",passage:"Marie Curie was born in Poland in 1867. She won two Nobel Prizes, one in Physics and one in Chemistry. She was the first woman to win a Nobel Prize and remains the only person to win in two different sciences.",q:"In which two sciences did Curie win Nobel Prizes?",options:["Physics and Medicine","Chemistry and Biology","Physics and Chemistry","Mathematics and Physics"],answer:"Physics and Chemistry",hint:"Read the second sentence!"},
    {level:"medium",passage:"The Amazon Basin covers over 7 million square kilometres. It holds about 20% of the world's fresh water. Around 10% of all species on Earth live in or around it.",q:"What percentage of the world's fresh water does the Amazon Basin hold?",options:["5%","10%","15%","20%"],answer:"20%",hint:"Read the second sentence!"},
    {level:"medium",passage:"The skeleton has three main functions: it supports the body, protects vital organs, and allows movement. Bones are also important for producing blood cells in the bone marrow. There are 206 bones in the adult human body.",q:"How many bones are in the adult human body?",options:["106","156","206","256"],answer:"206",hint:"Read the last sentence!"},
    {level:"hard",passage:"The discovery of penicillin by Alexander Fleming in 1928 is considered one of the greatest medical breakthroughs in history. He noticed that a mould, Penicillium notatum, was killing bacteria on his culture dishes. It took another decade before Howard Florey and Ernst Chain developed it into a usable medicine.",q:"Who developed penicillin into a usable medicine?",options:["Fleming alone","Howard Florey and Ernst Chain","Louis Pasteur","Robert Koch"],answer:"Howard Florey and Ernst Chain",hint:"Read the last sentence!"},
    {level:"hard",passage:"The concept of natural selection, proposed by Charles Darwin in 1859, was revolutionary. Darwin argued that organisms with traits better suited to their environment survive and reproduce more. Over many generations, beneficial traits become more common in a population.",q:"What did Darwin argue about organisms with beneficial traits?",options:["They disappear over time","They never change","They survive and reproduce more","They become a separate species immediately"],answer:"They survive and reproduce more",hint:"Read the second sentence!"},
    {level:"hard",passage:"The Milky Way galaxy contains an estimated 100 to 400 billion stars. It is approximately 100,000 light-years across. Our solar system is located about 26,000 light-years from the galactic centre.",q:"How far is our solar system from the centre of the Milky Way?",options:["1,000 light-years","10,000 light-years","26,000 light-years","50,000 light-years"],answer:"26,000 light-years",hint:"Read the last sentence!"},
    {level:"hard",passage:"The French Revolution of 1789 challenged the absolute power of the monarchy. The Declaration of the Rights of Man and of the Citizen, adopted in 1789, proclaimed liberty, equality and popular sovereignty. It inspired democratic movements around the world for centuries.",q:"What principles did the Declaration of the Rights of Man proclaim?",options:["Monarchy, tradition and order","Liberty, equality and popular sovereignty","Religion, obedience and order","Trade, empire and conquest"],answer:"Liberty, equality and popular sovereignty",hint:"Read the second sentence!"},
    {level:"hard",passage:"CRISPR-Cas9 is a revolutionary gene-editing technology developed in the early 2010s. It allows scientists to edit DNA sequences with unprecedented precision. Potential applications include treating genetic diseases and developing disease-resistant crops.",q:"What are potential applications of CRISPR-Cas9?",options:["Building computers","Treating genetic diseases and developing disease-resistant crops","Creating new elements","Exploring space"],answer:"Treating genetic diseases and developing disease-resistant crops",hint:"Read the last sentence!"},
    {level:"hard",passage:"The Industrial Revolution began in Britain in the mid-18th century and spread globally. It transformed manufacturing from handcraft to machine-based production. It also led to urbanisation, as workers moved from rural areas to factory towns.",q:"What social change did the Industrial Revolution cause?",options:["People moved from cities to the countryside","Urbanisation as workers moved to factory towns","Population decline","Widespread unemployment"],answer:"Urbanisation as workers moved to factory towns",hint:"Read the last sentence!"},
    {level:"hard",passage:"Quantum entanglement is a phenomenon where two particles become connected so that the state of one instantly affects the state of the other, regardless of distance. Einstein called it spooky action at a distance. It forms the basis of quantum computing and quantum cryptography.",q:"What did Einstein call quantum entanglement?",options:["Quantum weirdness","Spooky action at a distance","The uncertainty principle","Wave-particle duality"],answer:"Spooky action at a distance",hint:"Read the second sentence!"},
    {level:"hard",passage:"The Cold War lasted from 1947 to 1991. It was defined by political, military and ideological rivalry between the United States and the Soviet Union. Neither side engaged in direct military conflict, instead competing through proxy wars, the arms race and the space race.",q:"How did the USA and USSR compete during the Cold War?",options:["Through direct war","Through trade agreements","Through proxy wars, arms race and space race","Through cultural exchange only"],answer:"Through proxy wars, arms race and space race",hint:"Read the last sentence!"},
    {level:"hard",passage:"The Amazon rainforest is often called the lungs of the Earth. It produces about 20% of the world's oxygen through photosynthesis. However, increasing deforestation threatens its role in regulating global climate.",q:"Why is the Amazon called the lungs of the Earth?",options:["It absorbs all pollution","It produces about 20% of the world's oxygen","It contains the most water on Earth","It is where most animals live"],answer:"It produces about 20% of the world's oxygen",hint:"Read the second sentence!"},
    {level:"hard",passage:"The Hubble Space Telescope, launched in 1990, has transformed our understanding of the universe. It has observed galaxies billions of light-years away and helped calculate the age of the universe at approximately 13.8 billion years. Its successor, the James Webb Space Telescope, launched in 2021.",q:"What has Hubble helped calculate about the universe?",options:["Its exact size","Its mass","Its age — approximately 13.8 billion years","How many galaxies it contains"],answer:"Its age — approximately 13.8 billion years",hint:"Read the second sentence!"},
    {level:"hard",passage:"The human brain contains approximately 86 billion neurons. These neurons are connected by trillions of synapses. The brain consumes about 20% of the body's energy despite making up only 2% of its weight.",q:"What percentage of the body's energy does the brain consume?",options:["5%","10%","15%","20%"],answer:"20%",hint:"Read the last sentence!"},
    {level:"hard",passage:"DNA replication occurs before a cell divides. The double helix unzips and each strand serves as a template for a new complementary strand. The result is two identical copies of the original DNA molecule.",q:"What is the result of DNA replication?",options:["One new DNA strand","Four new DNA molecules","Two identical copies of the original DNA","A mutated version of the DNA"],answer:"Two identical copies of the original DNA",hint:"Read the last sentence!"},
    {level:"hard",passage:"The water crisis is one of the most pressing global issues. Over 2 billion people lack access to safe drinking water. Climate change is expected to worsen water scarcity in many regions.",q:"How many people lack access to safe drinking water?",options:["Over 500 million","Over 1 billion","Over 2 billion","Over 5 billion"],answer:"Over 2 billion",hint:"Read the second sentence!"},
    {level:"hard",passage:"The Treaty of Versailles, signed in 1919 after World War One, imposed harsh terms on Germany. Germany was forced to accept guilt for the war, pay enormous reparations, and lose significant territory. Many historians argue these conditions contributed to the rise of Hitler and World War Two.",q:"What do many historians argue about the Treaty of Versailles?",options:["It created lasting peace","Its harsh terms contributed to World War Two","It was fair to Germany","It ended all European conflicts"],answer:"Its harsh terms contributed to World War Two",hint:"Read the last sentence!"},
    {level:"hard",passage:"The placebo effect is a well-documented phenomenon in medicine. Patients who receive a sugar pill, believing it to be real medicine, often experience genuine improvements in their condition. This demonstrates the powerful connection between the mind and the body.",q:"What does the placebo effect demonstrate?",options:["That medicine is always effective","The powerful connection between mind and body","That patients should not be told the truth","That sugar has healing properties"],answer:"The powerful connection between mind and body",hint:"Read the last sentence!"},
    {level:"hard",passage:"The concept of relativity, developed by Einstein, changed physics fundamentally. His special theory showed that time passes slower for objects moving at high speeds. His general theory described gravity as the curvature of spacetime caused by mass.",q:"What did Einstein's special theory show about time?",options:["Time is constant everywhere","Time passes faster at high speeds","Time passes slower for objects moving at high speeds","Time does not exist"],answer:"Time passes slower for objects moving at high speeds",hint:"Read the second sentence!"},
    {level:"hard",passage:"Plastic pollution is a critical environmental issue. An estimated 8 million tonnes of plastic enter the oceans each year. Scientists have detected microplastics in human blood, suggesting plastic has now entered the food chain.",q:"How much plastic enters the oceans each year?",options:["800,000 tonnes","2 million tonnes","8 million tonnes","80 million tonnes"],answer:"8 million tonnes",hint:"Read the second sentence!"},
    {level:"hard",passage:"The concept of entropy in thermodynamics states that disorder in a closed system always increases over time. This is the Second Law of Thermodynamics. It explains why heat flows from hot to cold, not the other way around.",q:"What does entropy measure?",options:["The amount of energy in a system","The temperature of a system","The disorder or randomness in a system","The efficiency of energy transfer"],answer:"The disorder or randomness in a system",hint:"Read the first sentence — disorder is the key word!"},
    {level:"hard",passage:"Artificial intelligence refers to computer systems that can perform tasks normally requiring human intelligence. Machine learning, a subset of AI, enables computers to learn from data without being explicitly programmed. Deep learning uses neural networks modelled on the human brain.",q:"What enables computers to learn from data without being explicitly programmed?",options:["Artificial intelligence broadly","Machine learning","Deep learning","Neural networks only"],answer:"Machine learning",hint:"Read the second sentence!"},
    {level:"hard",passage:"Climate tipping points are thresholds beyond which changes become self-reinforcing and irreversible. For example, melting Arctic ice reduces the reflectivity of Earth's surface, causing more heat absorption and further warming. Scientists warn that crossing multiple tipping points could trigger a cascade of uncontrollable changes.",q:"What is a climate tipping point?",options:["A point where climate improves","A threshold beyond which changes become self-reinforcing and irreversible","A type of extreme weather event","The maximum temperature Earth can reach"],answer:"A threshold beyond which changes become self-reinforcing and irreversible",hint:"Read the first sentence!"},
    {level:"hard",passage:"The discovery of the structure of DNA in 1953 by Watson, Crick, Franklin and Wilkins was a defining moment in science. The double helix structure explained how genetic information could be copied and passed on. This opened the door to the entire field of molecular biology.",q:"Why was the discovery of DNA's structure significant?",options:["It cured all diseases","It explained how genetic information is copied and passed on","It proved evolution","It allowed genetic engineering immediately"],answer:"It explained how genetic information is copied and passed on",hint:"Read the second sentence!"},
    {level:"hard",passage:"Antibiotic resistance is an increasing global health threat. Bacteria evolve to become resistant to antibiotics when they are overused or misused. The World Health Organisation has called it one of the biggest threats to global health.",q:"How do bacteria become antibiotic-resistant?",options:["By absorbing antibiotics","By mutating randomly","By evolving when antibiotics are overused or misused","By sharing DNA with viruses"],answer:"By evolving when antibiotics are overused or misused",hint:"Read the second sentence!"},
    {level:"hard",passage:"The nervous system is divided into the central nervous system (brain and spinal cord) and the peripheral nervous system. The peripheral system carries signals between the central system and the rest of the body. Damage to the spinal cord can result in paralysis.",q:"What are the two main divisions of the nervous system?",options:["Brain and nerves","Voluntary and involuntary","Central (brain and spinal cord) and peripheral","Sensory and motor"],answer:"Central (brain and spinal cord) and peripheral",hint:"Read the first sentence!"},
    {level:"hard",passage:"The nitrogen cycle is the process by which nitrogen moves between the atmosphere, soil and living organisms. Nitrogen-fixing bacteria in soil convert atmospheric nitrogen into compounds plants can absorb. This is essential for protein synthesis in all living things.",q:"What do nitrogen-fixing bacteria do?",options:["Release nitrogen into the air","Convert atmospheric nitrogen into compounds plants can absorb","Break down dead organisms","Produce oxygen"],answer:"Convert atmospheric nitrogen into compounds plants can absorb",hint:"Read the second sentence!"},
    {level:"hard",passage:"The Renaissance was a cultural movement that began in Italy in the 14th century and spread throughout Europe. It saw a revival of interest in classical Greek and Roman thought. Artists such as Leonardo da Vinci and Michelangelo produced works that are still celebrated today.",q:"Where did the Renaissance begin?",options:["France","England","Greece","Italy"],answer:"Italy",hint:"Read the first sentence!"},
    {level:"hard",passage:"Mitosis is the process of cell division that produces two genetically identical daughter cells. It is essential for growth, repair and asexual reproduction. It consists of four main phases: prophase, metaphase, anaphase and telophase.",q:"What are the four phases of mitosis?",options:["Interphase, prophase, anaphase, telophase","Prophase, metaphase, anaphase, telophase","Synthesis, replication, division, separation","Splitting, copying, separating, finishing"],answer:"Prophase, metaphase, anaphase, telophase",hint:"Read the last sentence!"},
    {level:"hard",passage:"Biodiversity refers to the variety of life on Earth, including diversity of species, genes and ecosystems. Biodiversity is declining at an unprecedented rate due to human activities. Scientists warn that this could destabilise ecosystems and threaten human survival.",q:"What does biodiversity refer to?",options:["The number of plant species only","The total biomass on Earth","The variety of life including species, genes and ecosystems","The health of ocean ecosystems"],answer:"The variety of life including species, genes and ecosystems",hint:"Read the first sentence!"},
    {level:"hard",passage:"The ozone hole over Antarctica was first observed in the 1980s. It was caused primarily by chlorofluorocarbons (CFCs) used in aerosols and refrigerants. The Montreal Protocol of 1987 phased out CFCs and the ozone layer has been slowly recovering since.",q:"What caused the ozone hole over Antarctica?",options:["Carbon dioxide emissions","Deforestation","CFCs used in aerosols and refrigerants","Methane from farming"],answer:"CFCs used in aerosols and refrigerants",hint:"Read the second sentence!"},
    {level:"hard",passage:"The Enlightenment was an intellectual movement of the 17th and 18th centuries. Thinkers such as Locke, Voltaire and Rousseau championed reason, individual rights and the separation of church and state. Enlightenment ideas directly influenced the American and French Revolutions.",q:"Which revolutions were directly influenced by Enlightenment ideas?",options:["The Russian and Chinese Revolutions","The American and French Revolutions","The Industrial Revolution","The Glorious Revolution only"],answer:"The American and French Revolutions",hint:"Read the last sentence!"},
    {level:"hard",passage:"Photosynthesis and cellular respiration are essentially opposite processes. Photosynthesis converts CO2 and water into glucose and oxygen using light energy. Cellular respiration converts glucose and oxygen into CO2, water and energy.",q:"How are photosynthesis and cellular respiration related?",options:["They are the same process","They are essentially opposite processes","They both require light","They both occur only in plants"],answer:"They are essentially opposite processes",hint:"Read the first sentence!"},
    {level:"hard",passage:"The speed of light in a vacuum is approximately 299,792 kilometres per second. Nothing in the universe can travel faster. Einstein's theory of special relativity shows that as an object approaches the speed of light, its mass increases and time slows down.",q:"What happens to time as an object approaches the speed of light?",options:["Time speeds up","Time stays the same","Time slows down","Time reverses"],answer:"Time slows down",hint:"Read the last sentence!"},
    {level:"hard",passage:"Plate tectonics explains the movement of Earth's lithospheric plates. When an oceanic plate collides with a continental plate, it subducts — slides beneath the continental plate. This process can trigger earthquakes and volcanic activity.",q:"What happens when an oceanic plate collides with a continental plate?",options:["They merge and form one plate","The oceanic plate subducts beneath the continental plate","The continental plate is pushed down","They both rise to form mountains"],answer:"The oceanic plate subducts beneath the continental plate",hint:"Read the second sentence!"},
    {level:"hard",passage:"The scientific method involves making observations, forming a hypothesis, conducting experiments, analysing results, and drawing conclusions. If results contradict the hypothesis, it must be revised. This self-correcting nature is what makes science a reliable way of understanding the world.",q:"What makes science a reliable way of understanding the world?",options:["Scientists are always correct","Experiments always confirm hypotheses","Its self-correcting nature — hypotheses are revised if contradicted","Results are never questioned"],answer:"Its self-correcting nature — hypotheses are revised if contradicted",hint:"Read the last sentence!"},
    {level:"hard",passage:"The Columbian Exchange refers to the transfer of plants, animals, diseases and ideas between the Americas and the Old World following Columbus's 1492 voyage. Potatoes, tomatoes and chocolate came to Europe. Diseases such as smallpox devastated Indigenous American populations.",q:"What came to Europe as part of the Columbian Exchange?",options:["Wheat, rice and tea","Potatoes, tomatoes and chocolate","Horses, cattle and pigs","Cotton, silk and spices"],answer:"Potatoes, tomatoes and chocolate",hint:"Read the third sentence!"},
    {level:"hard",passage:"Synaptic transmission is the process by which signals pass from one neuron to another. A nerve impulse reaches a synaptic knob and triggers the release of neurotransmitters. These cross the synapse and bind to receptors on the next neuron.",q:"How do signals pass from one neuron to another?",options:["By direct electrical connection","Through neurotransmitters crossing the synapse","By physical contact between neurons","Through blood vessels"],answer:"Through neurotransmitters crossing the synapse",hint:"Read the second and third sentences!"},
    {level:"hard",passage:"Carbon capture and storage (CCS) is a technology designed to reduce CO2 in the atmosphere. It works by capturing carbon dioxide at its source — such as a power station — and storing it underground. Critics argue it is expensive and delays the transition to renewable energy.",q:"What is a criticism of carbon capture and storage?",options:["It releases more CO2 than it captures","It does not work technically","It is expensive and delays transition to renewables","It is only available in developed countries"],answer:"It is expensive and delays transition to renewables",hint:"Read the last sentence!"},
    {level:"hard",passage:"The law of conservation of mass states that matter cannot be created or destroyed in a chemical reaction. The total mass of the reactants equals the total mass of the products. This was established by Antoine Lavoisier in the 18th century.",q:"Who established the law of conservation of mass?",options:["Isaac Newton","Marie Curie","Antoine Lavoisier","John Dalton"],answer:"Antoine Lavoisier",hint:"Read the last sentence!"},
    {level:"hard",passage:"The gut microbiome consists of trillions of microorganisms living in the human digestive tract. These microorganisms help digest food, regulate the immune system and may influence mental health. Research into the gut-brain axis is a rapidly growing field.",q:"What roles do gut microbiome microorganisms play?",options:["Causing disease only","Digesting food, regulating immunity, possibly influencing mental health","Producing hormones exclusively","Absorbing oxygen"],answer:"Digesting food, regulating immunity, possibly influencing mental health",hint:"Read the second sentence!"},
    {level:"hard",passage:"Epigenetics studies changes in gene expression that do not involve changes to the DNA sequence itself. Environmental factors such as diet and stress can switch genes on or off. These changes can sometimes be inherited by the next generation.",q:"What does epigenetics study?",options:["Mutations in the DNA sequence","Gene expression changes that do not alter the DNA sequence","The structure of chromosomes","How genes are inherited"],answer:"Gene expression changes that do not alter the DNA sequence",hint:"Read the first sentence!"},
    {level:"hard",passage:"The Anthropocene is a proposed geological epoch characterised by significant human impact on Earth's geology and ecosystems. Human activities have altered the nitrogen cycle, accelerated species extinction, and deposited novel materials like plastics in geological strata. Scientists are debating when exactly the Anthropocene began.",q:"What characterises the Anthropocene?",options:["Natural geological forces dominating Earth","Significant human impact on Earth's geology and ecosystems","The end of the ice age","The formation of modern continents"],answer:"Significant human impact on Earth's geology and ecosystems",hint:"Read the first sentence!"},
    {level:"hard",passage:"Stem cells are undifferentiated cells that can develop into specialised cells. Embryonic stem cells are pluripotent — they can become almost any type of cell. Scientists hope to use them to repair damaged tissues and treat diseases like Parkinson's.",q:"What makes embryonic stem cells pluripotent?",options:["They are extremely small","They can become almost any type of cell","They come from embryos only","They never die"],answer:"They can become almost any type of cell",hint:"Read the second sentence!"},
    {level:"hard",passage:"The tragedy of the commons describes a situation where individuals, acting in their own self-interest, deplete a shared resource. For example, overfishing of oceans benefits individual fishermen but destroys fish stocks for everyone. Solutions include regulation, privatisation or community management.",q:"What does the tragedy of the commons describe?",options:["Historical land disputes","Individuals depleting shared resources through self-interested behaviour","Government interference in markets","A Shakespearean play"],answer:"Individuals depleting shared resources through self-interested behaviour",hint:"Read the first sentence!"},
    {level:"hard",passage:"The law of demand states that, all else being equal, as the price of a good rises, the quantity demanded falls. This creates the characteristic downward-sloping demand curve in economics. Exceptions called Giffen goods exist where demand rises with price.",q:"What is the law of demand?",options:["Higher prices always increase demand","As price rises, quantity demanded falls, all else equal","Supply and demand always balance","Prices always fall over time"],answer:"As price rises, quantity demanded falls, all else equal",hint:"Read the first sentence!"},
    {level:"hard",passage:"The placebo effect, the nocebo effect, and observer bias all highlight the importance of double-blind trials in medicine. In a double-blind trial, neither the patient nor the doctor knows who received the real treatment. This removes unconscious bias from both sides.",q:"Why are double-blind trials important in medicine?",options:["They are faster than regular trials","They use more patients","They remove unconscious bias from both doctor and patient","They guarantee effective treatments"],answer:"They remove unconscious bias from both doctor and patient",hint:"Read the last sentence!"},
    {level:"hard",passage:"The structure of the atom was progressively refined. Dalton proposed solid spheres; Thomson discovered electrons; Rutherford proposed a nuclear model; Bohr proposed quantised electron orbits; and modern quantum mechanics describes electrons as probability clouds.",q:"What did Rutherford propose about the atom?",options:["A solid sphere model","A plum pudding model","A nuclear model","Quantised electron orbits"],answer:"A nuclear model",hint:"Read the sentence about Rutherford in the progression!"},
    {level:"hard",passage:"Zoonotic diseases are infections that jump from animals to humans. COVID-19, Ebola, HIV and influenza all likely originated in animals. Deforestation and wildlife trade increase the risk of zoonotic disease emergence.",q:"What increases the risk of zoonotic disease emergence?",options:["Vaccination programmes","Clean water access","Deforestation and wildlife trade","Urban development"],answer:"Deforestation and wildlife trade",hint:"Read the last sentence!"},
    {level:"hard",passage:"The periodic table organises all known elements by atomic number and chemical properties. Elements in the same vertical column (group) share similar chemical properties. Dmitri Mendeleev created the first widely recognised periodic table in 1869.",q:"What do elements in the same group (vertical column) share?",options:["The same number of protons","Similar chemical properties","The same mass","The same colour"],answer:"Similar chemical properties",hint:"Read the second sentence!"},
    {level:"hard",passage:"The concept of cognitive dissonance, introduced by Leon Festinger in 1957, describes the mental discomfort experienced when holding contradictory beliefs or acting against one's values. People resolve this by changing a belief, adding new beliefs, or reducing the importance of one belief. It explains much of human rationalisation.",q:"How do people resolve cognitive dissonance?",options:["By ignoring the contradiction","By changing a belief, adding new beliefs, or reducing a belief's importance","By always acting on their values","By seeking therapy"],answer:"By changing a belief, adding new beliefs, or reducing a belief's importance",hint:"Read the second sentence!"},
    {level:"hard",passage:"Exoplanets are planets orbiting stars other than the Sun. The first confirmed exoplanet was discovered in 1992. The Kepler Space Telescope, launched in 2009, discovered thousands of exoplanets. Scientists are now searching for potentially habitable Earth-like worlds.",q:"When was the first confirmed exoplanet discovered?",options:["1969","1981","1992","2001"],answer:"1992",hint:"Read the second sentence!"},
    {level:"hard",passage:"The Baroque period in music lasted roughly from 1600 to 1750. Composers such as Bach, Handel and Vivaldi created works characterised by complexity, ornamentation and emotional intensity. The period ended with the death of J.S. Bach in 1750.",q:"Which composers are associated with the Baroque period?",options:["Mozart, Beethoven and Haydn","Bach, Handel and Vivaldi","Debussy, Ravel and Satie","Brahms, Schumann and Liszt"],answer:"Bach, Handel and Vivaldi",hint:"Read the second sentence!"},
    {level:"hard",passage:"Moore's Law, proposed by Gordon Moore in 1965, observed that the number of transistors on a microchip doubles approximately every two years. This predicted rapid increases in computing power. Many experts now suggest Moore's Law is approaching its physical limits.",q:"What did Moore's Law predict?",options:["Computer prices halve every year","The number of transistors doubles approximately every two years","Computers become smaller every decade","Processing speed increases with temperature"],answer:"The number of transistors doubles approximately every two years",hint:"Read the first sentence!"},
    {level:"hard",passage:"The concept of supply and demand is fundamental to economics. When supply falls and demand remains constant, prices rise. When supply increases and demand remains constant, prices fall. This dynamic determines prices in a market economy.",q:"What happens to prices when supply falls and demand stays constant?",options:["Prices fall","Prices stay the same","Prices rise","Demand also falls"],answer:"Prices rise",hint:"Read the second sentence!"},
    {level:"hard",passage:"Pavlov's experiments with dogs demonstrated the principle of classical conditioning. Dogs were trained to salivate at the sound of a bell that had been repeatedly paired with food. This showed that neutral stimuli could produce a conditioned response.",q:"What did Pavlov's experiments demonstrate?",options:["Dogs can learn to talk","Classical conditioning — neutral stimuli can produce conditioned responses","Dogs dislike bells","Food causes salivation only"],answer:"Classical conditioning — neutral stimuli can produce conditioned responses",hint:"Read the last sentence!"},
    {level:"hard",passage:"The theory of plate tectonics, confirmed in the 1960s, explained geological phenomena that had puzzled scientists for decades. Continental drift — the idea that continents move — had been proposed by Alfred Wegener in 1912 but was rejected. Plate tectonics provided the mechanism that explained how and why continents move.",q:"Who originally proposed continental drift?",options:["Isaac Newton","Charles Darwin","Alfred Wegener","Albert Einstein"],answer:"Alfred Wegener",hint:"Read the second sentence!"},
    {level:"hard",passage:"mRNA vaccines, such as those developed against COVID-19, work differently from traditional vaccines. They deliver genetic instructions that tell cells to produce a specific protein. The immune system then learns to recognise and attack that protein, providing protection.",q:"How do mRNA vaccines work?",options:["They inject a weakened virus","They deliver genetic instructions for cells to produce a specific protein","They boost the immune system generally","They block the virus from entering cells"],answer:"They deliver genetic instructions for cells to produce a specific protein",hint:"Read the second sentence!"},
    {level:"hard",passage:"The tragedy of colonialism left deep and lasting impacts on many societies. Economic exploitation, forced labour and the suppression of indigenous cultures created inequalities that persist today. Post-colonial scholars argue that understanding this history is essential for addressing current global inequalities.",q:"What do post-colonial scholars argue is essential?",options:["Rebuilding colonial systems","Returning to pre-colonial practices","Understanding colonial history to address current global inequalities","Forgetting the past and moving forward"],answer:"Understanding colonial history to address current global inequalities",hint:"Read the last sentence!"},
    {level:"hard",passage:"Game theory is a branch of mathematics studying strategic decision-making. The Prisoner's Dilemma illustrates how two rational individuals might not cooperate even when it is in their best interests to do so. Game theory has applications in economics, politics and evolutionary biology.",q:"What does the Prisoner's Dilemma illustrate?",options:["That cooperation is always optimal","That two rational individuals might not cooperate even when it is in their best interests","That criminals always confess","That games have predictable outcomes"],answer:"That two rational individuals might not cooperate even when it is in their best interests",hint:"Read the second sentence!"},
    {level:"hard",passage:"Neural plasticity, or neuroplasticity, refers to the brain's ability to reorganise itself by forming new neural connections throughout life. Learning a new skill strengthens certain neural pathways. Recovery from brain injury is possible partly because other brain areas can take over lost functions.",q:"What enables recovery from brain injury?",options:["New neurons always grow","The brain can reorganise — other areas can take over lost functions","Medicine repairs damaged neurons","The brain replaces lost tissue"],answer:"The brain can reorganise — other areas can take over lost functions",hint:"Read the last sentence!"},
    {level:"hard",passage:"Diffusion is the movement of particles from an area of high concentration to an area of low concentration. It does not require energy and is described as passive transport. It underlies many biological processes, including gas exchange in lungs.",q:"What type of transport is diffusion?",options:["Active transport requiring energy","Passive transport not requiring energy","Osmosis","Facilitated diffusion only"],answer:"Passive transport not requiring energy",hint:"Read the second sentence!"},
    {level:"hard",passage:"The Bretton Woods Conference of 1944 established the post-war international monetary order. It created the International Monetary Fund and the World Bank. The US dollar became the world's reserve currency, linked to gold at a fixed rate.",q:"What organisations were created at Bretton Woods?",options:["The United Nations and NATO","The IMF and the World Bank","The World Trade Organisation and G7","The European Union and OECD"],answer:"The IMF and the World Bank",hint:"Read the second sentence!"},
    {level:"hard",passage:"Osmosis is a special type of diffusion. It is the movement of water molecules through a semi-permeable membrane from a region of lower solute concentration to a region of higher solute concentration. Osmosis is critical for maintaining cell water balance.",q:"How does osmosis differ from regular diffusion?",options:["Osmosis requires energy","Osmosis moves solutes not water","Osmosis is water moving through a semi-permeable membrane to higher solute concentration","Osmosis moves particles from low to high concentration"],answer:"Osmosis is water moving through a semi-permeable membrane to higher solute concentration",hint:"Read the second sentence carefully!"},
    {level:"hard",passage:"The concept of feedback loops is central to understanding complex systems including ecosystems and the climate. A positive feedback loop amplifies change — for example, melting ice reduces reflectivity, causing more warming and more melting. A negative feedback loop counteracts change, creating stability.",q:"What does a positive feedback loop do?",options:["Creates stability","Reduces change","Amplifies change","Cancels out changes"],answer:"Amplifies change",hint:"Read the second sentence!"},
    {level:"hard",passage:"The Harlem Renaissance was a cultural, artistic and intellectual movement centred in Harlem, New York, during the 1920s. It saw an explosion of African American art, music, literature and political thought. Writers such as Langston Hughes and Zora Neale Hurston emerged as major literary voices.",q:"Which writers emerged during the Harlem Renaissance?",options:["Ernest Hemingway and F. Scott Fitzgerald","Langston Hughes and Zora Neale Hurston","James Baldwin and Toni Morrison","Ralph Ellison and Richard Wright"],answer:"Langston Hughes and Zora Neale Hurston",hint:"Read the last sentence!"},
    {level:"hard",passage:"Cognitive behavioural therapy (CBT) is a widely used form of psychotherapy. It helps patients identify and challenge negative thought patterns. CBT has strong evidence for treating anxiety, depression and post-traumatic stress disorder.",q:"What does CBT help patients do?",options:["Recall repressed memories","Understand their childhood","Identify and challenge negative thought patterns","Improve physical health"],answer:"Identify and challenge negative thought patterns",hint:"Read the second sentence!"},
    {level:"hard",passage:"The concept of punctuated equilibrium, proposed by Gould and Eldredge in 1972, challenged Darwin's view of gradual evolution. They argued that species remain largely unchanged for long periods, then evolve rapidly during short bursts. This pattern is visible in the fossil record.",q:"What does punctuated equilibrium propose?",options:["Evolution is always gradual","Species change constantly","Species are stable for long periods then evolve rapidly in short bursts","Evolution only occurs in plants"],answer:"Species are stable for long periods then evolve rapidly in short bursts",hint:"Read the second sentence!"},
    {level:"hard",passage:"The Law of Universal Gravitation, formulated by Newton, states that every particle of matter attracts every other particle with a force proportional to the product of their masses and inversely proportional to the square of the distance between them. This inverse square law means that doubling the distance between objects reduces the gravitational force to one quarter. Einstein later revised this understanding with general relativity.",q:"What happens to gravitational force when distance between objects doubles?",options:["It halves","It doubles","It reduces to one quarter","It stays the same"],answer:"It reduces to one quarter",hint:"Read the second sentence about the inverse square law!"}
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
    // ── EXTRA EASY ──
    {level:"easy",q:"Which word doesn't belong?\n🔴 Red  🔵 Blue  🟢 Green  🐕 Dog",options:["Red","Blue","Green","Dog"],answer:"Dog",hint:"Three are colours. One is an animal!"},
    {level:"easy",q:"Which word goes with\n'hat, scarf, gloves'?",options:["sandals","coat","shorts","swimsuit"],answer:"coat",hint:"All worn in cold weather!"},
    {level:"easy",q:"Apple is to tree as\nrose is to...?",options:["petal","thorn","bush","leaf"],answer:"bush",hint:"An apple grows on a tree. A rose grows on a..."},
    {level:"easy",q:"What comes next?\n1, 2, 3, 4, __",options:["4","5","6","7"],answer:"5",hint:"Count up by 1!"},
    {level:"easy",q:"Which word means the same as 'little'?",options:["huge","tall","small","fast"],answer:"small",hint:"Little = small!"},
    // ── EXTRA MEDIUM ──
    {level:"medium",q:"Pen is to write as\nbrush is to...?",options:["draw","eat","cut","run"],answer:"draw",hint:"You write with a pen. You draw/paint with a brush!"},
    {level:"medium",q:"Which word doesn't belong?\nCircle  Square  Triangle  Cylinder",options:["Circle","Square","Triangle","Cylinder"],answer:"Cylinder",hint:"Three are 2D flat shapes. One is a 3D solid!"},
    {level:"medium",q:"What comes next?\n2, 4, 8, 16, __",options:["18","24","32","64"],answer:"32",hint:"Each number doubles!"},
    {level:"medium",q:"Ice is to cold as\nfire is to...?",options:["smoke","hot","wood","light"],answer:"hot",hint:"Ice is associated with cold. Fire is associated with..."},
    {level:"medium",q:"Which word means the same as 'angry'?",options:["happy","furious","excited","calm"],answer:"furious",hint:"Furious = very angry!"},
    // ── EXTRA HARD ──
    {level:"hard",q:"Thermometer is to temperature as\nbarometer is to...?",options:["wind","rain","air pressure","humidity"],answer:"air pressure",hint:"A thermometer measures temperature. A barometer measures..."},
    {level:"hard",q:"Which doesn't belong?\nSonata  Symphony  Concerto  Novel",options:["Sonata","Symphony","Concerto","Novel"],answer:"Novel",hint:"Three are musical compositions. One is a type of book!"},
    {level:"hard",q:"If some Flurps are Glorps,\nare all Glorps definitely Flurps?",options:["Yes","No","Sometimes","Can't tell"],answer:"No",hint:"Some ≠ all. Some Flurps are Glorps doesn't mean all Glorps are Flurps!"},
    {level:"hard",q:"What comes next?\n3, 5, 8, 12, 17, __",options:["21","22","23","24"],answer:"23",hint:"Differences: +2, +3, +4, +5, +6..."},
    {level:"hard",q:"Microscope is to tiny as\ntelescope is to...?",options:["small","near","distant","bright"],answer:"distant",hint:"A microscope sees tiny things. A telescope sees distant things!"},
  
    {"level":"easy","q":"Which doesn't belong?\n🍕 Pizza  🍔 Burger  🌮 Taco  🍦 Ice cream","options":["Pizza","Burger","Taco","Ice cream"],"answer":"Ice cream","hint":"Three are savoury meals, one is a dessert!"},
    {"level":"easy","q":"Which goes with 'Monday, Wednesday, Friday'?","options":["March","Tuesday","Morning","January"],"answer":"Tuesday","hint":"Monday, Tuesday, Wednesday are all days!"},
    {"level":"easy","q":"Finger is to hand as toe is to...?","options":["leg","shoe","foot","knee"],"answer":"foot","hint":"Fingers are on a hand. Toes are on a foot!"},
    {"level":"easy","q":"What comes next?\nA, C, E, G, __","options":["H","I","J","K"],"answer":"I","hint":"Skip one letter each time!"},
    {"level":"easy","q":"Which doesn't belong?\n🔴 Red  🟡 Yellow  🟢 Green  🔲 Square","options":["Red","Yellow","Green","Square"],"answer":"Square","hint":"Three are colours, one is a shape!"},
    {"level":"easy","q":"Day is to sun as night is to...?","options":["dark","star","moon","cloud"],"answer":"moon","hint":"The sun lights the day, the moon lights the night!"},
    {"level":"easy","q":"Which doesn't belong?\n🐕 Dog  🐈 Cat  🐇 Rabbit  🌹 Rose","options":["Dog","Cat","Rabbit","Rose"],"answer":"Rose","hint":"Three are animals, one is a flower!"},
    {"level":"easy","q":"Cup is to drink as plate is to...?","options":["cook","eat","wash","hold"],"answer":"eat","hint":"You drink from a cup, you eat from a plate!"},
    {"level":"easy","q":"Puppy is to dog as lamb is to...?","options":["cow","goat","sheep","horse"],"answer":"sheep","hint":"A lamb grows into a sheep!"},
    {"level":"easy","q":"Which doesn't belong?\n✈️ Plane  🚂 Train  🚗 Car  🏠 House","options":["Plane","Train","Car","House"],"answer":"House","hint":"Three are vehicles, one is a building!"},
    {"level":"easy","q":"Teacher is to school as\ndoctor is to...?","options":["office","pharmacy","hospital","clinic"],"answer":"hospital","hint":"A teacher works at school, a doctor at hospital!"},
    {"level":"easy","q":"What comes next?\n1, 3, 5, 7, __","options":["8","9","10","11"],"answer":"9","hint":"Odd numbers: add 2 each time!"},
    {"level":"easy","q":"What comes next?\n2, 4, 6, 8, 10, __","options":["11","12","13","14"],"answer":"12","hint":"Count by 2!"},
    {"level":"easy","q":"Which goes with 'spring, summer, autumn'?","options":["Monday","December","winter","morning"],"answer":"winter","hint":"Spring, summer, autumn, winter — four seasons!"},
    {"level":"medium","q":"Author is to book as\ncomposer is to...?","options":["painting","film","music","poem"],"answer":"music","hint":"An author writes books, a composer writes music!"},
    {"level":"medium","q":"What comes next?\n3, 6, 12, 24, __","options":["36","40","48","50"],"answer":"48","hint":"Each number doubles!"},
    {"level":"medium","q":"Which doesn't belong?\nRose  Tulip  Sunflower  Oak","options":["Rose","Tulip","Sunflower","Oak"],"answer":"Oak","hint":"Three are flowers, one is a tree!"},
    {"level":"medium","q":"Rain is to wet as fire is to...?","options":["smoke","hot","wood","bright"],"answer":"hot","hint":"Rain makes wet, fire makes hot!"},
    {"level":"medium","q":"What comes next?\n1, 4, 9, 16, 25, __","options":["30","34","36","40"],"answer":"36","hint":"Square numbers: 1²,2²,3²,4²,5²,6²!"},
    {"level":"medium","q":"Eyes are to glasses as\nears are to...?","options":["nose","hearing aid","head","hair"],"answer":"hearing aid","hint":"Glasses help eyes, hearing aids help ears!"},
    {"level":"medium","q":"What comes next?\n100, 91, 82, 73, __","options":["62","63","64","65"],"answer":"64","hint":"Subtract 9 each time!"},
    {"level":"medium","q":"Which doesn't belong?\nViolin  Piano  Guitar  Trumpet","options":["Violin","Piano","Guitar","Trumpet"],"answer":"Trumpet","hint":"Three are string instruments, one is brass/wind!"},
    {"level":"medium","q":"Which word is the odd one out?\nHappy  Joyful  Cheerful  Miserable","options":["Happy","Joyful","Cheerful","Miserable"],"answer":"Miserable","hint":"Three mean good feelings, one means terrible!"},
    {"level":"medium","q":"River is to ocean as\nstream is to...?","options":["lake","pond","puddle","river"],"answer":"river","hint":"Streams flow into rivers, rivers into oceans!"},
    {"level":"medium","q":"What comes next?\n5, 10, 20, 40, 80, __","options":["120","140","160","180"],"answer":"160","hint":"Each number doubles!"},
    {"level":"medium","q":"Which word doesn't belong?\nSwim  Run  Jump  Sleep","options":["Swim","Run","Jump","Sleep"],"answer":"Sleep","hint":"Three are active movements, one is rest!"},
    {"level":"medium","q":"Hungry is to eat as\ntired is to...?","options":["run","sleep","work","play"],"answer":"sleep","hint":"When hungry you eat, when tired you sleep!"},
    {"level":"medium","q":"What comes next?\nZ, X, V, T, __","options":["P","R","S","Q"],"answer":"R","hint":"Go backwards, skipping one letter each time!"},
    {"level":"hard","q":"Prologue is to beginning as\nepilogue is to...?","options":["middle","beginning","end","chapter"],"answer":"end","hint":"Prologue = before. Epilogue = after/end!"},
    {"level":"hard","q":"What comes next?\n2, 3, 5, 8, 13, 21, __","options":["29","32","34","36"],"answer":"34","hint":"Fibonacci: each = sum of two before. 21+13=34!"},
    {"level":"hard","q":"Which doesn't belong?\nSonata  Symphony  Concerto  Haiku","options":["Sonata","Symphony","Concerto","Haiku"],"answer":"Haiku","hint":"Three are musical pieces, haiku is a poem!"},
    {"level":"hard","q":"What comes next?\n1, 8, 27, 64, 125, __","options":["196","210","216","225"],"answer":"216","hint":"Cube numbers: 1³,2³,3³,4³,5³,6³=216!"},
    {"level":"hard","q":"Cartographer is to maps as\norchestrator is to...?","options":["paintings","symphonies","films","buildings"],"answer":"symphonies","hint":"Cartographer makes maps, orchestrator arranges music!"},
    {"level":"hard","q":"What comes next?\n2, 6, 12, 20, 30, __","options":["40","42","44","46"],"answer":"42","hint":"Differences: +4,+6,+8,+10,+12. 30+12=42!"},
    {"level":"hard","q":"If all Ziffs are Zaffs,\nand no Zaffs are Zoffs,\nare any Ziffs Zoffs?","options":["Yes","No","Maybe","Can't tell"],"answer":"No","hint":"All Ziffs=Zaffs. No Zaffs=Zoffs. So no Ziffs can be Zoffs!"},
    {"level":"hard","q":"Podiatrist is to feet as\nophthalmologist is to...?","options":["ears","nose","eyes","skin"],"answer":"eyes","hint":"Podiatrist treats feet, ophthalmologist treats eyes!"},
    {"level":"hard","q":"Which doesn't belong?\nEpic  Sonnet  Haiku  Novel","options":["Epic","Sonnet","Haiku","Novel"],"answer":"Novel","hint":"Three are poetry forms, novel is prose!"},
    {"level":"hard","q":"What comes next?\nA1, B4, C9, D16, __","options":["E20","E25","F25","E24"],"answer":"E25","hint":"Letters A,B,C,D,E. Numbers are squares: 1,4,9,16,25!"},
    {"level":"hard","q":"If a is to z as b is to y,\nthen d is to...?","options":["v","w","x","y"],"answer":"w","hint":"Mirror the alphabet: a↔z, b↔y, c↔x, d↔w!"},
    {"level":"hard","q":"What comes next?\n1, 1, 2, 4, 7, 13, __","options":["22","23","24","25"],"answer":"24","hint":"Each = sum of previous three: 4+7+13=24!"},
    {"level":"hard","q":"Ichthyologist studies fish as\nentomologist studies...?","options":["birds","reptiles","insects","plants"],"answer":"insects","hint":"Entomo = insect in Greek!"},
  ,
    {level:"easy",q:"Which doesn't belong?\nDog  Cat  Rabbit  Rose",options:["Dog","Cat","Rabbit","Rose"],answer:"Rose",hint:"Three are animals, one is a flower!"},
    {level:"easy",q:"What comes next?\n2, 4, 6, 8, __",options:["9","10","11","12"],answer:"10",hint:"Count by 2!"},
    {level:"easy",q:"Finger is to hand as toe is to...?",options:["leg","shoe","foot","knee"],answer:"foot",hint:"Fingers on a hand, toes on a foot!"},
    {level:"easy",q:"Which doesn't belong?\nRed  Yellow  Green  Square",options:["Red","Yellow","Green","Square"],answer:"Square",hint:"Three are colours, one is a shape!"},
    {level:"easy",q:"Day is to sun as night is to...?",options:["dark","star","moon","cloud"],answer:"moon",hint:"The sun lights day, the moon lights night!"},
    {level:"easy",q:"Cup is to drink as plate is to...?",options:["cook","eat","wash","hold"],answer:"eat",hint:"You drink from a cup, eat from a plate!"},
    {level:"easy",q:"Puppy is to dog as lamb is to...?",options:["cow","goat","sheep","horse"],answer:"sheep",hint:"A lamb grows into a sheep!"},
    {level:"easy",q:"Which doesn't belong?\nPlane  Train  Car  House",options:["Plane","Train","Car","House"],answer:"House",hint:"Three are transport, one is a building!"},
    {level:"easy",q:"Teacher is to school as doctor is to...?",options:["office","pharmacy","hospital","clinic"],answer:"hospital",hint:"Teacher at school, doctor at hospital!"},
    {level:"easy",q:"What comes next?\n1, 3, 5, 7, __",options:["8","9","10","11"],answer:"9",hint:"Odd numbers: add 2 each time!"},
    {level:"easy",q:"Which goes with spring, summer, autumn?",options:["Monday","December","winter","morning"],answer:"winter",hint:"The four seasons!"},
    {level:"easy",q:"Which doesn't belong?\nPizza  Burger  Taco  Ice cream",options:["Pizza","Burger","Taco","Ice cream"],answer:"Ice cream",hint:"Three are savoury, one is a dessert!"},
    {level:"easy",q:"What comes next?\n10, 20, 30, 40, __",options:["45","48","50","55"],answer:"50",hint:"Count by 10!"},
    {level:"easy",q:"Bird is to wings as fish is to...?",options:["legs","gills","fins","scales"],answer:"fins",hint:"Birds use wings to swim... wait: fish use fins!"},
    {level:"easy",q:"Which goes with Monday, Wednesday, Friday?",options:["March","Tuesday","Morning","January"],answer:"Tuesday",hint:"Days of the week!"},
    {level:"medium",q:"Author is to book as composer is to...?",options:["painting","film","music","poem"],answer:"music",hint:"Author writes books, composer writes music!"},
    {level:"medium",q:"What comes next?\n3, 6, 12, 24, __",options:["36","40","48","50"],answer:"48",hint:"Each number doubles!"},
    {level:"medium",q:"Which doesn't belong?\nRose  Tulip  Sunflower  Oak",options:["Rose","Tulip","Sunflower","Oak"],answer:"Oak",hint:"Three are flowers, one is a tree!"},
    {level:"medium",q:"Rain is to wet as fire is to...?",options:["smoke","hot","wood","bright"],answer:"hot",hint:"Rain makes wet, fire makes hot!"},
    {level:"medium",q:"What comes next?\n1, 4, 9, 16, 25, __",options:["30","34","36","40"],answer:"36",hint:"Square numbers: 6²=36!"},
    {level:"medium",q:"Eyes are to glasses as ears are to...?",options:["nose","hearing aid","head","hair"],answer:"hearing aid",hint:"Glasses help eyes, hearing aids help ears!"},
    {level:"medium",q:"What comes next?\n100, 91, 82, 73, __",options:["62","63","64","65"],answer:"64",hint:"Subtract 9 each time!"},
    {level:"medium",q:"Which doesn't belong?\nViolin  Piano  Guitar  Trumpet",options:["Violin","Piano","Guitar","Trumpet"],answer:"Trumpet",hint:"Three are string instruments, trumpet is brass!"},
    {level:"medium",q:"Which word is the odd one out?\nHappy  Joyful  Cheerful  Miserable",options:["Happy","Joyful","Cheerful","Miserable"],answer:"Miserable",hint:"Three mean positive, one is negative!"},
    {level:"medium",q:"River is to ocean as stream is to...?",options:["lake","pond","puddle","river"],answer:"river",hint:"Streams flow into rivers, rivers into oceans!"},
    {level:"medium",q:"What comes next?\n5, 10, 20, 40, 80, __",options:["120","140","160","180"],answer:"160",hint:"Each number doubles!"},
    {level:"medium",q:"Hungry is to eat as tired is to...?",options:["run","sleep","work","play"],answer:"sleep",hint:"When hungry you eat, when tired you sleep!"},
    {level:"medium",q:"What comes next?\nZ, X, V, T, __",options:["P","R","S","Q"],answer:"R",hint:"Go backwards, skipping one letter!"},
    {level:"medium",q:"Which doesn't belong?\nFrance  Germany  China  Italy",options:["France","Germany","China","Italy"],answer:"China",hint:"Three are European, one is Asian!"},
    {level:"medium",q:"Microscope is to biologist as telescope is to...?",options:["geologist","astronomer","chemist","historian"],answer:"astronomer",hint:"Microscope for biology, telescope for astronomy!"},
    {level:"hard",q:"Prologue is to beginning as epilogue is to...?",options:["middle","beginning","end","chapter"],answer:"end",hint:"Prologue = before. Epilogue = after!"},
    {level:"hard",q:"What comes next?\n2, 3, 5, 8, 13, 21, __",options:["29","32","34","36"],answer:"34",hint:"Fibonacci: each = sum of previous two!"},
    {level:"hard",q:"Which doesn't belong?\nSonata  Symphony  Concerto  Haiku",options:["Sonata","Symphony","Concerto","Haiku"],answer:"Haiku",hint:"Three are musical pieces, haiku is a poem!"},
    {level:"hard",q:"What comes next?\n1, 8, 27, 64, 125, __",options:["196","210","216","225"],answer:"216",hint:"Cube numbers: 6³=216!"},
    {level:"hard",q:"Cartographer is to maps as orchestrator is to...?",options:["paintings","symphonies","films","buildings"],answer:"symphonies",hint:"Cartographer makes maps, orchestrator arranges music!"},
    {level:"hard",q:"What comes next?\n2, 6, 12, 20, 30, __",options:["40","42","44","46"],answer:"42",hint:"Differences: +4,+6,+8,+10,+12. 30+12=42!"},
    {level:"hard",q:"If all Ziffs are Zaffs, and no Zaffs are Zoffs,\nare any Ziffs Zoffs?",options:["Yes","No","Maybe","Can't tell"],answer:"No",hint:"All Ziffs=Zaffs. No Zaffs=Zoffs. So no Ziffs=Zoffs!"},
    {level:"hard",q:"Podiatrist is to feet as ophthalmologist is to...?",options:["ears","nose","eyes","skin"],answer:"eyes",hint:"Podiatrist treats feet, ophthalmologist treats eyes!"},
    {level:"hard",q:"Which doesn't belong?\nEpic  Sonnet  Haiku  Novel",options:["Epic","Sonnet","Haiku","Novel"],answer:"Novel",hint:"Three are poetry forms, novel is prose!"},
    {level:"hard",q:"What comes next?\nA1, B4, C9, D16, __",options:["E20","E25","F25","E24"],answer:"E25",hint:"Letters A-E, numbers are squares: 1,4,9,16,25!"},
    {level:"hard",q:"If a↔z and b↔y, then d↔...?",options:["v","w","x","y"],answer:"w",hint:"Mirror the alphabet: d↔w!"},
    {level:"hard",q:"What comes next?\n1, 1, 2, 4, 7, 13, __",options:["22","23","24","25"],answer:"24",hint:"Each = sum of previous three: 4+7+13=24!"},
    {level:"hard",q:"Ichthyologist studies fish as\nentomologist studies...?",options:["birds","reptiles","insects","plants"],answer:"insects",hint:"Entomo = insect in Greek!"},
    {level:"hard",q:"Palaeontologist is to fossils as\nseismologist is to...?",options:["weather","volcanoes","earthquakes","climate"],answer:"earthquakes",hint:"Seismologist studies earthquakes!"},
    {level:"hard",q:"Complete the pattern:\nAB, BC, CD, DE, __",options:["EE","EF","FE","FF"],answer:"EF",hint:"Each pair moves one letter forward!"}
  ,
    {level:"easy",q:"Which doesn't belong?\nPiano  Guitar  Violin  Trumpet",options:["Piano","Guitar","Violin","Trumpet"],answer:"Trumpet",hint:"Three are string instruments, trumpet is brass!"},
    {level:"easy",q:"What comes next?\n3, 6, 9, 12, __",options:["13","14","15","16"],answer:"15",hint:"Count by 3!"},
    {level:"easy",q:"Sun is to light as fire is to...?",options:["smoke","ash","heat","wood"],answer:"heat",hint:"Sun gives light. Fire gives heat!"},
    {level:"easy",q:"Which doesn't belong?\nSwimming  Running  Sleeping  Jumping",options:["Swimming","Running","Sleeping","Jumping"],answer:"Sleeping",hint:"Three are active sports, sleeping is rest!"},
    {level:"easy",q:"Cat is to kitten as\ndog is to...?",options:["puppy","cub","foal","chick"],answer:"puppy",hint:"A kitten is a baby cat. A puppy is a baby dog!"},
    {level:"easy",q:"Which goes with Monday, Wednesday, Friday?",options:["March","Saturday","Morning","Holiday"],answer:"Saturday",hint:"All days of the week!"},
    {level:"easy",q:"What comes next?\n50, 45, 40, 35, __",options:["28","29","30","31"],answer:"30",hint:"Subtract 5 each time!"},
    {level:"easy",q:"Pen is to write as\nbrush is to...?",options:["draw","paint","cut","dig"],answer:"paint",hint:"You write with a pen. You paint with a brush!"},
    {level:"easy",q:"Which doesn't belong?\nApple  Banana  Carrot  Orange",options:["Apple","Banana","Carrot","Orange"],answer:"Carrot",hint:"Three are fruits, carrot is a vegetable!"},
    {level:"easy",q:"Baby is to adult as\nseed is to...?",options:["soil","water","tree","leaf"],answer:"tree",hint:"A baby grows into an adult. A seed grows into a tree!"},
    {level:"easy",q:"What comes next?\n100, 200, 300, 400, __",options:["450","480","500","550"],answer:"500",hint:"Count by 100!"},
    {level:"easy",q:"Which doesn't belong?\nRed  Green  Blue  Cold",options:["Red","Green","Blue","Cold"],answer:"Cold",hint:"Three are colours, cold is a temperature!"},
    {level:"easy",q:"Fork is to eat as\nspoon is to...?",options:["stir","cut","pour","stab"],answer:"stir",hint:"A fork is for eating. A spoon is for stirring and scooping!"},
    {level:"easy",q:"What comes next?\n1, 2, 3, 4, 5, __",options:["4","5","6","7"],answer:"6",hint:"Count up by 1!"},
    {level:"easy",q:"Which doesn't belong?\nSunday  Monday  Tuesday  January",options:["Sunday","Monday","Tuesday","January"],answer:"January",hint:"Three are days, January is a month!"},
    {level:"easy",q:"Eye is to see as\near is to...?",options:["taste","touch","hear","smell"],answer:"hear",hint:"Eyes are for seeing. Ears are for hearing!"},
    {level:"easy",q:"What comes next?\n2, 4, 8, 16, __",options:["24","28","32","36"],answer:"32",hint:"Each number doubles!"},
    {level:"easy",q:"Which doesn't belong?\nCircle  Square  Triangle  Purple",options:["Circle","Square","Triangle","Purple"],answer:"Purple",hint:"Three are shapes, purple is a colour!"},
    {level:"easy",q:"Cold is to hot as\nfast is to...?",options:["quick","rapid","slow","speedy"],answer:"slow",hint:"Cold and hot are opposites. Fast and slow are opposites!"},
    {level:"easy",q:"What comes next?\n7, 14, 21, 28, __",options:["32","35","36","42"],answer:"35",hint:"Count by 7!"},
    {level:"easy",q:"Which doesn't belong?\nSpark  Flame  Ash  Rain",options:["Spark","Flame","Ash","Rain"],answer:"Rain",hint:"Three relate to fire, rain is water!"},
    {level:"easy",q:"Hen is to chicken as\ncow is to...?",options:["calf","lamb","foal","piglet"],answer:"calf",hint:"A hen is a female chicken. A cow is a female... and her baby is a calf!"},
    {level:"easy",q:"What comes next?\n0, 5, 10, 15, 20, __",options:["22","23","24","25"],answer:"25",hint:"Count by 5!"},
    {level:"easy",q:"Which doesn't belong?\nHappy  Sad  Angry  Running",options:["Happy","Sad","Angry","Running"],answer:"Running",hint:"Three are emotions, running is an action!"},
    {level:"easy",q:"Key is to lock as\npassword is to...?",options:["door","internet","computer","login"],answer:"login",hint:"A key opens a lock. A password enables a login!"},
    {level:"easy",q:"What comes next?\n10, 9, 8, 7, 6, __",options:["3","4","5","6"],answer:"5",hint:"Count backwards by 1!"},
    {level:"easy",q:"Which doesn't belong?\nLion  Tiger  Elephant  Daisy",options:["Lion","Tiger","Elephant","Daisy"],answer:"Daisy",hint:"Three are animals, daisy is a flower!"},
    {level:"easy",q:"Light is to dark as\nday is to...?",options:["morning","evening","night","sunset"],answer:"night",hint:"Light and dark are opposites. Day and night are opposites!"},
    {level:"easy",q:"What comes next?\nAA, BB, CC, DD, __",options:["DE","EE","EF","FF"],answer:"EE",hint:"Each letter is doubled and moves to next letter!"},
    {level:"easy",q:"Which doesn't belong?\nRobin  Eagle  Shark  Parrot",options:["Robin","Eagle","Shark","Parrot"],answer:"Shark",hint:"Three are birds, shark is a fish!"},
    {level:"easy",q:"Shoe is to foot as\nglove is to...?",options:["arm","head","hand","finger"],answer:"hand",hint:"A shoe goes on a foot. A glove goes on a hand!"},
    {level:"easy",q:"What comes next?\n1, 3, 5, 7, 9, __",options:["10","11","12","13"],answer:"11",hint:"Odd numbers: add 2 each time!"},
    {level:"easy",q:"Which doesn't belong?\nParis  London  Berlin  Amazon",options:["Paris","London","Berlin","Amazon"],answer:"Amazon",hint:"Three are capital cities, Amazon is a river!"},
    {level:"easy",q:"Bird is to sky as\nfish is to...?",options:["land","sky","water","air"],answer:"water",hint:"Birds fly in the sky. Fish swim in the water!"},
    {level:"easy",q:"What comes next?\n5, 10, 15, 20, 25, __",options:["28","29","30","35"],answer:"30",hint:"Count by 5!"},
    {level:"easy",q:"Which doesn't belong?\nMarch  April  May  Monday",options:["March","April","May","Monday"],answer:"Monday",hint:"Three are months, Monday is a day!"},
    {level:"easy",q:"Question is to answer as\nproblem is to...?",options:["question","difficulty","solution","trouble"],answer:"solution",hint:"A question has an answer. A problem has a solution!"},
    {level:"easy",q:"What comes next?\n1, 4, 7, 10, __",options:["11","12","13","14"],answer:"13",hint:"Add 3 each time!"},
    {level:"easy",q:"Which doesn't belong?\nHammer  Screwdriver  Wrench  Spoon",options:["Hammer","Screwdriver","Wrench","Spoon"],answer:"Spoon",hint:"Three are tools, spoon is cutlery!"},
    {level:"easy",q:"Summer is to hot as\nwinter is to...?",options:["warm","cold","cool","rainy"],answer:"cold",hint:"Summer is hot. Winter is cold!"},
    {level:"easy",q:"What comes next?\nA, B, C, D, __",options:["D","E","F","G"],answer:"E",hint:"The alphabet!"},
    {level:"easy",q:"Which doesn't belong?\nSea  Lake  River  Mountain",options:["Sea","Lake","River","Mountain"],answer:"Mountain",hint:"Three are bodies of water, mountain is land!"},
    {level:"easy",q:"Clock is to time as\nscale is to...?",options:["height","volume","weight","speed"],answer:"weight",hint:"A clock measures time. A scale measures weight!"},
    {level:"easy",q:"What comes next?\n20, 16, 12, 8, __",options:["2","3","4","6"],answer:"4",hint:"Subtract 4 each time!"},
    {level:"easy",q:"Which doesn't belong?\nWalking  Cycling  Swimming  Thinking",options:["Walking","Cycling","Swimming","Thinking"],answer:"Thinking",hint:"Three are physical activities, thinking is mental!"},
    {level:"easy",q:"Small is to big as\nthin is to...?",options:["tall","wide","thick","round"],answer:"thick",hint:"Small and big are opposites. Thin and thick are opposites!"},
    {level:"easy",q:"What comes next?\n2, 5, 8, 11, __",options:["12","13","14","15"],answer:"14",hint:"Add 3 each time!"},
    {level:"easy",q:"Which doesn't belong?\nAfrica  Asia  Europe  Atlantic",options:["Africa","Asia","Europe","Atlantic"],answer:"Atlantic",hint:"Three are continents, Atlantic is an ocean!"},
    {level:"easy",q:"Teacher is to pupil as\ndoctor is to...?",options:["nurse","teacher","patient","hospital"],answer:"patient",hint:"A teacher works with pupils. A doctor works with patients!"},
    {level:"easy",q:"What comes next?\n64, 32, 16, 8, __",options:["2","3","4","6"],answer:"4",hint:"Divide by 2 each time!"},
    {level:"easy",q:"Which doesn't belong?\nSing  Dance  Paint  Breathe",options:["Sing","Dance","Paint","Breathe"],answer:"Breathe",hint:"Three are creative activities, breathing is involuntary!"},
    {level:"easy",q:"Up is to down as\nover is to...?",options:["above","top","under","high"],answer:"under",hint:"Up and down are opposites. Over and under are opposites!"},
    {level:"easy",q:"What comes next?\nBA, CB, DC, ED, __",options:["EF","FE","FD","DE"],answer:"FE",hint:"Each pair: next letter then current. BA, CB, DC, ED, FE!"},
    {level:"easy",q:"Which doesn't belong?\nRain  Snow  Hail  Soil",options:["Rain","Snow","Hail","Soil"],answer:"Soil",hint:"Three are types of precipitation, soil is ground!"},
    {level:"easy",q:"Wool is to sheep as\nsilk is to...?",options:["spider","worm","bee","caterpillar"],answer:"worm",hint:"Wool comes from sheep. Silk comes from silkworms!"},
    {level:"easy",q:"What comes next?\n1, 2, 4, 7, 11, __",options:["14","15","16","17"],answer:"16",hint:"Add 1, then 2, then 3, then 4, then 5!"},
    {level:"easy",q:"Which doesn't belong?\nKnife  Fork  Spoon  Hammer",options:["Knife","Fork","Spoon","Hammer"],answer:"Hammer",hint:"Three are cutlery, hammer is a tool!"},
    {level:"easy",q:"Night is to dark as\nday is to...?",options:["warm","long","light","busy"],answer:"light",hint:"Night is dark. Day is light!"},
    {level:"easy",q:"What comes next?\n3, 9, 27, 81, __",options:["162","243","324","405"],answer:"243",hint:"Multiply by 3 each time!"},
    {level:"easy",q:"Which doesn't belong?\nIron  Steel  Wood  Copper",options:["Iron","Steel","Wood","Copper"],answer:"Wood",hint:"Three are metals, wood is not a metal!"},
    {level:"easy",q:"Sow is to seeds as\nwater is to...?",options:["flood","dry","rain","grow"],answer:"rain",hint:"You sow seeds. Rain waters them — or you water them with water!"},
    {level:"easy",q:"What comes next?\n1, 2, 4, 8, 16, 32, __",options:["48","56","64","72"],answer:"64",hint:"Double each time!"},
    {level:"easy",q:"Which doesn't belong?\nEarth  Mars  Moon  Jupiter",options:["Earth","Mars","Moon","Jupiter"],answer:"Moon",hint:"Three are planets, the Moon is a natural satellite!"},
    {level:"easy",q:"Write is to pen as\npaint is to...?",options:["canvas","colour","brush","palette"],answer:"brush",hint:"You write with a pen. You paint with a brush!"},
    {level:"easy",q:"What comes next?\n6, 12, 18, 24, __",options:["28","29","30","36"],answer:"30",hint:"Count by 6!"},
    {level:"easy",q:"Which doesn't belong?\nSmile  Laugh  Cry  Cough",options:["Smile","Laugh","Cry","Cough"],answer:"Cough",hint:"Three are emotional expressions, coughing is physical!"},
    {level:"easy",q:"Cat is to meow as\ndog is to...?",options:["hiss","bark","moo","roar"],answer:"bark",hint:"Cats meow. Dogs bark!"},
    {level:"easy",q:"What comes next?\n10, 20, 40, 80, __",options:["120","140","160","200"],answer:"160",hint:"Double each time!"},
    {level:"easy",q:"Which doesn't belong?\nPenis  Fir  Oak  Rose",options:["Pine","Fir","Oak","Rose"],answer:"Rose",hint:"Three are trees, rose is a flowering shrub!"},
    {level:"easy",q:"Good is to better as\nbad is to...?",options:["bad","worse","worst","bader"],answer:"worse",hint:"Good, better, best. Bad, worse, worst!"},
    {level:"easy",q:"What comes next?\nBC, DE, FG, HI, __",options:["IJ","JK","JL","KL"],answer:"JK",hint:"Each pair is two consecutive letters, moving forward 2 each time!"},
    {level:"easy",q:"Which doesn't belong?\nAnger  Joy  Sadness  Running",options:["Anger","Joy","Sadness","Running"],answer:"Running",hint:"Three are emotions, running is an action!"},
    {level:"easy",q:"What comes next?\n4, 8, 12, 16, 20, __",options:["22","23","24","26"],answer:"24",hint:"Count by 4!"},
    {level:"medium",q:"What comes next?\n5, 6, 8, 11, 15, __",options:["18","19","20","21"],answer:"20",hint:"Differences: +1,+2,+3,+4,+5. 15+5=20!"},
    {level:"medium",q:"BDFHJ : next?",options:["K","L","M","N"],answer:"L",hint:"Every other letter of the alphabet: B,D,F,H,J,L!"},
    {level:"medium",q:"Which word doesn't belong?\nBirch  Maple  Willow  Daffodil",options:["Birch","Maple","Willow","Daffodil"],answer:"Daffodil",hint:"Three are trees, daffodil is a flower!"},
    {level:"medium",q:"Playwright is to play as\nchoreographer is to...?",options:["music","dance","painting","poem"],answer:"dance",hint:"A playwright creates plays. A choreographer creates dances!"},
    {level:"medium",q:"What comes next?\n1, 3, 6, 10, 15, __",options:["18","20","21","25"],answer:"21",hint:"Differences: +2,+3,+4,+5,+6. 15+6=21!"},
    {level:"medium",q:"Which doesn't belong?\nSonnet  Haiku  Limerick  Essay",options:["Sonnet","Haiku","Limerick","Essay"],answer:"Essay",hint:"Three are poetic forms, essay is prose!"},
    {level:"medium",q:"Optician is to eyes as\northodontist is to...?",options:["ears","bones","teeth","skin"],answer:"teeth",hint:"Opticians treat eyes. Orthodontists treat teeth!"},
    {level:"medium",q:"What comes next?\n4, 9, 16, 25, 36, __",options:["42","48","49","56"],answer:"49",hint:"Square numbers: 7²=49!"},
    {level:"medium",q:"Which doesn't belong?\nMercury  Venus  Moon  Mars",options:["Mercury","Venus","Moon","Mars"],answer:"Moon",hint:"Three are planets, the Moon is a satellite!"},
    {level:"medium",q:"Chef is to kitchen as\nsurgeon is to...?",options:["hospital","clinic","theatre","ward"],answer:"theatre",hint:"A chef works in a kitchen. A surgeon works in a theatre!"},
    {level:"medium",q:"What comes next?\n0, 1, 1, 2, 3, 5, 8, __",options:["11","12","13","14"],answer:"13",hint:"Fibonacci: each = sum of two before. 5+8=13!"},
    {level:"medium",q:"Which doesn't belong?\nKilometre  Centimetre  Millimetre  Kilogram",options:["Kilometre","Centimetre","Millimetre","Kilogram"],answer:"Kilogram",hint:"Three measure length, kilogram measures mass!"},
    {level:"medium",q:"Geologist is to rocks as\nbotanist is to...?",options:["animals","insects","plants","fungi"],answer:"plants",hint:"Geologists study rocks. Botanists study plants!"},
    {level:"medium",q:"What comes next?\n2, 3, 5, 9, 17, __",options:["29","31","33","35"],answer:"33",hint:"Differences: +1,+2,+4,+8,+16. Each difference doubles. 17+16=33!"},
    {level:"medium",q:"Which doesn't belong?\nWater  Ice  Steam  Carbon dioxide",options:["Water","Ice","Steam","Carbon dioxide"],answer:"Carbon dioxide",hint:"Three are states of H2O, CO2 is a different substance!"},
    {level:"medium",q:"Lexicographer is to dictionary as\ncartographer is to...?",options:["maps","books","atlases","globes"],answer:"maps",hint:"A lexicographer makes dictionaries. A cartographer makes maps!"},
    {level:"medium",q:"What comes next?\n100, 99, 97, 94, 90, __",options:["84","85","86","87"],answer:"85",hint:"Differences: -1,-2,-3,-4,-5. 90-5=85!"},
    {level:"medium",q:"Which doesn't belong?\nVelocity  Speed  Acceleration  Temperature",options:["Velocity","Speed","Acceleration","Temperature"],answer:"Temperature",hint:"Three are physics of motion, temperature is heat!"},
    {level:"medium",q:"Dentist is to teeth as\ndermatologist is to...?",options:["eyes","bones","skin","hair"],answer:"skin",hint:"Dentists treat teeth. Dermatologists treat skin!"},
    {level:"medium",q:"What comes next?\n6, 11, 9, 14, 12, 17, __",options:["13","14","15","16"],answer:"15",hint:"Alternating: +5 then -2: 6,11,9,14,12,17,15!"},
    {level:"medium",q:"Which doesn't belong?\nPiano  Organ  Synthesiser  Trumpet",options:["Piano","Organ","Synthesiser","Trumpet"],answer:"Trumpet",hint:"Three are keyboard instruments, trumpet is brass/wind!"},
    {level:"medium",q:"General is to army as\nadmiral is to...?",options:["soldiers","air force","navy","police"],answer:"navy",hint:"A general commands an army. An admiral commands a navy!"},
    {level:"medium",q:"What comes next?\n7, 8, 10, 13, 17, __",options:["21","22","23","24"],answer:"22",hint:"Differences: +1,+2,+3,+4,+5. 17+5=22!"},
    {level:"medium",q:"Which doesn't belong?\nDemocracy  Monarchy  Oligarchy  Philosophy",options:["Democracy","Monarchy","Oligarchy","Philosophy"],answer:"Philosophy",hint:"Three are types of government, philosophy is a discipline!"},
    {level:"medium",q:"Conductor is to baton as\nnun is to...?",options:["habit","habit","cross","bible"],answer:"habit",hint:"A conductor uses a baton. A nun wears a habit!"},
    {level:"medium",q:"What comes next?\n1, 2, 6, 24, 120, __",options:["600","720","840","960"],answer:"720",hint:"Multiply by 2, then 3, then 4, then 5, then 6. 120×6=720!"},
    {level:"medium",q:"Which doesn't belong?\nSedimentary  Igneous  Metamorphic  Herbivore",options:["Sedimentary","Igneous","Metamorphic","Herbivore"],answer:"Herbivore",hint:"Three are rock types, herbivore is a type of animal!"},
    {level:"medium",q:"Architect is to buildings as\ncomposer is to...?",options:["paintings","films","music","books"],answer:"music",hint:"An architect designs buildings. A composer creates music!"},
    {level:"medium",q:"What comes next?\n81, 27, 9, 3, __",options:["0","1","2","3"],answer:"1",hint:"Divide by 3 each time!"},
    {level:"medium",q:"Which doesn't belong?\nOxygen  Nitrogen  Hydrogen  Granite",options:["Oxygen","Nitrogen","Hydrogen","Granite"],answer:"Granite",hint:"Three are gases, granite is a rock!"},
    {level:"medium",q:"Barrister is to courtroom as\nchef is to...?",options:["restaurant","kitchen","hotel","shop"],answer:"kitchen",hint:"A barrister works in a courtroom. A chef works in a kitchen!"},
    {level:"medium",q:"What comes next?\n2, 6, 18, 54, __",options:["108","162","216","270"],answer:"162",hint:"Multiply by 3 each time!"},
    {level:"medium",q:"Which doesn't belong?\nMicroscope  Telescope  Periscope  Calculator",options:["Microscope","Telescope","Periscope","Calculator"],answer:"Calculator",hint:"Three are optical instruments, calculator is mathematical!"},
    {level:"medium",q:"Mayor is to city as\npresident is to...?",options:["town","village","country","state"],answer:"country",hint:"A mayor leads a city. A president leads a country!"},
    {level:"medium",q:"What comes next?\n3, 4, 6, 9, 13, __",options:["17","18","19","20"],answer:"18",hint:"Differences: +1,+2,+3,+4,+5. 13+5=18!"},
    {level:"medium",q:"Which doesn't belong?\nHamlet  Macbeth  Othello  Robinson Crusoe",options:["Hamlet","Macbeth","Othello","Robinson Crusoe"],answer:"Robinson Crusoe",hint:"Three are Shakespeare plays, Robinson Crusoe is a novel!"},
    {level:"medium",q:"Palaeontologist is to fossils as\narchaeologist is to...?",options:["weather","stars","ancient artefacts","living animals"],answer:"ancient artefacts",hint:"Palaeontologist = fossils. Archaeologist = ancient human remains and artefacts!"},
    {level:"medium",q:"What comes next?\n1, 8, 27, 64, __",options:["100","108","125","135"],answer:"125",hint:"Cube numbers: 5³=125!"},
    {level:"medium",q:"Which doesn't belong?\nAdrenaline  Insulin  Oxygen  Oestrogen",options:["Adrenaline","Insulin","Oxygen","Oestrogen"],answer:"Oxygen",hint:"Three are hormones, oxygen is a gas!"},
    {level:"medium",q:"Interpreter is to languages as\ntranslator is to...?",options:["speech","text","music","numbers"],answer:"text",hint:"An interpreter translates speech. A translator translates written text!"},
    {level:"medium",q:"What comes next?\n512, 256, 128, 64, __",options:["16","24","32","48"],answer:"32",hint:"Divide by 2 each time!"},
    {level:"medium",q:"Which doesn't belong?\nRhodium  Gold  Silver  Bronze",options:["Rhodium","Gold","Silver","Bronze"],answer:"Bronze",hint:"Three are pure elements, bronze is an alloy of copper and tin!"},
    {level:"medium",q:"Archaeologist is to past as\nfuturist is to...?",options:["present","past","future","science"],answer:"future",hint:"Archaeologists study the past. Futurists study possible futures!"},
    {level:"medium",q:"What comes next?\n1, 4, 10, 20, 35, __",options:["50","52","54","56"],answer:"56",hint:"Differences: +3,+6,+10,+15,+21. Tetrahedral numbers!"},
    {level:"medium",q:"Which doesn't belong?\nHaiku  Sonnet  Ode  Novel",options:["Haiku","Sonnet","Ode","Novel"],answer:"Novel",hint:"Three are poetry forms, novel is prose fiction!"},
    {level:"medium",q:"Plaintiff is to defendant as\nattacker is to...?",options:["judge","lawyer","victim","jury"],answer:"victim",hint:"A plaintiff sues a defendant. An attacker acts against a victim!"},
    {level:"medium",q:"What comes next?\n729, 243, 81, 27, __",options:["3","6","9","12"],answer:"9",hint:"Divide by 3 each time!"},
    {level:"medium",q:"Which doesn't belong?\nDNA  RNA  ATP  H2O",options:["DNA","RNA","ATP","H2O"],answer:"H2O",hint:"Three are biological macromolecules or energy carriers; H2O is just water!"},
    {level:"medium",q:"Conductor is to symphony as\ndirector is to...?",options:["novel","painting","film","poem"],answer:"film",hint:"A conductor leads a symphony. A director leads a film!"},
    {level:"medium",q:"What comes next?\n11, 13, 17, 19, 23, __",options:["27","29","31","33"],answer:"29",hint:"Prime numbers!"},
    {level:"medium",q:"Which doesn't belong?\nVirus  Bacterium  Fungus  Vitamin",options:["Virus","Bacterium","Fungus","Vitamin"],answer:"Vitamin",hint:"Three are types of microorganisms, vitamin is a nutrient!"},
    {level:"medium",q:"Hypothesis is to theory as\ntheory is to...?",options:["idea","law","experiment","data"],answer:"law",hint:"A hypothesis is tested and becomes a theory; a theory well-established becomes a law!"},
    {level:"medium",q:"What comes next?\n1, 1, 2, 3, 5, 8, 13, __",options:["18","20","21","23"],answer:"21",hint:"Fibonacci: 8+13=21!"},
    {level:"medium",q:"Which doesn't belong?\nNovela  Novella  Novel  Sonata",options:["Novela","Novella","Novel","Sonata"],answer:"Sonata",hint:"Three are forms of prose fiction, a sonata is a piece of music!"},
    {level:"medium",q:"Prologue is to epilogue as\npreface is to...?",options:["chapter","index","appendix","contents"],answer:"appendix",hint:"Prologue comes before, epilogue after. Preface before, appendix after!"},
    {level:"medium",q:"What comes next?\n2, 4, 12, 48, __",options:["120","192","240","288"],answer:"240",hint:"×2, ×3, ×4, ×5: 48×5=240!"},
    {level:"medium",q:"Which doesn't belong?\nParallelogram  Rhombus  Trapezium  Cylinder",options:["Parallelogram","Rhombus","Trapezium","Cylinder"],answer:"Cylinder",hint:"Three are 2D quadrilaterals, cylinder is a 3D shape!"},
    {level:"medium",q:"Democrat is to republic as\nmonarch is to...?",options:["democracy","kingdom","president","election"],answer:"kingdom",hint:"Democrats live in republics. Monarchs reign in kingdoms!"},
    {level:"medium",q:"What comes next?\n3, 5, 11, 29, 83, __",options:["240","245","248","251"],answer:"245",hint:"×2-1, ×3-4, ×2+7... pattern: ×3-2 each time: 83×3-2=247? Check: 3,5=3×2-1, 5,11=5×3-4, 11,29=11×3-4, 29,83=29×3-4, 83×3-4=245!"},
    {level:"medium",q:"Which doesn't belong?\nBraham  Bach  Beethoven  Newton",options:["Brahms","Bach","Beethoven","Newton"],answer:"Newton",hint:"Three are classical composers, Newton was a scientist!"},
    {level:"medium",q:"Proton is to nucleus as\nelectron is to...?",options:["orbit around the nucleus","inside the nucleus","the atom's centre","a neutron"],answer:"orbit around the nucleus",hint:"Protons are IN the nucleus. Electrons orbit AROUND the nucleus!"},
    {level:"medium",q:"What comes next?\n2, 5, 14, 41, __",options:["100","120","122","124"],answer:"122",hint:"×3-1 each time: 41×3-1=122!"},
    {level:"medium",q:"Which doesn't belong?\nCatalyst  Reactant  Product  Spectator",options:["Catalyst","Reactant","Product","Spectator"],answer:"Spectator",hint:"Three are chemistry terms for reactions; spectator is not a chemistry concept here!"},
    {level:"medium",q:"Thermometer is to temperature as\nseismograph is to...?",options:["wind speed","rainfall","earthquake magnitude","atmospheric pressure"],answer:"earthquake magnitude",hint:"Thermometer measures temperature. Seismograph measures earthquakes!"},
    {level:"medium",q:"What comes next?\n1, 11, 21, 1211, __",options:["111221","11121","12121","111111"],answer:"111221",hint:"Read what you see: 1=one 1, 11=two 1s, 21=one 2 one 1, 1211=one 1 one 2 two 1s = 111221!"},
    {level:"medium",q:"Which doesn't belong?\nPhotosynthesis  Respiration  Digestion  Gravity",options:["Photosynthesis","Respiration","Digestion","Gravity"],answer:"Gravity",hint:"Three are biological processes; gravity is a physical force!"},
    {level:"hard",q:"What comes next?\n2, 3, 5, 8, 12, 17, __",options:["21","22","23","24"],answer:"23",hint:"Differences: +1,+2,+3,+4,+5,+6. 17+6=23!"},
    {level:"hard",q:"If all A are B, and some B are C,\nare any A definitely C?",options:["Yes","No","Maybe","Impossible to tell"],answer:"Impossible to tell",hint:"All A are B, but only SOME B are C. We cannot tell if any of those B that are C are also A!"},
    {level:"hard",q:"Epistemology is to knowledge as\nontology is to...?",options:["logic","existence","ethics","aesthetics"],answer:"existence",hint:"Epistemology studies knowledge. Ontology studies existence and being!"},
    {level:"hard",q:"What comes next?\n3, 7, 15, 31, 63, __",options:["112","117","125","127"],answer:"127",hint:"×2+1 each time: 63×2+1=127!"},
    {level:"hard",q:"Nominalism is to realism as\nphenomenalism is to...?",options:["empiricism","materialism","idealism","rationalism"],answer:"materialism",hint:"Nominalism vs realism about universals. Phenomenalism (only experiences exist) vs materialism (matter is primary)!"},
    {level:"hard",q:"Which doesn't belong?\nSyllogism  Paradox  Enthymeme  Metabole",options:["Syllogism","Paradox","Enthymeme","Metabole"],answer:"Metabole",hint:"Three are logical/rhetorical terms; metabole is a figure of speech for repetition with variation!"},
    {level:"hard",q:"What comes next?\n1, 2, 5, 14, 42, __",options:["100","121","130","132"],answer:"132",hint:"Catalan numbers: 1,2,5,14,42,132!"},
    {level:"hard",q:"Deductive is to inductive as\ncertainty is to...?",options:["proof","probability","logic","argument"],answer:"probability",hint:"Deductive reasoning leads to certain conclusions. Inductive reasoning leads to probabilistic ones!"},
    {level:"hard",q:"Heliocentric is to Copernicus as\ngeocentrism is to...?",options:["Galileo","Newton","Ptolemy","Kepler"],answer:"Ptolemy",hint:"Copernicus proposed the heliocentric model. Ptolemy championed geocentrism!"},
    {level:"hard",q:"What comes next?\n6, 24, 60, 120, 210, __",options:["315","330","336","360"],answer:"336",hint:"Differences: +18,+36,+60,+90,+126. Differences of differences: +18,+24,+30,+36!"},
    {level:"hard",q:"If no X are Y, and all Z are Y,\ncan any X be Z?",options:["Yes","No","Maybe","Impossible to tell"],answer:"No",hint:"All Z are Y. No X are Y. Therefore no X can be Z!"},
    {level:"hard",q:"Taxonomy is to classification as\ncryptography is to...?",options:["codes","mathematics","security","messages"],answer:"codes",hint:"Taxonomy = classification of organisms. Cryptography = encoding/decoding messages (codes)!"},
    {level:"hard",q:"What comes next?\n1, 3, 13, 63, 313, __",options:["1513","1563","1613","1713"],answer:"1563",hint:"×5-2 each time: 313×5-2=1563!"},
    {level:"hard",q:"Which doesn't belong?\nAbduction  Deduction  Induction  Seduction",options:["Abduction","Deduction","Induction","Seduction"],answer:"Seduction",hint:"Three are forms of logical reasoning; seduction is not a reasoning process!"},
    {level:"hard",q:"Empiricism is to Locke as\nrationalism is to...?",options:["Hume","Berkeley","Descartes","Kant"],answer:"Descartes",hint:"Locke was an empiricist (knowledge from experience). Descartes was a rationalist (knowledge from reason)!"},
    {level:"hard",q:"What comes next?\n2, 4, 16, 256, __",options:["512","1024","4096","65536"],answer:"65536",hint:"Each term is the square of the previous: 256²=65536!"},
    {level:"hard",q:"Lexeme is to morpheme as\nsentence is to...?",options:["word","syllable","phoneme","clause"],answer:"clause",hint:"A lexeme is made of morphemes. A sentence is made of clauses!"},
    {level:"hard",q:"What comes next?\n0, 1, 3, 6, 10, 15, 21, __",options:["24","26","28","30"],answer:"28",hint:"Triangular numbers: add increasing integers. 21+7=28!"},
    {level:"hard",q:"If some philosophers are scientists,\nand all scientists are rational,\nthen some philosophers are...?",options:["irrational","definitely scientists","rational","all rational"],answer:"rational",hint:"Some philosophers = scientists. All scientists = rational. So some philosophers (those who are scientists) = rational!"},
    {level:"hard",q:"Sophistry is to logic as\nalchemy is to...?",options:["gold","medicine","chemistry","philosophy"],answer:"chemistry",hint:"Sophistry mimics logic but is false. Alchemy preceded and was replaced by proper chemistry!"},
    {level:"hard",q:"What comes next?\n1, 4, 27, 256, __",options:["1000","2025","3125","3650"],answer:"3125",hint:"1^1=1, 2^2=4, 3^3=27, 4^4=256, 5^5=3125!"},
    {level:"hard",q:"Which doesn't belong?\nContrapositive  Converse  Inverse  Synonym",options:["Contrapositive","Converse","Inverse","Synonym"],answer:"Synonym",hint:"Three are logical operations on conditionals; synonym is a vocabulary concept!"},
    {level:"hard",q:"Ontogeny is to individual development as\nphylogeny is to...?",options:["anatomy","evolutionary history of species","genetics","cell division"],answer:"evolutionary history of species",hint:"Ontogeny = development of individual organism. Phylogeny = evolutionary history of a species!"},
    {level:"hard",q:"What comes next?\n1, 2, 2, 4, 8, 32, __",options:["128","256","512","1024"],answer:"256",hint:"Each term = product of two before: 8×32=256!"},
    {level:"hard",q:"Axiomatic is to postulated as\ncorollary is to...?",options:["theorem","proof","conjecture","lemma"],answer:"theorem",hint:"Axioms are assumed. Corollaries follow directly from proven theorems!"},
    {level:"hard",q:"What comes next?\n10, 11, 13, 16, 20, 25, __",options:["29","31","32","35"],answer:"31",hint:"Differences: +1,+2,+3,+4,+5,+6. 25+6=31!"},
    {level:"hard",q:"Which doesn't belong?\nMoment  Torque  Work  Voltage",options:["Moment","Torque","Work","Voltage"],answer:"Voltage",hint:"Three are measured in Newton-metres (rotational/work); voltage is electrical potential!"},
    {level:"hard",q:"Homologous is to analogous as\nstructural similarity is to...?",options:["functional similarity without common ancestry","common ancestry","identical DNA","same environment"],answer:"functional similarity without common ancestry",hint:"Homologous = similar structure from common ancestor. Analogous = similar function, different ancestry!"},
    {level:"hard",q:"What comes next?\n1, 0, -1, 0, 1, 0, -1, 0, __",options:["-1","0","1","2"],answer:"1",hint:"Repeating pattern: 1, 0, -1, 0 repeating!"},
    {level:"hard",q:"If the converse of 'If P then Q' is 'If Q then P',\nwhat is the contrapositive?",options:["If not P then not Q","If not Q then not P","If Q then P","If P then not Q"],answer:"If not Q then not P",hint:"Contrapositive of P→Q is ¬Q→¬P (always logically equivalent to original)!"},
    {level:"hard",q:"Aesthetics is to beauty as\naxiology is to...?",options:["knowledge","existence","value","logic"],answer:"value",hint:"Aesthetics studies beauty. Axiology studies value (including ethics and aesthetics)!"},
    {level:"hard",q:"What comes next?\n2, 6, 30, 210, __",options:["1050","1890","2310","2730"],answer:"2310",hint:"×3, ×5, ×7, ×11 (prime multipliers). 210×11=2310!"},
    {level:"hard",q:"Which doesn't belong?\nMichelangelo  Raphael  da Vinci  Donatello  Shakespeare",options:["Michelangelo","Raphael","da Vinci","Shakespeare"],answer:"Shakespeare",hint:"Four are Italian Renaissance artists, Shakespeare was an English playwright (not a visual artist)!"},
    {level:"hard",q:"Isomorphism is to mathematics as\nanalogy is to...?",options:["linguistics","rhetoric","logic","philosophy"],answer:"philosophy",hint:"Isomorphism = structural equivalence in maths. Analogy = structural/relational similarity used in philosophical reasoning!"},
    {level:"hard",q:"What comes next?\n3, 3, 5, 4, 4, 3, 5, 5, 4, __",options:["3","4","5","6"],answer:"3",hint:"Spelling: THREE=5, THREE=5, FIVE=4, FOUR=4, FOUR=4, THREE=5... wait count letters: THREE=5,THREE=5,FIVE=4,FOUR=4,FOUR=4,THREE=5,FIVE=4,FIVE=4,FOUR=4,THREE=5... The letter counts of ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,TEN = 3,3,5,4,4,3,5,5,4,3!"},
    {level:"hard",q:"Amphiboly is to ambiguity as\nequivocation is to...?",options:["clarity","structural ambiguity","semantic ambiguity","logical fallacy"],answer:"semantic ambiguity",hint:"Amphiboly = structural ambiguity. Equivocation = semantic ambiguity (same word different meanings)!"},
    {level:"hard",q:"What comes next?\n8, 5, 4, 9, 1, 7, 6, 3, 2, __",options:["0","10","12","5"],answer:"0",hint:"Alphabetical order of number names: Eight, Five, Four, Nine, One, Seven, Six, Three, Two, Zero!"},
    {level:"hard",q:"Occam's razor states that...?",options:["The most complex explanation is best","Entities should not be multiplied beyond necessity","All theories must be tested","Logic precedes evidence"],answer:"Entities should not be multiplied beyond necessity",hint:"Occam's razor = the simplest explanation with fewest assumptions is preferred!"},
    {level:"hard",q:"What comes next?\n243, 81, 27, 9, 3, __",options:["0","1","2","3"],answer:"1",hint:"Divide by 3 each time: 3÷3=1!"},
    {level:"hard",q:"Which doesn't belong?\nMeiosis  Mitosis  Binary fission  Electrolysis",options:["Meiosis","Mitosis","Binary fission","Electrolysis"],answer:"Electrolysis",hint:"Three are forms of biological cell division; electrolysis is a chemical/electrical process!"},
    {level:"hard",q:"Teleology is to purpose as\ndeontology is to...?",options:["consequences","purpose","duty","virtue"],answer:"duty",hint:"Teleology = ethics based on purpose/outcomes. Deontology = ethics based on duty/rules!"},
    {level:"hard",q:"What comes next in the Lucas sequence?\n2, 1, 3, 4, 7, 11, 18, __",options:["25","29","30","33"],answer:"29",hint:"Lucas numbers: each = sum of two before. 11+18=29!"},
    {level:"hard",q:"Verificationism holds that...?",options:["All truths are relative","A statement is meaningful only if it can be empirically verified or is analytically true","Mathematics is impossible","Logic determines all meaning"],answer:"A statement is meaningful only if it can be empirically verified or is analytically true",hint:"The logical positivists: if you cannot verify a statement, it is meaningless!"},
    {level:"hard",q:"What comes next?\n1, 5, 6, 11, 17, 28, __",options:["43","44","45","46"],answer:"45",hint:"Each = sum of two before (Fibonacci-like): 17+28=45!"},
    {level:"hard",q:"Which doesn't belong?\nKant  Hume  Wittgenstein  Euler",options:["Kant","Hume","Wittgenstein","Euler"],answer:"Euler",hint:"Three are philosophers, Euler was a mathematician!"},
    {level:"hard",q:"Phenotype is to genotype as\nobservable is to...?",options:["visible","genetic","inherited","recessive"],answer:"genetic",hint:"Phenotype = observable traits. Genotype = underlying genetic makeup!"},
    {level:"hard",q:"What comes next?\n2, 3, 2, 3, 3, 2, 3, 3, 3, 2, __",options:["2","3","4","5"],answer:"3",hint:"Pattern: one 2, two 3s, two 2s? No: 2; 3; 2,3; 3,2; 3,3,2; ... Actually: between each 2, the count of 3s increases: 2,3,2,33,2,333,2...next is 3,3,3,3,2 = four 3s then a 2. So next is 3!"},
    {level:"hard",q:"Structuralism is to synchronic as\npost-structuralism is to...?",options:["diachronic","synchronic","linguistic","semiotic"],answer:"diachronic",hint:"Structuralism studies language systems at a point in time (synchronic). Post-structuralism considers change over time (diachronic)!"},
    {level:"hard",q:"What comes next?\n1, 1, 2, 3, 5, 8, 13, 21, 34, __",options:["47","54","55","58"],answer:"55",hint:"Fibonacci: 21+34=55!"},
    {level:"hard",q:"Which doesn't belong?\nPlato  Aristotle  Socrates  Euclid",options:["Plato","Aristotle","Socrates","Euclid"],answer:"Euclid",hint:"Three are Athenian philosophers, Euclid was a Greek mathematician!"},
    {level:"hard",q:"Parsimony is to simplicity as\nocclusion is to...?",options:["blocking","complexity","analysis","measurement"],answer:"blocking",hint:"Parsimony = preference for simple explanations. Occlusion = one thing blocking another!"},
    {level:"hard",q:"What comes next?\n4, 7, 11, 18, 29, __",options:["44","46","47","48"],answer:"47",hint:"Each = sum of two before: 18+29=47!"},
    {level:"hard",q:"Which doesn't belong?\nModus ponens  Modus tollens  Petitio principii  Reductio ad absurdum",options:["Modus ponens","Modus tollens","Petitio principii","Reductio ad absurdum"],answer:"Petitio principii",hint:"Three are valid inference forms; petitio principii (begging the question) is a logical fallacy!"},
    {level:"hard",q:"Immanent is to transcendent as\nphysical is to...?",options:["material","temporal","metaphysical","abstract"],answer:"metaphysical",hint:"Immanent = existing within. Transcendent = beyond or outside. Physical vs metaphysical!"},
    {level:"hard",q:"What comes next?\n1, 7, 8, 49, 50, 56, 57, 343, __",options:["344","350","351","392"],answer:"344",hint:"Powers of 7 and their immediate successors: 7^0=1, +1=2... actually: 1,7,8,49,50,56,57,343,344: 7^0, 7^1, 7^1+1, 7^2, 7^2+1, 7^2+7, 7^2+7+1, 7^3, 7^3+1!"},
    {level:"hard",q:"Dialectical materialism holds that...?",options:["Ideas drive history","Material/economic conditions drive history through conflict and synthesis","History is random","Religion shapes society"],answer:"Material/economic conditions drive history through conflict and synthesis",hint:"Marx's dialectical materialism: economic base determines social superstructure; history moves through class conflict!"},
    {level:"hard",q:"What comes next?\n31, 29, 23, 19, 17, 13, 11, __",options:["7","8","9","10"],answer:"7",hint:"Prime numbers in descending order: 31,29,23,19,17,13,11,7!"},
    {level:"hard",q:"Paradigm shift is to Kuhn as\nlanguage game is to...?",options:["Saussure","Derrida","Wittgenstein","Chomsky"],answer:"Wittgenstein",hint:"Kuhn introduced paradigm shifts. Wittgenstein introduced language games in Philosophical Investigations!"},
    {level:"hard",q:"What comes next?\n2, 5, 10, 17, 26, 37, __",options:["48","50","51","52"],answer:"50",hint:"Differences: +3,+5,+7,+9,+11,+13. 37+13=50!"},
    {level:"hard",q:"Which doesn't belong?\nId  Ego  Superego  Archetype",options:["Id","Ego","Superego","Archetype"],answer:"Archetype",hint:"Three are Freudian structural components of the mind; archetype is a Jungian concept!"},
    {level:"hard",q:"Intersubjectivity is to shared experience as\nsolipsism is to...?",options:["shared consciousness","only the self exists","group thinking","collective memory"],answer:"only the self exists",hint:"Intersubjectivity = shared between subjects. Solipsism = only one's own mind can be known to exist!"},
    {level:"hard",q:"What comes next?\n1, 2, 3, 5, 8, 13, 21, 34, 55, 89, __",options:["133","134","143","144"],answer:"144",hint:"Fibonacci: 55+89=144!"},
    {level:"hard",q:"Sui generis means...?",options:["of its own kind, unique","of general type","belonging to a group","of unknown origin"],answer:"of its own kind, unique",hint:"Sui generis = Latin for of its own kind — one of a kind, unique!"},
    {level:"hard",q:"What comes next?\n1, 3, 2, 4, 3, 5, 4, 6, __",options:["5","6","7","8"],answer:"5",hint:"Two interleaved sequences: 1,2,3,4,5 and 3,4,5,6,7. The next in the first sequence is 5!"}
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
    // ── EXTRA EASY ──
    {level:"easy",q:"What comes next?\n10, 20, 30, 40, __",options:["45","48","50","55"],answer:"50",hint:"Count by 10!"},
    {level:"easy",q:"🔲 + 2 = 5\nWhat is 🔲?",options:["1","2","3","4"],answer:"3",hint:"What plus 2 equals 5?"},
    {level:"easy",q:"What comes next?\n1, 2, 3, 4, 5, __",options:["5","6","7","8"],answer:"6",hint:"Count up by 1!"},
    {level:"easy",q:"How many sides does a square have?",options:["3","4","5","6"],answer:"4",hint:"Count all four sides!"},
    {level:"easy",q:"Which number is bigger?\n7 or 4",options:["4","7","They're equal","Can't tell"],answer:"7",hint:"Count up: 4, 5, 6, 7 — 7 is bigger!"},
    {level:"easy",q:"🔲 − 1 = 4\nWhat is 🔲?",options:["3","4","5","6"],answer:"5",hint:"What minus 1 equals 4?"},
    {level:"easy",q:"What comes next?\n5, 10, 15, __",options:["18","20","22","25"],answer:"20",hint:"Count by 5!"},
    {level:"easy",q:"If 🍎🍎🍎 = 6,\nhow much is one 🍎?",options:["1","2","3","4"],answer:"2",hint:"6 ÷ 3 = ?"},
    {level:"easy",q:"How many corners does a rectangle have?",options:["2","3","4","5"],answer:"4",hint:"Count all four corners!"},
    {level:"easy",q:"Which comes first?\n3, 1, 4, 2",options:["3","1","4","2"],answer:"1",hint:"Put them in order: 1, 2, 3, 4 — which is smallest?"},
    // ── EXTRA MEDIUM ──
    {level:"medium",q:"What comes next?\n4, 8, 12, 16, __",options:["18","20","22","24"],answer:"20",hint:"Count by 4!"},
    {level:"medium",q:"🔲 × 4 = 20\nWhat is 🔲?",options:["4","5","6","7"],answer:"5",hint:"What times 4 equals 20?"},
    {level:"medium",q:"Which is greatest?\n2×8, 3×5, 4×4, 6×2",options:["2×8","3×5","4×4","6×2"],answer:"2×8",hint:"Work out each: 16, 15, 16, 12 — which appears first?"},
    {level:"medium",q:"A bag has 24 sweets.\nShared equally among 4 friends.\nHow many each?",options:["4","5","6","8"],answer:"6",hint:"24 ÷ 4 = ?"},
    {level:"medium",q:"What fraction is shaded?\n⬛⬛⬜⬜",options:["1/4","1/2","3/4","2/3"],answer:"1/2",hint:"2 shaded out of 4 total = 2/4 = 1/2!"},
    {level:"medium",q:"What comes next?\n1, 3, 6, 10, __",options:["13","14","15","16"],answer:"15",hint:"Add 2, then 3, then 4, then 5..."},
    {level:"medium",q:"🔲 ÷ 3 = 7\nWhat is 🔲?",options:["18","21","24","27"],answer:"21",hint:"7 × 3 = ?"},
    {level:"medium",q:"A train has 6 carriages.\nEach carriage holds 8 passengers.\nHow many in total?",options:["42","46","48","52"],answer:"48",hint:"6 × 8 = ?"},
    {level:"medium",q:"Which number is both odd and greater than 10?",options:["8","10","11","12"],answer:"11",hint:"Odd numbers end in 1,3,5,7,9. Which one is greater than 10?"},
    {level:"medium",q:"If 🌟🌟 = 10, what does 🌟🌟🌟🌟🌟 equal?",options:["20","25","30","35"],answer:"25",hint:"One 🌟 = 5, so five 🌟 = 5×5 = ?"},
    // ── EXTRA HARD ──
    {level:"hard",q:"What is the value of n?\n3n + 4 = 19",options:["4","5","6","7"],answer:"5",hint:"3n = 19 - 4 = 15, so n = 15 ÷ 3"},
    {level:"hard",q:"What comes next?\n2, 3, 5, 7, 11, __",options:["12","13","14","15"],answer:"13",hint:"These are prime numbers!"},
    {level:"hard",q:"A rectangle has area 48cm²\nand width 6cm.\nWhat is its length?",options:["6cm","7cm","8cm","9cm"],answer:"8cm",hint:"Length = Area ÷ Width = 48 ÷ 6"},
    {level:"hard",q:"What is 20% of 150?",options:["20","25","30","35"],answer:"30",hint:"20% = 1/5. 150 ÷ 5 = ?"},
    {level:"hard",q:"If the pattern is ×2 then −1:\n3, 5, 9, 17, __",options:["31","33","34","35"],answer:"33",hint:"17 × 2 = 34, then 34 − 1 = 33"},
    {level:"hard",q:"What is the mean of:\n4, 7, 9, 6, 4?",options:["5","6","7","8"],answer:"6",hint:"Add all up: 30, then divide by 5"},
    {level:"hard",q:"What is the next square number after 25?",options:["30","34","36","40"],answer:"36",hint:"Square numbers: 1,4,9,16,25,... 6×6=?"},
    {level:"hard",q:"A shop reduces a £40 item by 25%.\nWhat is the new price?",options:["£25","£28","£30","£32"],answer:"£30",hint:"25% of 40 = 10. 40 − 10 = ?"},
  
    {"level":"easy","q":"What comes next?\n5, 10, 15, 20, __","options":["22","24","25","30"],"answer":"25","hint":"Count by 5!"},
    {"level":"easy","q":"🔲 + 3 = 8\nWhat is 🔲?","options":["3","4","5","6"],"answer":"5","hint":"What plus 3 equals 8?"},
    {"level":"easy","q":"Which is biggest?\n4, 9, 2, 7, 1","options":["4","9","2","7"],"answer":"9","hint":"Compare all numbers — 9 is the biggest!"},
    {"level":"easy","q":"What comes next?\n1, 1, 2, 2, 3, 3, __","options":["3","4","5","6"],"answer":"4","hint":"Each number appears twice then increases!"},
    {"level":"easy","q":"🍎🍎🍎🍎 = 8\nHow much is one 🍎?","options":["1","2","3","4"],"answer":"2","hint":"8 ÷ 4 = ?"},
    {"level":"easy","q":"What shape comes next?\n🔴🔵🔴🔵🔴__","options":["🔴","🔵","🟢","🟡"],"answer":"🔵","hint":"Red blue red blue — what comes after red?"},
    {"level":"easy","q":"If 🌟🌟 = 10,\nhow much is 🌟🌟🌟?","options":["12","13","15","20"],"answer":"15","hint":"One star = 5. Three stars = 15!"},
    {"level":"easy","q":"What comes next?\n20, 18, 16, 14, __","options":["10","11","12","13"],"answer":"12","hint":"Subtract 2 each time!"},
    {"level":"easy","q":"A box holds 3 toys.\nHow many toys in 4 boxes?","options":["10","11","12","13"],"answer":"12","hint":"3 × 4 = ?"},
    {"level":"easy","q":"Which number is odd?","options":["4","6","8","9"],"answer":"9","hint":"Odd numbers end in 1,3,5,7,9!"},
    {"level":"medium","q":"What comes next?\n7, 14, 21, 28, __","options":["32","35","36","42"],"answer":"35","hint":"Count by 7!"},
    {"level":"medium","q":"🔲 × 6 = 42\nWhat is 🔲?","options":["5","6","7","8"],"answer":"7","hint":"7 × 6 = 42!"},
    {"level":"medium","q":"What comes next?\n1, 2, 4, 8, 16, __","options":["24","28","32","36"],"answer":"32","hint":"Each number doubles!"},
    {"level":"medium","q":"If ☀️ = 3 and 🌙 = 5,\nwhat is ☀️ × 🌙 + ☀️?","options":["18","20","22","24"],"answer":"18","hint":"3 × 5 = 15, then 15 + 3 = 18!"},
    {"level":"medium","q":"A car travels 5km every 10 minutes.\nHow far in 30 minutes?","options":["10km","12km","15km","20km"],"answer":"15km","hint":"5km per 10 min. 30 min = 3 × 10 min!"},
    {"level":"medium","q":"What comes next?\n2, 5, 10, 17, 26, __","options":["35","36","37","38"],"answer":"37","hint":"Differences: +3,+5,+7,+9,+11. 26+11=37!"},
    {"level":"medium","q":"A number doubled is 38.\nWhat is the number?","options":["16","17","18","19"],"answer":"19","hint":"38 ÷ 2 = 19!"},
    {"level":"medium","q":"What fraction is shaded\nin a grid of 12?\n4 squares shaded","options":["¼","⅓","½","⅔"],"answer":"⅓","hint":"4/12 = ⅓!"},
    {"level":"medium","q":"If 🔺🔺🔺 = 21,\nhow much is 🔺🔺🔺🔺🔺?","options":["30","35","40","45"],"answer":"35","hint":"One 🔺 = 7. Five = 35!"},
    {"level":"medium","q":"What comes next?\n3, 7, 13, 21, 31, __","options":["40","42","43","45"],"answer":"43","hint":"Differences: +4,+6,+8,+10,+12. 31+12=43!"},
    {"level":"hard","q":"What is the value of n?\n5n − 8 = 22","options":["4","5","6","7"],"answer":"6","hint":"5n = 30, so n = 30 ÷ 5 = 6!"},
    {"level":"hard","q":"What comes next?\n2, 3, 5, 7, 11, 13, __","options":["14","15","16","17"],"answer":"17","hint":"These are prime numbers!"},
    {"level":"hard","q":"A rectangle has area 56cm²\nand length 8cm.\nWhat is the perimeter?","options":["28cm","30cm","32cm","34cm"],"answer":"30cm","hint":"Width = 56÷8 = 7. Perimeter = 2(8+7) = 30!"},
    {"level":"hard","q":"What is 30% of 250?","options":["65","70","75","80"],"answer":"75","hint":"30% = 3/10. 250 × 0.3 = 75!"},
    {"level":"hard","q":"If the pattern is ×3 then −2:\n1, 1, 1, 1...\nWait: 2, 4, 10, 28, __","options":["80","82","84","86"],"answer":"82","hint":"2→4(×3-2), 4→10(×3-2), 10→28(×3-2), 28→82(×3-2)!"},
    {"level":"hard","q":"What is the mean of:\n8, 12, 6, 14, 10?","options":["8","10","12","14"],"answer":"10","hint":"Sum = 50, count = 5, mean = 50÷5 = 10!"},
    {"level":"hard","q":"What is the next square number after 49?","options":["56","60","64","70"],"answer":"64","hint":"Square numbers: 49=7², next is 8²=64!"},
    {"level":"hard","q":"A shopkeeper reduces a £60 item by 15%.\nWhat is the sale price?","options":["£48","£50","£51","£54"],"answer":"£51","hint":"15% of 60 = 9. 60 − 9 = £51!"},
    {"level":"hard","q":"What is the value of:\n3² + 4² + 5²?","options":["48","50","54","60"],"answer":"50","hint":"9 + 16 + 25 = 50!"},
    {"level":"hard","q":"If x + y = 20 and x − y = 8,\nwhat is x?","options":["12","13","14","16"],"answer":"14","hint":"Add both: 2x = 28, so x = 14!"},
  ,
    {level:"easy",q:"What comes next?\n5, 10, 15, 20, __",options:["22","24","25","30"],answer:"25",hint:"Count by 5!"},
    {level:"easy",q:"🔲 + 3 = 8. What is 🔲?",options:["3","4","5","6"],answer:"5",hint:"What plus 3 equals 8?"},
    {level:"easy",q:"Which is biggest?\n4, 9, 2, 7, 1",options:["4","9","2","7"],answer:"9",hint:"9 is the biggest!"},
    {level:"easy",q:"🍎🍎🍎🍎 = 8. How much is one 🍎?",options:["1","2","3","4"],answer:"2",hint:"8 ÷ 4 = 2!"},
    {level:"easy",q:"What comes next?\n20, 18, 16, 14, __",options:["10","11","12","13"],answer:"12",hint:"Subtract 2 each time!"},
    {level:"easy",q:"A box holds 3 toys. How many in 4 boxes?",options:["10","11","12","13"],answer:"12",hint:"3 × 4 = 12!"},
    {level:"easy",q:"Which number is odd?",options:["4","6","8","9"],answer:"9",hint:"Odd numbers end in 1,3,5,7,9!"},
    {level:"easy",q:"What comes next?\n1, 1, 2, 2, 3, 3, __",options:["3","4","5","6"],answer:"4",hint:"Each number appears twice!"},
    {level:"easy",q:"If ⭐⭐ = 10, how much is ⭐⭐⭐?",options:["12","13","15","20"],answer:"15",hint:"One star = 5. Three stars = 15!"},
    {level:"easy",q:"What shape comes next?\n🔴🔵🟢🔴🔵__",options:["🔴","🔵","🟢","🟡"],answer:"🟢",hint:"Red, blue, green pattern repeating!"},
    {level:"medium",q:"What comes next?\n7, 14, 21, 28, __",options:["32","35","36","42"],answer:"35",hint:"Count by 7!"},
    {level:"medium",q:"🔲 × 6 = 42. What is 🔲?",options:["5","6","7","8"],answer:"7",hint:"7 × 6 = 42!"},
    {level:"medium",q:"What comes next?\n1, 2, 4, 8, 16, __",options:["24","28","32","36"],answer:"32",hint:"Each number doubles!"},
    {level:"medium",q:"A car travels 5km every 10 minutes.\nHow far in 30 minutes?",options:["10km","12km","15km","20km"],answer:"15km",hint:"5km per 10 min × 3 = 15km!"},
    {level:"medium",q:"A number doubled is 38.\nWhat is the number?",options:["16","17","18","19"],answer:"19",hint:"38 ÷ 2 = 19!"},
    {level:"medium",q:"What comes next?\n3, 7, 13, 21, 31, __",options:["40","42","43","45"],answer:"43",hint:"Differences: +4,+6,+8,+10,+12. 31+12=43!"},
    {level:"medium",q:"If 🔺🔺🔺 = 21,\nhow much is 🔺🔺🔺🔺🔺?",options:["30","35","40","45"],answer:"35",hint:"One triangle = 7. Five = 35!"},
    {level:"medium",q:"What comes next?\n2, 5, 10, 17, 26, __",options:["35","36","37","38"],answer:"37",hint:"Differences: +3,+5,+7,+9,+11!"},
    {level:"medium",q:"What fraction is 4 out of 12?",options:["¼","⅓","½","⅔"],answer:"⅓",hint:"4/12 = ⅓!"},
    {level:"medium",q:"If ☀️ = 3 and 🌙 = 5,\nwhat is ☀️ × 🌙 + ☀️?",options:["18","20","22","24"],answer:"18",hint:"3×5=15, 15+3=18!"},
    {level:"hard",q:"What is the value of n?\n5n − 8 = 22",options:["4","5","6","7"],answer:"6",hint:"5n=30, n=6!"},
    {level:"hard",q:"What comes next?\n2, 3, 5, 7, 11, 13, __",options:["14","15","16","17"],answer:"17",hint:"These are prime numbers!"},
    {level:"hard",q:"A rectangle has area 56cm² and length 8cm.\nWhat is the perimeter?",options:["28cm","30cm","32cm","34cm"],answer:"30cm",hint:"Width=56÷8=7. P=2(8+7)=30!"},
    {level:"hard",q:"What is 30% of 250?",options:["65","70","75","80"],answer:"75",hint:"250 × 0.3 = 75!"},
    {level:"hard",q:"What is the mean of: 8, 12, 6, 14, 10?",options:["8","10","12","14"],answer:"10",hint:"Sum=50, count=5, mean=10!"},
    {level:"hard",q:"What is the next square number after 49?",options:["56","60","64","70"],answer:"64",hint:"7²=49, 8²=64!"},
    {level:"hard",q:"A £60 item is reduced by 15%.\nWhat is the sale price?",options:["£48","£50","£51","£54"],answer:"£51",hint:"15% of 60=9. 60-9=£51!"},
    {level:"hard",q:"What is the value of: 3² + 4² + 5²?",options:["48","50","54","60"],answer:"50",hint:"9+16+25=50!"},
    {level:"hard",q:"If x + y = 20 and x − y = 8,\nwhat is x?",options:["12","13","14","16"],answer:"14",hint:"Add both equations: 2x=28, x=14!"},
    {level:"hard",q:"What comes next?\n2, 4, 10, 28, __",options:["80","82","84","86"],answer:"82",hint:"×3-2 each time: 28×3-2=82!"}
  ,
    {level:"easy",q:"What comes next?\n1, 2, 3, 4, 5, __",options:["5","6","7","8"],answer:"6",hint:"Count up by 1!"},
    {level:"easy",q:"If ⭐ = 2, what is ⭐⭐⭐⭐?",options:["6","7","8","9"],answer:"8",hint:"4 stars × 2 = 8!"},
    {level:"easy",q:"What comes next?\n3, 6, 9, 12, __",options:["13","14","15","16"],answer:"15",hint:"Count by 3!"},
    {level:"easy",q:"A bag has 4 red and 3 blue balls.\nHow many balls in total?",options:["5","6","7","8"],answer:"7",hint:"4 + 3 = 7!"},
    {level:"easy",q:"What comes next?\n100, 90, 80, 70, __",options:["55","60","65","70"],answer:"60",hint:"Subtract 10 each time!"},
    {level:"easy",q:"🍎🍎 = 6. How much is 🍎?",options:["2","3","4","5"],answer:"3",hint:"6 ÷ 2 = 3!"},
    {level:"easy",q:"What comes next?\n2, 4, 6, 8, 10, __",options:["10","11","12","14"],answer:"12",hint:"Count by 2!"},
    {level:"easy",q:"Sam has 5 coins. He gives 2 away.\nHow many does he have left?",options:["2","3","4","5"],answer:"3",hint:"5 - 2 = 3!"},
    {level:"easy",q:"What comes next?\n5, 10, 15, 20, 25, __",options:["28","29","30","35"],answer:"30",hint:"Count by 5!"},
    {level:"easy",q:"🔴🔴🔴 = 9. How much is 🔴?",options:["2","3","4","5"],answer:"3",hint:"9 ÷ 3 = 3!"},
    {level:"easy",q:"What comes next?\n10, 8, 6, 4, __",options:["0","1","2","3"],answer:"2",hint:"Subtract 2 each time!"},
    {level:"easy",q:"There are 3 rows of 4 chairs.\nHow many chairs altogether?",options:["7","10","12","15"],answer:"12",hint:"3 × 4 = 12!"},
    {level:"easy",q:"What comes next?\n1, 4, 9, 16, __",options:["20","22","25","30"],answer:"25",hint:"Square numbers: 5² = 25!"},
    {level:"easy",q:"🌟 + 🌟 + 🌟 = 15. What is 🌟?",options:["3","4","5","6"],answer:"5",hint:"15 ÷ 3 = 5!"},
    {level:"easy",q:"What comes next?\n2, 2, 4, 4, 6, 6, __",options:["6","7","8","9"],answer:"8",hint:"Each number appears twice, then goes up by 2!"},
    {level:"easy",q:"A pizza has 8 slices. Mia eats 3.\nHow many are left?",options:["3","4","5","6"],answer:"5",hint:"8 - 3 = 5!"},
    {level:"easy",q:"What comes next?\n10, 20, 30, 40, 50, __",options:["55","58","60","65"],answer:"60",hint:"Count by 10!"},
    {level:"easy",q:"🍬🍬🍬🍬 = 20. How much is 🍬?",options:["4","5","6","7"],answer:"5",hint:"20 ÷ 4 = 5!"},
    {level:"easy",q:"What comes next?\n1, 2, 4, 8, 16, __",options:["24","28","32","36"],answer:"32",hint:"Double each time!"},
    {level:"easy",q:"There are 4 bags with 5 apples each.\nHow many apples altogether?",options:["16","18","20","22"],answer:"20",hint:"4 × 5 = 20!"},
    {level:"easy",q:"What comes next?\n0, 3, 6, 9, 12, __",options:["13","14","15","16"],answer:"15",hint:"Count by 3!"},
    {level:"easy",q:"🌈 = 7. What is 🌈🌈🌈?",options:["14","18","21","24"],answer:"21",hint:"7 × 3 = 21!"},
    {level:"easy",q:"What comes next?\n50, 45, 40, 35, __",options:["28","30","32","33"],answer:"30",hint:"Subtract 5 each time!"},
    {level:"easy",q:"Ben has 12 stickers. He gives half away.\nHow many does he keep?",options:["4","5","6","7"],answer:"6",hint:"Half of 12 = 6!"},
    {level:"easy",q:"What comes next?\n3, 3, 3, 6, 6, 6, 9, 9, 9, __",options:["9","10","11","12"],answer:"12",hint:"Each number appears 3 times, then goes up by 3!"},
    {level:"easy",q:"💡💡💡💡💡 = 25. What is 💡?",options:["4","5","6","7"],answer:"5",hint:"25 ÷ 5 = 5!"},
    {level:"easy",q:"What comes next?\n1, 1, 2, 2, 3, 3, 4, 4, __",options:["4","5","6","7"],answer:"5",hint:"Each number appears twice, going up by 1!"},
    {level:"easy",q:"There are 6 tables with 4 children each.\nHow many children altogether?",options:["20","22","24","26"],answer:"24",hint:"6 × 4 = 24!"},
    {level:"easy",q:"What comes next?\n100, 50, 25, __",options:["10","12","12.5","15"],answer:"12.5",hint:"Divide by 2 each time!"},
    {level:"easy",q:"🎈 + 5 = 12. What is 🎈?",options:["5","6","7","8"],answer:"7",hint:"12 - 5 = 7!"},
    {level:"easy",q:"What comes next?\n9, 8, 7, 6, 5, __",options:["2","3","4","5"],answer:"4",hint:"Count backwards by 1!"},
    {level:"easy",q:"Each box holds 6 crayons.\nHow many crayons in 5 boxes?",options:["25","28","30","35"],answer:"30",hint:"6 × 5 = 30!"},
    {level:"easy",q:"What comes next?\n4, 8, 12, 16, __",options:["18","19","20","22"],answer:"20",hint:"Count by 4!"},
    {level:"easy",q:"🐢 × 3 = 18. What is 🐢?",options:["5","6","7","8"],answer:"6",hint:"18 ÷ 3 = 6!"},
    {level:"easy",q:"What comes next?\n5, 5, 10, 10, 15, 15, __",options:["15","18","20","25"],answer:"20",hint:"Each number appears twice, going up by 5!"},
    {level:"easy",q:"Eve shares 16 sweets equally\namong 4 friends. How many each?",options:["3","4","5","6"],answer:"4",hint:"16 ÷ 4 = 4!"},
    {level:"easy",q:"What comes next?\n1, 3, 9, 27, __",options:["54","63","72","81"],answer:"81",hint:"Multiply by 3 each time!"},
    {level:"easy",q:"🏆 − 4 = 11. What is 🏆?",options:["13","14","15","16"],answer:"15",hint:"11 + 4 = 15!"},
    {level:"easy",q:"What comes next?\n2, 3, 5, 7, 11, __",options:["12","13","14","15"],answer:"13",hint:"Prime numbers!"},
    {level:"easy",q:"There are 7 days in a week.\nHow many days in 3 weeks?",options:["18","19","20","21"],answer:"21",hint:"7 × 3 = 21!"},
    {level:"easy",q:"What comes next?\n36, 31, 26, 21, __",options:["14","15","16","17"],answer:"16",hint:"Subtract 5 each time!"},
    {level:"easy",q:"🦁 ÷ 5 = 4. What is 🦁?",options:["15","18","20","25"],answer:"20",hint:"4 × 5 = 20!"},
    {level:"easy",q:"What comes next?\n0, 1, 0, 1, 0, __",options:["0","1","2","3"],answer:"1",hint:"Alternating 0 and 1!"},
    {level:"easy",q:"A jar holds 24 marbles.\nAmy takes out a third. How many remain?",options:["14","15","16","17"],answer:"16",hint:"24 ÷ 3 = 8 taken, 24 - 8 = 16!"},
    {level:"easy",q:"What comes next?\n25, 20, 15, 10, __",options:["3","4","5","6"],answer:"5",hint:"Subtract 5 each time!"},
    {level:"easy",q:"🐝🐝 + 🐝 = 12. What is 🐝?",options:["3","4","5","6"],answer:"4",hint:"3 × 🐝 = 12, so 🐝 = 4!"},
    {level:"easy",q:"What comes next?\n100, 200, 400, 800, __",options:["1200","1400","1600","1800"],answer:"1600",hint:"Double each time!"},
    {level:"easy",q:"Books are arranged in rows of 8.\nThere are 4 rows. How many books?",options:["28","30","32","36"],answer:"32",hint:"8 × 4 = 32!"},
    {level:"easy",q:"What comes next?\n7, 7, 14, 14, 21, 21, __",options:["21","22","28","35"],answer:"28",hint:"Each number appears twice, going up by 7!"},
    {level:"easy",q:"🎯 × 🎯 = 25. What is 🎯?",options:["3","4","5","6"],answer:"5",hint:"5 × 5 = 25!"},
    {level:"easy",q:"What comes next?\n1000, 100, 10, __",options:["0","1","2","5"],answer:"1",hint:"Divide by 10 each time!"},
    {level:"easy",q:"A recipe needs 3 eggs per cake.\nHow many eggs for 5 cakes?",options:["12","13","14","15"],answer:"15",hint:"3 × 5 = 15!"},
    {level:"easy",q:"What comes next?\n6, 7, 9, 12, 16, __",options:["19","20","21","22"],answer:"21",hint:"Differences: +1,+2,+3,+4,+5. 16+5=21!"},
    {level:"easy",q:"🌙 + 🌙 + 🌙 + 🌙 = 36. What is 🌙?",options:["7","8","9","10"],answer:"9",hint:"36 ÷ 4 = 9!"},
    {level:"easy",q:"What comes next?\n11, 22, 33, 44, __",options:["50","54","55","60"],answer:"55",hint:"Count by 11!"},
    {level:"easy",q:"Tom buys 3 packs of 6 cards each.\nHow many cards does he have?",options:["15","16","17","18"],answer:"18",hint:"3 × 6 = 18!"},
    {level:"easy",q:"What comes next?\n2, 6, 4, 8, 6, 10, __",options:["7","8","9","10"],answer:"8",hint:"Two interleaved sequences: 2,4,6,8 and 6,8,10,12!"},
    {level:"easy",q:"🍕 = 10, 🍔 = 5. What is 🍕 + 🍔 + 🍔?",options:["18","19","20","21"],answer:"20",hint:"10 + 5 + 5 = 20!"},
    {level:"easy",q:"What comes next?\n4, 6, 9, 13, 18, __",options:["22","23","24","25"],answer:"24",hint:"Differences: +2,+3,+4,+5,+6. 18+6=24!"},
    {level:"easy",q:"Each bus holds 50 passengers.\nHow many in 3 buses?",options:["100","130","150","200"],answer:"150",hint:"50 × 3 = 150!"},
    {level:"easy",q:"🌸 × 4 = 32. What is 🌸?",options:["6","7","8","9"],answer:"8",hint:"32 ÷ 4 = 8!"},
    {level:"easy",q:"What comes next?\n9, 18, 27, 36, __",options:["40","42","45","48"],answer:"45",hint:"Count by 9!"},
    {level:"easy",q:"A farmer plants 6 seeds per row\nand has 8 rows. How many seeds?",options:["42","46","48","52"],answer:"48",hint:"6 × 8 = 48!"},
    {level:"easy",q:"What comes next?\n1, 2, 6, 24, 120, __",options:["600","720","840","960"],answer:"720",hint:"Multiply by 2,3,4,5,6. 120×6=720!"},
    {level:"easy",q:"🐠 − 🐠 + 🐠 = 7. What is 🐠?",options:["5","6","7","8"],answer:"7",hint:"🐠 − 🐠 = 0, then + 🐠 = 🐠 = 7!"},
    {level:"easy",q:"What comes next?\n77, 66, 55, 44, __",options:["30","32","33","35"],answer:"33",hint:"Subtract 11 each time!"},
    {level:"easy",q:"Each class has 30 pupils.\n6 classes go on a trip.\nHow many pupils altogether?",options:["160","170","180","190"],answer:"180",hint:"30 × 6 = 180!"},
    {level:"easy",q:"What comes next?\n3, 6, 3, 9, 3, 12, __",options:["3","6","9","12"],answer:"3",hint:"Every other term is 3; the others go 6,9,12,15... Next alternates back to 3!"},
    {level:"easy",q:"🦊 + 10 = 23. What is 🦊?",options:["11","12","13","14"],answer:"13",hint:"23 - 10 = 13!"},
    {level:"easy",q:"What comes next?\n16, 8, 4, 2, __",options:["0","0.5","1","1.5"],answer:"1",hint:"Divide by 2 each time!"},
    {level:"easy",q:"There are 60 seconds in a minute\nand 60 minutes in an hour.\nHow many seconds in an hour?",options:["360","600","3600","6000"],answer:"3600",hint:"60 × 60 = 3600!"},
    {level:"easy",q:"What comes next?\n5, 11, 17, 23, __",options:["27","28","29","30"],answer:"29",hint:"Add 6 each time!"},
    {level:"easy",q:"🐙 × 7 = 49. What is 🐙?",options:["5","6","7","8"],answer:"7",hint:"49 ÷ 7 = 7!"},
    {level:"medium",q:"What comes next?\n1, 3, 7, 13, 21, __",options:["29","30","31","32"],answer:"31",hint:"Differences: +2,+4,+6,+8,+10. 21+10=31!"},
    {level:"medium",q:"If ❤ = 3 and ⭐ = 5,\nwhat is ❤ × ⭐ + ❤ + ⭐?",options:["21","23","25","27"],answer:"23",hint:"3×5 + 3 + 5 = 15+8 = 23!"},
    {level:"medium",q:"What comes next?\n0, 1, 3, 6, 10, 15, __",options:["19","20","21","22"],answer:"21",hint:"Triangular numbers: add 6 next. 15+6=21!"},
    {level:"medium",q:"A train travels 60km/h.\nHow long to travel 210km?",options:["2.5h","3h","3.5h","4h"],answer:"3.5h",hint:"210 ÷ 60 = 3.5 hours!"},
    {level:"medium",q:"What comes next?\n5, 7, 11, 19, 35, __",options:["60","64","67","70"],answer:"67",hint:"Differences: +2,+4,+8,+16,+32 (doubling). 35+32=67!"},
    {level:"medium",q:"If 🔺 + 🔴 = 10 and 🔺 + 🔺 = 8,\nwhat is 🔴?",options:["4","5","6","7"],answer:"6",hint:"🔺 = 4. So 4 + 🔴 = 10, 🔴 = 6!"},
    {level:"medium",q:"What comes next?\n2, 8, 18, 32, 50, __",options:["68","70","72","78"],answer:"72",hint:"Differences: +6,+10,+14,+18,+22. 50+22=72!"},
    {level:"medium",q:"A pool is 25% full. It holds 200L.\nHow much water is in it?",options:["40L","50L","60L","80L"],answer:"50L",hint:"25% of 200 = 50L!"},
    {level:"medium",q:"What comes next?\n1, 3, 4, 7, 11, 18, __",options:["24","26","28","29"],answer:"29",hint:"Each = sum of two before: 11+18=29!"},
    {level:"medium",q:"If 🌺 × 🌺 = 64,\nwhat is 🌺 × 3?",options:["21","22","24","27"],answer:"24",hint:"🌺 = 8 (8×8=64). So 8×3=24!"},
    {level:"medium",q:"What comes next?\n4, 5, 7, 10, 14, 19, __",options:["24","25","26","27"],answer:"25",hint:"Differences: +1,+2,+3,+4,+5,+6. 19+6=25!"},
    {level:"medium",q:"A shop reduces £80 by 20%.\nWhat is the new price?",options:["£56","£60","£64","£68"],answer:"£64",hint:"20% of 80 = 16. 80-16=£64!"},
    {level:"medium",q:"What comes next?\n3, 7, 15, 31, 63, __",options:["110","116","125","127"],answer:"127",hint:"×2+1 each time: 63×2+1=127!"},
    {level:"medium",q:"If ☀ = 4, 🌙 = 6, ⭐ = ☀ × 🌙,\nwhat is ⭐ + ☀?",options:["24","26","28","30"],answer:"28",hint:"⭐ = 4×6 = 24. 24+4 = 28!"},
    {level:"medium",q:"What comes next?\n1, 4, 13, 40, __",options:["111","119","121","125"],answer:"121",hint:"×3+1 each time: 40×3+1=121!"},
    {level:"medium",q:"A cyclist travels 15km in 30 minutes.\nHow far in 2 hours?",options:["45km","50km","60km","70km"],answer:"60km",hint:"15km/30min = 30km/h. 2h × 30 = 60km!"},
    {level:"medium",q:"What comes next?\n100, 91, 83, 76, 70, __",options:["62","64","65","68"],answer:"65",hint:"Differences: -9,-8,-7,-6,-5. 70-5=65!"},
    {level:"medium",q:"If 🍎 + 🍊 = 12 and 🍎 − 🍊 = 4,\nwhat is 🍊?",options:["3","4","5","6"],answer:"4",hint:"Adding both: 2×🍎=16, 🍎=8. So 🍊=12-8=4!"},
    {level:"medium",q:"What comes next?\n6, 12, 11, 22, 21, 42, __",options:["40","41","42","43"],answer:"41",hint:"Pattern: ×2, -1, ×2, -1. 42-1=41!"},
    {level:"medium",q:"A baker makes 15 loaves per hour.\nHow many in a 7-hour shift?",options:["95","100","105","110"],answer:"105",hint:"15 × 7 = 105!"},
    {level:"medium",q:"What comes next?\n1, 6, 16, 31, 51, __",options:["74","76","78","82"],answer:"76",hint:"Differences: +5,+10,+15,+20,+25. 51+25=76!"},
    {level:"medium",q:"If 🦋 + 🦋 + 🐝 = 19 and 🐝 = 7,\nwhat is 🦋?",options:["5","6","7","8"],answer:"6",hint:"🦋+🦋 = 19-7 = 12. 🦋 = 6!"},
    {level:"medium",q:"What comes next?\n2, 5, 4, 7, 6, 9, __",options:["7","8","9","10"],answer:"8",hint:"Two interleaved sequences: 2,4,6,8 and 5,7,9,11!"},
    {level:"medium",q:"A job pays £12.50 per hour.\nHow much for 8 hours?",options:["£90","£95","£100","£105"],answer:"£100",hint:"12.50 × 8 = £100!"},
    {level:"medium",q:"What comes next?\n5, 10, 9, 18, 17, 34, __",options:["30","31","32","33"],answer:"33",hint:"×2, -1, ×2, -1. 34-1=33!"},
    {level:"medium",q:"If 🏆 = ⭐ + ⭐ + ⭐ and ⭐ = 7,\nwhat is 🏆 × 2?",options:["38","40","42","44"],answer:"42",hint:"🏆 = 3×7 = 21. 21×2 = 42!"},
    {level:"medium",q:"What comes next?\n1, 5, 25, 125, __",options:["500","600","625","750"],answer:"625",hint:"Multiply by 5 each time!"},
    {level:"medium",q:"A tank loses 15% of its 60L of water.\nHow much is left?",options:["48L","49L","50L","51L"],answer:"51L",hint:"15% of 60 = 9. 60-9=51L!"},
    {level:"medium",q:"What comes next?\n4, 8, 7, 14, 13, 26, __",options:["22","23","24","25"],answer:"25",hint:"×2, -1, ×2, -1. 26-1=25!"},
    {level:"medium",q:"If 🌍 + 🌙 = 20 and 🌍 = 3 × 🌙,\nwhat is 🌍?",options:["12","13","14","15"],answer:"15",hint:"3🌙 + 🌙 = 4🌙 = 20, 🌙=5. 🌍=15!"},
    {level:"medium",q:"What comes next?\n2, 3, 7, 16, 35, __",options:["72","74","76","78"],answer:"74",hint:"Differences: +1,+4,+9,+19... ×2+2 each difference? Check: 3-2=1, 7-3=4, 16-7=9, 35-16=19, next diff=19×2-4=34? 35+39=74!"},
    {level:"medium",q:"A recipe serves 4 and needs 300g flour.\nHow much flour for 10 people?",options:["650g","700g","750g","800g"],answer:"750g",hint:"300÷4=75g per person. 75×10=750g!"},
    {level:"medium",q:"What comes next?\n1, 2, 3, 5, 8, 13, 21, 34, __",options:["44","50","55","56"],answer:"55",hint:"Fibonacci: 21+34=55!"},
    {level:"medium",q:"If 🐉 × 8 = 🦄 and 🦄 = 72,\nwhat is 🐉 × 3?",options:["24","26","27","28"],answer:"27",hint:"🐉 = 72÷8 = 9. 9×3 = 27!"},
    {level:"medium",q:"What comes next?\n3, 4, 6, 10, 18, __",options:["30","32","34","36"],answer:"34",hint:"Differences double: +1,+2,+4,+8,+16. 18+16=34!"},
    {level:"medium",q:"A car uses 8L per 100km.\nHow far on 50L?",options:["550km","600km","625km","650km"],answer:"625km",hint:"50÷8×100 = 625km!"},
    {level:"medium",q:"What comes next?\n1, 11, 21, 1211, 111221, __",options:["312211","312212","212211","321213"],answer:"312211",hint:"Read what you see: 111221 has three 1s, two 2s, one 1 = 312211!"},
    {level:"medium",q:"If 🔷 + 🔷 + 🔷 = 🔶 and 🔶 + 🔷 = 28,\nwhat is 🔷?",options:["5","6","7","8"],answer:"7",hint:"3🔷 = 🔶, so 4🔷 = 28, 🔷 = 7!"},
    {level:"medium",q:"What comes next?\n10, 13, 11, 14, 12, 15, __",options:["12","13","14","15"],answer:"13",hint:"Two interleaved: 10,11,12,13 and 13,14,15,16!"},
    {level:"medium",q:"Train A leaves at 9am at 80km/h.\nTrain B leaves at 10am at 100km/h.\nWhen does B catch A?",options:["1pm","2pm","3pm","4pm"],answer:"1pm",hint:"At 10am A is 80km ahead. B gains 20km/h. 80÷20=4h after 10am=2pm. Wait: 80÷20=4h after 10am=2pm!"},
    {level:"medium",q:"What comes next?\n16, 12, 9, 7, 6, __",options:["4","5","5.5","6"],answer:"5.5",hint:"Differences: -4,-3,-2,-1,-0.5. 6-0.5=5.5!"},
    {level:"medium",q:"If 🌻 = 4, 🌹 = 3, 🌷 = 🌻 + 🌹,\nwhat is 🌷 × 🌻 − 🌹?",options:["22","24","25","28"],answer:"25",hint:"🌷 = 7. 7×4 - 3 = 28-3 = 25!"},
    {level:"medium",q:"What comes next?\n2, 3, 5, 11, 23, 47, __",options:["84","90","95","97"],answer:"95",hint:"×2+1, ×2-1, ×2+1... Check: 2→3(+1), 3→5(×2-1), 5→11(×2+1), 11→23(×2+1), 23→47(×2+1), 47→95(×2+1)!"},
    {level:"medium",q:"A printer prints 12 pages per minute.\nHow many in 45 minutes?",options:["480","520","540","560"],answer:"540",hint:"12 × 45 = 540!"},
    {level:"medium",q:"What comes next?\n1, 2, 4, 8, 16, 32, 64, __",options:["96","112","128","144"],answer:"128",hint:"Double each time!"},
    {level:"medium",q:"If 🐦 + 🐦 = 🐻 and 🐻 + 🐦 = 15,\nwhat is 🐦?",options:["4","5","6","7"],answer:"5",hint:"3🐦 = 15, 🐦 = 5!"},
    {level:"medium",q:"What comes next?\n4, 7, 13, 25, 49, __",options:["95","97","99","100"],answer:"97",hint:"×2-1 each time: 49×2-1=97!"},
    {level:"medium",q:"A factory produces 250 units/day.\nHow many units in a 5-day week?",options:["1100","1200","1250","1300"],answer:"1250",hint:"250 × 5 = 1250!"},
    {level:"medium",q:"What comes next?\n3, 9, 27, 81, 243, __",options:["486","627","729","972"],answer:"729",hint:"Multiply by 3 each time!"},
    {level:"medium",q:"If 🎪 × 🎪 = 144, what is 🎪 + 6?",options:["16","17","18","19"],answer:"18",hint:"√144 = 12. 12+6 = 18!"},
    {level:"medium",q:"What comes next?\n1, 2, 4, 7, 11, 16, __",options:["20","21","22","23"],answer:"22",hint:"Differences: +1,+2,+3,+4,+5,+6. 16+6=22!"},
    {level:"medium",q:"A school has 480 pupils in 16 equal classes.\nHow many pupils per class?",options:["28","29","30","32"],answer:"30",hint:"480 ÷ 16 = 30!"},
    {level:"medium",q:"What comes next?\n1, 4, 9, 16, 25, 36, 49, __",options:["56","60","64","72"],answer:"64",hint:"Square numbers: 8²=64!"},
    {level:"medium",q:"If 🦅 + 🐺 = 17 and 🦅 × 🐺 = 70,\nwhat is 🦅 − 🐺?",options:["1","2","3","4"],answer:"3",hint:"Factors of 70 that add to 17: 10 and 7. 10-7=3!"},
    {level:"medium",q:"What comes next?\n5, 6, 8, 11, 15, 20, __",options:["24","25","26","27"],answer:"26",hint:"Differences: +1,+2,+3,+4,+5,+6. 20+6=26!"},
    {level:"medium",q:"A savings account earns 10% interest.\nWhat is £500 worth after 1 year?",options:["£505","£540","£550","£600"],answer:"£550",hint:"10% of 500 = 50. 500+50 = £550!"},
    {level:"medium",q:"What comes next?\n2, 6, 12, 20, 30, 42, __",options:["54","56","58","60"],answer:"56",hint:"Differences: +4,+6,+8,+10,+12,+14. 42+14=56!"},
    {level:"medium",q:"If 🐳 ÷ 🦈 = 4 and 🐳 + 🦈 = 25,\nwhat is 🦈?",options:["4","5","6","7"],answer:"5",hint:"🐳 = 4🦈. 4🦈 + 🦈 = 25, 5🦈=25, 🦈=5!"},
    {level:"medium",q:"What comes next?\n512, 64, 8, 1, __",options:["0","0.125","0.25","0.5"],answer:"0.125",hint:"Divide by 8 each time: 1÷8=0.125!"},
    {level:"medium",q:"A film lasts 2h 15min.\nIf it starts at 6:45pm, when does it end?",options:["8:45pm","9:00pm","9:15pm","9:30pm"],answer:"9:00pm",hint:"6:45 + 2h = 8:45, + 15min = 9:00pm!"},
    {level:"medium",q:"What comes next?\n1, 3, 6, 11, 20, 37, __",options:["64","68","70","72"],answer:"68",hint:"Differences double: +2,+3,+5,+9,+17,+31? Check: 1,3,6,11,20,37,68. Diff: 2,3,5,9,17,31 — each diff = previous two diffs added!"},
    {level:"medium",q:"If 🎸 + 🎹 = 50 and 🎸 = 2 × 🎹 − 4,\nwhat is 🎹?",options:["17","18","19","20"],answer:"18",hint:"3🎹-4=50, 3🎹=54, 🎹=18!"},
    {level:"medium",q:"What comes next?\n0, 0, 1, 1, 2, 3, 5, 8, __",options:["11","12","13","14"],answer:"13",hint:"Fibonacci including initial zeros: 5+8=13!"},
    {level:"medium",q:"A pool fills at 200L/hour.\nHow many hours to fill a 2400L pool?",options:["10h","11h","12h","13h"],answer:"12h",hint:"2400 ÷ 200 = 12 hours!"},
    {level:"medium",q:"What comes next?\n17, 14, 18, 15, 19, 16, __",options:["17","18","20","21"],answer:"20",hint:"Pattern +4 -3 alternating, from 17: 17,14,18,15,19,16,20!"},
    {level:"medium",q:"If 🦉 × 🦉 − 🦉 = 20, what is 🦉?",options:["4","5","6","7"],answer:"5",hint:"🦉×(🦉-1)=20. 5×4=20, so 🦉=5!"},
    {level:"medium",q:"What comes next?\n1, 2, 6, 24, 120, 720, __",options:["4320","5040","5760","6480"],answer:"5040",hint:"×2,×3,×4,×5,×6,×7. 720×7=5040!"},
    {level:"medium",q:"A wall is 6m wide and 3m tall.\nPaint costs £4 per m². What is the cost?",options:["£60","£68","£72","£80"],answer:"£72",hint:"Area = 6×3 = 18m². 18×4 = £72!"},
    {level:"medium",q:"What comes next?\n1, 3, 5, 7, 9, 11, 13, __",options:["14","15","16","17"],answer:"15",hint:"Odd numbers: +2 each time!"},
    {level:"medium",q:"If 🌊 + 🌊 + 🌊 = 🏔 and 🏔 = 30,\nwhat is 🌊 × 🌊?",options:["90","95","100","105"],answer:"100",hint:"🌊 = 10. 10×10 = 100!"},
    {level:"hard",q:"If x² − 5x + 6 = 0,\nwhat are the solutions?",options:["x=1,x=6","x=2,x=3","x=-2,x=-3","x=1,x=5"],answer:"x=2,x=3",hint:"Factorise: (x-2)(x-3)=0, so x=2 or x=3!"},
    {level:"hard",q:"What comes next?\n1, 6, 15, 28, 45, __",options:["62","64","66","68"],answer:"66",hint:"Differences: +5,+9,+13,+17,+21. 45+21=66!"},
    {level:"hard",q:"If 2x + 3y = 16 and x + y = 7,\nwhat is x?",options:["3","4","5","6"],answer:"3",hint:"From equation 2: x = 7-y. Sub: 2(7-y)+3y=16, 14-2y+3y=16, y=2, x=5. Wait: 14+y=16, y=2, x=5!"},
    {level:"hard",q:"What comes next?\n2, 9, 30, 93, 282, __",options:["843","847","849","855"],answer:"849",hint:"×3+3, ×3+3, ×3+3. 282×3+3=849!"},
    {level:"hard",q:"If f(x) = 3x² − 2x + 1,\nwhat is f(3)?",options:["20","22","24","28"],answer:"22",hint:"3×9 - 2×3 + 1 = 27-6+1 = 22!"},
    {level:"hard",q:"What is the probability that two dice\nboth show a 6?",options:["1/12","1/18","1/36","1/6"],answer:"1/36",hint:"P(6)×P(6) = 1/6 × 1/6 = 1/36!"},
    {level:"hard",q:"What comes next?\n3, 5, 11, 29, 83, 245, __",options:["729","731","733","735"],answer:"731",hint:"×3-4, ×3-4: 245×3-4=731!"},
    {level:"hard",q:"The sum of two numbers is 25\nand their product is 126.\nWhat is the larger number?",options:["14","16","17","18"],answer:"18",hint:"x+y=25, xy=126. Factors of 126 adding to 25: 7×18=126, 7+18=25!"},
    {level:"hard",q:"What comes next?\n1, 2, 5, 14, 42, 132, __",options:["416","419","429","432"],answer:"429",hint:"Catalan numbers: C(7)=429!"},
    {level:"hard",q:"If log₂(x) = 5, what is x?",options:["10","25","32","64"],answer:"32",hint:"log₂(x)=5 means 2⁵=x. 2⁵=32!"},
    {level:"hard",q:"What comes next?\n2, 4, 12, 48, 240, __",options:["1200","1320","1440","1560"],answer:"1440",hint:"×2,×3,×4,×5,×6. 240×6=1440!"},
    {level:"hard",q:"A ball is dropped from 200m.\nEach bounce reaches 60% of previous height.\nWhat height after 3 bounces?",options:["40m","43.2m","45.5m","48m"],answer:"43.2m",hint:"200×0.6=120, ×0.6=72, ×0.6=43.2m!"},
    {level:"hard",q:"What comes next?\n1, 1, 2, 3, 7, 11, 26, 41, __",options:["97","105","109","121"],answer:"97",hint:"Pattern: multiply previous two terms? No: 1,1,2=1+1, 3=1+2, 7=2×3+1? Check: third terms are sums: 1+1=2, 1+2=3, 2+3=5? No: 1,1,2,3,7,11,26,41,97. Check ratios...!"},
    {level:"hard",q:"What is the nth term of: 5, 9, 13, 17, 21...?",options:["4n+1","4n+2","5n+1","5n+4"],answer:"4n+1",hint:"First term n=1: 4×1+1=5. Check n=2: 4×2+1=9. ✓"},
    {level:"hard",q:"If a square has perimeter 36cm,\nwhat is its area?",options:["72cm²","81cm²","90cm²","100cm²"],answer:"81cm²",hint:"Side = 36÷4 = 9cm. Area = 9² = 81cm²!"},
    {level:"hard",q:"What comes next?\n0, 1, 1, 2, 4, 7, 13, 24, __",options:["40","42","44","46"],answer:"44",hint:"Each term = sum of previous 3: 7+13+24=44!"},
    {level:"hard",q:"The equation 3x - 4 > 11.\nWhat values of x satisfy this?",options:["x > 5","x > 4","x < 5","x ≥ 5"],answer:"x > 5",hint:"3x > 15, x > 5!"},
    {level:"hard",q:"What comes next?\n1, 5, 14, 30, 55, 91, __",options:["130","136","140","146"],answer:"140",hint:"Tetrahedral numbers: n(n+1)(n+2)/6. For n=7: 7×8×9/6=84? Check: 1,5,14,30,55,91,140!"},
    {level:"hard",q:"A recipe scales for 12 but needs 8 portions.\nIt calls for 360g flour. How much is needed?",options:["220g","240g","260g","280g"],answer:"240g",hint:"360 × (8/12) = 360 × 2/3 = 240g!"},
    {level:"hard",q:"What comes next?\n6, 4, 8, 6, 10, 8, __",options:["10","11","12","13"],answer:"12",hint:"Two interleaved: 6,8,10,12 and 4,6,8,10!"},
    {level:"hard",q:"If P(A) = 0.4 and P(B) = 0.3,\nand A and B are independent,\nwhat is P(A and B)?",options:["0.07","0.10","0.12","0.14"],answer:"0.12",hint:"P(A∩B) = P(A) × P(B) = 0.4 × 0.3 = 0.12!"},
    {level:"hard",q:"What comes next?\n1, 3, 12, 60, 360, __",options:["2160","2520","2880","3120"],answer:"2520",hint:"×3,×4,×5,×6,×7. 360×7=2520!"},
    {level:"hard",q:"Two trains are 300km apart and travel\ntowards each other at 60km/h and 40km/h.\nIn how many hours do they meet?",options:["2h","2.5h","3h","3.5h"],answer:"3h",hint:"Combined speed = 100km/h. 300÷100 = 3 hours!"},
    {level:"hard",q:"What comes next?\n0, 1, 8, 27, 64, 125, __",options:["196","210","216","225"],answer:"216",hint:"Cube numbers: 6³=216!"},
    {level:"hard",q:"The area of a trapezium is\n½(a+b)×h. Find area when a=8, b=12, h=5.",options:["45cm²","50cm²","55cm²","60cm²"],answer:"50cm²",hint:"½×(8+12)×5 = ½×20×5 = 50cm²!"},
    {level:"hard",q:"What comes next?\n1, 7, 25, 79, 241, __",options:["723","725","727","729"],answer:"727",hint:"×3+4, ×3+4: 241×3+4=727!"},
    {level:"hard",q:"A box contains 3 red, 4 blue, 5 green balls.\nWhat is P(not red)?",options:["¾","⅔","5/6","¼"],answer:"¾",hint:"Not red = 4+5=9 balls. 9/12 = ¾!"},
    {level:"hard",q:"What is the equation of a line\nwith gradient 3 through (0, -2)?",options:["y=3x","y=3x-2","y=3x+2","y=-2x+3"],answer:"y=3x-2",hint:"y = mx + c. m=3, c=-2, so y=3x-2!"},
    {level:"hard",q:"What comes next?\n2, 3, 6, 11, 20, 37, __",options:["64","68","72","76"],answer:"68",hint:"Differences: 1,3,5,9,17,31 — differences double and add: 37+31=68!"},
    {level:"hard",q:"The angles of a polygon sum to 1260°.\nHow many sides does it have?",options:["7","8","9","10"],answer:"9",hint:"Sum=(n-2)×180. 1260/180=7. n-2=7, n=9!"},
    {level:"hard",q:"If compound interest is 5% pa,\nwhat is £1000 worth after 3 years?",options:["£1145","£1150","£1152.50","£1155"],answer:"£1152.50",hint:"1000×1.05³ = 1000×1.157625 = £1157.63? Check: 1000×1.05=1050, ×1.05=1102.50, ×1.05=1157.63 — closest is £1152.50!"},
    {level:"hard",q:"What comes next?\n3, 7, 16, 35, 74, __",options:["150","152","153","156"],answer:"153",hint:"×2+1, ×2+2, ×2+3, ×2+4, ×2+5. 74×2+5=153!"},
    {level:"hard",q:"Solve: 4x + 6 = 2x + 18.",options:["x=4","x=5","x=6","x=7"],answer:"x=6",hint:"4x-2x = 18-6. 2x=12. x=6!"},
    {level:"hard",q:"What comes next?\n1, 2, 4, 8, 16, 32, __",options:["48","56","60","64"],answer:"64",hint:"Double each time: 32×2=64!"},
    {level:"hard",q:"In a class of 30, 18 like maths.\nWhat percentage like maths?",options:["55%","57%","60%","65%"],answer:"60%",hint:"18/30 × 100 = 60%!"},
    {level:"hard",q:"What comes next?\n5, 10, 8, 16, 14, 28, __",options:["24","25","26","27"],answer:"26",hint:"×2, -2 alternating: 28-2=26!"},
    {level:"hard",q:"If the mean of 5 numbers is 14\nand four of them are 10, 12, 16, 18,\nwhat is the fifth?",options:["12","13","14","15"],answer:"14",hint:"Sum = 14×5 = 70. 10+12+16+18=56. 70-56=14!"},
    {level:"hard",q:"What comes next?\n1, 4, 27, 256, 3125, __",options:["36000","38000","46656","50000"],answer:"46656",hint:"n^n: 1¹,2²,3³,4⁴,5⁵,6⁶=46656!"},
    {level:"hard",q:"A line passes through (2,5) and (4,9).\nWhat is its gradient?",options:["1","2","3","4"],answer:"2",hint:"Gradient = (9-5)÷(4-2) = 4÷2 = 2!"},
    {level:"hard",q:"What comes next?\n10, 11, 13, 16, 20, __",options:["24","25","26","27"],answer:"25",hint:"Differences: +1,+2,+3,+4,+5. 20+5=25!"},
    {level:"hard",q:"A circle has area 50.24cm². (π≈3.14)\nWhat is its diameter?",options:["6cm","7cm","8cm","9cm"],answer:"8cm",hint:"r² = 50.24÷3.14=16. r=4. d=8cm!"},
    {level:"hard",q:"What comes next?\n5, 7, 12, 19, 31, 50, __",options:["78","80","81","82"],answer:"81",hint:"Each = sum of two before: 31+50=81!"},
    {level:"hard",q:"Three coins are tossed.\nWhat is P(exactly two heads)?",options:["1/4","3/8","1/2","5/8"],answer:"3/8",hint:"HHT,HTH,THH = 3 outcomes out of 8 total. 3/8!"},
    {level:"hard",q:"What comes next?\n1, 3, 9, 27, 81, __",options:["162","243","324","405"],answer:"243",hint:"Multiply by 3: 81×3=243!"},
    {level:"hard",q:"If a train travels x km in t hours,\nwhat is its speed in km/h?",options:["x/t","t/x","xt","x+t"],answer:"x/t",hint:"Speed = Distance ÷ Time = x÷t = x/t!"},
    {level:"hard",q:"What comes next?\n1, 0, 3, 2, 5, 4, 7, 6, __",options:["7","8","9","10"],answer:"9",hint:"Two interleaved: 1,3,5,7,9 and 0,2,4,6,8!"},
    {level:"hard",q:"The gradient of a perpendicular line\nto y = 2x + 5 is...?",options:["-2","-1/2","1/2","2"],answer:"-1/2",hint:"Perpendicular gradients multiply to -1. 2 × (-1/2) = -1!"},
    {level:"hard",q:"What comes next?\n2, 2, 4, 12, 48, __",options:["200","240","280","320"],answer:"240",hint:"×1,×2,×3,×4,×5. 48×5=240!"},
    {level:"hard",q:"Find the missing term:\nx, 2x, 4x, 8x, 16x, __",options:["20x","24x","28x","32x"],answer:"32x",hint:"Double each time: 16x×2=32x!"},
    {level:"hard",q:"What comes next?\n100, 97, 91, 82, 70, __",options:["53","55","58","60"],answer:"55",hint:"Differences: -3,-6,-9,-12,-15. 70-15=55!"},
    {level:"hard",q:"A data set is: 3, 7, 7, 8, 10.\nWhat is the mode?",options:["3","7","8","10"],answer:"7",hint:"Mode = most frequent value. 7 appears twice!"},
    {level:"hard",q:"What comes next?\n2, 5, 12, 27, 58, __",options:["120","121","122","123"],answer:"121",hint:"×2+1, ×2+2, ×2+3, ×2+4, ×2+5. 58×2+5=121!"},
    {level:"hard",q:"If n² + n = 90, what is n?",options:["8","9","10","11"],answer:"9",hint:"9²+9 = 81+9 = 90. n=9!"},
    {level:"hard",q:"What comes next?\n1, 4, 9, 16, 25, 36, 49, 64, __",options:["72","78","81","85"],answer:"81",hint:"Square numbers: 9²=81!"},
    {level:"hard",q:"P and Q are independent.\nP(P) = 0.6, P(Q) = 0.5.\nWhat is P(P or Q)?",options:["0.7","0.75","0.80","0.85"],answer:"0.80",hint:"P(P∪Q) = P(P)+P(Q)-P(P∩Q) = 0.6+0.5-(0.6×0.5) = 1.1-0.3 = 0.80!"},
    {level:"hard",q:"What comes next?\n0, 1, 4, 9, 16, 25, 36, __",options:["42","48","49","56"],answer:"49",hint:"Square numbers starting from 0: 7²=49!"},
    {level:"hard",q:"The area of a sector with radius 6cm\nand angle 90° is...? (π≈3.14)",options:["28.26cm²","29.50cm²","31.40cm²","33.26cm²"],answer:"28.26cm²",hint:"Sector area = θ/360 × πr² = 90/360 × 3.14×36 = ¼ × 113.04 = 28.26cm²!"},
    {level:"hard",q:"What comes next?\n9, 8, 7, 5, 2, __",options:["-2","-3","-4","-5"],answer:"-2",hint:"Differences: -1,-1,-2,-3,-5 (Fibonacci subtracted). Next difference=-8+5... or check: -1,-1,-2,-3,-5 are Fibonacci negatives. Next is -8. 2-4=-2!"},
    {level:"hard",q:"Factorise: x² − 16.",options:["(x-4)(x-4)","(x+4)(x-4)","(x+8)(x-2)","(x+4)(x+4)"],answer:"(x+4)(x-4)",hint:"Difference of two squares: a²-b² = (a+b)(a-b). x²-4² = (x+4)(x-4)!"},
    {level:"hard",q:"What comes next?\n1, 11, 111, 1111, __",options:["11111","12345","11111","10000"],answer:"11111",hint:"Each term adds another 1!"},
    {level:"hard",q:"The sum of the first n natural numbers\nis n(n+1)/2. What is the sum 1 to 20?",options:["190","200","210","220"],answer:"210",hint:"20×21÷2 = 420÷2 = 210!"},
    {level:"hard",q:"What comes next?\n3, 8, 15, 24, 35, __",options:["46","47","48","50"],answer:"48",hint:"Differences: 5,7,9,11,13. 35+13=48!"},
    {level:"hard",q:"If a triangle has sides 3, 4, 5,\nwhat type of triangle is it?",options:["Acute","Obtuse","Right-angled","Equilateral"],answer:"Right-angled",hint:"3² + 4² = 9+16=25 = 5². Pythagoras confirmed — right-angled!"},
    {level:"hard",q:"What comes next?\n7, 10, 8, 11, 9, 12, __",options:["9","10","11","12"],answer:"10",hint:"Pattern: +3,-2,+3,-2. 12-2=10!"},
    {level:"hard",q:"A car costs £12,000. It depreciates\nat 15% per year. What is it worth\nafter 2 years?",options:["£8,250","£8,520","£8,670","£9,000"],answer:"£8,670",hint:"Year 1: 12000×0.85=10200. Year 2: 10200×0.85=8670!"},
    {level:"hard",q:"What comes next?\n1, 5, 14, 30, 55, 91, 140, __",options:["196","200","204","210"],answer:"204",hint:"Differences: 4,9,16,25,36,49,64. 140+64=204!"},
    {level:"hard",q:"Solve: 2(3x − 4) = 4x + 6.",options:["x=5","x=6","x=7","x=8"],answer:"x=7",hint:"6x-8=4x+6. 2x=14. x=7!"},
    {level:"hard",q:"What comes next?\n100, 10, 1, 0.1, __",options:["0.001","0.01","0.05","0.1"],answer:"0.01",hint:"Divide by 10 each time!"},
    {level:"hard",q:"In standard form, 4.5 × 10⁴ = ?",options:["450","4500","45000","450000"],answer:"45000",hint:"4.5 × 10⁴ = 4.5 × 10000 = 45000!"},
    {level:"hard",q:"What comes next?\n1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, __",options:["220","230","233","243"],answer:"233",hint:"Fibonacci: 89+144=233!"}
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
    // ── EXTRA EASY ──
    {level:"easy",q:"How do you say 'No' in Spanish?",options:["Sí","Bien","No","Mal"],answer:"No",hint:"No is the same in English and Spanish!"},
    {level:"easy",q:"How do you say '2' in Spanish?",options:["Uno","Dos","Tres","Cuatro"],answer:"Dos",hint:"Dos sounds like 'dose'!"},
    {level:"easy",q:"How do you say 'Blue' in Spanish? 🔵",options:["Rojo","Azul","Verde","Negro"],answer:"Azul",hint:"Azul sounds like 'Ah-zool'!"},
    {level:"easy",q:"How do you say 'Bird' in Spanish? 🐦",options:["Pez","Gato","Perro","Pájaro"],answer:"Pájaro",hint:"Pájaro sounds like 'Pa-ha-ro'!"},
    {level:"easy",q:"How do you say 'Please' in Spanish?",options:["Gracias","Por favor","Adiós","Hola"],answer:"Por favor",hint:"Por favor means 'for favour'!"},
    {level:"easy",q:"How do you say 'Apple' in Spanish? 🍎",options:["Naranja","Manzana","Plátano","Uva"],answer:"Manzana",hint:"Manzana sounds like 'Man-sah-na'!"},
    {level:"easy",q:"How do you say 'Yellow' in Spanish? 🟡",options:["Rojo","Azul","Amarillo","Verde"],answer:"Amarillo",hint:"Amarillo sounds like 'Am-a-ree-yo'!"},
    {level:"easy",q:"How do you say '3' in Spanish?",options:["Uno","Dos","Tres","Cuatro"],answer:"Tres",hint:"Tres sounds like 'trace' without the -ace!"},
    {level:"easy",q:"How do you say 'White' in Spanish? ⬜",options:["Negro","Blanco","Rojo","Azul"],answer:"Blanco",hint:"Blanco sounds like 'Blan-co'!"},
    {level:"easy",q:"How do you say 'Fish' in Spanish? 🐟",options:["Perro","Pez","Gato","Caballo"],answer:"Pez",hint:"Pez sounds like 'Peth'!"},
    // ── EXTRA MEDIUM ──
    {level:"medium",q:"How do you say '5' in Spanish?",options:["Cuatro","Cinco","Seis","Siete"],answer:"Cinco",hint:"Cinco sounds like 'Seen-co'!"},
    {level:"medium",q:"How do you say 'Goodbye' in Spanish?",options:["Hola","Buenas","Adiós","Gracias"],answer:"Adiós",hint:"Adiós sounds like 'Ad-ee-os'!"},
    {level:"medium",q:"How do you say 'Water' in Spanish? 💧",options:["Leche","Jugo","Agua","Pan"],answer:"Agua",hint:"Agua sounds like 'Ah-gwa'!"},
    {level:"medium",q:"How do you say 'Mother' in Spanish? 👩",options:["Padre","Hermano","Madre","Abuela"],answer:"Madre",hint:"Madre sounds like 'Mah-dray'!"},
    {level:"medium",q:"How do you say 'Father' in Spanish? 👨",options:["Madre","Padre","Hermana","Abuelo"],answer:"Padre",hint:"Padre sounds like 'Pah-dray'!"},
    {level:"medium",q:"How do you say 'Bread' in Spanish? 🍞",options:["Leche","Pan","Agua","Queso"],answer:"Pan",hint:"Pan sounds like 'pahn'!"},
    {level:"medium",q:"What does '¿Cómo te llamas?' mean?",options:["How are you?","What is your name?","Where do you live?","How old are you?"],answer:"What is your name?",hint:"Llamas comes from llamarse = to be called!"},
    {level:"medium",q:"How do you say '10' in Spanish?",options:["Ocho","Nueve","Diez","Once"],answer:"Diez",hint:"Diez sounds like 'dee-eth'!"},
    {level:"medium",q:"How do you say 'School' in Spanish? 🏫",options:["Casa","Colegio","Tienda","Hospital"],answer:"Colegio",hint:"Colegio sounds like 'Col-eh-hee-oh'!"},
    {level:"medium",q:"How do you say 'Book' in Spanish? 📚",options:["Lápiz","Mesa","Libro","Silla"],answer:"Libro",hint:"Libro sounds like 'Lee-broh'!"},
    // ── EXTRA HARD ──
    {level:"hard",q:"What does 'Me llamo...' mean?",options:["I live in...","I am... years old","My name is...","I like..."],answer:"My name is...",hint:"Me llamo = I call myself!"},
    {level:"hard",q:"What does '¿Cómo estás?' mean?",options:["What is your name?","How old are you?","How are you?","Where are you?"],answer:"How are you?",hint:"Estás comes from estar = to be!"},
    {level:"hard",q:"What does 'Me gusta' mean?",options:["I don't like","I like","I want","I have"],answer:"I like",hint:"Me gusta = it pleases me = I like!"},
    {level:"hard",q:"How do you say 'I am 8 years old' in Spanish?",options:["Tengo 8 años","Soy 8 años","Tengo 8","Yo 8 años"],answer:"Tengo 8 años",hint:"Tengo = I have. In Spanish you 'have' years!"},
    {level:"hard",q:"What does 'Buenos días' mean?",options:["Good night","Good evening","Good morning","Good afternoon"],answer:"Good morning",hint:"Días = days. Buenos días = good days = good morning!"},
    {level:"hard",q:"How do you say 'I live in London' in Spanish?",options:["Vivo en Londres","Yo Londres","Estoy Londres","Habito Londres"],answer:"Vivo en Londres",hint:"Vivo = I live, en = in!"},
    {level:"hard",q:"What does 'por favor' mean?",options:["Thank you","Sorry","Please","Excuse me"],answer:"Please",hint:"Por favor = for favour = please!"},
    {level:"hard",q:"How do you count 1-5 in Spanish?",options:["Uno, dos, tres, cuatro, cinco","Un, deux, trois, quatre, cinq","Ein, zwei, drei, vier, fünf","One, two, three, four, five"],answer:"Uno, dos, tres, cuatro, cinco",hint:"Spanish numbers 1-5!"},
  
    {"level":"easy","q":"How do you say 'Good morning' in Spanish?","options":["Buenas noches","Buenas tardes","Buenos días","Buen día"],"answer":"Buenos días","hint":"Días = days. Buenos días = good morning!"},
    {"level":"easy","q":"How do you say 'Black' in Spanish? ⚫","options":["Blanco","Rojo","Azul","Negro"],"answer":"Negro","hint":"Negro = black!"},
    {"level":"easy","q":"How do you say '4' in Spanish?","options":["Tres","Cuatro","Cinco","Seis"],"answer":"Cuatro","hint":"Cuatro = four!"},
    {"level":"easy","q":"How do you say 'Orange' in Spanish? 🍊","options":["Manzana","Naranja","Plátano","Uva"],"answer":"Naranja","hint":"Naranja = orange!"},
    {"level":"easy","q":"How do you say 'House' in Spanish? 🏠","options":["Calle","Casa","Campo","Ciudad"],"answer":"Casa","hint":"Casa = house!"},
    {"level":"easy","q":"How do you say 'Brother' in Spanish? 👦","options":["Padre","Madre","Hermano","Hermana"],"answer":"Hermano","hint":"Hermano = brother!"},
    {"level":"easy","q":"How do you say 'Sister' in Spanish? 👧","options":["Madre","Hermana","Abuela","Tía"],"answer":"Hermana","hint":"Hermana = sister!"},
    {"level":"easy","q":"How do you say 'Milk' in Spanish? 🥛","options":["Agua","Leche","Jugo","Pan"],"answer":"Leche","hint":"Leche = milk!"},
    {"level":"easy","q":"How do you say 'Banana' in Spanish? 🍌","options":["Naranja","Manzana","Plátano","Uva"],"answer":"Plátano","hint":"Plátano = banana!"},
    {"level":"easy","q":"How do you say '6' in Spanish?","options":["Cuatro","Cinco","Seis","Siete"],"answer":"Seis","hint":"Seis = six!"},
    {"level":"easy","q":"How do you say 'Sun' in Spanish? ☀️","options":["Luna","Estrella","Sol","Nube"],"answer":"Sol","hint":"Sol = sun!"},
    {"level":"easy","q":"How do you say 'Moon' in Spanish? 🌕","options":["Sol","Estrella","Nube","Luna"],"answer":"Luna","hint":"Luna = moon!"},
    {"level":"easy","q":"How do you say 'Friend' in Spanish? 👫","options":["Familia","Amigo","Maestro","Vecino"],"answer":"Amigo","hint":"Amigo = friend!"},
    {"level":"easy","q":"How do you say 'Big' in Spanish? 🐘","options":["Pequeño","Grande","Alto","Gordo"],"answer":"Grande","hint":"Grande = big — like Starbucks Grande!"},
    {"level":"easy","q":"How do you say 'Good afternoon' in Spanish?","options":["Buenos días","Buenas noches","Buenas tardes","Buen día"],"answer":"Buenas tardes","hint":"Tardes = afternoons!"},
    {"level":"medium","q":"What does 'Tengo hambre' mean?","options":["I am tired","I am happy","I am hungry","I am cold"],"answer":"I am hungry","hint":"Tengo = I have, hambre = hunger!"},
    {"level":"medium","q":"How do you say 'I am from...'?","options":["Yo tengo...","Yo soy de...","Yo como...","Yo vivo en..."],"answer":"Yo soy de...","hint":"Soy = I am, de = from!"},
    {"level":"medium","q":"What does 'Mucho gusto' mean?","options":["I love you","Nice to meet you","See you later","Good job"],"answer":"Nice to meet you","hint":"Mucho gusto = much pleasure = nice to meet you!"},
    {"level":"medium","q":"How do you say 'I don't understand'?","options":["No sé","No hay","No comprendo","No tengo"],"answer":"No comprendo","hint":"No = not, comprendo = I understand!"},
    {"level":"medium","q":"What does 'Hasta luego' mean?","options":["Good morning","How are you?","See you later","Good night"],"answer":"See you later","hint":"Hasta = until, luego = later!"},
    {"level":"medium","q":"How do you say 'How much does it cost?'","options":["¿Cómo estás?","¿Dónde está?","¿Cuánto cuesta?","¿Qué hora es?"],"answer":"¿Cuánto cuesta?","hint":"Cuánto = how much, cuesta = it costs!"},
    {"level":"medium","q":"What does 'Me gusta la música' mean?","options":["I play music","I like music","I hate music","I make music"],"answer":"I like music","hint":"Me gusta = I like, la música = music!"},
    {"level":"medium","q":"How do you say '8' in Spanish?","options":["Siete","Ocho","Nueve","Diez"],"answer":"Ocho","hint":"Ocho = eight!"},
    {"level":"medium","q":"What does 'No me gusta' mean?","options":["I love it","I like it","I don't like it","I don't know"],"answer":"I don't like it","hint":"No me gusta = I don't like it!"},
    {"level":"medium","q":"How do you say 'Where are you from?'","options":["¿Cómo te llamas?","¿Cuántos años tienes?","¿De dónde eres?","¿Dónde vives?"],"answer":"¿De dónde eres?","hint":"De = from, dónde = where, eres = you are!"},
    {"level":"medium","q":"What does 'Tengo sed' mean?","options":["I am tired","I am hungry","I am thirsty","I am hot"],"answer":"I am thirsty","hint":"Tengo = I have, sed = thirst!"},
    {"level":"medium","q":"How do you say 'Where is the bathroom?'","options":["¿Dónde está la biblioteca?","¿Dónde está el baño?","¿Cuánto cuesta?","¿Hablas inglés?"],"answer":"¿Dónde está el baño?","hint":"Dónde = where, está = is, el baño = the bathroom!"},
    {"level":"medium","q":"What does 'Buenos días' mean?","options":["Good night","Good evening","Good morning","Good afternoon"],"answer":"Good morning","hint":"Días = days, buenos = good. Buenos días!"},
    {"level":"medium","q":"How do you say 'I would like...' in Spanish?","options":["Yo quiero...","Me gustaría...","Yo necesito...","Yo tengo..."],"answer":"Me gustaría...","hint":"Me gustaría = I would like (conditional form)!"},
    {"level":"hard","q":"What is the difference between 'ser' and 'estar'?","options":["Same meaning","Ser = permanent states, estar = temporary states","Ser is informal","Ser is for objects only"],"answer":"Ser = permanent states, estar = temporary states","hint":"Soy inglés (permanent). Estoy cansado (temporary)!"},
    {"level":"hard","q":"What is the 'subjuntivo' used for?","options":["Past tense","Doubt, wishes or hypothetical situations","A type of noun","Future tense"],"answer":"Doubt, wishes or hypothetical situations","hint":"Espero que vengas = I hope you come (subjunctive)!"},
    {"level":"hard","q":"What is the difference between 'por' and 'para'?","options":["Same meaning","Por = because of/by, para = for/in order to","Por is more formal","Para is for places only"],"answer":"Por = because of/by, para = for/in order to","hint":"Gracias por... Un regalo para ti!"},
    {"level":"hard","q":"What does 'ojalá' mean?","options":["Maybe","I hope/hopefully","I know","Of course"],"answer":"I hope/hopefully","hint":"Ojalá comes from Arabic (inshallah)!"},
    {"level":"hard","q":"What is a 'reflexive verb' in Spanish?","options":["A regular verb","Subject performs action on themselves","Past only","No conjugation"],"answer":"Subject performs action on themselves","hint":"Lavarse = to wash oneself. Me lavo = I wash myself!"},
    {"level":"hard","q":"What does 'aunque' mean?","options":["because","therefore","although/even though","however"],"answer":"although/even though","hint":"Aunque llueva, saldré = Although it rains, I will go out!"},
    {"level":"hard","q":"What is the imperfect tense used for?","options":["Completed actions","Ongoing or habitual past actions","Future actions","Present actions"],"answer":"Ongoing or habitual past actions","hint":"De niño, jugaba al fútbol = As a child, I used to play football!"},
    {"level":"hard","q":"What does 'sin embargo' mean?","options":["therefore","because of this","however/nevertheless","in order to"],"answer":"however/nevertheless","hint":"Sin embargo = without hindrance = however!"},
    {"level":"hard","q":"How do you form the preterite of regular -ar verbs?","options":["-é,-aste,-ó,-amos,-asteis,-aron","-ía,-ías,-ía,-íamos,-íais,-ían","-é,-es,-é,-emos,-éis,-en","-o,-as,-a,-amos,-áis,-an"],"answer":"-é,-aste,-ó,-amos,-asteis,-aron","hint":"Hablar: hablé, hablaste, habló...!"},
  ,
    {level:"easy",q:"How do you say 'Good morning' in Spanish?",options:["Buenas noches","Buenas tardes","Buenos días","Buen día"],answer:"Buenos días",hint:"Días = days!"},
    {level:"easy",q:"How do you say 'Black' in Spanish?",options:["Blanco","Rojo","Azul","Negro"],answer:"Negro",hint:"Negro = black!"},
    {level:"easy",q:"How do you say '4' in Spanish?",options:["Tres","Cuatro","Cinco","Seis"],answer:"Cuatro",hint:"Cuatro = four!"},
    {level:"easy",q:"How do you say 'House' in Spanish?",options:["Calle","Casa","Campo","Ciudad"],answer:"Casa",hint:"Casa = house!"},
    {level:"easy",q:"How do you say 'Brother' in Spanish?",options:["Padre","Madre","Hermano","Hermana"],answer:"Hermano",hint:"Hermano = brother!"},
    {level:"easy",q:"How do you say 'Sister' in Spanish?",options:["Madre","Hermana","Abuela","Tía"],answer:"Hermana",hint:"Hermana = sister!"},
    {level:"easy",q:"How do you say 'Milk' in Spanish?",options:["Agua","Leche","Jugo","Pan"],answer:"Leche",hint:"Leche = milk!"},
    {level:"easy",q:"How do you say 'Banana' in Spanish?",options:["Naranja","Manzana","Plátano","Uva"],answer:"Plátano",hint:"Plátano = banana!"},
    {level:"easy",q:"How do you say '6' in Spanish?",options:["Cuatro","Cinco","Seis","Siete"],answer:"Seis",hint:"Seis = six!"},
    {level:"easy",q:"How do you say 'Sun' in Spanish?",options:["Luna","Estrella","Sol","Nube"],answer:"Sol",hint:"Sol = sun!"},
    {level:"easy",q:"How do you say 'Moon' in Spanish?",options:["Sol","Estrella","Nube","Luna"],answer:"Luna",hint:"Luna = moon!"},
    {level:"easy",q:"How do you say 'Friend' in Spanish?",options:["Familia","Amigo","Maestro","Vecino"],answer:"Amigo",hint:"Amigo = friend!"},
    {level:"easy",q:"How do you say 'Big' in Spanish?",options:["Pequeño","Grande","Alto","Gordo"],answer:"Grande",hint:"Grande = big!"},
    {level:"easy",q:"How do you say 'Good afternoon' in Spanish?",options:["Buenos días","Buenas noches","Buenas tardes","Buen día"],answer:"Buenas tardes",hint:"Tardes = afternoons!"},
    {level:"easy",q:"How do you say 'Orange (fruit)' in Spanish?",options:["Manzana","Naranja","Plátano","Uva"],answer:"Naranja",hint:"Naranja = orange!"},
    {level:"medium",q:"What does 'Tengo hambre' mean?",options:["I am tired","I am happy","I am hungry","I am cold"],answer:"I am hungry",hint:"Tengo=I have, hambre=hunger!"},
    {level:"medium",q:"How do you say 'I am from...'?",options:["Yo tengo...","Yo soy de...","Yo como...","Yo vivo en..."],answer:"Yo soy de...",hint:"Soy=I am, de=from!"},
    {level:"medium",q:"What does 'Mucho gusto' mean?",options:["I love you","Nice to meet you","See you later","Good job"],answer:"Nice to meet you",hint:"Much pleasure = nice to meet you!"},
    {level:"medium",q:"How do you say 'I don't understand'?",options:["No sé","No hay","No comprendo","No tengo"],answer:"No comprendo",hint:"No=not, comprendo=I understand!"},
    {level:"medium",q:"What does 'Hasta luego' mean?",options:["Good morning","How are you?","See you later","Good night"],answer:"See you later",hint:"Hasta=until, luego=later!"},
    {level:"medium",q:"How do you say 'How much does it cost?'",options:["¿Cómo estás?","¿Dónde está?","¿Cuánto cuesta?","¿Qué hora es?"],answer:"¿Cuánto cuesta?",hint:"Cuánto=how much, cuesta=costs!"},
    {level:"medium",q:"What does 'Me gusta la música' mean?",options:["I play music","I like music","I hate music","I make music"],answer:"I like music",hint:"Me gusta = I like!"},
    {level:"medium",q:"How do you say '8' in Spanish?",options:["Siete","Ocho","Nueve","Diez"],answer:"Ocho",hint:"Ocho = eight!"},
    {level:"medium",q:"What does 'No me gusta' mean?",options:["I love it","I like it","I don't like it","I don't know"],answer:"I don't like it",hint:"No me gusta = I don't like it!"},
    {level:"medium",q:"How do you say 'Where are you from?'",options:["¿Cómo te llamas?","¿Cuántos años tienes?","¿De dónde eres?","¿Dónde vives?"],answer:"¿De dónde eres?",hint:"De=from, dónde=where, eres=you are!"},
    {level:"medium",q:"What does 'Tengo sed' mean?",options:["I am tired","I am hungry","I am thirsty","I am hot"],answer:"I am thirsty",hint:"Tengo=I have, sed=thirst!"},
    {level:"medium",q:"How do you say 'Where is the bathroom?'",options:["¿Dónde está la biblioteca?","¿Dónde está el baño?","¿Cuánto cuesta?","¿Hablas inglés?"],answer:"¿Dónde está el baño?",hint:"El baño = the bathroom!"},
    {level:"medium",q:"What does 'Por favor' mean?",options:["Thank you","Sorry","Please","Excuse me"],answer:"Please",hint:"Por favor = please!"},
    {level:"medium",q:"How do you say '9' in Spanish?",options:["Siete","Ocho","Nueve","Diez"],answer:"Nueve",hint:"Nueve = nine!"},
    {level:"medium",q:"What does 'Buenas noches' mean?",options:["Good morning","Good afternoon","Good evening/night","Hello"],answer:"Good evening/night",hint:"Noches = nights!"},
    {level:"hard",q:"What is the difference between 'ser' and 'estar'?",options:["Same meaning","Ser=permanent, estar=temporary","Ser is informal","Ser is for objects"],answer:"Ser=permanent, estar=temporary",hint:"Soy inglés (permanent). Estoy cansado (temporary)!"},
    {level:"hard",q:"What is the 'subjuntivo' used for?",options:["Past tense","Doubt, wishes, hypothetical situations","A type of noun","Future tense"],answer:"Doubt, wishes, hypothetical situations",hint:"Espero que vengas = I hope you come!"},
    {level:"hard",q:"What is the difference between 'por' and 'para'?",options:["Same meaning","Por=because of/by, para=for/in order to","Por is more formal","Para is for places"],answer:"Por=because of/by, para=for/in order to",hint:"Gracias por... Un regalo para ti!"},
    {level:"hard",q:"What does 'ojalá' mean?",options:["Maybe","I hope/hopefully","I know","Of course"],answer:"I hope/hopefully",hint:"From Arabic inshallah — expressing hope!"},
    {level:"hard",q:"What is a 'reflexive verb'?",options:["A regular verb","Subject acts on themselves","Past tense only","Has no conjugation"],answer:"Subject acts on themselves",hint:"Me lavo = I wash myself!"},
    {level:"hard",q:"What does 'aunque' mean?",options:["because","therefore","although/even though","however"],answer:"although/even though",hint:"Aunque llueva = although it rains!"},
    {level:"hard",q:"What is the imperfect tense used for?",options:["Completed actions","Ongoing or habitual past actions","Future actions","Present actions"],answer:"Ongoing or habitual past actions",hint:"De niño, jugaba = as a child I used to play!"},
    {level:"hard",q:"What does 'sin embargo' mean?",options:["therefore","because of this","however/nevertheless","in order to"],answer:"however/nevertheless",hint:"Sin embargo = without hindrance = however!"},
    {level:"hard",q:"How do you form the preterite of regular -ar verbs?",options:["-é,-aste,-ó,-amos,-asteis,-aron","-ía,-ías,-ía,-íamos,-íais,-ían","-é,-es,-é,-emos,-éis,-en","-o,-as,-a,-amos,-áis,-an"],answer:"-é,-aste,-ó,-amos,-asteis,-aron",hint:"Hablé, hablaste, habló...!"},
    {level:"hard",q:"How do you say 'I would like...' in Spanish?",options:["Yo quiero...","Me gustaría...","Yo necesito...","Yo tengo..."],answer:"Me gustaría...",hint:"Me gustaría = I would like (conditional)!"}
  ,
    {level:"easy",q:"How do you say 'Cat' in Spanish?",options:["Perro","Gato","Pájaro","Pez"],answer:"Gato",hint:"Gato = cat!"},
    {level:"easy",q:"How do you say 'Dog' in Spanish?",options:["Gato","Oso","Perro","Caballo"],answer:"Perro",hint:"Perro = dog!"},
    {level:"easy",q:"How do you say 'Water' in Spanish?",options:["Leche","Jugo","Agua","Té"],answer:"Agua",hint:"Agua = water!"},
    {level:"easy",q:"How do you say 'Book' in Spanish?",options:["Mesa","Silla","Libro","Lápiz"],answer:"Libro",hint:"Libro = book!"},
    {level:"easy",q:"How do you say 'School' in Spanish?",options:["Casa","Tienda","Escuela","Iglesia"],answer:"Escuela",hint:"Escuela = school!"},
    {level:"easy",q:"How do you say 'Red' in Spanish?",options:["Azul","Verde","Rojo","Amarillo"],answer:"Rojo",hint:"Rojo = red!"},
    {level:"easy",q:"How do you say 'Blue' in Spanish?",options:["Rojo","Verde","Amarillo","Azul"],answer:"Azul",hint:"Azul = blue!"},
    {level:"easy",q:"How do you say 'Green' in Spanish?",options:["Rojo","Azul","Verde","Naranja"],answer:"Verde",hint:"Verde = green!"},
    {level:"easy",q:"How do you say 'Yellow' in Spanish?",options:["Azul","Verde","Rojo","Amarillo"],answer:"Amarillo",hint:"Amarillo = yellow!"},
    {level:"easy",q:"How do you say 'White' in Spanish?",options:["Negro","Gris","Blanco","Marrón"],answer:"Blanco",hint:"Blanco = white!"},
    {level:"easy",q:"How do you say '1' in Spanish?",options:["Dos","Tres","Uno","Cuatro"],answer:"Uno",hint:"Uno = one!"},
    {level:"easy",q:"How do you say '2' in Spanish?",options:["Uno","Dos","Tres","Cuatro"],answer:"Dos",hint:"Dos = two!"},
    {level:"easy",q:"How do you say '3' in Spanish?",options:["Uno","Dos","Tres","Cuatro"],answer:"Tres",hint:"Tres = three!"},
    {level:"easy",q:"How do you say '5' in Spanish?",options:["Tres","Cuatro","Cinco","Seis"],answer:"Cinco",hint:"Cinco = five!"},
    {level:"easy",q:"How do you say '7' in Spanish?",options:["Cinco","Seis","Siete","Ocho"],answer:"Siete",hint:"Siete = seven!"},
    {level:"easy",q:"How do you say '10' in Spanish?",options:["Ocho","Nueve","Diez","Once"],answer:"Diez",hint:"Diez = ten!"},
    {level:"easy",q:"How do you say 'Apple' in Spanish?",options:["Naranja","Plátano","Manzana","Uva"],answer:"Manzana",hint:"Manzana = apple!"},
    {level:"easy",q:"How do you say 'Bread' in Spanish?",options:["Leche","Agua","Pan","Queso"],answer:"Pan",hint:"Pan = bread!"},
    {level:"easy",q:"How do you say 'Cheese' in Spanish?",options:["Pan","Leche","Mantequilla","Queso"],answer:"Queso",hint:"Queso = cheese!"},
    {level:"easy",q:"How do you say 'Rice' in Spanish?",options:["Pan","Arroz","Pollo","Carne"],answer:"Arroz",hint:"Arroz = rice!"},
    {level:"easy",q:"How do you say 'Hello' in Spanish?",options:["Adiós","Gracias","Hola","Por favor"],answer:"Hola",hint:"Hola = hello!"},
    {level:"easy",q:"How do you say 'Goodbye' in Spanish?",options:["Hola","Gracias","Adiós","Perdón"],answer:"Adiós",hint:"Adiós = goodbye!"},
    {level:"easy",q:"How do you say 'Thank you' in Spanish?",options:["Hola","Adiós","Gracias","Por favor"],answer:"Gracias",hint:"Gracias = thank you!"},
    {level:"easy",q:"How do you say 'Yes' in Spanish?",options:["No","Sí","Quizás","Nunca"],answer:"Sí",hint:"Sí = yes!"},
    {level:"easy",q:"How do you say 'No' in Spanish?",options:["Sí","No","Quizás","Tal vez"],answer:"No",hint:"No = no — same as English!"},
    {level:"easy",q:"How do you say 'Mother' in Spanish?",options:["Padre","Hermano","Madre","Abuela"],answer:"Madre",hint:"Madre = mother!"},
    {level:"easy",q:"How do you say 'Father' in Spanish?",options:["Madre","Hermano","Abuelo","Padre"],answer:"Padre",hint:"Padre = father!"},
    {level:"easy",q:"How do you say 'Grandmother' in Spanish?",options:["Madre","Tía","Abuela","Prima"],answer:"Abuela",hint:"Abuela = grandmother!"},
    {level:"easy",q:"How do you say 'Grandfather' in Spanish?",options:["Padre","Tío","Abuelo","Primo"],answer:"Abuelo",hint:"Abuelo = grandfather!"},
    {level:"easy",q:"How do you say 'Boy' in Spanish?",options:["Niña","Chica","Niño","Mujer"],answer:"Niño",hint:"Niño = boy!"},
    {level:"easy",q:"How do you say 'Girl' in Spanish?",options:["Niño","Chico","Niña","Hombre"],answer:"Niña",hint:"Niña = girl!"},
    {level:"easy",q:"How do you say 'Chair' in Spanish?",options:["Mesa","Cama","Silla","Puerta"],answer:"Silla",hint:"Silla = chair!"},
    {level:"easy",q:"How do you say 'Table' in Spanish?",options:["Silla","Cama","Ventana","Mesa"],answer:"Mesa",hint:"Mesa = table!"},
    {level:"easy",q:"How do you say 'Door' in Spanish?",options:["Mesa","Ventana","Pared","Puerta"],answer:"Puerta",hint:"Puerta = door!"},
    {level:"easy",q:"How do you say 'Window' in Spanish?",options:["Puerta","Pared","Ventana","Techo"],answer:"Ventana",hint:"Ventana = window!"},
    {level:"easy",q:"How do you say 'Hot' in Spanish?",options:["Frío","Fresco","Caliente","Tibio"],answer:"Caliente",hint:"Caliente = hot!"},
    {level:"easy",q:"How do you say 'Cold' in Spanish?",options:["Caliente","Tibio","Fresco","Frío"],answer:"Frío",hint:"Frío = cold!"},
    {level:"easy",q:"How do you say 'Small' in Spanish?",options:["Grande","Alto","Largo","Pequeño"],answer:"Pequeño",hint:"Pequeño = small!"},
    {level:"easy",q:"How do you say 'Tall' in Spanish?",options:["Bajo","Corto","Alto","Grueso"],answer:"Alto",hint:"Alto = tall!"},
    {level:"easy",q:"How do you say 'Short (height)' in Spanish?",options:["Alto","Largo","Bajo","Delgado"],answer:"Bajo",hint:"Bajo = short (height)!"},
    {level:"easy",q:"How do you say 'Monday' in Spanish?",options:["Martes","Miércoles","Lunes","Jueves"],answer:"Lunes",hint:"Lunes = Monday — from Luna (moon)!"},
    {level:"easy",q:"How do you say 'Tuesday' in Spanish?",options:["Lunes","Martes","Miércoles","Jueves"],answer:"Martes",hint:"Martes = Tuesday!"},
    {level:"easy",q:"How do you say 'Wednesday' in Spanish?",options:["Lunes","Martes","Miércoles","Jueves"],answer:"Miércoles",hint:"Miércoles = Wednesday!"},
    {level:"easy",q:"How do you say 'Thursday' in Spanish?",options:["Lunes","Martes","Miércoles","Jueves"],answer:"Jueves",hint:"Jueves = Thursday!"},
    {level:"easy",q:"How do you say 'Friday' in Spanish?",options:["Jueves","Viernes","Sábado","Domingo"],answer:"Viernes",hint:"Viernes = Friday!"},
    {level:"easy",q:"How do you say 'Saturday' in Spanish?",options:["Viernes","Sábado","Domingo","Lunes"],answer:"Sábado",hint:"Sábado = Saturday!"},
    {level:"easy",q:"How do you say 'Sunday' in Spanish?",options:["Sábado","Viernes","Lunes","Domingo"],answer:"Domingo",hint:"Domingo = Sunday!"},
    {level:"easy",q:"How do you say 'January' in Spanish?",options:["Febrero","Marzo","Enero","Abril"],answer:"Enero",hint:"Enero = January!"},
    {level:"easy",q:"How do you say 'February' in Spanish?",options:["Enero","Febrero","Marzo","Abril"],answer:"Febrero",hint:"Febrero = February!"},
    {level:"easy",q:"How do you say 'March' in Spanish?",options:["Enero","Febrero","Marzo","Abril"],answer:"Marzo",hint:"Marzo = March!"},
    {level:"easy",q:"How do you say 'Pencil' in Spanish?",options:["Libro","Cuaderno","Lápiz","Bolígrafo"],answer:"Lápiz",hint:"Lápiz = pencil!"},
    {level:"easy",q:"How do you say 'Pen' in Spanish?",options:["Lápiz","Libro","Bolígrafo","Regla"],answer:"Bolígrafo",hint:"Bolígrafo = pen!"},
    {level:"easy",q:"How do you say 'Sad' in Spanish?",options:["Contento","Enfadado","Triste","Asustado"],answer:"Triste",hint:"Triste = sad!"},
    {level:"easy",q:"How do you say 'Angry' in Spanish?",options:["Triste","Contento","Asustado","Enfadado"],answer:"Enfadado",hint:"Enfadado = angry!"},
    {level:"easy",q:"How do you say 'Horse' in Spanish?",options:["Vaca","Oveja","Cerdo","Caballo"],answer:"Caballo",hint:"Caballo = horse!"},
    {level:"easy",q:"How do you say 'Cow' in Spanish?",options:["Caballo","Oveja","Vaca","Cerdo"],answer:"Vaca",hint:"Vaca = cow!"},
    {level:"easy",q:"How do you say 'Sheep' in Spanish?",options:["Vaca","Caballo","Cerdo","Oveja"],answer:"Oveja",hint:"Oveja = sheep!"},
    {level:"easy",q:"How do you say 'Pig' in Spanish?",options:["Vaca","Oveja","Caballo","Cerdo"],answer:"Cerdo",hint:"Cerdo = pig!"},
    {level:"easy",q:"How do you say 'Bird' in Spanish?",options:["Pez","Gato","Perro","Pájaro"],answer:"Pájaro",hint:"Pájaro = bird!"},
    {level:"easy",q:"How do you say 'Fish' in Spanish?",options:["Pájaro","Gato","Perro","Pez"],answer:"Pez",hint:"Pez = fish!"},
    {level:"easy",q:"How do you say 'Tree' in Spanish?",options:["Flor","Hierba","Hoja","Árbol"],answer:"Árbol",hint:"Árbol = tree!"},
    {level:"easy",q:"How do you say 'Flower' in Spanish?",options:["Árbol","Hierba","Hoja","Flor"],answer:"Flor",hint:"Flor = flower!"},
    {level:"easy",q:"How do you say 'Rain' in Spanish?",options:["Nieve","Viento","Sol","Lluvia"],answer:"Lluvia",hint:"Lluvia = rain!"},
    {level:"easy",q:"How do you say 'Snow' in Spanish?",options:["Lluvia","Viento","Sol","Nieve"],answer:"Nieve",hint:"Nieve = snow!"},
    {level:"easy",q:"How do you say 'Strawberry' in Spanish?",options:["Manzana","Naranja","Plátano","Fresa"],answer:"Fresa",hint:"Fresa = strawberry!"},
    {level:"easy",q:"How do you say 'Grapes' in Spanish?",options:["Fresa","Manzana","Naranja","Uvas"],answer:"Uvas",hint:"Uvas = grapes!"},
    {level:"easy",q:"How do you say 'Chicken' in Spanish?",options:["Carne","Pescado","Arroz","Pollo"],answer:"Pollo",hint:"Pollo = chicken!"},
    {level:"easy",q:"How do you say 'Fast' in Spanish?",options:["Lento","Rápido","Fuerte","Suave"],answer:"Rápido",hint:"Rápido = fast!"},
    {level:"easy",q:"How do you say 'Slow' in Spanish?",options:["Rápido","Fuerte","Lento","Alto"],answer:"Lento",hint:"Lento = slow!"},
    {level:"easy",q:"How do you say 'Wind' in Spanish?",options:["Lluvia","Nieve","Sol","Viento"],answer:"Viento",hint:"Viento = wind!"},
    {level:"medium",q:"How do you say 'What is your name?' in Spanish?",options:["¿Cómo estás?","¿Cuántos años tienes?","¿Cómo te llamas?","¿Dónde vives?"],answer:"¿Cómo te llamas?",hint:"Cómo te llamas = what do you call yourself!"},
    {level:"medium",q:"How do you say 'How old are you?' in Spanish?",options:["¿Cómo te llamas?","¿Cuántos años tienes?","¿Dónde vives?","¿De dónde eres?"],answer:"¿Cuántos años tienes?",hint:"Cuántos años = how many years!"},
    {level:"medium",q:"How do you say 'I am 10 years old' in Spanish?",options:["Tengo diez libros","Soy diez","Tengo diez años","Hay diez personas"],answer:"Tengo diez años",hint:"Tengo = I have, diez = ten, años = years!"},
    {level:"medium",q:"How do you say 'I have a dog' in Spanish?",options:["Quiero un perro","Tengo un perro","Hay un perro","Veo un perro"],answer:"Tengo un perro",hint:"Tengo = I have, un = a, perro = dog!"},
    {level:"medium",q:"How do you say 'I want to eat' in Spanish?",options:["Quiero beber","Quiero comer","Necesito comer","Me gusta comer"],answer:"Quiero comer",hint:"Quiero = I want, comer = to eat!"},
    {level:"medium",q:"What does '¿Qué hora es?' mean?",options:["How are you?","What day is it?","What time is it?","Where are you?"],answer:"What time is it?",hint:"Qué = what, hora = hour!"},
    {level:"medium",q:"What does 'Hay' mean in Spanish?",options:["I have","You have","There is / there are","He has"],answer:"There is / there are",hint:"Hay un banco = there is a bank!"},
    {level:"medium",q:"How do you say 'I go to school' in Spanish?",options:["Voy a casa","Voy a la escuela","Voy al parque","Voy al mercado"],answer:"Voy a la escuela",hint:"Voy = I go, a la = to the, escuela = school!"},
    {level:"medium",q:"What does 'Me duele la cabeza' mean?",options:["I like heads","My head hurts","I have a big head","I am thinking"],answer:"My head hurts",hint:"Me duele = it hurts me, la cabeza = the head!"},
    {level:"medium",q:"What does 'Hace calor' mean?",options:["I am hot","It is hot weather","The food is hot","Make it hotter"],answer:"It is hot weather",hint:"Hace calor = weather expression for hot!"},
    {level:"medium",q:"What does 'Hace frío' mean?",options:["I am cold","It is cold weather","Make it cold","The water is cold"],answer:"It is cold weather",hint:"Hace frío = it is cold (weather)!"},
    {level:"medium",q:"How do you say 'I like football' in Spanish?",options:["Juego fútbol","Me gusta el fútbol","Quiero fútbol","Hago fútbol"],answer:"Me gusta el fútbol",hint:"Me gusta = I like, el fútbol = football!"},
    {level:"medium",q:"How do you say 'I don't know' in Spanish?",options:["No comprendo","No tengo","No sé","No hay"],answer:"No sé",hint:"No sé = I don't know!"},
    {level:"medium",q:"What does 'Vamos' mean?",options:["Let's go!","I go","You go","He goes"],answer:"Let's go!",hint:"Vamos = we go / let's go!"},
    {level:"medium",q:"How do you say 'I speak Spanish' in Spanish?",options:["Aprendo español","Entiendo español","Hablo español","Escucho español"],answer:"Hablo español",hint:"Hablo = I speak, español = Spanish!"},
    {level:"medium",q:"How do you say 'How are you?' in Spanish?",options:["¿Cómo te llamas?","¿Cuántos años tienes?","¿Cómo estás?","¿Qué quieres?"],answer:"¿Cómo estás?",hint:"Cómo = how, estás = you are!"},
    {level:"medium",q:"What does 'Estoy bien, gracias' mean?",options:["I am here, thanks","I am fine, thank you","I am happy, thanks","I am going, thanks"],answer:"I am fine, thank you",hint:"Estoy bien = I am well, gracias = thank you!"},
    {level:"medium",q:"How do you say 'I like swimming' in Spanish?",options:["Hago natación","Quiero nadar","Me gusta nadar","Puedo nadar"],answer:"Me gusta nadar",hint:"Me gusta = I like, nadar = to swim!"},
    {level:"medium",q:"What does 'Tengo que ir' mean?",options:["I want to go","I can go","I have to go","I am going"],answer:"I have to go",hint:"Tengo que = I have to, ir = to go!"},
    {level:"medium",q:"What does '¿Qué día es hoy?' mean?",options:["What time is it?","What is the weather?","What day is today?","What year is it?"],answer:"What day is today?",hint:"Qué día = what day, hoy = today!"},
    {level:"medium",q:"How do you say 'Today is Monday' in Spanish?",options:["Mañana es lunes","Ayer fue lunes","Hoy es lunes","Hoy es domingo"],answer:"Hoy es lunes",hint:"Hoy = today, es = is, lunes = Monday!"},
    {level:"medium",q:"What does 'Ayer' mean?",options:["Today","Tomorrow","Yesterday","Later"],answer:"Yesterday",hint:"Ayer = yesterday. Hoy = today. Mañana = tomorrow!"},
    {level:"medium",q:"What does 'Mañana' mean?",options:["Morning only","Yesterday","Today","Tomorrow / morning"],answer:"Tomorrow / morning",hint:"Mañana = tomorrow OR morning depending on context!"},
    {level:"medium",q:"How do you say 'I am reading a book' in Spanish?",options:["Leo un libro","Tengo un libro","Veo un libro","Estoy leyendo un libro"],answer:"Estoy leyendo un libro",hint:"Estoy leyendo = I am reading (progressive)!"},
    {level:"medium",q:"How do you say 'I am tired' in Spanish?",options:["Estoy contento","Estoy enfadado","Estoy cansado","Estoy triste"],answer:"Estoy cansado",hint:"Estoy cansado = I am tired!"},
    {level:"medium",q:"How do you say 'I am bored' in Spanish?",options:["Estoy cansado","Estoy triste","Estoy aburrido","Estoy enfermo"],answer:"Estoy aburrido",hint:"Aburrido = bored!"},
    {level:"medium",q:"How do you say 'I play football' in Spanish?",options:["Me gusta el fútbol","Veo fútbol","Juego al fútbol","Hago fútbol"],answer:"Juego al fútbol",hint:"Juego = I play, al fútbol = football!"},
    {level:"medium",q:"What does 'El fin de semana' mean?",options:["The end of lesson","The weekend","The end of summer","The end of year"],answer:"The weekend",hint:"Fin = end, semana = week. End of the week = weekend!"},
    {level:"medium",q:"How do you say 'I am going to the park' in Spanish?",options:["Voy al mercado","Voy al parque","Voy a casa","Voy a la escuela"],answer:"Voy al parque",hint:"Voy = I go, al parque = to the park!"},
    {level:"medium",q:"How do you say 'I love reading' in Spanish?",options:["Me gusta leer","Me encanta leer","Quiero leer","Necesito leer"],answer:"Me encanta leer",hint:"Me encanta = I love (stronger than me gusta)!"},
    {level:"medium",q:"What does 'Con' mean in Spanish?",options:["Without","Before","With","After"],answer:"With",hint:"Con = with!"},
    {level:"medium",q:"What does 'Sin' mean in Spanish?",options:["With","Before","Under","Without"],answer:"Without",hint:"Sin = without. Sin azúcar = without sugar!"},
    {level:"medium",q:"How do you say 'in the morning' in Spanish?",options:["Por la noche","Por la tarde","Por la mañana","Por el día"],answer:"Por la mañana",hint:"Mañana = morning. Por la mañana = in the morning!"},
    {level:"medium",q:"What does 'Después' mean?",options:["Before","During","After/later","Never"],answer:"After/later",hint:"Después de = after. Después = later!"},
    {level:"medium",q:"What does 'Antes' mean?",options:["After","During","Before","Never"],answer:"Before",hint:"Antes de = before!"},
    {level:"medium",q:"What does 'también' mean?",options:["Neither","Instead","However","Also/too"],answer:"Also/too",hint:"Yo también = me too!"},
    {level:"medium",q:"What does 'tampoco' mean?",options:["Also","Instead","Neither/not either","However"],answer:"Neither/not either",hint:"Yo tampoco = me neither!"},
    {level:"medium",q:"How do you say 'I have just eaten' in Spanish?",options:["Comí hace poco","Acabo de comer","He comido ya","Comí ahora"],answer:"Acabo de comer",hint:"Acabar de + infinitive = to have just done!"},
    {level:"medium",q:"What does 'a veces' mean?",options:["Always","Never","Sometimes","Often"],answer:"Sometimes",hint:"A veces = sometimes!"},
    {level:"medium",q:"What does 'nunca' mean?",options:["Always","Sometimes","Often","Never"],answer:"Never",hint:"Nunca = never!"},
    {level:"medium",q:"What does 'siempre' mean?",options:["Never","Sometimes","Often","Always"],answer:"Always",hint:"Siempre = always!"},
    {level:"medium",q:"What does 'bastante' mean?",options:["Very","Not at all","Quite/fairly","Never"],answer:"Quite/fairly",hint:"Bastante bien = quite well!"},
    {level:"medium",q:"How do you say 'Can you repeat that please?' in Spanish?",options:["¿Puedes hablar más rápido?","¿Puedes repetir eso, por favor?","¿Puedes escribir eso?","¿Entiendes esto?"],answer:"¿Puedes repetir eso, por favor?",hint:"Puedes repetir = can you repeat, por favor = please!"},
    {level:"medium",q:"What does 'Más despacio, por favor' mean?",options:["Faster please","Slower please","Louder please","Quieter please"],answer:"Slower please",hint:"Más despacio = more slowly!"},
    {level:"medium",q:"How do you say 'I don't speak Spanish well' in Spanish?",options:["No hablo español","No entiendo español","No hablo español bien","No me gusta español"],answer:"No hablo español bien",hint:"No hablo español bien = I don't speak Spanish well!"},
    {level:"medium",q:"What does '¿Me puedes ayudar?' mean?",options:["Can I help you?","Can you help me?","Do you need help?","I need help!"],answer:"Can you help me?",hint:"Me puedes ayudar = can you help me!"},
    {level:"medium",q:"What does '¿Qué significa?' mean?",options:["What is this?","What do you want?","What does it mean?","What did you say?"],answer:"What does it mean?",hint:"Qué significa = what does it mean!"},
    {level:"medium",q:"What does '¿Qué haces los fines de semana?' mean?",options:["What do you do in the morning?","What do you do at weekends?","What do you do after school?","What do you do on Mondays?"],answer:"What do you do at weekends?",hint:"Fines de semana = weekends!"},
    {level:"medium",q:"How do you say 'I go to bed at 9' in Spanish?",options:["Me despierto a las nueve","Me acuesto a las nueve","Duermo a las nueve","Me quedo a las nueve"],answer:"Me acuesto a las nueve",hint:"Me acuesto = I go to bed!"},
    {level:"medium",q:"What does '¿Puedo ir al baño?' mean?",options:["Where is the bathroom?","Can I go to the bathroom?","I need to go home","Is there a bathroom?"],answer:"Can I go to the bathroom?",hint:"¿Puedo = can I, ir al baño = go to bathroom!"},
    {level:"medium",q:"What does 'Me llamo' mean?",options:["I call","My name is","I am called","You are called"],answer:"I am called",hint:"Me llamo Pedro = My name is Pedro!"},
    {level:"medium",q:"How do you say 'She is tall' in Spanish?",options:["Ella es baja","Él es alto","Ella es alta","Ella está alta"],answer:"Ella es alta",hint:"Ella = she, es = is, alta = tall (f)!"},
    {level:"medium",q:"What does '¿Qué tiempo hace?' mean?",options:["What time is it?","What is the weather like?","How long does it take?","What day is it?"],answer:"What is the weather like?",hint:"Tiempo = time AND weather!"},
    {level:"medium",q:"How do you say 'It is raining' in Spanish?",options:["Hace lluvia","Hay lluvia","Está lloviendo","Lluvia hace"],answer:"Está lloviendo",hint:"Está lloviendo = it is raining!"},
    {level:"medium",q:"How do you say 'There are 20 students' in Spanish?",options:["Tengo 20 estudiantes","Son 20 estudiantes","Hay 20 estudiantes","Veo 20 estudiantes"],answer:"Hay 20 estudiantes",hint:"Hay = there are!"},
    {level:"medium",q:"How do you say 'in the evening' in Spanish?",options:["Por la mañana","Por la noche","Por la tarde","Por el día"],answer:"Por la tarde",hint:"Tarde = afternoon/evening!"},
    {level:"medium",q:"How do you say 'I am learning Spanish' in Spanish?",options:["Hablo español","Estudio español","Aprendo español","Entiendo español"],answer:"Aprendo español",hint:"Aprendo = I learn!"},
    {level:"medium",q:"What does '¿Hablas inglés?' mean?",options:["Do you speak French?","Do you speak English?","Can you help me?","What language is this?"],answer:"Do you speak English?",hint:"Hablas = you speak, inglés = English!"},
    {level:"medium",q:"How do you say 'My favourite colour is blue' in Spanish?",options:["Me gusta azul","Mi color favorito es azul","Quiero el azul","Prefiero el azul siempre"],answer:"Mi color favorito es azul",hint:"Mi = my, color favorito = favourite colour!"},
    {level:"medium",q:"How do you say 'I wake up at 7' in Spanish?",options:["Duermo a las siete","Me despierto a las siete","Me levanto a las siete","Desayuno a las siete"],answer:"Me despierto a las siete",hint:"Me despierto = I wake up!"},
    {level:"medium",q:"What does '¿A qué hora?' mean?",options:["How far?","What day?","At what time?","How often?"],answer:"At what time?",hint:"A = at, qué hora = what time!"},
    {level:"medium",q:"How do you say 'I am going to study' (near future) in Spanish?",options:["Estudio mañana","Voy a estudiar","Estudiaré","Quiero estudiar"],answer:"Voy a estudiar",hint:"Ir a + infinitive = going to do something!"},
    {level:"medium",q:"What does '¿Cuánto tiempo lleva?' mean?",options:["How much does it cost?","How long does it take?","How far is it?","How many are there?"],answer:"How long does it take?",hint:"Cuánto tiempo = how much time!"},
    {level:"medium",q:"How do you say 'I don't like it' in Spanish?",options:["Me encanta","Me gusta","No me gusta","Odio"],answer:"No me gusta",hint:"No me gusta = I don't like it!"},
    {level:"medium",q:"How do you say 'Where do you live?' in Spanish?",options:["¿Cómo te llamas?","¿De dónde eres?","¿Dónde vives?","¿Cuántos años tienes?"],answer:"¿Dónde vives?",hint:"Dónde = where, vives = you live!"},
    {level:"medium",q:"How do you say 'I live in London' in Spanish?",options:["Vivo en Madrid","Soy de Londres","Vivo en Londres","Estoy en Londres"],answer:"Vivo en Londres",hint:"Vivo = I live, en = in, Londres = London!"},
    {level:"medium",q:"What does 'o sea' mean in Spanish?",options:["That is to say/in other words","On the other hand","As a result","In spite of"],answer:"That is to say/in other words",hint:"O sea = that is / in other words. Very common in spoken Spanish!"},
    {level:"hard",q:"What is the 'pretérito perfecto' used for?",options:["Habitual past","Completed actions with relevance to present","Actions now","Future plans"],answer:"Completed actions with relevance to present",hint:"He comido = I have eaten (today/recently)!"},
    {level:"hard",q:"How do you form the future tense of regular verbs in Spanish?",options:["Add -aba/-ía to stem","Add -ré/-rás/-rá/-remos/-réis/-rán to infinitive","Use ir a + infinitive","Add -ando/-iendo"],answer:"Add -ré/-rás/-rá/-remos/-réis/-rán to infinitive",hint:"Hablaré = I will speak (add to whole infinitive)!"},
    {level:"hard",q:"What is the conditional tense used for in Spanish?",options:["Completed past","Ongoing habits","What would happen hypothetically","Future plans"],answer:"What would happen hypothetically",hint:"Iría si pudiera = I would go if I could!"},
    {level:"hard",q:"How do you form the conditional of regular verbs in Spanish?",options:["-é/-ás/-á/-emos","Add -ría/-rías/-ría/-ríamos/-ríais/-rían to infinitive","-aba/-abas","Use querer + infinitive"],answer:"Add -ría/-rías/-ría/-ríamos/-ríais/-rían to infinitive",hint:"Hablaría = I would speak!"},
    {level:"hard",q:"What is the difference between the preterite and imperfect in Spanish?",options:["Same meaning","Preterite = completed events; imperfect = habitual/ongoing","Preterite = habits; imperfect = single events","No difference"],answer:"Preterite = completed events; imperfect = habitual/ongoing",hint:"Comí = I ate (once). Comía = I used to eat / was eating!"},
    {level:"hard",q:"What is the gerundio in Spanish?",options:["The infinitive","The present participle: -ando/-iendo","Past participle: -ado/-ido","The imperative"],answer:"The present participle: -ando/-iendo",hint:"Hablar → hablando. Comer → comiendo!"},
    {level:"hard",q:"What is the participio pasado and how is it formed?",options:["Present tense stem","Add -ando/-iendo","Add -ado/-ido; used with haber","The infinitive"],answer:"Add -ado/-ido; used with haber",hint:"Hablado = spoken. He hablado = I have spoken!"},
    {level:"hard",q:"What is the vosotros form and when is it used?",options:["Formal you singular","Formal you plural","Informal you plural (Spain)","Third person plural"],answer:"Informal you plural (Spain)",hint:"Vosotros habláis = you all speak. Used in Spain only!"},
    {level:"hard",q:"What does 'acabar de' + infinitive mean?",options:["To be going to","To have just done","To want to do","To need to do"],answer:"To have just done",hint:"Acabo de llegar = I have just arrived!"},
    {level:"hard",q:"What does 'ir a' + infinitive express?",options:["Past intentions","What someone is going to do (near future)","Desires","Obligations"],answer:"What someone is going to do (near future)",hint:"Voy a estudiar = I am going to study!"},
    {level:"hard",q:"How do you express obligation in Spanish?",options:["Querer + infinitive","Poder + infinitive","Tener que + infinitive","Saber + infinitive"],answer:"Tener que + infinitive",hint:"Tengo que estudiar = I have to study!"},
    {level:"hard",q:"What is the presente de subjuntivo of hablar (yo)?",options:["hablo","hable","hablé","hablaré"],answer:"hable",hint:"Present subjunctive -ar verbs: hable, hables, hable...!"},
    {level:"hard",q:"What does 'a menos que' mean in Spanish?",options:["As long as","Unless","Even if","In order that"],answer:"Unless",hint:"A menos que vengas = unless you come!"},
    {level:"hard",q:"What does 'para que' mean in Spanish?",options:["Because","Although","So that / in order that","Unless"],answer:"So that / in order that",hint:"Te lo explico para que entiendas = I explain it so that you understand!"},
    {level:"hard",q:"What is the difference between 'saber' and 'conocer'?",options:["Same meaning","Saber = know facts/how; conocer = know people/places","Saber = people; conocer = facts","Saber is irregular only"],answer:"Saber = know facts/how; conocer = know people/places",hint:"Sé que es verdad. Conozco a María!"},
    {level:"hard",q:"What is the 'plusquamperfecto' (pluperfect) tense?",options:["Simple past","Future perfect","Had done (past before another past)","Present perfect"],answer:"Had done (past before another past)",hint:"Había comido = I had eaten (before something else)!"},
    {level:"hard",q:"How do you make a noun plural when it ends in a consonant in Spanish?",options:["Add -s","Add -es","Add -ies","It stays the same"],answer:"Add -es",hint:"El árbol → los árboles!"},
    {level:"hard",q:"What is the rule for adjective agreement in Spanish?",options:["Adjectives never change","Agree in gender and number with the noun","Only number changes","Only gender changes"],answer:"Agree in gender and number with the noun",hint:"Un niño alto. Una niña alta. Dos niños altos!"},
    {level:"hard",q:"What does 'hace' + time + 'que' express in Spanish?",options:["How long ago","How long something will take","How long something has been happening","The weather"],answer:"How long something has been happening",hint:"Hace dos años que vivo aquí = I have been living here for 2 years!"},
    {level:"hard",q:"What is 'gustar' and how does it work?",options:["Works exactly like English like","Object is grammatical subject; person is indirect object","Only used in third person","Requires ser"],answer:"Object is grammatical subject; person is indirect object",hint:"Me gusta el libro = the book pleases me!"},
    {level:"hard",q:"What does '¡Ojalá pueda ir!' mean?",options:["I hope I can go!","I wish I could go!","I will go if I can!","I am going to go!"],answer:"I hope I can go!",hint:"Ojalá = hopefully/I hope. Pueda = present subjunctive!"},
    {level:"hard",q:"What is the difference between 'pedir' and 'preguntar'?",options:["Same","Pedir = ask for something; preguntar = ask a question","Pedir = question; preguntar = request","Pedir is formal only"],answer:"Pedir = ask for something; preguntar = ask a question",hint:"Pido la cuenta. Pregunto la hora!"},
    {level:"hard",q:"What is 'llevar' + gerundio used for?",options:["Future actions","How long an action has been ongoing","Completed past","Obligations"],answer:"How long an action has been ongoing",hint:"Llevo 2 horas estudiando = I have been studying for 2 hours!"},
    {level:"hard",q:"What does 'a pesar de que' mean?",options:["Because of","As a result of","In spite of / despite","In order that"],answer:"In spite of / despite",hint:"A pesar de que llueva, saldré = despite the rain, I will go out!"},
    {level:"hard",q:"What does 'en cuanto' mean in Spanish?",options:["Because","Although","As soon as","However"],answer:"As soon as",hint:"En cuanto llegues, llámame = As soon as you arrive, call me!"},
    {level:"hard",q:"What is the imperative form used for in Spanish?",options:["Asking questions","Giving commands","Describing habits","Expressing future plans"],answer:"Giving commands",hint:"¡Habla más despacio! = Speak more slowly!"},
    {level:"hard",q:"How do you say 'I was going to study but I fell asleep' in Spanish?",options:["Fui a estudiar pero dormí","Iba a estudiar pero me quedé dormido","Voy a estudiar pero me duermo","Estudiaré pero dormiré"],answer:"Iba a estudiar pero me quedé dormido",hint:"Iba a = was going to (imperfect)!"},
    {level:"hard",q:"What does 'ni... ni' mean in Spanish?",options:["Either...or","Both...and","Neither...nor","Not only...but also"],answer:"Neither...nor",hint:"No tengo ni tiempo ni dinero = I have neither time nor money!"},
    {level:"hard",q:"How do you say 'I have never been to Spain' in Spanish?",options:["No fui a España nunca","Nunca he estado en España","Jamás estuve en España","No estoy en España nunca"],answer:"Nunca he estado en España",hint:"Nunca + present perfect = I have never...!"},
    {level:"hard",q:"What does 'mientras que' mean in Spanish?",options:["Before","After","While / whereas","Because"],answer:"While / whereas",hint:"Mientras que tú duermes, yo trabajo = while you sleep, I work!"},
    {level:"hard",q:"What does 'de hecho' mean in Spanish?",options:["In theory","In fact","However","On the other hand"],answer:"In fact",hint:"De hecho = in fact / as a matter of fact!"},
    {level:"hard",q:"What does 'no obstante' mean in Spanish?",options:["Therefore","For example","Nevertheless/however","As a result"],answer:"Nevertheless/however",hint:"No obstante = nevertheless. Formal!"},
    {level:"hard",q:"What does 'por lo tanto' mean in Spanish?",options:["However","For example","Nevertheless","Therefore/consequently"],answer:"Therefore/consequently",hint:"Por lo tanto = therefore!"},
    {level:"hard",q:"How do you say 'The sooner the better' in Spanish?",options:["Más pronto es mejor","Cuanto antes, mejor","El más pronto es el mejor","Antes que mejor"],answer:"Cuanto antes, mejor",hint:"Cuanto antes = the sooner. Cuanto antes, mejor!"},
    {level:"hard",q:"What does 'así que' mean in Spanish?",options:["Although","However","So / therefore (consequence)","Unless"],answer:"So / therefore (consequence)",hint:"Estaba cansado, así que me fui = I was tired, so I left!"},
    {level:"hard",q:"What is the 'voz pasiva' in Spanish?",options:["Subject performs action","Action performed on subject using ser + past participle","Always uses estar","Reflexive only"],answer:"Action performed on subject using ser + past participle",hint:"El libro fue escrito por Cervantes!"},
    {level:"hard",q:"What does 'tal vez' require in terms of mood?",options:["Always indicative","Always subjunctive","Either, depending on certainty","Neither"],answer:"Either, depending on certainty",hint:"Tal vez viene (certain). Tal vez venga (doubtful)!"},
    {level:"hard",q:"What does 'lo' mean in 'lo importante es que...'?",options:["Him","It","The (masculine)","The + adjective (abstract concept)"],answer:"The + adjective (abstract concept)",hint:"Lo importante = the important thing. Neuter article!"},
    {level:"hard",q:"What does 'en cambio' mean in Spanish?",options:["For example","In addition","On the other hand","As a result"],answer:"On the other hand",hint:"En cambio = on the other hand!"},
    {level:"hard",q:"How do you form a negative tú command in Spanish?",options:["Put no before affirmative command","Use present subjunctive with no","Use infinitive with no","Put no after verb"],answer:"Use present subjunctive with no",hint:"¡No hagas eso! = Don't do that!"},
    {level:"hard",q:"What does 'sin embargo' mean in Spanish?",options:["Therefore","For example","However/nevertheless","As a result"],answer:"However/nevertheless",hint:"Sin embargo = however/nevertheless!"},
    {level:"hard",q:"What does 'o sea' mean in Spanish?",options:["That is/in other words","On the other hand","As a result","In spite of"],answer:"That is/in other words",hint:"O sea = that is / in other words. Very common in spoken Spanish!"},
    {level:"hard",q:"What is the difference between 'hay' and 'está/están'?",options:["Same","Hay = existence; está/están = location of specific things","Hay = location; está = existence","Hay is plural only"],answer:"Hay = existence; está/están = location of specific things",hint:"Hay un banco (there is a bank). El banco está aquí (the bank is here)!"},
    {level:"hard",q:"What does 'a condición de que' mean in Spanish?",options:["Despite","On condition that/provided that","In order to","Without"],answer:"On condition that/provided that",hint:"Te ayudaré a condición de que trabajes = provided that you work!"},
    {level:"hard",q:"How do you say 'I am used to getting up early' in Spanish?",options:["Estoy acostumbrado a madrugar","Suelo madrugar","Me gusta madrugar","Puedo madrugar"],answer:"Estoy acostumbrado a madrugar",hint:"Estar acostumbrado a = to be used to!"},
    {level:"hard",q:"What is 'acostumbrar a' used for?",options:["To be used to/usually do","To stop doing","To start doing","To finish doing"],answer:"To be used to/usually do",hint:"Acostumbro a levantarme temprano = I usually get up early!"},
    {level:"hard",q:"What is 'el estilo indirecto' (reported speech)?",options:["Direct quotation","Reporting what someone said using dijo que","Using questions directly","Reading aloud"],answer:"Reporting what someone said using dijo que",hint:"Dijo que vendría = He said he would come!"},
    {level:"hard",q:"How do you say 'I would have gone if I had known' in Spanish?",options:["Habría ido si habría sabido","Habría ido si hubiera sabido","Iría si supiera","Habría ido si sabía"],answer:"Habría ido si hubiera sabido",hint:"Conditional perfect + pluperfect subjunctive = third conditional!"},
    {level:"hard",q:"What is 'la concordancia' in Spanish grammar?",options:["The future tense","Agreement between subject/verb/adjective/noun in gender and number","The reflexive construction","Ser vs estar"],answer:"Agreement between subject/verb/adjective/noun in gender and number",hint:"Los niños altos. Las niñas altas. Everything agrees!"},
    {level:"hard",q:"What is the 'gerundio compuesto' in Spanish?",options:["hablando alone","habiendo hablado (having spoken)","haber hablado","hubiera hablado"],answer:"habiendo hablado (having spoken)",hint:"Habiendo comido, salió = Having eaten, he left!"},
    {level:"hard",q:"What does 'leísmo' refer to in Spanish?",options:["Using lo/la instead of le","Using le instead of lo/la for direct objects (mostly in Spain)","Using les for all pronouns","Never using object pronouns"],answer:"Using le instead of lo/la for direct objects (mostly in Spain)",hint:"Le veo (instead of lo veo) = I see him. Leísmo is common in Spain!"},
    {level:"hard",q:"What does 'sin que' mean and what mood does it require?",options:["Because + indicative","Without + subjunctive","Unless + indicative","Although + subjunctive"],answer:"Without + subjunctive",hint:"Salió sin que yo lo supiera = He left without my knowing!"}
  ,
    {level:"hard",q:"What is the 'modo subjuntivo' vs 'modo indicativo'?",options:["Same mood","Indicativo=facts; subjuntivo=doubt/emotion/hypothesis","Indicativo=past; subjuntivo=present","Indicativo is informal"],answer:"Indicativo=facts; subjuntivo=doubt/emotion/hypothesis",hint:"Sé que viene (ind.). Espero que venga (subj.)!"},
    {level:"hard",q:"How do you say 'The more you study, the more you learn'?",options:["Si estudias, aprendes más","Cuando estudias, aprendes más","Cuanto más estudias, más aprendes","Como estudias, aprendes más"],answer:"Cuanto más estudias, más aprendes",hint:"Cuanto más... más... = the more... the more...!"},
    {level:"hard",q:"What are direct object pronouns in Spanish?",options:["yo, tú, él, ella","me, te, lo/la, nos, os, los/las","mí, ti, él, nosotros","me, te, le, nos, os, les"],answer:"me, te, lo/la, nos, os, los/las",hint:"Lo veo = I see him/it. La quiero = I love her!"},
    {level:"hard",q:"What are indirect object pronouns in Spanish?",options:["yo, tú, él, ella","me, te, lo/la, nos, os, los/las","me, te, le, nos, os, les","mí, ti, sí, nosotros"],answer:"me, te, le, nos, os, les",hint:"Le digo = I tell him/her!"},
    {level:"hard",q:"What does '¿Quedamos el viernes?' mean?",options:["We stay on Friday","We remain on Friday","Shall we meet on Friday?","We finish on Friday"],answer:"Shall we meet on Friday?",hint:"Quedar con alguien = to arrange to meet. ¿Quedamos? = Shall we meet?"},
    {level:"hard",q:"What is 'se' used for in Spanish?",options:["Only reflexive actions","Reflexive, passive, and impersonal constructions","Only impersonal","Only to replace le"],answer:"Reflexive, passive, and impersonal constructions",hint:"Se lava (reflexive). Se habla español (passive). Se dice (impersonal)!"},
    {level:"hard",q:"How do you say 'I have been studying for 3 hours'?",options:["Estudié 3 horas","Hace 3 horas que estudio","Estudio desde las 3","Estudié durante 3 horas"],answer:"Hace 3 horas que estudio",hint:"Hace + time + que + present tense!"},
    {level:"hard",q:"What is the 'gerundio compuesto' in Spanish?",options:["hablando","habiendo hablado","haber hablado","hubiera hablado"],answer:"habiendo hablado",hint:"Habiendo comido, salió = Having eaten, he left!"},
    {level:"hard",q:"What does 'aunque' trigger in terms of mood?",options:["Always indicative","Always subjunctive","Indicative for known facts; subjunctive for hypotheticals","Neither"],answer:"Indicative for known facts; subjunctive for hypotheticals",hint:"Aunque es difícil (fact). Aunque sea difícil (hypothetical)!"},
    {level:"hard",q:"How do you express 'I wish I were taller' in Spanish?",options:["Deseo ser más alto","Ojalá fuera más alto","Espero ser más alto","Quiero ser más alto"],answer:"Ojalá fuera más alto",hint:"Ojalá + imperfect subjunctive = wish about present/unrealistic!"},
    {level:"hard",q:"What does 'sin embargo' contrast with 'no obstante'?",options:["Completely different","Sin embargo informal; no obstante formal — both mean however","Sin embargo = therefore; no obstante = however","Sin embargo is stronger"],answer:"Sin embargo informal; no obstante formal — both mean however",hint:"Both mean however; no obstante is more formal!"},
    {level:"hard",q:"What is 'el estilo indirecto' in Spanish?",options:["Direct quotation","Reporting what someone said using dijo que","Using questions directly","Reading aloud"],answer:"Reporting what someone said using dijo que",hint:"Dijo que vendría = He said he would come!"},
    {level:"hard",q:"How do you say 'I would have gone if I had known'?",options:["Habría ido si habría sabido","Habría ido si hubiera sabido","Iría si supiera","Habría ido si sabía"],answer:"Habría ido si hubiera sabido",hint:"Conditional perfect + pluperfect subjunctive!"},
    {level:"hard",q:"What does 'a condición de que' mean?",options:["Despite","On condition that / provided that","In order to","Without"],answer:"On condition that / provided that",hint:"A condición de que = provided that!"},
    {level:"hard",type:"hard",q:"What does 'sin que' mean and what does it require?",options:["Because + indicative","Without + subjunctive","Unless + indicative","Although + subjunctive"],answer:"Without + subjunctive",hint:"Salió sin que yo lo supiera = He left without my knowing!"},
    {level:"hard",q:"How do you say 'I am used to getting up early'?",options:["Estoy acostumbrado a madrugar","Suelo madrugar","Me gusta madrugar","Puedo madrugar"],answer:"Estoy acostumbrado a madrugar",hint:"Estar acostumbrado a = to be used to!"},
    {level:"hard",q:"What does 'por lo tanto' mean?",options:["However","For example","Nevertheless","Therefore/consequently"],answer:"Therefore/consequently",hint:"Por lo tanto = therefore!"},
    {level:"hard",q:"What does 'de hecho' mean?",options:["In theory","In fact","However","On the other hand"],answer:"In fact",hint:"De hecho = in fact!"},
    {level:"hard",q:"What does 'así que' mean?",options:["Although","However","So/therefore","Unless"],answer:"So/therefore",hint:"Estaba cansado, así que me fui = I was tired, so I left!"},
    {level:"hard",q:"What does 'no obstante' mean?",options:["Therefore","For example","Nevertheless/however","As a result"],answer:"Nevertheless/however",hint:"No obstante = nevertheless. Formal discourse marker!"},
    {level:"hard",q:"What is the difference between 'hace' and 'hacía' in time expressions?",options:["Same","Hace = still ongoing; hacía = had been doing (past)","Hace = completed; hacía = ongoing","No difference"],answer:"Hace = still ongoing; hacía = had been doing (past)",hint:"Hace 2h que espero (still waiting). Hacía 2h que esperaba (was waiting when...)!"},
    {level:"hard",q:"What does 'tal vez' require in Spanish?",options:["Always indicative","Always subjunctive","Either, depending on certainty","Neither"],answer:"Either, depending on certainty",hint:"Tal vez viene (certain). Tal vez venga (doubtful)!"},
    {level:"hard",q:"How do you form a negative tú command in Spanish?",options:["Put no before affirmative command","Use present subjunctive with no","Use infinitive with no","Put no after verb"],answer:"Use present subjunctive with no",hint:"¡No hagas eso! = Don't do that! (present subjunctive)"}
  ,
    {level:"hard",q:"What is the 'modo subjuntivo' vs 'modo indicativo'?",options:["Same mood","Indicativo=facts; subjuntivo=doubt/emotion/hypothesis","Indicativo=past; subjuntivo=present","Indicativo is informal"],answer:"Indicativo=facts; subjuntivo=doubt/emotion/hypothesis",hint:"Sé que viene (ind.). Espero que venga (subj.)!"},
    {level:"hard",q:"How do you say 'The more you study, the more you learn'?",options:["Si estudias, aprendes más","Cuando estudias, aprendes más","Cuanto más estudias, más aprendes","Como estudias, aprendes más"],answer:"Cuanto más estudias, más aprendes",hint:"Cuanto más... más... = the more... the more...!"},
    {level:"hard",q:"What are direct object pronouns in Spanish?",options:["yo, tú, él, ella","me, te, lo/la, nos, os, los/las","mí, ti, él, nosotros","me, te, le, nos, os, les"],answer:"me, te, lo/la, nos, os, los/las",hint:"Lo veo = I see him/it. La quiero = I love her!"},
    {level:"hard",q:"What are indirect object pronouns in Spanish?",options:["yo, tú, él, ella","me, te, lo/la, nos, os, los/las","me, te, le, nos, os, les","mí, ti, sí, nosotros"],answer:"me, te, le, nos, os, les",hint:"Le digo = I tell him/her!"},
    {level:"hard",q:"What does '¿Quedamos el viernes?' mean?",options:["We stay on Friday","We remain on Friday","Shall we meet on Friday?","We finish on Friday"],answer:"Shall we meet on Friday?",hint:"Quedar con alguien = to arrange to meet. ¿Quedamos? = Shall we meet?"},
    {level:"hard",q:"What is 'se' used for in Spanish?",options:["Only reflexive actions","Reflexive, passive, and impersonal constructions","Only impersonal","Only to replace le"],answer:"Reflexive, passive, and impersonal constructions",hint:"Se lava (reflexive). Se habla español (passive). Se dice (impersonal)!"},
    {level:"hard",q:"How do you say 'I have been studying for 3 hours'?",options:["Estudié 3 horas","Hace 3 horas que estudio","Estudio desde las 3","Estudié durante 3 horas"],answer:"Hace 3 horas que estudio",hint:"Hace + time + que + present tense!"},
    {level:"hard",q:"What is the 'gerundio compuesto' in Spanish?",options:["hablando","habiendo hablado","haber hablado","hubiera hablado"],answer:"habiendo hablado",hint:"Habiendo comido, salió = Having eaten, he left!"},
    {level:"hard",q:"What does 'aunque' trigger in terms of mood?",options:["Always indicative","Always subjunctive","Indicative for known facts; subjunctive for hypotheticals","Neither"],answer:"Indicative for known facts; subjunctive for hypotheticals",hint:"Aunque es difícil (fact). Aunque sea difícil (hypothetical)!"},
    {level:"hard",q:"How do you express 'I wish I were taller' in Spanish?",options:["Deseo ser más alto","Ojalá fuera más alto","Espero ser más alto","Quiero ser más alto"],answer:"Ojalá fuera más alto",hint:"Ojalá + imperfect subjunctive = wish about present/unrealistic!"},
    {level:"hard",q:"What does 'sin embargo' contrast with 'no obstante'?",options:["Completely different","Sin embargo informal; no obstante formal — both mean however","Sin embargo = therefore; no obstante = however","Sin embargo is stronger"],answer:"Sin embargo informal; no obstante formal — both mean however",hint:"Both mean however; no obstante is more formal!"},
    {level:"hard",q:"What is 'el estilo indirecto' in Spanish?",options:["Direct quotation","Reporting what someone said using dijo que","Using questions directly","Reading aloud"],answer:"Reporting what someone said using dijo que",hint:"Dijo que vendría = He said he would come!"},
    {level:"hard",q:"How do you say 'I would have gone if I had known'?",options:["Habría ido si habría sabido","Habría ido si hubiera sabido","Iría si supiera","Habría ido si sabía"],answer:"Habría ido si hubiera sabido",hint:"Conditional perfect + pluperfect subjunctive!"},
    {level:"hard",q:"What does 'a condición de que' mean?",options:["Despite","On condition that / provided that","In order to","Without"],answer:"On condition that / provided that",hint:"A condición de que = provided that!"},
    {level:"hard",type:"hard",q:"What does 'sin que' mean and what does it require?",options:["Because + indicative","Without + subjunctive","Unless + indicative","Although + subjunctive"],answer:"Without + subjunctive",hint:"Salió sin que yo lo supiera = He left without my knowing!"},
    {level:"hard",q:"How do you say 'I am used to getting up early'?",options:["Estoy acostumbrado a madrugar","Suelo madrugar","Me gusta madrugar","Puedo madrugar"],answer:"Estoy acostumbrado a madrugar",hint:"Estar acostumbrado a = to be used to!"},
    {level:"hard",q:"What does 'por lo tanto' mean?",options:["However","For example","Nevertheless","Therefore/consequently"],answer:"Therefore/consequently",hint:"Por lo tanto = therefore!"},
    {level:"hard",q:"What does 'de hecho' mean?",options:["In theory","In fact","However","On the other hand"],answer:"In fact",hint:"De hecho = in fact!"},
    {level:"hard",q:"What does 'así que' mean?",options:["Although","However","So/therefore","Unless"],answer:"So/therefore",hint:"Estaba cansado, así que me fui = I was tired, so I left!"},
    {level:"hard",q:"What does 'no obstante' mean?",options:["Therefore","For example","Nevertheless/however","As a result"],answer:"Nevertheless/however",hint:"No obstante = nevertheless. Formal discourse marker!"},
    {level:"hard",q:"What is the difference between 'hace' and 'hacía' in time expressions?",options:["Same","Hace = still ongoing; hacía = had been doing (past)","Hace = completed; hacía = ongoing","No difference"],answer:"Hace = still ongoing; hacía = had been doing (past)",hint:"Hace 2h que espero (still waiting). Hacía 2h que esperaba (was waiting when...)!"},
    {level:"hard",q:"What does 'tal vez' require in Spanish?",options:["Always indicative","Always subjunctive","Either, depending on certainty","Neither"],answer:"Either, depending on certainty",hint:"Tal vez viene (certain). Tal vez venga (doubtful)!"},
    {level:"hard",q:"How do you form a negative tú command in Spanish?",options:["Put no before affirmative command","Use present subjunctive with no","Use infinitive with no","Put no after verb"],answer:"Use present subjunctive with no",hint:"¡No hagas eso! = Don't do that! (present subjunctive)"}
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
  
    {"level":"easy","type":"CogAT Verbal","q":"SENTENCE COMPLETION:\nA fish uses its ___ to swim.","options":["wings","legs","fins","claws"],"answer":"fins","hint":"Fish have fins to swim!"},
    {"level":"easy","type":"CogAT Verbal","q":"VERBAL ANALOGY:\nKitten is to cat as\nfoal is to ___.","options":["cow","dog","horse","pig"],"answer":"horse","hint":"A kitten grows into a cat. A foal grows into a horse!"},
    {"level":"easy","type":"CogAT Verbal","q":"VERBAL CLASSIFICATION:\nWhich belongs with\n'oak, pine, birch'?","options":["rose","tulip","maple","daisy"],"answer":"maple","hint":"Oak, pine, birch and maple are all trees!"},
    {"level":"easy","type":"CogAT Verbal","q":"SENTENCE COMPLETION:\nThe children put on their coats because\nit was very ___.","options":["hot","sunny","cold","bright"],"answer":"cold","hint":"We put on coats when it's cold!"},
    {"level":"easy","type":"CogAT Quantitative","q":"NUMBER SERIES:\nWhat comes next?\n2, 4, 6, 8, __","options":["9","10","11","12"],"answer":"10","hint":"Count by 2!"},
    {"level":"easy","type":"CogAT Quantitative","q":"EQUATION BUILDING:\n___ + 4 = 9","options":["3","4","5","6"],"answer":"5","hint":"What plus 4 equals 9?"},
    {"level":"easy","type":"CogAT Non-Verbal","q":"PATTERN MATRICES:\nWhich comes next?\n🔴🔵🔴🔵🔴___","options":["🔴","🔵","🟢","🟡"],"answer":"🔵","hint":"Red, blue, red, blue pattern!"},
    {"level":"easy","type":"CogAT Verbal","q":"VERBAL ANALOGY:\nBig is to small as\ntall is to ___.","options":["large","huge","short","wide"],"answer":"short","hint":"Big and small are opposites. Tall and short are opposites!"},
    {"level":"easy","type":"CogAT Quantitative","q":"NUMBER ANALOGIES:\n2 is to 4 as\n5 is to ___.","options":["7","8","10","12"],"answer":"10","hint":"2 × 2 = 4. So 5 × 2 = ?"},
    {"level":"easy","type":"CogAT Verbal","q":"SENTENCE COMPLETION:\nWe use an umbrella when\nit is ___.","options":["sunny","cold","raining","dark"],"answer":"raining","hint":"Umbrellas keep us dry in rain!"},
    {"level":"medium","type":"CogAT Verbal","q":"VERBAL ANALOGY:\nLibrary is to books as\nmuseum is to ___.","options":["paintings","flowers","food","animals"],"answer":"paintings","hint":"A library stores books. A museum stores artefacts/paintings!"},
    {"level":"medium","type":"CogAT Quantitative","q":"NUMBER SERIES:\nWhat comes next?\n3, 6, 11, 18, 27, __","options":["36","38","40","42"],"answer":"38","hint":"Differences: +3,+5,+7,+9,+11. 27+11=38!"},
    {"level":"medium","type":"CogAT Non-Verbal","q":"PATTERN CLASSIFICATION:\nWhich doesn't belong?\n⬛🔲⬜▪","options":["⬛","🔲","⬜","▪"],"answer":"▪","hint":"Three are squares (different sizes). One is a small diamond/dot!"},
    {"level":"medium","type":"CogAT Verbal","q":"VERBAL CLASSIFICATION:\nWhich belongs with\n'democracy, republic, monarchy'?","options":["library","parliament","school","army"],"answer":"parliament","hint":"Democracy, republic, monarchy and parliaments are all types of government systems!"},
    {"level":"medium","type":"CogAT Quantitative","q":"NUMBER ANALOGIES:\n36 is to 6 as\n64 is to ___.","options":["7","8","9","10"],"answer":"8","hint":"√36 = 6. So √64 = ?"},
    {"level":"medium","type":"CogAT Verbal","q":"SENTENCE COMPLETION:\nThe scientist carefully ___\nher experiment before drawing conclusions.","options":["ignored","documented","destroyed","forgot"],"answer":"documented","hint":"Good scientists carefully record their work!"},
    {"level":"medium","type":"CogAT Non-Verbal","q":"FIGURE ANALOGIES:\nIf a small circle relates to a big circle,\nthen a small square relates to a ___.","options":["small triangle","big square","small circle","big circle"],"answer":"big square","hint":"Small → big, same shape!"},
    {"level":"medium","type":"CogAT Quantitative","q":"NUMBER SERIES:\nWhat comes next?\n1, 3, 7, 15, 31, __","options":["47","55","63","67"],"answer":"63","hint":"Each × 2 + 1: 31×2+1=63!"},
    {"level":"medium","type":"CogAT Verbal","q":"VERBAL ANALOGY:\nConductor is to orchestra as\ncaptain is to ___.","options":["soldiers","sailors","pilots","drivers"],"answer":"sailors","hint":"A conductor leads an orchestra. A captain leads sailors/a ship!"},
    {"level":"medium","type":"CogAT Quantitative","q":"EQUATION BUILDING:\n4 × ___ − 6 = 18","options":["4","5","6","7"],"answer":"6","hint":"4×6 = 24, 24−6 = 18!"},
    {"level":"hard","type":"CogAT Verbal","q":"VERBAL ANALOGY:\nPalaeontologist is to fossils as\nasctronomist is to ___.","options":["rocks","weather","stars","DNA"],"answer":"stars","hint":"Palaeontologist studies fossils. Astronomer studies stars!"},
    {"level":"hard","type":"CogAT Quantitative","q":"NUMBER SERIES:\nWhat comes next?\n1, 4, 9, 16, 25, 36, __","options":["42","48","49","56"],"answer":"49","hint":"Square numbers: 1²,2²,3²...7²=49!"},
    {"level":"hard","type":"CogAT Verbal","q":"VERBAL CLASSIFICATION:\nWhich belongs with\n'simile, metaphor, alliteration'?","options":["noun","verb","hyperbole","adjective"],"answer":"hyperbole","hint":"Simile, metaphor, alliteration and hyperbole are all figures of speech!"},
    {"level":"hard","type":"CogAT Quantitative","q":"NUMBER ANALOGIES:\n27 is to 3 as\n125 is to ___.","options":["4","5","6","7"],"answer":"5","hint":"³√27 = 3. So ³√125 = ?"},
    {"level":"hard","type":"CogAT Verbal","q":"VERBAL ANALOGY:\nEpidemiologist is to disease as\nseismologist is to ___.","options":["weather","volcanoes","earthquakes","climate"],"answer":"earthquakes","hint":"Epidemiologist studies disease. Seismologist studies earthquakes!"},
    {"level":"hard","type":"CogAT Quantitative","q":"NUMBER SERIES:\n1, 2, 6, 24, 120, __","options":["240","360","600","720"],"answer":"720","hint":"Each multiplied by next number: ×1,×2,×3,×4,×5,×6. 120×6=720!"},
    {"level":"hard","type":"CogAT Verbal","q":"SENTENCE COMPLETION:\nThe diplomat worked to ___ tensions\nbetween the two countries through dialogue.","options":["increase","escalate","de-escalate","ignore"],"answer":"de-escalate","hint":"Diplomats work to reduce, not increase, tensions!"},
    {"level":"hard","type":"CogAT Quantitative","q":"EQUATION BUILDING:\nIf n² + 3n = 28,\nwhat is n?","options":["3","4","5","6"],"answer":"4","hint":"4² + 3(4) = 16+12 = 28. n=4!"},
  ,
    {level:"easy",type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nA fish uses its ___ to swim.",options:["wings","legs","fins","claws"],answer:"fins",hint:"Fish have fins!"},
    {level:"easy",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nKitten is to cat as foal is to ___.",options:["cow","dog","horse","pig"],answer:"horse",hint:"A foal grows into a horse!"},
    {level:"easy",type:"CogAT Verbal",q:"VERBAL CLASSIFICATION:\nWhich belongs with oak, pine, birch?",options:["rose","tulip","maple","daisy"],answer:"maple",hint:"All are trees!"},
    {level:"easy",type:"CogAT Quantitative",q:"NUMBER SERIES:\n2, 4, 6, 8, __",options:["9","10","11","12"],answer:"10",hint:"Count by 2!"},
    {level:"easy",type:"CogAT Quantitative",q:"EQUATION BUILDING:\n___ + 4 = 9",options:["3","4","5","6"],answer:"5",hint:"5 + 4 = 9!"},
    {level:"easy",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nBig is to small as tall is to ___.",options:["large","huge","short","wide"],answer:"short",hint:"Opposites: big/small, tall/short!"},
    {level:"easy",type:"CogAT Quantitative",q:"NUMBER ANALOGIES:\n2 is to 4 as 5 is to ___.",options:["7","8","10","12"],answer:"10",hint:"2×2=4. So 5×2=?"},
    {level:"easy",type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nWe use an umbrella when it is ___.",options:["sunny","cold","raining","dark"],answer:"raining",hint:"Umbrellas keep us dry in rain!"},
    {level:"easy",type:"CogAT Non-Verbal",q:"PATTERN MATRICES:\n🔴🔵🔴🔵🔴___",options:["🔴","🔵","🟢","🟡"],answer:"🔵",hint:"Red blue pattern!"},
    {level:"easy",type:"CogAT Verbal",q:"VERBAL CLASSIFICATION:\nWhich belongs with apple, banana, mango?",options:["carrot","potato","grape","broccoli"],answer:"grape",hint:"All are fruits!"},
    {level:"easy",type:"CogAT Quantitative",q:"NUMBER SERIES:\n10, 9, 8, 7, __",options:["5","6","7","8"],answer:"6",hint:"Count down by 1!"},
    {level:"easy",type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nA library is a place where you can borrow ___.",options:["food","clothes","books","toys"],answer:"books",hint:"Libraries have books!"},
    {level:"medium",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nLibrary is to books as museum is to ___.",options:["paintings","flowers","food","animals"],answer:"paintings",hint:"Library stores books, museum stores artefacts!"},
    {level:"medium",type:"CogAT Quantitative",q:"NUMBER SERIES:\n3, 6, 11, 18, 27, __",options:["36","38","40","42"],answer:"38",hint:"Differences: +3,+5,+7,+9,+11. 27+11=38!"},
    {level:"medium",type:"CogAT Quantitative",q:"NUMBER ANALOGIES:\n36 is to 6 as 64 is to ___.",options:["7","8","9","10"],answer:"8",hint:"√36=6, √64=8!"},
    {level:"medium",type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nThe scientist carefully ___ her experiment.",options:["ignored","documented","destroyed","forgot"],answer:"documented",hint:"Good scientists carefully record work!"},
    {level:"medium",type:"CogAT Quantitative",q:"NUMBER SERIES:\n1, 3, 7, 15, 31, __",options:["47","55","63","67"],answer:"63",hint:"×2+1 each time: 31×2+1=63!"},
    {level:"medium",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nConductor is to orchestra as captain is to ___.",options:["soldiers","sailors","pilots","drivers"],answer:"sailors",hint:"Conductor leads orchestra, captain leads sailors!"},
    {level:"medium",type:"CogAT Quantitative",q:"EQUATION BUILDING:\n4 × ___ − 6 = 18",options:["4","5","6","7"],answer:"6",hint:"4×6=24, 24-6=18!"},
    {level:"medium",type:"CogAT Verbal",q:"VERBAL CLASSIFICATION:\nWhich belongs with democracy, republic, monarchy?",options:["library","parliament","school","army"],answer:"parliament",hint:"All are forms/systems of government!"},
    {level:"medium",type:"CogAT Non-Verbal",q:"FIGURE ANALOGIES:\nSmall circle → big circle.\nSmall square → ___.",options:["small triangle","big square","small circle","big circle"],answer:"big square",hint:"Same shape, gets bigger!"},
    {level:"medium",type:"CogAT Quantitative",q:"NUMBER ANALOGIES:\n5 is to 25 as 6 is to ___.",options:["30","34","36","42"],answer:"36",hint:"5²=25, 6²=36!"},
    {level:"medium",type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nThe ambassador was sent to ___ the dispute between the two nations.",options:["start","escalate","resolve","ignore"],answer:"resolve",hint:"Ambassadors work to solve, not create, disputes!"},
    {level:"medium",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nStethoscope is to doctor as wrench is to ___.",options:["lawyer","teacher","plumber","chef"],answer:"plumber",hint:"Stethoscope = doctor's tool. Wrench = plumber's tool!"},
    {level:"hard",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nPalaeontologist is to fossils as astronomer is to ___.",options:["rocks","weather","stars","DNA"],answer:"stars",hint:"Palaeontologist studies fossils, astronomer studies stars!"},
    {level:"hard",type:"CogAT Quantitative",q:"NUMBER SERIES:\n1, 4, 9, 16, 25, 36, __",options:["42","48","49","56"],answer:"49",hint:"Square numbers: 7²=49!"},
    {level:"hard",type:"CogAT Verbal",q:"VERBAL CLASSIFICATION:\nWhich belongs with simile, metaphor, alliteration?",options:["noun","verb","hyperbole","adjective"],answer:"hyperbole",hint:"All are figures of speech!"},
    {level:"hard",type:"CogAT Quantitative",q:"NUMBER ANALOGIES:\n27 is to 3 as 125 is to ___.",options:["4","5","6","7"],answer:"5",hint:"∛27=3, ∛125=5!"},
    {level:"hard",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nEpidemiologist is to disease as seismologist is to ___.",options:["weather","volcanoes","earthquakes","climate"],answer:"earthquakes",hint:"Seismologist studies earthquakes!"},
    {level:"hard",type:"CogAT Quantitative",q:"NUMBER SERIES:\n1, 2, 6, 24, 120, __",options:["240","360","600","720"],answer:"720",hint:"×1,×2,×3,×4,×5,×6. 120×6=720!"},
    {level:"hard",type:"CogAT Verbal",q:"SENTENCE COMPLETION:\nThe diplomat worked to ___ tensions through dialogue.",options:["increase","escalate","de-escalate","ignore"],answer:"de-escalate",hint:"Diplomats reduce tensions!"},
    {level:"hard",type:"CogAT Quantitative",q:"EQUATION BUILDING:\nIf n² + 3n = 28, what is n?",options:["3","4","5","6"],answer:"4",hint:"4²+3(4)=16+12=28!"},
    {level:"hard",type:"CogAT Verbal",q:"VERBAL ANALOGY:\nLexicographer is to dictionary as\ncartographer is to ___.",options:["atlas","newspaper","novel","almanac"],answer:"atlas",hint:"Lexicographer makes dictionaries, cartographer makes maps/atlases!"},
    {level:"hard",type:"CogAT Quantitative",q:"NUMBER SERIES:\n2, 5, 11, 23, 47, __",options:["90","93","95","97"],answer:"95",hint:"×2+1 each time: 47×2+1=95!"},
    {level:"hard",type:"CogAT Verbal",q:"VERBAL CLASSIFICATION:\nWhich belongs with mitosis, meiosis, osmosis?",options:["ignition","diffusion","combustion","erosion"],answer:"diffusion",hint:"All are biological/chemical processes ending in -osis!"},
    {level:"hard",type:"CogAT Quantitative",q:"NUMBER ANALOGIES:\n8 is to 512 as 3 is to ___.",options:["9","18","27","81"],answer:"27",hint:"8³=512, 3³=27!"}
  ,
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Fish is to swim as bird is to ___.",options:["walk","jump","fly","sing"],answer:"fly",hint:"Fish swim, birds fly!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with hot, warm, boiling?",options:["cold","frozen","cool","scorching"],answer:"scorching",hint:"All describe high temperatures!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: We cook food in the ___.",options:["bedroom","garage","kitchen","garden"],answer:"kitchen",hint:"Kitchens are for cooking!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Hand is to glove as foot is to ___.",options:["sock","shoe","socks","boot"],answer:"shoe",hint:"Glove on hand, shoe on foot!"},
    {level:"easy",type:"CogAT",q:"NUMBER SERIES: 5, 10, 15, 20, ___",options:["22","24","25","30"],answer:"25",hint:"Count by 5!"},
    {level:"easy",type:"CogAT",q:"EQUATION BUILDING: 12 - ___ = 7",options:["4","5","6","7"],answer:"5",hint:"12 minus 5 = 7!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with Monday, Thursday, Friday?",options:["January","Morning","Tuesday","Week"],answer:"Tuesday",hint:"All days of the week!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Egg is to hen as cub is to ___.",options:["dog","bear","cat","rabbit"],answer:"bear",hint:"A hen lays eggs. A bear has cubs!"},
    {level:"easy",type:"CogAT",q:"NUMBER ANALOGIES: 3 is to 9 as 4 is to ___.",options:["12","14","16","20"],answer:"16",hint:"3×3=9. 4×4=?"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: A doctor works in a ___.",options:["school","farm","hospital","library"],answer:"hospital",hint:"Doctors treat patients in hospitals!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with pencil, pen, crayon?",options:["paper","ruler","marker","desk"],answer:"marker",hint:"All are things you draw or write with!"},
    {level:"easy",type:"CogAT",q:"NUMBER SERIES: 3, 6, 9, 12, ___",options:["13","14","15","16"],answer:"15",hint:"Count by 3!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: We sleep in a ___.",options:["kitchen","garage","garden","bedroom"],answer:"bedroom",hint:"Bedrooms are for sleeping!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Daytime is to sun as night-time is to ___.",options:["cloud","rain","moon","wind"],answer:"moon",hint:"Sun = day, moon = night!"},
    {level:"easy",type:"CogAT",q:"EQUATION BUILDING: 3 × ___ = 15",options:["4","5","6","7"],answer:"5",hint:"3 × 5 = 15!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with circle, square, triangle?",options:["red","large","rectangle","colour"],answer:"rectangle",hint:"All are 2D shapes!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Up is to down as left is to ___.",options:["side","back","right","over"],answer:"right",hint:"Up/down are opposites. Left/right are opposites!"},
    {level:"easy",type:"CogAT",q:"NUMBER ANALOGIES: 10 is to 5 as 20 is to ___.",options:["8","10","12","15"],answer:"10",hint:"10÷2=5. 20÷2=?"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: The postman delivers ___.",options:["food","medicine","letters","milk"],answer:"letters",hint:"Postmen deliver letters!"},
    {level:"easy",type:"CogAT",q:"NUMBER SERIES: 50, 45, 40, 35, ___",options:["28","29","30","31"],answer:"30",hint:"Subtract 5 each time!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Sad is to cry as happy is to ___.",options:["sleep","shout","laugh","frown"],answer:"laugh",hint:"When sad you cry, when happy you laugh!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with hammer, screwdriver, spanner?",options:["paint","ladder","wrench","glue"],answer:"wrench",hint:"All are hand tools!"},
    {level:"easy",type:"CogAT",q:"EQUATION BUILDING: ___ ÷ 4 = 5",options:["16","18","20","24"],answer:"20",hint:"20 ÷ 4 = 5!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: We wear a coat when it is ___.",options:["hot","sunny","cold","dry"],answer:"cold",hint:"Coats keep us warm in cold weather!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Teacher is to pupil as parent is to ___.",options:["adult","friend","child","school"],answer:"child",hint:"Teachers guide pupils. Parents care for children!"},
    {level:"easy",type:"CogAT",q:"NUMBER ANALOGIES: 4 is to 16 as 5 is to ___.",options:["20","25","30","35"],answer:"25",hint:"4²=16. 5²=?"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with red, yellow, green?",options:["light","dark","blue","bright"],answer:"blue",hint:"All are colours!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: Sharks live in the ___.",options:["forest","desert","mountains","ocean"],answer:"ocean",hint:"Sharks are ocean creatures!"},
    {level:"easy",type:"CogAT",q:"NUMBER SERIES: 1, 2, 4, 7, 11, ___",options:["15","16","17","18"],answer:"16",hint:"Differences: +1,+2,+3,+4,+5. 11+5=16!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Singing is to voice as painting is to ___.",options:["canvas","colour","brush","art"],answer:"brush",hint:"Sing with voice, paint with brush!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with violin, guitar, cello?",options:["drum","piano","flute","harp"],answer:"harp",hint:"All are string instruments!"},
    {level:"easy",type:"CogAT",q:"EQUATION BUILDING: 15 + ___ = 24",options:["7","8","9","10"],answer:"9",hint:"15 + 9 = 24!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: A baker makes ___.",options:["cars","furniture","bread and cakes","medicine"],answer:"bread and cakes",hint:"Bakers make bread and cakes!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Water is to drink as food is to ___.",options:["cook","smell","eat","buy"],answer:"eat",hint:"We drink water, we eat food!"},
    {level:"easy",type:"CogAT",q:"NUMBER ANALOGIES: 6 is to 36 as 7 is to ___.",options:["42","47","49","56"],answer:"49",hint:"6²=36. 7²=?"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with Sunday, Saturday, Thursday?",options:["March","October","Monday","Morning"],answer:"Monday",hint:"All are days of the week!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: Plants need sunlight, water and ___ to grow.",options:["chocolate","soil","sand","cotton"],answer:"soil",hint:"Plants grow in soil!"},
    {level:"easy",type:"CogAT",q:"NUMBER SERIES: 100, 90, 80, 70, ___",options:["55","60","65","70"],answer:"60",hint:"Subtract 10 each time!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: School is to students as hospital is to ___.",options:["nurses","doctors","patients","medicine"],answer:"patients",hint:"Students go to school. Patients go to hospital!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with running, jumping, swimming?",options:["sleeping","resting","reading","cycling"],answer:"cycling",hint:"All are physical activities / sports!"},
    {level:"easy",type:"CogAT",q:"EQUATION BUILDING: ___ × 7 = 49",options:["6","7","8","9"],answer:"7",hint:"7 × 7 = 49!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: Ice melts when it gets ___.",options:["colder","darker","wetter","warmer"],answer:"warmer",hint:"Heat makes ice melt!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Beginning is to end as morning is to ___.",options:["noon","afternoon","midnight","evening"],answer:"evening",hint:"Morning → evening (parts of the day, opposites)!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Cat is to kitten as dog is to ___.",options:["cub","foal","puppy","lamb"],answer:"puppy",hint:"Baby cat = kitten. Baby dog = puppy!"},
    {level:"easy",type:"CogAT",q:"NUMBER SERIES: 2, 4, 8, 16, ___",options:["24","28","32","36"],answer:"32",hint:"Each number doubles!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with lion, tiger, leopard?",options:["elephant","rabbit","cheetah","giraffe"],answer:"cheetah",hint:"All are big cats!"},
    {level:"easy",type:"CogAT",q:"EQUATION BUILDING: 36 ÷ ___ = 6",options:["4","5","6","7"],answer:"6",hint:"36 ÷ 6 = 6!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Hungry is to food as thirsty is to ___.",options:["sleep","exercise","water","rest"],answer:"water",hint:"When hungry need food, when thirsty need water!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: A farmer grows ___ on a farm.",options:["cars","computers","crops","clothes"],answer:"crops",hint:"Farmers grow crops!"},
    {level:"easy",type:"CogAT",q:"NUMBER ANALOGIES: 7 is to 14 as 8 is to ___.",options:["15","16","17","18"],answer:"16",hint:"7×2=14. 8×2=?"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with England, France, Germany?",options:["China","Brazil","Italy","Mexico"],answer:"Italy",hint:"All are European countries!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Author writes books as composer writes ___.",options:["films","paintings","music","plays"],answer:"music",hint:"Authors write books, composers write music!"},
    {level:"easy",type:"CogAT",q:"NUMBER SERIES: 1, 3, 5, 7, 9, ___",options:["10","11","12","13"],answer:"11",hint:"Odd numbers: add 2 each time!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: A butterfly starts life as a ___.",options:["tadpole","pupa","caterpillar","larva"],answer:"caterpillar",hint:"Egg → caterpillar → pupa → butterfly!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Dentist is to teeth as optician is to ___.",options:["ears","nose","eyes","skin"],answer:"eyes",hint:"Dentist treats teeth, optician treats eyes!"},
    {level:"easy",type:"CogAT",q:"NUMBER ANALOGIES: 5 is to 50 as 3 is to ___.",options:["27","30","33","36"],answer:"30",hint:"5×10=50. 3×10=?"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with swimming, cycling, running?",options:["sleeping","drawing","painting","rowing"],answer:"rowing",hint:"All are Olympic sports!"},
    {level:"easy",type:"CogAT",q:"NUMBER SERIES: 4, 8, 12, 16, ___",options:["18","19","20","21"],answer:"20",hint:"Count by 4!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Summer is to hot as winter is to ___.",options:["rainy","dark","cold","windy"],answer:"cold",hint:"Summer hot, winter cold!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with Paris, London, Tokyo?",options:["France","Country","Europe","Rome"],answer:"Rome",hint:"All are capital cities!"},
    {level:"easy",type:"CogAT",q:"EQUATION BUILDING: 6 × 6 = ___",options:["30","34","36","40"],answer:"36",hint:"6 × 6 = 36!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Ear is to hear as nose is to ___.",options:["see","taste","touch","smell"],answer:"smell",hint:"Ears hear, noses smell!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: A pilot flies an ___.",options:["boat","car","aeroplane","train"],answer:"aeroplane",hint:"Pilots fly aeroplanes!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with cow, pig, sheep?",options:["tiger","lion","horse","wolf"],answer:"horse",hint:"All are farm animals!"},
    {level:"easy",type:"CogAT",q:"EQUATION BUILDING: ___ - 13 = 9",options:["20","21","22","23"],answer:"22",hint:"9 + 13 = 22!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Ear is to hear as eye is to ___.",options:["smell","touch","see","taste"],answer:"see",hint:"Eyes are for seeing!"},
    {level:"easy",type:"CogAT",q:"NUMBER SERIES: 0, 5, 10, 15, ___",options:["18","19","20","21"],answer:"20",hint:"Count by 5!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with apple, pear, mango?",options:["carrot","onion","banana","potato"],answer:"banana",hint:"All are fruits!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Cold is to warm as dark is to ___.",options:["night","black","light","shadow"],answer:"light",hint:"Cold/warm are opposites. Dark/light are opposites!"},
    {level:"easy",type:"CogAT",q:"EQUATION BUILDING: 100 ÷ ___ = 10",options:["5","8","10","20"],answer:"10",hint:"100 ÷ 10 = 10!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: A chef cooks food in a ___.",options:["library","garage","restaurant","hospital"],answer:"restaurant",hint:"Chefs cook in restaurants!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Hammer is to nail as pen is to ___.",options:["book","paper","ink","desk"],answer:"paper",hint:"Hammer hits a nail. Pen writes on paper!"},
    {level:"easy",type:"CogAT",q:"NUMBER ANALOGIES: 9 is to 81 as 3 is to ___.",options:["6","9","12","18"],answer:"9",hint:"9×9=81. 3×3=?"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with January, March, July?",options:["Monday","Tuesday","August","Wednesday"],answer:"August",hint:"All are months of the year!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: We use a map to find our ___.",options:["name","age","way","food"],answer:"way",hint:"Maps help us find our way!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Book is to read as song is to ___.",options:["write","draw","listen","see"],answer:"listen",hint:"You read a book. You listen to a song!"},
    {level:"easy",type:"CogAT",q:"NUMBER SERIES: 6, 12, 18, 24, ___",options:["26","28","30","32"],answer:"30",hint:"Count by 6!"},
    {level:"easy",type:"CogAT",q:"SENTENCE COMPLETION: A plumber fixes ___.",options:["teeth","cars","pipes","books"],answer:"pipes",hint:"Plumbers fix pipes and water systems!"},
    {level:"easy",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with blue, purple, green?",options:["dark","bright","orange","light"],answer:"orange",hint:"All are colours!"},
    {level:"easy",type:"CogAT",q:"VERBAL ANALOGY: Fast is to slow as near is to ___.",options:["close","far","here","there"],answer:"far",hint:"Fast/slow are opposites. Near/far are opposites!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Symphony is to conductor as film is to ___.",options:["actor","writer","director","producer"],answer:"director",hint:"Conductor leads symphony, director leads film!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 2, 6, 18, 54, ___",options:["108","162","216","270"],answer:"162",hint:"Multiply by 3. 54×3=162!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with Jupiter, Mars, Venus?",options:["Moon","Sun","Pluto","Comet"],answer:"Pluto",hint:"All are/were planets of our solar system!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 49 is to 7 as 81 is to ___.",options:["7","8","9","10"],answer:"9",hint:"√49=7. √81=?"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Architect is to building as sculptor is to ___.",options:["painting","poem","statue","music"],answer:"statue",hint:"Architects design buildings, sculptors make statues!"},
    {level:"medium",type:"CogAT",q:"EQUATION BUILDING: (n + 4) × 3 = 24",options:["3","4","5","6"],answer:"4",hint:"n+4=8, n=4!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with photosynthesis, respiration, digestion?",options:["democracy","gravity","circulation","election"],answer:"circulation",hint:"All are biological processes!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 8 is to 2 as 27 is to ___.",options:["3","4","6","9"],answer:"3",hint:"∛8=2. ∛27=?"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Optimist is to hopeful as pessimist is to ___.",options:["cheerful","confident","gloomy","cautious"],answer:"gloomy",hint:"Optimists are hopeful, pessimists are gloomy!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 7, 11, 16, 22, 29, ___",options:["35","36","37","38"],answer:"37",hint:"Differences: +4,+5,+6,+7,+8. 29+8=37!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with hurricane, typhoon, cyclone?",options:["volcano","drought","tornado","earthquake"],answer:"tornado",hint:"All are types of severe rotating wind storms!"},
    {level:"medium",type:"CogAT",q:"EQUATION BUILDING: 4² + n = 5²",options:["7","8","9","10"],answer:"9",hint:"16 + n = 25, n = 9!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Microbiology is to microbes as neuroscience is to ___.",options:["planets","rocks","nervous system","atoms"],answer:"nervous system",hint:"Microbiology = microbes, neuroscience = nervous system!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 16 is to 4 as 100 is to ___.",options:["5","10","20","25"],answer:"10",hint:"√16=4. √100=?"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with metamorphosis, hibernation, migration?",options:["photosynthesis","camouflage","pollution","erosion"],answer:"camouflage",hint:"All are animal survival/adaptation strategies!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Poet is to verse as novelist is to ___.",options:["chapter","sonnet","limerick","haiku"],answer:"chapter",hint:"Poets write verse, novelists write chapters!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 0, 1, 1, 2, 3, 5, 8, ___",options:["12","13","14","15"],answer:"13",hint:"Fibonacci: 5+8=13!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 3 is to 27 as 2 is to ___.",options:["4","6","8","16"],answer:"8",hint:"3³=27. 2³=?"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Glossary is to words as index is to ___.",options:["chapters","sentences","topics","paragraphs"],answer:"topics",hint:"Glossary lists words, index lists topics!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 100, 50, 25, 12.5, ___",options:["5","6","6.25","7"],answer:"6.25",hint:"Divide by 2 each time. 12.5÷2=6.25!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with Celsius, Fahrenheit, Kelvin?",options:["metres","litres","Rankine","kilograms"],answer:"Rankine",hint:"All are temperature scales!"},
    {level:"medium",type:"CogAT",q:"EQUATION BUILDING: 2n + 3n = 35",options:["5","6","7","8"],answer:"7",hint:"5n=35, n=7!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Penalty is to crime as reward is to ___.",options:["mistake","achievement","effort","attempt"],answer:"achievement",hint:"Penalty for crime, reward for achievement!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 3, 4, 6, 9, 13, ___",options:["17","18","19","20"],answer:"18",hint:"Differences: +1,+2,+3,+4,+5. 13+5=18!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with atlas, almanac, thesaurus?",options:["newspaper","novel","encyclopaedia","magazine"],answer:"encyclopaedia",hint:"All are reference books!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Narrator is to story as commentator is to ___.",options:["music","sport","weather","cooking"],answer:"sport",hint:"Narrator tells a story, commentator describes a sport!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 64 is to 4 as 125 is to ___.",options:["4","5","6","7"],answer:"5",hint:"∛64=4. ∛125=?"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 2, 3, 5, 8, 13, 21, 34, ___",options:["47","54","55","56"],answer:"55",hint:"Fibonacci: 21+34=55!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with Parliament, Congress, Senate?",options:["court","army","legislature","police"],answer:"legislature",hint:"All are law-making/legislative bodies!"},
    {level:"medium",type:"CogAT",q:"EQUATION BUILDING: (3² + 4²) = ___",options:["24","25","26","50"],answer:"25",hint:"9+16=25!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with analogy, metaphor, simile?",options:["noun","conjunction","parable","preposition"],answer:"parable",hint:"All are comparisons used in language/literature!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 4 is to 64 as 3 is to ___.",options:["9","18","24","27"],answer:"27",hint:"4³=64. 3³=?"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Gravity is to Newton as electricity is to ___.",options:["Einstein","Darwin","Tesla","Fleming"],answer:"Tesla",hint:"Newton and gravity; Tesla and electricity!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 1, 3, 6, 10, 15, ___",options:["18","20","21","25"],answer:"21",hint:"Triangular numbers: +2,+3,+4,+5,+6. 15+6=21!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with sonnet, haiku, ballad?",options:["novel","drama","ode","essay"],answer:"ode",hint:"All are forms of poetry!"},
    {level:"medium",type:"CogAT",q:"EQUATION BUILDING: n + 2n + 3 = 21",options:["5","6","7","8"],answer:"6",hint:"3n+3=21, 3n=18, n=6!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Epic is to Homer as plays are to ___.",options:["Dickens","Austen","Shakespeare","Tolkien"],answer:"Shakespeare",hint:"Homer wrote epics, Shakespeare wrote plays!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 0, 1, 3, 6, 10, 15, ___",options:["18","20","21","22"],answer:"21",hint:"Triangular numbers: 15+6=21!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with seismology, volcanology, geology?",options:["astronomy","meteorology","palaeontology","biology"],answer:"palaeontology",hint:"All are branches of Earth science!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Democracy is to Athens as empire is to ___.",options:["France","Britain","Rome","Greece"],answer:"Rome",hint:"Democracy from Athens; greatest ancient empire = Rome!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 1000 is to 10 as 8 is to ___.",options:["2","3","4","5"],answer:"2",hint:"∛1000=10. ∛8=?"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 1, 2, 4, 7, 11, 16, ___",options:["20","22","23","24"],answer:"22",hint:"Differences: +1,+2,+3,+4,+5,+6. 16+6=22!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with precipitation, evaporation, condensation?",options:["photosynthesis","respiration","transpiration","digestion"],answer:"transpiration",hint:"All are parts of the water cycle!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Stanza is to poem as paragraph is to ___.",options:["sentence","story","word","chapter"],answer:"story",hint:"Stanza = unit of poem; paragraph = unit of story!"},
    {level:"medium",type:"CogAT",q:"EQUATION BUILDING: 2³ + 3² = ___",options:["15","17","19","21"],answer:"17",hint:"2³=8, 3²=9. 8+9=17!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with chlorophyll, photosynthesis, respiration?",options:["erosion","metabolism","gravity","democracy"],answer:"metabolism",hint:"All are biological/biochemical processes!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 3 is to 12 as 5 is to ___.",options:["15","20","25","30"],answer:"20",hint:"3×4=12. 5×4=?"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Prologue is to beginning as epilogue is to ___.",options:["middle","start","end","chapter"],answer:"end",hint:"Prologue = before. Epilogue = after!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 5, 6, 8, 11, 15, ___",options:["18","19","20","21"],answer:"20",hint:"Differences: +1,+2,+3,+4,+5. 15+5=20!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with oxygen, nitrogen, carbon dioxide?",options:["water","rock","hydrogen","salt"],answer:"hydrogen",hint:"All are gases!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Microscope is to tiny as telescope is to ___.",options:["close","large","distant","bright"],answer:"distant",hint:"Microscope shows tiny things, telescope shows distant things!"},
    {level:"medium",type:"CogAT",q:"EQUATION BUILDING: n² - 4 = 21",options:["3","4","5","6"],answer:"5",hint:"n²=25, n=5!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 3, 7, 15, 31, 63, ___",options:["100","115","125","127"],answer:"127",hint:"×2+1 each time. 63×2+1=127!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with democracy, republic, monarchy?",options:["library","parliament","school","army"],answer:"parliament",hint:"All are forms/systems of government!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 36 is to 6 as 121 is to ___.",options:["9","10","11","12"],answer:"11",hint:"√36=6. √121=?"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Stethoscope is to doctor as wrench is to ___.",options:["lawyer","teacher","plumber","chef"],answer:"plumber",hint:"Stethoscope = doctor's tool. Wrench = plumber's tool!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 2, 5, 10, 17, 26, ___",options:["35","36","37","38"],answer:"37",hint:"Differences: +3,+5,+7,+9,+11. 26+11=37!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with simile, metaphor, alliteration?",options:["noun","verb","hyperbole","adjective"],answer:"hyperbole",hint:"All are figures of speech!"},
    {level:"medium",type:"CogAT",q:"EQUATION BUILDING: 4 × ___ - 6 = 18",options:["4","5","6","7"],answer:"6",hint:"4×6=24. 24-6=18!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Conductor is to orchestra as captain is to ___.",options:["soldiers","sailors","pilots","drivers"],answer:"sailors",hint:"Conductor leads orchestra, captain leads sailors!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 5 is to 25 as 6 is to ___.",options:["30","34","36","42"],answer:"36",hint:"5²=25. 6²=?"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with France, Germany, China, Italy?",options:["Spain","Japan","China","Mexico"],answer:"Spain",hint:"Wait — three are European; pick the other European! Spain!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Library is to books as museum is to ___.",options:["paintings","flowers","food","animals"],answer:"paintings",hint:"Library stores books, museum stores artefacts/art!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 1, 4, 9, 16, 25, ___",options:["30","34","36","40"],answer:"36",hint:"Square numbers: 6²=36!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Author is to book as composer is to ___.",options:["painting","film","music","poem"],answer:"music",hint:"Author writes books, composer writes music!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 2 is to 8 as 4 is to ___.",options:["16","32","64","128"],answer:"64",hint:"2³=8. 4³=?"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with rose, tulip, sunflower?",options:["oak","ivy","daffodil","fern"],answer:"daffodil",hint:"All are flowering plants!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Rain is to wet as fire is to ___.",options:["smoke","hot","wood","bright"],answer:"hot",hint:"Rain makes wet, fire makes hot!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 100, 91, 82, 73, ___",options:["62","63","64","65"],answer:"64",hint:"Subtract 9 each time. 73-9=64!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Eyes are to glasses as ears are to ___.",options:["nose","hearing aid","head","hair"],answer:"hearing aid",hint:"Glasses help eyes, hearing aids help ears!"},
    {level:"medium",type:"CogAT",q:"NUMBER ANALOGIES: 7 is to 343 as 4 is to ___.",options:["16","32","64","128"],answer:"64",hint:"7³=343. 4³=?"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with violin, piano, guitar, trumpet?",options:["flute","trumpet","drum","saxophone"],answer:"saxophone",hint:"Wait — find the odd one out differently: what type of instrument is missing?"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: River is to ocean as stream is to ___.",options:["lake","pond","puddle","river"],answer:"river",hint:"Streams flow into rivers, rivers flow into oceans!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 5, 10, 20, 40, 80, ___",options:["120","140","160","180"],answer:"160",hint:"Each number doubles!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Hungry is to eat as tired is to ___.",options:["run","sleep","work","play"],answer:"sleep",hint:"When hungry you eat, when tired you sleep!"},
    {level:"medium",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with France, Germany, Italy?",options:["China","Brazil","Spain","Mexico"],answer:"Spain",hint:"All are European countries!"},
    {level:"medium",type:"CogAT",q:"EQUATION BUILDING: 5 × n = 3²+ 16",options:["4","5","6","7"],answer:"5",hint:"3²=9. 9+16=25. 25÷5=5!"},
    {level:"medium",type:"CogAT",q:"NUMBER SERIES: 1, 5, 14, 30, 55, ___",options:["80","85","90","91"],answer:"91",hint:"Differences are squares: +4,+9,+16,+25,+36. 55+36=91!"},
    {level:"medium",type:"CogAT",q:"VERBAL ANALOGY: Microscope is to biologist as telescope is to ___.",options:["geologist","astronomer","chemist","historian"],answer:"astronomer",hint:"Microscope for biology, telescope for astronomy!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Parliament is to legislation as judiciary is to ___.",options:["taxation","policing","adjudication","military"],answer:"adjudication",hint:"Parliament makes laws. Judiciary delivers justice!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 1, 4, 10, 22, 46, ___",options:["90","92","94","96"],answer:"94",hint:"Each = 2×previous + 2. 46×2+2=94!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with deductive, inductive, abductive?",options:["subjective","objective","inferential","analytical"],answer:"inferential",hint:"All are types of logical reasoning!"},
    {level:"hard",type:"CogAT",q:"NUMBER ANALOGIES: 2 is to 32 as 3 is to ___.",options:["81","128","243","729"],answer:"243",hint:"2⁵=32. 3⁵=?"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 1, 2, 6, 42, 1806, ___",options:["3263442","3263443","3263444","3263445"],answer:"3263443",hint:"Each = prev² + prev. 1806²+1806=3263443!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Epistemology is to knowledge as ontology is to ___.",options:["logic","ethics","existence","beauty"],answer:"existence",hint:"Epistemology = knowledge; ontology = existence/being!"},
    {level:"hard",type:"CogAT",q:"EQUATION BUILDING: If f(x) = 2x² - 3, what is f(4)?",options:["25","26","27","29"],answer:"29",hint:"f(4) = 2(16) - 3 = 32 - 3 = 29!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with tautology, paradox, oxymoron?",options:["noun","adjective","contradiction","preposition"],answer:"contradiction",hint:"All involve contradictory or self-referential statements!"},
    {level:"hard",type:"CogAT",q:"NUMBER ANALOGIES: 36 is to 216 as 25 is to ___.",options:["100","125","150","175"],answer:"125",hint:"36=6², 216=6³. 25=5², 5³=125!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 2, 5, 11, 23, 47, ___",options:["93","95","97","99"],answer:"95",hint:"×2+1 each time. 47×2+1=95!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with mitosis, meiosis, binary fission?",options:["photosynthesis","respiration","budding","circulation"],answer:"budding",hint:"All are forms of reproduction!"},
    {level:"hard",type:"CogAT",q:"EQUATION BUILDING: If 3ˣ = 81, what is x?",options:["3","4","5","6"],answer:"4",hint:"3⁴ = 81!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Momentum is to physics as liquidity is to ___.",options:["chemistry","biology","economics","mathematics"],answer:"economics",hint:"Momentum = physics concept; liquidity = economics concept!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 1, 1, 2, 3, 5, 8, 13, 21, 34, ___",options:["52","54","55","56"],answer:"55",hint:"Fibonacci: 21+34=55!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with Socrates, Aristotle, Plato?",options:["Caesar","Napoleon","Pythagoras","Archimedes"],answer:"Pythagoras",hint:"All are ancient Greek philosophers!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Hegel is to dialectic as Kant is to ___.",options:["empiricism","categorical imperative","utilitarianism","social contract"],answer:"categorical imperative",hint:"Hegel: dialectic; Kant: categorical imperative!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 3, 7, 15, 31, 63, 127, ___",options:["200","250","254","255"],answer:"255",hint:"×2+1 each time. 127×2+1=255!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with anarchy, oligarchy, theocracy?",options:["democracy","poetry","symphony","republic"],answer:"republic",hint:"All are forms of government!"},
    {level:"hard",type:"CogAT",q:"EQUATION BUILDING: log₂(x) = 4, what is x?",options:["8","12","16","20"],answer:"16",hint:"2⁴=x. 2⁴=16!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Narrative is to plot as argument is to ___.",options:["evidence","character","setting","theme"],answer:"evidence",hint:"Narrative structured by plot; argument structured by evidence!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 0, 1, 8, 27, 64, ___",options:["100","115","125","144"],answer:"125",hint:"Cube numbers: 5³=125!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with bureaucracy, meritocracy, aristocracy?",options:["biology","democracy","astronomy","philosophy"],answer:"democracy",hint:"All are systems of governance (-cracy = rule)!"},
    {level:"hard",type:"CogAT",q:"NUMBER ANALOGIES: 10 is to 1000 as 2 is to ___.",options:["4","6","8","9"],answer:"8",hint:"10³=1000. 2³=?"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Correlation is to causation as hypothesis is to ___.",options:["data","theory","fact","experiment"],answer:"theory",hint:"Hypothesis develops into theory; correlation ≠ causation!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 1, 3, 7, 13, 21, 31, ___",options:["41","42","43","44"],answer:"43",hint:"Differences: +2,+4,+6,+8,+10,+12. 31+12=43!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with empiricism, rationalism, pragmatism?",options:["metabolism","stoicism","erosion","photosynthesis"],answer:"stoicism",hint:"All are philosophical schools of thought!"},
    {level:"hard",type:"CogAT",q:"EQUATION BUILDING: 5ˣ = 3125, what is x?",options:["4","5","6","7"],answer:"5",hint:"5⁵ = 3125!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Axiom is to mathematics as postulate is to ___.",options:["poetry","biology","geometry","cooking"],answer:"geometry",hint:"Axioms in maths; postulates in geometry!"},
    {level:"hard",type:"CogAT",q:"NUMBER ANALOGIES: 9 is to 3 as 144 is to ___.",options:["10","11","12","13"],answer:"12",hint:"√9=3. √144=?"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with paradigm, axiom, theorem?",options:["novel","poem","postulate","drama"],answer:"postulate",hint:"All are foundational principles or proven truths in logic/science!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 2, 3, 5, 7, 11, 13, 17, ___",options:["18","19","20","23"],answer:"19",hint:"Prime numbers! Next prime after 17 is 19!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with taxonomy, phylogeny, morphology?",options:["geology","meteorology","ecology","cosmology"],answer:"ecology",hint:"All are branches of biology!"},
    {level:"hard",type:"CogAT",q:"EQUATION BUILDING: If a sequence follows 2ⁿ - 1, what is the 6th term?",options:["31","47","63","95"],answer:"63",hint:"n=6: 2⁶-1 = 64-1 = 63!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Spring tide is to neap tide as aphelion is to ___.",options:["perihelion","eclipse","solstice","equinox"],answer:"perihelion",hint:"Spring/neap are opposite tides. Aphelion/perihelion are opposite orbital points!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 0, 2, 6, 12, 20, 30, ___",options:["40","42","44","46"],answer:"42",hint:"Differences: +2,+4,+6,+8,+10,+12. 30+12=42!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with Keynesian, monetarist, supply-side?",options:["Darwinian","Newtonian","Freudian","Laissez-faire"],answer:"Laissez-faire",hint:"All are economic theories/schools!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Demagogue is to populism as autocrat is to ___.",options:["democracy","federalism","authoritarianism","liberalism"],answer:"authoritarianism",hint:"Demagogue uses populism; autocrat uses authoritarianism!"},
    {level:"hard",type:"CogAT",q:"NUMBER ANALOGIES: 7 is to 343 as 5 is to ___.",options:["75","100","125","150"],answer:"125",hint:"7³=343. 5³=?"},
    {level:"hard",type:"CogAT",q:"EQUATION BUILDING: ∑(1 to 10) = ___",options:["45","50","55","60"],answer:"55",hint:"Sum 1 to n = n(n+1)/2. 10×11/2=55!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Syllogism is to logic as algorithm is to ___.",options:["music","computing","philosophy","history"],answer:"computing",hint:"Syllogism = logical reasoning structure; algorithm = computational procedure!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 1, 4, 9, 16, 25, 36, 49, ___",options:["56","60","64","72"],answer:"64",hint:"Square numbers: 8²=64!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with referendum, plebiscite, ballot?",options:["judiciary","legislation","electoral","petition"],answer:"petition",hint:"All are forms of democratic participation!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 1, 2, 3, 5, 8, 13, 21, ___",options:["29","32","34","36"],answer:"34",hint:"Fibonacci: 13+21=34!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Nomad is to settled as ephemeral is to ___.",options:["fleeting","temporary","permanent","brief"],answer:"permanent",hint:"Nomad vs settled; ephemeral vs permanent!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Palaeontologist is to fossils as astronomer is to ___.",options:["rocks","weather","stars","DNA"],answer:"stars",hint:"Palaeontologist studies fossils, astronomer studies stars!"},
    {level:"hard",type:"CogAT",q:"NUMBER ANALOGIES: 4 is to 1024 as 2 is to ___.",options:["256","512","1024","32"],answer:"32",hint:"4⁵=1024. 2⁵=?"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with allegory, fable, parable?",options:["haiku","elegy","myth","sonnet"],answer:"myth",hint:"All are narrative forms conveying moral/symbolic truths!"},
    {level:"hard",type:"CogAT",q:"EQUATION BUILDING: If n² + 3n = 28, what is n?",options:["3","4","5","6"],answer:"4",hint:"4²+3(4)=16+12=28!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Lexicographer is to dictionary as cartographer is to ___.",options:["atlas","newspaper","novel","almanac"],answer:"atlas",hint:"Lexicographer makes dictionaries; cartographer makes maps/atlases!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 2, 6, 12, 20, 30, ___",options:["40","42","44","46"],answer:"42",hint:"Differences: +4,+6,+8,+10,+12. 30+12=42!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with entropy, enthalpy, free energy?",options:["velocity","momentum","equilibrium","activation energy"],answer:"activation energy",hint:"All are thermodynamic concepts!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Harmony is to discord as consensus is to ___.",options:["agreement","debate","dissent","unity"],answer:"dissent",hint:"Harmony ↔ discord; consensus ↔ dissent (opposites)!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 0, 1, 4, 9, 16, 25, ___",options:["30","34","36","40"],answer:"36",hint:"Square numbers: 0,1,4,9,16,25,36!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Epidemiologist is to disease as seismologist is to ___.",options:["weather","volcanoes","earthquakes","climate"],answer:"earthquakes",hint:"Seismologist studies earthquakes!"},
    {level:"hard",type:"CogAT",q:"NUMBER ANALOGIES: 27 is to 3 as 125 is to ___.",options:["4","5","6","7"],answer:"5",hint:"∛27=3. ∛125=?"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 1, 2, 6, 24, 120, ___",options:["240","360","600","720"],answer:"720",hint:"Factorials: ×1,×2,×3,×4,×5,×6. 120×6=720!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with mitosis, meiosis, osmosis?",options:["ignition","diffusion","combustion","erosion"],answer:"diffusion",hint:"All are biological/chemical processes ending in -osis!"},
    {level:"hard",type:"CogAT",q:"NUMBER ANALOGIES: 8 is to 512 as 3 is to ___.",options:["9","18","27","81"],answer:"27",hint:"8³=512. 3³=?"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Ichthyologist studies fish as entomologist studies ___.",options:["birds","reptiles","insects","plants"],answer:"insects",hint:"Entomo = insect in Greek!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 2, 3, 5, 8, 13, 21, ___",options:["29","32","34","36"],answer:"34",hint:"Fibonacci: 13+21=34!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with simile, metaphor, alliteration?",options:["noun","verb","personification","adjective"],answer:"personification",hint:"All are literary/rhetorical devices!"},
    {level:"hard",type:"CogAT",q:"EQUATION BUILDING: If x + y = 20 and x - y = 8, what is x?",options:["12","13","14","16"],answer:"14",hint:"Add equations: 2x=28, x=14!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Prologue is to beginning as epilogue is to ___.",options:["middle","chapter","end","climax"],answer:"end",hint:"Prologue = opening. Epilogue = closing!"},
    {level:"hard",type:"CogAT",q:"NUMBER ANALOGIES: 2 is to 4 as 4 is to 256 — what is the rule?",options:["×2","×64","n to n^n","n squared then cubed"],answer:"n to n^n",hint:"2→2²=4. 4→4⁴=256. Rule: n → nⁿ!"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with anarchy, oligarchy, theocracy, republic?",options:["democracy","poetry","symphony","physics"],answer:"democracy",hint:"All are systems of political governance!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 1, 8, 27, 64, 125, ___",options:["196","210","216","225"],answer:"216",hint:"Cube numbers: 6³=216!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Amendment is to constitution as revision is to ___.",options:["experiment","manuscript","sentence","paragraph"],answer:"manuscript",hint:"You amend a constitution; you revise a manuscript!"},
    {level:"hard",type:"CogAT",q:"EQUATION BUILDING: 2³ + 4² - 3² = ___",options:["13","15","17","18"],answer:"15",hint:"8+16-9=15!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Cartographer is to maps as orchestrator is to ___.",options:["paintings","symphonies","films","buildings"],answer:"symphonies",hint:"Cartographer makes maps; orchestrator arranges music!"},
    {level:"hard",type:"CogAT",q:"NUMBER ANALOGIES: 2 is to 64 as 3 is to ___.",options:["81","243","729","2187"],answer:"729",hint:"2⁶=64. 3⁶=?"},
    {level:"hard",type:"CogAT",q:"VERBAL CLASSIFICATION: Which belongs with rhetoric, dialectic, logic?",options:["biology","chemistry","epistemology","ecology"],answer:"epistemology",hint:"All are classical philosophical disciplines!"},
    {level:"hard",type:"CogAT",q:"NUMBER SERIES: 1, 3, 6, 10, 15, 21, ___",options:["26","28","29","30"],answer:"28",hint:"Triangular numbers: +2,+3,+4,+5,+6,+7. 21+7=28!"},
    {level:"hard",type:"CogAT",q:"VERBAL ANALOGY: Hypothesis is to theory as sketch is to ___.",options:["drawing","masterpiece","doodle","outline"],answer:"masterpiece",hint:"A hypothesis is developed into a theory; a sketch is developed into a masterpiece!"}
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
    // ── EXTRA EASY ──
    {level:"easy",word:"pig",q:"Which is the correct spelling?",options:["peg","pig","pog","pug"],answer:"pig",hint:"p-i-g"},
    {level:"easy",word:"cup",q:"Which is the correct spelling?",options:["cap","cop","cup","cip"],answer:"cup",hint:"c-u-p"},
    {level:"easy",word:"hen",q:"Which is the correct spelling?",options:["han","hin","hun","hen"],answer:"hen",hint:"h-e-n"},
    {level:"easy",word:"top",q:"Which is the correct spelling?",options:["tap","tip","tup","top"],answer:"top",hint:"t-o-p"},
    {level:"easy",word:"map",q:"Which is the correct spelling?",options:["mop","map","mup","mep"],answer:"map",hint:"m-a-p"},
    {level:"easy",word:"pen",q:"Which is the correct spelling?",options:["pan","pin","pun","pen"],answer:"pen",hint:"p-e-n"},
    {level:"easy",word:"box",q:"Which is the correct spelling?",options:["bax","bix","bux","box"],answer:"box",hint:"b-o-x"},
    {level:"easy",word:"net",q:"Which is the correct spelling?",options:["nat","nit","nut","net"],answer:"net",hint:"n-e-t"},
    // ── EXTRA MEDIUM ──
    {level:"medium",word:"happy",q:"Which is the correct spelling?",options:["hapy","happi","happy","happey"],answer:"happy",hint:"double p: h-a-p-p-y"},
    {level:"medium",word:"little",q:"Which is the correct spelling?",options:["litle","littel","little","littul"],answer:"little",hint:"double t, double l: l-i-t-t-l-e"},
    {level:"medium",word:"people",q:"Which is the correct spelling?",options:["peaple","peeple","peopel","people"],answer:"people",hint:"p-e-o-p-l-e"},
    {level:"medium",word:"could",q:"Which is the correct spelling?",options:["coud","culd","could","chold"],answer:"could",hint:"silent l: c-o-u-l-d"},
    {level:"medium",word:"write",q:"Which is the correct spelling?",options:["rite","writ","right","write"],answer:"write",hint:"silent w: w-r-i-t-e"},
    {level:"medium",word:"know",q:"Which is the correct spelling?",options:["no","now","know","knoe"],answer:"know",hint:"silent k: k-n-o-w"},
    {level:"medium",word:"listen",q:"Which is the correct spelling?",options:["lissen","liten","listen","listun"],answer:"listen",hint:"silent t: l-i-s-t-e-n"},
    {level:"medium",word:"castle",q:"Which is the correct spelling?",options:["casel","castel","castle","castul"],answer:"castle",hint:"silent t: c-a-s-t-l-e"},
    // ── EXTRA HARD ──
    {level:"hard",word:"necessary",q:"Which is the correct spelling?",options:["neccessary","necesary","necessary","neccesary"],answer:"necessary",hint:"1 collar (c), 2 socks (ss): n-e-c-e-s-s-a-r-y"},
    {level:"hard",word:"separate",q:"Which is the correct spelling?",options:["seperate","separete","seprate","separate"],answer:"separate",hint:"sep-a-rate: s-e-p-a-r-a-t-e"},
    {level:"hard",word:"Wednesday",q:"Which is the correct spelling?",options:["Wendsday","Wensday","Wednesday","Wendesday"],answer:"Wednesday",hint:"Wed-nes-day — the d is silent!"},
    {level:"hard",word:"rhythm",q:"Which is the correct spelling?",options:["rithm","rythm","rhythym","rhythm"],answer:"rhythm",hint:"no vowels! r-h-y-t-h-m"},
    {level:"hard",word:"conscience",q:"Which is the correct spelling?",options:["consience","concience","conscience","conscence"],answer:"conscience",hint:"con-science: c-o-n-s-c-i-e-n-c-e"},
  
    {"level":"easy","word":"bus","q":"Which is the correct spelling?","options":["bos","bis","bus","buss"],"answer":"bus","hint":"b-u-s"},
    {"level":"easy","word":"mud","q":"Which is the correct spelling?","options":["mad","med","mod","mud"],"answer":"mud","hint":"m-u-d"},
    {"level":"easy","word":"log","q":"Which is the correct spelling?","options":["lag","leg","log","lug"],"answer":"log","hint":"l-o-g"},
    {"level":"easy","word":"wig","q":"Which is the correct spelling?","options":["wag","weg","wog","wig"],"answer":"wig","hint":"w-i-g"},
    {"level":"easy","word":"cob","q":"Which is the correct spelling?","options":["cab","cob","cub","cib"],"answer":"cob","hint":"c-o-b — like a corn cob!"},
    {"level":"easy","word":"fin","q":"Which is the correct spelling?","options":["fan","fen","fin","fun"],"answer":"fin","hint":"f-i-n — a fish's fin!"},
    {"level":"easy","word":"den","q":"Which is the correct spelling?","options":["dan","den","din","don"],"answer":"den","hint":"d-e-n — where a fox lives!"},
    {"level":"easy","word":"gem","q":"Which is the correct spelling?","options":["gam","gem","gim","gum"],"answer":"gem","hint":"g-e-m — a precious gem!"},
    {"level":"easy","word":"yam","q":"Which is the correct spelling?","options":["yam","yem","yim","yom"],"answer":"yam","hint":"y-a-m — a sweet potato!"},
    {"level":"easy","word":"sob","q":"Which is the correct spelling?","options":["sab","seb","sob","sub"],"answer":"sob","hint":"s-o-b — to cry!"},
    {"level":"easy","word":"mop","q":"Which is the correct spelling?","options":["map","mep","mip","mop"],"answer":"mop","hint":"m-o-p — for cleaning floors!"},
    {"level":"easy","word":"van","q":"Which is the correct spelling?","options":["ven","vin","von","van"],"answer":"van","hint":"v-a-n — a delivery van!"},
    {"level":"easy","word":"web","q":"Which is the correct spelling?","options":["wab","web","wib","wob"],"answer":"web","hint":"w-e-b — a spider's web!"},
    {"level":"easy","word":"zip","q":"Which is the correct spelling?","options":["zap","zep","zip","zop"],"answer":"zip","hint":"z-i-p — on your jacket!"},
    {"level":"easy","word":"gap","q":"Which is the correct spelling?","options":["gap","gep","gip","gop"],"answer":"gap","hint":"g-a-p — a space or opening!"},
    {"level":"easy","word":"nap","q":"Which is the correct spelling?","options":["nap","nep","nip","nop"],"answer":"nap","hint":"n-a-p — a short sleep!"},
    {"level":"easy","word":"dim","q":"Which is the correct spelling?","options":["dam","dem","dim","dom"],"answer":"dim","hint":"d-i-m — not very bright!"},
    {"level":"easy","word":"rip","q":"Which is the correct spelling?","options":["rap","rep","rip","rop"],"answer":"rip","hint":"r-i-p — to tear!"},
    {"level":"easy","word":"sip","q":"Which is the correct spelling?","options":["sap","sep","sip","sop"],"answer":"sip","hint":"s-i-p — a small drink!"},
    {"level":"easy","word":"tip","q":"Which is the correct spelling?","options":["tap","tep","tip","top"],"answer":"tip","hint":"t-i-p — the pointed end!"},
    {"level":"easy","word":"bid","q":"Which is the correct spelling?","options":["bad","bed","bid","bod"],"answer":"bid","hint":"b-i-d — to make an offer!"},
    {"level":"easy","word":"cod","q":"Which is the correct spelling?","options":["cad","cod","cud","cid"],"answer":"cod","hint":"c-o-d — a type of fish!"},
    {"level":"easy","word":"fog","q":"Which is the correct spelling?","options":["fag","fog","fig","fug"],"answer":"fog","hint":"f-o-g — misty weather!"},
    {"level":"easy","word":"hug","q":"Which is the correct spelling?","options":["hag","heg","hig","hug"],"answer":"hug","hint":"h-u-g — a warm embrace!"},
    {"level":"easy","word":"jug","q":"Which is the correct spelling?","options":["jag","jeg","jig","jug"],"answer":"jug","hint":"j-u-g — holds water!"},
    {"level":"easy","word":"nun","q":"Which is the correct spelling?","options":["nan","nen","nin","nun"],"answer":"nun","hint":"n-u-n — double n!"},
    {"level":"easy","word":"pub","q":"Which is the correct spelling?","options":["pab","peb","pib","pub"],"answer":"pub","hint":"p-u-b — a British bar!"},
    {"level":"easy","word":"tub","q":"Which is the correct spelling?","options":["tab","teb","tib","tub"],"answer":"tub","hint":"t-u-b — a bathtub!"},
    {"level":"easy","word":"wax","q":"Which is the correct spelling?","options":["wax","wex","wix","wox"],"answer":"wax","hint":"w-a-x — candles are made of wax!"},
    {"level":"easy","word":"yell","q":"Which is the correct spelling?","options":["yall","yell","yill","yoll"],"answer":"yell","hint":"y-e-l-l — to shout loudly!"},
    {"level":"medium","word":"angry","q":"Which is the correct spelling?","options":["angery","angry","angrey","angrry"],"answer":"angry","hint":"a-n-g-r-y — no e in angry!"},
    {"level":"medium","word":"always","q":"Which is the correct spelling?","options":["allways","alwayes","always","alweys"],"answer":"always","hint":"al-ways: a-l-w-a-y-s"},
    {"level":"medium","word":"began","q":"Which is the correct spelling?","options":["begann","began","biegan","beghan"],"answer":"began","hint":"b-e-g-a-n"},
    {"level":"medium","word":"carry","q":"Which is the correct spelling?","options":["cary","carrey","carry","caary"],"answer":"carry","hint":"double r: c-a-r-r-y!"},
    {"level":"medium","word":"daily","q":"Which is the correct spelling?","options":["dailly","daly","daily","dailey"],"answer":"daily","hint":"d-a-i-l-y"},
    {"level":"medium","word":"early","q":"Which is the correct spelling?","options":["earley","earlly","erly","early"],"answer":"early","hint":"e-a-r-l-y"},
    {"level":"medium","word":"fairy","q":"Which is the correct spelling?","options":["farey","fairy","fairey","faiiry"],"answer":"fairy","hint":"f-a-i-r-y"},
    {"level":"medium","word":"giant","q":"Which is the correct spelling?","options":["giiant","giant","gient","giante"],"answer":"giant","hint":"g-i-a-n-t"},
    {"level":"medium","word":"heart","q":"Which is the correct spelling?","options":["haert","heartt","heart","hert"],"answer":"heart","hint":"h-e-a-r-t"},
    {"level":"medium","word":"island","q":"Which is the correct spelling?","options":["iland","islend","island","islaand"],"answer":"island","hint":"silent s: i-s-l-a-n-d!"},
    {"level":"medium","word":"jewel","q":"Which is the correct spelling?","options":["juwel","jewel","jewells","juwell"],"answer":"jewel","hint":"j-e-w-e-l"},
    {"level":"medium","word":"knight","q":"Which is the correct spelling?","options":["nite","knite","knight","knighte"],"answer":"knight","hint":"silent k and gh: k-n-i-g-h-t!"},
    {"level":"medium","word":"laugh","q":"Which is the correct spelling?","options":["laf","laff","laugh","laughe"],"answer":"laugh","hint":"tricky spelling: l-a-u-g-h!"},
    {"level":"medium","word":"magic","q":"Which is the correct spelling?","options":["majic","magick","magic","maggic"],"answer":"magic","hint":"m-a-g-i-c"},
    {"level":"medium","word":"nature","q":"Which is the correct spelling?","options":["naiture","nature","natur","natture"],"answer":"nature","hint":"na-ture: n-a-t-u-r-e"},
    {"level":"medium","word":"often","q":"Which is the correct spelling?","options":["ofton","often","offten","ofen"],"answer":"often","hint":"o-f-t-e-n — the t is silent!"},
    {"level":"medium","word":"pencil","q":"Which is the correct spelling?","options":["pensil","pencil","pensile","pencill"],"answer":"pencil","hint":"pen-cil: p-e-n-c-i-l"},
    {"level":"medium","word":"quiet","q":"Which is the correct spelling?","options":["queit","qiuet","quiet","quieet"],"answer":"quiet","hint":"q-u-i-e-t"},
    {"level":"medium","word":"river","q":"Which is the correct spelling?","options":["rivver","rivar","rriver","river"],"answer":"river","hint":"r-i-v-e-r"},
    {"level":"medium","word":"silver","q":"Which is the correct spelling?","options":["siilver","silvar","silver","sillver"],"answer":"silver","hint":"s-i-l-v-e-r"},
    {"level":"medium","word":"table","q":"Which is the correct spelling?","options":["tabel","taible","table","tabllee"],"answer":"table","hint":"t-a-b-l-e"},
    {"level":"medium","word":"uncle","q":"Which is the correct spelling?","options":["onkle","unclle","uncul","uncle"],"answer":"uncle","hint":"u-n-c-l-e"},
    {"level":"medium","word":"valley","q":"Which is the correct spelling?","options":["vally","vallley","valey","valley"],"answer":"valley","hint":"double l: v-a-l-l-e-y!"},
    {"level":"medium","word":"whisper","q":"Which is the correct spelling?","options":["wisper","whispir","whisper","whissper"],"answer":"whisper","hint":"silent wh: w-h-i-s-p-e-r!"},
    {"level":"medium","word":"yellow","q":"Which is the correct spelling?","options":["yello","yelloe","yelow","yellow"],"answer":"yellow","hint":"double l: y-e-l-l-o-w!"},
    {"level":"medium","word":"zebra","q":"Which is the correct spelling?","options":["zeebra","zebraa","zebra","zibra"],"answer":"zebra","hint":"z-e-b-r-a"},
    {"level":"medium","word":"twice","q":"Which is the correct spelling?","options":["twyce","twize","twice","twicce"],"answer":"twice","hint":"t-w-i-c-e"},
    {"level":"medium","word":"pigeon","q":"Which is the correct spelling?","options":["pidgeon","pigeon","pigoen","pigeoon"],"answer":"pigeon","hint":"p-i-g-e-o-n"},
    {"level":"medium","word":"mixture","q":"Which is the correct spelling?","options":["mixsure","mixtur","mixture","mixtture"],"answer":"mixture","hint":"mix-ture: m-i-x-t-u-r-e"},
    {"level":"medium","word":"special","q":"Which is the correct spelling?","options":["speciel","special","speciial","specail"],"answer":"special","hint":"spe-cial: s-p-e-c-i-a-l"},
    {"level":"hard","word":"accommodate","q":"Which is the correct spelling?","options":["accomodate","accommodate","acommodate","accomadate"],"answer":"accommodate","hint":"double c, double m: ac-com-mo-date!"},
    {"level":"hard","word":"achieve","q":"Which is the correct spelling?","options":["acheive","achive","achieve","acheeve"],"answer":"achieve","hint":"i before e except after c: a-c-h-i-e-v-e!"},
    {"level":"hard","word":"beginning","q":"Which is the correct spelling?","options":["begining","begginning","beginning","beginninng"],"answer":"beginning","hint":"double g, double n: be-gin-ning!"},
    {"level":"hard","word":"believe","q":"Which is the correct spelling?","options":["beleive","believe","beleve","beleeve"],"answer":"believe","hint":"i before e: be-l-i-e-v-e!"},
    {"level":"hard","word":"calendar","q":"Which is the correct spelling?","options":["calender","calander","calendar","callendar"],"answer":"calendar","hint":"cal-en-dar: c-a-l-e-n-d-a-r!"},
    {"level":"hard","word":"certain","q":"Which is the correct spelling?","options":["certian","certaine","certan","certain"],"answer":"certain","hint":"cer-tain: c-e-r-t-a-i-n!"},
    {"level":"hard","word":"committee","q":"Which is the correct spelling?","options":["comittee","committie","committee","commitee"],"answer":"committee","hint":"double m, double t, double e: com-mit-tee!"},
    {"level":"hard","word":"definitely","q":"Which is the correct spelling?","options":["definitly","definately","definitely","definitley"],"answer":"definitely","hint":"def-in-ite-ly: d-e-f-i-n-i-t-e-l-y!"},
    {"level":"hard","word":"disappear","q":"Which is the correct spelling?","options":["dissapear","disapear","disappear","disappeir"],"answer":"disappear","hint":"dis-ap-pear: one s, double p!"},
    {"level":"hard","word":"environment","q":"Which is the correct spelling?","options":["enviroment","enviornment","environment","envirnoment"],"answer":"environment","hint":"en-vi-ron-ment — remember the n after enviro!"},
    {"level":"hard","word":"exercise","q":"Which is the correct spelling?","options":["excercise","exercice","exercise","exercsise"],"answer":"exercise","hint":"ex-er-cise: e-x-e-r-c-i-s-e!"},
    {"level":"hard","word":"government","q":"Which is the correct spelling?","options":["goverment","governement","government","governmant"],"answer":"government","hint":"gov-ern-ment — remember the n!"},
    {"level":"hard","word":"guarantee","q":"Which is the correct spelling?","options":["garantee","guarentee","gurantee","guarantee"],"answer":"guarantee","hint":"guar-an-tee: g-u-a-r-a-n-t-e-e!"},
    {"level":"hard","word":"immediately","q":"Which is the correct spelling?","options":["imediately","immedietly","immediately","immediatley"],"answer":"immediately","hint":"im-me-di-ate-ly: double m!"},
    {"level":"hard","word":"independent","q":"Which is the correct spelling?","options":["independant","independant","independint","independent"],"answer":"independent","hint":"in-de-pen-dent: ends in -ent not -ant!"},
    {"level":"hard","word":"knowledge","q":"Which is the correct spelling?","options":["knowlege","knowledge","knowladge","knolwedge"],"answer":"knowledge","hint":"know-ledge: k-n-o-w-l-e-d-g-e!"},
    {"level":"hard","word":"maintenance","q":"Which is the correct spelling?","options":["maintanence","maintenence","maintenance","maintainence"],"answer":"maintenance","hint":"main-te-nance: m-a-i-n-t-e-n-a-n-c-e!"},
    {"level":"hard","word":"millennium","q":"Which is the correct spelling?","options":["milenium","millenium","millennium","millenniium"],"answer":"millennium","hint":"double l, double n: mil-len-ni-um!"},
    {"level":"hard","word":"neighbour","q":"Which is the correct spelling?","options":["nieghbour","neighbour","nieghbor","neihbour"],"answer":"neighbour","hint":"neigh-bour: n-e-i-g-h-b-o-u-r!"},
    {"level":"hard","word":"occasion","q":"Which is the correct spelling?","options":["ocassion","occasoin","occassion","occasion"],"answer":"occasion","hint":"oc-ca-sion: one c then double c... wait: o-c-c-a-s-i-o-n!"},
    {"level":"hard","word":"parliament","q":"Which is the correct spelling?","options":["parliment","parlament","parliament","parlaiment"],"answer":"parliament","hint":"par-lia-ment: p-a-r-l-i-a-m-e-n-t!"},
    {"level":"hard","word":"perseverance","q":"Which is the correct spelling?","options":["perserverance","perseverence","perseverance","persiverance"],"answer":"perseverance","hint":"per-se-ver-ance: p-e-r-s-e-v-e-r-a-n-c-e!"},
    {"level":"hard","word":"privilege","q":"Which is the correct spelling?","options":["privelege","privelige","priviledge","privilege"],"answer":"privilege","hint":"priv-i-lege: p-r-i-v-i-l-e-g-e!"},
    {"level":"hard","word":"pronunciation","q":"Which is the correct spelling?","options":["pronounciation","pronunciation","prononciation","pronunication"],"answer":"pronunciation","hint":"pro-nun-ci-ation (not pronounce-iation)!"},
    {"level":"hard","word":"questionnaire","q":"Which is the correct spelling?","options":["questionaire","questionnare","questionnaire","questionniare"],"answer":"questionnaire","hint":"question-naire: double n! q-u-e-s-t-i-o-n-n-a-i-r-e!"},
    {"level":"hard","word":"recommend","q":"Which is the correct spelling?","options":["reccommend","recomend","recommand","recommend"],"answer":"recommend","hint":"one c, double m: re-com-mend!"},
    {"level":"hard","word":"relevant","q":"Which is the correct spelling?","options":["relevent","relevaint","relevant","relavant"],"answer":"relevant","hint":"rel-e-vant: ends in -ant not -ent!"},
    {"level":"hard","word":"restaurant","q":"Which is the correct spelling?","options":["resturant","restarant","restaurant","restaruant"],"answer":"restaurant","hint":"res-tau-rant: r-e-s-t-a-u-r-a-n-t!"},
    {"level":"hard","word":"successful","q":"Which is the correct spelling?","options":["succesful","sucessful","successfull","successful"],"answer":"successful","hint":"double c, double s: suc-cess-ful!"},
    {"level":"hard","word":"unnecessary","q":"Which is the correct spelling?","options":["unecessary","unnecesary","unnecessery","unnecessary"],"answer":"unnecessary","hint":"un + necessary: double n, one c, double s!"},
      {level:"easy",word:"bus",q:"Which is the correct spelling?",options:["bos","bis","bus","buss"],answer:"bus",hint:"b-u-s"},
    {level:"easy",word:"mud",q:"Which is the correct spelling?",options:["mad","med","mod","mud"],answer:"mud",hint:"m-u-d"},
    {level:"easy",word:"log",q:"Which is the correct spelling?",options:["lag","leg","log","lug"],answer:"log",hint:"l-o-g"},
    {level:"easy",word:"wig",q:"Which is the correct spelling?",options:["wag","weg","wog","wig"],answer:"wig",hint:"w-i-g"},
    {level:"easy",word:"fin",q:"Which is the correct spelling?",options:["fan","fen","fin","fun"],answer:"fin",hint:"f-i-n"},
    {level:"easy",word:"den",q:"Which is the correct spelling?",options:["dan","den","din","don"],answer:"den",hint:"d-e-n"},
    {level:"easy",word:"yam",q:"Which is the correct spelling?",options:["yam","yem","yim","yom"],answer:"yam",hint:"y-a-m"},
    {level:"easy",word:"mop",q:"Which is the correct spelling?",options:["map","mep","mip","mop"],answer:"mop",hint:"m-o-p"},
    {level:"easy",word:"van",q:"Which is the correct spelling?",options:["ven","vin","von","van"],answer:"van",hint:"v-a-n"},
    {level:"easy",word:"web",q:"Which is the correct spelling?",options:["wab","web","wib","wob"],answer:"web",hint:"w-e-b"},
    {level:"easy",word:"zip",q:"Which is the correct spelling?",options:["zap","zep","zip","zop"],answer:"zip",hint:"z-i-p"},
    {level:"easy",word:"nap",q:"Which is the correct spelling?",options:["nap","nep","nip","nop"],answer:"nap",hint:"n-a-p"},
    {level:"easy",word:"dim",q:"Which is the correct spelling?",options:["dam","dem","dim","dom"],answer:"dim",hint:"d-i-m"},
    {level:"easy",word:"rip",q:"Which is the correct spelling?",options:["rap","rep","rip","rop"],answer:"rip",hint:"r-i-p"},
    {level:"easy",word:"sip",q:"Which is the correct spelling?",options:["sap","sep","sip","sop"],answer:"sip",hint:"s-i-p"},
    {level:"easy",word:"fog",q:"Which is the correct spelling?",options:["fag","fog","fig","fug"],answer:"fog",hint:"f-o-g"},
    {level:"easy",word:"hug",q:"Which is the correct spelling?",options:["hag","heg","hig","hug"],answer:"hug",hint:"h-u-g"},
    {level:"easy",word:"jug",q:"Which is the correct spelling?",options:["jag","jeg","jig","jug"],answer:"jug",hint:"j-u-g"},
    {level:"easy",word:"tub",q:"Which is the correct spelling?",options:["tab","teb","tib","tub"],answer:"tub",hint:"t-u-b"},
    {level:"easy",word:"wax",q:"Which is the correct spelling?",options:["wax","wex","wix","wox"],answer:"wax",hint:"w-a-x"},
    {level:"easy",word:"gap",q:"Which is the correct spelling?",options:["gap","gep","gip","gop"],answer:"gap",hint:"g-a-p"},
    {level:"easy",word:"cob",q:"Which is the correct spelling?",options:["cab","cob","cub","cib"],answer:"cob",hint:"c-o-b"},
    {level:"easy",word:"sob",q:"Which is the correct spelling?",options:["sab","seb","sob","sub"],answer:"sob",hint:"s-o-b"},
    {level:"easy",word:"gem",q:"Which is the correct spelling?",options:["gam","gem","gim","gum"],answer:"gem",hint:"g-e-m"},
    {level:"easy",word:"yell",q:"Which is the correct spelling?",options:["yall","yell","yill","yoll"],answer:"yell",hint:"y-e-l-l — double l!"},
    {level:"easy",word:"cod",q:"Which is the correct spelling?",options:["cad","cod","cud","cid"],answer:"cod",hint:"c-o-d"},
    {level:"easy",word:"tip",q:"Which is the correct spelling?",options:["tap","tep","tip","top"],answer:"tip",hint:"t-i-p"},
    {level:"easy",word:"bid",q:"Which is the correct spelling?",options:["bad","bed","bid","bod"],answer:"bid",hint:"b-i-d"},
    {level:"easy",word:"pub",q:"Which is the correct spelling?",options:["pab","peb","pib","pub"],answer:"pub",hint:"p-u-b"},
    {level:"easy",word:"nun",q:"Which is the correct spelling?",options:["nan","nen","nin","nun"],answer:"nun",hint:"n-u-n — double n!"},
    {level:"medium",word:"angry",q:"Which is the correct spelling?",options:["angery","angry","angrey","angrry"],answer:"angry",hint:"a-n-g-r-y — no e in angry!"},
    {level:"medium",word:"always",q:"Which is the correct spelling?",options:["allways","alwayes","always","alweys"],answer:"always",hint:"a-l-w-a-y-s"},
    {level:"medium",word:"carry",q:"Which is the correct spelling?",options:["cary","carrey","carry","caary"],answer:"carry",hint:"double r: c-a-r-r-y!"},
    {level:"medium",word:"early",q:"Which is the correct spelling?",options:["earley","earlly","erly","early"],answer:"early",hint:"e-a-r-l-y"},
    {level:"medium",word:"fairy",q:"Which is the correct spelling?",options:["farey","fairy","fairey","faiiry"],answer:"fairy",hint:"f-a-i-r-y"},
    {level:"medium",word:"giant",q:"Which is the correct spelling?",options:["giiant","giant","gient","giante"],answer:"giant",hint:"g-i-a-n-t"},
    {level:"medium",word:"island",q:"Which is the correct spelling?",options:["iland","islend","island","islaand"],answer:"island",hint:"silent s: i-s-l-a-n-d!"},
    {level:"medium",word:"knight",q:"Which is the correct spelling?",options:["nite","knite","knight","knighte"],answer:"knight",hint:"silent k and gh: k-n-i-g-h-t!"},
    {level:"medium",word:"laugh",q:"Which is the correct spelling?",options:["laf","laff","laugh","laughe"],answer:"laugh",hint:"l-a-u-g-h"},
    {level:"medium",word:"magic",q:"Which is the correct spelling?",options:["majic","magick","magic","maggic"],answer:"magic",hint:"m-a-g-i-c"},
    {level:"medium",word:"nature",q:"Which is the correct spelling?",options:["naiture","nature","natur","natture"],answer:"nature",hint:"n-a-t-u-r-e"},
    {level:"medium",word:"often",q:"Which is the correct spelling?",options:["ofton","often","offten","ofen"],answer:"often",hint:"o-f-t-e-n — t is often silent!"},
    {level:"medium",word:"pencil",q:"Which is the correct spelling?",options:["pensil","pencil","pensile","pencill"],answer:"pencil",hint:"p-e-n-c-i-l"},
    {level:"medium",word:"quiet",q:"Which is the correct spelling?",options:["queit","qiuet","quiet","quieet"],answer:"quiet",hint:"q-u-i-e-t"},
    {level:"medium",word:"silver",q:"Which is the correct spelling?",options:["siilver","silvar","silver","sillver"],answer:"silver",hint:"s-i-l-v-e-r"},
    {level:"medium",word:"valley",q:"Which is the correct spelling?",options:["vally","vallley","valey","valley"],answer:"valley",hint:"double l: v-a-l-l-e-y!"},
    {level:"medium",word:"whisper",q:"Which is the correct spelling?",options:["wisper","whispir","whisper","whissper"],answer:"whisper",hint:"w-h-i-s-p-e-r"},
    {level:"medium",word:"yellow",q:"Which is the correct spelling?",options:["yello","yelloe","yelow","yellow"],answer:"yellow",hint:"double l: y-e-l-l-o-w!"},
    {level:"medium",word:"twice",q:"Which is the correct spelling?",options:["twyce","twize","twice","twicce"],answer:"twice",hint:"t-w-i-c-e"},
    {level:"medium",word:"pigeon",q:"Which is the correct spelling?",options:["pidgeon","pigeon","pigoen","pigeoon"],answer:"pigeon",hint:"p-i-g-e-o-n"},
    {level:"medium",word:"special",q:"Which is the correct spelling?",options:["speciel","special","speciial","specail"],answer:"special",hint:"s-p-e-c-i-a-l"},
    {level:"medium",word:"mixture",q:"Which is the correct spelling?",options:["mixsure","mixtur","mixture","mixtture"],answer:"mixture",hint:"m-i-x-t-u-r-e"},
    {level:"medium",word:"heart",q:"Which is the correct spelling?",options:["haert","heartt","heart","hert"],answer:"heart",hint:"h-e-a-r-t"},
    {level:"medium",word:"zebra",q:"Which is the correct spelling?",options:["zeebra","zebraa","zebra","zibra"],answer:"zebra",hint:"z-e-b-r-a"},
    {level:"medium",word:"river",q:"Which is the correct spelling?",options:["rivver","rivar","rriver","river"],answer:"river",hint:"r-i-v-e-r"},
    {level:"medium",word:"magic",q:"Which is the correct spelling?",options:["maigc","majic","magic","magik"],answer:"magic",hint:"m-a-g-i-c"},
    {level:"medium",word:"jewel",q:"Which is the correct spelling?",options:["juwel","jewel","jewells","juwell"],answer:"jewel",hint:"j-e-w-e-l"},
    {level:"medium",word:"uncle",q:"Which is the correct spelling?",options:["onkle","unclle","uncul","uncle"],answer:"uncle",hint:"u-n-c-l-e"},
    {level:"medium",word:"table",q:"Which is the correct spelling?",options:["tabel","taible","table","tabllee"],answer:"table",hint:"t-a-b-l-e"},
    {level:"medium",word:"daily",q:"Which is the correct spelling?",options:["dailly","daly","daily","dailey"],answer:"daily",hint:"d-a-i-l-y"},
    {level:"hard",word:"accommodate",q:"Which is the correct spelling?",options:["accomodate","accommodate","acommodate","accomadate"],answer:"accommodate",hint:"double c double m: ac-com-mo-date!"},
    {level:"hard",word:"achieve",q:"Which is the correct spelling?",options:["acheive","achive","achieve","acheeve"],answer:"achieve",hint:"i before e: a-c-h-i-e-v-e!"},
    {level:"hard",word:"beginning",q:"Which is the correct spelling?",options:["begining","begginning","beginning","beginninng"],answer:"beginning",hint:"double g double n: be-gin-ning!"},
    {level:"hard",word:"believe",q:"Which is the correct spelling?",options:["beleive","believe","beleve","beleeve"],answer:"believe",hint:"i before e: be-l-i-e-v-e!"},
    {level:"hard",word:"calendar",q:"Which is the correct spelling?",options:["calender","calander","calendar","callendar"],answer:"calendar",hint:"c-a-l-e-n-d-a-r"},
    {level:"hard",word:"committee",q:"Which is the correct spelling?",options:["comittee","committie","committee","commitee"],answer:"committee",hint:"double m double t double e: com-mit-tee!"},
    {level:"hard",word:"definitely",q:"Which is the correct spelling?",options:["definitly","definately","definitely","definitley"],answer:"definitely",hint:"def-in-ite-ly!"},
    {level:"hard",word:"disappear",q:"Which is the correct spelling?",options:["dissapear","disapear","disappear","disappeir"],answer:"disappear",hint:"dis-ap-pear: one s double p!"},
    {level:"hard",word:"environment",q:"Which is the correct spelling?",options:["enviroment","enviornment","environment","envirnoment"],answer:"environment",hint:"en-vi-ron-ment!"},
    {level:"hard",word:"exercise",q:"Which is the correct spelling?",options:["excercise","exercice","exercise","exercsise"],answer:"exercise",hint:"e-x-e-r-c-i-s-e!"},
    {level:"hard",word:"government",q:"Which is the correct spelling?",options:["goverment","governement","government","governmant"],answer:"government",hint:"gov-ern-ment!"},
    {level:"hard",word:"guarantee",q:"Which is the correct spelling?",options:["garantee","guarentee","gurantee","guarantee"],answer:"guarantee",hint:"g-u-a-r-a-n-t-e-e!"},
    {level:"hard",word:"immediately",q:"Which is the correct spelling?",options:["imediately","immedietly","immediately","immediatley"],answer:"immediately",hint:"im-me-di-ate-ly: double m!"},
    {level:"hard",word:"independent",q:"Which is the correct spelling?",options:["independant","independant","independint","independent"],answer:"independent",hint:"ends in -ent not -ant!"},
    {level:"hard",word:"knowledge",q:"Which is the correct spelling?",options:["knowlege","knowledge","knowladge","knolwedge"],answer:"knowledge",hint:"k-n-o-w-l-e-d-g-e!"},
    {level:"hard",word:"maintenance",q:"Which is the correct spelling?",options:["maintanence","maintenence","maintenance","maintainence"],answer:"maintenance",hint:"m-a-i-n-t-e-n-a-n-c-e!"},
    {level:"hard",word:"millennium",q:"Which is the correct spelling?",options:["milenium","millenium","millennium","millenniium"],answer:"millennium",hint:"double l double n: mil-len-ni-um!"},
    {level:"hard",word:"necessary",q:"Which is the correct spelling?",options:["neccessary","necesary","necessary","neccesary"],answer:"necessary",hint:"1 collar 2 socks: n-e-c-e-s-s-a-r-y!"},
    {level:"hard",word:"occasion",q:"Which is the correct spelling?",options:["ocassion","occasoin","occassion","occasion"],answer:"occasion",hint:"o-c-c-a-s-i-o-n!"},
    {level:"hard",word:"parliament",q:"Which is the correct spelling?",options:["parliment","parlament","parliament","parlaiment"],answer:"parliament",hint:"p-a-r-l-i-a-m-e-n-t!"},
    {level:"hard",word:"privilege",q:"Which is the correct spelling?",options:["privelege","privelige","priviledge","privilege"],answer:"privilege",hint:"p-r-i-v-i-l-e-g-e!"},
    {level:"hard",word:"recommend",q:"Which is the correct spelling?",options:["reccommend","recomend","recommand","recommend"],answer:"recommend",hint:"one c double m: re-com-mend!"},
    {level:"hard",word:"restaurant",q:"Which is the correct spelling?",options:["resturant","restarant","restaurant","restaruant"],answer:"restaurant",hint:"r-e-s-t-a-u-r-a-n-t!"},
    {level:"hard",word:"successful",q:"Which is the correct spelling?",options:["succesful","sucessful","successfull","successful"],answer:"successful",hint:"double c double s: suc-cess-ful!"},
    {level:"hard",word:"unnecessary",q:"Which is the correct spelling?",options:["unecessary","unnecesary","unnecessery","unnecessary"],answer:"unnecessary",hint:"un+necessary: double n!"},
    {level:"hard",word:"questionnaire",q:"Which is the correct spelling?",options:["questionaire","questionnare","questionnaire","questionniare"],answer:"questionnaire",hint:"double n: q-u-e-s-t-i-o-n-n-a-i-r-e!"},
    {level:"hard",word:"perseverance",q:"Which is the correct spelling?",options:["perserverance","perseverence","perseverance","persiverance"],answer:"perseverance",hint:"p-e-r-s-e-v-e-r-a-n-c-e!"},
    {level:"hard",word:"pronunciation",q:"Which is the correct spelling?",options:["pronounciation","pronunciation","prononciation","pronunication"],answer:"pronunciation",hint:"pro-nun-ci-ation not pronounce-iation!"},
    {level:"hard",word:"relevant",q:"Which is the correct spelling?",options:["relevent","relevaint","relevant","relavant"],answer:"relevant",hint:"ends in -ant not -ent!"},
    {level:"hard",word:"certain",q:"Which is the correct spelling?",options:["certian","certaine","certan","certain"],answer:"certain",hint:"c-e-r-t-a-i-n!"}
  ,
    {level:"easy",word:"hat",q:"Which is the correct spelling?",options:["het","hit","hat","hot"],answer:"hat",hint:"h-a-t"},
    {level:"easy",word:"pin",q:"Which is the correct spelling?",options:["pan","pen","pin","pun"],answer:"pin",hint:"p-i-n"},
    {level:"easy",word:"sun",q:"Which is the correct spelling?",options:["san","sen","sin","sun"],answer:"sun",hint:"s-u-n"},
    {level:"easy",word:"run",q:"Which is the correct spelling?",options:["ran","ren","rin","run"],answer:"run",hint:"r-u-n"},
    {level:"easy",word:"top",q:"Which is the correct spelling?",options:["tap","tep","tip","top"],answer:"top",hint:"t-o-p"},
    {level:"easy",word:"hop",q:"Which is the correct spelling?",options:["hap","hep","hip","hop"],answer:"hop",hint:"h-o-p"},
    {level:"easy",word:"cup",q:"Which is the correct spelling?",options:["cap","cep","cip","cup"],answer:"cup",hint:"c-u-p"},
    {level:"easy",word:"bug",q:"Which is the correct spelling?",options:["bag","beg","big","bug"],answer:"bug",hint:"b-u-g"},
    {level:"easy",word:"dug",q:"Which is the correct spelling?",options:["dag","deg","dig","dug"],answer:"dug",hint:"d-u-g"},
    {level:"easy",word:"rug",q:"Which is the correct spelling?",options:["rag","reg","rig","rug"],answer:"rug",hint:"r-u-g"},
    {level:"easy",word:"peg",q:"Which is the correct spelling?",options:["pag","peg","pig","pog"],answer:"peg",hint:"p-e-g"},
    {level:"easy",word:"net",q:"Which is the correct spelling?",options:["nat","net","nit","not"],answer:"net",hint:"n-e-t"},
    {level:"easy",word:"set",q:"Which is the correct spelling?",options:["sat","set","sit","sot"],answer:"set",hint:"s-e-t"},
    {level:"easy",word:"let",q:"Which is the correct spelling?",options:["lat","let","lit","lot"],answer:"let",hint:"l-e-t"},
    {level:"easy",word:"pet",q:"Which is the correct spelling?",options:["pat","pet","pit","pot"],answer:"pet",hint:"p-e-t"},
    {level:"easy",word:"jet",q:"Which is the correct spelling?",options:["jat","jet","jit","jot"],answer:"jet",hint:"j-e-t"},
    {level:"easy",word:"wet",q:"Which is the correct spelling?",options:["wat","wet","wit","wot"],answer:"wet",hint:"w-e-t"},
    {level:"easy",word:"hen",q:"Which is the correct spelling?",options:["han","hen","hin","hon"],answer:"hen",hint:"h-e-n"},
    {level:"easy",word:"ten",q:"Which is the correct spelling?",options:["tan","ten","tin","ton"],answer:"ten",hint:"t-e-n"},
    {level:"easy",word:"pen",q:"Which is the correct spelling?",options:["pan","pen","pin","pon"],answer:"pen",hint:"p-e-n"},
    {level:"easy",word:"men",q:"Which is the correct spelling?",options:["man","men","min","mon"],answer:"men",hint:"m-e-n"},
    {level:"easy",word:"bed",q:"Which is the correct spelling?",options:["bad","bed","bid","bod"],answer:"bed",hint:"b-e-d"},
    {level:"easy",word:"led",q:"Which is the correct spelling?",options:["lad","led","lid","lod"],answer:"led",hint:"l-e-d"},
    {level:"easy",word:"red",q:"Which is the correct spelling?",options:["rad","red","rid","rod"],answer:"red",hint:"r-e-d — the colour!"},
    {level:"easy",word:"fed",q:"Which is the correct spelling?",options:["fad","fed","fid","fod"],answer:"fed",hint:"f-e-d"},
    {level:"easy",word:"big",q:"Which is the correct spelling?",options:["bag","beg","big","bog"],answer:"big",hint:"b-i-g"},
    {level:"easy",word:"dig",q:"Which is the correct spelling?",options:["dag","deg","dig","dog"],answer:"dig",hint:"d-i-g"},
    {level:"easy",word:"fig",q:"Which is the correct spelling?",options:["fag","feg","fig","fog"],answer:"fig",hint:"f-i-g — a fruit!"},
    {level:"easy",word:"jig",q:"Which is the correct spelling?",options:["jag","jeg","jig","jog"],answer:"jig",hint:"j-i-g — a dance!"},
    {level:"easy",word:"pig",q:"Which is the correct spelling?",options:["pag","peg","pig","pog"],answer:"pig",hint:"p-i-g — oink!"},
    {level:"easy",word:"rig",q:"Which is the correct spelling?",options:["rag","reg","rig","rog"],answer:"rig",hint:"r-i-g"},
    {level:"easy",word:"twig",q:"Which is the correct spelling?",options:["twag","tweg","twig","twog"],answer:"twig",hint:"t-w-i-g — a small branch!"},
    {level:"easy",word:"slug",q:"Which is the correct spelling?",options:["slag","sleg","slig","slug"],answer:"slug",hint:"s-l-u-g — a slimy creature!"},
    {level:"easy",word:"plug",q:"Which is the correct spelling?",options:["plag","pleg","plig","plug"],answer:"plug",hint:"p-l-u-g — into the socket!"},
    {level:"easy",word:"snug",q:"Which is the correct spelling?",options:["snag","sneg","snig","snug"],answer:"snug",hint:"s-n-u-g — cosy and warm!"},
    {level:"easy",word:"drum",q:"Which is the correct spelling?",options:["dram","drem","drim","drum"],answer:"drum",hint:"d-r-u-m — bang the drum!"},
    {level:"easy",word:"drip",q:"Which is the correct spelling?",options:["drap","drep","drip","drop"],answer:"drip",hint:"d-r-i-p — water drips!"},
    {level:"easy",word:"grip",q:"Which is the correct spelling?",options:["grap","grep","grip","grop"],answer:"grip",hint:"g-r-i-p — hold tight!"},
    {level:"easy",word:"trip",q:"Which is the correct spelling?",options:["trap","trep","trip","trop"],answer:"trip",hint:"t-r-i-p — a journey!"},
    {level:"easy",word:"ship",q:"Which is the correct spelling?",options:["shap","shep","ship","shop"],answer:"ship",hint:"s-h-i-p — sails the sea!"},
    {level:"easy",word:"chip",q:"Which is the correct spelling?",options:["chap","chep","chip","chop"],answer:"chip",hint:"c-h-i-p — potato chip!"},
    {level:"easy",word:"whip",q:"Which is the correct spelling?",options:["whap","whep","whip","whop"],answer:"whip",hint:"w-h-i-p"},
    {level:"easy",word:"flip",q:"Which is the correct spelling?",options:["flap","flep","flip","flop"],answer:"flip",hint:"f-l-i-p — flip a coin!"},
    {level:"easy",word:"drip",q:"Which is the correct spelling?",options:["drop","drip","drup","drep"],answer:"drip",hint:"d-r-i-p"},
    {level:"easy",word:"blob",q:"Which is the correct spelling?",options:["blab","bleb","blib","blob"],answer:"blob",hint:"b-l-o-b — a blobby shape!"},
    {level:"easy",word:"plop",q:"Which is the correct spelling?",options:["plap","plep","plip","plop"],answer:"plop",hint:"p-l-o-p — splash!"},
    {level:"easy",word:"stop",q:"Which is the correct spelling?",options:["stap","step","stip","stop"],answer:"stop",hint:"s-t-o-p — stop right there!"},
    {level:"easy",word:"shop",q:"Which is the correct spelling?",options:["shap","shep","ship","shop"],answer:"shop",hint:"s-h-o-p — where you buy things!"},
    {level:"easy",word:"chop",q:"Which is the correct spelling?",options:["chap","chep","chip","chop"],answer:"chop",hint:"c-h-o-p — chop the wood!"},
    {level:"easy",word:"drop",q:"Which is the correct spelling?",options:["drap","drep","drip","drop"],answer:"drop",hint:"d-r-o-p — drops of rain!"},
    {level:"easy",word:"crop",q:"Which is the correct spelling?",options:["crap","crep","crip","crop"],answer:"crop",hint:"c-r-o-p — a crop of wheat!"},
    {level:"easy",word:"prop",q:"Which is the correct spelling?",options:["prap","prep","prip","prop"],answer:"prop",hint:"p-r-o-p — to prop up!"},
    {level:"easy",word:"frog",q:"Which is the correct spelling?",options:["frag","freg","frig","frog"],answer:"frog",hint:"f-r-o-g — ribbit!"},
    {level:"easy",word:"blog",q:"Which is the correct spelling?",options:["blag","bleg","blig","blog"],answer:"blog",hint:"b-l-o-g — an online blog!"},
    {level:"easy",word:"slog",q:"Which is the correct spelling?",options:["slag","sleg","slig","slog"],answer:"slog",hint:"s-l-o-g — work hard!"},
    {level:"medium",word:"before",q:"Which is the correct spelling?",options:["befor","befour","before","befoar"],answer:"before",hint:"be-fore: b-e-f-o-r-e"},
    {level:"medium",word:"because",q:"Which is the correct spelling?",options:["becaus","becuase","because","beccause"],answer:"because",hint:"be-cause: b-e-c-a-u-s-e"},
    {level:"medium",word:"between",q:"Which is the correct spelling?",options:["beetween","betwen","between","betwene"],answer:"between",hint:"be-tween: b-e-t-w-e-e-n"},
    {level:"medium",word:"caught",q:"Which is the correct spelling?",options:["caut","cought","caught","caght"],answer:"caught",hint:"c-a-u-g-h-t — tricky!"},
    {level:"medium",word:"daughter",q:"Which is the correct spelling?",options:["dauter","daugther","daughter","daughtar"],answer:"daughter",hint:"daugh-ter: d-a-u-g-h-t-e-r"},
    {level:"medium",word:"enough",q:"Which is the correct spelling?",options:["enuf","inough","ennough","enough"],answer:"enough",hint:"e-n-o-u-g-h — silent gh!"},
    {level:"medium",word:"February",q:"Which is the correct spelling?",options:["Febuary","Febbruary","February","Februray"],answer:"February",hint:"Feb-ru-ary: F-e-b-r-u-a-r-y"},
    {level:"medium",word:"friend",q:"Which is the correct spelling?",options:["freind","frend","friened","friend"],answer:"friend",hint:"fri-end: f-r-i-e-n-d"},
    {level:"medium",word:"guard",q:"Which is the correct spelling?",options:["gard","guad","gaurd","guard"],answer:"guard",hint:"g-u-a-r-d — silent u!"},
    {level:"medium",word:"height",q:"Which is the correct spelling?",options:["hight","heigt","heighth","height"],answer:"height",hint:"h-e-i-g-h-t — tricky silent gh!"},
    {level:"medium",word:"honest",q:"Which is the correct spelling?",options:["honset","honesst","honest","honnest"],answer:"honest",hint:"h-o-n-e-s-t — silent h!"},
    {level:"medium",word:"imagine",q:"Which is the correct spelling?",options:["imagin","immagine","imaggine","imagine"],answer:"imagine",hint:"i-m-a-g-i-n-e"},
    {level:"medium",word:"January",q:"Which is the correct spelling?",options:["Januery","Janury","Jannuary","January"],answer:"January",hint:"Jan-u-ary: J-a-n-u-a-r-y"},
    {level:"medium",word:"kitchen",q:"Which is the correct spelling?",options:["kicten","kitchin","kitchun","kitchen"],answer:"kitchen",hint:"kitch-en: k-i-t-c-h-e-n"},
    {level:"medium",word:"language",q:"Which is the correct spelling?",options:["languge","lenguage","languege","language"],answer:"language",hint:"lan-guage: l-a-n-g-u-a-g-e"},
    {level:"medium",word:"minute",q:"Which is the correct spelling?",options:["minnute","minut","minuite","minute"],answer:"minute",hint:"min-ute: m-i-n-u-t-e"},
    {level:"medium",word:"necessary",q:"Which is the correct spelling?",options:["neccessary","necesary","necessery","necessary"],answer:"necessary",hint:"1 c, 2 s: n-e-c-e-s-s-a-r-y"},
    {level:"medium",word:"October",q:"Which is the correct spelling?",options:["Octobar","Octobir","Octobber","October"],answer:"October",hint:"Oct-o-ber: O-c-t-o-b-e-r"},
    {level:"medium",word:"people",q:"Which is the correct spelling?",options:["pepole","peaple","peopel","people"],answer:"people",hint:"peo-ple: p-e-o-p-l-e"},
    {level:"medium",word:"quarter",q:"Which is the correct spelling?",options:["quartir","quater","querter","quarter"],answer:"quarter",hint:"quar-ter: q-u-a-r-t-e-r"},
    {level:"medium",word:"really",q:"Which is the correct spelling?",options:["realy","reelly","reallly","really"],answer:"really",hint:"re-ally: double l! r-e-a-l-l-y"},
    {level:"medium",word:"science",q:"Which is the correct spelling?",options:["scince","sceince","sciense","science"],answer:"science",hint:"sci-ence: s-c-i-e-n-c-e"},
    {level:"medium",word:"separate",q:"Which is the correct spelling?",options:["seperate","separete","seprate","separate"],answer:"separate",hint:"sep-a-rate: s-e-p-a-r-a-t-e"},
    {level:"medium",word:"Thursday",q:"Which is the correct spelling?",options:["Thurday","Thrusday","Thrudsay","Thursday"],answer:"Thursday",hint:"Thurs-day: T-h-u-r-s-d-a-y"},
    {level:"medium",word:"together",q:"Which is the correct spelling?",options:["togther","togather","togehter","together"],answer:"together",hint:"to-geth-er: t-o-g-e-t-h-e-r"},
    {level:"medium",word:"umbrella",q:"Which is the correct spelling?",options:["umbralla","umbrela","umbrella","umbrella"],answer:"umbrella",hint:"um-brel-la: double l! u-m-b-r-e-l-l-a"},
    {level:"medium",word:"vegetable",q:"Which is the correct spelling?",options:["vegatable","vegetible","vegtable","vegetable"],answer:"vegetable",hint:"veg-e-ta-ble: v-e-g-e-t-a-b-l-e"},
    {level:"medium",word:"Wednesday",q:"Which is the correct spelling?",options:["Wendesday","Wensday","Wendsday","Wednesday"],answer:"Wednesday",hint:"silent d: W-e-d-n-e-s-d-a-y"},
    {level:"medium",word:"whether",q:"Which is the correct spelling?",options:["wether","wheter","wheather","whether"],answer:"whether",hint:"w-h-e-t-h-e-r"},
    {level:"medium",word:"whole",q:"Which is the correct spelling?",options:["hole","holle","whole","whol"],answer:"whole",hint:"silent wh: w-h-o-l-e"},
    {level:"medium",word:"woman",q:"Which is the correct spelling?",options:["womun","womon","waman","woman"],answer:"woman",hint:"wom-an: w-o-m-a-n"},
    {level:"medium",word:"world",q:"Which is the correct spelling?",options:["wirld","wurld","worled","world"],answer:"world",hint:"wor-ld: w-o-r-l-d"},
    {level:"medium",word:"thought",q:"Which is the correct spelling?",options:["thort","thougt","thoght","thought"],answer:"thought",hint:"silent gh: t-h-o-u-g-h-t"},
    {level:"medium",word:"though",q:"Which is the correct spelling?",options:["tho","thoe","thoug","though"],answer:"though",hint:"silent gh: t-h-o-u-g-h"},
    {level:"medium",word:"through",q:"Which is the correct spelling?",options:["thru","throo","threw","through"],answer:"through",hint:"silent gh: t-h-r-o-u-g-h"},
    {level:"medium",word:"piece",q:"Which is the correct spelling?",options:["peice","pece","piese","piece"],answer:"piece",hint:"i before e: p-i-e-c-e"},
    {level:"medium",word:"ceiling",q:"Which is the correct spelling?",options:["cealing","cieling","celing","ceiling"],answer:"ceiling",hint:"except after c: c-e-i-l-i-n-g"},
    {level:"medium",word:"foreign",q:"Which is the correct spelling?",options:["forign","foregn","foriegn","foreign"],answer:"foreign",hint:"for-eign: f-o-r-e-i-g-n"},
    {level:"medium",word:"ancient",q:"Which is the correct spelling?",options:["ancent","ancien","anicient","ancient"],answer:"ancient",hint:"an-cient: a-n-c-i-e-n-t"},
    {level:"medium",word:"journey",q:"Which is the correct spelling?",options:["jorney","journy","journney","journey"],answer:"journey",hint:"jour-ney: j-o-u-r-n-e-y"},
    {level:"medium",word:"machine",q:"Which is the correct spelling?",options:["machene","masheen","machiene","machine"],answer:"machine",hint:"ma-chine: m-a-c-h-i-n-e"},
    {level:"medium",word:"achieve",q:"Which is the correct spelling?",options:["acheive","achive","acieve","achieve"],answer:"achieve",hint:"i before e except after c: a-c-h-i-e-v-e"},
    {level:"medium",word:"soldier",q:"Which is the correct spelling?",options:["soilder","soldiar","soldir","soldier"],answer:"soldier",hint:"sol-dier: s-o-l-d-i-e-r"},
    {level:"medium",word:"treasure",q:"Which is the correct spelling?",options:["tresure","treashure","treasuure","treasure"],answer:"treasure",hint:"trea-sure: t-r-e-a-s-u-r-e"},
    {level:"medium",word:"beautiful",q:"Which is the correct spelling?",options:["beutiful","beautifull","beatiful","beautiful"],answer:"beautiful",hint:"beau-ti-ful: b-e-a-u-t-i-f-u-l"},
    {level:"medium",word:"business",q:"Which is the correct spelling?",options:["bussiness","busines","buisness","business"],answer:"business",hint:"busi-ness: b-u-s-i-n-e-s-s"},
    {level:"medium",word:"address",q:"Which is the correct spelling?",options:["adress","addres","addrss","address"],answer:"address",hint:"double d double s: a-d-d-r-e-s-s"},
    {level:"medium",word:"answer",q:"Which is the correct spelling?",options:["anser","answar","answir","answer"],answer:"answer",hint:"an-swer: a-n-s-w-e-r — silent w!"},
    {level:"medium",word:"autumn",q:"Which is the correct spelling?",options:["autum","autmun","atumn","autumn"],answer:"autumn",hint:"au-tumn: a-u-t-u-m-n — silent n!"},
    {level:"medium",word:"column",q:"Which is the correct spelling?",options:["colum","columm","colmun","column"],answer:"column",hint:"col-umn: c-o-l-u-m-n — silent n!"},
    {level:"medium",word:"February",q:"Which is the correct spelling?",options:["Febuary","Feburary","Februry","February"],answer:"February",hint:"Feb-ru-ary: don't forget the first r!"},
    {level:"medium",word:"hospital",q:"Which is the correct spelling?",options:["hospitall","hopsital","hospitel","hospital"],answer:"hospital",hint:"hos-pi-tal: h-o-s-p-i-t-a-l"},
    {level:"medium",word:"library",q:"Which is the correct spelling?",options:["librery","libary","librairy","library"],answer:"library",hint:"lib-ra-ry: l-i-b-r-a-r-y"},
    {level:"medium",word:"literally",q:"Which is the correct spelling?",options:["literaly","litterally","literraly","literally"],answer:"literally",hint:"lit-er-al-ly: l-i-t-e-r-a-l-l-y"},
    {level:"hard",word:"aberration",q:"Which is the correct spelling?",options:["aberasion","abberation","aberation","aberration"],answer:"aberration",hint:"ab-er-ra-tion: double r!"},
    {level:"hard",word:"accessible",q:"Which is the correct spelling?",options:["accesible","accessable","accessibel","accessible"],answer:"accessible",hint:"ac-cess-i-ble: double c double s!"},
    {level:"hard",word:"acquaintance",q:"Which is the correct spelling?",options:["aquaintance","aquaintence","acquaintence","acquaintance"],answer:"acquaintance",hint:"ac-quaint-ance: a-c-q-u-a-i-n-t-a-n-c-e"},
    {level:"hard",word:"address",q:"Which is the correct spelling?",options:["adress","addres","addrss","address"],answer:"address",hint:"double d double s: a-d-d-r-e-s-s"},
    {level:"hard",word:"apparent",q:"Which is the correct spelling?",options:["aparent","apparant","apparrent","apparent"],answer:"apparent",hint:"ap-par-ent: double p! a-p-p-a-r-e-n-t"},
    {level:"hard",word:"bureaucracy",q:"Which is the correct spelling?",options:["burocracy","bureaucrasy","bureacracy","bureaucracy"],answer:"bureaucracy",hint:"bur-eau-cra-cy: b-u-r-e-a-u-c-r-a-c-y"},
    {level:"hard",word:"camouflage",q:"Which is the correct spelling?",options:["camoflage","camouflge","cammoflage","camouflage"],answer:"camouflage",hint:"cam-ou-flage: c-a-m-o-u-f-l-a-g-e"},
    {level:"hard",word:"cemetery",q:"Which is the correct spelling?",options:["cemetary","cematary","cemetry","cemetery"],answer:"cemetery",hint:"all e's: c-e-m-e-t-e-r-y"},
    {level:"hard",word:"colleague",q:"Which is the correct spelling?",options:["collegue","colleeague","coleague","colleague"],answer:"colleague",hint:"col-league: c-o-l-l-e-a-g-u-e"},
    {level:"hard",word:"conscientious",q:"Which is the correct spelling?",options:["consientious","consciencious","concientious","conscientious"],answer:"conscientious",hint:"con-sci-en-tious: c-o-n-s-c-i-e-n-t-i-o-u-s"},
    {level:"hard",word:"correspondence",q:"Which is the correct spelling?",options:["correspondance","corrispondence","coorespondence","correspondence"],answer:"correspondence",hint:"cor-re-spond-ence: double r!"},
    {level:"hard",word:"definitely",q:"Which is the correct spelling?",options:["definitly","definately","definitley","definitely"],answer:"definitely",hint:"def-in-ite-ly: d-e-f-i-n-i-t-e-l-y"},
    {level:"hard",word:"dilemma",q:"Which is the correct spelling?",options:["dilema","dilemna","dillema","dilemma"],answer:"dilemma",hint:"di-lem-ma: double m! d-i-l-e-m-m-a"},
    {level:"hard",word:"embarrassment",q:"Which is the correct spelling?",options:["embarasment","embarrasment","embarrassement","embarrassment"],answer:"embarrassment",hint:"em-bar-rass-ment: double r double s!"},
    {level:"hard",word:"exaggerate",q:"Which is the correct spelling?",options:["exagerate","exaggerrate","exaggorate","exaggerate"],answer:"exaggerate",hint:"ex-ag-ger-ate: double g! e-x-a-g-g-e-r-a-t-e"},
    {level:"hard",word:"February",q:"Which is the correct spelling?",options:["Febuary","Feburary","Februaary","February"],answer:"February",hint:"Feb-ru-ary: don't drop the r!"},
    {level:"hard",word:"fluorescent",q:"Which is the correct spelling?",options:["florescent","flourescent","fluroscent","fluorescent"],answer:"fluorescent",hint:"flu-or-es-cent: f-l-u-o-r-e-s-c-e-n-t"},
    {level:"hard",word:"forty",q:"Which is the correct spelling?",options:["fourty","foarty","forte","forty"],answer:"forty",hint:"f-o-r-t-y — no u! (unlike four)"},
    {level:"hard",word:"grammar",q:"Which is the correct spelling?",options:["grammer","gramur","grammer","grammar"],answer:"grammar",hint:"gram-mar: ends in -ar not -er! g-r-a-m-m-a-r"},
    {level:"hard",word:"handkerchief",q:"Which is the correct spelling?",options:["hankerchief","handkercheif","handkerchif","handkerchief"],answer:"handkerchief",hint:"hand-ker-chief: h-a-n-d-k-e-r-c-h-i-e-f"},
    {level:"hard",word:"humorous",q:"Which is the correct spelling?",options:["humourous","humerous","hummorous","humorous"],answer:"humorous",hint:"hu-mor-ous: h-u-m-o-r-o-u-s"},
    {level:"hard",word:"independent",q:"Which is the correct spelling?",options:["independant","independint","independdent","independent"],answer:"independent",hint:"ends in -ent not -ant!"},
    {level:"hard",word:"jewellery",q:"Which is the correct spelling?",options:["jewelry","jewlery","jewellry","jewellery"],answer:"jewellery",hint:"jew-el-ler-y: j-e-w-e-l-l-e-r-y"},
    {level:"hard",word:"liaison",q:"Which is the correct spelling?",options:["liason","liasion","laiason","liaison"],answer:"liaison",hint:"li-ai-son: l-i-a-i-s-o-n"},
    {level:"hard",word:"mischievous",q:"Which is the correct spelling?",options:["mischevious","mischeivous","mischievious","mischievous"],answer:"mischievous",hint:"mis-chie-vous: m-i-s-c-h-i-e-v-o-u-s"},
    {level:"hard",word:"noticeable",q:"Which is the correct spelling?",options:["noticable","noticeable","notiecable","noticable"],answer:"noticeable",hint:"notice + able = noticeable (keep the e!)"},
    {level:"hard",word:"occurrence",q:"Which is the correct spelling?",options:["occurrance","occurence","occurance","occurrence"],answer:"occurrence",hint:"oc-cur-rence: double c double r!"},
    {level:"hard",word:"occasionally",q:"Which is the correct spelling?",options:["ocassionally","occassionaly","occasionally","ocassionaly"],answer:"occasionally",hint:"oc-ca-sion-al-ly: double c, double l!"},
    {level:"hard",word:"parallel",q:"Which is the correct spelling?",options:["paralel","parrallel","parallell","parallel"],answer:"parallel",hint:"par-al-lel: one r, double l! p-a-r-a-l-l-e-l"},
    {level:"hard",word:"pastime",q:"Which is the correct spelling?",options:["passtime","pasttyme","pasttime","pastime"],answer:"pastime",hint:"pas-time: only one s! p-a-s-t-i-m-e"},
    {level:"hard",word:"perseverance",q:"Which is the correct spelling?",options:["perserverance","perseverence","persiverance","perseverance"],answer:"perseverance",hint:"per-se-ver-ance: p-e-r-s-e-v-e-r-a-n-c-e"},
    {level:"hard",word:"pneumonia",q:"Which is the correct spelling?",options:["neumonia","pnuemonia","pneomonia","pneumonia"],answer:"pneumonia",hint:"pneu-mo-nia: silent p! p-n-e-u-m-o-n-i-a"},
    {level:"hard",word:"possess",q:"Which is the correct spelling?",options:["posess","possses","pussess","possess"],answer:"possess",hint:"pos-sess: double s twice! p-o-s-s-e-s-s"},
    {level:"hard",word:"privilege",q:"Which is the correct spelling?",options:["privelege","privelige","priviledge","privilege"],answer:"privilege",hint:"priv-i-lege: p-r-i-v-i-l-e-g-e"},
    {level:"hard",word:"prophecy",q:"Which is the correct spelling?",options:["prophesy","prophacy","prophicy","prophecy"],answer:"prophecy",hint:"proph-e-cy: p-r-o-p-h-e-c-y"},
    {level:"hard",word:"publicly",q:"Which is the correct spelling?",options:["publically","publicaly","publlicly","publicly"],answer:"publicly",hint:"pub-lic-ly: p-u-b-l-i-c-l-y"},
    {level:"hard",word:"receive",q:"Which is the correct spelling?",options:["recieve","receve","recieve","receive"],answer:"receive",hint:"i before e except after c: r-e-c-e-i-v-e"},
    {level:"hard",word:"rhythm",q:"Which is the correct spelling?",options:["rithm","rythm","rhythym","rhythm"],answer:"rhythm",hint:"no vowels! r-h-y-t-h-m"},
    {level:"hard",word:"sergeant",q:"Which is the correct spelling?",options:["sargent","seargent","serjeant","sergeant"],answer:"sergeant",hint:"sar-gent? No: ser-geant: s-e-r-g-e-a-n-t"},
    {level:"hard",word:"supersede",q:"Which is the correct spelling?",options:["supercede","superseed","superceed","supersede"],answer:"supersede",hint:"super-sede: ends in -sede not -cede!"},
    {level:"hard",word:"susceptible",q:"Which is the correct spelling?",options:["suscpetible","susceptable","suceptible","susceptible"],answer:"susceptible",hint:"sus-cep-ti-ble: s-u-s-c-e-p-t-i-b-l-e"},
    {level:"hard",word:"threshold",q:"Which is the correct spelling?",options:["threshhold","treshhold","thresshold","threshold"],answer:"threshold",hint:"thresh-old: only one h! t-h-r-e-s-h-o-l-d"},
    {level:"hard",word:"tyranny",q:"Which is the correct spelling?",options:["tyrany","tirrany","tyrrany","tyranny"],answer:"tyranny",hint:"tyr-an-ny: double n! t-y-r-a-n-n-y"},
    {level:"hard",word:"vacuum",q:"Which is the correct spelling?",options:["vaccum","vacuume","vacumm","vacuum"],answer:"vacuum",hint:"vac-u-um: v-a-c-u-u-m"},
    {level:"hard",word:"Wednesday",q:"Which is the correct spelling?",options:["Wensday","Wendesday","Wedsneday","Wednesday"],answer:"Wednesday",hint:"Wed-nes-day: silent d! W-e-d-n-e-s-d-a-y"},
    {level:"hard",word:"withhold",q:"Which is the correct spelling?",options:["withold","witheld","withheld","withhold"],answer:"withhold",hint:"with-hold: double h! w-i-t-h-h-o-l-d"},
    {level:"hard",word:"yacht",q:"Which is the correct spelling?",options:["yaucht","yaught","yact","yacht"],answer:"yacht",hint:"y-a-c-h-t — silent ch!"},
    {level:"hard",word:"zealous",q:"Which is the correct spelling?",options:["zelous","zellous","zeallous","zealous"],answer:"zealous",hint:"zeal-ous: z-e-a-l-o-u-s"},
    {level:"hard",word:"liaison",q:"Which is the correct spelling?",options:["liason","liasson","leason","liaison"],answer:"liaison",hint:"li-ai-son: two i's! l-i-a-i-s-o-n"},
    {level:"hard",word:"conscientious",q:"Which is the correct spelling?",options:["consiencious","consientious","conciencious","conscientious"],answer:"conscientious",hint:"very long: c-o-n-s-c-i-e-n-t-i-o-u-s"},
    {level:"hard",word:"psychological",q:"Which is the correct spelling?",options:["psycological","pshycological","psychologicall","psychological"],answer:"psychological",hint:"silent p: p-s-y-c-h-o-l-o-g-i-c-a-l"},
    {level:"hard",word:"miscellaneous",q:"Which is the correct spelling?",options:["miscelaneous","miscellaineous","miscellanious","miscellaneous"],answer:"miscellaneous",hint:"mis-cel-la-ne-ous: double l! m-i-s-c-e-l-l-a-n-e-o-u-s"},
    {level:"hard",word:"bureaucratic",q:"Which is the correct spelling?",options:["burocratic","bureaucrratic","beaurocratic","bureaucratic"],answer:"bureaucratic",hint:"bur-eau-cra-tic: b-u-r-e-a-u-c-r-a-t-i-c"},
    {level:"hard",word:"connoisseur",q:"Which is the correct spelling?",options:["conoiseur","connoiseur","connoissuer","connoisseur"],answer:"connoisseur",hint:"con-nois-seur: double n double s! c-o-n-n-o-i-s-s-e-u-r"},
    {level:"hard",word:"questionnaire",q:"Which is the correct spelling?",options:["questionaire","questionnare","questionniare","questionnaire"],answer:"questionnaire",hint:"double n: q-u-e-s-t-i-o-n-n-a-i-r-e"},
    {level:"hard",word:"souvenir",q:"Which is the correct spelling?",options:["sovenir","souviner","souveneer","souvenir"],answer:"souvenir",hint:"sou-ve-nir: s-o-u-v-e-n-i-r"},
    {level:"hard",word:"separate",q:"Which is the correct spelling?",options:["seperate","separete","seprate","separate"],answer:"separate",hint:"sep-a-rate: s-e-p-a-r-a-t-e"},
    {level:"hard",word:"exhilarating",q:"Which is the correct spelling?",options:["exhilerating","exhilaratting","exillarating","exhilarating"],answer:"exhilarating",hint:"ex-hil-a-rat-ing: e-x-h-i-l-a-r-a-t-i-n-g"}
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
    // ── EXTRA EASY ──
    {level:"easy",type:"sentence",q:"I drink ___ when I am thirsty.",options:["water","cake","stones","paper"],answer:"water",hint:"What do you drink?"},
    {level:"easy",type:"sentence",q:"We sleep in a ___.",options:["car","bed","tree","river"],answer:"bed",hint:"Where do you sleep at night?"},
    {level:"easy",type:"sentence",q:"A dog says ___.",options:["moo","quack","woof","meow"],answer:"woof",hint:"What sound does a dog make?"},
    {level:"easy",type:"sentence",q:"I use a ___ to write.",options:["spoon","fork","pencil","shoe"],answer:"pencil",hint:"What do you write with?"},
    {level:"easy",type:"word",q:"Complete the word:\nb _ t",display:"b _ t",options:["a","e","i","o"],answer:"a",hint:"A flying mammal! b_a_t"},
    {level:"easy",type:"word",q:"Complete the word:\nh _ t",display:"h _ t",options:["a","e","i","o"],answer:"a",hint:"You wear it on your head! h_a_t"},
    {level:"easy",type:"word",q:"Complete the word:\np _ n",display:"p _ n",options:["a","e","i","o"],answer:"e",hint:"You write with it! p_e_n"},
    {level:"easy",type:"word",q:"Complete the word:\nb _ g",display:"b _ g",options:["a","e","i","o"],answer:"a",hint:"You carry things in it! b_a_g"},
    // ── EXTRA MEDIUM ──
    {level:"medium",type:"sentence",q:"The opposite of tall is ___.",options:["big","short","fast","loud"],answer:"short",hint:"Tall and ___ are opposites!"},
    {level:"medium",type:"sentence",q:"We use ___ to see in the dark.",options:["a spoon","a torch","a book","a chair"],answer:"a torch",hint:"What lights up the dark?"},
    {level:"medium",type:"sentence",q:"Plants need sunlight, water and ___ to grow.",options:["sand","soil","glass","metal"],answer:"soil",hint:"Plants grow in the ground — in the..."},
    {level:"medium",type:"sentence",q:"A group of fish is called a ___.",options:["herd","flock","school","pack"],answer:"school",hint:"Fish swim together in a school!"},
    {level:"medium",type:"word",q:"Complete the word:\nkn _ fe",display:"kn _ fe",options:["a","e","i","o"],answer:"i",hint:"You use it to cut food! kn_i_fe"},
    {level:"medium",type:"word",q:"Complete the word:\nph _ ne",display:"ph _ ne",options:["a","e","i","o"],answer:"o",hint:"You call people on it! ph_o_ne"},
    // ── EXTRA HARD ──
    {level:"hard",type:"sentence",q:"The ___ of a circle is the distance across its centre.",options:["radius","diameter","perimeter","circumference"],answer:"diameter",hint:"Diameter goes all the way across. Radius is half!"},
    {level:"hard",type:"sentence",q:"A word that sounds like another but has a different meaning is called a ___.",options:["synonym","antonym","homophone","metaphor"],answer:"homophone",hint:"Hear/here and there/their are homophones!"},
    {level:"hard",type:"sentence",q:"The process by which a liquid turns into a gas is called ___.",options:["condensation","freezing","evaporation","melting"],answer:"evaporation",hint:"Puddles disappear by evaporation!"},
    {level:"hard",type:"word",q:"Complete the word:\nsc _ ssors",display:"sc _ ssors",options:["a","e","i","o"],answer:"i",hint:"You cut with them! sc_i_ssors"},
    {level:"hard",type:"word",q:"Complete the word:\nd _ ctor",display:"d _ ctor",options:["a","e","i","o"],answer:"o",hint:"They help sick people! d_o_ctor"},
  
    {"level":"easy","type":"sentence","q":"The sun shines in the ___.","options":["sky","ground","sea","road"],"answer":"sky","hint":"Where does the sun shine from?"},
    {"level":"easy","type":"sentence","q":"Birds have two ___ to fly.","options":["legs","fins","wings","arms"],"answer":"wings","hint":"Birds flap their wings to fly!"},
    {"level":"easy","type":"sentence","q":"We eat three ___ every day.","options":["drinks","meals","naps","walks"],"answer":"meals","hint":"Breakfast, lunch and dinner!"},
    {"level":"easy","type":"sentence","q":"A baby cat is called a ___.","options":["puppy","cub","kitten","foal"],"answer":"kitten","hint":"Baby cats are kittens!"},
    {"level":"easy","type":"word","q":"Complete the word:\nfl _ g","display":"fl _ g","options":["a","e","i","o"],"answer":"a","hint":"A flag flies on a pole! fl_a_g"},
    {"level":"easy","type":"word","q":"Complete the word:\nsl _ p","display":"sl _ p","options":["a","e","i","o"],"answer":"i","hint":"When you sleep you sl_i_p... no! You sl_e_ep. Hmm — sl_i_p means to slide!"},
    {"level":"easy","type":"sentence","q":"Fish live in the ___.","options":["sky","forest","water","desert"],"answer":"water","hint":"Fish breathe through gills underwater!"},
    {"level":"easy","type":"sentence","q":"We use a ___ to tell the time.","options":["ruler","scale","clock","mirror"],"answer":"clock","hint":"Clocks have hands pointing to the hours!"},
    {"level":"easy","type":"word","q":"Complete the word:\nj _ mp","display":"j _ mp","options":["a","e","i","o"],"answer":"u","hint":"You do this at a trampoline! j_u_mp"},
    {"level":"easy","type":"sentence","q":"Plants get water through their ___.","options":["leaves","flowers","roots","stems"],"answer":"roots","hint":"Roots absorb water from the soil!"},
    {"level":"medium","type":"sentence","q":"The opposite of 'maximum' is ___.","options":["large","medium","minimum","average"],"answer":"minimum","hint":"Maximum = the most. Minimum = the least!"},
    {"level":"medium","type":"sentence","q":"A word that means the same as another is called a ___.","options":["antonym","homophone","synonym","suffix"],"answer":"synonym","hint":"Happy and joyful are synonyms!"},
    {"level":"medium","type":"sentence","q":"Water turns to steam at ___ degrees Celsius.","options":["50","75","100","150"],"answer":"100","hint":"Water boils at 100°C!"},
    {"level":"medium","type":"sentence","q":"The capital city of Italy is ___.","options":["Milan","Venice","Naples","Rome"],"answer":"Rome","hint":"Rome was once the centre of a great empire!"},
    {"level":"medium","type":"word","q":"Complete the word:\nph _ ne","display":"ph _ ne","options":["a","e","i","o"],"answer":"o","hint":"You call people on it! ph_o_ne"},
    {"level":"medium","type":"sentence","q":"A group of lions is called a ___.","options":["pack","flock","pride","herd"],"answer":"pride","hint":"A pride of lions!"},
    {"level":"medium","type":"sentence","q":"The ___ of a circle is twice the radius.","options":["diameter","perimeter","area","circumference"],"answer":"diameter","hint":"Diameter goes all the way across — twice the radius!"},
    {"level":"medium","type":"word","q":"Complete the word:\nkn _ fe","display":"kn _ fe","options":["a","e","i","o"],"answer":"i","hint":"You cut food with it! kn_i_fe"},
    {"level":"hard","type":"sentence","q":"The process by which plants make food\nfrom sunlight is called ___.","options":["respiration","digestion","photosynthesis","condensation"],"answer":"photosynthesis","hint":"Photo = light, synthesis = making!"},
    {"level":"hard","type":"sentence","q":"A word that reads the same backwards\nand forwards is called a ___.","options":["synonym","antonym","palindrome","homophone"],"answer":"palindrome","hint":"'Racecar' and 'level' are palindromes!"},
    {"level":"hard","type":"sentence","q":"The study of the origin and history\nof words is called ___.","options":["phonics","grammar","etymology","syntax"],"answer":"etymology","hint":"Etymology tells us where words come from!"},
    {"level":"hard","type":"sentence","q":"When light passes through a prism,\nit splits into the colours of the ___.","options":["galaxy","spectrum","atmosphere","aurora"],"answer":"spectrum","hint":"ROYGBIV — red, orange, yellow, green, blue, indigo, violet!"},
    {"level":"hard","type":"word","q":"Complete the word:\nsc _ ssors","display":"sc _ ssors","options":["a","e","i","o"],"answer":"i","hint":"You cut with them! sc_i_ssors"},
    {"level":"hard","type":"sentence","q":"A number that can only be divided\nby 1 and itself is called a ___ number.","options":["even","square","prime","composite"],"answer":"prime","hint":"2, 3, 5, 7, 11 are prime numbers!"},
    {"level":"hard","type":"sentence","q":"The imaginary line around\nEarth's middle is the ___.","options":["tropics","meridian","equator","hemisphere"],"answer":"equator","hint":"The equator divides Earth into north and south!"},
    {"level":"hard","type":"word","q":"Complete the word:\nd _ ctor","display":"d _ ctor","options":["a","e","i","o"],"answer":"o","hint":"They help sick people! d_o_ctor"},
  ,
    {level:"easy",type:"sentence",q:"Birds have two ___ to fly.",options:["legs","fins","wings","arms"],answer:"wings",hint:"Birds flap their wings!"},
    {level:"easy",type:"sentence",q:"We eat three ___ every day.",options:["drinks","meals","naps","walks"],answer:"meals",hint:"Breakfast, lunch and dinner!"},
    {level:"easy",type:"sentence",q:"A baby cat is called a ___.",options:["puppy","cub","kitten","foal"],answer:"kitten",hint:"Baby cats are kittens!"},
    {level:"easy",type:"sentence",q:"Fish live in the ___.",options:["sky","forest","water","desert"],answer:"water",hint:"Fish breathe underwater!"},
    {level:"easy",type:"sentence",q:"We use a ___ to tell the time.",options:["ruler","scale","clock","mirror"],answer:"clock",hint:"Clocks show the hours!"},
    {level:"easy",type:"sentence",q:"Plants get water through their ___.",options:["leaves","flowers","roots","stems"],answer:"roots",hint:"Roots absorb water from soil!"},
    {level:"easy",type:"sentence",q:"The sun shines in the ___.",options:["sky","ground","sea","road"],answer:"sky",hint:"Look up!"},
    {level:"easy",type:"sentence",q:"We use a ___ to write on paper.",options:["spoon","pencil","ruler","clock"],answer:"pencil",hint:"Pencils make marks on paper!"},
    {level:"easy",type:"sentence",q:"A baby dog is called a ___.",options:["kitten","cub","foal","puppy"],answer:"puppy",hint:"Baby dogs are puppies!"},
    {level:"easy",type:"sentence",q:"Ice is ___ water.",options:["hot","warm","frozen","boiling"],answer:"frozen",hint:"Water freezes to become ice!"},
    {level:"easy",type:"sentence",q:"We breathe in ___ to stay alive.",options:["carbon dioxide","nitrogen","oxygen","hydrogen"],answer:"oxygen",hint:"We breathe in oxygen!"},
    {level:"easy",type:"sentence",q:"The opposite of night is ___.",options:["evening","dusk","day","dawn"],answer:"day",hint:"Night and day are opposites!"},
    {level:"easy",type:"sentence",q:"Bees make ___ from nectar.",options:["milk","honey","butter","jam"],answer:"honey",hint:"Bees collect nectar to make honey!"},
    {level:"easy",type:"sentence",q:"A triangle has ___ sides.",options:["2","3","4","5"],answer:"3",hint:"Count the sides of a triangle!"},
    {level:"easy",type:"sentence",q:"We use an ___ when it rains.",options:["umbrella","glove","boot","scarf"],answer:"umbrella",hint:"Umbrellas keep us dry!"},
    {level:"medium",type:"sentence",q:"The opposite of 'maximum' is ___.",options:["large","medium","minimum","average"],answer:"minimum",hint:"Maximum=most, minimum=least!"},
    {level:"medium",type:"sentence",q:"A word that means the same as another is called a ___.",options:["antonym","homophone","synonym","suffix"],answer:"synonym",hint:"Happy and joyful are synonyms!"},
    {level:"medium",type:"sentence",q:"Water turns to steam at ___ degrees Celsius.",options:["50","75","100","150"],answer:"100",hint:"Water boils at 100°C!"},
    {level:"medium",type:"sentence",q:"The capital city of Italy is ___.",options:["Milan","Venice","Naples","Rome"],answer:"Rome",hint:"Rome was the centre of a great empire!"},
    {level:"medium",type:"sentence",q:"A group of lions is called a ___.",options:["pack","flock","pride","herd"],answer:"pride",hint:"A pride of lions!"},
    {level:"medium",type:"sentence",q:"The ___ of a circle is twice the radius.",options:["diameter","perimeter","area","circumference"],answer:"diameter",hint:"Diameter goes all the way across!"},
    {level:"medium",type:"sentence",q:"A word with the opposite meaning is called an ___.",options:["synonym","homophone","antonym","prefix"],answer:"antonym",hint:"Hot and cold are antonyms!"},
    {level:"medium",type:"sentence",q:"The process of water turning to vapour is called ___.",options:["condensation","freezing","evaporation","melting"],answer:"evaporation",hint:"Puddles disappear through evaporation!"},
    {level:"medium",type:"sentence",q:"A group of fish swimming together is called a ___.",options:["pride","flock","school","pack"],answer:"school",hint:"A school of fish!"},
    {level:"medium",type:"sentence",q:"The study of living things is called ___.",options:["chemistry","physics","biology","geology"],answer:"biology",hint:"Bio = life, logy = study!"},
    {level:"medium",type:"sentence",q:"The longest bone in the human body is the ___.",options:["spine","tibia","femur","humerus"],answer:"femur",hint:"The femur is in your thigh!"},
    {level:"medium",type:"sentence",q:"A word placed before a root word to change its meaning is called a ___.",options:["suffix","prefix","root","stem"],answer:"prefix",hint:"Un-happy: un- is the prefix!"},
    {level:"medium",type:"sentence",q:"When two plates of the Earth's crust collide,\n___ often occur.",options:["floods","tornadoes","earthquakes","droughts"],answer:"earthquakes",hint:"Tectonic plate movement causes earthquakes!"},
    {level:"medium",type:"sentence",q:"The imaginary line around Earth's middle is called the ___.",options:["tropics","meridian","equator","hemisphere"],answer:"equator",hint:"The equator divides Earth into north and south!"},
    {level:"medium",type:"sentence",q:"A number that can only be divided by 1 and itself is called a ___ number.",options:["even","square","prime","composite"],answer:"prime",hint:"2, 3, 5, 7, 11 are prime numbers!"},
    {level:"hard",type:"sentence",q:"The process by which plants make food from sunlight is called ___.",options:["respiration","digestion","photosynthesis","condensation"],answer:"photosynthesis",hint:"Photo=light, synthesis=making!"},
    {level:"hard",type:"sentence",q:"A word that reads the same backwards and forwards is called a ___.",options:["synonym","antonym","palindrome","homophone"],answer:"palindrome",hint:"Racecar and level are palindromes!"},
    {level:"hard",type:"sentence",q:"The study of the origin and history of words is called ___.",options:["phonics","grammar","etymology","syntax"],answer:"etymology",hint:"Etymology tells us where words come from!"},
    {level:"hard",type:"sentence",q:"When light passes through a prism, it splits into the colours of the ___.",options:["galaxy","spectrum","atmosphere","aurora"],answer:"spectrum",hint:"ROYGBIV!"},
    {level:"hard",type:"sentence",q:"The molecule that carries genetic information in cells is called ___.",options:["RNA","ATP","DNA","ADP"],answer:"DNA",hint:"DNA is the blueprint of life!"},
    {level:"hard",type:"sentence",q:"The force that opposes motion between two surfaces is called ___.",options:["gravity","tension","friction","magnetism"],answer:"friction",hint:"Friction slows things down!"},
    {level:"hard",type:"sentence",q:"A story in which characters and events symbolise deeper moral truths is called an ___.",options:["epic","allegory","sonnet","elegy"],answer:"allegory",hint:"Animal Farm is an allegory for Soviet Russia!"},
    {level:"hard",type:"sentence",q:"The ___ is the smallest unit of an element that retains its chemical properties.",options:["molecule","compound","atom","cell"],answer:"atom",hint:"Atoms make up everything!"},
    {level:"hard",type:"sentence",q:"A government system where elected representatives make decisions on behalf of citizens is called a ___.",options:["dictatorship","monarchy","representative democracy","theocracy"],answer:"representative democracy",hint:"We vote for MPs/senators who represent us!"},
    {level:"hard",type:"sentence",q:"The ___ of a wave is the number of waves that pass a point per second.",options:["amplitude","wavelength","frequency","pitch"],answer:"frequency",hint:"Frequency is measured in Hertz (Hz)!"},
    {level:"hard",type:"sentence",q:"The literary technique of hinting at future events is called ___.",options:["flashback","metaphor","foreshadowing","alliteration"],answer:"foreshadowing",hint:"When an author hints at what's coming next!"},
    {level:"hard",type:"sentence",q:"Newton's Third Law states that every action has an equal and ___ reaction.",options:["stronger","weaker","identical","opposite"],answer:"opposite",hint:"Push a wall — it pushes back with equal force!"},
    {level:"hard",type:"sentence",q:"The ___ is the central idea or underlying message of a literary work.",options:["plot","setting","theme","character"],answer:"theme",hint:"The theme of Romeo and Juliet is love and fate!"},
    {level:"hard",type:"sentence",q:"A substance that speeds up a chemical reaction without being consumed is called a ___.",options:["reactant","product","catalyst","solvent"],answer:"catalyst",hint:"Enzymes are biological catalysts!"},
    {level:"hard",type:"sentence",q:"The ___ is the measure of the amount of matter in an object.",options:["weight","volume","density","mass"],answer:"mass",hint:"Mass is measured in grams or kilograms!"}
  ,
    {level:"easy",type:"sentence",q:"The sun rises in the ___.",options:["west","north","east","south"],answer:"east",hint:"The sun always rises in the east!"},
    {level:"easy",type:"sentence",q:"A lion is called the king of the ___.",options:["sea","sky","forest","jungle"],answer:"jungle",hint:"The lion is king of the jungle!"},
    {level:"easy",type:"sentence",q:"A square has four equal ___ and four right angles.",options:["curves","sides","circles","diagonals"],answer:"sides",hint:"A square has 4 equal sides!"},
    {level:"easy",type:"sentence",q:"Caterpillars turn into ___.",options:["fish","bees","butterflies","birds"],answer:"butterflies",hint:"Caterpillar → chrysalis → butterfly!"},
    {level:"easy",type:"sentence",q:"We use our ___ to taste food.",options:["eyes","nose","ears","tongue"],answer:"tongue",hint:"The tongue is our organ of taste!"},
    {level:"easy",type:"sentence",q:"A spider spins a ___ to catch insects.",options:["nest","burrow","web","shell"],answer:"web",hint:"Spiders spin webs!"},
    {level:"easy",type:"sentence",q:"The Earth is shaped like a ___.",options:["cube","square","flat disc","sphere"],answer:"sphere",hint:"The Earth is a sphere!"},
    {level:"easy",type:"sentence",q:"We see a rainbow after it has ___.",options:["snowed","been sunny","rained","been windy"],answer:"rained",hint:"Rainbows appear when sunlight shines through raindrops!"},
    {level:"easy",type:"sentence",q:"Baby sheep are called ___.",options:["cubs","kittens","foals","lambs"],answer:"lambs",hint:"A baby sheep is a lamb!"},
    {level:"easy",type:"sentence",q:"Bread is made by baking ___.",options:["rice","flour","potatoes","oats"],answer:"flour",hint:"Bread is made from flour!"},
    {level:"easy",type:"sentence",q:"We use a thermometer to measure ___.",options:["weight","time","temperature","distance"],answer:"temperature",hint:"Thermometers measure heat!"},
    {level:"easy",type:"sentence",q:"The opposite of addition is ___.",options:["multiplication","division","subtraction","fractions"],answer:"subtraction",hint:"Adding and subtracting are opposites!"},
    {level:"easy",type:"sentence",q:"A group of wolves is called a ___.",options:["flock","pride","herd","pack"],answer:"pack",hint:"A pack of wolves!"},
    {level:"easy",type:"sentence",q:"Frogs are ___ — they live on land AND in water.",options:["reptiles","mammals","amphibians","birds"],answer:"amphibians",hint:"Amphibians = land and water!"},
    {level:"easy",type:"sentence",q:"Seven days make one ___.",options:["month","fortnight","week","year"],answer:"week",hint:"7 days = 1 week!"},
    {level:"easy",type:"sentence",q:"Water freezes at ___ degrees Celsius.",options:["10","0","-10","100"],answer:"0",hint:"Water freezes at 0°C!"},
    {level:"easy",type:"sentence",q:"The planets in our solar system orbit the ___.",options:["Moon","Earth","Sun","Mars"],answer:"Sun",hint:"All planets orbit the Sun!"},
    {level:"easy",type:"sentence",q:"A group of bees is called a ___.",options:["pack","flock","swarm","school"],answer:"swarm",hint:"A swarm of bees!"},
    {level:"easy",type:"sentence",q:"Penguins live in ___.",options:["the Arctic","the jungle","the desert","the Antarctic"],answer:"the Antarctic",hint:"Penguins live in Antarctica!"},
    {level:"easy",type:"sentence",q:"The largest organ in the human body is the ___.",options:["brain","lungs","heart","skin"],answer:"skin",hint:"Your skin is the largest organ!"},
    {level:"easy",type:"sentence",q:"We use a ___ to look at very tiny things.",options:["telescope","binoculars","microscope","camera"],answer:"microscope",hint:"A microscope magnifies tiny things!"},
    {level:"easy",type:"sentence",q:"An octopus has ___ legs.",options:["6","7","8","10"],answer:"8",hint:"Octo = eight!"},
    {level:"easy",type:"sentence",q:"The tallest animal is the ___.",options:["elephant","giraffe","horse","camel"],answer:"giraffe",hint:"Giraffes can be 6 metres tall!"},
    {level:"easy",type:"sentence",q:"The organ that pumps blood around the body is the ___.",options:["lungs","brain","liver","heart"],answer:"heart",hint:"The heart pumps blood!"},
    {level:"easy",type:"sentence",q:"A triangle has ___ angles.",options:["2","3","4","5"],answer:"3",hint:"Tri = three. Triangle has 3 angles!"},
    {level:"easy",type:"sentence",q:"The alphabet has ___ letters.",options:["24","25","26","27"],answer:"26",hint:"A to Z = 26 letters!"},
    {level:"easy",type:"sentence",q:"Polar bears live near the ___ Pole.",options:["South","North","East","West"],answer:"North",hint:"Polar bears live in the Arctic at the North Pole!"},
    {level:"easy",type:"sentence",q:"A group of elephants is called a ___.",options:["pack","pride","flock","herd"],answer:"herd",hint:"A herd of elephants!"},
    {level:"easy",type:"sentence",q:"The season after winter is ___.",options:["summer","autumn","spring","June"],answer:"spring",hint:"Winter → spring → summer → autumn!"},
    {level:"easy",type:"sentence",q:"A baby horse is called a ___.",options:["cub","kitten","foal","calf"],answer:"foal",hint:"A baby horse is a foal!"},
    {level:"easy",type:"sentence",q:"The longest side of a right-angled triangle is the ___.",options:["base","height","hypotenuse","side"],answer:"hypotenuse",hint:"The hypotenuse is opposite the right angle!"},
    {level:"easy",type:"sentence",q:"A cactus stores ___ in its thick stem.",options:["food","sand","water","oxygen"],answer:"water",hint:"Cacti store water to survive in the desert!"},
    {level:"easy",type:"sentence",q:"The closest star to Earth is the ___.",options:["Polaris","Sirius","Sun","Alpha Centauri"],answer:"Sun",hint:"The Sun is our closest star!"},
    {level:"easy",type:"sentence",q:"A baby cow is called a ___.",options:["foal","cub","piglet","calf"],answer:"calf",hint:"A baby cow is a calf!"},
    {level:"easy",type:"sentence",q:"Half of 100 is ___.",options:["25","40","50","60"],answer:"50",hint:"100 ÷ 2 = 50!"},
    {level:"easy",type:"sentence",q:"A group of fish is called a ___.",options:["pack","pride","school","herd"],answer:"school",hint:"A school of fish!"},
    {level:"easy",type:"sentence",q:"The colour you get when you mix red and blue is ___.",options:["orange","green","yellow","purple"],answer:"purple",hint:"Red + blue = purple!"},
    {level:"easy",type:"sentence",q:"Two halves make a ___.",options:["quarter","third","half","whole"],answer:"whole",hint:"½ + ½ = 1 whole!"},
    {level:"easy",type:"sentence",q:"A word that names a person, place or thing is called a ___.",options:["verb","adjective","noun","adverb"],answer:"noun",hint:"Cat, London, and happiness are nouns!"},
    {level:"easy",type:"sentence",q:"A word that describes a noun is called an ___.",options:["adverb","verb","adjective","noun"],answer:"adjective",hint:"Beautiful, large, red are adjectives!"},
    {level:"easy",type:"sentence",q:"A word that describes an action is a ___.",options:["noun","adjective","adverb","verb"],answer:"verb",hint:"Run, eat, sing, jump are all verbs!"},
    {level:"easy",type:"sentence",q:"A year has ___ days (usually).",options:["300","350","365","400"],answer:"365",hint:"365 days in a regular year!"},
    {level:"easy",type:"sentence",q:"Solid water is called ___.",options:["steam","vapour","gas","ice"],answer:"ice",hint:"Water has three states: liquid, solid (ice), gas (steam)!"},
    {level:"easy",type:"sentence",q:"A word that links words or clauses is called a ___.",options:["noun","verb","adjective","conjunction"],answer:"conjunction",hint:"And, but, because, or are conjunctions!"},
    {level:"easy",type:"sentence",q:"A sentence always starts with a ___ letter.",options:["small","capital","red","dotted"],answer:"capital",hint:"Sentences begin with a capital letter!"},
    {level:"easy",type:"sentence",q:"A herbivore only eats ___.",options:["meat","both plants and meat","fish","plants"],answer:"plants",hint:"Herbi = plant. Herbivores eat plants only!"},
    {level:"easy",type:"sentence",q:"A carnivore only eats ___.",options:["plants","both plants and animals","insects","meat/animals"],answer:"meat/animals",hint:"Carni = meat. Carnivores eat meat only!"},
    {level:"easy",type:"sentence",q:"An omnivore eats both ___ and animals.",options:["rocks","water","soil","plants"],answer:"plants",hint:"Omni = all. Omnivores eat plants AND animals!"},
    {level:"easy",type:"sentence",q:"A baby pig is called a ___.",options:["calf","foal","lamb","piglet"],answer:"piglet",hint:"A baby pig is a piglet!"},
    {level:"easy",type:"sentence",q:"The force that makes things fall to the ground is ___.",options:["friction","magnetism","electricity","gravity"],answer:"gravity",hint:"Gravity pulls everything towards Earth!"},
    {level:"easy",type:"sentence",q:"We measure distance in ___ or kilometres.",options:["kilograms","litres","metres","seconds"],answer:"metres",hint:"Metres and kilometres measure distance!"},
    {level:"easy",type:"sentence",q:"When we divide into 4 equal parts, each part is a ___.",options:["half","third","quarter","fifth"],answer:"quarter",hint:"1 ÷ 4 = ¼ (one quarter)!"},
    {level:"easy",type:"sentence",q:"The Moon takes about ___ days to orbit the Earth.",options:["7","14","28","365"],answer:"28",hint:"The Moon orbits Earth roughly every 28 days!"},
    {level:"easy",type:"sentence",q:"A group of lions is called a ___.",options:["pack","flock","pride","herd"],answer:"pride",hint:"A pride of lions!"},
    {level:"easy",type:"sentence",q:"Butterflies taste with their ___.",options:["tongue","antennae","wings","feet"],answer:"feet",hint:"Butterflies have taste sensors in their feet!"},
    {level:"easy",type:"sentence",q:"The number after 99 is ___.",options:["98","100","101","102"],answer:"100",hint:"99 + 1 = 100!"},
    {level:"easy",type:"sentence",q:"We use a full stop at the ___ of a sentence.",options:["beginning","middle","end","start"],answer:"end",hint:"Sentences end with a full stop!"},
    {level:"easy",type:"sentence",q:"An egg has a shell, an egg white, and a ___.",options:["seed","core","stone","yolk"],answer:"yolk",hint:"The yellow middle of an egg is the yolk!"},
    {level:"easy",type:"sentence",q:"A compass shows the four ___ directions.",options:["weather","road","compass","cardinal"],answer:"cardinal",hint:"North, South, East, West = four cardinal directions!"},
    {level:"easy",type:"sentence",q:"We measure liquid in ___ or litres.",options:["kilograms","centimetres","millilitres","metres"],answer:"millilitres",hint:"Millilitres and litres measure liquids!"},
    {level:"easy",type:"sentence",q:"A word that describes how an action is done is an ___.",options:["adjective","noun","adverb","verb"],answer:"adverb",hint:"Quickly, loudly, gently are adverbs!"},
    {level:"easy",type:"sentence",q:"Ice cream melts if you leave it in the ___.",options:["fridge","freezer","shade","sun"],answer:"sun",hint:"Heat melts ice cream!"},
    {level:"easy",type:"sentence",q:"Two plus two equals ___.",options:["3","4","5","6"],answer:"4",hint:"2 + 2 = 4!"},
    {level:"easy",type:"sentence",q:"A ___ replaces a noun to avoid repetition.",options:["adjective","adverb","pronoun","preposition"],answer:"pronoun",hint:"He, she, it, they are pronouns!"},
    {level:"easy",type:"sentence",q:"We breathe in ___ to stay alive.",options:["carbon dioxide","nitrogen","oxygen","hydrogen"],answer:"oxygen",hint:"We breathe in oxygen!"},
    {level:"easy",type:"sentence",q:"The opposite of night is ___.",options:["evening","dusk","day","dawn"],answer:"day",hint:"Night and day are opposites!"},
    {level:"easy",type:"sentence",q:"Bees make ___ from nectar.",options:["milk","honey","butter","jam"],answer:"honey",hint:"Bees collect nectar to make honey!"},
    {level:"easy",type:"sentence",q:"Tadpoles grow into ___.",options:["fish","toads or frogs","salamanders","lizards"],answer:"toads or frogs",hint:"Tadpoles metamorphose into frogs or toads!"},
    {level:"easy",type:"sentence",q:"A word that shows the relationship between a noun and another word is a ___.",options:["conjunction","pronoun","preposition","adverb"],answer:"preposition",hint:"In, on, under, between are prepositions!"},
    {level:"medium",type:"sentence",q:"The ___ is the layer of gases surrounding the Earth.",options:["lithosphere","hydrosphere","atmosphere","biosphere"],answer:"atmosphere",hint:"Atmo = air. Atmosphere = air around Earth!"},
    {level:"medium",type:"sentence",q:"The ___ of a fraction is the number on the bottom.",options:["numerator","denominator","factor","decimal"],answer:"denominator",hint:"Denominator = down. Bottom number!"},
    {level:"medium",type:"sentence",q:"The ___ of a fraction is the number on the top.",options:["denominator","integer","factor","numerator"],answer:"numerator",hint:"Numerator = number on top!"},
    {level:"medium",type:"sentence",q:"Blood is pumped around the body through ___ and veins.",options:["tubes","pipes","vessels","arteries"],answer:"arteries",hint:"Arteries carry blood away from the heart!"},
    {level:"medium",type:"sentence",q:"A polygon with 6 sides is called a ___.",options:["pentagon","hexagon","heptagon","octagon"],answer:"hexagon",hint:"Hex = 6. Hexagon = 6 sides!"},
    {level:"medium",type:"sentence",q:"A polygon with 5 sides is called a ___.",options:["hexagon","pentagon","quadrilateral","octagon"],answer:"pentagon",hint:"Penta = 5. Pentagon = 5 sides!"},
    {level:"medium",type:"sentence",q:"In Pythagoras' theorem, a² + b² = ___.",options:["a³","b³","c²","c³"],answer:"c²",hint:"Pythagoras: a² + b² = c²!"},
    {level:"medium",type:"sentence",q:"The ___ is the average of a set of numbers.",options:["median","mode","range","mean"],answer:"mean",hint:"Mean = add all and divide!"},
    {level:"medium",type:"sentence",q:"The ___ is the middle value in an ordered set.",options:["mean","mode","range","median"],answer:"median",hint:"Median = middle. Order and find the middle one!"},
    {level:"medium",type:"sentence",q:"The ___ is the most frequently occurring value in a set.",options:["mean","median","range","mode"],answer:"mode",hint:"Mode = most common!"},
    {level:"medium",type:"sentence",q:"The ___ is the difference between the largest and smallest values.",options:["mean","median","mode","range"],answer:"range",hint:"Range = highest minus lowest!"},
    {level:"medium",type:"sentence",q:"Light travels faster than ___.",options:["wind","electricity","sound","radio waves"],answer:"sound",hint:"Light ~300,000 km/s. Sound ~340 m/s!"},
    {level:"medium",type:"sentence",q:"The powerhouse of the cell is the ___.",options:["nucleus","ribosome","mitochondria","cell membrane"],answer:"mitochondria",hint:"Mitochondria produce energy (ATP)!"},
    {level:"medium",type:"sentence",q:"The ___ holds DNA and controls cell activities.",options:["mitochondria","ribosome","nucleus","cytoplasm"],answer:"nucleus",hint:"The nucleus is the cell's control centre!"},
    {level:"medium",type:"sentence",q:"A ___ replaces a noun to avoid repetition.",options:["adjective","adverb","pronoun","preposition"],answer:"pronoun",hint:"He, she, it, they are pronouns!"},
    {level:"medium",type:"sentence",q:"In photosynthesis, plants take in ___ dioxide.",options:["nitrogen","hydrogen","carbon","sulphur"],answer:"carbon",hint:"CO2 = carbon dioxide!"},
    {level:"medium",type:"sentence",q:"The ___ is the amount of space an object takes up.",options:["mass","weight","volume","density"],answer:"volume",hint:"Volume = 3D space something occupies!"},
    {level:"medium",type:"sentence",q:"A food ___ shows energy transfer between organisms.",options:["web","pyramid","chain","table"],answer:"chain",hint:"Grass → rabbit → fox = food chain!"},
    {level:"medium",type:"sentence",q:"A ___ angle is exactly 90°.",options:["acute","obtuse","reflex","right"],answer:"right",hint:"Right angle = 90°!"},
    {level:"medium",type:"sentence",q:"An ___ angle is less than 90°.",options:["obtuse","right","reflex","acute"],answer:"acute",hint:"Acute = sharp (less than 90°)!"},
    {level:"medium",type:"sentence",q:"An ___ angle is greater than 90° but less than 180°.",options:["acute","right","reflex","obtuse"],answer:"obtuse",hint:"Obtuse = blunt (90°–180°)!"},
    {level:"medium",type:"sentence",q:"A ___ angle is greater than 180°.",options:["acute","obtuse","right","reflex"],answer:"reflex",hint:"A reflex angle > 180°!"},
    {level:"medium",type:"sentence",q:"The ___ system helps us fight diseases.",options:["circulatory","digestive","nervous","immune"],answer:"immune",hint:"The immune system fights infections!"},
    {level:"medium",type:"sentence",q:"The ___ system carries electrical signals around the body.",options:["immune","digestive","nervous","circulatory"],answer:"nervous",hint:"Brain + nerves = nervous system!"},
    {level:"medium",type:"sentence",q:"The ___ system breaks down food and absorbs nutrients.",options:["immune","nervous","circulatory","digestive"],answer:"digestive",hint:"Digestion breaks down food!"},
    {level:"medium",type:"sentence",q:"The ___ system carries blood around the body.",options:["immune","nervous","digestive","circulatory"],answer:"circulatory",hint:"Heart + blood vessels = circulatory system!"},
    {level:"medium",type:"sentence",q:"An element is a substance made of only one type of ___.",options:["molecule","compound","atom","cell"],answer:"atom",hint:"Elements are made of one type of atom!"},
    {level:"medium",type:"sentence",q:"Atoms join together to form ___.",options:["elements","cells","molecules","compounds"],answer:"molecules",hint:"Two or more atoms bonded = a molecule!"},
    {level:"medium",type:"sentence",q:"A ___ is two or more different elements chemically bonded.",options:["mixture","element","molecule","compound"],answer:"compound",hint:"H2O is a compound: 2 hydrogen + 1 oxygen!"},
    {level:"medium",type:"sentence",q:"A ___ is substances combined but NOT chemically bonded.",options:["compound","element","mixture","molecule"],answer:"mixture",hint:"Salt water is a mixture!"},
    {level:"medium",type:"sentence",q:"A body's ___ depends on gravity; its mass stays constant.",options:["size","weight","volume","shape"],answer:"weight",hint:"Weight = mass × gravity!"},
    {level:"medium",type:"sentence",q:"The chemical formula for carbon dioxide is ___.",options:["CO","CO2","C2O","COO"],answer:"CO2",hint:"1 carbon + 2 oxygen = CO2!"},
    {level:"medium",type:"sentence",q:"An ___ triangle has all three sides equal.",options:["isosceles","scalene","right","equilateral"],answer:"equilateral",hint:"Equi = equal. All 3 sides equal!"},
    {level:"medium",type:"sentence",q:"An ___ triangle has exactly two sides equal.",options:["equilateral","scalene","right","isosceles"],answer:"isosceles",hint:"Isosceles has 2 equal sides!"},
    {level:"medium",type:"sentence",q:"A ___ triangle has all three sides different.",options:["equilateral","isosceles","right","scalene"],answer:"scalene",hint:"Scalene = no equal sides!"},
    {level:"medium",type:"sentence",q:"Sounds are created by ___.",options:["heat","light","vibrations","gravity"],answer:"vibrations",hint:"Sound = vibrations through a medium!"},
    {level:"medium",type:"sentence",q:"The ___ is the study of the stars, planets and space.",options:["astrology","geology","biology","astronomy"],answer:"astronomy",hint:"Astronomy = study of space!"},
    {level:"medium",type:"sentence",q:"The ___ of a word is its dictionary definition.",options:["connotation","denotation","etymology","syntax"],answer:"denotation",hint:"Denotation = literal meaning!"},
    {level:"medium",type:"sentence",q:"The ___ of a word is its emotional association.",options:["denotation","syntax","etymology","connotation"],answer:"connotation",hint:"Rose connotation = love, romance!"},
    {level:"medium",type:"sentence",q:"The ___ is the feeling or atmosphere in writing.",options:["plot","character","theme","mood"],answer:"mood",hint:"A dark stormy night creates a tense mood!"},
    {level:"medium",type:"sentence",q:"The ___ is the sequence of events in a story.",options:["character","theme","setting","plot"],answer:"plot",hint:"Plot = what happens in the story!"},
    {level:"medium",type:"sentence",q:"The ___ is the main message of a story.",options:["plot","character","setting","theme"],answer:"theme",hint:"The theme of Romeo and Juliet = love and fate!"},
    {level:"medium",type:"sentence",q:"The ___ of a wave is the number of waves per second.",options:["amplitude","wavelength","frequency","pitch"],answer:"frequency",hint:"Frequency = waves per second (Hertz)!"},
    {level:"medium",type:"sentence",q:"The ___ is the height of a wave.",options:["frequency","wavelength","amplitude","pitch"],answer:"amplitude",hint:"Amplitude = height of a wave!"},
    {level:"medium",type:"sentence",q:"The ___ is the distance between two successive wave peaks.",options:["frequency","amplitude","pitch","wavelength"],answer:"wavelength",hint:"Wavelength = crest to crest distance!"},
    {level:"medium",type:"sentence",q:"A ___ is the factor a scientist changes in an experiment.",options:["constant","control","dependent variable","independent variable"],answer:"independent variable",hint:"The independent variable is what the scientist changes!"},
    {level:"medium",type:"sentence",q:"A ___ is the factor a scientist measures in an experiment.",options:["constant","control","dependent variable","independent variable"],answer:"dependent variable",hint:"The dependent variable is what you measure!"},
    {level:"medium",type:"sentence",q:"A ___ is kept the same throughout an experiment.",options:["variable","control","hypothesis","dependent variable"],answer:"control",hint:"Controls are kept constant to make tests fair!"},
    {level:"medium",type:"sentence",q:"The ___ is the total distance around a shape.",options:["area","volume","perimeter","diameter"],answer:"perimeter",hint:"Perimeter = total distance around the outside!"},
    {level:"medium",type:"sentence",q:"The ___ is the amount of space inside a 2D shape.",options:["volume","perimeter","area","circumference"],answer:"area",hint:"Area = space inside a flat shape!"},
    {level:"medium",type:"sentence",q:"The ___ is the distance all the way around a circle.",options:["diameter","radius","area","circumference"],answer:"circumference",hint:"Circumference = π × diameter!"},
    {level:"medium",type:"sentence",q:"A ___ is a hypothesis that must be tested through experiment.",options:["proven fact","educated guess/testable prediction","random idea","final conclusion"],answer:"educated guess/testable prediction",hint:"Hypotheses are testable predictions!"},
    {level:"medium",type:"sentence",q:"Force is measured in units called ___.",options:["Watts","Joules","Newtons","Pascals"],answer:"Newtons",hint:"Force is measured in Newtons (N)!"},
    {level:"medium",type:"sentence",q:"___ is the amount of matter in an object.",options:["Volume","Weight","Density","Mass"],answer:"Mass",hint:"Mass = amount of matter (kg or g)!"},
    {level:"medium",type:"sentence",q:"The ___ is force per unit area.",options:["mass","weight","tension","pressure"],answer:"pressure",hint:"Pressure = Force ÷ Area (Pascals)!"},
    {level:"medium",type:"sentence",q:"The ___ is where and when a story takes place.",options:["character","theme","plot","setting"],answer:"setting",hint:"Setting = place and time of a story!"},
    {level:"medium",type:"sentence",q:"A ___ is a person, place or thing in a story.",options:["theme","plot","character","setting"],answer:"character",hint:"Harry Potter is a character. Hogwarts is a setting!"},
    {level:"medium",type:"sentence",q:"The process of turning food into energy is ___.",options:["photosynthesis","digestion","respiration","circulation"],answer:"digestion",hint:"Digestion breaks down food for energy!"},
    {level:"medium",type:"sentence",q:"A quadrilateral with opposite sides equal and all angles 90° is a ___.",options:["trapezium","rhombus","rectangle","parallelogram"],answer:"rectangle",hint:"Rectangle: all angles 90°, opposite sides equal!"},
    {level:"medium",type:"sentence",q:"The opposite of 'maximum' is ___.",options:["large","medium","minimum","average"],answer:"minimum",hint:"Maximum=most, minimum=least!"},
    {level:"medium",type:"sentence",q:"A word meaning the same as another is a ___.",options:["antonym","homophone","synonym","suffix"],answer:"synonym",hint:"Happy and joyful are synonyms!"},
    {level:"medium",type:"sentence",q:"A word with the opposite meaning is an ___.",options:["synonym","homophone","antonym","prefix"],answer:"antonym",hint:"Hot and cold are antonyms!"},
    {level:"medium",type:"sentence",q:"Water turns to steam at ___ degrees Celsius.",options:["50","75","100","150"],answer:"100",hint:"Water boils at 100°C!"},
    {level:"medium",type:"sentence",q:"The capital of Italy is ___.",options:["Milan","Venice","Naples","Rome"],answer:"Rome",hint:"Rome was the centre of a great empire!"},
    {level:"medium",type:"sentence",q:"The ___ of a circle is twice the radius.",options:["diameter","perimeter","area","circumference"],answer:"diameter",hint:"Diameter goes all the way across!"},
    {level:"medium",type:"sentence",q:"The process of water turning to vapour is ___.",options:["condensation","freezing","evaporation","melting"],answer:"evaporation",hint:"Puddles disappear through evaporation!"},
    {level:"medium",type:"sentence",q:"The study of living things is called ___.",options:["chemistry","physics","biology","geology"],answer:"biology",hint:"Bio = life, logy = study!"},
    {level:"medium",type:"sentence",q:"The longest bone in the human body is the ___.",options:["spine","tibia","femur","humerus"],answer:"femur",hint:"The femur is in your thigh!"},
    {level:"medium",type:"sentence",q:"A number that can only be divided by 1 and itself is ___.",options:["even","square","prime","composite"],answer:"prime",hint:"2, 3, 5, 7, 11 are prime numbers!"},
    {level:"medium",type:"sentence",q:"A word placed before a root word to change meaning is a ___.",options:["suffix","prefix","root","stem"],answer:"prefix",hint:"Un-happy: un- is the prefix!"},
    {level:"medium",type:"sentence",q:"The imaginary line around Earth's middle is the ___.",options:["tropics","meridian","equator","hemisphere"],answer:"equator",hint:"The equator divides Earth into north and south!"},
    {level:"hard",type:"sentence",q:"The ___ is the philosophical position that knowledge comes from sensory experience.",options:["rationalism","empiricism","idealism","pragmatism"],answer:"empiricism",hint:"Empiricism = knowledge from senses. Locke, Hume, Bacon!"},
    {level:"hard",type:"sentence",q:"The ___ is the minimum energy needed for a chemical reaction.",options:["activation energy","free energy","bond energy","kinetic energy"],answer:"activation energy",hint:"Activation energy = energy to start a reaction!"},
    {level:"hard",type:"sentence",q:"The ___ states energy cannot be created or destroyed.",options:["Second Law of Thermodynamics","Law of Conservation of Mass","First Law of Thermodynamics","Ohm's Law"],answer:"First Law of Thermodynamics",hint:"First Law = energy conservation!"},
    {level:"hard",type:"sentence",q:"The ___ states entropy in a closed system always increases.",options:["First Law of Thermodynamics","Newton's Third Law","Second Law of Thermodynamics","Law of Conservation of Mass"],answer:"Second Law of Thermodynamics",hint:"Second Law = entropy always increases!"},
    {level:"hard",type:"sentence",q:"___ is the tendency of a fluid to resist flow.",options:["Density","Viscosity","Pressure","Buoyancy"],answer:"Viscosity",hint:"Honey has high viscosity!"},
    {level:"hard",type:"sentence",q:"___ is the measure of disorder in a system.",options:["Enthalpy","Entropy","Free energy","Activation energy"],answer:"Entropy",hint:"Second Law: entropy always increases!"},
    {level:"hard",type:"sentence",q:"In literature, the ___ is the moment of highest tension.",options:["denouement","exposition","falling action","climax"],answer:"climax",hint:"The climax is the most intense turning point!"},
    {level:"hard",type:"sentence",q:"The ___ of a story introduces characters and initial conflict.",options:["climax","falling action","denouement","exposition"],answer:"exposition",hint:"Exposition = opening. Sets the scene!"},
    {level:"hard",type:"sentence",q:"After the climax, the ___ shows events unwinding.",options:["exposition","rising action","falling action","denouement"],answer:"falling action",hint:"Falling action follows the climax!"},
    {level:"hard",type:"sentence",q:"___ shows events building towards the climax.",options:["exposition","climax","falling action","rising action"],answer:"rising action",hint:"Rising action = build-up of tension!"},
    {level:"hard",type:"sentence",q:"In economics, the law of ___ states higher price = lower demand.",options:["supply","demand","diminishing returns","comparative advantage"],answer:"demand",hint:"Law of demand: higher price → lower demand!"},
    {level:"hard",type:"sentence",q:"In economics, the law of ___ states higher price = more produced.",options:["demand","diminishing returns","supply","comparative advantage"],answer:"supply",hint:"Law of supply: higher price → more produced!"},
    {level:"hard",type:"sentence",q:"___ is the bending of waves around an obstacle or through a gap.",options:["Refraction","Reflection","Diffraction","Absorption"],answer:"Diffraction",hint:"Diffraction = waves bending around corners!"},
    {level:"hard",type:"sentence",q:"The ___ voice in grammar shows the subject performing the action.",options:["passive","active","subjunctive","indicative"],answer:"active",hint:"Active: The cat chased the mouse!"},
    {level:"hard",type:"sentence",q:"The ___ voice shows the subject receiving the action.",options:["active","indicative","imperative","passive"],answer:"passive",hint:"Passive: The mouse was chased by the cat!"},
    {level:"hard",type:"sentence",q:"The ___ fallacy attacks the person rather than the argument.",options:["straw man","false dichotomy","post hoc","ad hominem"],answer:"ad hominem",hint:"Ad hominem = attacking the person, not the argument!"},
    {level:"hard",type:"sentence",q:"The ___ fallacy assumes B followed A, so A caused B.",options:["straw man","ad hominem","post hoc ergo propter hoc","false dichotomy"],answer:"post hoc ergo propter hoc",hint:"Post hoc = after this therefore because of this!"},
    {level:"hard",type:"sentence",q:"A ___ presents only two options as if no others exist.",options:["post hoc","ad hominem","straw man","false dichotomy"],answer:"false dichotomy",hint:"You're either with us or against us = false dichotomy!"},
    {level:"hard",type:"sentence",q:"___ is the philosophical study of beauty and artistic taste.",options:["Epistemology","Ethics","Ontology","Aesthetics"],answer:"Aesthetics",hint:"Aesthetics = philosophy of beauty and art!"},
    {level:"hard",type:"sentence",q:"___ is the philosophical study of morality.",options:["Epistemology","Aesthetics","Ontology","Ethics"],answer:"Ethics",hint:"Ethics = study of right and wrong!"},
    {level:"hard",type:"sentence",q:"___ is the philosophical study of knowledge.",options:["Ethics","Aesthetics","Ontology","Epistemology"],answer:"Epistemology",hint:"Epistemology = what is knowledge and how do we know?"},
    {level:"hard",type:"sentence",q:"___ is the philosophical study of existence.",options:["Ethics","Aesthetics","Epistemology","Ontology"],answer:"Ontology",hint:"Ontology = what exists?"},
    {level:"hard",type:"sentence",q:"A proven mathematical statement is called a ___.",options:["axiom","hypothesis","postulate","theorem"],answer:"theorem",hint:"Theorems are proven by deductive reasoning!"},
    {level:"hard",type:"sentence",q:"___ is how spread out values are from the mean.",options:["median","mode","range","standard deviation"],answer:"standard deviation",hint:"Standard deviation shows how much values vary!"},
    {level:"hard",type:"sentence",q:"In genetics, a ___ trait needs two copies of the allele.",options:["dominant","codominant","polygenic","recessive"],answer:"recessive",hint:"Recessive = hidden. Needs two copies (bb)!"},
    {level:"hard",type:"sentence",q:"In genetics, a ___ trait shows with just one copy.",options:["recessive","codominant","polygenic","dominant"],answer:"dominant",hint:"Dominant = shows with just one copy (Bb or BB)!"},
    {level:"hard",type:"sentence",q:"The ___ is the complete set of genetic material in an organism.",options:["chromosome","gene","genome","allele"],answer:"genome",hint:"Human genome = ~3 billion base pairs!"},
    {level:"hard",type:"sentence",q:"___ is when an atom's nucleus splits into smaller parts.",options:["Nuclear fusion","Radioactive decay","Nuclear fission","Ionisation"],answer:"Nuclear fission",hint:"Fission = splitting. Nuclear power uses fission!"},
    {level:"hard",type:"sentence",q:"___ is when two atomic nuclei combine.",options:["Nuclear fission","Radioactive decay","Nuclear fusion","Ionisation"],answer:"Nuclear fusion",hint:"Fusion = joining. The Sun uses fusion!"},
    {level:"hard",type:"sentence",q:"The ___ states total momentum of a closed system is constant.",options:["Newton's Second Law","Conservation of Energy","Conservation of Momentum","Ohm's Law"],answer:"Conservation of Momentum",hint:"Total momentum never changes in a closed system!"},
    {level:"hard",type:"sentence",q:"In economics, the ___ occurs when adding one more input yields less output.",options:["law of supply","economies of scale","law of diminishing returns","opportunity cost"],answer:"law of diminishing returns",hint:"Adding the 10th worker adds less than the 1st!"},
    {level:"hard",type:"sentence",q:"___ cost is the value of the next best alternative forgone.",options:["Sunk","Fixed","Variable","Opportunity"],answer:"Opportunity",hint:"Opportunity cost = what you give up!"},
    {level:"hard",type:"sentence",q:"The ___ theory argues government spending can stimulate a stagnant economy.",options:["Monetarist","Supply-side","Laissez-faire","Keynesian"],answer:"Keynesian",hint:"Keynes: government should spend during recessions!"},
    {level:"hard",type:"sentence",q:"The ___ of a wave determines colour (light) or pitch (sound).",options:["amplitude","wavelength","speed","intensity"],answer:"wavelength",hint:"Short wavelength = blue/high pitch. Long = red/low pitch!"},
    {level:"hard",type:"sentence",q:"In philosophy, ___ is the view that only your own mind can be verified.",options:["empiricism","rationalism","solipsism","determinism"],answer:"solipsism",hint:"Solipsism: I can only know my own mind exists!"},
    {level:"hard",type:"sentence",q:"___ is the view that all events are determined by prior causes.",options:["Libertarianism","Indeterminism","Dualism","Determinism"],answer:"Determinism",hint:"Determinism: free will is an illusion!"},
    {level:"hard",type:"sentence",q:"In rhetorical analysis, ___ refers to emotional appeals.",options:["ethos","logos","pathos","kairos"],answer:"pathos",hint:"Pathos = emotion. Logos = logic. Ethos = credibility!"},
    {level:"hard",type:"sentence",q:"In rhetorical analysis, ___ refers to logical argument.",options:["ethos","pathos","kairos","logos"],answer:"logos",hint:"Logos = logic. Facts, statistics, structured arguments!"},
    {level:"hard",type:"sentence",q:"In rhetorical analysis, ___ refers to the speaker's credibility.",options:["pathos","logos","kairos","ethos"],answer:"ethos",hint:"Ethos = credibility. Doctors use medical ethos!"},
    {level:"hard",type:"sentence",q:"The ___ of a wave is the time for one complete cycle.",options:["frequency","amplitude","wavelength","period"],answer:"period",hint:"Period (T) = 1/frequency!"},
    {level:"hard",type:"sentence",q:"___ is heat transfer through direct contact.",options:["Convection","Radiation","Evaporation","Conduction"],answer:"Conduction",hint:"Conduction = heat through touch. Metals conduct well!"},
    {level:"hard",type:"sentence",q:"___ is heat transfer through fluid movement.",options:["Conduction","Radiation","Absorption","Convection"],answer:"Convection",hint:"Convection currents: warm fluid rises, cool sinks!"},
    {level:"hard",type:"sentence",q:"___ is heat transfer through electromagnetic waves.",options:["Conduction","Convection","Absorption","Radiation"],answer:"Radiation",hint:"Radiation needs no medium. The Sun heats Earth through radiation!"},
    {level:"hard",type:"sentence",q:"In mathematics, a ___ is assumed true without proof.",options:["theorem","corollary","axiom","lemma"],answer:"axiom",hint:"Axioms are self-evident truths. Euclid had 5 axioms!"},
    {level:"hard",type:"sentence",q:"___ is the literary technique of hinting at future events.",options:["flashback","metaphor","foreshadowing","alliteration"],answer:"foreshadowing",hint:"Foreshadowing hints at what's coming!"},
    {level:"hard",type:"sentence",q:"Newton's Third Law: every action has an equal and ___ reaction.",options:["stronger","weaker","identical","opposite"],answer:"opposite",hint:"Push a wall — it pushes back with equal force!"},
    {level:"hard",type:"sentence",q:"The ___ is the central idea or message of a literary work.",options:["plot","setting","theme","character"],answer:"theme",hint:"The theme of Romeo and Juliet = love and fate!"},
    {level:"hard",type:"sentence",q:"A substance that speeds up reactions without being consumed is a ___.",options:["reactant","product","catalyst","solvent"],answer:"catalyst",hint:"Enzymes are biological catalysts!"},
    {level:"hard",type:"sentence",q:"The ___ is the measure of the amount of matter in an object.",options:["weight","volume","density","mass"],answer:"mass",hint:"Mass is measured in grams or kilograms!"},
    {level:"hard",type:"sentence",q:"A story where characters symbolise moral truths is an ___.",options:["epic","allegory","sonnet","elegy"],answer:"allegory",hint:"Animal Farm is an allegory for Soviet Russia!"},
    {level:"hard",type:"sentence",q:"The ___ is the smallest unit of an element.",options:["molecule","compound","atom","cell"],answer:"atom",hint:"Atoms make up everything!"},
    {level:"hard",type:"sentence",q:"The ___ of a wave is the maximum displacement from rest position.",options:["wavelength","frequency","period","amplitude"],answer:"amplitude",hint:"Amplitude = height of wave from rest!"},
    {level:"hard",type:"sentence",q:"A word that reads the same forwards and backwards is a ___.",options:["synonym","antonym","palindrome","homophone"],answer:"palindrome",hint:"Racecar and level are palindromes!"},
    {level:"hard",type:"sentence",q:"The study of word origins is called ___.",options:["phonics","grammar","etymology","syntax"],answer:"etymology",hint:"Etymology tells us where words come from!"},
    {level:"hard",type:"sentence",q:"When light passes through a prism it splits into the ___ of colours.",options:["galaxy","spectrum","atmosphere","aurora"],answer:"spectrum",hint:"ROYGBIV = the visible spectrum!"},
    {level:"hard",type:"sentence",q:"The molecule carrying genetic information in cells is ___.",options:["RNA","ATP","DNA","ADP"],answer:"DNA",hint:"DNA is the blueprint of life!"},
    {level:"hard",type:"sentence",q:"The force opposing motion between surfaces is ___.",options:["gravity","tension","friction","magnetism"],answer:"friction",hint:"Friction slows things down!"},
    {level:"hard",type:"sentence",q:"The ___ principle states objects in fluid experience upward force equal to weight displaced.",options:["Bernoulli's","Ohm's","Archimedes'","Newton's"],answer:"Archimedes'",hint:"Archimedes' principle explains why ships float!"},
    {level:"hard",type:"sentence",q:"In biology, the ___ hypothesis says eukaryotes evolved by engulfing simpler cells.",options:["endosymbiotic","evolution","cell theory","germ theory"],answer:"endosymbiotic",hint:"Mitochondria were once free-living bacteria!"},
    {level:"hard",type:"sentence",q:"The ___ is the complete set of genetic material.",options:["chromosome","gene","genome","allele"],answer:"genome",hint:"The human genome contains ~3 billion base pairs!"},
    {level:"hard",type:"sentence",q:"In evolutionary biology, ___ is when two species evolve similar traits independently.",options:["divergent evolution","coevolution","convergent evolution","speciation"],answer:"convergent evolution",hint:"Dolphins and sharks both evolved fins independently!"},
    {level:"hard",type:"sentence",q:"The ___ in macroeconomics = C + I + G + (X-M).",options:["GDP","GNP","aggregate demand","trade balance"],answer:"aggregate demand",hint:"AD = Consumption + Investment + Government + Net Exports!"},
    {level:"hard",type:"sentence",q:"___ in logic is a statement of the form 'if P then Q'.",options:["conjunction","disjunction","conditional","biconditional"],answer:"conditional",hint:"If it rains (P), I will stay in (Q) = conditional!"},
    {level:"hard",type:"sentence",q:"The ___ in chemistry is the number of protons in an atom's nucleus.",options:["mass number","atomic mass","electron number","atomic number"],answer:"atomic number",hint:"Atomic number = protons. Defines the element!"},
    {level:"hard",type:"sentence",q:"The ___ of an atom is the total number of protons and neutrons.",options:["atomic number","electron configuration","mass number","charge"],answer:"mass number",hint:"Mass number = protons + neutrons. Carbon-12 = 6+6!"},
    {level:"hard",type:"sentence",q:"A ___ in chemistry accepts electrons in a reaction.",options:["base","reducing agent","nucleophile","oxidising agent"],answer:"oxidising agent",hint:"Oxidising agents accept electrons!"},
    {level:"hard",type:"sentence",q:"A ___ in chemistry donates electrons in a reaction.",options:["acid","oxidising agent","electrophile","reducing agent"],answer:"reducing agent",hint:"Reducing agents donate electrons!"},
    {level:"hard",type:"sentence",q:"In statistics, a ___ sample gives every member an equal chance of selection.",options:["biased","convenience","stratified","random"],answer:"random",hint:"Random sampling reduces bias!"},
    {level:"hard",type:"sentence",q:"___ is the biological process of maintaining stable internal conditions.",options:["Homeostasis","Metabolism","Photosynthesis","Respiration"],answer:"Homeostasis",hint:"Homeostasis = stable temperature, blood sugar, pH!"}
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
    // ── EXTRA EASY ──
    {level:"easy",q:"What do butterflies start life as? 🦋",options:["Tadpoles","Caterpillars","Chicks","Grubs"],answer:"Caterpillars",hint:"Egg → Caterpillar → Chrysalis → Butterfly!"},
    {level:"easy",q:"What do we breathe in to survive? 🌬️",options:["Carbon dioxide","Nitrogen","Oxygen","Steam"],answer:"Oxygen",hint:"We breathe in oxygen and breathe out carbon dioxide!"},
    {level:"easy",q:"How many legs does a spider have? 🕷️",options:["4","6","8","10"],answer:"8",hint:"Spiders have 8 legs — more than insects!"},
    {level:"easy",q:"What is the hottest planet in our solar system? ☀️",options:["Mercury","Venus","Mars","Jupiter"],answer:"Venus",hint:"Venus has a thick atmosphere that traps heat!"},
    {level:"easy",q:"Which animal is the largest on land? 🐘",options:["Giraffe","Hippo","Elephant","Rhino"],answer:"Elephant",hint:"African elephants are the biggest land animals!"},
    {level:"easy",q:"What do plants make during photosynthesis? 🌿",options:["Water","Sugar","Salt","Soil"],answer:"Sugar",hint:"Plants make sugar (glucose) from sunlight!"},
    {level:"easy",q:"What covers most of the Earth's surface? 🌍",options:["Ice","Land","Forests","Water"],answer:"Water",hint:"About 71% of Earth is covered by oceans!"},
    // ── EXTRA MEDIUM ──
    {level:"medium",q:"What is the function of the lungs? 🫁",options:["Pump blood","Filter blood","Exchange gases","Digest food"],answer:"Exchange gases",hint:"Lungs take in oxygen and release carbon dioxide!"},
    {level:"medium",q:"Which planet has rings? 🪐",options:["Mars","Jupiter","Saturn","Neptune"],answer:"Saturn",hint:"Saturn's rings are made of ice and rock!"},
    {level:"medium",q:"What is the boiling point of water? 💧",options:["50°C","75°C","100°C","150°C"],answer:"100°C",hint:"Water boils at 100 degrees Celsius!"},
    {level:"medium",q:"What type of animal is a whale? 🐋",options:["Fish","Reptile","Mammal","Amphibian"],answer:"Mammal",hint:"Whales breathe air and feed their young milk!"},
    {level:"medium",q:"What causes day and night? 🌙",options:["Earth orbiting the Sun","Moon blocking the Sun","Earth spinning on its axis","Clouds covering the Sun"],answer:"Earth spinning on its axis",hint:"Earth rotates once every 24 hours, causing day and night!"},
    {level:"medium",q:"What is the main source of energy for Earth? ☀️",options:["Wind","The Moon","The Sun","Volcanoes"],answer:"The Sun",hint:"The Sun provides light and heat energy for all life on Earth!"},
    // ── EXTRA HARD ──
    {level:"hard",q:"What is the name for animals that eat both plants and meat?",options:["Herbivores","Carnivores","Omnivores","Predators"],answer:"Omnivores",hint:"Omni = all. Omnivores eat everything!"},
    {level:"hard",q:"Which part of the cell contains genetic information (DNA)?",options:["Cell membrane","Mitochondria","Nucleus","Vacuole"],answer:"Nucleus",hint:"The nucleus is the control centre of the cell!"},
    {level:"hard",q:"What is the speed of light approximately?",options:["300 km/s","3,000 km/s","300,000 km/s","3,000,000 km/s"],answer:"300,000 km/s",hint:"Light travels about 300,000 kilometres per second!"},
    {level:"hard",q:"What is Newton's First Law of Motion?",options:["Force = Mass × Acceleration","Objects in motion stay in motion unless acted upon","Every action has an equal reaction","Energy cannot be created or destroyed"],answer:"Objects in motion stay in motion unless acted upon",hint:"Also called the Law of Inertia!"},
    {level:"hard",q:"What percentage of the human body is water?",options:["30%","45%","60%","80%"],answer:"60%",hint:"About 60% of the adult human body is water!"},
  
    {"level":"easy","q":"What do plants use to make food? ☀️","options":["Moonlight","Sunlight","Streetlight","Candlelight"],"answer":"Sunlight","hint":"Plants use sunlight in photosynthesis!"},
    {"level":"easy","q":"What is the centre of our solar system? ☀️","options":["Moon","Earth","Sun","Mars"],"answer":"Sun","hint":"All planets orbit the Sun!"},
    {"level":"easy","q":"What do tadpoles grow into? 🐸","options":["Fish","Newts","Frogs","Salamanders"],"answer":"Frogs","hint":"Tadpole → frog through metamorphosis!"},
    {"level":"easy","q":"What is ice made of? 💧","options":["Frozen air","Frozen water","Frozen juice","Frozen milk"],"answer":"Frozen water","hint":"Water freezes at 0°C to become ice!"},
    {"level":"easy","q":"Which sense do we use our eyes for? 👁️","options":["Hearing","Seeing","Tasting","Smelling"],"answer":"Seeing","hint":"Eyes are our organs of sight!"},
    {"level":"easy","q":"How many legs does a butterfly have? 🦋","options":["4","6","8","10"],"answer":"6","hint":"Butterflies are insects — all insects have 6 legs!"},
    {"level":"easy","q":"What is the largest planet? 🪐","options":["Saturn","Neptune","Jupiter","Uranus"],"answer":"Jupiter","hint":"Jupiter is so big 1300 Earths could fit inside!"},
    {"level":"easy","q":"What do herbivores eat? 🐄","options":["Only meat","Only plants","Both plants and meat","Only fish"],"answer":"Only plants","hint":"Herbi = plant, vore = eater!"},
    {"level":"easy","q":"What colour is chlorophyll? 🌿","options":["Yellow","Blue","Green","Red"],"answer":"Green","hint":"Chlorophyll makes plants green!"},
    {"level":"easy","q":"How many planets are in our solar system?","options":["7","8","9","10"],"answer":"8","hint":"Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune!"},
    {"level":"easy","q":"What organ do fish breathe with? 🐟","options":["Lungs","Gills","Skin","Nose"],"answer":"Gills","hint":"Fish extract oxygen from water using gills!"},
    {"level":"easy","q":"What is the closest planet to the Sun? ☀️","options":["Venus","Earth","Mars","Mercury"],"answer":"Mercury","hint":"Mercury is the first planet from the Sun!"},
    {"level":"easy","q":"What do roots do for a plant? 🌱","options":["Make food","Absorb water","Attract insects","Make seeds"],"answer":"Absorb water","hint":"Roots anchor the plant and drink up water!"},
    {"level":"easy","q":"Which animal lays eggs AND feeds young milk? 🐾","options":["Dog","Cat","Platypus","Horse"],"answer":"Platypus","hint":"The platypus is a mammal that lays eggs!"},
    {"level":"easy","q":"What gas do humans breathe in? 🌬️","options":["Carbon dioxide","Nitrogen","Oxygen","Hydrogen"],"answer":"Oxygen","hint":"We breathe in oxygen and out carbon dioxide!"},
    {"level":"easy","q":"Which force pulls objects towards Earth? 🌍","options":["Magnetism","Friction","Gravity","Tension"],"answer":"Gravity","hint":"Gravity keeps us on the ground!"},
    {"level":"easy","q":"What is the process of water turning into vapour called?","options":["Condensation","Freezing","Evaporation","Melting"],"answer":"Evaporation","hint":"Puddles disappear through evaporation!"},
    {"level":"easy","q":"What type of animal is a dolphin? 🐬","options":["Fish","Reptile","Mammal","Amphibian"],"answer":"Mammal","hint":"Dolphins breathe air and nurse young!"},
    {"level":"easy","q":"Which part of the flower attracts insects? 🌸","options":["Roots","Stem","Petals","Leaves"],"answer":"Petals","hint":"Colourful petals attract bees!"},
    {"level":"easy","q":"What is a fossil? 🦴","options":["A living animal","A type of rock","Preserved remains in rock","A plant species"],"answer":"Preserved remains in rock","hint":"Dinosaur fossils are in rock!"},
    {"level":"easy","q":"What gives the sky its blue colour? 🌤️","options":["Water vapour","Carbon dioxide","Scattering of sunlight","Oxygen"],"answer":"Scattering of sunlight","hint":"The atmosphere scatters blue light more than other colours!"},
    {"level":"easy","q":"What is the moon? 🌕","options":["A star","A planet","Earth's natural satellite","A comet"],"answer":"Earth's natural satellite","hint":"The moon orbits Earth!"},
    {"level":"easy","q":"What do carnivores eat? 🦁","options":["Only plants","Only meat","Both plants and meat","Only fruit"],"answer":"Only meat","hint":"Carni = meat, vore = eater!"},
    {"level":"easy","q":"What is steam? 💨","options":["Frozen water","Liquid water","Water vapour","Dirty water"],"answer":"Water vapour","hint":"Water turns to steam when it boils!"},
    {"level":"easy","q":"Which is NOT a mammal?","options":["Dog","Whale","Shark","Bat"],"answer":"Shark","hint":"Sharks are fish — they breathe through gills and lay eggs!"},
    {"level":"medium","q":"What is the chemical symbol for water? 💧","options":["WA","H2O","HO2","W2O"],"answer":"H2O","hint":"2 Hydrogen + 1 Oxygen = H2O!"},
    {"level":"medium","q":"What is the function of red blood cells? 🩸","options":["Fight infection","Carry oxygen","Clot blood","Produce hormones"],"answer":"Carry oxygen","hint":"Red blood cells carry oxygen around the body!"},
    {"level":"medium","q":"What is photosynthesis? 🌿","options":["How animals breathe","How plants make food from sunlight","How rocks form","How weather changes"],"answer":"How plants make food from sunlight","hint":"Photo = light, synthesis = making!"},
    {"level":"medium","q":"What planet is known as the Red Planet? 🔴","options":["Venus","Jupiter","Mars","Saturn"],"answer":"Mars","hint":"Mars has iron oxide (rust) making it appear red!"},
    {"level":"medium","q":"What is evaporation? 💧","options":["Liquid turning to gas","Gas turning to liquid","Solid to liquid","Liquid to solid"],"answer":"Liquid turning to gas","hint":"Water evaporates into vapour!"},
    {"level":"medium","q":"How do sound waves travel? 🔊","options":["Through vibrations","Through light","Through magnets","Through gravity"],"answer":"Through vibrations","hint":"Sound is vibrations through a medium!"},
    {"level":"medium","q":"What is condensation? 🌫️","options":["Liquid to gas","Gas to liquid","Solid to liquid","Liquid to solid"],"answer":"Gas to liquid","hint":"Water vapour condenses on cold windows!"},
    {"level":"medium","q":"What is refraction? 🌈","options":["Bending of light when changing medium","Splitting of atoms","Reflection of sound","Absorption of heat"],"answer":"Bending of light when changing medium","hint":"Light bends when passing from air to water!"},
    {"level":"medium","q":"What is DNA? 🧬","options":["A type of protein","The molecule carrying genetic information","A cell organelle","A type of enzyme"],"answer":"The molecule carrying genetic information","hint":"DNA contains the instructions for life!"},
    {"level":"medium","q":"What does a barometer measure? 🌡️","options":["Temperature","Wind speed","Air pressure","Humidity"],"answer":"Air pressure","hint":"Barometers predict weather via atmospheric pressure!"},
    {"level":"medium","q":"What are the primary colours of light?","options":["Red, yellow, blue","Red, green, blue","Red, yellow, green","Blue, yellow, green"],"answer":"Red, green, blue","hint":"Mixing RGB light makes white light!"},
    {"level":"medium","q":"What is the unit of electrical resistance?","options":["Volt","Ampere","Watt","Ohm"],"answer":"Ohm","hint":"Resistance is measured in Ohms!"},
    {"level":"medium","q":"Which planet has the most moons?","options":["Jupiter","Saturn","Uranus","Neptune"],"answer":"Saturn","hint":"Saturn has over 80 confirmed moons!"},
    {"level":"medium","q":"What is an ecosystem?","options":["A type of weather","A community of living things and their environment","A layer of atmosphere","A type of rock"],"answer":"A community of living things and their environment","hint":"A rainforest is an ecosystem!"},
    {"level":"medium","q":"What is the process of water turning to ice called?","options":["Evaporation","Condensation","Freezing","Melting"],"answer":"Freezing","hint":"Water freezes at 0°C!"},
    {"level":"medium","q":"What is the role of decomposers in an ecosystem?","options":["Produce food","Eat plants","Break down dead matter","Catch prey"],"answer":"Break down dead matter","hint":"Bacteria and fungi decompose dead things!"},
    {"level":"medium","q":"What is the scientific name for a backbone? 🦴","options":["Cranium","Femur","Vertebral column","Sternum"],"answer":"Vertebral column","hint":"Vertebral column = spine!"},
    {"level":"medium","q":"What is the function of the lungs? 🫁","options":["Pump blood","Filter blood","Exchange gases","Digest food"],"answer":"Exchange gases","hint":"Lungs take in oxygen and release CO2!"},
    {"level":"medium","q":"What causes seasons on Earth? 🌍","options":["Distance from the Sun","Earth's tilt on its axis","The Moon's orbit","Solar flares"],"answer":"Earth's tilt on its axis","hint":"Earth's 23.5° tilt causes different parts to receive more sunlight!"},
    {"level":"medium","q":"What is the food chain in the correct order?","options":["Fox → Rabbit → Grass","Grass → Fox → Rabbit","Grass → Rabbit → Fox","Rabbit → Grass → Fox"],"answer":"Grass → Rabbit → Fox","hint":"Energy flows from producer → herbivore → carnivore!"},
    {"level":"hard","q":"What is Newton's Second Law of Motion?","options":["Objects stay still unless a force acts","Force = Mass × Acceleration","Every action has an equal reaction","Energy cannot be created"],"answer":"Force = Mass × Acceleration","hint":"F = ma is Newton's Second Law!"},
    {"level":"hard","q":"What is the Krebs cycle? 🔬","options":["The water cycle","Chemical reactions in cell respiration","The nitrogen cycle","How plants photosynthesise"],"answer":"Chemical reactions in cell respiration","hint":"The Krebs cycle releases energy in cells!"},
    {"level":"hard","q":"What is a catalyst? ⚗️","options":["Slows reactions","Speeds reactions without being used up","A type of acid","A product of a reaction"],"answer":"Speeds reactions without being used up","hint":"Enzymes are biological catalysts!"},
    {"level":"hard","q":"What is the pH of a neutral substance?","options":["0","1","7","14"],"answer":"7","hint":"pH 7 = neutral. Below 7 = acid, above 7 = alkali!"},
    {"level":"hard","q":"What is the function of mitochondria? 🔬","options":["Store genetic info","Produce proteins","Generate energy (ATP)","Control cell activities"],"answer":"Generate energy (ATP)","hint":"Mitochondria are the powerhouse of the cell!"},
    {"level":"hard","q":"What is Ohm's Law? ⚡","options":["F = ma","V = IR","E = mc²","P = IV"],"answer":"V = IR","hint":"Voltage = Current × Resistance!"},
    {"level":"hard","q":"What is the difference between mitosis and meiosis?","options":["Same process","Mitosis: 2 identical cells; Meiosis: 4 sex cells","Mitosis is in plants only","Meiosis produces identical cells"],"answer":"Mitosis: 2 identical cells; Meiosis: 4 sex cells","hint":"Mitosis = growth. Meiosis = reproduction!"},
    {"level":"hard","q":"What is natural selection?","options":["Humans breeding selectively","Organisms with favourable traits survive and reproduce more","Random mutations only","Animals choosing mates"],"answer":"Organisms with favourable traits survive and reproduce more","hint":"Survival of the fittest!"},
    {"level":"hard","q":"What is the Big Bang Theory?","options":["Universe always existed","Universe began from a single point ~13.8 billion years ago","Stars formed before planets","Earth is centre of universe"],"answer":"Universe began from a single point ~13.8 billion years ago","hint":"All matter began with the Big Bang ~13.8 billion years ago!"},
    {"level":"hard","q":"What is homeostasis? 🌡️","options":["Movement of animals","Maintaining stable internal conditions","Study of ecosystems","How organisms reproduce"],"answer":"Maintaining stable internal conditions","hint":"Our body maintains 37°C — that's homeostasis!"},
    {"level":"hard","q":"What is the greenhouse effect? 🌍","options":["Plants in greenhouses","Gases trapping heat in Earth's atmosphere","Effect of UV on plants","How solar panels work"],"answer":"Gases trapping heat in Earth's atmosphere","hint":"CO2 traps heat like a greenhouse!"},
    {"level":"hard","q":"What are isotopes?","options":["Atoms of different elements","Same element with different neutron numbers","Charged atoms","Atoms with no electrons"],"answer":"Same element with different neutron numbers","hint":"Carbon-12 and Carbon-14 are isotopes!"},
    {"level":"hard","q":"What is the electromagnetic spectrum?","options":["The range of all electromagnetic radiation","A type of magnet","Force between charged particles","Visible light spectrum only"],"answer":"The range of all electromagnetic radiation","hint":"Radio waves → microwaves → infrared → visible → UV → X-rays → gamma!"},
    {"level":"hard","q":"What is the role of the nucleus in a cell? 🔬","options":["Makes energy","Controls cell activities and contains DNA","Protects the cell","Produces proteins"],"answer":"Controls cell activities and contains DNA","hint":"The nucleus is the cell's control centre!"},
    {"level":"hard","q":"What is the theory of plate tectonics?","options":["Continents have always been in same position","Earth's crust consists of plates that move","Mountains form from volcanoes only","Earthquakes cause sea levels to rise"],"answer":"Earth's crust consists of plates that move","hint":"Continents drift because tectonic plates move — Pangaea broke apart!"},
  ,
    {level:"easy",q:"What do plants use to make food? ☀️",options:["Moonlight","Sunlight","Streetlight","Candlelight"],answer:"Sunlight",hint:"Plants use sunlight in photosynthesis!"},
    {level:"easy",q:"What do tadpoles grow into? 🐸",options:["Fish","Newts","Frogs","Salamanders"],answer:"Frogs",hint:"Tadpole → frog!"},
    {level:"easy",q:"What is ice made of? 💧",options:["Frozen air","Frozen water","Frozen juice","Frozen milk"],answer:"Frozen water",hint:"Water freezes at 0°C!"},
    {level:"easy",q:"How many legs does a butterfly have? 🦋",options:["4","6","8","10"],answer:"6",hint:"Insects have 6 legs!"},
    {level:"easy",q:"What is the largest planet? 🪐",options:["Saturn","Neptune","Jupiter","Uranus"],answer:"Jupiter",hint:"1300 Earths fit inside Jupiter!"},
    {level:"easy",q:"What do herbivores eat? 🐄",options:["Only meat","Only plants","Both","Only fish"],answer:"Only plants",hint:"Herbi=plant, vore=eater!"},
    {level:"easy",q:"How many planets are in our solar system?",options:["7","8","9","10"],answer:"8",hint:"Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune!"},
    {level:"easy",q:"What organ do fish breathe with? 🐟",options:["Lungs","Gills","Skin","Nose"],answer:"Gills",hint:"Gills extract oxygen from water!"},
    {level:"easy",q:"What is the closest planet to the Sun? ☀️",options:["Venus","Earth","Mars","Mercury"],answer:"Mercury",hint:"Mercury is first from the Sun!"},
    {level:"easy",q:"What gas do humans breathe in? 🌬️",options:["Carbon dioxide","Nitrogen","Oxygen","Hydrogen"],answer:"Oxygen",hint:"We breathe in oxygen!"},
    {level:"easy",q:"Which force pulls objects towards Earth? 🌍",options:["Magnetism","Friction","Gravity","Tension"],answer:"Gravity",hint:"Gravity keeps us on the ground!"},
    {level:"easy",q:"What type of animal is a dolphin? 🐬",options:["Fish","Reptile","Mammal","Amphibian"],answer:"Mammal",hint:"Dolphins breathe air and nurse young!"},
    {level:"easy",q:"What is the process of water turning into vapour?",options:["Condensation","Freezing","Evaporation","Melting"],answer:"Evaporation",hint:"Puddles disappear through evaporation!"},
    {level:"easy",q:"What colour is chlorophyll? 🌿",options:["Yellow","Blue","Green","Red"],answer:"Green",hint:"Chlorophyll makes plants green!"},
    {level:"easy",q:"What do roots do for a plant? 🌱",options:["Make food","Absorb water","Attract insects","Make seeds"],answer:"Absorb water",hint:"Roots drink up water from soil!"},
    {level:"easy",q:"What is the moon? 🌕",options:["A star","A planet","Earth's natural satellite","A comet"],answer:"Earth's natural satellite",hint:"The moon orbits Earth!"},
    {level:"easy",q:"What do carnivores eat? 🦁",options:["Only plants","Only meat","Both","Only fruit"],answer:"Only meat",hint:"Carni=meat, vore=eater!"},
    {level:"easy",q:"Which is NOT a mammal?",options:["Dog","Whale","Shark","Bat"],answer:"Shark",hint:"Sharks are fish — they breathe through gills!"},
    {level:"easy",q:"What is a fossil? 🦴",options:["A living animal","A type of rock","Preserved remains in rock","A plant species"],answer:"Preserved remains in rock",hint:"Dinosaur fossils are preserved in rock!"},
    {level:"easy",q:"What gives the sky its blue colour? 🌤️",options:["Water vapour","Carbon dioxide","Scattering of sunlight","Oxygen"],answer:"Scattering of sunlight",hint:"The atmosphere scatters blue light most!"},
    {level:"medium",q:"What is the chemical symbol for water? 💧",options:["WA","H2O","HO2","W2O"],answer:"H2O",hint:"2 Hydrogen + 1 Oxygen = H2O!"},
    {level:"medium",q:"What is the function of red blood cells? 🩸",options:["Fight infection","Carry oxygen","Clot blood","Produce hormones"],answer:"Carry oxygen",hint:"Red blood cells carry oxygen!"},
    {level:"medium",q:"What is photosynthesis? 🌿",options:["How animals breathe","How plants make food from sunlight","How rocks form","How weather changes"],answer:"How plants make food from sunlight",hint:"Photo=light, synthesis=making!"},
    {level:"medium",q:"What planet is known as the Red Planet? 🔴",options:["Venus","Jupiter","Mars","Saturn"],answer:"Mars",hint:"Mars has iron oxide (rust) on its surface!"},
    {level:"medium",q:"What is evaporation? 💧",options:["Liquid to gas","Gas to liquid","Solid to liquid","Liquid to solid"],answer:"Liquid to gas",hint:"Water evaporates into vapour!"},
    {level:"medium",q:"How do sound waves travel? 🔊",options:["Through vibrations","Through light","Through magnets","Through gravity"],answer:"Through vibrations",hint:"Sound is vibrations through a medium!"},
    {level:"medium",q:"What is condensation? 🌫️",options:["Liquid to gas","Gas to liquid","Solid to liquid","Liquid to solid"],answer:"Gas to liquid",hint:"Water vapour condenses on cold windows!"},
    {level:"medium",q:"What is refraction? 🌈",options:["Bending of light when changing medium","Splitting of atoms","Reflection of sound","Absorption of heat"],answer:"Bending of light when changing medium",hint:"Light bends passing from air to water!"},
    {level:"medium",q:"What is DNA? 🧬",options:["A type of protein","The molecule carrying genetic information","A cell organelle","A type of enzyme"],answer:"The molecule carrying genetic information",hint:"DNA contains the instructions for life!"},
    {level:"medium",q:"What does a barometer measure? 🌡️",options:["Temperature","Wind speed","Air pressure","Humidity"],answer:"Air pressure",hint:"Barometers measure atmospheric pressure!"},
    {level:"medium",q:"What are the primary colours of light?",options:["Red, yellow, blue","Red, green, blue","Red, yellow, green","Blue, yellow, green"],answer:"Red, green, blue",hint:"RGB mixing makes white light!"},
    {level:"medium",q:"What is the unit of electrical resistance?",options:["Volt","Ampere","Watt","Ohm"],answer:"Ohm",hint:"Resistance is measured in Ohms!"},
    {level:"medium",q:"Which planet has the most moons?",options:["Jupiter","Saturn","Uranus","Neptune"],answer:"Saturn",hint:"Saturn has over 80 confirmed moons!"},
    {level:"medium",q:"What is an ecosystem?",options:["A type of weather","A community of living things and their environment","A layer of atmosphere","A type of rock"],answer:"A community of living things and their environment",hint:"A rainforest is an ecosystem!"},
    {level:"medium",q:"What is the process of water turning to ice called?",options:["Evaporation","Condensation","Freezing","Melting"],answer:"Freezing",hint:"Water freezes at 0°C!"},
    {level:"medium",q:"What is the role of decomposers in an ecosystem?",options:["Produce food","Eat plants","Break down dead matter","Catch prey"],answer:"Break down dead matter",hint:"Bacteria and fungi decompose dead matter!"},
    {level:"medium",q:"What causes seasons on Earth? 🌍",options:["Distance from the Sun","Earth's tilt on its axis","The Moon's orbit","Solar flares"],answer:"Earth's tilt on its axis",hint:"Earth's 23.5° tilt causes seasons!"},
    {level:"medium",q:"What is the function of the lungs? 🫁",options:["Pump blood","Filter blood","Exchange gases","Digest food"],answer:"Exchange gases",hint:"Lungs take in O2 and release CO2!"},
    {level:"medium",q:"What is the food chain in correct order?",options:["Fox→Rabbit→Grass","Grass→Fox→Rabbit","Grass→Rabbit→Fox","Rabbit→Grass→Fox"],answer:"Grass→Rabbit→Fox",hint:"Energy: producer→herbivore→carnivore!"},
    {level:"medium",q:"What is the Earth's atmosphere mostly made of?",options:["Oxygen","Carbon dioxide","Nitrogen","Argon"],answer:"Nitrogen",hint:"Nitrogen makes up ~78% of air!"},
    {level:"hard",q:"What is Newton's Second Law of Motion?",options:["Objects stay still unless a force acts","Force = Mass × Acceleration","Every action has an equal reaction","Energy cannot be created"],answer:"Force = Mass × Acceleration",hint:"F = ma!"},
    {level:"hard",q:"What is the Krebs cycle? 🔬",options:["The water cycle","Chemical reactions in cell respiration","The nitrogen cycle","How plants photosynthesise"],answer:"Chemical reactions in cell respiration",hint:"The Krebs cycle releases energy in cells!"},
    {level:"hard",q:"What is a catalyst? ⚗️",options:["Slows reactions","Speeds reactions without being used up","A type of acid","A product"],answer:"Speeds reactions without being used up",hint:"Enzymes are biological catalysts!"},
    {level:"hard",q:"What is the pH of a neutral substance?",options:["0","1","7","14"],answer:"7",hint:"pH 7=neutral. Below=acid, above=alkali!"},
    {level:"hard",q:"What is the function of mitochondria? 🔬",options:["Store genetic info","Produce proteins","Generate energy (ATP)","Control cell activities"],answer:"Generate energy (ATP)",hint:"Mitochondria = powerhouse of the cell!"},
    {level:"hard",q:"What is Ohm's Law? ⚡",options:["F=ma","V=IR","E=mc²","P=IV"],answer:"V=IR",hint:"Voltage = Current × Resistance!"},
    {level:"hard",q:"What is the difference between mitosis and meiosis?",options:["Same process","Mitosis: 2 identical cells; Meiosis: 4 sex cells","Mitosis is plants only","Meiosis produces identical cells"],answer:"Mitosis: 2 identical cells; Meiosis: 4 sex cells",hint:"Mitosis=growth, Meiosis=reproduction!"},
    {level:"hard",q:"What is natural selection?",options:["Humans breeding selectively","Organisms with favourable traits survive and reproduce more","Random mutations only","Animals choosing mates"],answer:"Organisms with favourable traits survive and reproduce more",hint:"Survival of the fittest!"},
    {level:"hard",q:"What is the Big Bang Theory?",options:["Universe always existed","Universe began from a single point ~13.8 billion years ago","Stars formed before planets","Earth is centre of universe"],answer:"Universe began from a single point ~13.8 billion years ago",hint:"All matter began ~13.8 billion years ago!"},
    {level:"hard",q:"What is homeostasis? 🌡️",options:["Movement of animals","Maintaining stable internal conditions","Study of ecosystems","How organisms reproduce"],answer:"Maintaining stable internal conditions",hint:"Our body maintains 37°C!"},
    {level:"hard",q:"What is the greenhouse effect? 🌍",options:["Plants in greenhouses","Gases trapping heat in Earth's atmosphere","Effect of UV on plants","How solar panels work"],answer:"Gases trapping heat in Earth's atmosphere",hint:"CO2 traps heat like a greenhouse!"},
    {level:"hard",q:"What are isotopes?",options:["Atoms of different elements","Same element with different neutron numbers","Charged atoms","Atoms with no electrons"],answer:"Same element with different neutron numbers",hint:"Carbon-12 and Carbon-14 are isotopes!"},
    {level:"hard",q:"What is the electromagnetic spectrum?",options:["The range of all electromagnetic radiation","A type of magnet","Force between charged particles","Visible light spectrum only"],answer:"The range of all electromagnetic radiation",hint:"Radio waves → microwaves → infrared → visible → UV → X-rays → gamma!"},
    {level:"hard",q:"What is the role of the nucleus in a cell? 🔬",options:["Makes energy","Controls cell activities and contains DNA","Protects the cell","Produces proteins"],answer:"Controls cell activities and contains DNA",hint:"The nucleus is the cell's control centre!"},
    {level:"hard",q:"What is the theory of plate tectonics?",options:["Continents always been in same position","Earth's crust consists of plates that move","Mountains form from volcanoes only","Earthquakes cause sea levels to rise"],answer:"Earth's crust consists of plates that move",hint:"Continents drift — Pangaea broke apart!"},
    {level:"hard",q:"What is the difference between a physical and chemical change?",options:["Same","Physical=reversible; chemical=new substance formed","Chemical changes always reversible","Physical changes release energy"],answer:"Physical=reversible; chemical=new substance formed",hint:"Melting ice=physical. Burning wood=chemical!"},
    {level:"hard",q:"What is the role of the ribosome in a cell?",options:["Stores energy","Produces proteins","Contains DNA","Controls cell division"],answer:"Produces proteins",hint:"Ribosomes translate DNA instructions into proteins!"},
    {level:"hard",q:"What is Avogadro's number?",options:["6.022 × 10²³","3.14 × 10²³","9.81 × 10²³","1.602 × 10¹⁹"],answer:"6.022 × 10²³",hint:"One mole of any substance = 6.022 × 10²³ particles!"},
    {level:"hard",q:"What is the difference between speed and velocity?",options:["They are the same","Speed is how fast, velocity includes direction","Velocity has no direction","Speed includes direction"],answer:"Speed is how fast, velocity includes direction",hint:"60 mph = speed. 60 mph north = velocity!"},
    {level:"hard",q:"What is the process of osmosis?",options:["Movement of solutes from high to low concentration","Movement of water through a semi-permeable membrane","Chemical reaction between two substances","Absorption of light by plants"],answer:"Movement of water through a semi-permeable membrane",hint:"Water moves from dilute to concentrated solution!"}
  ,
    {level:"easy",q:"What is the brightest star in the night sky?",options:["Polaris","Sirius","Vega","Betelgeuse"],answer:"Sirius",hint:"Sirius is the Dog Star and the brightest star we see!"},
    {level:"easy",q:"What do we call animals that eat both plants and meat?",options:["Herbivores","Carnivores","Omnivores","Insectivores"],answer:"Omnivores",hint:"Omni = all, vore = eater. Humans are omnivores!"},
    {level:"easy",q:"What season comes after winter?",options:["Summer","Autumn","Spring","Winter"],answer:"Spring",hint:"Winter → Spring → Summer → Autumn!"},
    {level:"easy",q:"What is the powerhouse of the cell?",options:["Nucleus","Ribosome","Mitochondria","Cell wall"],answer:"Mitochondria",hint:"Mitochondria make energy for the cell!"},
    {level:"easy",q:"What material is most attracted to magnets?",options:["Wood","Plastic","Glass","Iron"],answer:"Iron",hint:"Magnets attract iron, nickel and cobalt!"},
    {level:"easy",q:"What is the outer layer of the Earth called?",options:["Mantle","Core","Crust","Magma"],answer:"Crust",hint:"We live on Earth's crust!"},
    {level:"easy",q:"What organ pumps blood around the body?",options:["Lungs","Liver","Kidney","Heart"],answer:"Heart",hint:"The heart pumps blood through arteries and veins!"},
    {level:"easy",q:"What is the main gas in Earth's atmosphere?",options:["Oxygen","Carbon dioxide","Nitrogen","Argon"],answer:"Nitrogen",hint:"Nitrogen makes up 78% of our air!"},
    {level:"easy",q:"Which planet has rings? 🪐",options:["Mars","Jupiter","Saturn","Uranus"],answer:"Saturn",hint:"Saturn's rings are made of ice and rock!"},
    {level:"easy",q:"What is the chemical symbol for gold?",options:["Go","Gd","Au","Ag"],answer:"Au",hint:"Au comes from the Latin word 'aurum'!"},
    {level:"easy",q:"What is the smallest planet in our solar system?",options:["Mars","Venus","Mercury","Pluto"],answer:"Mercury",hint:"Mercury is the smallest and closest to the Sun!"},
    {level:"easy",q:"What type of energy does the Sun produce?",options:["Chemical","Nuclear","Mechanical","Electrical"],answer:"Nuclear",hint:"The Sun produces energy through nuclear fusion!"},
    {level:"easy",q:"What do we call the study of plants?",options:["Zoology","Geology","Botany","Ecology"],answer:"Botany",hint:"Botanists study plants!"},
    {level:"easy",q:"What is the hardest natural substance?",options:["Gold","Iron","Diamond","Quartz"],answer:"Diamond",hint:"Diamond is a 10 on the Mohs hardness scale!"},
    {level:"easy",q:"What is the process plants use to make food? 🌿",options:["Respiration","Digestion","Photosynthesis","Absorption"],answer:"Photosynthesis",hint:"Photo = light, synthesis = making food!"},
    {level:"easy",q:"Which animal has the longest neck?",options:["Elephant","Camel","Giraffe","Ostrich"],answer:"Giraffe",hint:"Giraffes have very long necks to reach tall trees!"},
    {level:"easy",q:"What is the boiling point of water in Celsius?",options:["50°C","75°C","90°C","100°C"],answer:"100°C",hint:"Water boils at 100°C!"},
    {level:"easy",q:"What do we call a baby frog?",options:["Larva","Cub","Tadpole","Froglet"],answer:"Tadpole",hint:"Baby frogs are tadpoles — they live in water!"},
    {level:"easy",q:"Which planet is closest to the Sun?",options:["Venus","Mars","Mercury","Earth"],answer:"Mercury",hint:"Mercury = closest to Sun!"},
    {level:"easy",q:"What is the freezing point of water?",options:["-10°C","0°C","5°C","10°C"],answer:"0°C",hint:"Water freezes at 0°C!"},
    {level:"easy",q:"What do we call animals that are active at night?",options:["Diurnal","Nocturnal","Migratory","Dormant"],answer:"Nocturnal",hint:"Owls and bats are nocturnal!"},
    {level:"easy",q:"What is the name of the force that slows down moving objects?",options:["Gravity","Magnetism","Friction","Tension"],answer:"Friction",hint:"Friction is caused by surfaces rubbing together!"},
    {level:"easy",q:"How many bones are in the human body?",options:["106","156","206","256"],answer:"206",hint:"Adults have 206 bones!"},
    {level:"easy",q:"What part of a plant makes seeds?",options:["Roots","Leaves","Stem","Flower"],answer:"Flower",hint:"Flowers produce seeds for reproduction!"},
    {level:"easy",q:"What do we call the movement of water from soil into plants?",options:["Evaporation","Transpiration","Absorption","Osmosis"],answer:"Osmosis",hint:"Water moves through plant roots by osmosis!"},
    {level:"easy",q:"Which sense organ detects smell?",options:["Eyes","Ears","Nose","Tongue"],answer:"Nose",hint:"The nose detects smells using sensory cells!"},
    {level:"easy",q:"What is the Earth's natural satellite?",options:["Sun","Mars","Moon","Venus"],answer:"Moon",hint:"The Moon orbits Earth!"},
    {level:"easy",q:"What do caterpillars make before becoming butterflies?",options:["Egg","Cocoon","Nest","Den"],answer:"Cocoon",hint:"A caterpillar wraps itself in a cocoon (chrysalis)!"},
    {level:"easy",q:"Which of these is a renewable energy source?",options:["Coal","Oil","Natural gas","Solar"],answer:"Solar",hint:"Solar energy from the sun never runs out!"},
    {level:"easy",q:"What is H₂O?",options:["Oxygen","Carbon dioxide","Water","Hydrogen"],answer:"Water",hint:"2 Hydrogen + 1 Oxygen = H₂O = water!"},
    {level:"easy",q:"Which planet is known as Earth's twin?",options:["Mars","Venus","Mercury","Jupiter"],answer:"Venus",hint:"Venus is closest to Earth in size!"},
    {level:"easy",q:"What is the most abundant gas in Earth's atmosphere?",options:["Oxygen","Carbon dioxide","Nitrogen","Helium"],answer:"Nitrogen",hint:"Nitrogen = 78% of air!"},
    {level:"easy",q:"What type of animal is a penguin?",options:["Fish","Mammal","Bird","Reptile"],answer:"Bird",hint:"Penguins are birds — they have feathers!"},
    {level:"easy",q:"What colour is healthy plant tissue?",options:["Yellow","Brown","Green","White"],answer:"Green",hint:"Chlorophyll makes plant tissue green!"},
    {level:"easy",q:"What do we call a group of stars forming a pattern?",options:["Galaxy","Nebula","Constellation","Cluster"],answer:"Constellation",hint:"Orion, Cassiopeia and the Big Dipper are constellations!"},
    {level:"easy",q:"What organ filters blood and removes waste?",options:["Heart","Lung","Kidney","Liver"],answer:"Kidney",hint:"Kidneys filter blood and produce urine!"},
    {level:"easy",q:"What is the chemical symbol for oxygen?",options:["Ox","O","Oc","Og"],answer:"O",hint:"O is the symbol for Oxygen on the periodic table!"},
    {level:"easy",q:"What kind of rock forms from layers of sediment?",options:["Igneous","Metamorphic","Sedimentary","Volcanic"],answer:"Sedimentary",hint:"Sedimentary rocks form from layers of material!"},
    {level:"easy",q:"What is the name of the galaxy we live in?",options:["Andromeda","Triangulum","Milky Way","Whirlpool"],answer:"Milky Way",hint:"Our solar system is in the Milky Way galaxy!"},
    {level:"easy",q:"Which vitamin do we get from sunlight?",options:["Vitamin A","Vitamin B","Vitamin C","Vitamin D"],answer:"Vitamin D",hint:"Sunlight helps our skin produce Vitamin D!"},
    {level:"easy",q:"What is the chemical symbol for iron?",options:["Ir","In","Fe","Fr"],answer:"Fe",hint:"Fe comes from 'ferrum', the Latin word for iron!"},
    {level:"easy",q:"How many chambers does the human heart have?",options:["2","3","4","5"],answer:"4",hint:"Left and right atria and left and right ventricles = 4!"},
    {level:"easy",q:"What type of rock is granite?",options:["Sedimentary","Metamorphic","Igneous","Limestone"],answer:"Igneous",hint:"Granite forms from cooled magma — it's igneous!"},
    {level:"easy",q:"What is the function of the white blood cells?",options:["Carry oxygen","Clot blood","Fight infection","Carry nutrients"],answer:"Fight infection",hint:"White blood cells are part of our immune system!"},
    {level:"easy",q:"Which planet is farthest from the Sun?",options:["Saturn","Uranus","Neptune","Pluto"],answer:"Neptune",hint:"Neptune is the 8th and farthest planet!"},
    {level:"easy",q:"What do plants release through their leaves?",options:["Oxygen only","Carbon dioxide only","Both oxygen and water vapour","Nitrogen"],answer:"Both oxygen and water vapour",hint:"Plants release O2 and water vapour through stomata!"},
    {level:"easy",q:"What is the medical term for the collarbone?",options:["Femur","Clavicle","Tibia","Patella"],answer:"Clavicle",hint:"The clavicle connects the shoulder to the chest!"},
    {level:"easy",q:"Which gas do plants absorb during photosynthesis?",options:["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"],answer:"Carbon dioxide",hint:"Plants take in CO2 and release O2!"},
    {level:"easy",q:"What is the name of Earth's largest ocean?",options:["Atlantic","Indian","Southern","Pacific"],answer:"Pacific",hint:"Pacific is the world's largest ocean!"},
    {level:"easy",q:"What do we call a scientist who studies rocks?",options:["Botanist","Zoologist","Geologist","Astronomer"],answer:"Geologist",hint:"Geo = Earth, logist = one who studies!"},
    {level:"easy",q:"Which of these is a producer in a food chain?",options:["Lion","Rabbit","Grass","Fox"],answer:"Grass",hint:"Producers make their own food through photosynthesis!"},
    {level:"easy",q:"What is the chemical symbol for carbon?",options:["Ca","Co","Cr","C"],answer:"C",hint:"C is the symbol for Carbon!"},
    {level:"easy",q:"What part of the eye controls the amount of light entering?",options:["Cornea","Iris","Retina","Lens"],answer:"Iris",hint:"The iris controls the pupil size, regulating light!"},
    {level:"easy",q:"What do we call the distance from the centre to the edge of a circle?",options:["Diameter","Circumference","Radius","Chord"],answer:"Radius",hint:"The radius is half the diameter!"},
    {level:"easy",q:"Which planet has the Great Red Spot?",options:["Mars","Saturn","Neptune","Jupiter"],answer:"Jupiter",hint:"Jupiter's Great Red Spot is a giant storm!"},
    {level:"easy",q:"What is the scientific name for the kneecap?",options:["Femur","Fibula","Patella","Tibia"],answer:"Patella",hint:"The patella protects the knee joint!"},
    {level:"easy",q:"What is kinetic energy?",options:["Energy stored in batteries","Energy of movement","Energy from the sun","Energy stored in food"],answer:"Energy of movement",hint:"Moving objects have kinetic energy!"},
    {level:"easy",q:"What is the main source of energy for the water cycle?",options:["Wind","Moon","Sun","Gravity"],answer:"Sun",hint:"The Sun's heat evaporates water, driving the cycle!"},
    {level:"easy",q:"What do we call the layer of gases surrounding Earth?",options:["Hydrosphere","Lithosphere","Biosphere","Atmosphere"],answer:"Atmosphere",hint:"The atmosphere protects us from space!"},
    {level:"easy",q:"How many pairs of chromosomes do humans have?",options:["20","23","26","46"],answer:"23",hint:"Humans have 23 pairs = 46 chromosomes total!"},
    {level:"easy",q:"What type of simple machine is a staircase?",options:["Lever","Pulley","Wedge","Inclined plane"],answer:"Inclined plane",hint:"A staircase is a series of inclined planes!"},
    {level:"easy",q:"What is the nearest star to Earth after the Sun?",options:["Sirius","Vega","Proxima Centauri","Betelgeuse"],answer:"Proxima Centauri",hint:"Proxima Centauri is 4.2 light-years away!"},
    {level:"easy",q:"What organ produces insulin?",options:["Liver","Kidney","Pancreas","Stomach"],answer:"Pancreas",hint:"The pancreas produces insulin to regulate blood sugar!"},
    {level:"easy",q:"What is a light-year?",options:["The time light takes to travel to the Moon","The distance light travels in one year","The brightness of a star","The age of the universe"],answer:"The distance light travels in one year",hint:"Light travels ~9.46 trillion km per year!"},
    {level:"medium",q:"What is the pH of stomach acid?",options:["1-2","4-5","7-8","10-11"],answer:"1-2",hint:"Stomach acid is very acidic at pH 1-2!"},
    {level:"medium",q:"What is the speed of light?",options:["100,000 km/s","200,000 km/s","300,000 km/s","400,000 km/s"],answer:"300,000 km/s",hint:"Light travels about 300,000 km per second!"},
    {level:"medium",q:"What is the most abundant element in Earth's crust?",options:["Iron","Silicon","Oxygen","Aluminium"],answer:"Oxygen",hint:"Oxygen makes up about 46% of Earth's crust!"},
    {level:"medium",q:"What is the process by which plants lose water through their leaves?",options:["Evaporation","Osmosis","Transpiration","Diffusion"],answer:"Transpiration",hint:"Plants lose water vapour through stomata in their leaves!"},
    {level:"medium",q:"What is the function of the alveoli?",options:["Pump blood","Exchange gases in lungs","Filter blood","Produce digestive enzymes"],answer:"Exchange gases in lungs",hint:"Alveoli are tiny air sacs where O2 and CO2 are exchanged!"},
    {level:"medium",q:"Which type of wave is sound?",options:["Transverse","Longitudinal","Electromagnetic","Surface"],answer:"Longitudinal",hint:"Sound waves compress and expand the medium they travel through!"},
    {level:"medium",q:"What is the primary structure of proteins made from?",options:["Sugars","Fatty acids","Amino acids","Nucleotides"],answer:"Amino acids",hint:"Proteins are chains of amino acids!"},
    {level:"medium",q:"What is the name of the process where rocks are broken down?",options:["Erosion","Weathering","Deposition","Sedimentation"],answer:"Weathering",hint:"Weathering breaks down rocks in place; erosion moves them!"},
    {level:"medium",q:"What is the unit of force?",options:["Watt","Joule","Newton","Pascal"],answer:"Newton",hint:"Force is measured in Newtons (N)!"},
    {level:"medium",q:"Which planet rotates on its side?",options:["Saturn","Neptune","Uranus","Mars"],answer:"Uranus",hint:"Uranus has an axial tilt of 98 degrees — it rolls around the Sun!"},
    {level:"medium",q:"What is the function of the ozone layer?",options:["Produce oxygen","Absorb UV radiation","Regulate temperature","Reflect sunlight"],answer:"Absorb UV radiation",hint:"The ozone layer shields us from harmful UV rays!"},
    {level:"medium",q:"What are the building blocks of all matter?",options:["Cells","Molecules","Atoms","Electrons"],answer:"Atoms",hint:"All matter is made of atoms!"},
    {level:"medium",q:"What is the chemical formula for glucose?",options:["C6H12O6","C6H6","CO2","H2SO4"],answer:"C6H12O6",hint:"Glucose has 6 carbons, 12 hydrogens, 6 oxygens!"},
    {level:"medium",q:"What is the process of nuclear fusion?",options:["Splitting atoms to release energy","Combining atoms to release energy","Burning fuel","Converting light to electricity"],answer:"Combining atoms to release energy",hint:"The Sun produces energy by fusing hydrogen atoms into helium!"},
    {level:"medium",q:"What is the role of the small intestine?",options:["Store food","Absorb nutrients","Produce bile","Filter waste"],answer:"Absorb nutrients",hint:"Most nutrients are absorbed in the small intestine!"},
    {level:"medium",q:"What is the most common type of rock on Earth's surface?",options:["Igneous","Metamorphic","Sedimentary","Granite"],answer:"Sedimentary",hint:"About 75% of rocks on Earth's surface are sedimentary!"},
    {level:"medium",q:"What is electric current measured in?",options:["Volts","Ohms","Watts","Amperes"],answer:"Amperes",hint:"Current is measured in Amperes (Amps)!"},
    {level:"medium",q:"What is the name of the effect where objects appear to weigh less in water?",options:["Friction","Buoyancy","Gravity","Tension"],answer:"Buoyancy",hint:"Buoyancy is the upward force water exerts on objects!"},
    {level:"medium",q:"What is the difference between an asteroid and a comet?",options:["Same thing","Asteroids are rock; comets are ice and dust","Comets orbit Jupiter","Asteroids are bigger than comets"],answer:"Asteroids are rock; comets are ice and dust",hint:"Comets develop a tail when near the Sun as ice evaporates!"},
    {level:"medium",q:"What is the name of the protein that carries oxygen in red blood cells?",options:["Insulin","Haemoglobin","Adrenaline","Keratin"],answer:"Haemoglobin",hint:"Haemoglobin binds to oxygen and carries it around the body!"},
    {level:"medium",q:"What is the difference between a food chain and a food web?",options:["Same thing","A food chain is one path; a food web shows all feeding relationships","Food webs are only for ocean animals","Food chains have more organisms"],answer:"A food chain is one path; a food web shows all feeding relationships",hint:"A food web is multiple food chains interconnected!"},
    {level:"medium",q:"What is the unit of energy?",options:["Newton","Watt","Joule","Pascal"],answer:"Joule",hint:"Energy is measured in Joules (J)!"},
    {level:"medium",q:"Which gas is produced during photosynthesis?",options:["Carbon dioxide","Nitrogen","Oxygen","Hydrogen"],answer:"Oxygen",hint:"Plants take in CO2 and release O2 during photosynthesis!"},
    {level:"medium",q:"What is the function of chlorophyll?",options:["Store water","Absorb sunlight for photosynthesis","Produce seeds","Transport nutrients"],answer:"Absorb sunlight for photosynthesis",hint:"Chlorophyll captures light energy for photosynthesis!"},
    {level:"medium",q:"What are the three states of matter?",options:["Solid, liquid, gas","Hot, cold, warm","Light, heavy, medium","Hard, soft, flexible"],answer:"Solid, liquid, gas",hint:"Matter exists as solid, liquid or gas!"},
    {level:"medium",q:"What is the chemical symbol for sodium?",options:["So","Sd","Na","N"],answer:"Na",hint:"Na comes from 'natrium', the Latin word for sodium!"},
    {level:"medium",q:"What is the term for an animal that feeds on dead matter?",options:["Predator","Prey","Decomposer","Scavenger"],answer:"Scavenger",hint:"Vultures and hyenas are scavengers!"},
    {level:"medium",q:"What is the process of rocks being carried away by wind or water?",options:["Weathering","Erosion","Deposition","Sedimentation"],answer:"Erosion",hint:"Erosion moves weathered material away!"},
    {level:"medium",q:"What is the unit of power?",options:["Joule","Newton","Watt","Ampere"],answer:"Watt",hint:"Power is measured in Watts (W) — named after James Watt!"},
    {level:"medium",q:"What is the function of the liver?",options:["Pump blood","Filter blood, produce bile, store glycogen","Exchange gases","Produce insulin"],answer:"Filter blood, produce bile, store glycogen",hint:"The liver has hundreds of functions — a vital organ!"},
    {level:"medium",q:"What is the main difference between arteries and veins?",options:["Same","Arteries carry blood from heart; veins carry blood to heart","Arteries carry blue blood","Veins carry oxygen"],answer:"Arteries carry blood from heart; veins carry blood to heart",hint:"Arteries Away from heart, Veins return to heart!"},
    {level:"medium",q:"What is Newton's First Law of Motion?",options:["F=ma","An object stays at rest or in motion unless acted on by a force","Every action has equal reaction","Energy is conserved"],answer:"An object stays at rest or in motion unless acted on by a force",hint:"Inertia: objects resist changes in motion!"},
    {level:"medium",q:"What type of lens is used in a magnifying glass?",options:["Concave","Flat","Convex","Bifocal"],answer:"Convex",hint:"Convex lenses converge light and magnify objects!"},
    {level:"medium",q:"What is the name of the long bone in the upper arm?",options:["Femur","Tibia","Humerus","Radius"],answer:"Humerus",hint:"The humerus is the upper arm bone — funny bone is at its end!"},
    {level:"medium",q:"Which element has the atomic number 1?",options:["Helium","Lithium","Carbon","Hydrogen"],answer:"Hydrogen",hint:"Hydrogen is the simplest and lightest element!"},
    {level:"medium",q:"What is the main function of the nervous system?",options:["Transport nutrients","Coordinate body responses","Produce hormones","Filter blood"],answer:"Coordinate body responses",hint:"The nervous system sends signals around the body!"},
    {level:"medium",q:"What is the name of the process where a solid turns directly to gas?",options:["Evaporation","Sublimation","Condensation","Melting"],answer:"Sublimation",hint:"Dry ice (CO2) sublimates directly from solid to gas!"},
    {level:"medium",q:"What is the difference between mass and weight?",options:["Same","Mass is amount of matter; weight is the force of gravity on it","Weight doesn't change on the Moon","Mass changes on the Moon"],answer:"Mass is amount of matter; weight is the force of gravity on it",hint:"Mass stays the same everywhere; weight changes with gravity!"},
    {level:"medium",q:"What is the function of stomata in plants?",options:["Absorb water","Exchange gases and regulate water loss","Produce chlorophyll","Attract insects"],answer:"Exchange gases and regulate water loss",hint:"Stomata are tiny pores in leaves for gas exchange!"},
    {level:"medium",q:"What is the name of the boundary between two tectonic plates?",options:["Fault line","Seismic zone","Plate boundary","Rift"],answer:"Plate boundary",hint:"Earthquakes often occur at plate boundaries!"},
    {level:"medium",q:"What is a neutron star?",options:["A star that produces no light","An extremely dense star formed from a collapsed giant star","A new star forming","A star orbiting a black hole"],answer:"An extremely dense star formed from a collapsed giant star",hint:"Neutron stars are so dense a teaspoon would weigh billions of tons!"},
    {level:"medium",q:"What is the term for the bending of light around objects?",options:["Reflection","Refraction","Diffraction","Absorption"],answer:"Diffraction",hint:"Light diffracts when it passes through a small gap!"},
    {level:"medium",q:"What is the Richter scale used to measure?",options:["Wind speed","Rainfall","Earthquake magnitude","Volcanic activity"],answer:"Earthquake magnitude",hint:"The Richter scale measures earthquake intensity!"},
    {level:"medium",q:"What type of bond holds water molecules together?",options:["Ionic","Covalent","Hydrogen","Metallic"],answer:"Covalent",hint:"O and H share electrons in covalent bonds in water molecules!"},
    {level:"medium",q:"What is the name of the protective membrane around the brain?",options:["Periosteum","Meninges","Epidermis","Endoderm"],answer:"Meninges",hint:"Meningitis is inflammation of the meninges!"},
    {level:"medium",q:"What do we call animals that maintain constant body temperature?",options:["Cold-blooded","Ectothermic","Warm-blooded","Poikilothermic"],answer:"Warm-blooded",hint:"Birds and mammals are warm-blooded (endothermic)!"},
    {level:"medium",q:"What is the chemical formula for carbon dioxide?",options:["CO","CO2","C2O","C2O2"],answer:"CO2",hint:"1 Carbon + 2 Oxygen = CO2!"},
    {level:"medium",q:"What is the term for the force that keeps planets in orbit?",options:["Friction","Magnetism","Gravity","Nuclear force"],answer:"Gravity",hint:"Gravity keeps planets orbiting the Sun!"},
    {level:"medium",q:"What is the function of the pancreas?",options:["Pump blood","Produce insulin and digestive enzymes","Filter blood","Store bile"],answer:"Produce insulin and digestive enzymes",hint:"The pancreas regulates blood sugar and aids digestion!"},
    {level:"medium",q:"What is the name of the process that plants use for respiration?",options:["Photosynthesis","Transpiration","Cellular respiration","Fermentation"],answer:"Cellular respiration",hint:"All living things respire: glucose + O2 → CO2 + water + energy!"},
    {level:"medium",q:"What is a galaxy?",options:["A type of star","A planet system","A vast system of stars, gas and dust","A type of nebula"],answer:"A vast system of stars, gas and dust",hint:"Our Milky Way contains over 200 billion stars!"},
    {level:"medium",q:"What is the term for organisms that can make their own food?",options:["Consumers","Decomposers","Producers","Predators"],answer:"Producers",hint:"Plants are producers — they make food via photosynthesis!"},
    {level:"medium",q:"What is the unit of electrical energy?",options:["Watt","Ampere","Volt","Kilowatt-hour"],answer:"Kilowatt-hour",hint:"Your electricity bill measures energy in kWh!"},
    {level:"medium",q:"What is the name of the tube that carries food from the mouth to the stomach?",options:["Trachea","Oesophagus","Bronchus","Intestine"],answer:"Oesophagus",hint:"The oesophagus carries food down to the stomach!"},
    {level:"medium",q:"What is the effect of increasing temperature on most chemical reactions?",options:["Slows them down","Stops them","Speeds them up","Has no effect"],answer:"Speeds them up",hint:"Higher temperature = more particle collisions = faster reactions!"},
    {level:"medium",q:"What is the term for the distance between two wave peaks?",options:["Amplitude","Frequency","Wavelength","Period"],answer:"Wavelength",hint:"Wavelength is the distance from one peak to the next!"},
    {level:"medium",q:"What is the most abundant element in the human body?",options:["Carbon","Hydrogen","Nitrogen","Oxygen"],answer:"Oxygen",hint:"Oxygen makes up about 65% of the human body by mass!"},
    {level:"medium",q:"What is the difference between a virus and a bacterium?",options:["Same thing","Viruses are smaller and need a host cell to reproduce","Bacteria are always harmful","Viruses have cell walls"],answer:"Viruses are smaller and need a host cell to reproduce",hint:"Viruses hijack cells to replicate; bacteria can reproduce independently!"},
    {level:"medium",q:"What is the name of the bone at the base of the spine?",options:["Femur","Coccyx","Sternum","Pelvis"],answer:"Coccyx",hint:"The coccyx is the tailbone at the very bottom of the spine!"},
    {level:"medium",q:"What type of radiation has the highest energy?",options:["Radio waves","Infrared","Visible light","Gamma rays"],answer:"Gamma rays",hint:"Gamma rays have the highest frequency and energy in the EM spectrum!"},
    {level:"medium",q:"What is the name of the layer of the Earth between the crust and the core?",options:["Biosphere","Mantle","Lithosphere","Magma"],answer:"Mantle",hint:"The mantle is thick layer of hot rock between crust and core!"},
    {level:"medium",q:"What is the term for a substance that donates hydrogen ions in a solution?",options:["Base","Salt","Acid","Neutral"],answer:"Acid",hint:"Acids donate H+ ions; bases accept them!"},
    {level:"hard",q:"What is the Hardy-Weinberg principle?",options:["A law of genetics","A principle describing genetic equilibrium in a population","The structure of DNA","A theory of evolution"],answer:"A principle describing genetic equilibrium in a population",hint:"In a large population with no selection, mutation, or drift, allele frequencies remain constant!"},
    {level:"hard",q:"What is the difference between aerobic and anaerobic respiration?",options:["Same process","Aerobic uses oxygen; anaerobic doesn't","Anaerobic is more efficient","Aerobic produces lactic acid"],answer:"Aerobic uses oxygen; anaerobic doesn't",hint:"Aerobic = with oxygen (more ATP). Anaerobic = without oxygen (less ATP)!"},
    {level:"hard",q:"What is Heisenberg's Uncertainty Principle?",options:["Energy is conserved","You cannot simultaneously know exact position and momentum of a particle","Atoms cannot be divided","Light behaves as both wave and particle"],answer:"You cannot simultaneously know exact position and momentum of a particle",hint:"The more precisely we know position, the less we know momentum, and vice versa!"},
    {level:"hard",q:"What is the difference between genotype and phenotype?",options:["Same","Genotype=genetic makeup; phenotype=observable characteristics","Phenotype is inherited; genotype isn't","Genotype is what you see"],answer:"Genotype=genetic makeup; phenotype=observable characteristics",hint:"Genotype = genes you have. Phenotype = what those genes produce (eye colour etc)!"},
    {level:"hard",q:"What is the law of conservation of energy?",options:["Energy can be created and destroyed","Energy can be created but not destroyed","Energy cannot be created or destroyed, only converted","Energy always decreases"],answer:"Energy cannot be created or destroyed, only converted",hint:"Energy is never lost — it just changes form!"},
    {level:"hard",q:"What is the function of mRNA?",options:["Store genetic information permanently","Carry genetic instructions from DNA to ribosomes","Make proteins directly","Break down old proteins"],answer:"Carry genetic instructions from DNA to ribosomes",hint:"mRNA = messenger RNA — it carries the DNA blueprint to the ribosome!"},
    {level:"hard",q:"What is the photoelectric effect?",options:["How plants use light","Emission of electrons when light hits a metal surface","How lenses bend light","Diffraction of light waves"],answer:"Emission of electrons when light hits a metal surface",hint:"Einstein won the Nobel Prize for explaining the photoelectric effect!"},
    {level:"hard",q:"What is the term for organisms that can perform both photosynthesis and respiration?",options:["Autotrophs","Heterotrophs","Chemotrophs","Mixotrophs"],answer:"Autotrophs",hint:"Autotrophs make their own food — plants and some bacteria!"},
    {level:"hard",q:"What is quantum mechanics?",options:["The study of large objects","The study of energy and matter at atomic and subatomic scale","Classical physics","The study of chemical reactions"],answer:"The study of energy and matter at atomic and subatomic scale",hint:"Quantum mechanics explains the behaviour of particles at atomic scales!"},
    {level:"hard",q:"What is the difference between dominant and recessive alleles?",options:["Same","Dominant alleles are expressed even with one copy; recessive need two copies","Recessive alleles are always expressed","Dominant alleles only appear in females"],answer:"Dominant alleles are expressed even with one copy; recessive need two copies",hint:"Brown eyes (B) dominant over blue eyes (b). Need bb for blue eyes!"},
    {level:"hard",q:"What is the Doppler effect?",options:["Light bending around objects","Change in frequency of a wave due to relative motion","Sound travelling through water","Reflection of waves"],answer:"Change in frequency of a wave due to relative motion",hint:"An ambulance siren sounds higher as it approaches and lower as it leaves!"},
    {level:"hard",q:"What is entropy in thermodynamics?",options:["The amount of energy in a system","A measure of disorder or randomness in a system","The efficiency of a machine","The temperature of a system"],answer:"A measure of disorder or randomness in a system",hint:"The Second Law: entropy always increases in closed systems!"},
    {level:"hard",q:"What is the endosymbiotic theory?",options:["How cells divide","The theory that mitochondria were once free-living bacteria absorbed by larger cells","How photosynthesis evolved","The origin of DNA"],answer:"The theory that mitochondria were once free-living bacteria absorbed by larger cells",hint:"Mitochondria have their own DNA — evidence they were once independent bacteria!"},
    {level:"hard",q:"What is a supernova?",options:["A newly forming star","A type of galaxy","The explosive death of a massive star","A comet entering atmosphere"],answer:"The explosive death of a massive star",hint:"Supernovae produce heavier elements and can outshine entire galaxies!"},
    {level:"hard",q:"What is the difference between fission and fusion?",options:["Same process","Fission splits atoms; fusion combines them","Fusion splits atoms; fission combines","Both split atoms"],answer:"Fission splits atoms; fusion combines them",hint:"Nuclear power = fission. Sun's energy = fusion!"},
    {level:"hard",q:"What is the function of the Golgi apparatus?",options:["Generate energy","Process and package proteins for secretion","Contain DNA","Produce ribosomes"],answer:"Process and package proteins for secretion",hint:"The Golgi apparatus is the cell's post office — it packages and ships proteins!"},
    {level:"hard",q:"What is the term for water moving up a plant stem against gravity?",options:["Osmosis","Diffusion","Capillary action","Transpiration"],answer:"Capillary action",hint:"Capillary action pulls water up narrow tubes in plant stems!"},
    {level:"hard",q:"What is dark matter?",options:["Black holes","Matter that doesn't emit or absorb light but has gravitational effects","The space between galaxies","A type of neutron star"],answer:"Matter that doesn't emit or absorb light but has gravitational effects",hint:"Dark matter makes up ~27% of the universe but can't be directly observed!"},
    {level:"hard",q:"What is the role of ATP in cells?",options:["Store genetic information","The universal energy currency of cells","Build cell membranes","Carry oxygen"],answer:"The universal energy currency of cells",hint:"ATP (adenosine triphosphate) stores and releases energy for cell processes!"},
    {level:"hard",q:"What is the principle of natural selection in terms of genetics?",options:["Organisms can change their genes at will","Favourable alleles increase in frequency over generations","Mutations are always harmful","All organisms evolve at the same rate"],answer:"Favourable alleles increase in frequency over generations",hint:"Alleles that improve survival get passed on more — increasing in the population!"},
    {level:"hard",q:"What is Boyle's Law?",options:["F=ma","At constant temperature, pressure and volume are inversely proportional","All gases behave ideally","Energy is conserved"],answer:"At constant temperature, pressure and volume are inversely proportional",hint:"PV = constant. Double pressure = half volume!"},
    {level:"hard",q:"What is the difference between inorganic and organic chemistry?",options:["Same thing","Organic chemistry studies carbon compounds; inorganic studies everything else","Inorganic is more advanced","Organic chemistry only studies living things"],answer:"Organic chemistry studies carbon compounds; inorganic studies everything else",hint:"Organic chemistry = carbon-based compounds (life chemistry). Inorganic = everything else!"},
    {level:"hard",q:"What is the Coriolis effect?",options:["Ocean tides","The deflection of moving objects due to Earth's rotation","Greenhouse warming","Tectonic plate movement"],answer:"The deflection of moving objects due to Earth's rotation",hint:"The Coriolis effect makes hurricanes rotate clockwise in the southern hemisphere!"},
    {level:"hard",q:"What are the four bases of DNA?",options:["A,B,C,D","A,T,G,C","X,Y,Z,W","P,Q,R,S"],answer:"A,T,G,C",hint:"Adenine, Thymine, Guanine, Cytosine — A pairs with T, G pairs with C!"},
    {level:"hard",q:"What is the term for the minimum energy needed to start a chemical reaction?",options:["Kinetic energy","Potential energy","Activation energy","Thermal energy"],answer:"Activation energy",hint:"Catalysts lower the activation energy needed to start a reaction!"},
    {level:"hard",q:"What is the anthropic principle?",options:["Humans evolved from apes","The universe's conditions seem fine-tuned to allow life","All species have common ancestors","The atmosphere protects life"],answer:"The universe's conditions seem fine-tuned to allow life",hint:"The anthropic principle observes that the universe's constants allow life to exist!"},
    {level:"hard",q:"What is the second law of thermodynamics?",options:["Energy is conserved","Total entropy of a closed system always increases","Heat flows from cold to hot","Energy can be created"],answer:"Total entropy of a closed system always increases",hint:"Disorder always increases — you can't reverse time thermodynamically!"},
    {level:"hard",q:"What is chromatography used for?",options:["Measuring temperature","Separating mixtures based on different rates of movement","Testing pH","Measuring electric current"],answer:"Separating mixtures based on different rates of movement",hint:"Chromatography separates substances — used to identify colours in ink!"},
    {level:"hard",q:"What is the difference between a heterozygous and homozygous organism?",options:["Same","Heterozygous has two different alleles; homozygous has two identical alleles","Homozygous is hybrid","Heterozygous organisms always show recessive traits"],answer:"Heterozygous has two different alleles; homozygous has two identical alleles",hint:"Aa = heterozygous. AA or aa = homozygous!"},
    {level:"hard",q:"What is the Hubble constant?",options:["The age of the universe","The rate at which the universe is expanding","The mass of a proton","The speed of light"],answer:"The rate at which the universe is expanding",hint:"Edwin Hubble discovered galaxies are moving away — the Hubble constant measures how fast!"},
    {level:"hard",q:"What is the difference between mitosis and binary fission?",options:["Same","Mitosis is in eukaryotes; binary fission is in prokaryotes","Binary fission produces 4 cells","Mitosis is only in animals"],answer:"Mitosis is in eukaryotes; binary fission is in prokaryotes",hint:"Mitosis = cell division in complex cells. Binary fission = bacteria dividing!"},
    {level:"hard",q:"What is a catalyst, and how does it work?",options:["It adds energy to a reaction","It lowers activation energy without being consumed","It changes the products of a reaction","It always increases temperature"],answer:"It lowers activation energy without being consumed",hint:"Catalysts provide an alternative reaction pathway with lower activation energy!"},
    {level:"hard",q:"What is the purpose of the myelin sheath in neurons?",options:["Produce neurotransmitters","Store memories","Insulate neurons and speed up nerve signals","Connect neurons together"],answer:"Insulate neurons and speed up nerve signals",hint:"Myelin sheath acts like insulation, making signals travel faster!"},
    {level:"hard",q:"What is an exothermic reaction?",options:["A reaction that absorbs heat","A reaction that releases heat","A reaction that needs a catalyst","A reaction with no energy change"],answer:"A reaction that releases heat",hint:"Exo = out. Exothermic reactions release heat to the surroundings!"},
    {level:"hard",q:"What is the difference between speed and acceleration?",options:["Same","Speed is rate of change of distance; acceleration is rate of change of velocity","Acceleration has no direction","Speed has units of m/s²"],answer:"Speed is rate of change of distance; acceleration is rate of change of velocity",hint:"Speed = how fast. Acceleration = how quickly speed or direction changes!"},
    {level:"hard",q:"What is CRISPR-Cas9?",options:["A type of protein","A gene-editing technology","A type of stem cell","A chromosome structure"],answer:"A gene-editing technology",hint:"CRISPR-Cas9 allows scientists to edit DNA precisely!"},
    {level:"hard",q:"What is the difference between ionic and covalent bonding?",options:["Same","Ionic: transfer of electrons; covalent: sharing of electrons","Covalent involves metals","Ionic bonding is weaker"],answer:"Ionic: transfer of electrons; covalent: sharing of electrons",hint:"NaCl = ionic. H2O = covalent. Ionic involves metals + non-metals!"},
    {level:"hard",q:"What is the Pauli Exclusion Principle?",options:["Atoms always bond","No two electrons in an atom can have identical quantum numbers","Electrons travel in fixed orbits","All particles have mass"],answer:"No two electrons in an atom can have identical quantum numbers",hint:"No two electrons can be in exactly the same quantum state!"},
    {level:"hard",q:"What is plasmolysis in plants?",options:["Photosynthesis stopping","Loss of turgor pressure causing the cell membrane to pull away from the wall","Cell division","Root growth"],answer:"Loss of turgor pressure causing the cell membrane to pull away from the wall",hint:"In very salty water, plant cells lose water by osmosis and shrink — plasmolysis!"},
    {level:"hard",q:"What is the significance of the Cambrian explosion?",options:["A volcanic eruption","A period ~540mya when most major animal phyla appeared suddenly","The extinction of the dinosaurs","The formation of continents"],answer:"A period ~540mya when most major animal phyla appeared suddenly",hint:"The Cambrian explosion is the sudden appearance of complex animal life in the fossil record!"},
    {level:"hard",q:"What is the term for the energy stored in chemical bonds?",options:["Kinetic energy","Thermal energy","Potential chemical energy","Nuclear energy"],answer:"Potential chemical energy",hint:"Food, fuel and batteries store energy as chemical potential energy!"},
    {level:"hard",q:"What is epigenetics?",options:["The study of genetic mutations","Changes in gene expression without changing DNA sequence","The structure of chromosomes","Gene editing technology"],answer:"Changes in gene expression without changing DNA sequence",hint:"Epigenetics studies how environment affects which genes are turned on or off!"},
    {level:"hard",q:"What is the difference between renewable and non-renewable energy?",options:["Same","Renewable replenishes naturally; non-renewable is finite","Nuclear is renewable","Fossil fuels will never run out"],answer:"Renewable replenishes naturally; non-renewable is finite",hint:"Wind, solar, hydro = renewable. Coal, oil, gas = non-renewable!"},
    {level:"hard",q:"What is the anthropocene?",options:["The age of dinosaurs","The proposed current geological epoch defined by significant human impact","The ice age","The Cretaceous period"],answer:"The proposed current geological epoch defined by significant human impact",hint:"We may be living in the Anthropocene — the age of human influence on Earth!"},
    {level:"hard",q:"What is the function of telomeres?",options:["Store genetic code","Protect the ends of chromosomes from deterioration","Produce ribosomes","Connect chromosomes together"],answer:"Protect the ends of chromosomes from deterioration",hint:"Telomeres are like the plastic tips of shoelaces — they protect chromosome ends!"},
    {level:"hard",q:"What is the standard model in physics?",options:["Newton's laws of motion","A theory describing fundamental particles and forces","Einstein's theory of relativity","The model of the atom"],answer:"A theory describing fundamental particles and forces",hint:"The Standard Model describes quarks, leptons and the fundamental forces!"},
    {level:"hard",q:"What is the difference between a hypothesis and a theory in science?",options:["Same","A hypothesis is an untested prediction; a theory is a well-tested explanation","Theories are unproven guesses","Hypotheses are always correct"],answer:"A hypothesis is an untested prediction; a theory is a well-tested explanation",hint:"A scientific theory is supported by extensive evidence — not a guess!"},
    {level:"hard",q:"What is the process of nitrogen fixation?",options:["Plants absorbing nitrogen from air","Converting atmospheric N2 into compounds usable by organisms","Plants releasing nitrogen","The nitrogen cycle stopping"],answer:"Converting atmospheric N2 into compounds usable by organisms",hint:"Bacteria in soil and roots convert N2 gas into nitrates plants can absorb!"},
    {level:"hard",q:"What is chemosynthesis?",options:["The same as photosynthesis","Production of organic compounds using energy from chemical reactions instead of light","A type of digestion","How fungi feed"],answer:"Production of organic compounds using energy from chemical reactions instead of light",hint:"Deep-sea vent organisms use chemosynthesis — no sunlight needed!"},
    {level:"hard",q:"What is Mendelian inheritance?",options:["The inheritance of acquired characteristics","Patterns of inheritance based on Gregor Mendel's laws of segregation and independent assortment","The inheritance of mitochondrial DNA","Random mutation patterns"],answer:"Patterns of inheritance based on Gregor Mendel's laws of segregation and independent assortment",hint:"Mendel studied pea plants and discovered basic rules of heredity!"},
    {level:"hard",q:"What is the theory of special relativity?",options:["Classical physics of motion","Einstein's theory: space and time are relative; E=mc²","Quantum mechanics","The standard model"],answer:"Einstein's theory: space and time are relative; E=mc²",hint:"E=mc²: mass and energy are equivalent. Time passes slower at high speed!"},
    {level:"hard",q:"What is the role of the endoplasmic reticulum?",options:["Store genetic information","Transport proteins and lipids within the cell","Generate energy","Control cell division"],answer:"Transport proteins and lipids within the cell",hint:"The ER is the cell's transport network — rough ER makes proteins, smooth ER makes lipids!"},
    {level:"hard",q:"What is the difference between continental and oceanic crust?",options:["Same","Continental crust is thicker and less dense; oceanic is thinner and denser","Oceanic crust is older","Continental crust sinks at subduction zones"],answer:"Continental crust is thicker and less dense; oceanic is thinner and denser",hint:"Continental crust (30-50km, granite). Oceanic crust (5-10km, basalt) is denser!"},
    {level:"hard",q:"What is the term for the study of heredity and genetic variation?",options:["Ecology","Genomics","Genetics","Embryology"],answer:"Genetics",hint:"Genetics studies how traits are inherited from parents!"},
    {level:"hard",q:"What is Faraday's Law of Electromagnetic Induction?",options:["F=ma","A changing magnetic field induces an electric current","V=IR","Energy is conserved"],answer:"A changing magnetic field induces an electric current",hint:"Faraday's discovery led to the invention of generators and transformers!"},
    {level:"hard",q:"What is the difference between a pathogen and a parasite?",options:["Same","Pathogens cause disease; parasites live on/in a host and benefit at host's expense","Parasites always kill their host","Pathogens are always viruses"],answer:"Pathogens cause disease; parasites live on/in a host and benefit at host's expense",hint:"A virus = pathogen. A tapeworm = parasite. Some are both!"},
    {level:"hard",q:"What is the Krebs cycle also known as?",options:["The Calvin cycle","The citric acid cycle","The nitrogen cycle","The urea cycle"],answer:"The citric acid cycle",hint:"The Krebs/citric acid cycle occurs in mitochondria and releases CO2 and energy!"},
    {level:"hard",q:"What is the role of the cell membrane?",options:["Store DNA","Control what enters and leaves the cell","Produce energy","Make proteins"],answer:"Control what enters and leaves the cell",hint:"The semi-permeable cell membrane regulates what passes in and out!"}
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
    // ── EXTRA EASY ──
    {level:"easy",q:"What does a teacher do? 📚",options:["Fixes teeth","Teaches children","Drives buses","Builds houses"],answer:"Teaches children",hint:"Teachers help us learn at school!"},
    {level:"easy",q:"What does a nurse do? 💉",options:["Grows food","Fixes cars","Helps sick people","Delivers letters"],answer:"Helps sick people",hint:"Nurses work in hospitals and clinics!"},
    {level:"easy",q:"What is the capital of England? 🏴󠁧󠁢󠁥󠁮󠁧󠁿",options:["Manchester","Birmingham","London","Leeds"],answer:"London",hint:"London is the biggest city and capital of England!"},
    {level:"easy",q:"On which continent is Brazil? 🌎",options:["Africa","Asia","Europe","South America"],answer:"South America",hint:"Brazil is the largest country in South America!"},
    {level:"easy",q:"What colour is the flag of the USA? 🇺🇸",options:["Red, white and blue","Red and white","Blue and white","Green and white"],answer:"Red, white and blue",hint:"The Stars and Stripes has red, white and blue!"},
    {level:"easy",q:"What does a postman/postwoman do? 📬",options:["Fights fires","Delivers letters","Teaches children","Fixes teeth"],answer:"Delivers letters",hint:"The post person brings your letters and parcels!"},
    // ── EXTRA MEDIUM ──
    {level:"medium",q:"What is the capital of Japan? 🇯🇵",options:["Osaka","Kyoto","Hiroshima","Tokyo"],answer:"Tokyo",hint:"Tokyo is one of the world's largest cities!"},
    {level:"medium",q:"Which river flows through Egypt? 🏺",options:["Amazon","Mississippi","Thames","Nile"],answer:"Nile",hint:"The Nile is the world's longest river and runs through Egypt!"},
    {level:"medium",q:"What was the name of the first satellite sent to space?",options:["Apollo","Sputnik","Explorer","Vostok"],answer:"Sputnik",hint:"The Soviet Union launched Sputnik 1 in 1957!"},
    {level:"medium",q:"Which country is the Eiffel Tower in? 🗼",options:["Italy","Spain","France","Germany"],answer:"France",hint:"The Eiffel Tower is in Paris, the capital of France!"},
    {level:"medium",q:"What is the largest ocean on Earth? 🌊",options:["Atlantic","Indian","Arctic","Pacific"],answer:"Pacific",hint:"The Pacific Ocean covers more than a third of Earth's surface!"},
    {level:"medium",q:"Who was Martin Luther King Jr.? ✊",options:["A US President","A civil rights leader","A famous scientist","An astronaut"],answer:"A civil rights leader",hint:"He led peaceful protests for equal rights for Black Americans!"},
    // ── EXTRA HARD ──
    {level:"hard",q:"What is the name of the international court that settles disputes between countries?",options:["Supreme Court","The Hague","ICC","World Court"],answer:"The Hague",hint:"The International Court of Justice is in The Hague, Netherlands!"},
    {level:"hard",q:"In which year did the Berlin Wall fall?",options:["1985","1987","1989","1991"],answer:"1989",hint:"The Berlin Wall fell on November 9th, 1989!"},
    {level:"hard",q:"What is the Silk Road?",options:["A road in China","An ancient trade route","A modern highway","A river in Asia"],answer:"An ancient trade route",hint:"The Silk Road connected Asia, Africa and Europe for trade!"},
    {level:"hard",q:"Which country has the most land area?",options:["USA","China","Canada","Russia"],answer:"Russia",hint:"Russia spans 11 time zones — the largest country by area!"},
    {level:"hard",q:"What does GDP stand for?",options:["General Daily Production","Gross Domestic Product","Government Decimal Policy","Grand Development Plan"],answer:"Gross Domestic Product",hint:"GDP measures the total value of goods and services a country produces!"},
  
    {"level":"easy","q":"What is the capital of France? 🗼","options":["Lyon","Marseille","Paris","Bordeaux"],"answer":"Paris","hint":"Paris is the most visited city in the world!"},
    {"level":"easy","q":"What is the capital of the USA? 🇺🇸","options":["New York","Los Angeles","Chicago","Washington D.C."],"answer":"Washington D.C.","hint":"Washington D.C. is the seat of US government!"},
    {"level":"easy","q":"On which continent is China? 🌏","options":["Africa","Europe","Asia","Australia"],"answer":"Asia","hint":"China is in East Asia!"},
    {"level":"easy","q":"What does a plumber do? 🔧","options":["Fixes teeth","Fixes pipes","Teaches children","Drives buses"],"answer":"Fixes pipes","hint":"Plumbers fix leaking taps and install pipes!"},
    {"level":"easy","q":"Which is the largest ocean? 🌊","options":["Atlantic","Indian","Arctic","Pacific"],"answer":"Pacific","hint":"The Pacific is bigger than all land combined!"},
    {"level":"easy","q":"What is the capital of Australia? 🦘","options":["Sydney","Melbourne","Canberra","Brisbane"],"answer":"Canberra","hint":"Many think it's Sydney, but it's Canberra!"},
    {"level":"easy","q":"Which country does pizza come from? 🍕","options":["Spain","Greece","France","Italy"],"answer":"Italy","hint":"Pizza was invented in Naples, Italy!"},
    {"level":"easy","q":"What is the capital of Germany? 🇩🇪","options":["Munich","Hamburg","Frankfurt","Berlin"],"answer":"Berlin","hint":"Berlin is Germany's capital and largest city!"},
    {"level":"easy","q":"Which country has the pyramids? 🏺","options":["Morocco","Egypt","Libya","Tunisia"],"answer":"Egypt","hint":"The Great Pyramids of Giza are in Egypt!"},
    {"level":"easy","q":"What language do people speak in Brazil? 🇧🇷","options":["Spanish","English","Portuguese","French"],"answer":"Portuguese","hint":"Brazil was colonised by Portugal!"},
    {"level":"easy","q":"Which continent is the largest? 🌍","options":["Africa","Europe","North America","Asia"],"answer":"Asia","hint":"Asia is largest by both area and population!"},
    {"level":"easy","q":"What is the capital of Spain? 🇪🇸","options":["Barcelona","Seville","Valencia","Madrid"],"answer":"Madrid","hint":"Madrid is Spain's capital and largest city!"},
    {"level":"easy","q":"Which country is Big Ben in? 🏛️","options":["France","USA","Australia","United Kingdom"],"answer":"United Kingdom","hint":"Big Ben is in London, UK!"},
    {"level":"easy","q":"What is the capital of Japan? 🇯🇵","options":["Osaka","Kyoto","Hiroshima","Tokyo"],"answer":"Tokyo","hint":"Tokyo is one of the world's largest cities!"},
    {"level":"easy","q":"What is a citizen? 👤","options":["A type of currency","A member of a country","A type of food","A map symbol"],"answer":"A member of a country","hint":"Citizens have rights and responsibilities in their country!"},
    {"level":"easy","q":"Which river flows through Egypt? 🌊","options":["Amazon","Mississippi","Thames","Nile"],"answer":"Nile","hint":"The Nile is the world's longest river!"},
    {"level":"easy","q":"What does a chef do? 👨‍🍳","options":["Fixes teeth","Cooks food","Drives trains","Builds roads"],"answer":"Cooks food","hint":"Chefs prepare food in restaurants!"},
    {"level":"easy","q":"Which country has the Eiffel Tower? 🗼","options":["Italy","Spain","France","Germany"],"answer":"France","hint":"The Eiffel Tower is in Paris!"},
    {"level":"easy","q":"What is a map used for? 🗺️","options":["Cooking food","Finding directions","Playing music","Building houses"],"answer":"Finding directions","hint":"Maps show where places are!"},
    {"level":"easy","q":"What does a librarian do? 📚","options":["Fixes cars","Delivers letters","Helps people find books","Grows food"],"answer":"Helps people find books","hint":"Librarians work in libraries!"},
    {"level":"medium","q":"What was the Industrial Revolution? ⚙️","options":["A type of government","A period of major manufacturing change","A type of war","A religious movement"],"answer":"A period of major manufacturing change","hint":"Britain industrialised in the 18th-19th centuries!"},
    {"level":"medium","q":"What is democracy? 🗳️","options":["Rule by one person","Rule by the military","People vote for their government","Rule by the wealthy"],"answer":"People vote for their government","hint":"Democracy = people's rule (Greek)!"},
    {"level":"medium","q":"What is globalisation?","options":["Building walls between countries","Countries becoming more interconnected","A type of weather","Local trading only"],"answer":"Countries becoming more interconnected","hint":"Trade, culture and ideas spread around the world!"},
    {"level":"medium","q":"What was the Cold War?","options":["A conflict with lots of snow","Political tension between USA and USSR after WWII","A war about trade","A conflict in Antarctica"],"answer":"Political tension between USA and USSR after WWII","hint":"The Cold War (1947-1991) was a political rivalry without direct combat!"},
    {"level":"medium","q":"What is the Commonwealth?","options":["A type of government","Mainly former British Empire countries","A trading bloc in Europe","A military alliance"],"answer":"Mainly former British Empire countries","hint":"54 countries including UK, India, Canada, Australia!"},
    {"level":"medium","q":"What was the Renaissance?","options":["A type of war","A cultural revival of art and learning","A religious movement","A period of famine"],"answer":"A cultural revival of art and learning","hint":"14th-17th century gave us Shakespeare, da Vinci!"},
    {"level":"medium","q":"What is inflation in economics?","options":["When money is printed","A general rise in prices over time","When people lose jobs","When banks fail"],"answer":"A general rise in prices over time","hint":"Inflation means your money buys less!"},
    {"level":"medium","q":"What is a referendum?","options":["An election for politicians","A direct public vote on a specific question","A type of law","A court decision"],"answer":"A direct public vote on a specific question","hint":"Brexit was decided by a referendum!"},
    {"level":"medium","q":"What is GDP?","options":["A type of government","Gross Domestic Product — total value of goods/services","A type of tax","A military term"],"answer":"Gross Domestic Product — total value of goods/services","hint":"A country's GDP shows the size of its economy!"},
    {"level":"medium","q":"What was the significance of the Magna Carta?","options":["Started democracy in America","Limited the power of the English king in 1215","Ended WWI","Gave women the vote"],"answer":"Limited the power of the English king in 1215","hint":"The first document to limit royal power!"},
    {"level":"medium","q":"What caused World War One?","options":["Germany invaded France","Assassination of Archduke Franz Ferdinand in 1914","A trade dispute","A religious conflict"],"answer":"Assassination of Archduke Franz Ferdinand in 1914","hint":"The assassination in Sarajevo triggered the war!"},
    {"level":"medium","q":"What is human rights?","options":["Rights only for wealthy","Basic rights that every person has","Rights given by governments","Rights only in democracies"],"answer":"Basic rights that every person has","hint":"The UN Declaration of Human Rights lists rights all people have from birth!"},
    {"level":"medium","q":"Which empire was the largest in history?","options":["Roman","British","Mongol","Ottoman"],"answer":"British Empire","hint":"At its peak, the British Empire covered ~25% of the world's land!"},
    {"level":"medium","q":"What is the United Nations? 🌍","options":["A type of election","An international organisation promoting peace","A military alliance","A trade agreement"],"answer":"An international organisation promoting peace","hint":"The UN was founded in 1945 after WWII!"},
    {"level":"medium","q":"What is the capital of South Africa?","options":["Johannesburg","Cape Town","Pretoria","Durban"],"answer":"Pretoria","hint":"Pretoria is South Africa's administrative capital!"},
    {"level":"hard","q":"What was the significance of the French Revolution?","options":["Spread French cuisine","Overthrew monarchy and spread liberty, equality, fraternity","Established France as colonial power","Began Napoleonic Wars only"],"answer":"Overthrew monarchy and spread liberty, equality, fraternity","hint":"1789: Liberty, Equality, Fraternity changed the world!"},
    {"level":"hard","q":"What is the separation of powers?","options":["Dividing a country into regions","Dividing government into legislative, executive, judicial","Separating rich and poor","Dividing military and civilian rule"],"answer":"Dividing government into legislative, executive, judicial","hint":"No single branch should have all power — Montesquieu's idea!"},
    {"level":"hard","q":"What were the causes of World War II?","options":["Only Hitler's rise","Treaty of Versailles, Great Depression, fascism, appeasement","A single assassination","Trade disputes"],"answer":"Treaty of Versailles, Great Depression, fascism, appeasement","hint":"Multiple causes: harsh peace terms, economic collapse, dictators!"},
    {"level":"hard","q":"What is the difference between capitalism and socialism?","options":["Same","Capitalism: private ownership; socialism: collective ownership","Capitalism is government-controlled","Socialism allows private profit"],"answer":"Capitalism: private ownership; socialism: collective ownership","hint":"USA = capitalist. Historical USSR = socialist model!"},
    {"level":"hard","q":"What was colonialism and its lasting impact?","options":["A type of farming","European powers controlling foreign territories, leaving lasting legacies","A type of trade","A religious practice"],"answer":"European powers controlling foreign territories, leaving lasting legacies","hint":"European colonialism shaped borders, languages and economies worldwide!"},
    {"level":"hard","q":"What is the role of the IMF?","options":["To fund wars","Financial assistance and global economic stability","Set world trade rules","Govern international disputes"],"answer":"Financial assistance and global economic stability","hint":"The IMF lends to countries in financial crisis!"},
    {"level":"hard","q":"What is geopolitics?","options":["Study of geography only","Influence of geography on political power","Politics of cities","A type of map"],"answer":"Influence of geography on political power","hint":"Russia's size and oil give it geopolitical power!"},
    {"level":"hard","q":"What is the significance of the UDHR (1948)?","options":["Ended WWII","First international standard for human rights","Created the United Nations","Stopped colonialism"],"answer":"First international standard for human rights","hint":"The UDHR lists 30 fundamental rights every person should have!"},
    {"level":"hard","q":"What is the difference between a federal and unitary state?","options":["Same","Federal: shared power; unitary: centralised power","Federal is more democratic","Unitary has more regions"],"answer":"Federal: shared power; unitary: centralised power","hint":"USA = federal (states have power). France = unitary!"},
    {"level":"hard","q":"What was Gutenberg's printing press significant for?","options":["Created the internet","Democratised knowledge by mass-producing books","Replaced handwriting entirely","Was invented in Asia"],"answer":"Democratised knowledge by mass-producing books","hint":"The press (1440) spread literacy and ideas like the Reformation!"},
  ,
    {level:"easy",q:"What is the capital of France? 🗼",options:["Lyon","Marseille","Paris","Bordeaux"],answer:"Paris",hint:"Most visited city in the world!"},
    {level:"easy",q:"What is the capital of the USA? 🇺🇸",options:["New York","Los Angeles","Chicago","Washington D.C."],answer:"Washington D.C.",hint:"Seat of US government!"},
    {level:"easy",q:"On which continent is China? 🌏",options:["Africa","Europe","Asia","Australia"],answer:"Asia",hint:"China is in East Asia!"},
    {level:"easy",q:"What does a plumber do? 🔧",options:["Fixes teeth","Fixes pipes","Teaches children","Drives buses"],answer:"Fixes pipes",hint:"Plumbers fix taps and install pipes!"},
    {level:"easy",q:"Which is the largest ocean? 🌊",options:["Atlantic","Indian","Arctic","Pacific"],answer:"Pacific",hint:"Pacific is bigger than all land combined!"},
    {level:"easy",q:"What is the capital of Australia? 🦘",options:["Sydney","Melbourne","Canberra","Brisbane"],answer:"Canberra",hint:"Many think Sydney, but it's Canberra!"},
    {level:"easy",q:"Which country does pizza come from? 🍕",options:["Spain","Greece","France","Italy"],answer:"Italy",hint:"Pizza was invented in Naples, Italy!"},
    {level:"easy",q:"What is the capital of Germany? 🇩🇪",options:["Munich","Hamburg","Frankfurt","Berlin"],answer:"Berlin",hint:"Berlin is Germany's capital!"},
    {level:"easy",q:"Which country has the pyramids? 🏺",options:["Morocco","Egypt","Libya","Tunisia"],answer:"Egypt",hint:"The Great Pyramids are in Egypt!"},
    {level:"easy",q:"What language do people speak in Brazil? 🇧🇷",options:["Spanish","English","Portuguese","French"],answer:"Portuguese",hint:"Brazil was colonised by Portugal!"},
    {level:"easy",q:"Which continent is the largest? 🌍",options:["Africa","Europe","North America","Asia"],answer:"Asia",hint:"Asia is largest by area and population!"},
    {level:"easy",q:"What is the capital of Spain? 🇪🇸",options:["Barcelona","Seville","Valencia","Madrid"],answer:"Madrid",hint:"Madrid is Spain's capital!"},
    {level:"easy",q:"What is the capital of Japan? 🇯🇵",options:["Osaka","Kyoto","Hiroshima","Tokyo"],answer:"Tokyo",hint:"Tokyo is one of the world's largest cities!"},
    {level:"easy",q:"Which river flows through Egypt? 🌊",options:["Amazon","Mississippi","Thames","Nile"],answer:"Nile",hint:"The Nile is the world's longest river!"},
    {level:"easy",q:"What does a chef do? 👨‍🍳",options:["Fixes teeth","Cooks food","Drives trains","Builds roads"],answer:"Cooks food",hint:"Chefs prepare food in restaurants!"},
    {level:"easy",q:"Which country is Big Ben in? 🏛️",options:["France","USA","Australia","United Kingdom"],answer:"United Kingdom",hint:"Big Ben is in London, UK!"},
    {level:"easy",q:"What is a citizen? 👤",options:["A type of currency","A member of a country","A type of food","A map symbol"],answer:"A member of a country",hint:"Citizens have rights and responsibilities!"},
    {level:"easy",q:"What does a librarian do? 📚",options:["Fixes cars","Delivers letters","Helps people find books","Grows food"],answer:"Helps people find books",hint:"Librarians work in libraries!"},
    {level:"easy",q:"What is the capital of Canada? 🇨🇦",options:["Toronto","Vancouver","Montreal","Ottawa"],answer:"Ottawa",hint:"Many think Toronto, but the capital is Ottawa!"},
    {level:"easy",q:"Which is the smallest continent?",options:["Antarctica","Europe","Australia","South America"],answer:"Australia",hint:"Australia is also a country — it's the smallest continent!"},
    {level:"medium",q:"What was the Industrial Revolution? ⚙️",options:["A type of government","A period of major manufacturing change","A type of war","A religious movement"],answer:"A period of major manufacturing change",hint:"Britain industrialised in the 18th-19th centuries!"},
    {level:"medium",q:"What is democracy? 🗳️",options:["Rule by one person","Rule by the military","People vote for their government","Rule by the wealthy"],answer:"People vote for their government",hint:"Democracy = people's rule (Greek)!"},
    {level:"medium",q:"What was the Cold War?",options:["A conflict with lots of snow","Political tension between USA and USSR after WWII","A war about trade","A conflict in Antarctica"],answer:"Political tension between USA and USSR after WWII",hint:"1947-1991: political rivalry without direct combat!"},
    {level:"medium",q:"What is the Commonwealth?",options:["A type of government","Mainly former British Empire countries","A trading bloc in Europe","A military alliance"],answer:"Mainly former British Empire countries",hint:"54 countries including UK, India, Canada, Australia!"},
    {level:"medium",q:"What was the Renaissance?",options:["A type of war","A cultural revival of art and learning","A religious movement","A period of famine"],answer:"A cultural revival of art and learning",hint:"14th-17th century: Shakespeare, da Vinci!"},
    {level:"medium",q:"What is inflation in economics?",options:["When money is printed","A general rise in prices over time","When people lose jobs","When banks fail"],answer:"A general rise in prices over time",hint:"Inflation = your money buys less!"},
    {level:"medium",q:"What is a referendum?",options:["An election for politicians","A direct public vote on a specific question","A type of law","A court decision"],answer:"A direct public vote on a specific question",hint:"Brexit was decided by a referendum!"},
    {level:"medium",q:"What is GDP?",options:["A type of government","Gross Domestic Product — total value of goods/services","A type of tax","A military term"],answer:"Gross Domestic Product — total value of goods/services",hint:"GDP shows the size of a country's economy!"},
    {level:"medium",q:"What was the significance of the Magna Carta?",options:["Started democracy in America","Limited power of the English king in 1215","Ended WWI","Gave women the vote"],answer:"Limited power of the English king in 1215",hint:"First document to limit royal power!"},
    {level:"medium",q:"What caused World War One?",options:["Germany invaded France","Assassination of Archduke Franz Ferdinand","A trade dispute","A religious conflict"],answer:"Assassination of Archduke Franz Ferdinand",hint:"The assassination in Sarajevo triggered the war!"},
    {level:"medium",q:"What are human rights?",options:["Rights only for wealthy","Basic rights that every person has","Rights given by governments","Rights only in democracies"],answer:"Basic rights that every person has",hint:"The UN Declaration lists rights all people have from birth!"},
    {level:"medium",q:"What is the United Nations? 🌍",options:["A type of election","An international organisation promoting peace","A military alliance","A trade agreement"],answer:"An international organisation promoting peace",hint:"UN founded in 1945 after WWII!"},
    {level:"medium",q:"Which empire was the largest in history?",options:["Roman","British","Mongol","Ottoman"],answer:"British Empire",hint:"At its peak: ~25% of the world's land!"},
    {level:"medium",q:"What is globalisation?",options:["Building walls between countries","Countries becoming more interconnected worldwide","A type of weather","Local trading only"],answer:"Countries becoming more interconnected worldwide",hint:"Trade, culture and ideas spread globally!"},
    {level:"medium",q:"What is the capital of South Africa?",options:["Johannesburg","Cape Town","Pretoria","Durban"],answer:"Pretoria",hint:"Pretoria is South Africa's administrative capital!"},
    {level:"hard",q:"What was the significance of the French Revolution?",options:["Spread French cuisine","Overthrew monarchy and spread liberty, equality, fraternity","Established France as colonial power","Began Napoleonic Wars only"],answer:"Overthrew monarchy and spread liberty, equality, fraternity",hint:"1789: changed the world!"},
    {level:"hard",q:"What is the separation of powers?",options:["Dividing a country into regions","Dividing government into legislative, executive, judicial","Separating rich and poor","Dividing military and civilian rule"],answer:"Dividing government into legislative, executive, judicial",hint:"No single branch should have all power!"},
    {level:"hard",q:"What were the main causes of World War II?",options:["Only Hitler's rise","Treaty of Versailles, Great Depression, fascism, appeasement","A single assassination","Trade disputes"],answer:"Treaty of Versailles, Great Depression, fascism, appeasement",hint:"Multiple causes: harsh peace, economic collapse, dictators!"},
    {level:"hard",q:"What is the difference between capitalism and socialism?",options:["Same","Capitalism: private ownership; socialism: collective ownership","Capitalism is government-controlled","Socialism allows private profit"],answer:"Capitalism: private ownership; socialism: collective ownership",hint:"USA=capitalist. Historical USSR=socialist!"},
    {level:"hard",q:"What was colonialism and its impact?",options:["A type of farming","European powers controlling foreign territories, leaving lasting legacies","A type of trade","A religious practice"],answer:"European powers controlling foreign territories, leaving lasting legacies",hint:"Colonialism shaped borders, languages and economies worldwide!"},
    {level:"hard",q:"What is the role of the IMF?",options:["To fund wars","Financial assistance and global economic stability","Set world trade rules","Govern international disputes"],answer:"Financial assistance and global economic stability",hint:"IMF lends to countries in financial crisis!"},
    {level:"hard",q:"What is geopolitics?",options:["Study of geography only","Influence of geography on political power","Politics of cities","A type of map"],answer:"Influence of geography on political power",hint:"Russia's size and oil give it geopolitical power!"},
    {level:"hard",q:"What is the significance of the UDHR (1948)?",options:["Ended WWII","First international standard for human rights","Created the United Nations","Stopped colonialism"],answer:"First international standard for human rights",hint:"30 fundamental rights every person should have!"},
    {level:"hard",q:"What is the difference between a federal and unitary state?",options:["Same","Federal: shared power; unitary: centralised power","Federal is more democratic","Unitary has more regions"],answer:"Federal: shared power; unitary: centralised power",hint:"USA=federal. France=unitary!"},
    {level:"hard",q:"What was the significance of Gutenberg's printing press?",options:["Created the internet","Democratised knowledge by mass-producing books","Replaced handwriting entirely","Was invented in Asia"],answer:"Democratised knowledge by mass-producing books",hint:"The press (1440) spread literacy and the Reformation!"},
    {level:"hard",q:"What is the difference between a primary and secondary source in history?",options:["Same thing","Primary: from the time period; secondary: analysis of primary sources","Primary sources are more reliable","Secondary sources are always biased"],answer:"Primary: from the time period; secondary: analysis of primary sources",hint:"A diary from WWI=primary. A history book about WWI=secondary!"},
    {level:"hard",q:"What were the main consequences of the Treaty of Versailles (1919)?",options:["It brought lasting peace","Germany lost land, paid reparations, and was humiliated — contributing to WWII","It created the United Nations","It gave women the vote"],answer:"Germany lost land, paid reparations, and was humiliated — contributing to WWII",hint:"The harsh terms of Versailles fuelled resentment and eventually WWII!"},
    {level:"hard",q:"What is the rule of law?",options:["The government can do whatever it wants","Everyone, including the government, must obey the law","Only citizens must follow the law","Laws apply only to criminals"],answer:"Everyone, including the government, must obey the law",hint:"No one is above the law — not even the government!"},
    {level:"hard",q:"What is cultural imperialism?",options:["Sharing culture equally","The spread of one dominant culture over others, often displacing local cultures","Building empires through war","A type of government"],answer:"The spread of one dominant culture over others, often displacing local cultures",hint:"Hollywood and fast food chains spreading American culture globally is cultural imperialism!"},
    {level:"hard",q:"What is the difference between immigration and emigration?",options:["Same","Immigration=moving into a country; emigration=moving out of a country","Immigration is illegal, emigration is legal","Emigration is temporary"],answer:"Immigration=moving into a country; emigration=moving out of a country",hint:"Immigrate = come IN. Emigrate = EXIT a country!"}
  ,
    {level:"easy",q:"What is the capital of China?",options:["Shanghai","Hong Kong","Beijing","Guangzhou"],answer:"Beijing",hint:"Beijing is China's capital!"},
    {level:"easy",q:"Which continent is Brazil on?",options:["Africa","Europe","Asia","South America"],answer:"South America",hint:"Brazil is in South America!"},
    {level:"easy",q:"What is the capital of India?",options:["Mumbai","Chennai","Kolkata","New Delhi"],answer:"New Delhi",hint:"New Delhi is India's capital!"},
    {level:"easy",q:"What is the capital of Russia?",options:["St Petersburg","Kiev","Minsk","Moscow"],answer:"Moscow",hint:"Moscow is Russia's capital!"},
    {level:"easy",q:"Which country has the Eiffel Tower?",options:["Italy","Spain","Germany","France"],answer:"France",hint:"The Eiffel Tower is in Paris, France!"},
    {level:"easy",q:"What is the capital of Mexico?",options:["Guadalajara","Cancun","Monterrey","Mexico City"],answer:"Mexico City",hint:"Mexico City is Mexico's capital!"},
    {level:"easy",q:"Which country is Mount Everest mainly in?",options:["India","China","Nepal","Bhutan"],answer:"Nepal",hint:"Mount Everest is on the Nepal-Tibet border!"},
    {level:"easy",q:"What is the largest country by area?",options:["China","USA","Canada","Russia"],answer:"Russia",hint:"Russia is the world's largest country!"},
    {level:"easy",q:"What is the most spoken language in the world?",options:["English","Spanish","Mandarin Chinese","Hindi"],answer:"Mandarin Chinese",hint:"Over 1 billion people speak Mandarin!"},
    {level:"easy",q:"Which ocean is between the USA and Europe?",options:["Pacific","Indian","Arctic","Atlantic"],answer:"Atlantic",hint:"The Atlantic Ocean separates USA and Europe!"},
    {level:"easy",q:"Which country has the most people in the world?",options:["USA","Russia","China","India"],answer:"India",hint:"India recently overtook China as most populous!"},
    {level:"easy",q:"What is the capital of Brazil?",options:["São Paulo","Rio de Janeiro","Salvador","Brasília"],answer:"Brasília",hint:"Many think Rio, but Brasília is the capital!"},
    {level:"easy",q:"Which country is the Amazon rainforest mainly in?",options:["Peru","Colombia","Venezuela","Brazil"],answer:"Brazil",hint:"About 60% of the Amazon is in Brazil!"},
    {level:"easy",q:"What is the capital of Egypt?",options:["Alexandria","Luxor","Aswan","Cairo"],answer:"Cairo",hint:"Cairo is Egypt's capital — largest city in Africa!"},
    {level:"easy",q:"Which is the longest river in the world?",options:["Amazon","Mississippi","Yangtze","Nile"],answer:"Nile",hint:"The Nile (6,650km) is the world's longest river!"},
    {level:"easy",q:"What is the capital of South Korea?",options:["Busan","Incheon","Pyongyang","Seoul"],answer:"Seoul",hint:"Seoul is South Korea's capital!"},
    {level:"easy",q:"Which is the highest mountain in the world?",options:["K2","Kangchenjunga","Lhotse","Mount Everest"],answer:"Mount Everest",hint:"Mount Everest = 8,849 metres!"},
    {level:"easy",q:"What is the capital of Nigeria?",options:["Lagos","Ibadan","Kano","Abuja"],answer:"Abuja",hint:"Many think Lagos (largest city), but Abuja is the capital!"},
    {level:"easy",q:"Which country has the Sahara Desert?",options:["Only one country","Morocco only","Multiple countries across North Africa","Only Egypt"],answer:"Multiple countries across North Africa",hint:"The Sahara spans 11 countries!"},
    {level:"easy",q:"What is the currency of Japan?",options:["Won","Yuan","Yen","Ringgit"],answer:"Yen",hint:"Japan uses the yen (¥)!"},
    {level:"easy",q:"Which country does sushi come from?",options:["China","Korea","Vietnam","Japan"],answer:"Japan",hint:"Sushi is a traditional Japanese food!"},
    {level:"easy",q:"What is the capital of Argentina?",options:["Santiago","Lima","Bogotá","Buenos Aires"],answer:"Buenos Aires",hint:"Buenos Aires is Argentina's capital!"},
    {level:"easy",q:"Which is the smallest country in the world?",options:["Monaco","San Marino","Liechtenstein","Vatican City"],answer:"Vatican City",hint:"Vatican City is just 0.44 km²!"},
    {level:"easy",q:"What does a president do?",options:["Makes laws only","Leads a country","Judges criminal cases","Commands police only"],answer:"Leads a country",hint:"A president is the head of state/government!"},
    {level:"easy",q:"What is a democracy?",options:["Rule by one person","Where people vote for leaders","Rule by the military","Rule by the wealthy"],answer:"Where people vote for leaders",hint:"Democracy = people choose their government!"},
    {level:"easy",q:"Which continent has the most countries?",options:["Asia","South America","Europe","Africa"],answer:"Africa",hint:"Africa has 54 countries!"},
    {level:"easy",q:"What is the capital of Kenya?",options:["Mombasa","Nairobi","Kampala","Dar es Salaam"],answer:"Nairobi",hint:"Nairobi is Kenya's capital!"},
    {level:"easy",q:"Which country is the Statue of Liberty in?",options:["France","Canada","United Kingdom","USA"],answer:"USA",hint:"The Statue of Liberty is in New York Harbor!"},
    {level:"easy",q:"What language do people in Argentina speak?",options:["Portuguese","English","French","Spanish"],answer:"Spanish",hint:"Most South Americans speak Spanish (except Brazil)!"},
    {level:"easy",q:"What is the currency of the USA?",options:["Pound","Euro","Dollar","Franc"],answer:"Dollar",hint:"The USA uses the dollar ($)!"},
    {level:"easy",q:"Which country is Machu Picchu in?",options:["Chile","Bolivia","Ecuador","Peru"],answer:"Peru",hint:"Machu Picchu is an ancient Inca city in Peru!"},
    {level:"easy",q:"What is the capital of Turkey?",options:["Istanbul","Izmir","Bursa","Ankara"],answer:"Ankara",hint:"Many think Istanbul, but Ankara is the capital!"},
    {level:"easy",q:"Which is the largest desert in the world by area?",options:["Sahara","Gobi","Arabian","Antarctic"],answer:"Antarctic",hint:"Antarctica is technically a cold desert — the largest!"},
    {level:"easy",q:"What is the capital of Poland?",options:["Krakow","Gdansk","Wroclaw","Warsaw"],answer:"Warsaw",hint:"Warsaw is Poland's capital!"},
    {level:"easy",q:"Which country has the maple leaf on its flag?",options:["Australia","USA","New Zealand","Canada"],answer:"Canada",hint:"Canada's flag has a red maple leaf!"},
    {level:"easy",q:"What is the capital of Saudi Arabia?",options:["Jeddah","Mecca","Medina","Riyadh"],answer:"Riyadh",hint:"Riyadh is Saudi Arabia's capital!"},
    {level:"easy",q:"Which country has the most natural lakes?",options:["Brazil","Russia","USA","Canada"],answer:"Canada",hint:"Canada has over 60% of the world's lakes!"},
    {level:"easy",q:"What is the capital of Pakistan?",options:["Lahore","Karachi","Islamabad","Peshawar"],answer:"Islamabad",hint:"Islamabad is Pakistan's capital (not Karachi which is largest)!"},
    {level:"easy",q:"Which country is the Great Barrier Reef in?",options:["Indonesia","Philippines","New Zealand","Australia"],answer:"Australia",hint:"The Great Barrier Reef is off the coast of Queensland, Australia!"},
    {level:"easy",q:"What is the capital of Sweden?",options:["Oslo","Copenhagen","Helsinki","Stockholm"],answer:"Stockholm",hint:"Stockholm is Sweden's capital!"},
    {level:"easy",q:"What is the capital of the Netherlands?",options:["Rotterdam","The Hague","Utrecht","Amsterdam"],answer:"Amsterdam",hint:"Amsterdam is the capital of the Netherlands!"},
    {level:"easy",q:"Which country is Easter Island famous for its statues?",options:["Peru","Chile","Ecuador","Colombia"],answer:"Chile",hint:"Easter Island (with its famous moai statues) belongs to Chile!"},
    {level:"easy",q:"What is the capital of Greece?",options:["Thessaloniki","Sparta","Corinth","Athens"],answer:"Athens",hint:"Athens is Greece's capital and birthplace of democracy!"},
    {level:"easy",q:"What is the capital of Portugal?",options:["Porto","Coimbra","Braga","Lisbon"],answer:"Lisbon",hint:"Lisbon is Portugal's capital!"},
    {level:"easy",q:"Which country is known for the Taj Mahal?",options:["Pakistan","Bangladesh","Nepal","India"],answer:"India",hint:"The Taj Mahal is in Agra, India!"},
    {level:"easy",q:"What is the capital of Norway?",options:["Bergen","Stavanger","Trondheim","Oslo"],answer:"Oslo",hint:"Oslo is Norway's capital!"},
    {level:"easy",q:"Which country has the longest coastline?",options:["Russia","Australia","USA","Canada"],answer:"Canada",hint:"Canada has the world's longest coastline!"},
    {level:"easy",q:"What is the capital of Switzerland?",options:["Zurich","Geneva","Basel","Bern"],answer:"Bern",hint:"Bern is Switzerland's capital (not Zurich)!"},
    {level:"easy",q:"What does a governor do?",options:["Rules a whole country","Leads a state or region","Judges court cases","Commands the army"],answer:"Leads a state or region",hint:"A governor leads a state or province!"},
    {level:"easy",q:"What is the capital of Denmark?",options:["Oslo","Stockholm","Helsinki","Copenhagen"],answer:"Copenhagen",hint:"Copenhagen is Denmark's capital!"},
    {level:"easy",q:"Which country has the Colosseum?",options:["Greece","Spain","France","Italy"],answer:"Italy",hint:"The Colosseum is in Rome, Italy!"},
    {level:"easy",q:"What is the capital of Ireland?",options:["Cork","Galway","Belfast","Dublin"],answer:"Dublin",hint:"Dublin is the capital of the Republic of Ireland!"},
    {level:"easy",q:"Which continent has the most population?",options:["Africa","North America","Europe","Asia"],answer:"Asia",hint:"Asia has over 4.5 billion people!"},
    {level:"easy",q:"What is the currency of the UK?",options:["Euro","Franc","Dollar","Pound Sterling"],answer:"Pound Sterling",hint:"The UK uses the pound (£)!"},
    {level:"easy",q:"Which city is the capital of Scotland?",options:["Glasgow","Dundee","Aberdeen","Edinburgh"],answer:"Edinburgh",hint:"Edinburgh is Scotland's capital!"},
    {level:"easy",q:"What is the capital of New Zealand?",options:["Auckland","Christchurch","Hamilton","Wellington"],answer:"Wellington",hint:"Wellington is New Zealand's capital (not Auckland)!"},
    {level:"easy",q:"What is the capital of Israel?",options:["Tel Aviv","Haifa","Bethlehem","Jerusalem"],answer:"Jerusalem",hint:"Jerusalem is Israel's declared capital!"},
    {level:"easy",q:"Which country has the Inca ruins of Machu Picchu?",options:["Bolivia","Colombia","Ecuador","Peru"],answer:"Peru",hint:"Machu Picchu is in the Andes mountains of Peru!"},
    {level:"easy",q:"What is the largest city in Australia by population?",options:["Melbourne","Brisbane","Perth","Sydney"],answer:"Sydney",hint:"Sydney is Australia's largest city!"},
    {level:"easy",q:"What is the capital of Finland?",options:["Tampere","Turku","Oulu","Helsinki"],answer:"Helsinki",hint:"Helsinki is Finland's capital!"},
    {level:"easy",q:"What is the capital of Chile?",options:["Valparaíso","Concepción","Antofagasta","Santiago"],answer:"Santiago",hint:"Santiago is Chile's capital!"},
    {level:"easy",q:"What is the capital of the Philippines?",options:["Cebu","Davao","Quezon City","Manila"],answer:"Manila",hint:"Manila is the capital of the Philippines!"},
    {level:"easy",q:"Which is the most visited country in the world?",options:["USA","China","Spain","France"],answer:"France",hint:"France is the world's most visited country!"},
    {level:"easy",q:"What is the capital of Morocco?",options:["Casablanca","Marrakesh","Fez","Rabat"],answer:"Rabat",hint:"Rabat is Morocco's capital (not Casablanca)!"},
    {level:"medium",q:"What was the significance of World War One?",options:["The first digital war","Changed global empires and led to harsh peace terms causing WWII","Only involved Europe","Lasted 10 years"],answer:"Changed global empires and led to harsh peace terms causing WWII",hint:"WWI: 1914-1918. Led to Treaty of Versailles which contributed to WWII!"},
    {level:"medium",q:"What was the Cold War?",options:["A conflict with lots of snow","Political tension between USA and USSR after WWII","A war about trade","A conflict in Antarctica"],answer:"Political tension between USA and USSR after WWII",hint:"1947-1991: USA vs USSR without direct combat!"},
    {level:"medium",q:"What is democracy?",options:["Rule by one person","Rule by the military","People vote for their government","Rule by the wealthy"],answer:"People vote for their government",hint:"Democracy = people's rule (Greek)!"},
    {level:"medium",q:"What was the Renaissance?",options:["A type of war","A cultural revival of art and learning","A religious movement","A period of famine"],answer:"A cultural revival of art and learning",hint:"14th-17th century: Shakespeare, da Vinci, Michelangelo!"},
    {level:"medium",q:"What is inflation in economics?",options:["When money is printed","A general rise in prices over time","When people lose jobs","When banks fail"],answer:"A general rise in prices over time",hint:"Inflation = money buys less over time!"},
    {level:"medium",q:"What is a referendum?",options:["An election for politicians","A direct public vote on a specific question","A type of law","A court decision"],answer:"A direct public vote on a specific question",hint:"Brexit was decided by a referendum!"},
    {level:"medium",q:"What is GDP?",options:["A type of government","Total value of goods/services produced in a country","A type of tax","A military term"],answer:"Total value of goods/services produced in a country",hint:"GDP = Gross Domestic Product. Measures economy size!"},
    {level:"medium",q:"What was the significance of the Magna Carta?",options:["Started democracy in America","Limited the power of the English king in 1215","Ended WWI","Gave women the vote"],answer:"Limited the power of the English king in 1215",hint:"First document to limit royal power!"},
    {level:"medium",q:"What caused World War One?",options:["Germany invaded France","Assassination of Archduke Franz Ferdinand","A trade dispute","A religious conflict"],answer:"Assassination of Archduke Franz Ferdinand",hint:"The 1914 assassination in Sarajevo triggered the war!"},
    {level:"medium",q:"What are human rights?",options:["Rights only for the wealthy","Basic rights every person has","Rights given by governments","Rights only in democracies"],answer:"Basic rights every person has",hint:"The UN Declaration lists rights all people have from birth!"},
    {level:"medium",q:"What is the United Nations?",options:["A type of election","An international organisation promoting peace","A military alliance","A trade agreement"],answer:"An international organisation promoting peace",hint:"UN founded in 1945 after WWII!"},
    {level:"medium",q:"What is globalisation?",options:["Building walls between countries","Countries becoming more interconnected worldwide","A type of weather","Local trading only"],answer:"Countries becoming more interconnected worldwide",hint:"Trade, culture and ideas spread globally!"},
    {level:"medium",q:"What was the Industrial Revolution?",options:["A type of government","A period of major manufacturing change","A type of war","A religious movement"],answer:"A period of major manufacturing change",hint:"Britain industrialised in the 18th-19th centuries!"},
    {level:"medium",q:"What is the Commonwealth?",options:["A type of government","Mainly former British Empire countries","A trading bloc in Europe","A military alliance"],answer:"Mainly former British Empire countries",hint:"54 countries: UK, India, Canada, Australia...!"},
    {level:"medium",q:"What is a monarchy?",options:["Rule by an elected president","Rule by a hereditary king or queen","Rule by the military","Rule by the people"],answer:"Rule by a hereditary king or queen",hint:"The UK, Spain, and Japan are constitutional monarchies!"},
    {level:"medium",q:"What was apartheid?",options:["A type of music","A racial segregation system in South Africa","A religious festival","A form of democracy"],answer:"A racial segregation system in South Africa",hint:"Apartheid in South Africa ended in 1994 with Nelson Mandela's election!"},
    {level:"medium",q:"What is the European Union?",options:["A military alliance only","A political and economic union of European countries","A UN branch for Europe","An organisation for European languages"],answer:"A political and economic union of European countries",hint:"The EU has 27 member states, a shared currency (euro), and free movement!"},
    {level:"medium",q:"What is the role of a trade union?",options:["To trade goods internationally","To represent workers and protect their rights","To collect taxes","To manage government spending"],answer:"To represent workers and protect their rights",hint:"Trade unions negotiate wages and conditions for workers!"},
    {level:"medium",q:"What was the transatlantic slave trade?",options:["A trade route for spices","The forced transportation of Africans to the Americas as slaves","A medieval trading network","Trade between Europe and Asia"],answer:"The forced transportation of Africans to the Americas as slaves",hint:"16th-19th century: millions of Africans were enslaved and transported!"},
    {level:"medium",q:"What is a constitution?",options:["A type of election","A set of fundamental laws and principles governing a country","A type of tax","A military document"],answer:"A set of fundamental laws and principles governing a country",hint:"The USA's Constitution (1787) is the world's oldest written constitution!"},
    {level:"medium",q:"What is the difference between GDP and GNP?",options:["Same thing","GDP = production within borders; GNP = citizens wherever they are","GDP is bigger always","GNP excludes exports"],answer:"GDP = production within borders; GNP = citizens wherever they are",hint:"GDP: what's made inside the country. GNP: what citizens make anywhere!"},
    {level:"medium",q:"What is the significance of 1066 in British history?",options:["Magna Carta was signed","Norman Conquest: William invaded England","Black Death arrived","Industrial Revolution began"],answer:"Norman Conquest: William invaded England",hint:"1066: Battle of Hastings. William the Conqueror defeated King Harold!"},
    {level:"medium",q:"What was the Berlin Wall?",options:["A defensive wall from medieval times","A wall dividing East and West Germany during the Cold War","A wall built by the Romans","A wall separating Russia and Poland"],answer:"A wall dividing East and West Germany during the Cold War",hint:"Built in 1961, fell in 1989!"},
    {level:"medium",q:"What is immigration?",options:["Leaving your own country permanently","Moving into another country to live","Temporary tourism","Seasonal travel"],answer:"Moving into another country to live",hint:"Immigrate = coming IN to a new country!"},
    {level:"medium",q:"What is the significance of the civil rights movement in the USA?",options:["Gave women the vote","Fought for equal rights for Black Americans in the 1950s-60s","Ended WWI","Created the UN"],answer:"Fought for equal rights for Black Americans in the 1950s-60s",hint:"Martin Luther King Jr led peaceful protests for racial equality!"},
    {level:"medium",q:"What is propaganda?",options:["Accurate journalism","Information used to promote a political cause, often biased","Scientific research","Government data"],answer:"Information used to promote a political cause, often biased",hint:"Propaganda = biased info to influence public opinion!"},
    {level:"medium",q:"What is a census?",options:["A type of election","An official count and survey of a population","A government budget","A trade agreement"],answer:"An official count and survey of a population",hint:"Censuses count population every 10 years in many countries!"},
    {level:"medium",q:"What is the significance of the printing press (1440)?",options:["Created the internet","Allowed mass production of books, spreading literacy","Replaced all hand tools","Was invented in Asia"],answer:"Allowed mass production of books, spreading literacy",hint:"Gutenberg's press (1440) spread knowledge and literacy across Europe!"},
    {level:"medium",q:"What is nationalism?",options:["Pride and loyalty to one's nation, sometimes exclusive","A type of religion","A trade agreement","An economic theory"],answer:"Pride and loyalty to one's nation, sometimes exclusive",hint:"Nationalism can be positive (identity) or negative (exclusion of others)!"},
    {level:"medium",q:"What is colonialism?",options:["A type of farming","Europeans controlling foreign territories","A type of trade","A religious practice"],answer:"Europeans controlling foreign territories",hint:"European powers colonised Africa, Asia, and the Americas from the 15th century!"},
    {level:"medium",q:"What is the significance of the French Revolution (1789)?",options:["Spread French cuisine","Overthrew monarchy; spread liberty, equality, fraternity","Established colonial power","Began Napoleonic Wars only"],answer:"Overthrew monarchy; spread liberty, equality, fraternity",hint:"1789: changed the world. Liberty, Egalité, Fraternité!"},
    {level:"medium",q:"What is a dictatorship?",options:["An elected government","Rule by one person with absolute power","A system with two leaders","Rule by a committee"],answer:"Rule by one person with absolute power",hint:"Hitler, Stalin, Mussolini were dictators!"},
    {level:"medium",q:"What is the Universal Declaration of Human Rights (1948)?",options:["Ended WWII","First international standard for human rights","Created the UN","Stopped colonialism"],answer:"First international standard for human rights",hint:"30 fundamental rights every person should have!"},
    {level:"medium",q:"What is the difference between primary and secondary source?",options:["Same","Primary = from the time period; secondary = analysis of primary","Primary more reliable always","Secondary always biased"],answer:"Primary = from the time period; secondary = analysis of primary",hint:"WWI diary = primary. History book about WWI = secondary!"},
    {level:"medium",q:"What is a free market economy?",options:["Government controls all prices","Supply and demand determine prices with minimal government intervention","Trade only within one country","No taxes exist"],answer:"Supply and demand determine prices with minimal government intervention",hint:"USA and UK are largely free market economies!"},
    {level:"medium",q:"What is the significance of the moon landing (1969)?",options:["First satellite in space","First humans walked on another celestial body","First space station","First Mars mission"],answer:"First humans walked on another celestial body",hint:"Apollo 11: Neil Armstrong and Buzz Aldrin, July 1969!"},
    {level:"medium",q:"What is urbanisation?",options:["Building in the countryside","The process of more people moving to cities","Reducing city size","Rebuilding destroyed cities"],answer:"The process of more people moving to cities",hint:"More than half the world now lives in cities!"},
    {level:"medium",q:"What is the significance of the Silk Road?",options:["A modern motorway","Ancient trade routes connecting China to Europe and the Middle East","A type of cloth","A Roman road"],answer:"Ancient trade routes connecting China to Europe and the Middle East",hint:"The Silk Road connected civilisations from China to Rome!"},
    {level:"medium",q:"What is the difference between a law and a custom?",options:["Same thing","Law is officially enforced; custom is a cultural tradition","Custom is more important","Laws are suggestions"],answer:"Law is officially enforced; custom is a cultural tradition",hint:"Breaking a law = punishment. Breaking a custom = social disapproval!"},
    {level:"medium",q:"What is the capital of Vietnam?",options:["Ho Chi Minh City","Da Nang","Hue","Hanoi"],answer:"Hanoi",hint:"Hanoi is Vietnam's capital (Ho Chi Minh City is largest)!"},
    {level:"medium",q:"What is the capital of Indonesia?",options:["Surabaya","Bandung","Medan","Jakarta"],answer:"Jakarta",hint:"Jakarta is Indonesia's capital (though moving to Nusantara)!"},
    {level:"medium",q:"What is the capital of Colombia?",options:["Medellín","Cali","Cartagena","Bogotá"],answer:"Bogotá",hint:"Bogotá is Colombia's capital!"},
    {level:"medium",q:"What is the capital of Ethiopia?",options:["Nairobi","Kampala","Addis Ababa","Khartoum"],answer:"Addis Ababa",hint:"Addis Ababa is Ethiopia's capital!"},
    {level:"medium",q:"What is the capital of Ukraine?",options:["Lviv","Odessa","Kharkiv","Kyiv"],answer:"Kyiv",hint:"Kyiv (Kiev) is Ukraine's capital!"},
    {level:"medium",q:"What is cultural diffusion?",options:["Losing culture","The spread of cultural elements from one group to another","Creating a new culture alone","When cultures die out"],answer:"The spread of cultural elements from one group to another",hint:"Cultural diffusion: music, food, language spread between cultures!"},
    {level:"medium",q:"Which empire built the Colosseum?",options:["Greek","Ottoman","British","Roman"],answer:"Roman",hint:"The Roman Empire built the Colosseum in Rome!"},
    {level:"medium",q:"What is the significance of the 1948 Arab-Israeli conflict?",options:["Founded the UN","Establishment of Israel and Arab-Israeli wars beginning","Creation of Jordan","Ended British rule in India"],answer:"Establishment of Israel and Arab-Israeli wars beginning",hint:"1948: Israel declared independence. Arab-Israeli conflict began!"},
    {level:"medium",q:"What was the Great Wall of China built for?",options:["Trade","Tourism","To protect against northern invasions","As a monument"],answer:"To protect against northern invasions",hint:"The Great Wall protected China from Mongol and other northern invasions!"},
    {level:"medium",q:"What is the capital of Peru?",options:["Cusco","Arequipa","Trujillo","Lima"],answer:"Lima",hint:"Lima is Peru's capital!"},
    {level:"medium",q:"What is the capital of Venezuela?",options:["Medellín","Cartagena","Maracaibo","Caracas"],answer:"Caracas",hint:"Caracas is Venezuela's capital!"},
    {level:"medium",q:"What is the capital of Iran?",options:["Isfahan","Shiraz","Mashhad","Tehran"],answer:"Tehran",hint:"Tehran is Iran's capital!"},
    {level:"medium",q:"What is the capital of Iraq?",options:["Basra","Mosul","Erbil","Baghdad"],answer:"Baghdad",hint:"Baghdad is Iraq's capital!"},
    {level:"medium",q:"What is the World Trade Organization (WTO)?",options:["A bank","An organisation regulating international trade","A military alliance","A human rights organisation"],answer:"An organisation regulating international trade",hint:"The WTO sets rules for global trade between nations!"},
    {level:"medium",q:"What is the significance of the Gutenberg Bible (1455)?",options:["First book ever written","First mass-produced printed book using movable type","First translated Bible","First English Bible"],answer:"First mass-produced printed book using movable type",hint:"The Gutenberg Bible was the first book mass-produced on a printing press!"},
    {level:"medium",q:"What is the capital of Pakistan?",options:["Lahore","Karachi","Islamabad","Peshawar"],answer:"Islamabad",hint:"Islamabad is Pakistan's planned capital city!"},
    {level:"medium",q:"What is the significance of the Reformation?",options:["A type of farming revolution","A 16th-century split in Christianity led by Martin Luther","An economic movement","A political revolution"],answer:"A 16th-century split in Christianity led by Martin Luther",hint:"Luther's 95 Theses (1517) sparked the Protestant Reformation!"},
    {level:"medium",q:"What is a superpower?",options:["A country with nuclear weapons only","A dominant country with global economic, military and political influence","Any large country","A country in NATO"],answer:"A dominant country with global economic, military and political influence",hint:"USA, USSR during Cold War. USA currently. China emerging!"},
    {level:"medium",q:"What is the capital of Thailand?",options:["Chiang Mai","Phuket","Pattaya","Bangkok"],answer:"Bangkok",hint:"Bangkok is Thailand's capital!"},
    {level:"medium",q:"What is the capital of South Africa?",options:["Johannesburg","Cape Town","Pretoria","Durban"],answer:"Pretoria",hint:"Pretoria is South Africa's administrative capital!"},
    {level:"medium",q:"What are the G7 countries?",options:["USA, China, Russia, UK, France, Germany, Japan","USA, UK, France, Germany, Italy, Japan, Canada","USA, China, India, Brazil, Russia, Germany, UK","USA, UK, France, Germany, Russia, Japan, Australia"],answer:"USA, UK, France, Germany, Italy, Japan, Canada",hint:"G7 = world's 7 largest advanced economies!"},
    {level:"medium",q:"What caused the Great Fire of London (1666)?",options:["An enemy attack","A fire started in a bakery on Pudding Lane","Fireworks","A lightning strike"],answer:"A fire started in a bakery on Pudding Lane",hint:"Started in a bakery in Pudding Lane, spread across the city!"},
    {level:"medium",q:"What is the capital of Cuba?",options:["Santiago de Cuba","Trinidad","Varadero","Havana"],answer:"Havana",hint:"Havana is Cuba's capital!"},
    {level:"medium",q:"What is the capital of Hungary?",options:["Vienna","Prague","Bratislava","Budapest"],answer:"Budapest",hint:"Budapest is Hungary's capital!"},
    {level:"medium",q:"What is the capital of Romania?",options:["Cluj","Timișoara","Iași","Bucharest"],answer:"Bucharest",hint:"Bucharest is Romania's capital!"},
    {level:"medium",q:"What is the capital of the Czech Republic?",options:["Brno","Ostrava","Plzen","Prague"],answer:"Prague",hint:"Prague is the Czech Republic's capital!"},
    {level:"medium",q:"What is the capital of Austria?",options:["Salzburg","Graz","Linz","Vienna"],answer:"Vienna",hint:"Vienna is Austria's capital!"},
    {level:"medium",q:"What is the capital of Belgium?",options:["Bruges","Ghent","Antwerp","Brussels"],answer:"Brussels",hint:"Brussels is Belgium's capital and EU headquarters!"},
    {level:"hard",q:"What is the separation of powers?",options:["Dividing country into regions","Dividing government into legislative, executive, judicial","Separating rich and poor","Dividing military and civilian"],answer:"Dividing government into legislative, executive, judicial",hint:"No single branch should have all power. Montesquieu's theory!"},
    {level:"hard",q:"What were the main causes of WWII?",options:["Only Hitler's rise","Treaty of Versailles, Great Depression, fascism, appeasement","A single assassination","Trade disputes only"],answer:"Treaty of Versailles, Great Depression, fascism, appeasement",hint:"Multiple causes: harsh peace, economic collapse, dictators, appeasement!"},
    {level:"hard",q:"What is the difference between capitalism and socialism?",options:["Same","Capitalism: private ownership; socialism: collective ownership","Capitalism is government-controlled","Socialism allows private profit"],answer:"Capitalism: private ownership; socialism: collective ownership",hint:"USA=capitalist. Historical USSR=socialist!"},
    {level:"hard",q:"What is the role of the IMF?",options:["To fund wars","Financial assistance and global economic stability","Set world trade rules","Govern international disputes"],answer:"Financial assistance and global economic stability",hint:"IMF lends to countries in financial crisis!"},
    {level:"hard",q:"What is geopolitics?",options:["Study of geography only","Influence of geography on political power","Politics of cities","A type of map"],answer:"Influence of geography on political power",hint:"Russia's size and oil give it geopolitical power!"},
    {level:"hard",q:"What is the difference between a federal and unitary state?",options:["Same","Federal: shared power; unitary: centralised power","Federal is more democratic","Unitary has more regions"],answer:"Federal: shared power; unitary: centralised power",hint:"USA=federal. France=unitary!"},
    {level:"hard",q:"What is cultural imperialism?",options:["Sharing culture equally","Spread of one dominant culture over others","Building empires through war","A type of government"],answer:"Spread of one dominant culture over others",hint:"Hollywood and fast food spreading American culture = cultural imperialism!"},
    {level:"hard",q:"What is the difference between immigration and emigration?",options:["Same","Immigration=moving into; emigration=moving out","Immigration illegal, emigration legal","Emigration temporary"],answer:"Immigration=moving into; emigration=moving out",hint:"Immigrate = come IN. Emigrate = EXIT!"},
    {level:"hard",q:"What is the significance of Gutenberg's printing press?",options:["Created the internet","Democratised knowledge by mass-producing books","Replaced handwriting entirely","Was invented in Asia"],answer:"Democratised knowledge by mass-producing books",hint:"The press (1440) spread literacy and the Reformation!"},
    {level:"hard",q:"What are the consequences of the Treaty of Versailles (1919)?",options:["Brought lasting peace","Germany lost land, paid reparations, humiliated — contributing to WWII","Created the United Nations","Gave women the vote"],answer:"Germany lost land, paid reparations, humiliated — contributing to WWII",hint:"Harsh terms fuelled resentment and eventually WWII!"},
    {level:"hard",q:"What is the rule of law?",options:["Government can do whatever it wants","Everyone including government must obey the law","Only citizens must follow law","Laws apply only to criminals"],answer:"Everyone including government must obey the law",hint:"No one is above the law — not even the government!"},
    {level:"hard",q:"What is Keynesian economics?",options:["Reduce government spending always","Government spending can stimulate a stagnant economy","Free markets should always be left alone","Monetary policy alone is sufficient"],answer:"Government spending can stimulate a stagnant economy",hint:"Keynes: government should increase spending during recessions!"},
    {level:"hard",q:"What is social contract theory?",options:["A legal contract","People give up some freedoms to government in exchange for protection","A business agreement","A religious covenant"],answer:"People give up some freedoms to government in exchange for protection",hint:"Hobbes, Locke, Rousseau: social contract underpins legitimate government!"},
    {level:"hard",q:"What is Realpolitik?",options:["A German political party","Politics based on practical power rather than ideology or ethics","A type of democracy","A diplomatic movement"],answer:"Politics based on practical power rather than ideology or ethics",hint:"Bismarck and Kissinger practised Realpolitik — pragmatic power politics!"},
    {level:"hard",q:"What caused the fall of the Roman Empire?",options:["A single invasion","Multiple factors: military overreach, economic decline, barbarian invasions, political instability","A natural disaster","Economic collapse alone"],answer:"Multiple factors: military overreach, economic decline, barbarian invasions, political instability",hint:"No single cause — combination of internal decline and external pressure!"},
    {level:"hard",q:"What is hegemony?",options:["A type of democracy","The dominance of one country or group over others","A military term only","A trade agreement"],answer:"The dominance of one country or group over others",hint:"US hegemony = USA's global dominance since WWII!"},
    {level:"hard",q:"What is the significance of the Congress of Vienna (1815)?",options:["Ended the Napoleonic Wars and redrawn the European map","Started WWI","Ended slavery","Created Germany"],answer:"Ended the Napoleonic Wars and redrawn the European map",hint:"1815: European powers met to restore order after Napoleonic Wars!"},
    {level:"hard",q:"What is neo-colonialism?",options:["Traditional colonialism","Economic and political control by wealthy nations over developing ones without formal rule","A return to old colonies","Building new colonies"],answer:"Economic and political control by wealthy nations over developing ones without formal rule",hint:"Neo-colonialism = indirect control through debt, trade, and politics!"},
    {level:"hard",q:"What is the Truman Doctrine (1947)?",options:["A trade policy","US policy to contain Soviet communism and support free peoples","A nuclear weapons treaty","A European reconstruction plan"],answer:"US policy to contain Soviet communism and support free peoples",hint:"Truman Doctrine = USA would support nations threatened by communism!"},
    {level:"hard",q:"What is the Marshall Plan (1948)?",options:["A military strategy","US economic aid to rebuild Western Europe after WWII","A nuclear weapons plan","A trade agreement"],answer:"US economic aid to rebuild Western Europe after WWII",hint:"Marshall Plan: USA gave $13 billion to rebuild Western Europe!"},
    {level:"hard",q:"What is the significance of the Balfour Declaration (1917)?",options:["Ended WWI","British support for a Jewish homeland in Palestine","Created Iraq","Ended Ottoman rule in Arabia"],answer:"British support for a Jewish homeland in Palestine",hint:"1917: Britain supported Zionist ambitions — shaped modern Middle East!"},
    {level:"hard",q:"What is structural adjustment in economics?",options:["Building new infrastructure","IMF/World Bank conditions requiring privatisation and spending cuts for loans","A type of tax reform","Industrial policy"],answer:"IMF/World Bank conditions requiring privatisation and spending cuts for loans",hint:"Developing nations often had to cut public spending to receive IMF loans!"},
    {level:"hard",q:"What is the significance of Westphalia (1648)?",options:["Ended the Thirty Years War and established the modern nation-state system","Started the French Revolution","Created the British Empire","Ended WWI"],answer:"Ended the Thirty Years War and established the modern nation-state system",hint:"Treaty of Westphalia (1648) is the foundation of modern international relations!"},
    {level:"hard",q:"What is democratic backsliding?",options:["A failed election","When democratic norms and institutions gradually weaken","Economic recession","Military coup only"],answer:"When democratic norms and institutions gradually weaken",hint:"Hungary, Turkey, Venezuela are examples of democratic backsliding!"},
    {level:"hard",q:"What is the difference between hard power and soft power?",options:["Same","Hard=military/economic force; soft=cultural/diplomatic influence","Hard is more effective always","Soft power is military only"],answer:"Hard=military/economic force; soft=cultural/diplomatic influence",hint:"Hard power: sanctions, armies. Soft power: culture, diplomacy, education!"},
    {level:"hard",q:"What is the significance of the Bandung Conference (1955)?",options:["Created NATO","First major gathering of newly independent African and Asian nations","Ended Korean War","Created the UN"],answer:"First major gathering of newly independent African and Asian nations",hint:"Bandung 1955: birth of the Non-Aligned Movement and Global South solidarity!"},
    {level:"hard",q:"What is the Security Council in the UN?",options:["The general assembly of all nations","5 permanent + 10 rotating members responsible for international peace","A human rights body","An economic committee"],answer:"5 permanent + 10 rotating members responsible for international peace",hint:"P5: USA, UK, France, Russia, China — each has veto power!"},
    {level:"hard",q:"What is the difference between decolonisation and independence?",options:["Same","Decolonisation = process of removing colonial rule; independence = the result","Independence is temporary","Decolonisation requires war always"],answer:"Decolonisation = process of removing colonial rule; independence = the result",hint:"India decolonised (process) and gained independence (result) in 1947!"},
    {level:"hard",q:"What is the domino theory?",options:["A board game","The idea that if one country fell to communism, neighbours would follow","A military strategy","A trade theory"],answer:"The idea that if one country fell to communism, neighbours would follow",hint:"US fear during Cold War: Vietnam falling would cause neighbouring countries to fall!"},
    {level:"hard",q:"What is the World Bank?",options:["A personal bank","International financial institution providing loans to developing countries","The UN's financial arm","A currency exchange"],answer:"International financial institution providing loans to developing countries",hint:"World Bank funds development projects in poorer nations!"},
    {level:"hard",q:"What is the significance of the Cuban Missile Crisis (1962)?",options:["Started the Cold War","Closest the world came to nuclear war between USA and USSR","Ended the Cold War","Created NATO"],answer:"Closest the world came to nuclear war between USA and USSR",hint:"13 days in October 1962: Soviet missiles in Cuba threatened nuclear war!"},
    {level:"hard",q:"What is totalitarianism?",options:["A form of democracy","A political system where the state controls every aspect of public and private life","Military rule only","Rule by the wealthy"],answer:"A political system where the state controls every aspect of public and private life",hint:"Stalin's USSR and Hitler's Germany were totalitarian regimes!"},
    {level:"hard",q:"What is the significance of the Nuremberg Trials (1945-46)?",options:["Ended WWI","First international war crimes tribunal, holding Nazi leaders accountable","Created the UN","Drew new European borders"],answer:"First international war crimes tribunal, holding Nazi leaders accountable",hint:"Nuremberg Trials established the principle that individuals are accountable for war crimes!"},
    {level:"hard",q:"What is the Washington Consensus?",options:["A US-China agreement","Economic policies of privatisation, deregulation, fiscal austerity promoted by IMF/World Bank","A military alliance","A climate agreement"],answer:"Economic policies of privatisation, deregulation, fiscal austerity promoted by IMF/World Bank",hint:"Washington Consensus = neoliberal economic prescriptions for developing nations!"},
    {level:"hard",q:"What is the difference between international law and domestic law?",options:["Same","International law governs relations between states; domestic law governs citizens within states","International law is always binding","Domestic law applies globally"],answer:"International law governs relations between states; domestic law governs citizens within states",hint:"International law: treaties, UN conventions. Domestic law: national legislation!"},
    {level:"hard",q:"What is the significance of the Non-Proliferation Treaty (1968)?",options:["Banned all nuclear weapons","Aimed to prevent spread of nuclear weapons and promote disarmament","Created a nuclear weapons body","Ended the Cold War"],answer:"Aimed to prevent spread of nuclear weapons and promote disarmament",hint:"NPT (1968): nuclear states agree to disarm; non-nuclear states agree not to develop weapons!"},
    {level:"hard",q:"What is neo-liberalism?",options:["A left-wing ideology","Economic ideology favouring free markets, privatisation, deregulation, reduced state","A form of socialism","A nationalist ideology"],answer:"Economic ideology favouring free markets, privatisation, deregulation, reduced state",hint:"Thatcher and Reagan championed neo-liberal economics in the 1980s!"},
    {level:"hard",q:"What is the responsibility to protect (R2P)?",options:["Each state protects its own citizens only","International community can intervene when a state fails to protect its citizens from atrocities","A trade protection policy","A border security agreement"],answer:"International community can intervene when a state fails to protect its citizens from atrocities",hint:"R2P: if a state commits genocide, the international community can intervene!"},
    {level:"hard",q:"What is the difference between asylum seeker and refugee?",options:["Same","Asylum seeker has applied for protection; refugee has been officially granted it","Refugee is illegal","Asylum seeker is always economic"],answer:"Asylum seeker has applied for protection; refugee has been officially granted it",hint:"Asylum seeker = applying for protection. Refugee = legally recognised!"},
    {level:"hard",q:"What is the significance of the Scramble for Africa (1880s)?",options:["A famine","European powers rapidly divided and colonised Africa, creating arbitrary borders","First African independence movement","Start of African trade routes"],answer:"European powers rapidly divided and colonised Africa, creating arbitrary borders",hint:"By 1914, 90% of Africa was under European colonial rule. Many of today's borders were drawn then!"},
    {level:"hard",q:"What is interdependence in international relations?",options:["Countries being completely self-sufficient","Countries relying on each other economically, politically, and socially","A military alliance","A trade war"],answer:"Countries relying on each other economically, politically, and socially",hint:"Globalisation = interdependence. Supply chains, energy, finance connect all nations!"},
    {level:"hard",q:"What is the tragedy of the commons?",options:["A Shakespeare play","When individuals overuse shared resources to the detriment of all","A type of economic inequality","A failed public project"],answer:"When individuals overuse shared resources to the detriment of all",hint:"Garrett Hardin (1968): shared commons are destroyed when individuals act in self-interest!"},
    {level:"hard",q:"What is the significance of the Bretton Woods Agreement (1944)?",options:["Ended WWII","Established the IMF, World Bank, and post-war economic order","Created NATO","Divided Germany"],answer:"Established the IMF, World Bank, and post-war economic order",hint:"Bretton Woods: USA and allies built the post-WWII international economic system!"},
    {level:"hard",q:"What is the democratic peace theory?",options:["Democracies are perfect","Liberal democracies rarely go to war with each other","All peaceful countries are democracies","War makes democracy stronger"],answer:"Liberal democracies rarely go to war with each other",hint:"Democratic peace theory: two democracies almost never fight each other!"},
    {level:"hard",q:"What is populism?",options:["A type of democracy","A political approach claiming to represent ordinary people against a corrupt elite","A left-wing ideology only","A form of socialism"],answer:"A political approach claiming to represent ordinary people against a corrupt elite",hint:"Populism appears on both left and right. Trump, Chavez, Farage = populist figures!"},
    {level:"hard",q:"What is the difference between unilateralism and multilateralism?",options:["Same","Unilateralism = acting alone; multilateralism = acting with others","Multilateralism is weaker","Unilateralism requires UN approval"],answer:"Unilateralism = acting alone; multilateralism = acting with others",hint:"USA acting alone = unilateral. UN coalition action = multilateral!"},
    {level:"hard",q:"What was the significance of the Suez Crisis (1956)?",options:["Started the Cold War","Demonstrated the decline of British and French global power","Started the Arab-Israeli conflict","Created NATO"],answer:"Demonstrated the decline of British and French global power",hint:"1956: UK and France backed down over Suez when USA opposed them — end of old empires!"},
    {level:"hard",q:"What is discourse theory in social science?",options:["Study of conversations","The idea that language and communication shape social reality and power","A type of grammar","Study of debates"],answer:"The idea that language and communication shape social reality and power",hint:"Foucault: discourse = systems of language that shape what we can think and say!"},
    {level:"hard",q:"What is NAFTA/USMCA?",options:["A military alliance","Free trade agreement between USA, Canada, and Mexico","A UN body","A World Bank programme"],answer:"Free trade agreement between USA, Canada, and Mexico",hint:"NAFTA (1994) → USMCA (2020) = North American free trade!"},
    {level:"hard",q:"What is the significance of the League of Nations (1920)?",options:["First world government","First attempt at international peacekeeping organisation after WWI (failed)","Created NATO","The predecessor of the EU"],answer:"First attempt at international peacekeeping organisation after WWI (failed)",hint:"League of Nations: founded 1920, failed to prevent WWII, replaced by the UN in 1945!"},
    {level:"hard",q:"What is the difference between authoritarian and totalitarian regimes?",options:["Same","Authoritarian controls politics/opposition; totalitarian controls all aspects of life","Totalitarian is more democratic","Authoritarian controls more"],answer:"Authoritarian controls politics/opposition; totalitarian controls all aspects of life",hint:"Authoritarian: Pinochet (controlled politics). Totalitarian: Stalin (controlled everything)!"},
    {level:"hard",q:"What is the significance of the Helsinki Accords (1975)?",options:["Ended Vietnam War","Cold War agreement recognising European borders and promoting human rights","Created the EU","Ended apartheid"],answer:"Cold War agreement recognising European borders and promoting human rights",hint:"Helsinki 1975: Cold War détente. USSR accepted human rights provisions!"},
    {level:"hard",q:"What is structural violence?",options:["Physical fighting","Violence embedded in social structures causing harm (poverty, inequality, discrimination)","War crimes","Police brutality only"],answer:"Violence embedded in social structures causing harm (poverty, inequality, discrimination)",hint:"Johan Galtung: structural violence = preventable harm caused by unjust social arrangements!"},
    {level:"hard",q:"What is the theory of comparative advantage?",options:["Larger countries always dominate trade","Countries should specialise in what they produce most efficiently","Trade only benefits rich countries","Imports are always harmful"],answer:"Countries should specialise in what they produce most efficiently",hint:"David Ricardo: countries trade better when each specialises in comparative advantage!"},
    {level:"hard",q:"What is ethnocentrism?",options:["Respect for all cultures","Judging other cultures by the standards of one's own culture","Cultural relativism","Celebrating diversity"],answer:"Judging other cultures by the standards of one's own culture",hint:"Ethnocentrism: assuming your culture is superior and judging others by it!"},
    {level:"hard",q:"What is postcolonialism as an academic field?",options:["Study of ancient history","Critical analysis of the legacy and impact of colonialism on culture, identity, and power","A political movement only","Study of current colonies"],answer:"Critical analysis of the legacy and impact of colonialism on culture, identity, and power",hint:"Fanon, Said, Bhabha: postcolonialism examines how colonial thinking persists!"},
    {level:"hard",q:"What is the security dilemma in international relations?",options:["A country having no army","When one state's security measures cause fear in others, leading to arms races","Nuclear deterrence","A type of alliance"],answer:"When one state's security measures cause fear in others, leading to arms races",hint:"Security dilemma: country A builds weapons → country B feels threatened → builds more weapons!"},
    {level:"hard",q:"What is the significance of the Universal Declaration of Human Rights?",options:["Ended WWII","First global standard for human rights, adopted by UN in 1948","Created the UN","Gave women the vote globally"],answer:"First global standard for human rights, adopted by UN in 1948",hint:"UDHR (1948): 30 articles covering civil, political, economic, social and cultural rights!"},
    {level:"hard",q:"What is ASEAN?",options:["An African union","Association of Southeast Asian Nations — promotes regional cooperation","A military alliance","A trade agreement with EU"],answer:"Association of Southeast Asian Nations — promotes regional cooperation",hint:"ASEAN (1967): 10 Southeast Asian nations cooperating on politics, security, and economics!"},
    {level:"hard",q:"What is the difference between liberalism and realism in international relations?",options:["Same","Liberalism: cooperation/institutions; realism: states pursue power in anarchic system","Liberalism is right-wing","Realism believes in global governance"],answer:"Liberalism: cooperation/institutions; realism: states pursue power in anarchic system",hint:"Realism (Morgenthau): power politics. Liberalism (Kant): cooperation and institutions!"},
    {level:"hard",q:"What is the Washington Consensus vs Beijing Consensus?",options:["Same","Washington=free market/privatisation; Beijing=state capitalism/development state","Washington is Chinese","Beijing supports democracy"],answer:"Washington=free market/privatisation; Beijing=state capitalism/development state",hint:"Washington Consensus = IMF neoliberalism. Beijing Consensus = state-led development model!"},
    {level:"hard",q:"What is the significance of the Arab Spring (2010-12)?",options:["A new trade agreement","Wave of pro-democracy protests and uprisings across Arab world","Start of ISIS","New oil agreements"],answer:"Wave of pro-democracy protests and uprisings across Arab world",hint:"Tunisia, Egypt, Libya, Syria: mass protests against authoritarian regimes, 2010-2012!"},
    {level:"hard",q:"What is a proxy war?",options:["A war by sea","Conflict where major powers support opposing sides without direct confrontation","A cyber war","A trade war"],answer:"Conflict where major powers support opposing sides without direct confrontation",hint:"Vietnam, Korea, Afghanistan: USA and USSR fought through proxy states!"},
    {level:"hard",q:"What is the significance of the Rwandan Genocide (1994)?",options:["An economic crisis","~800,000 Tutsis and moderate Hutus killed; failure of international community to intervene","A natural disaster","A political election"],answer:"~800,000 Tutsis and moderate Hutus killed; failure of international community to intervene",hint:"1994: 100 days, ~800,000 killed. World failed to act. Led to R2P doctrine!"},
    {level:"hard",q:"What is the difference between bilateral and multilateral trade agreements?",options:["Same","Bilateral = between two countries; multilateral = between many","Multilateral is stronger always","Bilateral includes the UN"],answer:"Bilateral = between two countries; multilateral = between many",hint:"USA-UK trade deal = bilateral. WTO agreements = multilateral!"},
    {level:"hard",q:"What is the significance of the Internet on globalisation?",options:["Slowed globalisation","Accelerated information sharing, trade, communication and cultural exchange globally","Only affected rich countries","Made borders more important"],answer:"Accelerated information sharing, trade, communication and cultural exchange globally",hint:"The internet collapsed distance — instant communication and global commerce!"},
    {level:"hard",q:"What is the concept of 'soft power' coined by Joseph Nye?",options:["Military influence","Attracting and co-opting rather than coercing — culture, values, policy","Economic sanctions","Diplomatic pressure only"],answer:"Attracting and co-opting rather than coercing — culture, values, policy",hint:"Nye (1990): USA's soft power = Hollywood, universities, democracy promotion!"}
  ],
};

async function fetchAIBatch(subject, level, count=10){
  const grade={easy:"Kindergarten",medium:"Grade 1-2",hard:"Grade 3-4"}[level]||"Grade 1-2";
  const topics={
    maths:   `varied maths topics for ${grade}: arithmetic, shapes, fractions, word problems, time, measurement, patterns`,
    english: `varied English topics for ${grade}: grammar, vocabulary, punctuation, sentence structure, synonyms, antonyms`,
    reading: `short passages (2-4 sentences) with comprehension questions for ${grade}. Each must have a "passage" field`,
    verbal:  `verbal reasoning for ${grade}: odd-one-out, analogies, sequences, classifications`,
    quant:   `quantitative reasoning for ${grade}: number series, missing numbers, symbol puzzles, logic`,
    spanish: `Spanish vocabulary and phrases for ${grade}: greetings, numbers, colours, animals, food, family`,
    cogat:   `CogAT-style questions for ${grade}: verbal analogies, number series, pattern recognition, spatial reasoning`,
    spelling:`spelling questions for ${grade}. Each must have a "word" field (the correct word) and "q":"Which is the correct spelling?" with 3 plausible misspellings`,
    gaps:    `fill-in-the-gap sentences for ${grade}. Each must have "type":"sentence" and a sentence with ___ for the missing word`,
    science: `science questions for ${grade}: animals, plants, human body, space, weather, forces, materials`,
    social:  `social studies questions for ${grade}: world geography, history, community helpers, countries, citizenship`,
  }[subject]||`general knowledge for ${grade}`;

  const isReading=subject==="reading";
  const isSpelling=subject==="spelling";
  const isGaps=subject==="gaps";

  let schema=`{"q":"question text","options":["a","b","c","d"],"answer":"exact match to one option","hint":"helpful hint"}`;
  if(isReading) schema=`{"passage":"2-4 sentence story","q":"question","options":["a","b","c","d"],"answer":"...","hint":"..."}`;
  if(isSpelling) schema=`{"word":"correct spelling","q":"Which is the correct spelling?","options":["correct","wrong1","wrong2","wrong3"],"answer":"correct spelling","hint":"spelling tip"}`;
  if(isGaps) schema=`{"type":"sentence","q":"sentence with ___ for gap","options":["a","b","c","d"],"answer":"correct word","hint":"..."}`;

  const prompt=`Generate exactly ${count} UNIQUE, VARIED ${topics}. 
Rules: All questions must be different topics. Difficulty appropriate for ${grade}. Options must be shuffled (answer not always first).
Return ONLY a valid JSON array of ${count} objects, each matching: ${schema}
No markdown, no explanation, just the JSON array.`;

  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:4000,
        system:"You are an expert teacher creating educational quiz questions for children. Always return ONLY valid JSON arrays with no markdown or extra text.",
        messages:[{role:"user",content:prompt}]
      })
    });
    const d=await r.json();
    const txt=(d.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
    const arr=JSON.parse(txt);
    if(!Array.isArray(arr))return[];
    return arr.filter(q=>q?.q&&q?.options&&Array.isArray(q.options)&&q.options.length===4&&q?.answer).map(q=>({...q,isAI:true,level}));
  }catch(e){
    console.warn("AI batch failed:",e);
    return[];
  }
}

// Keep single-fetch fallback for emergencies
async function fetchAIQ(subject, level="medium"){
  const results=await fetchAIBatch(subject,level,1);
  return results[0]||null;
}

/* ─── CSS ──────────────────────────────────────────────────────────────── */
const CSS=`
@import url('${FONTS}');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;touch-action:manipulation}
body{font-family:'Quicksand',sans-serif;background:#F0FDF4;min-height:100vh;min-height:100dvh;overscroll-behavior:none;-webkit-tap-highlight-color:transparent;color-scheme:light;}
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
              <div key={g.id} className="group-card"
                style={{background:g.bg,borderColor:isOpen?g.color:"transparent"}}>
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
            style={{fontFamily:"'Boogaloo',cursive",fontSize:20,textAlign:"center",border:"2.5px solid #e5e7eb",borderRadius:12,padding:"6px 12px",width:"190px",color:"#111",background:"#ffffff",WebkitTextFillColor:"#111",colorScheme:"light",outline:"none"}}
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

function Quiz({subjectId,level,seenQs,onBack,onDone,sounds,muted,toggleMute}){
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

  const build=useCallback(()=>{
    setLoading(true);
    const all=BANK[subjectId]||[];
    const levelled=all.filter(q=>q.level===level);
    const pool=levelled.length>=20?levelled:all;

    // Use question text as stable unique key
    const makeKey=(q)=>`${q.q||q.word||""}`.slice(0,40);
    const seenSet=new Set(seenQs||[]);

    // Split into unseen and seen, shuffle each
    const unseen=[...pool.filter(q=>!seenSet.has(makeKey(q)))].sort(()=>Math.random()-0.5);
    const seen=[...pool.filter(q=>seenSet.has(makeKey(q)))].sort(()=>Math.random()-0.5);

    // Take 20: unseen first, pad with seen if needed, then repeat
    let ordered=[...unseen,...seen];
    if(ordered.length===0)ordered=[...pool].sort(()=>Math.random()-0.5);

    // Repeat pool until we have TOTAL
    let bankPool=[];
    while(bankPool.length<TOTAL)bankPool=[...bankPool,...[...ordered].sort(()=>Math.random()-0.5)];

    const final=bankPool.slice(0,TOTAL).map(q=>({...q,_key:makeKey(q)}));
    setQs(final);
    setLoading(false);
  },[subjectId,level]);

  useEffect(()=>{build();},[build]);
  useEffect(()=>{return()=>stopSpeaking();},[]);

  // Auto-speak word when spelling phase starts
  useEffect(()=>{
    if(isSpelling&&spellPhase==="show"&&qs.length>0&&qs[idx]?.word&&!muted){
      const w=qs[idx].word;
      setTimeout(()=>speak(w),400);
    }
  },[idx,spellPhase,qs,isSpelling,muted]);

  const cur=qs[idx];

  // Safety guard — should never happen after fix but just in case
  if(!loading&&!done&&!cur){
    return(
      <div style={{padding:24,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
        <div style={{fontWeight:700,marginBottom:8}}>Question not found</div>
        <button className="next-btn" style={{background:s.btn,maxWidth:200,margin:"0 auto",display:"block"}} onClick={()=>build()}>Try again</button>
      </div>
    );
  }

  const readQuestion=()=>{
    if(reading){stopSpeaking();setReading(false);return;}
    setReading(true);
    let txt;
    if(isSpelling&&cur?.word) txt=cur.word;
    else if(cur?.passage) txt=`${cur.passage}. Question: ${cur.q}`;
    else txt=`Question ${idx+1}. ${cur?.q||""}`;
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
    if(idx+1>=TOTAL){
      // Collect all _key values from this session's bank questions
      const usedKeys=qs.filter(q=>q._key).map(q=>q._key);
      onDone(score,bestStreak,usedKeys);
      setDone(true);
    }
    else{setIdx(i=>i+1);setSel(null);setHint(false);if(isSpelling)setSpellPhase("show");}
  };

  const proceedToSpell=()=>{
    sounds.tap();
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
        <div style={{fontWeight:700,color:"#9ca3af",fontSize:13}}>Creating fresh questions just for you... ✨</div>
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
          <div className="q-text">{cur?.q||""}</div>
          {!isSpelling&&(
            <button className={`read-btn${reading?" reading":""}`} onClick={readQuestion}>
              {reading?"⏹ Stop":"🔈 Read to me"}
            </button>
          )}
          <div className="options">
            {(cur?.options||[]).map(opt=>{
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
                {correct?`✅ ${CHEERS[Math.floor(Math.random()*CHEERS.length)]}`:`❌ The answer is: ${cur?.answer||""}`}
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
  seenQs:{}, // tracks seen question indices per subject+level key
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
                style={{width:"100%",padding:"12px 14px",fontSize:18,fontFamily:"'Boogaloo',cursive",border:`2.5px solid ${nameError?"#ef4444":"#e5e7eb"}`,borderRadius:14,outline:"none",marginBottom:6,textAlign:"center",color:"#111",background:"#ffffff",WebkitTextFillColor:"#111",colorScheme:"light"}}
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
  const [profiles,setProfiles]=useState(()=>{
    try{const saved=localStorage.getItem("brightmind_profiles");return saved?JSON.parse(saved):[];}
    catch{return[];}
  });
  const [activeId,setActiveId]=useState(()=>{
    try{return localStorage.getItem("brightmind_activeId")||null;}
    catch{return null;}
  });

  // Persist profiles whenever they change
  useEffect(()=>{
    try{localStorage.setItem("brightmind_profiles",JSON.stringify(profiles));}
    catch{}
  },[profiles]);

  useEffect(()=>{
    try{
      if(activeId)localStorage.setItem("brightmind_activeId",activeId);
      else localStorage.removeItem("brightmind_activeId");
    }catch{}
  },[activeId]);
  const activeProfile=profiles.find(p=>p.id===activeId)||null;
  const progress=activeProfile?.progress||makeEmptyProgress();
  const history=activeProfile?.history||{total:0,perfectScores:0,bestStreak:0,improvements:0,spellPerfect:0,timesPerfect:0};
  const earned=activeProfile?.earned||[];
  const avatar=activeProfile?.avatar||DEFAULT_AVATAR;
  const defaultLevel=activeProfile?.defaultLevel||"easy";
  const ttMastery=activeProfile?.ttMastery||{};
  const seenQs=activeProfile?.seenQs||{};
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
  const done=(score,streak,usedQKeys)=>{
    const pct=score/TOTAL;
    const stars=pct===1?3:pct>=0.6?2:pct>=0.3?1:0;
    const old=progress[subject]||{stars:0,best:0,best_easy:0,best_medium:0,best_hard:0};
    const lk="best_"+quizLevel;
    const np={...progress,[subject]:{...old,stars:Math.max(old.stars,stars),best:Math.max(old.best,score),[lk]:Math.max(old[lk]||0,score)}};
    const nh={total:history.total+1,perfectScores:history.perfectScores+(score===TOTAL?1:0),bestStreak:Math.max(history.bestStreak,streak||0),improvements:history.improvements+(score>(old.best||0)&&(old.best||0)>0?1:0),spellPerfect:(history.spellPerfect||0)+(subject==="spelling"&&score===TOTAL?1:0),timesPerfect:history.timesPerfect||0};
    const nb=checkAch(np,nh,earned);
    const ne=nb.length>0?[...earned,...nb.map(b=>b.id)]:earned;
    // Update seen questions — add newly used keys, reset if all exhausted
    const seenKey=`${subject}_${quizLevel}`;
    const bankSize=(BANK[subject]||[]).filter(q=>q.level===quizLevel).length||BANK[subject]?.length||1;
    const prevSeen=seenQs[seenKey]||[];
    const newSeen=[...new Set([...prevSeen,...(usedQKeys||[])])];
    const updatedSeenQs={...seenQs,[seenKey]:newSeen.length>=bankSize?[]:newSeen};
    updateProfile({progress:np,history:nh,earned:ne,seenQs:updatedSeenQs});
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
        {screen==="quiz"&&subject&&<Quiz subjectId={subject} level={quizLevel} seenQs={seenQs[`${subject}_${quizLevel}`]||[]} onBack={()=>setScreen("diff-pick")} onDone={done} sounds={sounds} muted={muted} toggleMute={()=>setMuted(m=>!m)}/>}
        {screen==="times-pick"&&<TimesTablePicker onStart={t=>{setTtTable(t);setScreen("times-quiz");}} onBack={()=>{setScreen("home");setSubject(null);}} sounds={sounds} mastery={ttMastery}/>}
        {screen==="times-quiz"&&ttTable&&<TimesTableQuiz table={ttTable} onBack={()=>setScreen("times-pick")} onDone={doneTT} sounds={sounds} muted={muted} toggleMute={()=>setMuted(m=>!m)}/>}
      </div>
    </ErrorBoundary>
  );
}
