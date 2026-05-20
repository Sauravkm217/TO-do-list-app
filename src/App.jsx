// src/App.jsx
import { useState } from 'react';
import { Menu, Bell, Moon, Sun, Search, Download } from 'lucide-react';
import AppProvider, { useApp } from './store/AppContext';
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from '@clerk/clerk-react';

import Sidebar      from './components/Sidebar';
import ToastManager from './components/ToastManager';
import XPPopup      from './components/XPPopup';

import Dashboard from './pages/Dashboard';
import Tasks     from './pages/Tasks';
import Calendar  from './pages/Calendar';
import Analytics from './pages/Analytics';
import Profile   from './pages/Profile';
import Pomodoro  from './pages/Pomodoro';
import Settings  from './pages/Settings';

const PAGE_TITLES = {
  dashboard: '🏠 Dashboard',
  tasks:     '📝 My Tasks',
  calendar:  '📅 Calendar',
  analytics: '📊 Analytics',
  pomodoro:  '⏱️ Pomodoro',
  profile:   '👤 Profile',
  settings:  '⚙️ Settings',
};

const PAGES = { dashboard: Dashboard, tasks: Tasks, calendar: Calendar,
  analytics: Analytics, pomodoro: Pomodoro, profile: Profile, settings: Settings };

function AppShell() {
  const {
    activePage, sidebarOpen, toggleSidebar,
    settings, updateSettings, profile
  } = useApp();

  const { user } = useUser();
  const PageComponent = PAGES[activePage] || Dashboard;

  const handleInstallClick = async () => {
    // Basic PWA install prompt logic
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        window.deferredPrompt = null;
      }
    } else {
      alert("App is already installed or your browser doesn't support PWA installation directly.");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <div className={`main-wrap ${sidebarOpen ? '' : 'full'}`}>
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-icon btn-ghost" onClick={toggleSidebar} title="Toggle sidebar">
              <Menu size={18} />
            </button>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
              {PAGE_TITLES[activePage] || 'Dashboard'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-sm btn-ghost" onClick={handleInstallClick} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--primary-l)' }}>
              <Download size={15} /> Install App
            </button>

            {profile.streak > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                background: 'linear-gradient(135deg,rgba(249,115,22,.15),rgba(249,115,22,.08))',
                borderRadius: 99, border: '1px solid rgba(249,115,22,.25)', fontSize: 13, fontWeight: 700,
                color: '#f97316' }}>
                🔥 {profile.streak} day streak
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
              background: 'rgba(99,102,241,.08)', borderRadius: 99, border: '1px solid rgba(99,102,241,.15)',
              fontSize: 13, fontWeight: 700, color: 'var(--primary-l)' }}>
              🪙 {profile.coins}
            </div>

            <button
              className="btn btn-icon btn-ghost"
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              title={settings.darkMode ? 'Light mode' : 'Dark mode'}>
              {settings.darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <UserButton />
          </div>
        </header>

        <div className="page-body">
          <PageComponent />
        </div>
      </div>

      <ToastManager />
      <XPPopup />
    </div>
  );
}

export default function App() {
  return (
    <>
      <SignedOut>
        <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      <SignedIn>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </SignedIn>
    </>
  );
}
