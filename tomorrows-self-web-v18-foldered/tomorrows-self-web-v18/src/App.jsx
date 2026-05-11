
import React, { useMemo, useRef, useState } from "react";
import {
  BookOpen, CalendarDays, CheckCircle2, Flame, Home, LineChart, Music,
  Play, Pause, Plus, RotateCcw, Settings, Shield, Target, Trash2, Trophy,
  User, Users, Wind, Zap
} from "lucide-react";
import "./styles.css";
import animeFigure from "./assets/anime-figure.svg";

const todayKey = () => new Date().toISOString().slice(0, 10);
const readableDate = (key) => new Date(key + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

const starterQuests = [
  { id: "morning", title: "Morning intention", area: "Discipline", xp: 20 },
  { id: "workout", title: "Workout or walk", area: "Health", xp: 25 },
  { id: "clean", title: "Clean mind", area: "Clean Mind", xp: 25 },
  { id: "read", title: "Read or focus", area: "Focus", xp: 20 },
  { id: "sleep", title: "Sleep routine", area: "Health", xp: 15 }
];

const starterStreaks = [
  { id: "cleanmind", title: "No Porn / Clean Mind", note: "Protect your attention.", count: 0 },
  { id: "health", title: "Eating Healthier", note: "Choose food that helps you.", count: 0 },
  { id: "daily", title: "Daily Check-in", note: "Show up once today.", count: 0 },
  { id: "discipline", title: "Discipline", note: "Do the hard thing.", count: 0 }
];

const moods = [
  { label: "Heavy", icon: "🌧️", value: 1, color: "#b95b55" },
  { label: "Low", icon: "🌫️", value: 2, color: "#b98542" },
  { label: "Okay", icon: "🌤️", value: 3, color: "#c4a84f" },
  { label: "Steady", icon: "🌿", value: 4, color: "#6f9d68" },
  { label: "Strong", icon: "⚔️", value: 5, color: "#8f72d8" }
];

const quotes = [
  "Discipline is not a finish line. It is the path.",
  "Control your mind before the world controls it.",
  "A hard-working person was once lazy.",
  "The strongest minds stay gentle.",
  "Small promises kept become self-respect."
];

const ranks = [
  { name: "Wanderer", xp: 0 },
  { name: "Seeker", xp: 150 },
  { name: "Quiet Builder", xp: 350 },
  { name: "Disciplined Mind", xp: 700 },
  { name: "Iron Will", xp: 1200 },
  { name: "Peaceful Warrior", xp: 1800 },
  { name: "Guardian", xp: 2600 },
  { name: "Dawn Walker", xp: 3600 },
  { name: "Mountain Soul", xp: 5000 },
  { name: "Mastery", xp: 7000 }
];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Bar({ value }) {
  return <div className="bar"><i style={{ width: `${Math.max(3, Math.min(100, value))}%` }} /></div>;
}

export default function App() {
  const today = todayKey();
  const [page, setPage] = useState("home");
  const [quests, setQuests] = useState(() => load("ts16_quests", starterQuests));
  const [streaks, setStreaks] = useState(() => load("ts16_streaks", starterStreaks));
  const [entries, setEntries] = useState(() => load("ts16_entries", {
    [today]: { done: [], mood: 4, intention: "", journal: "", checkedIn: false }
  }));
  const [newQuest, setNewQuest] = useState("");
  const [newStreak, setNewStreak] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [quoteIndex, setQuoteIndex] = useState(new Date().getDate() % quotes.length);
  const [soundName, setSoundName] = useState("");
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef(null);

  const entry = entries[today] || { done: [], mood: 4, intention: "", journal: "", checkedIn: false };
  const selectedEntry = entries[selectedDate] || { done: [], mood: null, intention: "", journal: "", checkedIn: false };
  const xp = quests.filter(q => entry.done.includes(q.id)).reduce((sum, q) => sum + q.xp, 0) + (entry.checkedIn ? 40 : 0) + (entry.journal.length > 25 ? 35 : 0) + 350;
  const rank = [...ranks].reverse().find(r => xp >= r.xp) || ranks[0];
  const nextRank = ranks.find(r => r.xp > xp) || ranks[ranks.length - 1];
  const rankProgress = nextRank.xp === rank.xp ? 100 : Math.round(((xp - rank.xp) / (nextRank.xp - rank.xp)) * 100);
  const questProgress = quests.length ? Math.round((entry.done.length / quests.length) * 100) : 0;
  const mood = moods.find(m => m.value === entry.mood) || moods[3];

  const calendarDays = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 13);
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      return { key, num: d.getDate(), weekday: d.toLocaleDateString(undefined, { weekday: "short" }), entry: entries[key] };
    });
  }, [entries]);

  function updateEntry(date, patch) {
    const current = entries[date] || { done: [], mood: 4, intention: "", journal: "", checkedIn: false };
    const next = { ...entries, [date]: { ...current, ...patch } };
    setEntries(next);
    save("ts16_entries", next);
  }

  function toggleQuest(id) {
    const done = entry.done.includes(id) ? entry.done.filter(x => x !== id) : [...entry.done, id];
    updateEntry(today, { done });
  }

  function addQuest() {
    if (!newQuest.trim()) return;
    const next = [...quests, { id: crypto.randomUUID(), title: newQuest.trim(), area: "Custom", xp: 20 }];
    setQuests(next);
    save("ts16_quests", next);
    setNewQuest("");
  }

  function deleteQuest(id) {
    const next = quests.filter(q => q.id !== id);
    setQuests(next);
    save("ts16_quests", next);
    updateEntry(today, { done: entry.done.filter(x => x !== id) });
  }

  function addStreak() {
    if (!newStreak.trim()) return;
    const next = [...streaks, { id: crypto.randomUUID(), title: newStreak.trim(), note: "Keep the chain alive.", count: 0 }];
    setStreaks(next);
    save("ts16_streaks", next);
    setNewStreak("");
  }

  function markStreak(id) {
    const next = streaks.map(s => s.id === id ? { ...s, count: s.count + 1 } : s);
    setStreaks(next);
    save("ts16_streaks", next);
  }

  function resetStreak(id) {
    const next = streaks.map(s => s.id === id ? { ...s, count: 0 } : s);
    setStreaks(next);
    save("ts16_streaks", next);
  }

  function stopSound() {
    if (audioRef.current) {
      try {
        audioRef.current.nodes.forEach(n => n.stop && n.stop());
        audioRef.current.ctx.close();
      } catch {}
      audioRef.current = null;
    }
    setSoundOn(false);
  }

  function startSound(name) {
    stopSound();
    setSoundName(name);

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();

      const master = ctx.createGain();
      master.gain.value = 0.08;
      master.connect(ctx.destination);

      const oscillators = [];
      const makeOsc = (type, freq, gainVal) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = gainVal;
        osc.connect(gain);
        gain.connect(master);
        osc.start();
        oscillators.push(osc);
      };

      if (name === "Rain") {
        makeOsc("sawtooth", 80, 0.012);
        makeOsc("sawtooth", 163, 0.009);
        makeOsc("triangle", 250, 0.004);
      } else if (name === "Forest") {
        makeOsc("sine", 132, 0.025);
        makeOsc("triangle", 264, 0.008);
      } else if (name === "Night") {
        makeOsc("sine", 70, 0.03);
        makeOsc("triangle", 140, 0.009);
      } else if (name === "Fire") {
        makeOsc("sawtooth", 55, 0.018);
        makeOsc("triangle", 111, 0.012);
      } else {
        makeOsc("sine", 96, 0.025);
        makeOsc("triangle", 192, 0.01);
      }

      audioRef.current = { ctx, nodes: oscillators, master };
      setSoundOn(true);
    } catch {
      alert("Audio was blocked. Click a sound again after the page is focused.");
    }
  }

  const nav = [
    ["home", Home, "Home"],
    ["quests", Target, "Daily Quests"],
    ["journal", BookOpen, "Journal"],
    ["calendar", CalendarDays, "Calendar"],
    ["streaks", Flame, "Streaks"],
    ["paths", Zap, "Paths"],
    ["stats", LineChart, "Stats"],
    ["community", Users, "Community"],
    ["profile", User, "Profile"]
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">山</div>
          <div>
            <h1>Tomorrow’s Self</h1>
            <p>Quiet self-mastery</p>
          </div>
        </div>

        <nav>
          {nav.map(([key, Icon, label]) => (
            <button key={key} className={page === key ? "active" : ""} onClick={() => setPage(key)}>
              <Icon size={19}/>{label}
            </button>
          ))}
        </nav>

        <button className="account" onClick={() => setPage("profile")}>
          <div className="accountFace"></div>
          <div><b>{rank.name}</b><span>{xp} XP</span></div>
        </button>
      </aside>

      <main className="main">
        {page === "home" && (
          <>
            <section className="hero">
              <div className="heroScene">
                <div className="moon"></div>
                <div className="mountainShape"></div>
                <img className="animeFigureImage" src={animeFigure} alt="anime-inspired quiet warrior" />
              </div>

              <div className="heroText">
                <span>The path is quiet.</span>
                <h2>Become someone tomorrow you can respect.</h2>
                <p>“{quotes[quoteIndex]}”</p>
                <button onClick={() => setQuoteIndex((quoteIndex + 1) % quotes.length)}>New quote</button>
              </div>

              <Card className="progressOverlay">
                <div className="section">
                  <div>
                    <span>Current Title</span>
                    <h3>{rank.name}</h3>
                    <p>{xp} XP · Next: {nextRank.name}</p>
                  </div>
                  <b>{rankProgress}%</b>
                </div>
                <Bar value={rankProgress}/>
              </Card>
            </section>

            <section className="dashboardGrid">
              <Card>
                <div className="section"><h3>Daily Quests</h3><button onClick={() => setPage("quests")}>View all</button></div>
                <div className="list">
                  {quests.slice(0, 5).map(q => (
                    <button key={q.id} className={`row ${entry.done.includes(q.id) ? "done" : ""}`} onClick={() => toggleQuest(q.id)}>
                      <span>{entry.done.includes(q.id) ? "✓" : ""}</span>
                      <div><b>{q.title}</b><small>{q.area}</small></div>
                      <em>+{q.xp}</em>
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="section"><h3>Today’s Intention</h3></div>
                <textarea className="intention" value={entry.intention} onChange={e => updateEntry(today, { intention: e.target.value })} placeholder="What kind of person are you choosing to be today?" />
                <div className="moods">
                  {moods.map(m => <button key={m.value} style={{"--mood": m.color}} className={entry.mood === m.value ? "active" : ""} onClick={() => updateEntry(today, { mood: m.value, checkedIn: true })}><span>{m.icon}</span><small>{m.label}</small></button>)}
                </div>
              </Card>

              <Card>
                <div className="section"><h3>Streaks</h3><button onClick={() => setPage("streaks")}>Manage</button></div>
                <div className="streakMini">
                  {streaks.slice(0, 4).map(s => <div key={s.id}><b>{s.count}</b><span>{s.title}</span></div>)}
                </div>
              </Card>

              <Card>
                <div className="section"><h3>Calendar</h3><button onClick={() => setPage("calendar")}>Open</button></div>
                <CalendarView days={calendarDays} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
              </Card>

              <Card>
                <div className="section"><h3>Recent Journal</h3><button onClick={() => setPage("journal")}>Write</button></div>
                <p className="journalPreview">{entry.journal || "No reflection yet. Write one honest sentence today."}</p>
              </Card>

              <Card>
                <div className="section"><h3>Ambience</h3><button onClick={soundOn ? stopSound : () => startSound(soundName || "Rain")}>{soundOn ? <Pause size={16}/> : <Play size={16}/>} {soundOn ? "Stop" : "Play"}</button></div>
                <div className="sounds">
                  {["Rain","Forest","Night","Fire"].map(name => <button key={name} className={soundOn && soundName === name ? "active" : ""} onClick={() => startSound(name)}>{name}</button>)}
                </div>
                <p className="muted">{soundOn ? `${soundName} ambience is playing.` : "Click a sound to start. Browsers block autoplay until you click."}</p>
              </Card>

              <Card>
                <div className="section"><h3>Insights</h3><button onClick={() => setPage("stats")}>Stats</button></div>
                <div className="insights">
                  <div><b>{questProgress}%</b><span>Quests</span></div>
                  <div><b>{mood.label}</b><span>Mood</span></div>
                  <div><b>{streaks[0]?.count || 0}</b><span>Clean Mind</span></div>
                </div>
              </Card>
            </section>
          </>
        )}

        {page === "quests" && <Quests quests={quests} entry={entry} toggleQuest={toggleQuest} newQuest={newQuest} setNewQuest={setNewQuest} addQuest={addQuest} deleteQuest={deleteQuest}/>}
        {page === "journal" && <Journal entry={entry} today={today} updateEntry={updateEntry} moods={moods}/>}
        {page === "calendar" && <CalendarPage days={calendarDays} selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedEntry={selectedEntry}/>}
        {page === "streaks" && <Streaks streaks={streaks} markStreak={markStreak} resetStreak={resetStreak} newStreak={newStreak} setNewStreak={setNewStreak} addStreak={addStreak}/>}
        {page === "paths" && <Paths/>}
        {page === "stats" && <Stats progress={questProgress} mood={mood} streaks={streaks} xp={xp}/>}
        {page === "community" && <Community/>}
        {page === "profile" && <Profile rank={rank} xp={xp} nextRank={nextRank} rankProgress={rankProgress}/>}
      </main>
    </div>
  );
}

function CalendarView({ days, selectedDate, setSelectedDate }) {
  return <div className="calendarGrid">
    {days.map(d => {
      const mood = d.entry?.mood ? moods.find(m => m.value === d.entry.mood) : null;
      return <button key={d.key} className={`${selectedDate === d.key ? "selected" : ""} ${d.entry?.checkedIn ? "saved" : ""}`} style={{"--mood": mood?.color || "#d2ad68"}} onClick={() => setSelectedDate(d.key)}>
        <small>{d.weekday[0]}</small>
        <b>{d.num}</b>
        <span>{mood?.icon || "—"}</span>
      </button>
    })}
  </div>
}

function Quests({ quests, entry, toggleQuest, newQuest, setNewQuest, addQuest, deleteQuest }) {
  return <Page title="Daily Quests" subtitle="Small actions. Big change.">
    <Card>
      <div className="add"><input value={newQuest} onChange={e => setNewQuest(e.target.value)} onKeyDown={e => e.key === "Enter" && addQuest()} placeholder="Add daily quest..." /><button onClick={addQuest}><Plus size={16}/> Add</button></div>
    </Card>
    <Card><div className="list">{quests.map(q => <div key={q.id} className={`row ${entry.done.includes(q.id) ? "done" : ""}`}><button onClick={() => toggleQuest(q.id)}>{entry.done.includes(q.id) ? "✓" : ""}</button><div><b>{q.title}</b><small>{q.area}</small></div><button onClick={() => deleteQuest(q.id)}><Trash2 size={16}/></button></div>)}</div></Card>
  </Page>
}

function Journal({ entry, today, updateEntry, moods }) {
  return <Page title="Journal" subtitle="Write honestly. No performance. No pretending.">
    <Card>
      <div className="moods">{moods.map(m => <button key={m.value} style={{"--mood": m.color}} className={entry.mood === m.value ? "active" : ""} onClick={() => updateEntry(today, { mood: m.value, checkedIn: true })}><span>{m.icon}</span><small>{m.label}</small></button>)}</div>
      <textarea value={entry.journal} onChange={e => updateEntry(today, { journal: e.target.value })} placeholder="What did you learn today?" />
    </Card>
  </Page>
}

function CalendarPage({ days, selectedDate, setSelectedDate, selectedEntry }) {
  const mood = selectedEntry.mood ? moods.find(m => m.value === selectedEntry.mood) : null;
  return <Page title="Calendar" subtitle="Click a day to see what happened.">
    <Card><CalendarView days={days} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/></Card>
    <Card><h3>{readableDate(selectedDate)}</h3><p className="muted">Mood: {mood ? `${mood.icon} ${mood.label}` : "No check-in"}</p><p>{selectedEntry.journal || "No journal entry for this day."}</p></Card>
  </Page>
}

function Streaks({ streaks, markStreak, resetStreak, newStreak, setNewStreak, addStreak }) {
  return <Page title="Streaks" subtitle="Proof that you keep returning.">
    <Card><div className="add"><input value={newStreak} onChange={e => setNewStreak(e.target.value)} onKeyDown={e => e.key === "Enter" && addStreak()} placeholder="Add streak..." /><button onClick={addStreak}><Plus size={16}/> Add</button></div></Card>
    <div className="streakCards">{streaks.map(s => <Card key={s.id}><Flame/><h3>{s.title}</h3><b>{s.count} days</b><p>{s.note}</p><div className="streakActions"><button onClick={() => markStreak(s.id)}>Mark today</button><button onClick={() => resetStreak(s.id)}><RotateCcw size={15}/> Reset</button></div></Card>)}</div>
  </Page>
}

function Paths() {
  return <Page title="Paths" subtitle="Grow in the areas that matter.">
    <div className="pathCards">{["Discipline","Peace","Health","Clean Mind"].map((p, i) => <Card key={p}><h3>{["🔥","🌿","🥗","🛡️"][i]} {p}</h3><p className="muted">{["Quiet Builder","Still Mind","Strong Heart","Clear Sight"][i]}</p><Bar value={[70,46,72,52][i]}/></Card>)}</div>
  </Page>
}

function Stats({ progress, mood, streaks, xp }) {
  return <Page title="Stats" subtitle="Meaning, not spreadsheets.">
    <div className="statCards"><Card><Trophy/><b>{xp}</b><span>XP</span></Card><Card><Target/><b>{progress}%</b><span>Quests</span></Card><Card><Flame/><b>{streaks[0]?.count || 0}</b><span>Clean Mind</span></Card><Card><Wind/><b>{mood.label}</b><span>Mood</span></Card></div>
  </Page>
}

function Community() {
  return <Page title="Community" subtitle="No ego. No competition. Just people rebuilding themselves.">
    <div className="posts"><Card><b>Anonymous Warrior</b><p>Not perfect today, but I still showed up.</p></Card><Card><b>Quiet Builder</b><p>I protected my peace instead of reacting.</p></Card><Card><b>Path Walker</b><p>The comeback is stronger than the setback.</p></Card></div>
  </Page>
}

function Profile({ rank, xp, nextRank, rankProgress }) {
  return <Page title="Profile" subtitle="The person you are becoming.">
    <Card className="profile"><div className="profileAvatar"></div><h2>{rank.name}</h2><p>{xp} XP · Next: {nextRank.name}</p><Bar value={rankProgress}/></Card>
  </Page>
}

function Page({ title, subtitle, children }) {
  return <section className="page"><h1>{title}</h1><p>{subtitle}</p>{children}</section>
}
