
import React, { useMemo, useRef, useState } from "react";
import {
  Apple, Bell, BookOpen, Brain, CheckCircle2, Dumbbell, Flame, Heart, Home,
  Leaf, Lock, Moon, Music, Plus, Shield, Sparkles, Target, Trash2, Trophy,
  User, Users, Wind, Zap
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

const quotes = [
  ["The future depends on what you do today.", "Mahatma Gandhi"],
  ["Waste no more time arguing what a good person should be. Be one.", "Marcus Aurelius"],
  ["We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "Aristotle"],
  ["The man who moves a mountain begins by carrying away small stones.", "Confucius"],
  ["Small promises kept become self-respect.", "Tomorrow’s Self"],
  ["A calm mind is built, not found.", "Tomorrow’s Self"],
  ["A strong person protects peace instead of destroying it.", "Tomorrow’s Self"]
];

const starterGoals = [
  { id: "morning", title: "Morning intention", area: "Discipline", xp: 120 },
  { id: "workout", title: "Train the body", area: "Health", xp: 160 },
  { id: "clean", title: "Protect clean mind", area: "Clean Mind", xp: 200 },
  { id: "read", title: "Deep focus / reading", area: "Focus", xp: 100 },
  { id: "peace", title: "Pause before reacting", area: "Peace", xp: 140 },
  { id: "night", title: "Night reflection", area: "Peace", xp: 120 }
];

const starterHealth = [
  { id: "water", title: "Water", target: "6 cups", icon: "💧" },
  { id: "meal", title: "Clean meal", target: "1 meal", icon: "🥗" },
  { id: "training", title: "Movement", target: "30 min", icon: "🏋️" },
  { id: "sleep", title: "Sleep routine", target: "8 hours", icon: "🌙" }
];

const paths = [
  { key: "Discipline", icon: "⚔️", line: "Do what you said you would do.", ranks: ["Builder","Relentless","Iron Habit","Unbreakable"] },
  { key: "Peace", icon: "🌿", line: "Calm over reaction.", ranks: ["Listener","Still Mind","Quiet Flame","Mountain Mind"] },
  { key: "Health", icon: "❤️‍🔥", line: "Body and mind alignment.", ranks: ["Awakening","Strong Heart","Vital Spirit","Peak State"] },
  { key: "Clean Mind", icon: "🧠", line: "Protect your attention.", ranks: ["Aware","Clear Sight","Unshaken","Pure Focus"] },
  { key: "Kindness", icon: "🤝", line: "Strength without cruelty.", ranks: ["Gentle Hand","Steady Soul","Safe Presence","Guardian Heart"] },
  { key: "Focus", icon: "🎯", line: "Attention is power.", ranks: ["Observer","Locked In","Deep Focus","Flow State"] }
];

const moods = [
  { label: "Heavy", value: 1, icon: "🌧️", color: "#d75f55" },
  { label: "Low", value: 2, icon: "🌫️", color: "#c4873d" },
  { label: "Okay", value: 3, icon: "🌤️", color: "#d7b74f" },
  { label: "Steady", value: 4, icon: "🌿", color: "#69a96b" },
  { label: "Strong", value: 5, icon: "⚔️", color: "#8e6bff" }
];

const ambience = [
  { name: "Campfire", icon: Flame },
  { name: "Rain", icon: Wind },
  { name: "Mountain", icon: Leaf },
  { name: "Focus", icon: Brain }
];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Ring({ value }) {
  return <div className="ring" style={{ "--p": `${value}%` }}><span>{value}%</span></div>;
}

export default function App() {
  const today = todayKey();
  const [tab, setTab] = useState("sanctuary");
  const [quoteIndex, setQuoteIndex] = useState(new Date().getDate() % quotes.length);
  const [goals, setGoals] = useState(() => load("ts9_goals", starterGoals));
  const [health, setHealth] = useState(() => load("ts9_health", starterHealth));
  const [entries, setEntries] = useState(() => load("ts9_entries", {
    [today]: { done: [], healthDone: [], mood: 4, journal: "", morning: "", night: "", checkedIn: false, graceUsed: false }
  }));
  const [newGoal, setNewGoal] = useState("");
  const [newHealth, setNewHealth] = useState("");
  const [saved, setSaved] = useState("");
  const [sound, setSound] = useState("Campfire");
  const audioRef = useRef(null);

  const entry = entries[today] || { done: [], healthDone: [], mood: 4, journal: "", morning: "", night: "", checkedIn: false, graceUsed: false };
  const completedXP = goals.filter(g => entry.done.includes(g.id)).reduce((sum, g) => sum + g.xp, 0);
  const healthXP = (entry.healthDone || []).length * 90;
  const ritualXP = (entry.checkedIn ? 100 : 0) + (entry.morning?.length > 10 ? 80 : 0) + (entry.night?.length > 10 ? 80 : 0);
  const xp = 2600 + completedXP + healthXP + ritualXP;
  const rank = [...ranks].reverse().find(r => xp >= r.xp) || ranks[0];
  const nextRank = ranks.find(r => r.xp > xp) || ranks[ranks.length - 1];
  const rankProgress = nextRank.xp === rank.xp ? 100 : Math.round(((xp - rank.xp) / (nextRank.xp - rank.xp)) * 100);
  const goalProgress = goals.length ? Math.round((entry.done.length / goals.length) * 100) : 0;
  const healthProgress = health.length ? Math.round(((entry.healthDone || []).length / health.length) * 100) : 0;
  const flamePower = Math.min(100, Math.round((goalProgress * 0.55) + (healthProgress * 0.25) + (entry.checkedIn ? 20 : 0)));
  const sanctuaryState = flamePower > 75 ? "Dawn" : flamePower > 40 ? "Ember" : "Quiet";
  const quote = quotes[quoteIndex];

  function updateEntry(patch) {
    const next = { ...entries, [today]: { ...entry, ...patch } };
    setEntries(next);
    save("ts9_entries", next);
  }

  function notify(text) {
    setSaved(text);
    setTimeout(() => setSaved(""), 1800);
  }

  function playAmbience(name) {
    setSound(name);
    try {
      if (audioRef.current) {
        audioRef.current.osc.stop();
        audioRef.current.gain.disconnect();
        audioRef.current.ctx.close();
        audioRef.current = null;
      }
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const tones = { Campfire: 92, Rain: 180, Mountain: 136, Focus: 110 };
      osc.type = name === "Rain" ? "sawtooth" : name === "Focus" ? "triangle" : "sine";
      osc.frequency.value = tones[name] || 120;
      gain.gain.value = name === "Rain" ? 0.018 : 0.026;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      audioRef.current = { ctx, osc, gain };
      notify(`${name} ambience on`);
    } catch {
      notify("Tap again if sound is blocked");
    }
  }

  function saveCheckIn() {
    updateEntry({ checkedIn: true });
    notify("Saved for today");
  }

  function useGrace() {
    updateEntry({ graceUsed: true, checkedIn: true });
    notify("Grace day protected");
  }

  function toggleGoal(id) {
    const done = entry.done.includes(id) ? entry.done.filter(x => x !== id) : [...entry.done, id];
    updateEntry({ done });
  }

  function addGoal() {
    if (!newGoal.trim()) return;
    const next = [...goals, { id: crypto.randomUUID(), title: newGoal.trim(), area: "Custom", xp: 100 }];
    setGoals(next);
    save("ts9_goals", next);
    setNewGoal("");
  }

  function deleteGoal(id) {
    const next = goals.filter(g => g.id !== id);
    setGoals(next);
    save("ts9_goals", next);
    updateEntry({ done: entry.done.filter(x => x !== id) });
  }

  function toggleHealth(id) {
    const healthDone = entry.healthDone.includes(id) ? entry.healthDone.filter(x => x !== id) : [...entry.healthDone, id];
    updateEntry({ healthDone });
  }

  function addHealth() {
    if (!newHealth.trim()) return;
    const next = [...health, { id: crypto.randomUUID(), title: newHealth.trim(), target: "Daily", icon: "✅" }];
    setHealth(next);
    save("ts9_health", next);
    setNewHealth("");
  }

  const historyDays = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - index));
    const key = d.toISOString().slice(0, 10);
    return { key, day: d.toLocaleDateString(undefined, { weekday: "short" }), num: d.getDate(), entry: entries[key] };
  }), [entries]);

  const tabs = [
    ["sanctuary", Home, "Home"],
    ["quests", Target, "Quests"],
    ["journal", BookOpen, "Journal"],
    ["insights", Trophy, "Stats"],
    ["paths", Zap, "Paths"],
    ["health", Heart, "Health"],
    ["community", Users, "People"],
    ["profile", User, "Profile"]
  ];

  return (
    <div className={`phone-app ${sanctuaryState.toLowerCase()}`}>
      <header className="topbar">
        <div><p>Tomorrow’s Self</p><h1>{tabs.find(t => t[0] === tab)?.[2]}</h1></div>
        <button className="icon-btn"><Bell size={18}/></button>
      </header>

      <main>
        {saved && <div className="toast">{saved}</div>}

        {tab === "sanctuary" && <Sanctuary quote={quote} quoteIndex={quoteIndex} setQuoteIndex={setQuoteIndex} flamePower={flamePower} sanctuaryState={sanctuaryState} rank={rank} nextRank={nextRank} rankProgress={rankProgress} xp={xp} entry={entry} updateEntry={updateEntry} saveCheckIn={saveCheckIn} useGrace={useGrace} goals={goals} toggleGoal={toggleGoal} setTab={setTab} sound={sound} setSound={setSound} playAmbience={playAmbience}/>}
        {tab === "quests" && <Quests goals={goals} entry={entry} toggleGoal={toggleGoal} newGoal={newGoal} setNewGoal={setNewGoal} addGoal={addGoal} deleteGoal={deleteGoal}/>}
        {tab === "journal" && <Journal entry={entry} updateEntry={updateEntry} saveCheckIn={saveCheckIn} historyDays={historyDays}/>}
        {tab === "insights" && <Insights historyDays={historyDays} goalProgress={goalProgress} healthProgress={healthProgress} entry={entry} flamePower={flamePower}/>}
        {tab === "paths" && <Paths goals={goals} entry={entry}/>}
        {tab === "health" && <Health health={health} entry={entry} toggleHealth={toggleHealth} newHealth={newHealth} setNewHealth={setNewHealth} addHealth={addHealth} healthProgress={healthProgress}/>}
        {tab === "community" && <Community/>}
        {tab === "profile" && <Profile rank={rank} nextRank={nextRank} rankProgress={rankProgress} xp={xp} flamePower={flamePower} sound={sound} setSound={setSound} playAmbience={playAmbience}/>}
      </main>

      <nav className="bottom-nav">
        {tabs.slice(0,5).map(([key, Icon, label]) => (
          <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
            <Icon size={20}/><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Sanctuary({ quote, quoteIndex, setQuoteIndex, flamePower, sanctuaryState, rank, nextRank, rankProgress, xp, entry, updateEntry, saveCheckIn, useGrace, goals, toggleGoal, setTab, sound, setSound, playAmbience }) {
  return <div className="stack">
    <section className="sanctuary-card">
      <div className="particles"><i/><i/><i/><i/><i/></div>
      <div className="mountain"></div>
      <div className="anime-silhouette"></div>
      <div className="fire" style={{"--flame": `${Math.max(35, flamePower)}%`}}></div>
      <div className="sanctuary-copy">
        <span className="crown">The Sanctuary • {sanctuaryState}</span>
        <h2>Become someone tomorrow you can respect.</h2>
        <p>“{quote[0]}”</p><small>— {quote[1]}</small>
        <button className="gold-btn" onClick={() => setQuoteIndex((quoteIndex + 1) % quotes.length)}>New Quote</button>
      </div>
    </section>

    <Card className="rank-card">
      <div><span>Current Title</span><h3>{rank.name}</h3><p>{xp.toLocaleString()} XP · Next: {nextRank.name}</p></div>
      <Ring value={rankProgress}/>
    </Card>

    <Card className="progression-card">
      <div className="section-head"><h3>Progression</h3><button onClick={() => setTab("profile")}>Profile</button></div>
      <div className="progression-road">
        {["Wanderer","Seeker","Builder","Mind","Will"].map((r, i) => (
          <div key={r} className={i < 3 ? "road-step lit" : "road-step"}>
            <span>{i < 3 ? "🔥" : "•"}</span>
            <small>{r}</small>
          </div>
        ))}
      </div>
      <p className="muted">You are not chasing perfection. You are building a life you respect.</p>
    </Card>

    <Card>
      <div className="section-head"><h3>The Flame</h3><span>{flamePower}%</span></div>
      <div className="flame-meter"><i style={{width: `${flamePower}%`}} /></div>
      <p className="muted">The flame weakens on hard days, but it does not disappear. One bad day does not erase you.</p>
      {!entry.graceUsed && <button onClick={useGrace} className="soft-btn">Use Grace Day</button>}
    </Card>

    <Card>
      <h3>Morning Intention</h3>
      <textarea className="short" value={entry.morning} onChange={e => updateEntry({ morning: e.target.value })} placeholder="Who do I want to be today?" />
    </Card>

    <Card>
      <div className="section-head"><h3>Daily Quests</h3><button onClick={() => setTab("quests")}>View</button></div>
      <div className="list">{goals.slice(0,3).map(g => <button className={`row ${entry.done.includes(g.id) ? "done" : ""}`} key={g.id} onClick={() => toggleGoal(g.id)}><span className="check">{entry.done.includes(g.id) ? "✓" : ""}</span><div><b>{g.title}</b><small>{g.area}</small></div><em>+{g.xp}</em></button>)}</div>
    </Card>

    <Card>
      <h3>Check-in</h3>
      <MoodPicker entry={entry} updateEntry={updateEntry}/>
      <button onClick={saveCheckIn} className="wide-btn">Save Check-in</button>
    </Card>

    <Card>
      <div className="section-head"><h3>Ambience</h3><small>{sound}</small></div>
      <div className="sound-grid">
        {ambience.map(({ name, icon: Icon }) => <button className={sound === name ? "active" : ""} key={name} onClick={() => playAmbience(name)}><Icon/> {name}</button>)}
      </div>
    </Card>
  </div>
}

function MoodPicker({ entry, updateEntry }) {
  return <div className="moods">{moods.map(m => <button key={m.value} style={{"--mood": m.color}} className={entry.mood === m.value ? "active" : ""} onClick={() => updateEntry({ mood: m.value })}><span>{m.icon}</span><small>{m.label}</small></button>)}</div>
}

function Quests({ goals, entry, toggleGoal, newGoal, setNewGoal, addGoal, deleteGoal }) {
  return <div className="stack">
    <Card><h3>Daily Quest List</h3><p className="muted">The things that shape you. They return every day.</p><div className="add"><input value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()} placeholder="Add daily quest..." /><button onClick={addGoal}><Plus size={18}/></button></div></Card>
    <Card>
      <div className="quest-focus">
        <div><span>Today's Focus</span><b>Small actions. Big change.</b></div>
        <Ring value={Math.round((entry.done.length / goals.length) * 100) || 0}/>
      </div>
    </Card>
    <Card><div className="list">{goals.map(g => <div className={`row ${entry.done.includes(g.id) ? "done" : ""}`} key={g.id}><button className="check" onClick={() => toggleGoal(g.id)}>{entry.done.includes(g.id) ? "✓" : ""}</button><div><b>{g.title}</b><small>{g.area}</small></div><button onClick={() => deleteGoal(g.id)} className="trash"><Trash2 size={16}/></button></div>)}</div></Card>
    <Card>
      <h3>Quest Bonus</h3>
      <p className="muted">Finish every quest today to strengthen the flame and move closer to your next title.</p>
      <div className="bonus-box">🏆 +250 XP • Flame protected</div>
    </Card>
  </div>
}

function Journal({ entry, updateEntry, saveCheckIn, historyDays }) {
  return <div className="stack">
    <Card><h3>Morning Intention</h3><textarea className="short" value={entry.morning} onChange={e => updateEntry({ morning: e.target.value })} placeholder="Who do I want to be today?" /></Card>
    <Card><h3>Today’s Journal</h3><p className="muted">Write honestly. No performance. No pretending.</p><MoodPicker entry={entry} updateEntry={updateEntry}/><textarea value={entry.journal} onChange={e => updateEntry({ journal: e.target.value })} placeholder="What did you learn today? What would tomorrow’s self thank you for?" /><button onClick={saveCheckIn} className="wide-btn">Save Check-in</button></Card>
    <Card><h3>Night Reflection</h3><textarea className="short" value={entry.night} onChange={e => updateEntry({ night: e.target.value })} placeholder="What can I release before sleep?" /></Card>
    <Card><h3>Calendar</h3><Calendar historyDays={historyDays}/></Card>
  </div>
}

function Calendar({ historyDays }) {
  const savedDays = historyDays.filter(d => d.entry?.checkedIn);
  return <div>
    <div className="journey-calendar">
      {historyDays.map(d => {
        const mood = d.entry?.mood ? moods.find(m => m.value === d.entry.mood) : null;
        return <div className={d.entry?.checkedIn ? "journey-day saved" : "journey-day"} key={d.key} style={{"--mood": mood?.color || "#d2ad68"}}>
          <small>{d.day.slice(0,3)}</small>
          <b>{d.num}</b>
          <span>{mood?.icon || "—"}</span>
          {d.entry?.checkedIn && <i />}
        </div>
      })}
    </div>
    <div className="calendar-summary"><b>{savedDays.length}</b><span>check-ins saved recently</span></div>
  </div>
}

function Insights({ historyDays, goalProgress, healthProgress, entry, flamePower }) {
  return <div className="stack">
    <Card className="path-card"><h3>This Week</h3><div className="path-line">{[1,2,3,4,5,6,7].map((n,i)=><div className={i<5?"lit":""} key={n}>{i<5?"🔥":"•"}</div>)}</div><p>Small wins stacked into identity.</p></Card>
    <Card><h3>Emotional Weather</h3><div className="bubble-chart">{historyDays.slice(-7).map((d,i)=><div key={d.key}><span style={{height:`${60 + ((d.entry?.mood || (i%5)+1)*18)}px`, "--mood": d.entry?.mood ? moods.find(m=>m.value===d.entry.mood)?.color : moods[i%5].color}}>{d.entry?.mood ? moods.find(m=>m.value===d.entry.mood)?.icon : moods[i%5].icon}</span><small>{d.day[0]}</small></div>)}</div></Card>
    <Card><h3>Check-in History</h3><Calendar historyDays={historyDays}/></Card>
    <div className="quick-stats"><Card><b>{goalProgress}%</b><span>Goals</span></Card><Card><b>{healthProgress}%</b><span>Health</span></Card><Card><b>{flamePower}%</b><span>Flame</span></Card></div>
    <Card><h3>Meaning</h3><p className="muted">Strongest pattern: you keep returning. Recovery matters more than perfection.</p></Card>
  </div>
}

function Health({ health, entry, toggleHealth, newHealth, setNewHealth, addHealth, healthProgress }) {
  return <div className="stack">
    <Card><div className="section-head"><h3>Health Setup</h3><Ring value={healthProgress}/></div><p className="muted">Simple body habits that make discipline easier.</p><div className="add"><input value={newHealth} onChange={e => setNewHealth(e.target.value)} onKeyDown={e => e.key === "Enter" && addHealth()} placeholder="Add health habit..." /><button onClick={addHealth}><Plus size={18}/></button></div></Card>
    <Card><div className="list">{health.map(h => <div className={`row ${entry.healthDone.includes(h.id) ? "done" : ""}`} key={h.id}><button className="check" onClick={() => toggleHealth(h.id)}>{entry.healthDone.includes(h.id) ? "✓" : h.icon}</button><div><b>{h.title}</b><small>{h.target}</small></div></div>)}</div></Card>
    <div className="health-icons"><Card><Apple/><b>Nutrition</b></Card><Card><Heart/><b>Recovery</b></Card><Card><Moon/><b>Sleep</b></Card><Card><Wind/><b>Outside</b></Card></div>
  </div>
}

function Paths({ goals, entry }) {
  const score = (name) => {
    const related = goals.filter(g => g.area === name);
    if (!related.length) return 0;
    return Math.round((related.filter(g => entry.done.includes(g.id)).length / related.length) * 100);
  };
  const subRank = (value, ranks) => value >= 90 ? ranks[3] : value >= 65 ? ranks[2] : value >= 35 ? ranks[1] : ranks[0];

  return <div className="stack">{paths.map(p => {
    const percent = score(p.key);
    const active = subRank(percent, p.ranks);
    return <Card key={p.key} className="path-card"><div className="path-icon">{p.icon}</div><h3>{p.key} Path</h3><p className="muted">{p.line}</p><div className="path-rank"><span>Current Path Rank</span><b>{active}</b></div><div className="bar"><i style={{width:`${percent}%`}} /></div><small>{percent}% today</small><div className="mini-ranks">{p.ranks.map(r => <div key={r} className={active === r ? "mini-rank active" : "mini-rank"}>{r}</div>)}</div></Card>
  })}</div>
}

function Community() {
  return <div className="stack">
    <Card><h3>Community</h3><p className="muted">No ego. No competition. Just people rebuilding themselves.</p></Card>
    {["Discipline Path", "Clean Mind Path", "Peace Path", "Health Path"].map((p,i)=><Card key={p} className="community-row"><b>{["⚔️","🧠","🌿","❤️‍🔥"][i]} {p}</b><small>{[1284,892,1031,774][i]} walking this path</small></Card>)}
    <Card><Post name="ShadowSeeker" text="Day 14. Woke up early and got my workout in."/><Post name="QuietBuilder" text="Struggled today, but I didn’t quit."/><Post name="IronMind" text="30 days clean. Keep going."/></Card>
  </div>
}

function Post({ name, text }) {
  return <div className="post"><b>{name}</b><p>{text}</p><small>🔥 Encourage</small></div>
}

function Profile({ rank, nextRank, rankProgress, xp, flamePower, sound, setSound, playAmbience }) {
  return <div className="stack">
    <Card className="profile"><div className="big-emblem">⚔️</div><h2>{rank.name}</h2><p>{xp.toLocaleString()} XP · Next: {nextRank.name}</p><Ring value={rankProgress}/></Card>
    <Card><h3>The Flame</h3><div className="flame-meter"><i style={{width:`${flamePower}%`}} /></div><p className="muted">Your signature. It represents returning, not perfection.</p></Card>
    <Card><h3>Ambience</h3><div className="sound-grid">{ambience.map(({name, icon: Icon}) => <button className={sound === name ? "active" : ""} key={name} onClick={() => playAmbience(name)}><Icon/> {name}</button>)}</div></Card>
    <Card><h3>Unlocks</h3><div className="unlock-list">{[800,1800,3200,5200,8000].map((x,i) => <div className={xp >= x ? "unlock open" : "unlock"} key={x}>{xp >= x ? <Sparkles/> : <Lock/>}<div><b>{["Morning Path","Campfire Theme","Focus Chamber","Iron Title","Guardian Path"][i]}</b><small>{x} XP</small></div></div>)}</div></Card>
  </div>
}
