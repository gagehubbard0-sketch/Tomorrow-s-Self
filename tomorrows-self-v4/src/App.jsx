
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar
} from "recharts";
import {
  Bell, BookOpen, CalendarDays, CheckCircle2, Dumbbell, Flame, Heart, Home, Leaf,
  Moon, Plus, Shield, Sparkles, Sun, Target, Trash2, User, Users, Wind, Zap
} from "lucide-react";
import "./styles.css";

const todayKey = () => new Date().toISOString().slice(0, 10);
const niceDate = (key) => new Date(key + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });

const defaultGoals = [
  { id: "morning", title: "Morning Routine", area: "Discipline", fire: 7 },
  { id: "workout", title: "Workout", area: "Health", fire: 9 },
  { id: "clean", title: "Clean Mind", area: "Clean Mind", fire: 12 },
  { id: "read", title: "Read 20 Pages", area: "Focus", fire: 5 },
  { id: "cold", title: "Cold Shower", area: "Discipline", fire: 4 },
  { id: "sleep", title: "Sleep by 10:30 PM", area: "Health", fire: 6 }
];

const quotes = [
  ["The future depends on what you do today.", "Mahatma Gandhi"],
  ["Discipline is choosing between what you want now and what you want most.", "Abraham Lincoln"],
  ["We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "Aristotle"],
  ["Waste no more time arguing what a good person should be. Be one.", "Marcus Aurelius"],
  ["A man conquers the world by conquering himself.", "Zeno"],
  ["You have power over your mind, not outside events.", "Marcus Aurelius"]
];

const moods = [
  { label: "Heavy", value: 1, icon: "😡" },
  { label: "Low", value: 2, icon: "😟" },
  { label: "Okay", value: 3, icon: "😐" },
  { label: "Steady", value: 4, icon: "🙂" },
  { label: "Strong", value: 5, icon: "😤" }
];

const paths = [
  { name: "Discipline Path", icon: "⚔️", count: "1,284", text: "Consistency over motivation." },
  { name: "Clean Mind Path", icon: "🧠", count: "892", text: "A free mind is unstoppable." },
  { name: "Peace Path", icon: "🌿", count: "1,031", text: "Calm over reaction." },
  { name: "Health Path", icon: "❤️‍🔥", count: "774", text: "Fuel your body. Build your life." }
];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function Button({ children, className = "", onClick }) {
  return <button onClick={onClick} className={`btn ${className}`}>{children}</button>;
}
function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export default function App() {
  const today = todayKey();
  const [page, setPage] = useState("today");
  const [goals, setGoals] = useState(() => load("ts_v4_goals", defaultGoals));
  const [entries, setEntries] = useState(() => load("ts_v4_entries", { [today]: { mood: 4, journal: "", done: [] } }));
  const [newGoal, setNewGoal] = useState("");
  const [selectedMood, setSelectedMood] = useState(entries[today]?.mood || 4);

  const quote = useMemo(() => quotes[new Date().getDate() % quotes.length], []);
  const todayEntry = entries[today] || { mood: selectedMood, journal: "", done: [] };
  const completed = todayEntry.done.length;
  const progress = goals.length ? Math.round((completed / goals.length) * 100) : 0;
  const xp = completed * 350 + selectedMood * 70;
  const level = Math.max(1, Math.floor(xp / 1000) + 7);

  function updateToday(patch) {
    const next = { ...entries, [today]: { ...todayEntry, ...patch } };
    setEntries(next);
    save("ts_v4_entries", next);
  }

  function toggleGoal(id) {
    const done = todayEntry.done.includes(id)
      ? todayEntry.done.filter(x => x !== id)
      : [...todayEntry.done, id];
    updateToday({ done });
  }

  function addGoal() {
    if (!newGoal.trim()) return;
    const next = [...goals, { id: crypto.randomUUID(), title: newGoal.trim(), area: "Custom", fire: 5 }];
    setGoals(next);
    save("ts_v4_goals", next);
    setNewGoal("");
  }

  function deleteGoal(id) {
    const next = goals.filter(g => g.id !== id);
    setGoals(next);
    save("ts_v4_goals", next);
    updateToday({ done: todayEntry.done.filter(x => x !== id) });
  }

  function setMood(value) {
    setSelectedMood(value);
    updateToday({ mood: value });
  }

  const insightData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" })[0],
      mood: entries[key]?.mood || Math.max(2, Math.min(5, 3 + ((i * 2) % 3))),
      goals: entries[key]?.done?.length || Math.floor(Math.random() * 5) + 2
    };
  });

  const menu = [
    ["today", Home, "Today"],
    ["goals", Target, "Goals"],
    ["journal", BookOpen, "Journal"],
    ["insights", CalendarDays, "Insights"],
    ["streaks", Flame, "Streaks"],
    ["health", Heart, "Health"],
    ["community", Users, "Community"],
    ["profile", User, "Profile"]
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="crest"><Shield /></div>
        <h1>Tomorrow’s Self</h1>
        <p className="tag">Discipline. Purpose. Freedom.</p>

        <nav>
          {menu.map(([key, Icon, label]) => (
            <button key={key} onClick={() => setPage(key)} className={page === key ? "active" : ""}>
              <Icon size={19} /> {label}
            </button>
          ))}
        </nav>

        <div className="focus-card">
          <span>Focus Mode</span>
          <b>Deep Work</b>
          <div className="play">▶</div>
        </div>

        <blockquote>“We are what we repeatedly do. Excellence, then, is not an act, but a habit.”</blockquote>

        <div className="level-card">
          <span>Level {level}</span>
          <b>Disciplined Mind</b>
          <div className="bar"><i style={{ width: `${Math.min(100, (xp % 3000) / 30)}%` }} /></div>
          <small>{xp.toLocaleString()} / 3000 XP</small>
        </div>
      </aside>

      <main className="main">
        <header className="top">
          <span>May {new Date().getDate()}, 2026</span>
          <div><Bell /><div className="pill"><Flame size={17}/> 7</div></div>
        </header>

        {page === "today" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="welcome">👑 Good evening, King.</div>
                <h2>Becoming someone tomorrow you can respect.</h2>
                <p>“{quote[0]}”</p>
                <span className="author">— {quote[1]}</span>
                <div className="stats">
                  <div><span>Level</span><b>{level}</b></div>
                  <div><span>XP</span><b>{xp.toLocaleString()}</b></div>
                  <div><span>Rank</span><b>Seeker</b></div>
                  <div><span>Title</span><b>In Progress</b></div>
                </div>
              </div>

              <Card className="quote-card">
                <h3>Daily Quote</h3>
                <p>“Discipline is doing what needs to be done, even when you don’t feel like doing it.”</p>
                <span>— Jocko Willink</span>
                <Button className="gold">New Quote</Button>
              </Card>
            </section>

            <section className="dash-grid">
              <Card className="wide">
                <div className="section-head"><h3>Your Streaks</h3><button onClick={() => setPage("streaks")}>View All ›</button></div>
                <div className="streak-row">
                  <Streak icon="☀️" title="Daily Streak" days={12} text="Keep showing up." />
                  <Streak icon="🛡️" title="Clean Mind Streak" days={8} text="A free mind is unstoppable." />
                  <Streak icon="❤️‍🔥" title="Health Streak" days={6} text="Fuel your body." />
                  <Streak icon="🦁" title="Discipline Streak" days={12} text="Discipline over motivation." />
                </div>
              </Card>

              <Card>
                <h3>Today’s Check-in</h3>
                <p className="muted">How are you feeling?</p>
                <div className="mood-row">
                  {moods.map(m => <button key={m.value} onClick={() => setMood(m.value)} className={selectedMood === m.value ? "selected" : ""}><span>{m.icon}</span>{m.label}</button>)}
                </div>
                <textarea value={todayEntry.journal} onChange={e => updateToday({ journal: e.target.value })} placeholder="What is one thing you did today that future you will be proud of?" />
                <Button className="gold full">Write in Journal</Button>
              </Card>

              <Card>
                <div className="section-head"><h3>Today’s Goals</h3><small>{completed} / {goals.length} completed</small></div>
                <div className="goal-list">
                  {goals.map(g => (
                    <div className="goal" key={g.id}>
                      <button onClick={() => toggleGoal(g.id)} className={todayEntry.done.includes(g.id) ? "done" : ""}>{todayEntry.done.includes(g.id) ? "✓" : ""}</button>
                      <div><b>{g.title}</b><span>{g.area}</span></div>
                      <small>🔥 {g.fire}</small>
                    </div>
                  ))}
                </div>
                <div className="add-goal"><input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="Add goal..." /><button onClick={addGoal}>+</button></div>
              </Card>

              <Card>
                <h3>Your Path</h3>
                <div className="emblem">⚔️</div>
                <h4>Level {level}</h4>
                <p>Disciplined Mind</p>
                <div className="bar big"><i style={{ width: `${Math.min(100, (xp % 3000) / 30)}%` }} /></div>
                <small>{xp.toLocaleString()} / 3000 XP</small>
              </Card>

              <Card>
                <h3>Quick Actions</h3>
                <div className="quick">
                  <button><Target />Start Focus Session</button>
                  <button><Dumbbell />Log Workout</button>
                  <button><Heart />Healthy Meal</button>
                  <button><Moon />Evening Reflection</button>
                </div>
              </Card>

              <Card>
                <h3>Recent Journal</h3>
                <div className="journal-preview">
                  <div><b>{niceDate(today)}</b><span>Today’s Reflection</span></div>
                  <p>{todayEntry.journal || "It wasn’t a perfect day, but I showed up."}</p>
                  <span className="mood-badge">{moods.find(m=>m.value===selectedMood)?.icon}</span>
                </div>
              </Card>

              <Card>
                <h3>Insights</h3>
                <div className="mini-insights">
                  <div><b>Steady</b><span>Mood Average</span></div>
                  <div><b>{progress}%</b><span>Goals Completed</span></div>
                  <div><b>12.4h</b><span>Focus Time</span></div>
                  <div><b>May 8</b><span>Best Day</span></div>
                </div>
              </Card>

              <Card className="community-card">
                <div className="section-head"><h3>Community</h3><button onClick={() => setPage("community")}>View All ›</button></div>
                <CommunityPost name="ShadowSeeker" text="Day 14. Woke up early and got my workout in. Discipline is starting to feel natural now." tag="Discipline Path" />
                <CommunityPost name="QuietBuilder" text="Struggled today, but I didn’t quit. Tomorrow is another chance to be better." tag="Focus Path" />
                <CommunityPost name="IronMind" text="30 days clean. If I can do it, so can you." tag="Clean Mind Path" />
                <ResponsiveContainer width="100%" height={90}>
                  <BarChart data={insightData}><Bar dataKey="goals" fill="#a97835" radius={[5,5,0,0]} /></BarChart>
                </ResponsiveContainer>
              </Card>
            </section>
          </>
        )}

        {page === "goals" && <Goals goals={goals} setGoals={setGoals} addGoal={addGoal} newGoal={newGoal} setNewGoal={setNewGoal} deleteGoal={deleteGoal} />}
        {page === "journal" && <Journal todayEntry={todayEntry} updateToday={updateToday} selectedMood={selectedMood} setMood={setMood} />}
        {page === "insights" && <Insights data={insightData} progress={progress} />}
        {page === "streaks" && <Streaks />}
        {page === "health" && <Health />}
        {page === "community" && <Community />}
        {page === "profile" && <Profile level={level} xp={xp} />}
      </main>
    </div>
  );
}

function Streak({ icon, title, days, text }) {
  return <div className="streak"><span>{icon}</span><div><b>{title}</b><small>{text}</small></div><strong>{days}<em>days</em></strong></div>;
}

function CommunityPost({ name, text, tag }) {
  return <div className="post"><div className="avatar">{name[0]}</div><div><b>{name}</b><p>{text}</p><small>🔥 24 · 💬 6 · {tag}</small></div></div>;
}

function Goals({ goals, setGoals, newGoal, setNewGoal, addGoal, deleteGoal }) {
  return <div><h2>Goals</h2><p className="muted">Build the system. Repeat it until it becomes identity.</p><Card><div className="add-goal large"><input value={newGoal} onChange={e=>setNewGoal(e.target.value)} placeholder="Add a daily goal..." /><button onClick={addGoal}>Add Goal</button></div><div className="goal-list">{goals.map(g=><div className="goal" key={g.id}><button></button><div><b>{g.title}</b><span>{g.area}</span></div><button onClick={()=>deleteGoal(g.id)}><Trash2 size={17}/></button></div>)}</div></Card></div>;
}

function Journal({ todayEntry, updateToday, selectedMood, setMood }) {
  return <div><h2>Journal</h2><p className="muted">Write honestly. No performance. No pretending.</p><Card><div className="mood-row">{moods.map(m=><button key={m.value} onClick={()=>setMood(m.value)} className={selectedMood===m.value?"selected":""}><span>{m.icon}</span>{m.label}</button>)}</div><textarea className="big-text" value={todayEntry.journal} onChange={e=>updateToday({journal:e.target.value})} placeholder="What did you learn today? What would tomorrow's self thank you for?" /></Card></div>;
}

function Insights({ data, progress }) {
  return <div><h2>Insights</h2><p className="muted">Track effort, not perfection.</p><Card><ResponsiveContainer width="100%" height={320}><AreaChart data={data}><CartesianGrid stroke="rgba(255,255,255,.08)" /><XAxis dataKey="day" stroke="#8d8d8d" /><YAxis stroke="#8d8d8d" /><Tooltip contentStyle={{background:"#111",border:"1px solid #333"}}/><Area dataKey="mood" stroke="#c28a3f" fill="#c28a3f55" strokeWidth={3}/></AreaChart></ResponsiveContainer></Card><Card><h3>This Week</h3><div className="mini-insights"><div><b>{progress}%</b><span>Completion</span></div><div><b>12</b><span>Streak</span></div><div><b>Steady</b><span>Mood</span></div><div><b>Level 7</b><span>Rank</span></div></div></Card></div>;
}

function Streaks() {
  return <div><h2>Streaks</h2><p className="muted">Proof that you keep showing up.</p><div className="cards4"><Card><Streak icon="☀️" title="Daily Streak" days={12} text="Keep showing up."/></Card><Card><Streak icon="🛡️" title="Clean Mind" days={8} text="Protect your mind."/></Card><Card><Streak icon="❤️‍🔥" title="Health" days={6} text="Eat clean. Move daily."/></Card><Card><Streak icon="🦁" title="Discipline" days={12} text="Discipline over motivation."/></Card></div></div>;
}

function Health() {
  return <div><h2>Health</h2><p className="muted">Your body affects your mind.</p><div className="cards4"><Card><h3>Nutrition</h3><p>Log clean meals and water.</p></Card><Card><h3>Training</h3><p>Track workouts and walks.</p></Card><Card><h3>Sleep</h3><p>Protect recovery.</p></Card><Card><h3>Energy</h3><p>Notice what fuels or drains you.</p></Card></div></div>;
}

function Community() {
  return <div><h2>Community</h2><p className="muted">No ego. No competition. Just people rebuilding themselves.</p><div className="cards4">{paths.map(p=><Card key={p.name}><h3>{p.icon} {p.name}</h3><p>{p.text}</p><small>{p.count} walking this path</small></Card>)}</div><Card><CommunityPost name="ShadowSeeker" text="Day 14. Woke up early and got my workout in." tag="Discipline Path" /><CommunityPost name="QuietBuilder" text="Struggled today, but I didn’t quit." tag="Focus Path" /><CommunityPost name="IronMind" text="30 days clean. If I can do it, so can you." tag="Clean Mind Path" /></Card></div>;
}

function Profile({ level, xp }) {
  return <div><h2>Profile</h2><p className="muted">The person you are becoming.</p><Card><div className="emblem">⚔️</div><h3>Disciplined Mind</h3><p>Level {level} · {xp.toLocaleString()} XP</p></Card></div>;
}
