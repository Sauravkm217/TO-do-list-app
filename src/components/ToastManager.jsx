// src/components/ToastManager.jsx
import { useApp } from '../store/AppContext';

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

export default function ToastManager() {
  const { toasts } = useApp();
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          <span style={{ fontSize: 16 }}>{ICONS[t.type] || 'ℹ️'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
