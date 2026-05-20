// src/store/AppContext.jsx
import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import {
  loadTasks, saveTasks, loadProfile, saveProfile,
  loadSettings, saveSettings, loadAnalytics, saveAnalytics,
  generateId, todayStr,
} from '../utils/storage';
import {
  XP_TABLE, COIN_TABLE, checkNewBadges, updateStreak, getLevelInfo,
} from '../utils/gamification';
import { scheduleOverdueCheck } from '../utils/notifications';
import { fetchAPI } from '../utils/api';
import confetti from 'canvas-confetti';

// ─── Initial State ───────────────────────────────────────
const init = () => ({
  tasks:      loadTasks(),
  profile:    loadProfile(),
  settings:   loadSettings(),
  analytics:  loadAnalytics(),
  toasts:     [],
  xpPopup:    null,   
  badgePopup: null,   
  activePage: 'dashboard',
  sidebarOpen: true,
  onboarding: false,  
  backendSynced: false,
});

// ─── Reducer ─────────────────────────────────────────────
let toastId = 0;

function reducer(state, action) {
  switch (action.type) {
    case 'SYNC_BACKEND_DATA':
      return { 
        ...state, 
        tasks: action.tasks || state.tasks, 
        profile: action.profile || state.profile,
        backendSynced: true 
      };

    case 'SET_PAGE': return { ...state, activePage: action.page };
    case 'TOGGLE_SIDEBAR': return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_ONBOARDING': return { ...state, onboarding: action.value };

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
    case 'CLEAR_POPUP':
      return { ...state, xpPopup: null, badgePopup: null };
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
    case 'ADD_TOAST': return { ...state, toasts: [...state.toasts, { id: ++toastId, ...action.toast }] };
    case 'REMOVE_TOAST': return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    default: return state;
  }
}

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export default function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, init);
  const overdueChecked = useRef(false);
  
  // Clerk Auth
  const { getToken } = useAuth();
  const { user } = useUser();

  // ── Sync Backend on Mount ──
  useEffect(() => {
    async function syncData() {
      if (!user) return;
      const token = await getToken();
      
      // Fetch DB data
      const dbProfile = await fetchAPI('/api/profile', 'GET', null, token);
      const dbTasks = await fetchAPI('/api/tasks', 'GET', null, token);
      
      if (dbProfile || dbTasks) {
        // Merge DB profile with local profile (DB takes priority for gamification)
        const mergedProfile = dbProfile ? { ...state.profile, ...dbProfile } : null;
        dispatch({ type: 'SYNC_BACKEND_DATA', profile: mergedProfile, tasks: dbTasks });
        
        // If DB profile has no username but Clerk does, sync it
        if (dbProfile && !dbProfile.username && user.fullName) {
          updateProfile({ username: user.fullName, avatar: user.imageUrl || '👨‍💻' });
        }
      } else {
        // If DB fetch failed (offline or DB down), fallback to Clerk basic info
        if (!state.profile.username && user.fullName) {
          dispatch({ type: 'UPDATE_PROFILE', data: { username: user.fullName, avatar: user.imageUrl || '👨‍💻' } });
        }
      }
    }
    if (!state.backendSynced) syncData();
  }, [user, getToken, state.backendSynced]);

  // Dark mode sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.darkMode);
  }, [state.settings.darkMode]);

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

  const addTask = useCallback(async (form) => {
    const task = {
      id: generateId(), completed: false, completedAt: null,
      createdAt: Date.now(), pomodoroSessions: 0,
      title: form.title.trim(), description: (form.description || '').trim(), 
      category: form.category || 'Personal', priority: form.priority || 'Medium', 
      dueDate: form.dueDate || '', dueTime: form.dueTime || '',
    };
    dispatch({ type: 'ADD_TASK', task });
    addToast(`✨ "${task.title}" added!`, 'success');

    // Async Backend Sync
    const token = await getToken();
    await fetchAPI('/api/tasks', 'POST', task, token);
  }, [addToast, getToken]);

  const updateTask = useCallback(async (data) => {
    dispatch({ type: 'UPDATE_TASK', task: data });
    addToast('✏️ Task updated', 'info');

    // Async Backend Sync
    const token = await getToken();
    await fetchAPI(`/api/tasks/${data.id}`, 'PUT', data, token);
  }, [addToast, getToken]);

  const deleteTask = useCallback(async (id) => {
    dispatch({ type: 'DELETE_TASK', id });
    addToast('🗑️ Task deleted', 'error');

    // Async Backend Sync
    const token = await getToken();
    await fetchAPI(`/api/tasks/${id}`, 'DELETE', null, token);
  }, [addToast, getToken]);

  const toggleTask = useCallback(async (id) => {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    const completing = !task.completed;

    dispatch({ type: 'TOGGLE_TASK', id });

    let finalProfileUpdate = null;

    if (completing) {
      const xp    = XP_TABLE[task.priority]    || 25;
      const coins = COIN_TABLE[task.priority]   || 5;
      dispatch({ type: 'AWARD_XP', xp, coins });

      setTimeout(() => {
        const updated = {
          ...state.profile, xp: state.profile.xp + xp, coins: state.profile.coins + coins,
          totalCompleted: state.profile.totalCompleted + 1,
        };
        const newBadges = checkNewBadges(updated);
        newBadges.forEach(badge => dispatch({ type: 'UNLOCK_BADGE', badge }));
        if (newBadges.length) confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        
        // Push full profile update to DB
        getToken().then(token => fetchAPI('/api/profile', 'PUT', updated, token));
      }, 100);

      addToast(`✅ "${task.title}" completed! +${xp} XP`, 'success');
    } else {
      const xp    = XP_TABLE[task.priority]  || 25;
      const coins = COIN_TABLE[task.priority] || 5;
      dispatch({ type: 'UNDO_XP', xp, coins });
      addToast('↩️ Task marked pending', 'info');
      
      const updated = {
        ...state.profile, xp: Math.max(0, state.profile.xp - xp), coins: Math.max(0, state.profile.coins - coins),
        totalCompleted: Math.max(0, state.profile.totalCompleted - 1),
      };
      getToken().then(token => fetchAPI('/api/profile', 'PUT', updated, token));
    }

    // Push task update to DB
    const token = await getToken();
    const updatedTask = { ...task, completed: completing, completedAt: completing ? new Date().toISOString() : null };
    await fetchAPI(`/api/tasks/${id}`, 'PUT', updatedTask, token);
  }, [state.tasks, state.profile, addToast, getToken]);

  const setPage = useCallback((page) => dispatch({ type: 'SET_PAGE', page }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  
  const updateProfile = useCallback(async (data) => {
    dispatch({ type: 'UPDATE_PROFILE', data });
    const token = await getToken();
    await fetchAPI('/api/profile', 'PUT', { ...state.profile, ...data }, token);
  }, [state.profile, getToken]);

  const updateSettings = useCallback((data) => dispatch({ type: 'UPDATE_SETTINGS', data }), []);
  
  const addPomodoro = useCallback(async () => {
    dispatch({ type: 'ADD_POMODORO' });
    const xp = 30;
    dispatch({ type: 'AWARD_XP', xp, coins: 6 });
    addToast(`⏱️ Pomodoro complete! +${xp} XP`, 'success');
    
    const updated = { ...state.profile, pomodoroSessions: state.profile.pomodoroSessions + 1, xp: state.profile.xp + xp, coins: state.profile.coins + 6 };
    const token = await getToken();
    await fetchAPI('/api/profile', 'PUT', updated, token);
  }, [state.profile, addToast, getToken]);

  const clearXpPopup    = useCallback(() => dispatch({ type: 'CLEAR_POPUP' }), []);
  const clearBadgePopup = useCallback(() => dispatch({ type: 'CLEAR_POPUP' }), []);

  const value = {
    ...state,
    addToast, addTask, updateTask, deleteTask, toggleTask,
    setPage, toggleSidebar, updateProfile, updateSettings,
    addPomodoro, clearXpPopup, clearBadgePopup,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
