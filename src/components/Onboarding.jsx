// src/components/Onboarding.jsx
import { useState } from 'react';
import { useApp } from '../store/AppContext';

const AVATARS = ['🦁', '🐯', '🦊', '🐺', '🦅', '🐉', '🦄', '🐸', '🤖', '👨‍💻',
  '🧙', '🦸', '🏋️', '🧑‍🚀', '🎯', '🚀', '⚡', '💎', '🔥', '🌟'];

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦁');
  const [step, setStep] = useState(1);

  const proceed = () => {
    if (!name.trim()) return;
    completeOnboarding(name.trim(), avatar);
  };

  return (
    <div className="modal-overlay" style={{ alignItems: 'center' }}>
      <div className="modal-box" style={{ maxWidth: 480, textAlign: 'center' }}>
        {step === 1 ? (
          <>
            <div style={{ fontSize: 64, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>✅</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--t1)', marginBottom: 8 }}>
              Welcome to <span className="text-gradient">TaskMaster Pro</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28, lineHeight: 1.7 }}>
              Your premium productivity companion. Earn XP, unlock badges, and build powerful habits.
            </p>
            <label className="label" style={{ textAlign: 'left' }}>What's your name?</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)}
              placeholder="Enter your name..." autoFocus
              onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
              style={{ marginBottom: 20, textAlign: 'center', fontSize: 16 }} />
            <button className="btn btn-lg btn-primary" disabled={!name.trim()}
              onClick={() => setStep(2)} style={{ width: '100%', justifyContent: 'center' }}>
              Continue →
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{avatar}</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>
              Hey, {name}! 👋
            </h2>
            <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 20 }}>Choose your avatar</p>
            <div className="avatar-grid" style={{ marginBottom: 24 }}>
              {AVATARS.map(a => (
                <button key={a} className={`avatar-opt ${avatar === a ? 'selected' : ''}`}
                  onClick={() => setAvatar(a)} type="button">{a}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-md btn-ghost" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>Back</button>
              <button className="btn btn-md btn-primary" onClick={proceed} style={{ flex: 2, justifyContent: 'center' }}>
                🚀 Let's Go!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
