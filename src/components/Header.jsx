// src/components/Header.jsx
import { Moon, Sun, CheckSquare, Zap } from 'lucide-react';
import { useMemo } from 'react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '⚡' };
  return { text: 'Good evening', emoji: '🌙' };
}

export default function Header({ darkMode, onToggleDark, stats }) {
  const completionPct = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const greeting = useMemo(() => getGreeting(), []);

  const motivational = useMemo(() => {
    if (stats.total === 0) return "Add your first task to get started!";
    if (completionPct === 100) return "🎉 All tasks done! You're on fire!";
    if (completionPct >= 75) return "Almost there — keep pushing!";
    if (completionPct >= 50) return "Halfway done, great momentum!";
    if (stats.pending === 1) return "Just 1 task left — you got this!";
    return `${stats.pending} task${stats.pending !== 1 ? 's' : ''} to go — let's crush it!`;
  }, [stats, completionPct]);

  return (
    <header style={{
      background: darkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #3b82f6 100%)',
      padding: '0 0 36px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Animated decorative orbs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '280px', height: '280px',
        background: 'rgba(255,255,255,0.04)', borderRadius: '50%',
        animation: 'orbFloat 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '5%',
        width: '180px', height: '180px',
        background: 'rgba(255,255,255,0.03)', borderRadius: '50%',
        animation: 'orbFloat 10s ease-in-out infinite reverse',
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '40%',
        width: '100px', height: '100px',
        background: 'rgba(96,165,250,0.06)', borderRadius: '50%',
        animation: 'orbFloat 6s ease-in-out infinite',
      }} />

      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px 0',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '14px', padding: '10px',
            display: 'flex',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <CheckSquare size={26} color="white" />
          </div>
          <div>
            <h1 style={{
              fontSize: '23px', fontWeight: 800, color: 'white',
              letterSpacing: '-0.5px', lineHeight: 1.1,
            }}>
              TaskMaster <span style={{ fontWeight: 300, opacity: 0.65 }}>Pro</span>
            </h1>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginTop: '2px' }}>
              {greeting.emoji} {greeting.text} — {motivational}
            </p>
          </div>
        </div>

        <button
          onClick={onToggleDark}
          className="ripple"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white',
            transition: 'all 0.2s ease',
          }}
          title={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', padding: '22px 32px 0',
        position: 'relative', zIndex: 1,
      }}>
        {[
          { label: 'Total',     value: stats.total,     color: 'rgba(255,255,255,0.95)', icon: '📋' },
          { label: 'Pending',   value: stats.pending,   color: '#fbbf24',                icon: '⏳' },
          { label: 'Done',      value: stats.completed, color: '#34d399',                icon: '✅' },
          { label: 'Progress',  value: `${completionPct}%`, color: '#60a5fa',            icon: '🚀', isProgress: true, pct: completionPct },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '14px',
            padding: '14px 16px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
            cursor: 'default',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px' }}>{s.icon}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {s.label}
              </span>
            </div>
            <div className="stat-num" key={s.value} style={{ fontSize: '26px', fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            {s.isProgress && (
              <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${s.pct}%`,
                  background: s.pct === 100
                    ? 'linear-gradient(90deg, #34d399, #10b981)'
                    : 'linear-gradient(90deg, #60a5fa, #34d399)',
                  borderRadius: '999px',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </header>
  );
}
