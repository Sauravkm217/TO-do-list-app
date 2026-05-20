// src/components/ConfirmDialog.jsx
export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Delete Task?</h3>
        <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-md btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-md btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
