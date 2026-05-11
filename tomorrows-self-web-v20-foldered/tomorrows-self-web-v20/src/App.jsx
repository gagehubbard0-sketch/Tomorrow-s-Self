
import React, { useMemo, useRef, useState } from "react";
import {
  Home, Target, BookOpen, CalendarDays, Flame, Heart, Users, User, Settings,
  Bell, Crown, Shield, Dumbbell, Moon, Plus, CheckCircle2, Circle, Trophy,
  MessageCircle, BarChart3, Play, Pause, RotateCcw, ScrollText, Sparkles,
  Zap, HeartPulse, Sun, Sword, Activity, Clock, Star, Gift, Smile, Crosshair
} from "lucide-react";
import "./styles.css";

const todayKey = () => new Date().toISOString().slice(0, 10);

const baseGoals = [
  { id: "morning", title: "Morning Routine", icon: "☀️", xp: 20 },
  { id: "workout", title: "Workout", icon: "🏋️", xp: 25 },
  { id: "clean", title: "No Porn / No Gooning", icon: "🛡️", xp: 25 },
  { id: "read", title: "Read 20 Pages", icon: "📖", xp: 20 },
  { id: "cold", title: "Cold Shower", icon: "❄️", xp: 15 },
  { id: "meditate", title: "Meditate 10 Minutes", icon: "♨️", xp: 15 },
  { id: "sleep", title: "Sleep by 10:30 PM", icon: "🌙", xp: 15 }
];

const baseStreaks = [
  { id: "daily", title: "Daily Streak", days: 12, sub: "Keep showing up.", icon: Sun, tone: "sun", progress: 70 },
  { id: "clean", title: "No Porn Streak", days: 17, sub: "A free mind is an unstoppable mind.", icon: Shield, tone: "gold", progress: 78 },
  { id: "health", title: "Health Streak", days: 6, sub: "Fuel your body. Build your life.", icon: HeartPulse, tone: "green", progress: 45 },
  { id: "discipline", title: "Discipline Streak", days: 12, sub: "Discipline over motivation.", icon: Sword, tone: "red", progress: 55 }
];

const posts = [
  { name: "ShadowSeeker", tag: "Discipline Path", text: "Day 14. Woke up at 5AM and got my workout in. Discipline is starting to feel natural now.", fire: 24, comments: 6, avatar: "🧑🏽" },
  { name: "QuietBuilder", tag: "Focus Path", text: "Struggled today, but I didn’t quit. Tomorrow is another chance to be better.", fire: 18, comments: 3, avatar: "🥷" },
  { name: "IronMind", tag: "Clean Mind Path", text: "30 days clean. If I can do it, so can you. Keep fighting.", fire: 33, comments: 7, avatar: "🧔" }
];

const sounds = ["Rain", "Forest", "Night", "Fire", "Temple", "Waves"];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Progress({ value, tone = "gold" }) {
  return <div className={`progress ${tone}`}><i style={{ width: `${Math.max(4, Math.min(100, value))}%` }} /></div>;
}

export default function App() {
  const today = todayKey();
  const [active, setActive] = useState("Today");
  const [goals, setGoals] = useState(() => load("ts20_goals", baseGoals));
  const [done, setDone] = useState(() => load("ts20_done", ["morning", "workout", "clean", "read"]));
  const [streaks, setStreaks] = useState(() => load("ts20_streaks", baseStreaks));
  const [journal, setJournal] = useState(() => load("ts20_journal", "It wasn’t a perfect day, but I showed up.\nProud of the small wins."));
  const [sound, setSound] = useState("Rain");
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null);

  const completed = done.length;
  const xp = 2450 + completed * 20;
  const questPct = Math.round((completed / goals.length) * 100);

  function toggleGoal(id) {
    const next = done.includes(id) ? done.filter(x => x !== id) : [...done, id];
    setDone(next);
    save("ts20_done", next);
  }

  function addGoal() {
    const title = prompt("New goal:");
    if (!title) return;
    const next = [...goals, { id: crypto.randomUUID(), title, icon: "✨", xp: 15 }];
    setGoals(next);
    save("ts20_goals", next);
  }

  function markStreak(id) {
    const next = streaks.map(s => s.id === id ? { ...s, days: s.days + 1, progress: Math.min(100, s.progress + 5) } : s);
    setStreaks(next);
    save("ts20_streaks", next);
  }

  function startSound(name) {
    stopSound(false);
    setSound(name);
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 0.075;
      master.connect(ctx.destination);

      const configs = {
        Rain: [["sawtooth", 90, .014], ["sawtooth", 190, .011], ["triangle", 310, .004]],
        Forest: [["sine", 132, .026], ["triangle", 264, .01], ["sine", 390, .004]],
        Night: [["sine", 72, .032], ["triangle", 144, .009]],
        Fire: [["sawtooth", 58, .016], ["triangle", 116, .012], ["sawtooth", 232, .004]],
        Temple: [["sine", 108, .03], ["sine", 216, .012]],
        Waves: [["triangle", 64, .026], ["sine", 128, .015]]
      }[name];

      const nodes = configs.map(([type, freq, gainVal]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = gainVal;
        osc.connect(gain);
        gain.connect(master);
        osc.start();
        return osc;
      });

      audio.current = { ctx, nodes };
      setPlaying(true);
    } catch {
      alert("Audio was blocked. Click again after the page is focused.");
    }
  }

  function stopSound(update = true) {
    if (audio.current) {
      try {
        audio.current.nodes.forEach(n => n.stop());
        audio.current.ctx.close();
      } catch {}
      audio.current = null;
    }
    if (update) setPlaying(false);
  }

  const calendar = useMemo(() => {
    const nums = [27,28,29,30,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
    const complete = new Set([4,5,8,11,12,13,14,16,19,20]);
    return nums.map((n, i) => ({ n, complete: complete.has(n), today: n === 6 && i < 14 }));
  }, []);

  const nav = [
    [Home, "Today"], [Target, "Goals"], [BookOpen, "Journal"], [BarChart3, "Insights"],
    [Flame, "Streaks"], [Heart, "Health"], [Trophy, "Quests"], [Users, "Community"],
    [User, "Profile"], [Settings, "Settings"]
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logoSigil"><Sword size={34}/></div>
          <h1>TOMORROW’S SELF</h1>
          <p>DISCIPLINE. PURPOSE. FREEDOM.</p>
        </div>

        <nav className="nav">
          {nav.map(([Icon, label]) => (
            <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}>
              <Icon size={19}/><span>{label}</span>
            </button>
          ))}
        </nav>

        <Card className="focusWidget">
          <div className="tinyHero"></div>
          <div className="miniHead"><Sword size={16}/><span>FOCUS MODE</span><b>›</b></div>
          <p>Deep Work</p>
          <button className="play" onClick={() => playing ? stopSound() : startSound(sound)}>{playing ? <Pause size={20}/> : <Play size={20}/>}</button>
          <div className="playerControls"><span>◁</span><span>▷</span><span>▷|</span></div>
        </Card>

        <Card className="quoteMini">
          <p>“We are what we repeatedly do. Excellence, then, is not an act, but a habit.”</p>
          <span>— Aristotle</span>
        </Card>

        <Card className="levelMini">
          <div className="levelIcon"><Sword size={24}/></div>
          <div><b>LEVEL 12</b><span>Seeker</span></div>
          <Progress value={82}/>
          <small>2,450 / 3,000 XP</small>
        </Card>
      </aside>

      <main className="main">
        <section className="topbar">
          <div></div>
          <div className="topControls">
            <button><Bell size={20}/></button>
            <button className="fireBadge">🔥 7</button>
            <button className="profilePill"><span></span> ShadowSeeker</button>
          </div>
        </section>

        <section className="hero">
          <div className="scene">
            <div className="sunset"></div>
            <div className="mountainLayer back"></div>
            <div className="mountainLayer front"></div>
            <div className="valley"></div>
            <div className="samurai"></div>
            <div className="sword"></div>
            <div className="birds">⌁⌁⌁</div>
          </div>

          <div className="heroText">
            <span><Crown size={18}/> Good evening, King.</span>
            <h2>Become someone<br/>tomorrow you can respect.</h2>
            <p>“The future depends on what you do today.”</p>
            <small>— Marcus Aurelius</small>

            <div className="heroStats">
              <div><small>LEVEL</small><b>12</b></div>
              <div><small>XP</small><b>{xp.toLocaleString()}</b></div>
              <div><small>RANK</small><b>Seeker</b></div>
              <div><small>TITLE</small><b>In Progress</b></div>
            </div>

            <button className="primary">View Progress <span>→</span></button>
          </div>

          <Card className="dailyQuote">
            <h3>❝ Daily Quote</h3>
            <p>“Discipline is doing what needs to be done, even when you don’t feel like doing it.”</p>
            <small>— Jocko Willink</small>
            <button onClick={() => alert("New quote coming soon")}>⟳ New Quote</button>
          </Card>
        </section>

        <section className="content">
          <div className="leftContent">
            <Card className="streakPanel">
              <div className="sectionHead"><h3>🔥 Your Streaks</h3><button>View All Streaks ›</button></div>
              <div className="streakGrid">
                {streaks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div className="streakBox" key={s.id}>
                      <Icon className={`streakIcon ${s.tone}`} size={44}/>
                      <h4>{s.title}</h4>
                      <div><b>{s.days}</b><span>days</span></div>
                      <p>{s.sub}</p>
                      <Progress value={s.progress} tone={s.tone}/>
                      <button onClick={() => markStreak(s.id)}>Mark today</button>
                    </div>
                  )
                })}
              </div>
            </Card>

            <div className="middleGrid">
              <Card className="goalsPanel">
                <div className="sectionHead"><h3>Today’s Goals</h3><span>{completed} / {goals.length} completed</span></div>
                <div className="goalList">
                  {goals.map(g => (
                    <button key={g.id} className={done.includes(g.id) ? "goal done" : "goal"} onClick={() => toggleGoal(g.id)}>
                      <span>{done.includes(g.id) ? <CheckCircle2 size={18}/> : <Circle size={18}/>}</span>
                      <em>{g.icon}</em>
                      <b>{g.title}</b>
                    </button>
                  ))}
                </div>
                <button className="addGoal" onClick={addGoal}><Plus size={18}/> Add Goal</button>
              </Card>

              <Card className="pathPanel">
                <h3>Your Path</h3>
                <p>Disciplined Mind</p>
                <div className="crest"><Shield size={68}/></div>
                <b>LEVEL 12</b>
                <Progress value={82}/>
                <span>2,450 / 3,000 XP</span>
                <div className="reward"><Gift size={24}/><p>Next Reward<br/><b>Level 15 · New Title</b></p></div>
              </Card>

              <Card className="actionsPanel">
                <h3>Quick Actions</h3>
                {[
                  [Crosshair, "Start Focus Session"],
                  [Dumbbell, "Log Workout"],
                  [HeartPulse, "Log Meal"],
                  [ScrollText, "Write in Journal"],
                  [Moon, "Evening Reflection"]
                ].map(([Icon, label]) => <button key={label}><Icon size={21}/>{label}</button>)}
              </Card>
            </div>

            <div className="bottomGrid">
              <Card className="journalPanel">
                <div className="sectionHead"><h3>Recent Journal</h3><button>View All ›</button></div>
                <div className="journalEntry">
                  <div className="dateBox"><span>MAY</span><b>10</b></div>
                  <div>
                    <b>Today’s Reflection</b>
                    <p>{journal}</p>
                  </div>
                  <div className="moodBox"><small>Mood</small><Smile size={30}/></div>
                </div>
                <textarea value={journal} onChange={e => { setJournal(e.target.value); save("ts20_journal", e.target.value); }} />
              </Card>

              <Card className="insightsPanel">
                <div className="sectionHead"><h3>Insights</h3><button>This Week⌄</button></div>
                <div className="insightGrid">
                  <div><Smile/><small>Mood Average</small><b>Steady</b></div>
                  <div><CheckCircle2/><small>Goals Completed</small><b>{questPct}%</b></div>
                  <div><Clock/><small>Focus Time</small><b>12.4h</b></div>
                  <div><Star/><small>Best Day</small><b>May 8</b></div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="communityPanel">
            <div className="sectionHead"><h3>Community</h3><button>View All ›</button></div>
            <div className="tabs"><button className="active">Feed</button><button>Paths</button><button>Check-Ins</button><button>Groups</button></div>
            <input className="postInput" placeholder="Share something, stay accountable." />
            <div className="anon"><span></span> Anonymous <button>Post</button></div>

            <div className="posts">
              {posts.map(post => (
                <article key={post.name}>
                  <div className="postAvatar">{post.avatar}</div>
                  <div>
                    <div className="postHead"><b>{post.name}</b><small>2h ago</small><em>{post.tag}</em></div>
                    <p>{post.text}</p>
                    <div className="postActions"><span>🔥 {post.fire}</span><span><MessageCircle size={15}/> {post.comments}</span><button>⊕ Encourage</button></div>
                  </div>
                </article>
              ))}
            </div>

            <div className="activityChart">
              <small>Activity · This Week</small>
              <div>{[72,78,92,74,86,68,84,110,82].map((h, i) => <span key={i} style={{height:`${h}px`}} />)}</div>
              <footer><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></footer>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
