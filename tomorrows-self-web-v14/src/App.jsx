
import React, { useMemo, useState } from "react";
import {
  Apple, BookOpen, CalendarDays, CheckCircle2, Flame, Heart, Home, Leaf,
  Moon, Plus, Shield, Sparkles, Target, Trash2, Trophy, User, Users, Wind, Zap
} from "lucide-react";
import "./styles.css";

const todayKey = () => new Date().toISOString().slice(0, 10);

const ranks = [
  { name: "Wanderer", xp: 0 },
  { name: "Seeker", xp: 800 },
  { name: "Quiet Builder", xp: 1800 },
  { name: "Disciplined Mind", xp: 3200 },
  { name: "Iron Will", xp: 5200 },
  { name: "Peaceful Warrior", xp: 8000 },
  { name: "Guardian", xp: 11500 },
  { name: "Dawn Walker", xp: 15000 },
  { name: "Mountain Soul", xp: 20000 },
  { name: "Mastery", xp: 28000 }
];

const goalsDefault = [
  { id: "morning", title: "Morning intention", area: "Discipline", xp: 120 },
  { id: "train", title: "Train body or move outside", area: "Health", xp: 150 },
  { id: "clean", title: "Protect clean mind", area: "Clean Mind", xp: 200 },
  { id: "focus", title: "One focused work block", area: "Focus", xp: 120 },
  { id: "peace", title: "Pause before reacting", area: "Peace", xp: 140 }
];

const streakDefault = [
  { id: "daily", title: "Daily Streak", icon: "☀️", note: "Show up once today.", count: 12 },
  { id: "cleanmind", title: "No Porn / Clean Mind", icon: "🛡️", note: "Protect your attention.", count: 8 },
  { id: "health", title: "Eating Healthier", icon: "🥗", note: "Choose food that helps you.", count: 6 },
  { id: "discipline", title: "Discipline", icon: "🔥", note: "Do it even when you do not feel like it.", count: 12 },
  { id: "sleep", title: "Sleep Routine", icon: "🌙", note: "Protect recovery.", count: 4 }
];

const quotes = [
  "Control your mind before the world controls it.",
  "A hard-working person was once lazy.",
  "A calm life is built intentionally.",
  "The strongest minds stay gentle.",
  "Discipline today. Freedom tomorrow.",
  "Small promises kept become self-respect.",
  "You do not need to rush to become better."
];

const moods = [
  { label: "Heavy", icon: "🌧️", value: 1, color: "#c95b51" },
  { label: "Low", icon: "🌫️", value: 2, color: "#c48b46" },
  { label: "Okay", icon: "🌤️", value: 3, color: "#d3b85b" },
  { label: "Steady", icon: "🌿", value: 4, color: "#75a96f" },
  { label: "Strong", icon: "⚔️", value: 5, color: "#9170d8" }
];

const paths = [
  { key: "Discipline", icon: "🔥", rank: "Quiet Builder", progress: 68 },
  { key: "Peace", icon: "🌿", rank: "Still Mind", progress: 45 },
  { key: "Health", icon: "🥗", rank: "Strong Heart", progress: 72 },
  { key: "Clean Mind", icon: "🛡️", rank: "Clear Sight", progress: 40 }
];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Bar({ value }) {
  return <div className="bar"><i style={{ width: `${value}%` }} /></div>;
}

export default function App() {
  const today = todayKey();
  const [page, setPage] = useState("home");
  const [goals, setGoals] = useState(() => load("ts14_goals", goalsDefault));
  const [streaks, setStreaks] = useState(() => load("ts14_streaks", streakDefault));
  const [entries, setEntries] = useState(() => load("ts14_entries", { [today]: { done: [], mood: 4, journal: "", checkedIn: false } }));
  const [newGoal, setNewGoal] = useState("");
  const [newStreak, setNewStreak] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(new Date().getDate() % quotes.length);
  const entry = entries[today] || { done: [], mood: 4, journal: "", checkedIn: false };

  const completedXP = goals.filter(g => entry.done.includes(g.id)).reduce((sum, g) => sum + g.xp, 0);
  const xp = 1900 + completedXP + (entry.checkedIn ? 120 : 0) + (entry.journal.length > 20 ? 90 : 0);
  const rank = [...ranks].reverse().find(r => xp >= r.xp) || ranks[0];
  const nextRank = ranks.find(r => r.xp > xp) || ranks[ranks.length - 1];
  const rankProgress = nextRank.xp === rank.xp ? 100 : Math.round(((xp - rank.xp) / (nextRank.xp - rank.xp)) * 100);
  const goalProgress = goals.length ? Math.round((entry.done.length / goals.length) * 100) : 0;
  const mood = moods.find(m => m.value === entry.mood) || moods[3];

  function updateEntry(patch) {
    const next = { ...entries, [today]: { ...entry, ...patch } };
    setEntries(next);
    save("ts14_entries", next);
  }

  function toggleGoal(id) {
    const done = entry.done.includes(id) ? entry.done.filter(x => x !== id) : [...entry.done, id];
    updateEntry({ done });
  }

  function addGoal() {
    if (!newGoal.trim()) return;
    const next = [...goals, { id: crypto.randomUUID(), title: newGoal.trim(), area: "Custom", xp: 100 }];
    setGoals(next); save("ts14_goals", next); setNewGoal("");
  }

  function removeGoal(id) {
    const next = goals.filter(g => g.id !== id);
    setGoals(next); save("ts14_goals", next);
    updateEntry({ done: entry.done.filter(x => x !== id) });
  }

  function addStreak() {
    if (!newStreak.trim()) return;
    const next = [...streaks, { id: crypto.randomUUID(), title: newStreak.trim(), icon: "🔥", note: "Keep the chain alive.", count: 0 }];
    setStreaks(next); save("ts14_streaks", next); setNewStreak("");
  }

  function incrementStreak(id) {
    const next = streaks.map(s => s.id === id ? { ...s, count: s.count + 1 } : s);
    setStreaks(next); save("ts14_streaks", next);
  }

  const nav = [
    ["home", Home, "Home"],
    ["quests", Target, "Daily Quests"],
    ["streaks", Flame, "Streaks"],
    ["journal", BookOpen, "Journal"],
    ["stats", Trophy, "Stats"],
    ["paths", Zap, "Paths"],
    ["community", Users, "Community"],
    ["profile", User, "Profile"]
  ];

  return (
    <div className="site">
      <header className="top">
        <div className="brand">
          <div className="mark">山</div>
          <div>
            <strong>Tomorrow’s Self</strong>
            <span>Quiet self-mastery</span>
          </div>
        </div>
        <nav className="nav">
          {nav.map(([key, Icon, label]) => <button key={key} className={page === key ? "active" : ""} onClick={() => setPage(key)}><Icon size={17}/>{label}</button>)}
        </nav>
      </header>

      <main>
        {page === "home" && (
          <div className="home-grid">
            <section className="hero">
              <div className="hero-bg"></div>
              <div className="hero-person"></div>
              <div className="hero-copy">
                <span className="eyebrow">Welcome back, warrior.</span>
                <h1>Become someone tomorrow you can respect.</h1>
                <p>{quotes[quoteIndex]}</p>
                <button onClick={() => setQuoteIndex((quoteIndex + 1) % quotes.length)}>New quote</button>
              </div>
            </section>

            <Card className="progress-card">
              <div className="split">
                <div>
                  <span className="label">Current Title</span>
                  <h2>{rank.name}</h2>
                  <p>{xp.toLocaleString()} XP · Next: {nextRank.name}</p>
                </div>
                <div className="ring" style={{"--p": `${rankProgress}%`}}>{rankProgress}%</div>
              </div>
              <Bar value={rankProgress}/>
            </Card>

            <Card>
              <div className="section-title"><h3>The Flame</h3><span>{goalProgress}%</span></div>
              <Bar value={Math.max(10, goalProgress)}/>
              <p className="muted">Your flame represents returning, not perfection. One bad day does not erase you.</p>
            </Card>

            <Card>
              <div className="section-title"><h3>Today’s Quests</h3><button onClick={() => setPage("quests")}>View all</button></div>
              <div className="list">
                {goals.slice(0, 4).map(g => <button className={`row ${entry.done.includes(g.id) ? "done" : ""}`} onClick={() => toggleGoal(g.id)} key={g.id}><span>{entry.done.includes(g.id) ? "✓" : ""}</span><div><b>{g.title}</b><small>{g.area}</small></div><em>+{g.xp}</em></button>)}
              </div>
            </Card>

            <Card>
              <div className="section-title"><h3>Streaks</h3><button onClick={() => setPage("streaks")}>Manage</button></div>
              <div className="streak-strip">
                {streaks.slice(0,4).map(s => <div key={s.id}><strong>{s.icon}</strong><b>{s.count}</b><small>{s.title}</small></div>)}
              </div>
            </Card>

            <Card>
              <h3>Check-in</h3>
              <div className="moods">
                {moods.map(m => <button key={m.value} style={{"--mood": m.color}} className={entry.mood === m.value ? "active" : ""} onClick={() => updateEntry({ mood: m.value, checkedIn: true })}><span>{m.icon}</span><small>{m.label}</small></button>)}
              </div>
              <p className="muted">Today: {mood.label}</p>
            </Card>
          </div>
        )}

        {page === "quests" && (
          <Page title="Daily Quests" subtitle="Small actions. Big change.">
            <div className="two">
              <Card>
                <h3>Add a quest</h3>
                <div className="add"><input value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()} placeholder="Add daily quest..." /><button onClick={addGoal}><Plus size={17}/>Add</button></div>
              </Card>
              <Card>
                <h3>Quest Bonus</h3>
                <p className="muted">Finish every quest to protect the flame and move toward your next title.</p>
                <div className="bonus">🏆 +250 XP · Flame protected</div>
              </Card>
            </div>
            <Card><div className="list">{goals.map(g => <div className={`row ${entry.done.includes(g.id) ? "done" : ""}`} key={g.id}><button onClick={() => toggleGoal(g.id)}>{entry.done.includes(g.id) ? "✓" : ""}</button><div><b>{g.title}</b><small>{g.area}</small></div><button onClick={() => removeGoal(g.id)}><Trash2 size={16}/></button></div>)}</div></Card>
          </Page>
        )}

        {page === "streaks" && (
          <Page title="Streaks" subtitle="Not comparison. Proof that you keep returning.">
            <div className="two">
              <Card>
                <h3>Add a streak</h3>
                <div className="add"><input value={newStreak} onChange={e => setNewStreak(e.target.value)} onKeyDown={e => e.key === "Enter" && addStreak()} placeholder="Add streak..." /><button onClick={addStreak}><Plus size={17}/>Add</button></div>
              </Card>
              <Card>
                <h3>Recovery Rule</h3>
                <p className="muted">A missed day weakens the flame. It does not end your story.</p>
              </Card>
            </div>
            <div className="streak-grid">
              {streaks.map(s => <Card key={s.id} className="streak-card"><div className="streak-icon">{s.icon}</div><h3>{s.title}</h3><b>{s.count} days</b><p>{s.note}</p><button onClick={() => incrementStreak(s.id)}>Mark today</button></Card>)}
            </div>
          </Page>
        )}

        {page === "journal" && (
          <Page title="Journal" subtitle="Write honestly. No performance. No pretending.">
            <div className="two">
              <Card><h3>Today’s mood</h3><div className="moods">{moods.map(m => <button key={m.value} style={{"--mood": m.color}} className={entry.mood === m.value ? "active" : ""} onClick={() => updateEntry({ mood: m.value })}><span>{m.icon}</span><small>{m.label}</small></button>)}</div></Card>
              <Card><h3>Reflection prompt</h3><p className="muted">What did you protect today: your peace, your focus, or your future?</p></Card>
            </div>
            <Card><textarea value={entry.journal} onChange={e => updateEntry({ journal: e.target.value })} placeholder="What did you learn today?" /></Card>
            <Card><h3>Calendar</h3><div className="calendar">{Array.from({length:14},(_,i)=><div key={i} className={i>9 || entry.checkedIn ? "saved":""}><small>Day</small><b>{i+1}</b><span>{i>9 || entry.checkedIn ? mood.icon : "—"}</span></div>)}</div></Card>
          </Page>
        )}

        {page === "stats" && (
          <Page title="Stats" subtitle="Meaning, not spreadsheets.">
            <div className="stat-grid">
              <Card><Flame/><h3>Current Streak</h3><b>{streaks[0]?.count || 0} days</b></Card>
              <Card><Heart/><h3>Strongest Path</h3><b>Health · 72%</b></Card>
              <Card><Moon/><h3>Mood Trend</h3><b>{mood.label}</b></Card>
              <Card><Trophy/><h3>Total XP</h3><b>{xp.toLocaleString()}</b></Card>
            </div>
          </Page>
        )}

        {page === "paths" && (
          <Page title="Your Paths" subtitle="Grow in every area that matters.">
            <div className="path-grid">{paths.map(p => <Card key={p.key} className="path"><div className="path-icon">{p.icon}</div><div><h3>{p.key} Path</h3><p>{p.rank}</p><Bar value={p.progress}/></div><b>{p.progress}%</b></Card>)}</div>
          </Page>
        )}

        {page === "community" && (
          <Page title="Community" subtitle="Walk the path together. Lift others up.">
            <div className="post-list">
              <Card><b>Anonymous Warrior</b><p>Day 14 complete. Not perfect, but I didn’t quit.</p><span>🔥 Encourage · Discipline</span></Card>
              <Card><b>Path Walker</b><p>The comeback is always stronger than the setback.</p><span>🌿 Encourage · Recovery</span></Card>
              <Card><b>Quiet Builder</b><p>I protected my peace today instead of reacting.</p><span>🛡️ Encourage · Peace</span></Card>
            </div>
          </Page>
        )}

        {page === "profile" && (
          <Page title="Profile" subtitle="The person you are becoming.">
            <Card className="profile"><div className="avatar"></div><h2>{rank.name}</h2><p>{xp.toLocaleString()} XP · Next: {nextRank.name}</p><Bar value={rankProgress}/></Card>
          </Page>
        )}
      </main>
    </div>
  );
}

function Page({ title, subtitle, children }) {
  return <section className="page"><div className="page-head"><h1>{title}</h1><p>{subtitle}</p></div>{children}</section>
}
