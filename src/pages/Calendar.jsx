// src/pages/Calendar.jsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CATEGORIES } from '../utils/gamification';
import TaskModal from '../components/TaskModal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

function buildCalendar(year, month) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push({ day: null });
  for (let d = 1; d <= total; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ day: null });
  return cells;
}

export default function Calendar() {
  const { tasks } = useApp();
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const cells = buildCalendar(year, month);
  const todayStr = now.toISOString().split('T')[0];

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const tasksByDay = (d) => {
    if (!d) return [];
    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return tasks.filter(t => t.dueDate === ds);
  };

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedTasks = selectedDateStr ? tasks.filter(t => t.dueDate === selectedDateStr) : [];

  // Upcoming (next 7 days)
  const upcoming = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const d = new Date(t.dueDate + 'T00:00:00');
    const diff = (d - now) / 86400000;
    return diff >= 0 && diff <= 7;
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="section-title" style={{ fontSize: 22 }}>📅 Calendar</h1>
          <p className="section-sub">View and plan tasks by date</p>
        </div>
        <button className="btn btn-md btn-primary" onClick={() => setShowModal(true)}>+ Add Task</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Calendar */}
        <div>
          <div className="card" style={{ padding: '20px 22px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <button className="btn btn-icon btn-ghost" onClick={prev}><ChevronLeft size={17} /></button>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>
                {MONTHS[month]} {year}
              </h2>
              <button className="btn btn-icon btn-ghost" onClick={next}><ChevronRight size={17} /></button>
            </div>

            {/* Day names */}
            <div className="cal-grid" style={{ marginBottom: 6 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700,
                  color: 'var(--t3)', textTransform: 'uppercase', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div className="cal-grid">
              {cells.map((c, i) => {
                if (!c.day) return <div key={i} />;
                const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`;
                const dayTasks = tasksByDay(c.day);
                const isToday = ds === todayStr;
                const isSel   = c.day === selectedDay;
                return (
                  <div key={i}
                    className={`cal-day ${isToday ? 'today' : ''}`}
                    onClick={() => setSelectedDay(c.day)}
                    style={{
                      borderColor: isSel ? 'var(--primary)' : undefined,
                      background: isSel ? 'rgba(99,102,241,.08)' : undefined,
                    }}>
                    <div className="cal-day-num">{c.day}</div>
                    {/* Task dots */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 4 }}>
                      {dayTasks.slice(0, 4).map((t, j) => {
                        const cfg = CATEGORIES[t.category] || CATEGORIES.Other;
                        return <div key={j} style={{ width: 7, height: 7, borderRadius: '50%',
                          background: t.completed ? 'var(--success)' : cfg.color, flexShrink: 0 }} />;
                      })}
                      {dayTasks.length > 4 && (
                        <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 700 }}>+{dayTasks.length - 4}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day tasks */}
          {selectedDay && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)', marginBottom: 12 }}>
                Tasks on {MONTHS[month]} {selectedDay}
                {selectedTasks.length > 0 && (
                  <span style={{ marginLeft: 8, background: 'var(--primary)', color: 'white',
                    borderRadius: 99, fontSize: 11, padding: '1px 8px', fontWeight: 800 }}>
                    {selectedTasks.length}
                  </span>
                )}
              </h3>
              {selectedTasks.length === 0 ? (
                <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--t2)' }}>
                  <p style={{ fontSize: 14 }}>No tasks on this day.</p>
                  <button className="btn btn-sm btn-ghost" onClick={() => setShowModal(true)} style={{ marginTop: 8 }}>
                    + Add task on this date
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedTasks.map(t => {
                    const cfg = CATEGORIES[t.category] || CATEGORIES.Other;
                    return (
                      <div key={t.id} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)',
                            textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? 'var(--t3)' : 'var(--t1)' }}>
                            {t.title}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                            {t.priority} · {t.category}
                            {t.dueTime && ` · ${t.dueTime}`}
                          </div>
                        </div>
                        {t.completed
                          ? <span style={{ fontSize: 20 }}>✅</span>
                          : <button className="btn btn-sm btn-ghost" onClick={() => setEditTask(t)}>Edit</button>
                        }
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', marginBottom: 16 }}>
              🗓 Upcoming (7 days)
            </h3>
            {upcoming.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--t2)' }}>No upcoming tasks.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.map(t => {
                  const cfg = CATEGORIES[t.category] || CATEGORIES.Other;
                  const d   = new Date(t.dueDate + 'T00:00:00');
                  const diff = Math.ceil((d - new Date().setHours(0,0,0,0)) / 86400000);
                  return (
                    <div key={t.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '10px 12px', background: 'var(--bg)', borderRadius: 10,
                      borderLeft: `3px solid ${cfg.color}` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                          {cfg.icon} {t.category}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 800,
                          color: diff === 0 ? 'var(--danger)' : diff === 1 ? 'var(--warning)' : 'var(--t3)' }}>
                          {diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : `${diff}d`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="card" style={{ padding: '16px 20px', marginTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)', marginBottom: 10 }}>Category Colors</div>
            {Object.entries(CATEGORIES).map(([cat, cfg]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--t2)' }}>{cfg.icon} {cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && <TaskModal onClose={() => setShowModal(false)} />}
      {editTask  && <TaskModal task={editTask} onClose={() => setEditTask(null)} />}
    </div>
  );
}
