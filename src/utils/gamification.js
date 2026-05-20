// src/utils/gamification.js

export const CATEGORIES = {
  Work:     { color: '#3b82f6', bg: '#eff6ff', icon: '💼', dark: '#1d4ed8' },
  Study:    { color: '#8b5cf6', bg: '#f5f3ff', icon: '📚', dark: '#6d28d9' },
  Personal: { color: '#10b981', bg: '#ecfdf5', icon: '🙂', dark: '#047857' },
  Fitness:  { color: '#f97316', bg: '#fff7ed', icon: '💪', dark: '#c2410c' },
  Shopping: { color: '#ec4899', bg: '#fdf2f8', icon: '🛍️', dark: '#be185d' },
  Coding:   { color: '#06b6d4', bg: '#ecfeff', icon: '💻', dark: '#0e7490' },
  Health:   { color: '#ef4444', bg: '#fef2f2', icon: '❤️', dark: '#b91c1c' },
  Other:    { color: '#64748b', bg: '#f8fafc', icon: '📌', dark: '#475569' },
};

export const XP_TABLE = { High: 50, Medium: 25, Low: 10 };
export const COIN_TABLE = { High: 10, Medium: 5, Low: 2 };

export const LEVELS = [
  { level: 1, title: 'Rookie',       minXp: 0,    maxXp: 150  },
  { level: 2, title: 'Apprentice',   minXp: 150,  maxXp: 400  },
  { level: 3, title: 'Practitioner', minXp: 400,  maxXp: 800  },
  { level: 4, title: 'Expert',       minXp: 800,  maxXp: 1500 },
  { level: 5, title: 'Master',       minXp: 1500, maxXp: 2800 },
  { level: 6, title: 'Grandmaster',  minXp: 2800, maxXp: 5000 },
  { level: 7, title: 'Legend',       minXp: 5000, maxXp: 9999 },
];

export function getLevelInfo(xp) {
  const lvl = LEVELS.findLast(l => xp >= l.minXp) || LEVELS[0];
  const pct = lvl.maxXp === lvl.minXp ? 100
    : Math.min(100, Math.round(((xp - lvl.minXp) / (lvl.maxXp - lvl.minXp)) * 100));
  return { ...lvl, pct, xpToNext: Math.max(0, lvl.maxXp - xp) };
}

export const BADGES = [
  { id: 'first_step',      emoji: '🌱', name: 'First Step',       desc: 'Complete your first task',          check: (p) => p.totalCompleted >= 1 },
  { id: 'on_fire',         emoji: '🔥', name: 'On Fire',          desc: 'Complete 5 tasks',                  check: (p) => p.totalCompleted >= 5 },
  { id: 'power_user',      emoji: '⚡', name: 'Power User',       desc: 'Complete 10 tasks',                 check: (p) => p.totalCompleted >= 10 },
  { id: 'goal_crusher',    emoji: '🎯', name: 'Goal Crusher',     desc: 'Complete 25 tasks',                 check: (p) => p.totalCompleted >= 25 },
  { id: 'productivity_king',emoji: '👑', name: 'Productivity King',desc: 'Complete 50 tasks',               check: (p) => p.totalCompleted >= 50 },
  { id: 'legend',          emoji: '🏆', name: 'Legend',           desc: 'Complete 100 tasks',                check: (p) => p.totalCompleted >= 100 },
  { id: 'consistent',      emoji: '📅', name: 'Consistent',       desc: 'Maintain a 3-day streak',           check: (p) => p.streak >= 3 },
  { id: 'streak_master',   emoji: '🌟', name: 'Streak Master',    desc: 'Maintain a 7-day streak',           check: (p) => p.streak >= 7 },
  { id: 'pomodoro_pro',    emoji: '⏱️', name: 'Pomodoro Pro',     desc: 'Complete 10 Pomodoro sessions',     check: (p) => p.pomodoroSessions >= 10 },
  { id: 'high_achiever',   emoji: '💎', name: 'High Achiever',    desc: 'Reach Level 5 (Master)',            check: (p) => p.level >= 5 },
  { id: 'coin_collector',  emoji: '🪙', name: 'Coin Collector',   desc: 'Earn 100 coins',                   check: (p) => p.coins >= 100 },
  { id: 'xp_rich',         emoji: '✨', name: 'XP Rich',          desc: 'Earn 500 total XP',                 check: (p) => p.xp >= 500 },
];

export function checkNewBadges(profile) {
  const owned = new Set(profile.badges);
  return BADGES.filter(b => !owned.has(b.id) && b.check(profile));
}

export function updateStreak(profile) {
  const today = new Date().toISOString().split('T')[0];
  const last  = profile.lastActiveDate;
  if (last === today) return profile;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = last === yesterday ? profile.streak + 1 : 1;
  return { ...profile, streak: newStreak, lastActiveDate: today };
}
