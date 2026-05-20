import express from 'express';
import cors from 'cors';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { db } from './db.js';
import { users, tasks } from './schema.js';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// Protect all /api routes with Clerk
app.use('/api', ClerkExpressRequireAuth());

// Add error handler for Clerk
app.use((err, req, res, next) => {
  if (err.message === 'Unauthenticated') {
    res.status(401).json({ error: 'Unauthenticated!' });
  } else {
    next(err);
  }
});

// Helper to get or create a user in our DB when they log in
async function getOrCreateUser(clerkId) {
  const existing = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (existing.length > 0) return existing[0];
  
  const [newUser] = await db.insert(users).values({
    clerkId,
    badges: [],
  }).returning();
  return newUser;
}

// ----------------------------------------------------------------------
// PROFILE ROUTES
// ----------------------------------------------------------------------
app.get('/api/profile', async (req, res) => {
  try {
    const user = await getOrCreateUser(req.auth.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const { username, avatar, xp, level, coins, streak, pomodoroSessions, dailyGoal, badges } = req.body;
    const [updatedUser] = await db.update(users)
      .set({ username, avatar, xp, level, coins, streak, pomodoroSessions, dailyGoal, badges })
      .where(eq(users.clerkId, req.auth.userId))
      .returning();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// TASK ROUTES
// ----------------------------------------------------------------------
app.get('/api/tasks', async (req, res) => {
  try {
    const userTasks = await db.select().from(tasks).where(eq(tasks.userId, req.auth.userId));
    res.json(userTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, dueTime } = req.body;
    const [newTask] = await db.insert(tasks).values({
      userId: req.auth.userId,
      title, description, priority, category, dueDate, dueTime
    }).returning();
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, category, dueDate, dueTime, completed, completedAt } = req.body;
    
    // Convert completedAt to Date if provided
    const compAt = completedAt ? new Date(completedAt) : null;

    const [updatedTask] = await db.update(tasks)
      .set({ title, description, priority, category, dueDate, dueTime, completed, completedAt: compAt })
      .where(eq(tasks.id, parseInt(id)))
      .returning();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(tasks).where(eq(tasks.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
