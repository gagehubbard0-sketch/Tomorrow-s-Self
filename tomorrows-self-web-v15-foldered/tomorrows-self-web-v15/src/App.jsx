
import React, { useRef, useState } from "react";
import {
  Bell, BookOpen, CalendarDays, CheckCircle2, Flame, Home, Library,
  LineChart, Mountain, Music, Play, Quote, Search, Settings, Shield,
  Sparkles, Target, Trophy, User, Users, Wind, Zap
} from "lucide-react";
import "./styles.css";

const questsStart = [
  { id: "morning", title: "Morning Routine", xp: 20, done: true },
  { id: "workout", title: "Workout", xp: 25, done: true },
  { id: "cold", title: "Cold Shower", xp: 15, done: true },
  { id: "read", title: "Read 10 Pages", xp: 20, done: false },
  { id: "clean", title: "No Porn / Clean Mind", xp: 25, done: true },
  { id: "meditate", title: "Meditation", xp: 15, done: false },
  { id: "sleep", title: "Sleep Before 11PM", xp: 15, done: true },
];

const streaksStart = [
  { name: "No Porn • Clean Mind", days: 17, value: 92, color: "orange" },
  { name: "Eating Healthier", days: 12, value: 72, color: "green" },
  { name: "Cold Showers", days: 9, value: 62, color: "blue" },
];

const moods = [
  { label: "Heavy", icon: "😔", color: "#7b61d8" },
  { label: "Low", icon: "😟", color: "#3a8bbf" },
  { label: "Okay", icon: "🙂", color: "#d6a44f" },
  { label: "Steady", icon: "😌", color: "#76a96f" },
  { label: "Strong", icon: "😤", color: "#c95b51" },
];

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Bar({ value, color = "gold" }) {
  return <div className={`bar ${color}`}><i style={{ width: `${value}%` }} /></div>;
}

export default function App() {
  const [quests, setQuests] = useState(questsStart);
  const [streaks, setStreaks] = useState(streaksStart);
  const [mood, setMood] = useState("Steady");
  const [journal, setJournal] = useState("Today was a good day.\nI stayed disciplined and completed most of my goals.\n\nI felt peaceful during the evening. Grateful for the progress, not the perfection.");
  const [quote, setQuote] = useState(0);
  const [sound, setSound] = useState("Rain");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const quotes = [
    "Discipline today. Freedom tomorrow.",
    "Control your mind before the world controls it.",
    "A hard-working person was once lazy.",
    "The strongest minds stay gentle.",
    "Small promises kept become self-respect.",
  ];

  const doneCount = quests.filter(q => q.done).length;
  const progress = Math.round((doneCount / quests.length) * 100);

  function toggleQuest(id) {
    setQuests(quests.map(q => q.id === id ? { ...q, done: !q.done } : q));
  }

  function playSound(name = sound) {
    setSound(name);

    try {
      stopSound(false);

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();

      const master = ctx.createGain();
      master.gain.value = 0.12;
      master.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      const settings = {
        Rain: { a: 160, b: 210, type: "sawtooth", g1: 0.035, g2: 0.018 },
        Forest: { a: 132, b: 196, type: "sine", g1: 0.045, g2: 0.016 },
        Night: { a: 82, b: 124, type: "triangle", g1: 0.05, g2: 0.018 },
        Fire: { a: 95, b: 145, type: "sawtooth", g1: 0.04, g2: 0.02 },
        Temple: { a: 110, b: 220, type: "sine", g1: 0.05, g2: 0.012 },
        Waves: { a: 70, b: 105, type: "triangle", g1: 0.05, g2: 0.02 },
      }[name] || { a: 120, b: 180, type: "sine", g1: 0.04, g2: 0.02 };

      osc1.type = settings.type;
      osc2.type = "sine";
      osc1.frequency.value = settings.a;
      osc2.frequency.value = settings.b;
      gain1.gain.value = settings.g1;
      gain2.gain.value = settings.g2;

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08;
      lfoGain.gain.value = 0.018;
      lfo.connect(lfoGain);
      lfoGain.connect(master.gain);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(master);
      gain2.connect(master);

      osc1.start();
      osc2.start();
      lfo.start();

      audioRef.current = { ctx, nodes: [osc1, osc2, lfo], master };
      setIsPlaying(true);
    } catch (e) {
      alert("Your browser blocked audio. Click the play button again.");
    }
  }

  function stopSound(update = true) {
    if (audioRef.current) {
      try {
        audioRef.current.nodes.forEach(n => n.stop());
        audioRef.current.ctx.close();
      } catch {}
      audioRef.current = null;
    }
    if (update) setIsPlaying(false);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Flame size={26}/></div>
          <div>
            <h1>TOMORROW'S SELF</h1>
            <p>Become your best self.</p>
          </div>
        </div>

        <nav className="side-nav">
          {[
            [Home, "Home"],
            [Target, "Daily Quests"],
            [BookOpen, "Journal"],
            [CalendarDays, "Calendar"],
            [Flame, "Streaks"],
            [Zap, "Paths"],
            [LineChart, "Stats"],
            [Sparkles, "Spellwork"],
            [Library, "Library"],
            [Settings, "Settings"],
          ].map(([Icon, label], i) => (
            <button key={label} className={i === 0 ? "active" : ""}><Icon size={20}/>{label}</button>
          ))}
        </nav>

        <div className="user-card">
          <div className="mini-avatar"></div>
          <div>
            <b>Warrior</b>
            <span>Level 4 • Quiet Builder</span>
          </div>
          <span>›</span>
        </div>
        <Bar value={76}/>
        <small className="xp">680 / 900 XP</small>
      </aside>

      <main className="dashboard">
        <section className="hero-panel">
          <div className="hero-art">
            <div className="moon"></div>
            <div className="mountains"></div>
            <div className="anime-man"></div>
            <div className="fog"></div>
          </div>

          <div className="hero-top">
            <div>
              <h2>Good morning, Warrior.</h2>
              <p>Discipline today. Freedom tomorrow.</p>
            </div>
            <div className="top-actions">
              <button><Search size={18}/></button>
              <button><Bell size={18}/></button>
              <button className="avatar-btn"></button>
            </div>
          </div>

          <div className="quote-box">
            <Quote size={18}/>
            <p>“{quotes[quote]}”</p>
            <button onClick={() => setQuote((quote + 1) % quotes.length)}>New Quote</button>
          </div>

          <div className="progress-float">
            <div className="flame-icon">🔥</div>
            <div>
              <span>Your Progression</span>
              <h3>Level 4</h3>
              <p>Quiet Builder</p>
              <Bar value={76}/>
              <small>680 / 900 XP</small>
            </div>
            <div className="progress-numbers">
              <b>17</b><span>Day Streak</span>
              <b>{doneCount} / {quests.length}</b><span>Quests Today</span>
            </div>
          </div>
        </section>

        <section className="grid">
          <Card className="quests">
            <div className="card-head">
              <h3><Shield size={18}/> Daily Quests</h3>
              <span>{doneCount} / {quests.length} completed</span>
            </div>
            <div className="quest-list">
              {quests.map(q => (
                <button key={q.id} onClick={() => toggleQuest(q.id)} className={q.done ? "quest done" : "quest"}>
                  <span>{q.done ? <CheckCircle2 size={18}/> : ""}</span>
                  <b>{q.title}</b>
                  <em>+{q.xp} XP</em>
                </button>
              ))}
            </div>
            <button className="full-btn">View All Quests</button>
          </Card>

          <Card className="intention">
            <h3>Today's Intention</h3>
            <textarea value="I will stay focused and protect my peace." readOnly />
            <div className="chips">
              {["🔥 Discipline", "💚 Health", "💧 Peace", "⭐ Growth", "🧠 Mind"].map(c => <button key={c}>{c}</button>)}
            </div>
            <div className="quick-actions">
              <button>Journal</button><button>Meditate</button><button>Breathwork</button><button>Spellwork</button>
            </div>
          </Card>

          <Card className="streaks">
            <div className="card-head">
              <h3><Flame size={18}/> Streaks</h3>
              <button>View All</button>
            </div>
            {streaks.map(s => (
              <div className="streak-row" key={s.name}>
                <div><b>{s.name}</b><span>{s.days} days</span></div>
                <Bar value={s.value} color={s.color}/>
                <span>🔥</span>
              </div>
            ))}
          </Card>

          <Card className="calendar">
            <div className="card-head">
              <h3>Calendar</h3>
              <span>May 2025</span>
            </div>
            <div className="calendar-grid">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <small key={d}>{d}</small>)}
              {Array.from({length:35}, (_, i) => {
                const day = i - 2;
                const done = [4,8,10,11,12,14,17,18].includes(day);
                const today = day === 6;
                return <div key={i} className={today ? "today" : done ? "complete" : ""}>{day > 0 ? (done ? "✓" : day) : ""}</div>
              })}
            </div>
            <div className="legend"><span>• Today</span><span>• Completed</span><span>○ Missed</span></div>
          </Card>

          <Card className="journal">
            <h3>Recent Journal Entry</h3>
            <b>Today</b>
            <p>{journal}</p>
            <button>View Journal</button>
          </Card>

          <Card className="ambience">
            <div className="card-head">
              <h3>Ambience</h3>
              <button onClick={() => isPlaying ? stopSound() : playSound(sound)}><Play size={18}/>{isPlaying ? "Stop" : "Play"}</button>
            </div>
            <div className="focus-mode">
              <div></div>
              <div><b>Focus Mode</b><span>Deep focus session</span></div>
            </div>
            <div className="sounds">
              {["Rain","Forest","Night","Fire","Temple","Waves"].map(name => (
                <button key={name} onClick={() => playSound(name)} className={sound === name && isPlaying ? "active" : ""}>
                  {name === "Rain" ? "☔" : name === "Forest" ? "🌲" : name === "Night" ? "🌙" : name === "Fire" ? "🔥" : name === "Temple" ? "⛩️" : "🌊"}
                  <span>{name}</span>
                </button>
              ))}
            </div>
            <p className="audio-note">{isPlaying ? `${sound} ambience playing` : "Click a sound to start ambience."}</p>
          </Card>

          <Card className="insights">
            <div className="card-head">
              <h3>Insights</h3>
              <button>This Week</button>
            </div>
            {[
              ["🏆", "Best Day", "May 12"],
              ["🔥", "Longest Streak", "17 days"],
              ["🎯", "Most Focused", "8.5 hrs"],
              ["✅", "Quests Completed", "28"],
            ].map(([icon, label, value]) => <div className="insight" key={label}><span>{icon}</span><b>{label}</b><em>{value}</em></div>)}
          </Card>
        </section>
      </main>
    </div>
  );
}
