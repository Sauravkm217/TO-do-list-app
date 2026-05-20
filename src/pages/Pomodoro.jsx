// src/pages/Pomodoro.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useApp } from '../store/AppContext';

const MODES = [
  { id: 'work',  label: 'Focus',       color: '#6366f1', emoji: '💪', settingKey: 'pomodoroWork',  def: 25 },
  { id: 'short', label: 'Short Break', color: '#10b981', emoji: '☕', settingKey: 'pomodoroBreak', def: 5  },
  { id: 'long',  label: 'Long Break',  color: '#f97316', emoji: '🧘', settingKey: 'pomodoroLong',  def: 15 },
];

export default function Pomodoro() {
  const { settings, profile, tasks, addPomodoro, addToast } = useApp();
  const [modeIdx,    setModeIdx]    = useState(0);
  const [running,    setRunning]    = useState(false);
  const [seconds,    setSeconds]    = useState(null);
  const [sessions,   setSessions]   = useState(0);
  const [linkedTask, setLinkedTask] = useState('');
  const intervalRef = useRef(null);

  const mode     = MODES[modeIdx];
  const modeMins = settings[mode.settingKey] || mode.def;
  const totalSec = modeMins * 60;

  useEffect(() => { setRunning(false); setSeconds(totalSec); clearInterval(intervalRef.current); }, [modeIdx]);

  const handleComplete = useCallback(() => {
    if (modeIdx === 0) {
      const n = sessions + 1; setSessions(n); addPomodoro();
      addToast('🎉 Focus session complete! +30 XP', 'success', 4000);
      setModeIdx(n % 4 === 0 ? 2 : 1);
    } else { addToast('☕ Break done! Ready to focus?', 'info'); setModeIdx(0); }
  }, [modeIdx, sessions, addPomodoro, addToast]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => { if (s <= 1) { clearInterval(intervalRef.current); setRunning(false); handleComplete(); return 0; } return s - 1; });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running, handleComplete]);

  const secs = seconds ?? totalSec;
  const R = 110; const CIRC = 2 * Math.PI * R;
  const pct = 1 - secs / totalSec;
  const pending = tasks.filter(t => !t.completed);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title" style={{ fontSize: 22 }}>⏱️ Pomodoro Timer</h1>
        <p className="section-sub">Focus in sessions. Earn +30 XP per completed session.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
            {MODES.map((m, i) => (
              <button key={m.id} onClick={() => setModeIdx(i)} style={{
                padding: '8px 16px', borderRadius: 99, border: '2px solid',
                borderColor: modeIdx === i ? m.color : 'var(--border)',
                background: modeIdx === i ? `${m.color}18` : 'transparent',
                color: modeIdx === i ? m.color : 'var(--t2)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .2s',
              }}>{m.emoji} {m.label}</button>
            ))}
          </div>
          {/* Ring */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
            <svg width={260} height={260} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={130} cy={130} r={R} fill="none" stroke="var(--border)" strokeWidth={14} />
              <circle cx={130} cy={130} r={R} fill="none" stroke={mode.color} strokeWidth={14}
                strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct)}
                strokeLinecap="round" className="pomo-ring" />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {String(Math.floor(secs / 60)).padStart(2,'0')}:{String(secs % 60).padStart(2,'0')}
              </div>
              <div style={{ fontSize: 14, color: 'var(--t2)', marginTop: 6, fontWeight: 600 }}>{mode.emoji} {mode.label}</div>
              {running && <div style={{ fontSize: 11, color: mode.color, marginTop: 4, fontWeight: 700, animation: 'pulse 2s ease infinite' }}>● LIVE</div>}
            </div>
          </div>
          {/* Controls */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center' }}>
            <button className="btn btn-icon btn-ghost" onClick={() => { setRunning(false); setSeconds(totalSec); }} style={{ width: 44, height: 44 }}><RotateCcw size={18} /></button>
            <button onClick={() => setRunning(r => !r)} style={{
              width: 72, height: 72, borderRadius: '50%', border: 'none',
              background: `linear-gradient(135deg, ${mode.color}cc, ${mode.color})`,
              color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 6px 24px ${mode.color}55`, transition: 'all .2s',
            }}>{running ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}</button>
            <button className="btn btn-icon btn-ghost" onClick={() => { setRunning(false); setModeIdx(m => (m + 1) % 3); }} style={{ width: 44, height: 44 }}><SkipForward size={18} /></button>
          </div>
          {/* Dots */}
          <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
            {Array.from({ length: Math.min(8, sessions + 4) }, (_, i) => (
              <div key={i} style={{ width: i < sessions ? 14 : 10, height: i < sessions ? 14 : 10,
                borderRadius: '50%', background: i < sessions ? mode.color : 'var(--border)', transition: 'all .3s' }} />
            ))}
            <span style={{ fontSize: 13, color: 'var(--t2)', marginLeft: 4 }}>{sessions} sessions today</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 10 }}>🔗 Focusing On</div>
            <select className="input" value={linkedTask} onChange={e => setLinkedTask(e.target.value)}>
              <option value="">— Select a task —</option>
              {pending.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>

          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 12 }}>📊 Your Stats</div>
            {[
              { label: "Today's Sessions", val: sessions },
              { label: 'Total Sessions',   val: profile.pomodoroSessions },
              { label: 'XP Earned',        val: `${profile.pomodoroSessions * 30} XP` },
              { label: 'Current Streak',   val: `${profile.streak}d 🔥` },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--t2)' }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: 'var(--t1)' }}>{s.val}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '18px 20px', background: 'linear-gradient(135deg,rgba(99,102,241,.06),transparent)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 10 }}>💡 Tips</div>
            {['25 min focus → 5 min break', 'Every 4 sessions, take a long break',
              'Silence notifications during focus', 'One task per session'].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--t2)', marginBottom: 7 }}>
                <span style={{ color: 'var(--primary-l)' }}>→</span>{tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
