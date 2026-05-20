// src/components/TaskModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CATEGORIES } from '../utils/gamification';

const PRIORITIES = ['High', 'Medium', 'Low'];
const RECURRINGS = ['none', 'daily', 'weekly', 'monthly'];
const PRI_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

export default function TaskModal({ task, onClose }) {
  const { addTask, updateTask } = useApp();
  const isEdit = !!task;
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: '', description: '', category: 'Personal',
    priority: 'Medium', dueDate: '', dueTime: '',
    recurring: 'none', tags: [],
    ...(task || {}),
  });
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = 'Title is required';
    if (form.title.length > 120) err.title = 'Max 120 characters';
    setErrors(err);
    return !Object.keys(err).length;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isEdit) updateTask({ ...task, ...form, title: form.title.trim(), description: form.description.trim() });
    else addTask({ ...form, title: form.title.trim(), description: form.description.trim() });
    onClose();
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };
  const removeTag = (t) => set('tags', form.tags.filter(x => x !== t));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>
              {isEdit ? '✏️ Edit Task' : '✨ New Task'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 2 }}>
              {isEdit ? 'Update task details' : 'Fill in the details below'}
            </p>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <label className="label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="What needs to be done?" autoFocus />
            {errors.title && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description <span style={{ color: 'var(--t3)', fontWeight: 400 }}>(optional)</span></label>
            <textarea className="input" value={form.description}
              onChange={e => set('description', e.target.value)} rows={3}
              placeholder="Add more details..." />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {Object.entries(CATEGORIES).map(([cat, cfg]) => (
                <button key={cat} type="button"
                  onClick={() => set('category', cat)}
                  style={{
                    padding: '8px 4px', borderRadius: 10, border: '2px solid',
                    borderColor: form.category === cat ? cfg.color : 'var(--border)',
                    background: form.category === cat ? cfg.bg : 'transparent',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    color: form.category === cat ? cfg.color : 'var(--t2)',
                    transition: 'all .15s', display: 'flex',
                    flexDirection: 'column', alignItems: 'center', gap: 3,
                  }}>
                  <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="label">Priority</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {PRIORITIES.map(p => (
                <button key={p} type="button" onClick={() => set('priority', p)}
                  style={{
                    flex: 1, padding: '9px', borderRadius: 10,
                    border: `2px solid ${form.priority === p ? PRI_COLORS[p] : 'var(--border)'}`,
                    background: form.priority === p ? `${PRI_COLORS[p]}18` : 'transparent',
                    cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    color: form.priority === p ? PRI_COLORS[p] : 'var(--t2)',
                    transition: 'all .15s',
                  }}>
                  {p === 'High' ? '🔴' : p === 'Medium' ? '🟠' : '🟢'} {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={form.dueDate}
                min={isEdit ? undefined : today}
                onChange={e => set('dueDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Due Time</label>
              <input type="time" className="input" value={form.dueTime}
                onChange={e => set('dueTime', e.target.value)} />
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className="label">Recurring</label>
            <select className="input" value={form.recurring} onChange={e => set('recurring', e.target.value)}>
              {RECURRINGS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter..." style={{ flex: 1 }} />
              <button type="button" className="btn btn-md btn-ghost" onClick={addTag}>Add</button>
            </div>
            {form.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {form.tags.map(t => (
                  <span key={t} style={{
                    background: 'rgba(99,102,241,.1)', color: 'var(--primary-l)',
                    padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    #{t}
                    <button type="button" onClick={() => removeTag(t)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 14, lineHeight: 1 }}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-md btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-md btn-primary">
              {isEdit ? '💾 Save Changes' : '✨ Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
