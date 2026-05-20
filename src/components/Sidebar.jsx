// src/components/Sidebar.jsx
import { useApp } from '../store/AppContext';
import { getLevelInfo, CATEGORIES } from '../utils/gamification';
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart2,
  Timer, User, Settings, X, ChevronRight, Zap, Flame,
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'tasks',     label: 'Tasks',       icon: CheckSquare },
  { id: 'calendar',  label: 'Calendar',    icon: Calendar },
  { id: 'analytics', label: 'Analytics',   icon: BarChart2 },
  { id: 'pomodoro',  label: 'Pomodoro',    icon: Timer },
  { id: 'profile',   label: 'Profile',     icon: User },
  { id: 'settings',  label: 'Settings',    icon: Settings },
];

export default function Sidebar() {
  const { activePage, setPage, sidebarOpen, toggleSidebar, profile, tasks } = useApp();
  const lvl = getLevelInfo(profile.xp);

  const pendingByCategory = Object.keys(CATEGORIES).reduce((acc, cat) => {
    acc[cat] = tasks.filter(t => t.category === cat && !t.completed).length;
    return acc;
  }, {});

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          style={{
            display: 'none',
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.5)', zIndex: 199,
          }}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#4f46e5,#818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 4px 12px rgba(99,102,241,.4)',
            }}>✅</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)' }}>TaskMaster</div>
              <div style={{ fontSize: 10, color: 'var(--primary-l)', fontWeight: 700 }}>PRO</div>
            </div>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={toggleSidebar}
            style={{ display: 'none' }} id="sidebar-close">
            <X size={16} />
          </button>
        </div>

        {/* Profile mini card */}
        <div style={{
          margin: '16px 12px', padding: '14px', borderRadius: 14,
          background: 'linear-gradient(135deg,rgba(99,102,241,.1),rgba(99,102,241,.05))',
          border: '1px solid rgba(99,102,241,.15)', cursor: 'pointer',
        }} onClick={() => setPage('profile')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 28, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
              {profile.avatar || '🦁'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.username || 'User'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--primary-l)', fontWeight: 600 }}>
                Lv.{lvl.level} {lvl.title}
              </div>
            </div>
            <ChevronRight size={14} color="var(--t3)" />
          </div>
          {/* XP bar */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', marginBottom: 4 }}>
              <span>{profile.xp} XP</span><span>{lvl.xpToNext} to next</span>
            </div>
            <div className="prog-bar" style={{ height: 5 }}>
              <div className="prog-fill" style={{ width: `${lvl.pct}%` }} />
            </div>
          </div>
          {/* Streak + Coins */}
          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--warning)' }}>
              <Flame size={13} /> {profile.streak}d
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--t2)' }}>
              🪙 {profile.coins}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--primary-l)' }}>
              <Zap size={13} /> {profile.xp} XP
            </span>
          </div>
        </div>

        {/* Main Nav */}
        <div style={{ padding: '0 8px', flex: 1 }}>
          <div className="nav-section">Menu</div>
          {NAV.slice(0, 5).map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link ${activePage === id ? 'active' : ''}`}
              onClick={() => setPage(id)}>
              <Icon size={17} />
              <span style={{ flex: 1 }}>{label}</span>
              {id === 'tasks' && tasks.filter(t => !t.completed).length > 0 && (
                <span style={{
                  background: 'var(--primary)', color: 'white', borderRadius: 99,
                  fontSize: 10, fontWeight: 800, padding: '1px 7px', minWidth: 18, textAlign: 'center',
                }}>{tasks.filter(t => !t.completed).length}</span>
              )}
            </button>
          ))}

          <div className="nav-section" style={{ marginTop: 8 }}>Categories</div>
          {Object.entries(CATEGORIES).map(([cat, cfg]) => (
            <button key={cat} className="nav-link"
              onClick={() => { setPage('tasks'); }}>
              <span style={{ fontSize: 15 }}>{cfg.icon}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{cat}</span>
              {pendingByCategory[cat] > 0 && (
                <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>
                  {pendingByCategory[cat]}
                </span>
              )}
            </button>
          ))}

          <div className="nav-section" style={{ marginTop: 8 }}>Account</div>
          {NAV.slice(5).map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link ${activePage === id ? 'active' : ''}`}
              onClick={() => setPage(id)}>
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--t3)', textAlign: 'center' }}>
          TaskMaster Pro v2.0
        </div>
      </aside>
    </>
  );
}
