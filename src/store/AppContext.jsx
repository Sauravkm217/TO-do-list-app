// src/store/AppContext.jsx
import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import {
  loadTasks, saveTasks, loadProfile, saveProfile,
  loadSettings, saveSettings, loadAnalytics, saveAnalytics,
  generateId, todayStr,
} from '../utils/storage';
import {
  XP_TABLE, COIN_TABLE, checkNewBadges, updateStreak, getLevelInfo,
} from '../utils/gamification';
import { scheduleOverdueCheck } from '../utils/notifications';
import confetti from 'canvas-confetti';

// ─── Initial State ───────────────────────────────────────
const init = () => ({
  tasks:      loadTasks(),
  profile:    loadProfile(),
  settings:   loadSettings(),
  analytics:  loadAnalytics(),
  toasts:     [],
  xpPopup:    null,   // { amount }
  badgePopup: null,   // badge object
  activePage: 'dashboard',
  sidebarOpen: true,
  onboarding: false,  // set true if no username
});

// ─── Reducer ─────────────────────────────────────────────
let toastId = 0;

function reducer(state, action) {
  switch (action.type) {

    case 'SET_PAGE':
      return { ...state, activePage: action.page };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_ONBOARDING':
      return { ...state, onboarding: action.value };

    // ── Tasks ──
    case 'ADD_TASK': {
      const tasks = [action.task, ...state.tasks];
      saveTasks(tasks);
      return { ...state, tasks };
    }
    case 'UPDATE_TASK': {
      const tasks = state.tasks.map(t => t.id === action.task.id ? { ...t, ...action.task } : t);
      saveTasks(tasks);
      return { ...state, tasks };
    }
    case 'DELETE_TASK': {
      const tasks = state.tasks.filter(t => t.id !== action.id);
      saveTasks(tasks);
      return { ...state, tasks };
    }
    case 'TOGGLE_TASK': {
      const tasks = state.tasks.map(t =>
        t.id === action.id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null }
          : t
      );
      saveTasks(tasks);
      return { ...state, tasks };
    }

    // ── Profile ──
    case 'AWARD_XP': {
      const raw = { ...state.profile, xp: state.profile.xp + action.xp, coins: state.profile.coins + action.coins,
        totalCompleted: state.profile.totalCompleted + 1 };
      const streaked = updateStreak(raw);
      const lvlInfo  = getLevelInfo(streaked.xp);
      const profile  = { ...streaked, level: lvlInfo.level };
      saveProfile(profile);

      // analytics
      const today = todayStr();
      const daily = { ...state.analytics.dailyCompletions };
      daily[today] = (daily[today] || 0) + 1;
      const xpH = [...state.analytics.xpHistory, { date: today, amount: action.xp }];
      const analytics = { dailyCompletions: daily, xpHistory: xpH };
      saveAnalytics(analytics);

      return { ...state, profile, analytics, xpPopup: { amount: action.xp } };
    }
    case 'UNDO_XP': {
      const profile = { ...state.profile,
        xp: Math.max(0, state.profile.xp - action.xp),
        coins: Math.max(0, state.profile.coins - action.coins),
        totalCompleted: Math.max(0, state.profile.totalCompleted - 1),
      };
      saveProfile(profile);
      return { ...state, profile };
    }
    case 'UNLOCK_BADGE': {
      const profile = { ...state.profile, badges: [...state.profile.badges, action.badge.id] };
      saveProfile(profile);
      return { ...state, profile, badgePopup: action.badge };
    }
    case 'CLEAR_XP_POPUP':
      return { ...state, xpPopup: null };
    case 'CLEAR_BADGE_POPUP':
      return { ...state, badgePopup: null };
    case 'UPDATE_PROFILE': {
      const profile = { ...state.profile, ...action.data };
      saveProfile(profile);
      return { ...state, profile };
    }
    case 'ADD_POMODORO': {
      const profile = { ...state.profile, pomodoroSessions: state.profile.pomodoroSessions + 1 };
      saveProfile(profile);
      return { ...state, profile };
    }

    // ── Settings ──
    case 'UPDATE_SETTINGS': {
      const settings = { ...state.settings, ...action.data };
      saveSettings(settings);
      return { ...state, settings };
    }

    // ── Toasts ──
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: ++toastId, ...action.toast }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };

    default: return state;
  }
}

// ─── Context ─────────────────────────────────────────────
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ─── Provider ────────────────────────────────────────────
export default function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, init);
  const overdueChecked = useRef(false);

  // Dark mode sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.darkMode);
  }, [state.settings.darkMode]);

  // Onboarding check
  useEffect(() => {
    if (!state.profile.username) {
      dispatch({ type: 'SET_ONBOARDING', value: true });
    }
  }, []);

  // Overdue check once on load
  useEffect(() => {
    if (!overdueChecked.current && state.tasks.length > 0) {
      overdueChecked.current = true;
      scheduleOverdueCheck(state.tasks, (msg, type) =>
        dispatch({ type: 'ADD_TOAST', toast: { msg, type: type || 'warning', duration: 5000 } })
      );
    }
  }, [state.tasks]);

  // ── Action helpers ────────────────────────────────────
  const addToast = useCallback((msg, type = 'info', duration = 3000) => {
    const id = ++toastId;
    dispatch({ type: 'ADD_TOAST', toast: { id, msg, type, duration } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), duration + 400);
  }, []);

  const addTask = useCallback((form) => {
    const task = {
      id: generateId(), completed: false, completedAt: null,
      createdAt: Date.now(), pomodoroSessions: 0,
      title: '', description: '', category: 'Personal',
      priority: 'Medium', dueDate: '', dueTime: '',
      recurring: 'none', tags: [],
      ...form,
      title: form.title.trim(),
      description: (form.description || '').trim(),
    };
    dispatch({ type: 'ADD_TASK', task });
    addToast(`✨ "${task.title}" added!`, 'success');
  }, [addToast]);

  const updateTask = useCallback((data) => {
    dispatch({ type: 'UPDATE_TASK', task: data });
    addToast('✏️ Task updated', 'info');
  }, [addToast]);

  const deleteTask = useCallback((id) => {
    dispatch({ type: 'DELETE_TASK', id });
    addToast('🗑️ Task deleted', 'error');
  }, [addToast]);

  const toggleTask = useCallback((id) => {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    const completing = !task.completed;

    dispatch({ type: 'TOGGLE_TASK', id });

    if (completing) {
      const xp    = XP_TABLE[task.priority]    || 25;
      const coins = COIN_TABLE[task.priority]   || 5;
      dispatch({ type: 'AWARD_XP', xp, coins });

      // Check badges after a tick (so profile is updated)
      setTimeout(() => {
        const updated = {
          ...state.profile,
          xp: state.profile.xp + xp,
          coins: state.profile.coins + coins,
          totalCompleted: state.profile.totalCompleted + 1,
        };
        const newBadges = checkNewBadges(updated);
        newBadges.forEach(badge => {
          dispatch({ type: 'UNLOCK_BADGE', badge });
        });
        if (newBadges.length) {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }
      }, 100);

      addToast(`✅ "${task.title}" completed! +${xp} XP`, 'success');
    } else {
      const xp    = XP_TABLE[task.priority]  || 25;
      const coins = COIN_TABLE[task.priority] || 5;
      dispatch({ type: 'UNDO_XP', xp, coins });
      addToast('↩️ Task marked pending', 'info');
    }
  }, [state.tasks, state.profile, addToast]);

  const setPage = useCallback((page) => dispatch({ type: 'SET_PAGE', page }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const updateProfile = useCallback((data) => dispatch({ type: 'UPDATE_PROFILE', data }), []);
  const updateSettings = useCallback((data) => dispatch({ type: 'UPDATE_SETTINGS', data }), []);
  const addPomodoro = useCallback(() => {
    dispatch({ type: 'ADD_POMODORO' });
    const xp = 30;
    dispatch({ type: 'AWARD_XP', xp, coins: 6 });
    addToast(`⏱️ Pomodoro complete! +${xp} XP`, 'success');
  }, [addToast]);
  const clearXpPopup    = useCallback(() => dispatch({ type: 'CLEAR_XP_POPUP' }), []);
  const clearBadgePopup = useCallback(() => dispatch({ type: 'CLEAR_BADGE_POPUP' }), []);
  const completeOnboarding = useCallback((username, avatar) => {
    dispatch({ type: 'UPDATE_PROFILE', data: { username, avatar } });
    dispatch({ type: 'SET_ONBOARDING', value: false });
    addToast(`👋 Welcome, ${username}! Let's be productive!`, 'success', 4000);
  }, [addToast]);

  const value = {
    ...state,
    addToast, addTask, updateTask, deleteTask, toggleTask,
    setPage, toggleSidebar, updateProfile, updateSettings,
    addPomodoro, clearXpPopup, clearBadgePopup, completeOnboarding,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
