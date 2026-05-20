// src/utils/storage.js

const KEYS = {
  tasks:     'tm_tasks',
  profile:   'tm_profile',
  settings:  'tm_settings',
  analytics: 'tm_analytics',
};

const read = (key, fallback) => {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
  catch { return fallback; }
};
const write = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

// ── Tasks ────────────────────────────────────
export const loadTasks    = () => read(KEYS.tasks, []);
export const saveTasks    = (v) => write(KEYS.tasks, v);

// ── Profile ──────────────────────────────────
export const DEFAULT_PROFILE = {
  username: '',
  avatar: '🦁',
  level: 1,
  xp: 0,
  coins: 0,
  streak: 0,
  lastActiveDate: null,
  totalCompleted: 0,
  badges: [],
  pomodoroSessions: 0,
  dailyGoal: 5,
  joinedAt: Date.now(),
};
export const loadProfile  = () => ({ ...DEFAULT_PROFILE, ...read(KEYS.profile, {}) });
export const saveProfile  = (v) => write(KEYS.profile, v);

// ── Settings ─────────────────────────────────
export const DEFAULT_SETTINGS = {
  darkMode: false,
  notificationsEnabled: false,
  dailyReminderTime: '09:00',
  pomodoroWork: 25,
  pomodoroBreak: 5,
  pomodoroLong: 15,
};
export const loadSettings  = () => ({ ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) });
export const saveSettings  = (v) => write(KEYS.settings, v);

// ── Analytics ────────────────────────────────
export const DEFAULT_ANALYTICS = { dailyCompletions: {}, xpHistory: [] };
export const loadAnalytics = () => ({ ...DEFAULT_ANALYTICS, ...read(KEYS.analytics, {}) });
export const saveAnalytics = (v) => write(KEYS.analytics, v);

// ── ID generator ─────────────────────────────
export const generateId = () =>
  `tm_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;

// ── Date helpers ─────────────────────────────
export const todayStr = () => new Date().toISOString().split('T')[0];
