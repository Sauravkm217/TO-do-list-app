// src/components/EmptyState.jsx
export default function EmptyState({ filter, searchQuery, onAdd }) {
  const configs = {
    search: {
      emoji: '🔍',
      title: 'No results found',
      desc: `No tasks match "${searchQuery}". Try a different keyword.`,
      showAdd: false,
    },
    all: {
      emoji: '📋',
      title: 'No tasks yet!',
      desc: 'Add your first task and start crushing your goals.',
      showAdd: true,
    },
    pending: {
      emoji: '🎉',
      title: 'All caught up!',
      desc: "You have no pending tasks. Great work! Add a new task to keep going.",
      showAdd: true,
    },
    completed: {
      emoji: '🏆',
      title: 'No completed tasks yet',
      desc: 'Complete some tasks to see them here. You can do it!',
      showAdd: false,
    },
  };

  const cfg = searchQuery ? configs.search : (configs[filter] || configs.all);

  return (
    <div className="empty-state fade-in" style={{ padding: '70px 20px' }}>
      <div style={{
        fontSize: '72px', marginBottom: '20px',
        filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.12))',
        animation: 'floatEmoji 3s ease-in-out infinite',
      }}>
        {cfg.emoji}
      </div>
      <h3 style={{
        fontSize: '20px', fontWeight: 800,
        color: 'var(--text-primary)', marginBottom: '10px',
      }}>
        {cfg.title}
      </h3>
      <p style={{
        fontSize: '14px', color: 'var(--text-secondary)',
        maxWidth: '300px', lineHeight: 1.65, marginBottom: '24px',
      }}>
        {cfg.desc}
      </p>

      {cfg.showAdd && onAdd && (
        <button
          className="btn-primary ripple"
          onClick={onAdd}
          style={{ padding: '12px 28px', fontSize: '14px', borderRadius: '12px' }}
        >
          + Add your first task
        </button>
      )}

      <style>{`
        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-14px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
