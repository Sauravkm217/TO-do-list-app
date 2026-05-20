// src/pages/Settings.jsx
import { useApp } from '../store/AppContext';
import { requestPermission } from '../utils/notifications';

const AVATARS = ['🦁','🐯','🦊','🐺','🦅','🐉','🦄','🐸','🤖','👨‍💻','🧙','🦸','🏋️','🧑‍🚀','🎯','🚀','⚡','💎','🔥','🌟'];

export default function Settings() {
  const { profile, settings, updateProfile, updateSettings, addToast, tasks } = useApp();

  const toggle = (key) => updateSettings({ [key]: !settings[key] });

  const handleNotifications = async () => {
    const granted = await requestPermission();
    if (granted) { updateSettings({ notificationsEnabled: true }); addToast('🔔 Notifications enabled!', 'success'); }
    else          { addToast('❌ Notification permission denied', 'error'); }
  };

  const clearAllData = () => {
    if (!confirm('This will delete ALL tasks, profile, and progress. Are you sure?')) return;
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title" style={{ fontSize: 22 }}>⚙️ Settings</h1>
        <p className="section-sub">Customize your TaskMaster Pro experience</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>

        {/* Profile */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', marginBottom: 18 }}>👤 Profile</h3>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Display Name</label>
            <input className="input" value={profile.username} maxLength={30}
              onChange={e => updateProfile({ username: e.target.value })}
              placeholder="Your name..." />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Daily Goal (tasks/day)</label>
            <input type="number" className="input" value={profile.dailyGoal} min={1} max={50}
              onChange={e => updateProfile({ dailyGoal: Math.max(1, parseInt(e.target.value) || 1) })} />
          </div>
          <div>
            <label className="label">Avatar</label>
            <div className="avatar-grid">
              {AVATARS.map(a => (
                <button key={a} type="button" className={`avatar-opt ${profile.avatar === a ? 'selected' : ''}`}
                  onClick={() => updateProfile({ avatar: a })}>{a}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', marginBottom: 16 }}>🎨 Appearance</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)' }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>Switch between light and dark themes</div>
            </div>
            <button onClick={() => toggle('darkMode')} style={{
              width: 52, height: 28, borderRadius: 99, border: 'none', cursor: 'pointer',
              background: settings.darkMode ? 'var(--primary)' : 'var(--border)',
              position: 'relative', transition: 'background .2s',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3,
                left: settings.darkMode ? 27 : 3, transition: 'left .2s',
                boxShadow: '0 1px 4px rgba(0,0,0,.2)',
              }} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', marginBottom: 16 }}>🔔 Notifications</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)' }}>Browser Notifications</div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>Get alerts for overdue and due tasks</div>
            </div>
            {settings.notificationsEnabled
              ? <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 700 }}>✅ Enabled</span>
              : <button className="btn btn-sm btn-primary" onClick={handleNotifications}>Enable</button>
            }
          </div>
          <div>
            <label className="label">Daily Reminder Time</label>
            <input type="time" className="input" value={settings.dailyReminderTime}
              onChange={e => updateSettings({ dailyReminderTime: e.target.value })} />
          </div>
        </div>

        {/* Pomodoro */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', marginBottom: 16 }}>⏱️ Pomodoro</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Focus (min)',      key: 'pomodoroWork',  min: 1, max: 60 },
              { label: 'Short Break (min)', key: 'pomodoroBreak', min: 1, max: 30 },
              { label: 'Long Break (min)',  key: 'pomodoroLong',  min: 5, max: 60 },
            ].map(s => (
              <div key={s.key}>
                <label className="label">{s.label}</label>
                <input type="number" className="input" value={settings[s.key]} min={s.min} max={s.max}
                  onChange={e => updateSettings({ [s.key]: Math.min(s.max, Math.max(s.min, parseInt(e.target.value) || s.min)) })} />
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', marginBottom: 16 }}>📊 Your Data</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Total Tasks', val: tasks.length },
              { label: 'Completed',   val: tasks.filter(t => t.completed).length },
              { label: 'Total XP',    val: `${profile.xp} XP` },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ padding: '22px 24px', borderColor: 'rgba(239,68,68,.3)', background: 'rgba(239,68,68,.02)' }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--danger)', marginBottom: 8 }}>⚠️ Danger Zone</h3>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 14 }}>This will permanently delete all your tasks, progress, and profile data.</p>
          <button className="btn btn-md btn-danger" onClick={clearAllData}>🗑️ Reset All Data</button>
        </div>
      </div>
    </div>
  );
}
