import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Flame,
  Heart,
  Leaf,
  Moon,
  Mountain,
  Shield,
  Sparkles,
  Sun,
  Swords,
  Wind
} from "lucide-react";
import "./styles.css";

const quotes = [
  "A calm soul was once full of storms.",
  "A kind person was once learning how not to hurt.",
  "A humble person was once fighting their ego.",
  "A disciplined person was once learning how to begin.",
  "If you erased all your mistakes, you would erase yourself.",
  "You are not trapped as who you were yesterday.",
  "Do something today that tomorrow’s self will quietly thank you for."
];

const paths = [
  {
    title: "Peace",
    icon: Leaf,
    line: "Pause before reacting once today.",
    stat: "Calm"
  },
  {
    title: "Discipline",
    icon: Flame,
    line: "Do one hard thing for 10 minutes.",
    stat: "Will"
  },
  {
    title: "Kindness",
    icon: Heart,
    line: "Do one kind thing without needing credit.",
    stat: "Heart"
  },
  {
    title: "Humility",
    icon: Shield,
    line: "Tell the truth without making excuses.",
    stat: "Ego"
  }
];

const moodAdvice = {
  Amazing: "Use the good energy. Build something, help someone, or do the hard thing now.",
  Calm: "Protect this peace. Move slowly. Speak gently. Stay grateful.",
  Okay: "Okay is enough. Choose one small step and let that count.",
  Stressed: "Pause. Loosen your jaw. Breathe out longer than you breathe in. You do not need to react fast.",
  Heavy: "Be gentle with yourself. Heavy days still count. Just do the next kind thing."
};

function Button({ children, onClick, className = "" }) {
  return (
    <button onClick={onClick} className={`button ${className}`}>
      {children}
    </button>
  );
}

function GlassCard({ children, className = "" }) {
  return <div className={`glass-card ${className}`}>{children}</div>;
}

export default function App() {
  const [mood, setMood] = useState("Calm");
  const [completed, setCompleted] = useState([]);
  const [situation, setSituation] = useState("");
  const [reflection, setReflection] = useState("");
  const [calmMode, setCalmMode] = useState(false);

  const quote = useMemo(() => quotes[new Date().getDate() % quotes.length], []);
  const xp = completed.length * 150 + (reflection.length > 20 ? 100 : 0) + (situation.length > 20 ? 75 : 0);
  const level = Math.max(1, Math.floor(xp / 250) + 1);
  const progress = Math.min(100, Math.round((xp % 250) / 2.5));

  const togglePath = (title) => {
    setCompleted((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const coachText = situation.trim()
    ? "Before you answer, ask: would tomorrow’s self be proud of this response? Try: honest, calm, short, and respectful."
    : "Write the situation. Then slow down enough to choose the kind of person you want to be.";

  return (
    <div className="page">
      <div className="sky" />
      <div className="sun" />
      <div className="mountains" />
      <div className="field" />
      <div className="grain" />

      <main className="shell">
        <header className="nav">
          <div className="brand">
            <div className="brand-mark">
              <Sun size={25} />
            </div>
            <div>
              <h1>Tomorrow’s Self</h1>
              <p>For the person you are becoming.</p>
            </div>
          </div>

          <div className="level-card">
            <div>
              <span className="tiny">Level {level}</span>
              <strong>{xp} XP</strong>
            </div>
            <div className="progress">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        </header>

        <section className="hero">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="eyebrow">
              <Sparkles size={17} />
              Today’s wisdom
            </div>

            <h2>Become someone tomorrow-you admires.</h2>

            <p className="quote">“{quote}”</p>

            <div className="hero-actions">
              <Button className="primary" onClick={() => window.scrollTo({ top: 620, behavior: "smooth" })}>
                Start today’s path
              </Button>
              <Button className="ghost" onClick={() => setCalmMode(true)}>
                Emergency calm
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="scene-card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="scene-sun" />
            <div className="scene-hills" />
            <div className="dog">🐕‍🦺</div>
            <div className="flower">🌹</div>
            <div className="scene-text">
              <span>Your companion</span>
              <h3>The field grows as you do.</h3>
              <p>Each peaceful choice adds light to your inner world.</p>
            </div>
          </motion.div>
        </section>

        <section className="mood-row">
          {Object.keys(moodAdvice).map((item) => (
            <button
              className={`mood ${mood === item ? "active" : ""}`}
              key={item}
              onClick={() => setMood(item)}
            >
              <span>
                {item === "Amazing" ? "😄" : item === "Calm" ? "😌" : item === "Okay" ? "🙂" : item === "Stressed" ? "😟" : "🌧️"}
              </span>
              <strong>{item}</strong>
            </button>
          ))}
        </section>

        <GlassCard className="advice">
          <Wind />
          <p>{moodAdvice[mood]}</p>
        </GlassCard>

        <section className="path-grid">
          {paths.map(({ title, icon: Icon, line, stat }) => {
            const done = completed.includes(title);
            return (
              <GlassCard key={title} className={done ? "path done" : "path"}>
                <div className="path-top">
                  <Icon />
                  <span>{stat}</span>
                </div>
                <h3>{title}</h3>
                <p>{line}</p>
                <Button onClick={() => togglePath(title)} className={done ? "complete" : "small-ghost"}>
                  {done && <CheckCircle2 size={17} />}
                  {done ? "Completed" : "Mark done"}
                </Button>
              </GlassCard>
            );
          })}
        </section>

        <section className="two-col">
          <GlassCard>
            <div className="card-title">
              <Swords />
              <h3>Respond, Don’t React</h3>
            </div>
            <p className="muted">What happened?</p>
            <textarea
              value={situation}
              onChange={(event) => setSituation(event.target.value)}
              placeholder="Example: Someone disrespected me and I want to snap back..."
            />
            <div className="coach-box">{coachText}</div>
          </GlassCard>

          <GlassCard>
            <div className="card-title">
              <BookOpen />
              <h3>Evening Reflection</h3>
            </div>
            <p className="muted">What would tomorrow’s self thank you for?</p>
            <textarea
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              placeholder="Today I chose..."
            />
            <div className="moon-note">
              <Moon size={19} />
              End the day with peace, not perfection.
            </div>
          </GlassCard>
        </section>

        <section className="mantra">
          <Mountain />
          <h3>You are still becoming.</h3>
          <p>A better life is built through small choices repeated quietly.</p>
        </section>
      </main>

      {calmMode && (
        <div className="modal-backdrop">
          <motion.div
            className="calm-modal"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            <button className="close" onClick={() => setCalmMode(false)}>×</button>
            <div className="breathing-circle">
              <span>Breathe</span>
            </div>
            <h3>Emergency Calm</h3>
            <p>Inhale for 4. Hold for 2. Exhale for 6. You are allowed to slow down before you respond.</p>
            <Button className="primary" onClick={() => setCalmMode(false)}>I’m ready</Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
