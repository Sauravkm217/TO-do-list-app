// src/pages/Tasks.jsx
import { useState, useMemo } from 'react';
import { Search, SortAsc, Plus, X, ChevronDown } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CATEGORIES } from '../utils/gamification';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const FILTERS  = ['All', 'Pending', 'Completed'];
const SORTS    = [
  { v: 'date_added', l: 'Date Added' },
  { v: 'due_date',   l: 'Due Date'   },
  { v: 'priority',   l: 'Priority'   },
  { v: 'category',   l: 'Category'   },
];
const PRI_ORD = { High: 0, Medium: 1, Low: 2 };

export default function Tasks() {
  const { tasks } = useApp();
  const [filter,   setFilter]   = useState('All');
  const [sort,     setSort]     = useState('date_added');
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTask,  setEditTask]  = useState(null);
  const [sortOpen,  setSortOpen]  = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const { addTask } = useApp();

  const visible = useMemo(() => tasks
    .filter(t => {
      if (filter === 'Pending'   && t.completed) return false;
      if (filter === 'Completed' && !t.completed) return false;
      if (category !== 'All' && t.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'priority')  return (PRI_ORD[a.priority] ?? 1) - (PRI_ORD[b.priority] ?? 1);
      if (sort === 'due_date') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1; if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sort === 'category') return a.category.localeCompare(b.category);
      return b.createdAt - a.createdAt;
    }), [tasks, filter, sort, search, category]);

  const pending   = visible.filter(t => !t.completed);
  const completed = visible.filter(t =>  t.completed);

  const quickAdd = () => {
    if (!quickTitle.trim()) return;
    addTask({ title: quickTitle.trim(), category: category !== 'All' ? category : 'Personal',
      priority: 'Medium', description: '', dueDate: '', dueTime: '', recurring: 'none', tags: [] });
    setQuickTitle('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="section-title" style={{ fontSize: 22 }}>📝 My Tasks</h1>
          <p className="section-sub">{tasks.filter(t => !t.completed).length} pending · {tasks.filter(t => t.completed).length} done</p>
        </div>
        <button className="btn btn-md btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Controls card */}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 38, paddingRight: search ? 38 : 14 }}
            placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Quick add */}
        <div className="quick-add" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 15 }}>⚡</span>
          <input className="quick-input" value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && quickAdd()}
            placeholder="Quick add — press Enter to save..." />
          {quickTitle && <button className="btn btn-sm btn-primary" onClick={quickAdd}>Add</button>}
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f}
                {f === 'Pending' && tasks.filter(t => !t.completed).length > 0 && (
                  <span style={{ marginLeft: 5, background: filter === 'Pending' ? 'rgba(255,255,255,.25)' : 'var(--bg)',
                    color: filter === 'Pending' ? 'white' : 'var(--t3)',
                    borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '1px 6px' }}>
                    {tasks.filter(t => !t.completed).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Category select */}
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}
            style={{ width: 'auto', padding: '7px 28px 7px 10px', fontSize: 13 }}>
            <option value="All">All Categories</option>
            {Object.entries(CATEGORIES).map(([cat, cfg]) => (
              <option key={cat} value={cat}>{cfg.icon} {cat}</option>
            ))}
          </select>

          {/* Sort */}
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <button className="btn btn-sm btn-ghost" onClick={() => setSortOpen(o => !o)} style={{ gap: 5 }}>
              <SortAsc size={13} />
              {SORTS.find(s => s.v === sort)?.l}
              <ChevronDown size={11} style={{ transition: 'transform .2s', transform: sortOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {sortOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--card)',
                border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
                zIndex: 100, minWidth: 150, boxShadow: 'var(--sh-md)', animation: 'fadeIn .15s ease' }}>
                {SORTS.map(opt => (
                  <button key={opt.v} onClick={() => { setSort(opt.v); setSortOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                      background: sort === opt.v ? 'rgba(99,102,241,.08)' : 'none', border: 'none',
                      cursor: 'pointer', fontSize: 13, fontWeight: sort === opt.v ? 700 : 400,
                      color: sort === opt.v ? 'var(--primary-l)' : 'var(--t1)' }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result count */}
      {(search || filter !== 'All' || category !== 'All') && (
        <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 12, fontWeight: 500 }}>
          {visible.length} result{visible.length !== 1 ? 's' : ''}
          {search && <> for "<strong style={{ color: 'var(--t1)' }}>{search}</strong>"</>}
        </p>
      )}

      {/* Task list */}
      {visible.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 56, animation: 'float 3s ease-in-out infinite' }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>No tasks found</h3>
          <p style={{ fontSize: 14 }}>
            {search ? `No results for "${search}"` : 'Add your first task to get started!'}
          </p>
          <button className="btn btn-md btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add Task
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filter !== 'Completed' && pending.length > 0 && (
            <>
              {filter === 'All' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: .5 }}>
                    Pending
                  </span>
                  <span style={{ background: 'var(--primary)', color: 'white', borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '1px 7px' }}>
                    {pending.length}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
              )}
              {pending.map(t => <TaskCard key={t.id} task={t} searchQuery={search} onEdit={setEditTask} />)}
            </>
          )}
          {filter !== 'Pending' && completed.length > 0 && (
            <>
              {filter === 'All' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 4px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: .5 }}>
                    Completed
                  </span>
                  <span style={{ background: 'var(--success)', color: 'white', borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '1px 7px' }}>
                    {completed.length}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
              )}
              {completed.map(t => <TaskCard key={t.id} task={t} searchQuery={search} onEdit={setEditTask} />)}
            </>
          )}
        </div>
      )}

      <button className="fab" onClick={() => setShowModal(true)} title="Add Task">+</button>
      {showModal && <TaskModal onClose={() => setShowModal(false)} />}
      {editTask  && <TaskModal task={editTask} onClose={() => setEditTask(null)} />}
    </div>
  );
}
