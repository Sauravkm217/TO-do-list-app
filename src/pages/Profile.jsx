// src/pages/Profile.jsx
import { useApp } from '../store/AppContext';
import { getLevelInfo, BADGES, CATEGORIES, XP_TABLE } from '../utils/gamification';

export default function Profile() {
  const { profile, tasks } = useApp();
  const lvl       = getLevelInfo(profile.xp);
  const owned     = new Set(profile.badges);
  const completed = tasks.filter(t => t.completed)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title" style={{ fontSize: 22 }}>👤 Profile</h1>
        <p className="section-sub">Your productivity journey</p>
      </div>

      {/* Profile hero */}
      <div className="card" style={{
        padding: '28px 32px', marginBottom: 20,
        background: 'linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.06))',
        borderColor: 'rgba(99,102,241,.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 90, height: 90, borderRadius: 24, fontSize: 52,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--card)', border: '3px solid var(--primary)',
            boxShadow: '0 0 0 6px rgba(99,102,241,.15)',
          }}>
            {profile.avatar || '🦁'}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--t1)' }}>
              {profile.username || 'User'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{
                background: 'linear-gradient(135deg,var(--primary-d),var(--primary-l))',
                color: 'white', padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              }}>
                Lv.{lvl.level} {lvl.title}
              </span>
              <span style={{ fontSize: 13, color: 'var(--t2)' }}>
                Member since {new Date(profile.joinedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* XP Bar */}
            <div style={{ marginTop: 14, maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--t2)', marginBottom: 5 }}>
                <span>{profile.xp} XP</span>
                <span>{lvl.xpToNext} XP to Level {lvl.level + 1}</span>
              </div>
              <div className="prog-bar" style={{ height: 10 }}>
                <div className="prog-fill" style={{ width: `${lvl.pct}%` }} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {[
              { icon: '✅', label: 'Completed',  val: profile.totalCompleted },
              { icon: '🔥', label: 'Streak',      val: `${profile.streak}d`   },
              { icon: '🪙', label: 'Coins',        val: profile.coins          },
              { icon: '⏱️', label: 'Pomodoros',   val: profile.pomodoroSessions },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '12px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div className="section-title" style={{ fontSize: 16 }}>🏅 Achievement Badges</div>
            <div className="section-sub">{profile.badges.length} / {BADGES.length} unlocked</div>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 99, padding: '4px 14px',
            fontSize: 13, fontWeight: 700, color: 'var(--primary-l)' }}>
            {Math.round((profile.badges.length / BADGES.length) * 100)}% complete
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {BADGES.map(b => {
            const unlocked = owned.has(b.id);
            return (
              <div key={b.id} style={{
                background: unlocked ? 'linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.05))' : 'var(--bg)',
                border: `1.5px solid ${unlocked ? 'rgba(99,102,241,.3)' : 'var(--border)'}`,
                borderRadius: 14, padding: '14px 16px',
                opacity: unlocked ? 1 : .5,
                transition: 'all .2s',
              }}>
                <div style={{ fontSize: 30, marginBottom: 8, filter: unlocked ? 'none' : 'grayscale(1)' }}>
                  {b.emoji}
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)', marginBottom: 3 }}>{b.name}</div>
                <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.4 }}>{b.desc}</div>
                {unlocked && (
                  <div style={{ marginTop: 6, fontSize: 10, color: 'var(--success)', fontWeight: 700 }}>✅ Unlocked</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Task History */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>
          📜 Completion History ({completed.length})
        </div>
        {completed.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--t2)' }}>No completed tasks yet. Start completing tasks to build your history!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {completed.slice(0, 20).map((t, i) => {
              const cat = CATEGORIES[t.category] || CATEGORIES.Other;
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderBottom: i < Math.min(completed.length, 20) - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                      {cat.icon} {t.category} · {t.priority}
                      {t.completedAt && ` · ${new Date(t.completedAt).toLocaleDateString('en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 800, color: 'var(--primary-l)',
                    background: 'rgba(99,102,241,.1)', padding: '3px 10px', borderRadius: 99, flexShrink: 0,
                  }}>+{XP_TABLE[t.priority] || 25} XP</span>
                </div>
              );
            })}
            {completed.length > 20 && (
              <p style={{ fontSize: 13, color: 'var(--t3)', textAlign: 'center', marginTop: 12 }}>
                + {completed.length - 20} more completed tasks
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
