// src/utils/notifications.js

export async function requestPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const p = await Notification.requestPermission();
  return p === 'granted';
}

export function sendNotification(title, body, icon = '✅') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try { new Notification(title, { body, icon: '/favicon.ico' }); } catch {}
}

export function scheduleOverdueCheck(tasks, addToast) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(t =>
    !t.completed && t.dueDate &&
    new Date(t.dueDate + 'T00:00:00') < today
  );
  if (overdue.length > 0) {
    addToast(`⚠️ You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}!`, 'warning');
    sendNotification('TaskMaster Pro', `You have ${overdue.length} overdue task(s)!`);
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const dueToday = tasks.filter(t => !t.completed && t.dueDate === todayStr);
  if (dueToday.length > 0) {
    addToast(`📅 ${dueToday.length} task${dueToday.length > 1 ? 's' : ''} due today!`, 'info');
  }
}

export function getDaysLeft(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = new Date(dateStr + 'T00:00:00');
  const diff  = Math.ceil((due - today) / 86400000);
  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, overdue: true,  urgent: false };
  if (diff === 0) return { label: 'Due today',                  overdue: false, urgent: true  };
  if (diff === 1) return { label: 'Due tomorrow',               overdue: false, urgent: true  };
  return { label: `${diff}d left`, overdue: false, urgent: false };
}
