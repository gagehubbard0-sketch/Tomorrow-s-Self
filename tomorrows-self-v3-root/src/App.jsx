
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  BookOpen, CalendarDays, CheckCircle2, Flame, Heart, Home, Leaf,
  Moon, Plus, Shield, Sparkles, Sun, Trash2, Wind
} from "lucide-react";
import "./styles.css";

const todayKey = () => new Date().toISOString().slice(0, 10);
const niceDate = (key) => new Date(key + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
const shortDate = (key) => new Date(key + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });

const starterGoals = [
  { id: "peace-1", title: "Pause before reacting", area: "Peace", repeat: "Daily" },
  { id: "discipline-1", title: "Do one hard thing for 10 minutes", area: "Discipline", repeat: "Daily" },
  { id: "kindness-1", title: "Do one quiet act of kindness", area: "Kindness", repeat: "Daily" },
  { id: "humility-1", title: "Tell the truth without excuses", area: "Humility", repeat: "Daily" }
];

const areas = [
  { name: "Peace", icon: Leaf, line: "Restraint before reaction." },
  { name: "Discipline", icon: Flame, line: "Do what you said you would do." },
  { name: "Kindness", icon: Heart, line: "Strength that does not need cruelty." },
  { name: "Humility", icon: Shield, line: "Truth over ego." }
];

const quotes = [
  "A peaceful person was once ruled by reaction.",
  "A disciplined person was once mastered by excuses.",
  "A humble person was once controlled by pride.",
  "The past is not your prison. It is proof that you can change.",
  "Do something today that tomorrow’s self can respect.",
  "Strength is not rage. Strength is choosing what is right when emotions are loud.",
  "A loving heart is not weak. It is trained."
];

const moods = [
  { label: "Heavy", value: 1 },
  { label: "Low", value: 2 },
  { label: "Okay", value: 3 },
  { label: "Steady", value: 4 },
  { label: "Strong", value: 5 }
];

function load(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function store(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function Button({ children, onClick, className = "" }) {
  return <button className={`btn ${className}`} onClick={onClick}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export default function App() {
  const today = todayKey();
  const [page, setPage] = useState("home");
  const [goals, setGoals] = useState(() => load("ts_v3_goals", starterGoals));
  const [entries, setEntries] = useState(() => load("ts_v3_entries", {
    [today]: { mood: 4, journal: "", done: [] }
  }));
  const [selectedDate, setSelectedDate] = useState(today);
  const [newGoal, setNewGoal] = useState("");
  const [newArea, setNewArea] = useState("Discipline");
  const [calmOpen, setCalmOpen] = useState(false);

  const quote = useMemo(() => quotes[new Date().getDate() % quotes.length], []);
  const todayEntry = entries[today] || { mood: 3, journal: "", done: [] };
  const selectedEntry = entries[selectedDate] || { mood: 3, journal: "", done: [] };

  function updateEntry(date, patch) {
    const next = { ...entries, [date]: { ...(entries[date] || { mood: 3, journal: "", done: [] }), ...patch } };
    setEntries(next);
    store("ts_v3_entries", next);
  }

  function toggleGoal(id) {
    const done = todayEntry.done.includes(id)
      ? todayEntry.done.filter(x => x !== id)
      : [...todayEntry.done, id];
    updateEntry(today, { done });
  }

  function addGoal() {
    if (!newGoal.trim()) return;
    const next = [
      ...goals,
      { id: crypto.randomUUID(), title: newGoal.trim(), area: newArea, repeat: "Daily" }
    ];
    setGoals(next);
    store("ts_v3_goals", next);
    setNewGoal("");
  }

  function deleteGoal(id) {
    const nextGoals = goals.filter(g => g.id !== id);
    setGoals(nextGoals);
    store("ts_v3_goals", nextGoals);
    const nextEntries = {};
    for (const [date, entry] of Object.entries(entries)) {
      nextEntries[date] = { ...entry, done: entry.done.filter(x => x !== id) };
    }
    setEntries(nextEntries);
    store("ts_v3_entries", nextEntries);
  }

  const completion = goals.length ? Math.round((todayEntry.done.length / goals.length) * 100) : 0;
  const xp = todayEntry.done.length * 80 + ((todayEntry.journal || "").length > 40 ? 120 : 0) + todayEntry.mood * 15;

  const chartData = useMemo(() => {
    return Array.from({ length: 21 }, (_, index) => {
      const d = new Date();
      d.setDate(d.getDate() - (20 - index));
      const key = d.toISOString().slice(0, 10);
      return {
        date: key,
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        mood: entries[key]?.mood ?? null,
        done: entries[key]?.done?.length ?? 0
      };
    });
  }, [entries]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - index));
      return d.toISOString().slice(0, 10);
    });
  }, []);

  return (
    <div className="app">
      <div className="bg" />
      <div className="noise" />

      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark"><Sun /></div>
          <div>
            <h1>Tomorrow’s Self</h1>
            <p>Become with discipline.</p>
          </div>
        </div>

        <nav>
          <button className={page === "home" ? "active" : ""} onClick={() => setPage("home")}><Home /> Today</button>
          <button className={page === "goals" ? "active" : ""} onClick={() => setPage("goals")}><CheckCircle2 /> Goals</button>
          <button className={page === "journal" ? "active" : ""} onClick={() => setPage("journal")}><BookOpen /> Journal</button>
          <button className={page === "insights" ? "active" : ""} onClick={() => setPage("insights")}><CalendarDays /> Insights</button>
          <button className={page === "calm" ? "active" : ""} onClick={() => setPage("calm")}><Wind /> Calm</button>
        </nav>

        <div className="side-card">
          <span>Today’s Progress</span>
          <strong>{completion}%</strong>
          <div className="bar"><i style={{ width: `${completion}%` }} /></div>
        </div>
      </aside>

      <main className="main">
        {page === "home" && (
          <>
            <section className="hero">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                <div className="eyebrow">今日 • the quiet path</div>
                <h2>Become someone tomorrow-you can respect.</h2>
                <p>“{quote}”</p>
                <div className="actions">
                  <Button className="primary" onClick={() => setPage("goals")}>Start daily path</Button>
                  <Button className="ghost" onClick={() => setCalmOpen(true)}>Emergency calm</Button>
                </div>
              </motion.div>

              <Card className="status">
                <div className="status-top">
                  <span>Level</span>
                  <strong>{Math.floor(xp / 250) + 1}</strong>
                </div>
                <p>{xp} XP earned today</p>
                <div className="circle">{completion}%</div>
              </Card>
            </section>

            <section className="area-grid">
              {areas.map(({ name, icon: Icon, line }) => (
                <Card key={name}>
                  <Icon />
                  <h3>{name}</h3>
                  <p>{line}</p>
                </Card>
              ))}
            </section>

            <Card>
              <div className="section-title">
                <Sparkles />
                <div>
                  <h3>Today’s Daily Goals</h3>
                  <p>Same core list every day. Consistency builds identity.</p>
                </div>
              </div>
              <div className="goal-list">
                {goals.map(goal => (
                  <div className={`goal ${todayEntry.done.includes(goal.id) ? "done" : ""}`} key={goal.id}>
                    <button onClick={() => toggleGoal(goal.id)}>{todayEntry.done.includes(goal.id) ? "✓" : "○"}</button>
                    <div>
                      <strong>{goal.title}</strong>
                      <span>{goal.area} • {goal.repeat}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {page === "goals" && (
          <>
            <div className="page-head">
              <h2>Goals</h2>
              <p>Create your repeating daily list. These return every morning.</p>
            </div>

            <Card>
              <div className="add-row">
                <input value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()} placeholder="Add a daily goal..." />
                <select value={newArea} onChange={e => setNewArea(e.target.value)}>
                  {areas.map(area => <option key={area.name}>{area.name}</option>)}
                </select>
                <Button className="primary" onClick={addGoal}><Plus /> Add</Button>
              </div>
            </Card>

            <Card>
              <div className="goal-list manage">
                {goals.map(goal => (
                  <div className="goal" key={goal.id}>
                    <button onClick={() => toggleGoal(goal.id)}>{todayEntry.done.includes(goal.id) ? "✓" : "○"}</button>
                    <div>
                      <strong>{goal.title}</strong>
                      <span>{goal.area} • repeats daily</span>
                    </div>
                    <button className="delete" onClick={() => deleteGoal(goal.id)}><Trash2 /></button>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {page === "journal" && (
          <>
            <div className="page-head">
              <h2>Journal</h2>
              <p>Click a day. Write what happened. Track who you are becoming.</p>
            </div>

            <section className="two-col">
              <Card>
                <div className="mini-calendar">
                  {weekDays.map(day => (
                    <button key={day} className={selectedDate === day ? "selected" : ""} onClick={() => setSelectedDate(day)}>
                      <span>{new Date(day + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" })}</span>
                      <strong>{new Date(day + "T12:00:00").getDate()}</strong>
                      <i>{entries[day]?.mood ? moods.find(m => m.value === entries[day].mood)?.label : "—"}</i>
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="section-title">
                  <Moon />
                  <div>
                    <h3>{niceDate(selectedDate)}</h3>
                    <p>What would tomorrow’s self thank you for?</p>
                  </div>
                </div>

                <div className="moods">
                  {moods.map(m => (
                    <button key={m.value} className={selectedEntry.mood === m.value ? "active" : ""} onClick={() => updateEntry(selectedDate, { mood: m.value })}>
                      {m.label}
                    </button>
                  ))}
                </div>

                <textarea value={selectedEntry.journal} onChange={e => updateEntry(selectedDate, { journal: e.target.value })} placeholder="Write honestly. No performance. No pretending." />
              </Card>
            </section>
          </>
        )}

        {page === "insights" && (
          <>
            <div className="page-head">
              <h2>Insights</h2>
              <p>Not just a graph. A record of discipline, mood, and reflection.</p>
            </div>

            <Card>
              <ResponsiveContainer width="100%" height={310}>
                <AreaChart data={chartData} onClick={(data) => data?.activePayload?.[0]?.payload?.date && (setSelectedDate(data.activePayload[0].payload.date), setPage("journal"))}>
                  <defs>
                    <linearGradient id="mood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b9a37f" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#b9a37f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,.08)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,.6)" />
                  <YAxis domain={[1,5]} stroke="rgba(255,255,255,.6)" />
                  <Tooltip contentStyle={{ background: "#151515", border: "1px solid rgba(255,255,255,.14)", borderRadius: 14 }} />
                  <Area type="monotone" dataKey="mood" stroke="#b9a37f" fill="url(#mood)" strokeWidth={3} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <div className="history-grid">
              {chartData.slice().reverse().map(day => (
                <Card key={day.date} className="history" onClick={() => { setSelectedDate(day.date); setPage("journal"); }}>
                  <span>{shortDate(day.date)}</span>
                  <strong>{day.mood ? moods.find(m => m.value === day.mood)?.label : "No check-in"}</strong>
                  <p>{day.done} goals done</p>
                </Card>
              ))}
            </div>
          </>
        )}

        {page === "calm" && (
          <>
            <div className="page-head">
              <h2>Calm Protocol</h2>
              <p>This is for anger, panic, ego, or the moment before you say something you regret.</p>
            </div>

            <section className="two-col">
              <Card>
                <div className="breath-big"><span>Breathe</span></div>
                <h3>4 • 3 • 8</h3>
                <p className="muted">Inhale 4. Hold 3. Exhale 8. Repeat slowly.</p>
              </Card>
              <Card>
                <h3>The 3 Questions</h3>
                <ol className="protocol">
                  <li>What am I feeling, without blaming anyone?</li>
                  <li>What response would tomorrow’s self respect?</li>
                  <li>What is the shortest calm truth I can say?</li>
                </ol>
              </Card>
            </section>
          </>
        )}
      </main>

      {calmOpen && (
        <div className="modal">
          <div className="modal-card">
            <button onClick={() => setCalmOpen(false)} className="close">×</button>
            <div className="breath-big"><span>Breathe</span></div>
            <h2>Do not become the reaction.</h2>
            <p>Inhale 4. Hold 3. Exhale 8. Then choose your response.</p>
            <Button className="primary" onClick={() => setCalmOpen(false)}>I’m steady</Button>
          </div>
        </div>
      )}
    </div>
  );
}
