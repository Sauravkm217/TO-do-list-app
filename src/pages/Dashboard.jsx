// src/pages/Dashboard.jsx
import { useState, useMemo } from 'react';
import { Plus, Zap, Flame, CheckCircle2, Clock, Target } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getLevelInfo, CATEGORIES, XP_TABLE } from '../utils/gamification';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const QUOTES = [
  "The secret of getting ahead is getting started. – Mark Twain",
  "Done is better than perfect. – Sheryl Sandberg",
  "Small steps every day lead to big results.",
  "Focus on progress, not perfection.",
  "Every task completed is a step toward your goals.",
  "Your future self will thank you for starting today.",
  "Consistency beats intensity every time.",
];

export default function Dashboard() {
  const { tasks, profile, addTask, setPage } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const quote = useMemo(() => QUOTES[new Date().getDay() % QUOTES.length], []);
  const lvl   = getLevelInfo(profile.xp);

  const todayTasks   = tasks.filter(t => t.dueDate === today && !t.completed);
  const recentDone   = tasks.filter(t => t.completed).slice(-5).reverse();
  const pendingCount = tasks.filter(t => !t.completed).length;
  const doneCount    = tasks.filter(t =>  t.completed).length;
  const doneToday    = tasks.filter(t => t.completed &&
    t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === today).length;
  const goalPct = profile.dailyGoal > 0 ? Math.min(100, Math.round((doneToday / profile.dailyGoal) * 100)) : 0;

  const quickAdd = () => {
    if (!quickTitle.trim()) return;
    addTask({ title: quickTitle.trim(), category: 'Personal', priority: 'Medium', description: '', dueDate: '', dueTime: '', recurring: 'none', tags: [] });
    setQuickTitle('');
  };

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const greetEmoji = h < 12 ? '☀️' : h < 17 ? '⚡' : '🌙';

  return (
    <div>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg,#4f46e5,#6366f1,#818cf8)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        position: 'relative', overflow: 'hidden', color: 'white',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180,
          background: 'rgba(255,255,255,.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: '30%', width: 120, height: 120,
          background: 'rgba(255,255,255,.04)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 14, opacity: .75, fontWeight: 500, marginBottom: 4 }}>
            {greetEmoji} {greeting}, {profile.username || 'there'}!
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
            {pendingCount === 0
              ? "🎉 All done! You're crushing it!"
              : `You have ${pendingCount} task${pendingCount !== 1 ? 's' : ''} to crush`}
          </h1>
          <p style={{ fontSize: 13, opacity: .7, maxWidth: 500, lineHeight: 1.6 }}>"{quote}"</p>

          <div style={{ display: 'flex', gap: 20, marginTop: 18 }}>
            {[
              { icon: '🔥', label: 'Streak', val: `${profile.streak}d` },
              { icon: '⚡', label: 'XP', val: profile.xp },
              { icon: '🪙', label: 'Coins', val: profile.coins },
              { icon: '🏅', label: 'Badges', val: profile.badges.length },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{s.val}</div>
                <div style={{ fontSize: 10, opacity: .65, textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '📋', label: 'Total', val: tasks.length, color: 'var(--primary)' },
          { icon: '⏳', label: 'Pending', val: pendingCount, color: 'var(--warning)' },
          { icon: '✅', label: 'Completed', val: doneCount, color: 'var(--success)' },
          { icon: '🎯', label: "Today's Goal", val: `${doneToday}/${profile.dailyGoal}`, color: 'var(--accent)' },
        ].map(s => (
          <div key={s.label} className="stat-card card-hover">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Daily Goal + Level Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Daily goal */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>🎯 Daily Goal</div>
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>{doneToday} of {profile.dailyGoal} tasks</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: goalPct >= 100 ? 'var(--success)' : 'var(--primary)' }}>
              {goalPct}%
            </div>
          </div>
          <div className="prog-bar">
            <div className="prog-fill" style={{
              width: `${goalPct}%`,
              background: goalPct >= 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : undefined,
            }} />
          </div>
          {goalPct >= 100 && (
            <p style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginTop: 8 }}>
              🎉 Daily goal achieved!
            </p>
          )}
        </div>

        {/* Level progress */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>⚡ Level {lvl.level}</div>
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>{lvl.title} — {lvl.xpToNext} XP to next</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-l)' }}>{lvl.pct}%</div>
          </div>
          <div className="prog-bar">
            <div className="prog-fill" style={{ width: `${lvl.pct}%` }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        {/* Today's Tasks */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div className="section-title">📅 Due Today</div>
              <div className="section-sub">{todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''} scheduled</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => setPage('tasks')}>View all</button>
          </div>

          {/* Quick add */}
          <div className="quick-add" style={{ marginBottom: 12 }} onClick={() => document.getElementById('dash-quick')?.focus()}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <input id="dash-quick" className="quick-input" value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && quickAdd()}
              placeholder="Quick add — type and press Enter..." />
            {quickTitle && (
              <button className="btn btn-sm btn-primary" onClick={quickAdd}>Add</button>
            )}
          </div>

          {todayTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div style={{ fontSize: 40, animation: 'float 3s ease-in-out infinite' }}>📋</div>
              <p style={{ fontSize: 14 }}>No tasks due today. <button className="btn btn-sm btn-ghost"
                onClick={() => setShowModal(true)} style={{ marginLeft: 6 }}>Add one?</button></p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayTasks.slice(0, 5).map(t => (
                <TaskCard key={t.id} task={t} onEdit={setEditTask} />
              ))}
              {todayTasks.length > 5 && (
                <button className="btn btn-sm btn-ghost" onClick={() => setPage('tasks')} style={{ alignSelf: 'center' }}>
                  +{todayTasks.length - 5} more tasks
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recent completions */}
          <div className="card" style={{ padding: '20px' }}>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 14 }}>✅ Recently Done</div>
            {recentDone.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--t2)' }}>No completed tasks yet. Get started!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentDone.map(t => {
                  const cat = CATEGORIES[t.category] || CATEGORIES.Other;
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>✅</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)',
                          textDecoration: 'line-through', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                          {cat.icon} {t.category} · +{XP_TABLE[t.priority] || 25} XP
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category breakdown */}
          <div className="card" style={{ padding: '20px' }}>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 14 }}>📊 By Category</div>
            {Object.entries(CATEGORIES).map(([cat, cfg]) => {
              const total   = tasks.filter(t => t.category === cat).length;
              const done    = tasks.filter(t => t.category === cat && t.completed).length;
              if (total === 0) return null;
              const pct = Math.round((done / total) * 100);
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{cfg.icon} {cat}</span>
                    <span style={{ color: 'var(--t3)' }}>{done}/{total}</span>
                  </div>
                  <div className="prog-bar" style={{ height: 6 }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: cfg.color,
                      transition: 'width .6s ease' }} />
                  </div>
                </div>
              );
            })}
            {tasks.length === 0 && <p style={{ fontSize: 13, color: 'var(--t2)' }}>Add tasks to see breakdown</p>}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowModal(true)} title="Add Task">+</button>

      {showModal && <TaskModal onClose={() => setShowModal(false)} />}
      {editTask  && <TaskModal task={editTask} onClose={() => setEditTask(null)} />}
    </div>
  );
}
