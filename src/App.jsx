import { useState, useEffect, useCallback } from "react";

const GOOGLE_FONT = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap";

// ── Fixed question bank ─────────────────────────────────────────────────────
const QUESTION_BANK = {
  maths: [
    { q: "What is 3 + 4?", options: ["5", "7", "6", "8"], answer: "7", hint: "Count 3 fingers then 4 more!" },
    { q: "What is 10 - 3?", options: ["6", "8", "7", "5"], answer: "7", hint: "Start at 10 and count back 3 steps." },
    { q: "Which number is biggest?", options: ["12", "7", "19", "15"], answer: "19", hint: "The biggest number has the most." },
    { q: "How many sides does a triangle have?", options: ["4", "2", "3", "5"], answer: "3", hint: "Tri means three!" },
    { q: "What is 5 × 2?", options: ["7", "10", "8", "12"], answer: "10", hint: "5 groups of 2 — count by 2s five times." },
    { q: "What comes next? 2, 4, 6, __", options: ["7", "9", "8", "10"], answer: "8", hint: "Add 2 each time." },
    { q: "If you have 8 apples and eat 3, how many left?", options: ["4", "6", "5", "11"], answer: "5", hint: "8 take away 3." },
    { q: "What is half of 10?", options: ["4", "6", "5", "3"], answer: "5", hint: "Split 10 into 2 equal groups." },
  ],
  english: [
    { q: "Which word is a noun (a person, place, or thing)?", options: ["run", "happy", "dog", "quickly"], answer: "dog", hint: "A noun is a person, place, or thing you can touch or see." },
    { q: "Pick the correct spelling:", options: ["freind", "friend", "frend", "firend"], answer: "friend", hint: "I before E except after C!" },
    { q: "Which sentence uses a capital letter correctly?", options: ["the cat sat.", "The cat sat.", "the Cat sat.", "The Cat Sat."], answer: "The cat sat.", hint: "Every sentence starts with a capital letter." },
    { q: "What is the opposite of 'hot'?", options: ["warm", "cold", "big", "fast"], answer: "cold", hint: "Think about the weather in winter." },
    { q: "Which word is a verb (an action word)?", options: ["house", "blue", "jump", "tree"], answer: "jump", hint: "A verb is something you can DO." },
    { q: "Add a full stop: 'The dog ran fast__'", options: ["!", "?", ".", ","], answer: ".", hint: "A telling sentence ends with a full stop." },
    { q: "Which word means 'very big'?", options: ["tiny", "huge", "soft", "quiet"], answer: "huge", hint: "Think of something like a giant!" },
    { q: "Pick the plural of 'cat':", options: ["cates", "cats", "caties", "cat"], answer: "cats", hint: "Most words just need an 's' at the end." },
  ],
  reading: [
    {
      passage: "Lily loves the rain. She puts on her yellow boots and splashes in puddles. Her dog Max jumps in too! They both get very wet but they are very happy.",
      q: "What colour are Lily's boots?",
      options: ["Red", "Blue", "Yellow", "Green"],
      answer: "Yellow",
      hint: "Read the second sentence again."
    },
    {
      passage: "Tom found a tiny seed in the garden. He planted it in the soil and watered it every day. After two weeks, a small green shoot appeared. Tom was so excited!",
      q: "How did Tom feel when the shoot appeared?",
      options: ["Sad", "Excited", "Tired", "Angry"],
      answer: "Excited",
      hint: "Look at the last sentence."
    },
    {
      passage: "The library is a quiet place. People go there to read books and learn new things. You must whisper so you don't disturb others. Sam loves visiting every Saturday.",
      q: "Why must you whisper in the library?",
      options: ["It is dark", "The librarian says so", "To not disturb others", "The books are fragile"],
      answer: "To not disturb others",
      hint: "The passage explains the reason."
    },
    {
      passage: "Mia has three pets: a fluffy rabbit called Snowball, a goldfish called Bubbles, and a parrot named Polly. Polly can say 'hello' and 'goodnight'. Mia feeds them every morning.",
      q: "Which pet can talk?",
      options: ["Snowball", "Bubbles", "Polly", "All of them"],
      answer: "Polly",
      hint: "Which animal is known for talking?"
    },
  ],
  verbal: [
    { q: "Which word doesn't belong?\nApple 🍎 — Banana 🍌 — Carrot 🥕 — Grape 🍇", options: ["Apple", "Banana", "Carrot", "Grape"], answer: "Carrot", hint: "Three are fruits. One is a vegetable." },
    { q: "Cat is to kitten as dog is to...?", options: ["kennel", "puppy", "bark", "leash"], answer: "puppy", hint: "A baby cat is a kitten. A baby dog is...?" },
    { q: "What comes next?\nHappy → Sad, Big → Small, Fast → __?", options: ["Quick", "Slow", "Run", "Speed"], answer: "Slow", hint: "These are all opposites (antonyms)." },
    { q: "Sun is to day as moon is to...?", options: ["sky", "star", "night", "cloud"], answer: "night", hint: "The sun appears in the day. The moon appears at..." },
    { q: "Which word is most similar to 'brave'?", options: ["scared", "funny", "courageous", "clumsy"], answer: "courageous", hint: "A firefighter is brave and courageous." },
    { q: "Pick the odd one out:\nRed 🔴 — Blue 🔵 — Green 🟢 — Jump 🦘", options: ["Red", "Blue", "Green", "Jump"], answer: "Jump", hint: "Three are colours. One is an action." },
  ],
};

// ── Subject config ─────────────────────────────────────────────────────────
const SUBJECTS = [
  { id: "maths",   label: "Maths",      emoji: "🔢", color: "#4A90D9", light: "#E8F3FF", dark: "#2563a8" },
  { id: "english", label: "English",    emoji: "✏️",  color: "#9B59B6", light: "#F3E8FF", dark: "#7b3fa0" },
  { id: "reading", label: "Reading",    emoji: "📖",  color: "#27AE60", light: "#E8FFF0", dark: "#1a8a49" },
  { id: "verbal",  label: "Verbal",     emoji: "💬",  color: "#F39C12", light: "#FFF8E8", dark: "#c47d0a" },
];

// ── Stars / XP ─────────────────────────────────────────────────────────────
const STAR_MESSAGES = ["Amazing! ⭐", "Brilliant! 🌟", "Super star! 💫", "Wow! 🎉", "Great job! 🏆"];

// ── Claude API call ─────────────────────────────────────────────────────────
async function fetchAIQuestion(subject) {
  const prompts = {
    maths: "Generate 1 maths question for a 5-7 year old child (K-2). Topics: addition, subtraction under 20, counting, shapes, simple patterns. Return ONLY valid JSON: {\"q\":\"question\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"correct option\",\"hint\":\"short child-friendly hint\"}",
    english: "Generate 1 English language question for a 5-7 year old (K-2). Topics: simple grammar, spelling, punctuation, vocabulary. Return ONLY valid JSON: {\"q\":\"question\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"correct option\",\"hint\":\"short child-friendly hint\"}",
    reading: "Generate a very short reading comprehension (2-3 sentences) for ages 5-7 with 1 question. Return ONLY valid JSON: {\"passage\":\"short passage\",\"q\":\"question\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"correct option\",\"hint\":\"short child-friendly hint\"}",
    verbal: "Generate 1 verbal reasoning question for ages 5-7. Types: odd-one-out, analogies, synonyms/antonyms, simple sequences. Return ONLY valid JSON: {\"q\":\"question\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":\"correct option\",\"hint\":\"short child-friendly hint\"}",
  };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: "You are a friendly teacher creating quiz questions for young children aged 5-7. Always respond with ONLY valid JSON, no markdown, no extra text.",
        messages: [{ role: "user", content: prompts[subject] }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// ── Styles ─────────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <>
    <link href={GOOGLE_FONT} rel="stylesheet" />
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Nunito', sans-serif; background: #FFF9F0; min-height: 100vh; }
      .app { max-width: 680px; margin: 0 auto; padding: 16px; min-height: 100vh; }

      /* Home */
      .home-header { text-align: center; padding: 28px 0 20px; }
      .home-title { font-family: 'Fredoka One', cursive; font-size: 42px; color: #FF6B6B; letter-spacing: 1px; line-height: 1.1; }
      .home-subtitle { font-size: 16px; color: #888; margin-top: 6px; font-weight: 600; }
      .subject-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 24px; }
      .subject-card { border-radius: 20px; padding: 24px 20px; cursor: pointer; border: 3px solid transparent;
        transition: transform 0.15s, box-shadow 0.15s; position: relative; overflow: hidden; }
      .subject-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      .subject-card:active { transform: scale(0.98); }
      .subject-emoji { font-size: 44px; display: block; margin-bottom: 10px; }
      .subject-name { font-family: 'Fredoka One', cursive; font-size: 22px; }
      .subject-stars { font-size: 13px; font-weight: 700; color: #999; margin-top: 4px; }
      .star-filled { color: #FFD700; }

      /* Score badge on home */
      .score-badge { position: absolute; top: 12px; right: 12px; background: white;
        border-radius: 99px; padding: 4px 10px; font-size: 12px; font-weight: 800; }

      /* Top bar */
      .topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
      .back-btn { background: white; border: 2px solid #eee; border-radius: 12px;
        padding: 8px 14px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Nunito', sans-serif;
        transition: background 0.1s; }
      .back-btn:hover { background: #f0f0f0; }
      .topbar-title { font-family: 'Fredoka One', cursive; font-size: 22px; flex: 1; }
      .xp-bar-wrap { background: #eee; border-radius: 99px; height: 10px; flex: 1; overflow: hidden; }
      .xp-bar-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease; }

      /* Question card */
      .q-card { background: white; border-radius: 24px; padding: 28px 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.07); margin-bottom: 16px; }
      .passage-box { background: #FFFBE6; border-left: 4px solid #F39C12; border-radius: 12px;
        padding: 14px 16px; font-size: 15px; line-height: 1.7; margin-bottom: 18px; color: #555; font-weight: 600; }
      .q-number { font-size: 12px; font-weight: 800; color: #bbb; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; }
      .q-text { font-size: 19px; font-weight: 800; color: #222; line-height: 1.4; white-space: pre-line; }

      /* Options */
      .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
      .option-btn { border-radius: 14px; padding: 14px 12px; font-size: 16px; font-weight: 800;
        border: 3px solid transparent; cursor: pointer; transition: all 0.15s;
        font-family: 'Nunito', sans-serif; text-align: center; }
      .option-btn:hover:not(:disabled) { transform: scale(1.03); }
      .option-btn:disabled { cursor: default; }
      .option-default { background: #F5F5F5; color: #333; border-color: #E0E0E0; }
      .option-correct { background: #D4EDDA; color: #155724; border-color: #28A745; }
      .option-wrong { background: #F8D7DA; color: #721C24; border-color: #DC3545; }
      .option-missed { background: #D4EDDA; color: #155724; border-color: #28A745; opacity: 0.7; }

      /* Feedback */
      .feedback { border-radius: 16px; padding: 14px 18px; margin-top: 14px;
        font-size: 15px; font-weight: 700; animation: popIn 0.2s; }
      .feedback-correct { background: #D4EDDA; color: #155724; }
      .feedback-wrong { background: #F8D7DA; color: #721C24; }
      @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

      /* Hint */
      .hint-btn { background: none; border: 2px dashed #FFD700; color: #C7A000; border-radius: 12px;
        padding: 8px 16px; font-size: 13px; font-weight: 800; cursor: pointer; margin-top: 12px;
        font-family: 'Nunito', sans-serif; transition: background 0.1s; }
      .hint-btn:hover { background: #FFFBE6; }
      .hint-box { background: #FFFBE6; border-radius: 12px; padding: 10px 14px; margin-top: 10px;
        font-size: 14px; color: #C7A000; font-weight: 700; }

      /* Next btn */
      .next-btn { width: 100%; padding: 16px; border-radius: 16px; font-family: 'Fredoka One', cursive;
        font-size: 20px; border: none; cursor: pointer; margin-top: 14px;
        transition: transform 0.1s, box-shadow 0.1s; color: white; }
      .next-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
      .next-btn:active { transform: scale(0.98); }

      /* AI loading */
      .ai-loading { text-align: center; padding: 48px 24px; }
      .spinner { width: 44px; height: 44px; border: 4px solid #eee;
        border-top-color: #4A90D9; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 16px; }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* Results */
      .results-card { background: white; border-radius: 24px; padding: 36px 28px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.07); text-align: center; }
      .results-emoji { font-size: 72px; display: block; margin-bottom: 12px; animation: bounce 0.5s; }
      @keyframes bounce { 0%,100%{transform:scale(1)}50%{transform:scale(1.2)} }
      .results-title { font-family: 'Fredoka One', cursive; font-size: 32px; margin-bottom: 8px; }
      .results-score { font-size: 52px; font-weight: 900; margin: 12px 0; }
      .results-msg { font-size: 16px; color: #777; font-weight: 600; margin-bottom: 24px; }
      .results-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      .results-btn { border-radius: 14px; padding: 12px 24px; font-family: 'Fredoka One', cursive;
        font-size: 18px; border: none; cursor: pointer; transition: transform 0.1s; color: white; }
      .results-btn:hover { transform: scale(1.05); }

      /* Progress bar at top of quiz */
      .progress-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
      .prog-dot { width: 12px; height: 12px; border-radius: 50%; background: #eee; transition: background 0.3s; flex-shrink: 0; }
      .prog-dot.done { background: #28A745; }
      .prog-dot.current { background: #4A90D9; transform: scale(1.3); }

      /* Stars display */
      .stars-row { display: flex; gap: 4px; justify-content: center; font-size: 28px; margin: 8px 0; }

      /* AI badge */
      .ai-badge { display: inline-flex; align-items: center; gap: 4px; background: #EDE9FE;
        color: #7C3AED; border-radius: 99px; font-size: 11px; font-weight: 800; padding: 3px 10px; margin-bottom: 12px; }
    `}</style>
  </>
);

// ── Stars component ────────────────────────────────────────────────────────
function Stars({ count, max = 3 }) {
  return (
    <span>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < count ? "star-filled" : ""} style={{ opacity: i < count ? 1 : 0.25 }}>⭐</span>
      ))}
    </span>
  );
}

// ── Home Screen ────────────────────────────────────────────────────────────
function HomeScreen({ progress, onSelect }) {
  return (
    <div>
      <div className="home-header">
        <div className="home-title">🌈 BrightMind</div>
        <div className="home-subtitle">Learning is fun! Pick a subject 👇</div>
      </div>
      <div className="subject-grid">
        {SUBJECTS.map(s => {
          const stars = progress[s.id]?.stars || 0;
          const best = progress[s.id]?.best || 0;
          return (
            <div
              key={s.id}
              className="subject-card"
              style={{ background: s.light, borderColor: s.color }}
              onClick={() => onSelect(s.id)}
            >
              {best > 0 && (
                <div className="score-badge" style={{ color: s.dark }}>
                  Best: {best}/5
                </div>
              )}
              <span className="subject-emoji">{s.emoji}</span>
              <div className="subject-name" style={{ color: s.dark }}>{s.label}</div>
              <div className="subject-stars">
                <Stars count={stars} max={3} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: "#bbb", fontWeight: 700 }}>
        Complete 5 questions per subject to earn stars ⭐
      </div>
    </div>
  );
}

// ── Quiz Screen ────────────────────────────────────────────────────────────
const TOTAL_Q = 5;

function QuizScreen({ subjectId, onFinish, onBack }) {
  const subject = SUBJECTS.find(s => s.id === subjectId);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiUsed, setAiUsed] = useState(false);

  // Build 5 questions: 2 from AI (if available), rest from bank
  const buildQuestions = useCallback(async () => {
    setLoading(true);
    const bank = [...QUESTION_BANK[subjectId]];
    // Shuffle bank
    for (let i = bank.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bank[i], bank[j]] = [bank[j], bank[i]];
    }
    const fixed = bank.slice(0, 4);

    // Try to get 1 AI question
    const ai = await fetchAIQuestion(subjectId);
    let qs;
    if (ai && ai.q && ai.options && ai.answer) {
      qs = [...fixed.slice(0, 4), { ...ai, isAI: true }];
      setAiUsed(true);
    } else {
      qs = bank.slice(0, 5);
    }
    // Shuffle final list
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
    setQuestions(qs);
    setLoading(false);
  }, [subjectId]);

  useEffect(() => { buildQuestions(); }, [buildQuestions]);

  const current = questions[idx];

  const handleAnswer = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === current.answer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (idx + 1 >= TOTAL_Q) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setSelected(null);
      setShowHint(false);
    }
  };

  if (loading) return (
    <div>
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="topbar-title" style={{ color: subject.color }}>{subject.emoji} {subject.label}</div>
      </div>
      <div className="ai-loading">
        <div className="spinner" style={{ borderTopColor: subject.color }} />
        <div style={{ fontWeight: 700, color: "#aaa" }}>Preparing your questions...</div>
      </div>
    </div>
  );

  if (done) return <ResultsScreen score={score} total={TOTAL_Q} subject={subject} onBack={onBack} onRetry={() => {
    setQuestions([]); setIdx(0); setSelected(null); setShowHint(false); setScore(0); setDone(false); buildQuestions();
  }} />;

  const isCorrect = selected === current.answer;

  const getStars = (s) => s >= 5 ? 3 : s >= 3 ? 2 : s >= 1 ? 1 : 0;

  return (
    <div>
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="topbar-title" style={{ color: subject.color }}>{subject.emoji} {subject.label}</div>
        <div style={{ fontWeight: 800, fontSize: 15, color: subject.color }}>{score}/{idx} ⭐</div>
      </div>

      {/* Progress dots */}
      <div className="progress-row">
        {Array.from({ length: TOTAL_Q }).map((_, i) => (
          <div key={i} className={`prog-dot ${i < idx ? "done" : i === idx ? "current" : ""}`} style={i === idx ? { background: subject.color } : {}} />
        ))}
        <div style={{ flex: 1, height: 6, background: "#eee", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(idx / TOTAL_Q) * 100}%`, background: subject.color, borderRadius: 99, transition: "width 0.3s" }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#aaa" }}>{idx + 1}/{TOTAL_Q}</div>
      </div>

      <div className="q-card">
        {current.isAI && <div className="ai-badge">✨ AI question</div>}
        {current.passage && <div className="passage-box">{current.passage}</div>}
        <div className="q-number">Question {idx + 1}</div>
        <div className="q-text">{current.q}</div>

        <div className="options-grid">
          {current.options.map(opt => {
            let cls = "option-btn option-default";
            if (selected !== null) {
              if (opt === current.answer) cls = "option-btn option-correct";
              else if (opt === selected) cls = "option-btn option-wrong";
            }
            return (
              <button key={opt} className={cls} disabled={selected !== null} onClick={() => handleAnswer(opt)}>
                {opt}
              </button>
            );
          })}
        </div>

        {selected === null && !showHint && (
          <button className="hint-btn" onClick={() => setShowHint(true)}>💡 Need a hint?</button>
        )}
        {showHint && selected === null && (
          <div className="hint-box">💡 {current.hint}</div>
        )}

        {selected !== null && (
          <>
            <div className={`feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`}>
              {isCorrect
                ? `✅ ${STAR_MESSAGES[Math.floor(Math.random() * STAR_MESSAGES.length)]}`
                : `❌ Not quite! The answer is: ${current.answer}`}
            </div>
            {!isCorrect && <div className="hint-box">💡 {current.hint}</div>}
            <button
              className="next-btn"
              style={{ background: subject.color }}
              onClick={handleNext}
            >
              {idx + 1 >= TOTAL_Q ? "See Results 🎉" : "Next Question →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Results Screen ─────────────────────────────────────────────────────────
function ResultsScreen({ score, total, subject, onBack, onRetry }) {
  const pct = score / total;
  const stars = score >= total ? 3 : score >= Math.ceil(total * 0.6) ? 2 : score >= 1 ? 1 : 0;
  const emoji = pct === 1 ? "🏆" : pct >= 0.6 ? "🌟" : pct >= 0.2 ? "👍" : "💪";
  const msg = pct === 1 ? "Perfect score! You're a superstar!" : pct >= 0.6 ? "Great work! Keep it up!" : pct >= 0.2 ? "Good try! Practice makes perfect!" : "Keep trying — you'll get there!";

  return (
    <div>
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>← Home</button>
        <div className="topbar-title" style={{ color: subject.color }}>{subject.emoji} {subject.label}</div>
      </div>
      <div className="results-card">
        <span className="results-emoji">{emoji}</span>
        <div className="results-title" style={{ color: subject.color }}>Quiz Complete!</div>
        <div className="stars-row"><Stars count={stars} max={3} /></div>
        <div className="results-score" style={{ color: subject.color }}>{score}/{total}</div>
        <div className="results-msg">{msg}</div>
        <div className="results-btns">
          <button className="results-btn" style={{ background: subject.color }} onClick={onRetry}>Try Again 🔄</button>
          <button className="results-btn" style={{ background: "#6c757d" }} onClick={onBack}>Home 🏠</button>
        </div>
      </div>
    </div>
  );
}

// ── App Root ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [activeSubject, setActiveSubject] = useState(null);
  const [progress, setProgress] = useState(() => {
    const saved = {};
    SUBJECTS.forEach(s => { saved[s.id] = { stars: 0, best: 0 }; });
    return saved;
  });

  const handleSelect = (id) => { setActiveSubject(id); setScreen("quiz"); };
  const handleBack = () => { setScreen("home"); setActiveSubject(null); };

  const handleFinish = (subjectId, score) => {
    const stars = score >= 5 ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0;
    setProgress(p => ({
      ...p,
      [subjectId]: {
        stars: Math.max(p[subjectId]?.stars || 0, stars),
        best: Math.max(p[subjectId]?.best || 0, score),
      }
    }));
  };

  return (
    <div className="app">
      <GlobalStyle />
      {screen === "home" && <HomeScreen progress={progress} onSelect={handleSelect} />}
      {screen === "quiz" && activeSubject && (
        <QuizScreen
          subjectId={activeSubject}
          onFinish={(score) => handleFinish(activeSubject, score)}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
