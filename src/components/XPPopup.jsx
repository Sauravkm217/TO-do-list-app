// src/components/XPPopup.jsx
import { useEffect } from 'react';
import { useApp } from '../store/AppContext';

export default function XPPopup() {
  const { xpPopup, badgePopup, clearXpPopup, clearBadgePopup } = useApp();

  useEffect(() => {
    if (xpPopup) { const t = setTimeout(clearXpPopup, 1800); return () => clearTimeout(t); }
  }, [xpPopup, clearXpPopup]);

  return (
    <>
      {xpPopup && (
        <div className="xp-popup">+{xpPopup.amount} XP ⚡</div>
      )}
      {badgePopup && (
        <div className="badge-popup-overlay" onClick={clearBadgePopup}>
          <div className="badge-popup-box" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 72, marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>
              {badgePopup.emoji}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-l)',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              🏅 Badge Unlocked!
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--t1)', marginBottom: 8 }}>
              {badgePopup.name}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 24, lineHeight: 1.6 }}>
              {badgePopup.desc}
            </p>
            <button className="btn btn-md btn-primary" onClick={clearBadgePopup} style={{ width: '100%', justifyContent: 'center' }}>
              Awesome! 🎉
            </button>
          </div>
        </div>
      )}
    </>
  );
}
