// src/pages/Analytics.jsx
import { useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { CATEGORIES } from '../utils/gamification';

// ── Mini SVG Bar Chart ──────────────────────────────────
function BarChart({ data, color = 'var(--primary)' }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>{d.v || ''}</div>
          <div style={{
            width: '100%', height: `${Math.max(4, (d.v / max) * 80)}px`,
            background: color, borderRadius: '4px 4px 0 0',
            transition: 'height .6s ease', minHeight: 4,
          }} />
          <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>{d.l}</div>
        </div>
      ))}
    </div>
  );
}

// ── Donut Chart ─────────────────────────────────────────
function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let angle = -90;
  const r = 44; const cx = 60; const cy = 60;
  const circumference = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={14} />
      {segments.filter(s => s.value > 0).map((seg, i) => {
        const pct = seg.value / total;
        const dashArray = `${pct * circumference} ${circumference}`;
        const rotate = angle;
        angle += pct * 360;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={14}
            strokeDasharray={dashArray} strokeDashoffset={0}
            transform={`rotate(${rotate} ${cx} ${cy})`}
            strokeLinecap="round" />
        );
      })}
      <text x={cx} y={cy} textAnchor="middle" dy="5"
        style={{ fontSize: 18, fontWeight: 800, fill: 'var(--t1)' }}>{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle"
        style={{ fontSize: 9, fill: 'var(--t3)' }}>TOTAL</text>
    </svg>
  );
}

// ── GitHub-style Heatmap ────────────────────────────────
function Heatmap({ data }) {
  const weeks = useMemo(() => {
    const days = [];
    const now = new Date(); now.setHours(0,0,0,0);
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const val = data[key] || 0;
      const lv  = val === 0 ? '' : val === 1 ? 'lv1' : val === 2 ? 'lv2' : val <= 4 ? 'lv3' : 'lv4';
      days.push({ key, val, lv, day: d.getDate(), month: d.getMonth() });
    }
    // chunk into columns of 7
    const cols = [];
    for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7));
    return cols;
  }, [data]);

  return (
    <div className="heatmap" style={{ paddingBottom: 8 }}>
      {weeks.map((col, ci) => (
        <div key={ci} className="hm-col">
          {col.map((cell, ri) => (
            <div key={ri} className={`hm-cell ${cell.lv}`} title={`${cell.key}: ${cell.val} tasks`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { tasks, analytics, profile } = useApp();

  const completed = tasks.filter(t => t.completed);
  const pending   = tasks.filter(t => !t.completed);

  // Last 7 days bar chart
  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
      const key = d.toISOString().split('T')[0];
      const v = analytics.dailyCompletions[key] || 0;
      const l = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
      return { l, v, key };
    });
  }, [analytics]);

  const totalThisWeek = weekData.reduce((s, d) => s + d.v, 0);
  const bestDay = weekData.reduce((a, b) => b.v > a.v ? b : a, weekData[0]);

  // Category donut
  const catData = Object.entries(CATEGORIES).map(([cat, cfg]) => ({
    label: cat, color: cfg.color,
    value: tasks.filter(t => t.category === cat).length,
  })).filter(d => d.value > 0);

  // Priority donut
  const priColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
  const priData = ['High', 'Medium', 'Low'].map(p => ({
    label: p, color: priColors[p], value: tasks.filter(t => t.priority === p).length,
  })).filter(d => d.value > 0);

  const completionRate = tasks.length > 0
    ? Math.round((completed.length / tasks.length) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title" style={{ fontSize: 22 }}>📊 Analytics</h1>
        <p className="section-sub">Your productivity insights at a glance</p>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '✅', label: 'Completion Rate', val: `${completionRate}%`, color: 'var(--success)' },
          { icon: '📅', label: 'This Week',       val: totalThisWeek,       color: 'var(--primary)' },
          { icon: '🔥', label: 'Best Streak',     val: `${profile.streak}d`, color: 'var(--warning)' },
          { icon: '⚡', label: 'Total XP',        val: profile.xp,           color: 'var(--primary-l)' },
        ].map(s => (
          <div key={s.label} className="stat-card card-hover">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Weekly bar chart */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)' }}>📈 Last 7 Days</div>
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>{totalThisWeek} tasks completed</div>
            </div>
            {bestDay.v > 0 && (
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--t3)' }}>
                Best: <strong style={{ color: 'var(--primary-l)' }}>{bestDay.l} ({bestDay.v})</strong>
              </div>
            )}
          </div>
          <BarChart data={weekData} />
        </div>

        {/* Completion rate */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', marginBottom: 16 }}>🎯 Task Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <DonutChart size={130} segments={[
              { color: 'var(--success)', value: completed.length },
              { color: 'var(--warning)', value: pending.length },
            ]} />
            <div style={{ flex: 1 }}>
              {[
                { color: 'var(--success)', label: 'Completed', val: completed.length },
                { color: 'var(--warning)', label: 'Pending',   val: pending.length },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--t2)', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>{s.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--t2)' }}>Completion Rate</span>
                  <span style={{ fontWeight: 800, color: 'var(--t1)' }}>{completionRate}%</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill green" style={{ width: `${completionRate}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Category donut */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', marginBottom: 16 }}>📁 By Category</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <DonutChart size={120} segments={catData} />
            <div style={{ flex: 1 }}>
              {catData.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--t2)', flex: 1 }}>
                    {CATEGORIES[s.label]?.icon} {s.label}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>{s.value}</span>
                </div>
              ))}
              {catData.length === 0 && <p style={{ fontSize: 13, color: 'var(--t2)' }}>No data yet</p>}
            </div>
          </div>
        </div>

        {/* Priority donut */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', marginBottom: 16 }}>⚡ By Priority</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <DonutChart size={120} segments={priData} />
            <div style={{ flex: 1 }}>
              {priData.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--t2)', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{s.value}</span>
                </div>
              ))}
              {priData.length === 0 && <p style={{ fontSize: 13, color: 'var(--t2)' }}>No data yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', marginBottom: 6 }}>🗓 Activity Heatmap</div>
        <p style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 16 }}>Last 84 days of task completions</p>
        <Heatmap data={analytics.dailyCompletions} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>Less</span>
          {['', 'lv1', 'lv2', 'lv3', 'lv4'].map((lv, i) => (
            <div key={i} className={`hm-cell ${lv}`} style={{ flexShrink: 0 }} />
          ))}
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>More</span>
        </div>
      </div>
    </div>
  );
}
