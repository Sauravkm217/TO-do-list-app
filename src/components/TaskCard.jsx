// src/components/TaskCard.jsx
import { useState } from 'react';
import { Pencil, Trash2, Check, Calendar, Clock, AlignLeft, GripVertical } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CATEGORIES, XP_TABLE } from '../utils/gamification';
import { getDaysLeft } from '../utils/notifications';

function hl(text, q) {
  if (!q || !text) return text;
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = new RegExp(`(${esc})`, 'gi');
  return text.split(rx).map((p, i) => rx.test(p) ? <mark key={i}>{p}</mark> : p);
}

export default function TaskCard({ task, searchQuery = '', onEdit }) {
  const { toggleTask, deleteTask } = useApp();
  const [hovered, setHovered] = useState(false);

  const cat = CATEGORIES[task.category] || CATEGORIES.Other;
  const dl  = getDaysLeft(task.dueDate);
  const xp  = XP_TABLE[task.priority] || 25;

  const priClass = { High: 'pri-high', Medium: 'pri-medium', Low: 'pri-low' }[task.priority] || '';

  return (
    <div
      className={`task-card ${priClass} ${task.completed ? 'completed' : ''} animate-slidein`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Drag hint */}
        <div style={{ opacity: hovered ? .5 : 0, transition: 'opacity .2s', color: 'var(--t3)', marginTop: 2, cursor: 'grab', flexShrink: 0 }}>
          <GripVertical size={15} />
        </div>

        {/* Checkbox */}
        <button
          className={`check-btn ${task.completed ? 'checked' : ''}`}
          onClick={() => toggleTask(task.id)}
          style={{ marginTop: 2 }}
          title={task.completed ? 'Mark pending' : 'Complete task'}
        >
          {task.completed && <Check size={12} color="white" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={`task-title ${task.completed ? 'done' : ''}`}>
            {hl(task.title, searchQuery)}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
            {/* Category */}
            <span className="cat-chip" style={{ background: cat.bg, color: cat.color }}>
              {cat.icon} {task.category}
            </span>
            {/* Priority */}
            <span className={`badge badge-${task.priority.toLowerCase()}`}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {task.priority}
            </span>
            {/* Status */}
            <span className={`badge ${task.completed ? 'badge-done' : 'badge-pending'}`}>
              {task.completed ? '✓ Done' : '⏳ Pending'}
            </span>
            {/* Overdue */}
            {dl?.overdue && <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>🔥 {dl.label}</span>}
            {dl?.urgent && !dl.overdue && !task.completed && (
              <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>⚡ {dl.label}</span>
            )}
            {/* XP preview */}
            {!task.completed && (
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-l)',
                background: 'rgba(99,102,241,.1)', padding: '2px 7px', borderRadius: 99 }}>
                +{xp} XP
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 7, lineHeight: 1.5,
              display: 'flex', gap: 5, alignItems: 'flex-start' }}>
              <AlignLeft size={12} style={{ flexShrink: 0, marginTop: 2 }} />
              {hl(task.description, searchQuery)}
            </p>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            {task.dueDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                color: dl?.overdue ? 'var(--danger)' : 'var(--t3)', fontWeight: 500 }}>
                <Calendar size={11} />
                {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--t3)' }}>
              <Clock size={11} />
              {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            {task.pomodoroSessions > 0 && (
              <span style={{ fontSize: 12, color: 'var(--t3)' }}>⏱️ {task.pomodoroSessions} sessions</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 5, flexShrink: 0,
          opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(6px)',
          transition: 'opacity .2s, transform .2s' }}>
          <button className="btn btn-icon-sm btn-ghost" onClick={() => onEdit(task)} title="Edit">
            <Pencil size={13} />
          </button>
          <button className="btn btn-icon-sm btn-danger" onClick={() => deleteTask(task.id)} title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
