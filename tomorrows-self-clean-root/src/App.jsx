
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BookOpen, CheckCircle2, Flame, Heart, Leaf, Plus, Save, Shield, Sun, Trash2, Wind } from "lucide-react";
import "./styles.css";

const quotes = [
  "A peaceful person was once ruled by reaction.",
  "A disciplined person was once mastered by excuses.",
  "A humble person was once controlled by pride.",
  "Your past is not your prison. It is proof that you can change.",
  "Do something today that tomorrow’s self can respect.",
  "Strength is not rage. Strength is choosing what is right when emotions are loud."
];

const defaultVirtues = [
  { title: "Peace", task: "Pause before reacting once today.", icon: Leaf },
  { title: "Discipline", task: "Do one hard thing for 10 minutes.", icon: Flame },
  { title: "Kindness", task: "Do one kind thing without needing credit.", icon: Heart },
  { title: "Humility", task: "Tell the truth without making excuses.", icon: Shield }
];

const moods = [
  { label: "Heavy", value: 1, face: "🌧️" },
  { label: "Stressed", value: 2, face: "😟" },
  { label: "Okay", value: 3, face: "🙂" },
  { label: "Calm", value: 4, face: "😌" },
  { label: "Strong", value: 5, face: "🔥" }
];

const todayKey = () => new Date().toISOString().slice(0, 10);
const niceDate = (key) => new Date(key + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function Button({ children, className = "", onClick }) {
  return <button onClick={onClick} className={`button ${className}`}>{children}</button>;
}
function Card({ children, className = "", id }) {
  return <section id={id} className={`card ${className}`}>{children}</section>;
}

export default function App() {
  const today = todayKey();
  const [entries, setEntries] = useState(() => load("ts_entries", { [today]: { mood: 4, journal: "", completed: [] } }));
  const [selectedDate, setSelectedDate] = useState(today);
  const [virtues, setVirtues] = useState(() => load("ts_virtues", defaultVirtues.map(({ title, task }) => ({ title, task }))));
  const [goals, setGoals] = useState(() => load("ts_goals", []));
  const [newGoal, setNewGoal] = useState("");
  const [calmOpen, setCalmOpen] = useState(false);

  const quote = useMemo(() => quotes[new Date().getDate() % quotes.length], []);
  const entry = entries[selectedDate] || { mood: 3, journal: "", completed: [] };

  const updateEntry = (date, patch) => {
    const next = { ...entries, [date]: { ...(entries[date] || { mood: 3, journal: "", completed: [] }), ...patch } };
    setEntries(next);
    save("ts_entries", next);
  };

  const updateVirtue = (i, field, value) => {
    const next = virtues.map((v, index) => index === i ? { ...v, [field]: value } : v);
    setVirtues(next);
    save("ts_virtues", next);
  };

  const toggleComplete = (name) => {
    const current = entries[today] || { mood: 3, journal: "", completed: [] };
    const completed = current.completed.includes(name) ? current.completed.filter(x => x !== name) : [...current.completed, name];
    updateEntry(today, { completed });
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const next = [{ id: crypto.randomUUID(), text: newGoal.trim(), done: false }, ...goals];
    setGoals(next);
    save("ts_goals", next);
    setNewGoal("");
  };

  const chartData = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - index));
      const key = d.toISOString().slice(0, 10);
      return { date: key, day: d.toLocaleDateString(undefined, { weekday: "short" }), happiness: entries[key]?.mood ?? null };
    });
  }, [entries]);

  const xp = (entries[today]?.completed?.length || 0) * 120 + goals.filter(g => g.done).length * 80 + ((entries[today]?.journal?.length || 0) > 25 ? 100 : 0);

  return (
    <div className="page">
      <div className="background" />
      <div className="shade" />

      <main className="shell">
        <header className="nav">
          <div className="brand">
            <div className="mark"><Sun /></div>
            <div>
              <h1>Tomorrow’s Self</h1>
              <p>Discipline. Kindness. Peace. Becoming.</p>
            </div>
          </div>
          <div className="xp">Today: <b>{xp} XP</b></div>
        </header>

        <section className="hero">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="eyebrow">今日 • choose your next self</div>
            <h2>Become someone tomorrow-you can respect.</h2>
            <p className="quote">“{quote}”</p>
            <div className="hero-actions">
              <Button className="primary" onClick={() => document.getElementById("journal").scrollIntoView({ behavior: "smooth" })}>Journal today</Button>
              <Button className="ghost" onClick={() => setCalmOpen(true)}>Emergency calm</Button>
            </div>
          </motion.div>

          <div className="poster">
            <div className="poster-sun" />
            <div className="warrior" />
            <div className="poster-text">
              <span>The path is quiet.</span>
              <h3>No enemies within.</h3>
              <p>Reaction becomes restraint. Pain becomes wisdom. Effort becomes identity.</p>
            </div>
          </div>
        </section>

        <section className="mood-picker">
          <h3>How was {selectedDate === today ? "today" : niceDate(selectedDate)}?</h3>
          <div className="mood-buttons">
            {moods.map(m => (
              <button key={m.label} className={`mood ${entry.mood === m.value ? "active" : ""}`} onClick={() => updateEntry(selectedDate, { mood: m.value })}>
                <span>{m.face}</span>{m.label}
              </button>
            ))}
          </div>
        </section>

        <section className="two">
          <Card id="journal">
            <div className="section-title"><BookOpen /><div><h3>Journal</h3><p>{niceDate(selectedDate)}</p></div></div>
            <textarea value={entry.journal} onChange={e => updateEntry(selectedDate, { journal: e.target.value })} placeholder="What did you learn? What would tomorrow’s self thank you for?" />
            <Button className="small"><Save size={17} /> Autosaved on this device</Button>
          </Card>

          <Card>
            <div className="section-title"><Flame /><div><h3>Happiness Graph</h3><p>Click a day to view its journal.</p></div></div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} onClick={(data) => data?.activePayload?.[0]?.payload?.date && setSelectedDate(data.activePayload[0].payload.date)}>
                <defs><linearGradient id="h" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f5c56b" stopOpacity={0.8}/><stop offset="95%" stopColor="#f5c56b" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,.65)" />
                <YAxis domain={[1,5]} stroke="rgba(255,255,255,.65)" />
                <Tooltip contentStyle={{ background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: 14 }} />
                <Area type="monotone" dataKey="happiness" stroke="#f5c56b" fill="url(#h)" strokeWidth={3} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </section>

        <Card>
          <div className="section-title"><Shield /><div><h3>Virtues</h3><p>Edit your core path. Mark today’s practice when completed.</p></div></div>
          <div className="virtue-grid">
            {virtues.map((v, i) => {
              const Icon = defaultVirtues[i]?.icon || Leaf;
              const done = entries[today]?.completed?.includes(v.title);
              return (
                <div className={`virtue ${done ? "done" : ""}`} key={i}>
                  <Icon />
                  <input value={v.title} onChange={e => updateVirtue(i, "title", e.target.value)} />
                  <input value={v.task} onChange={e => updateVirtue(i, "task", e.target.value)} />
                  <Button className={done ? "complete" : "ghost"} onClick={() => toggleComplete(v.title)}>{done ? <CheckCircle2 size={17} /> : null}{done ? "Done" : "Mark"}</Button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="section-title"><Plus /><div><h3>Extra Goals for Today</h3><p>Add anything else tomorrow’s self would respect.</p></div></div>
          <div className="goal-entry">
            <input value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()} placeholder="Workout, clean room, finish homework, apologize..." />
            <Button className="primary" onClick={addGoal}>Add goal</Button>
          </div>
          <div className="goals">
            {goals.map(goal => (
              <div className={`goal ${goal.done ? "done" : ""}`} key={goal.id}>
                <button onClick={() => { const next = goals.map(g => g.id === goal.id ? { ...g, done: !g.done } : g); setGoals(next); save("ts_goals", next); }}>{goal.done ? "✓" : "○"}</button>
                <span>{goal.text}</span>
                <button onClick={() => { const next = goals.filter(g => g.id !== goal.id); setGoals(next); save("ts_goals", next); }}><Trash2 size={17} /></button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="section-title"><Wind /><div><h3>Respond, Don’t React</h3><p>For anger, stress, ego, or overthinking.</p></div></div>
          <div className="coach"><p><b>1.</b> Name the feeling without obeying it.</p><p><b>2.</b> Ask: “What response would make me proud tomorrow?”</p><p><b>3.</b> Keep your answer honest, calm, short, and respectful.</p></div>
        </Card>
      </main>

      {calmOpen && (
        <div className="modal">
          <motion.div className="calm" initial={{ scale: .95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <button className="close" onClick={() => setCalmOpen(false)}>×</button>
            <div className="breath"><span>Breathe</span></div>
            <h3>Emergency Calm</h3>
            <p>Slow down. You do not need to become your first reaction.</p>
            <ol><li>Inhale for 4 seconds.</li><li>Hold gently for 3 seconds.</li><li>Exhale slowly for 8 seconds.</li><li>Repeat 5 times before replying.</li></ol>
            <Button className="primary" onClick={() => setCalmOpen(false)}>I’m steady</Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
