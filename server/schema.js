import { pgTable, serial, varchar, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }),
  avatar: varchar('avatar', { length: 50 }),
  xp: integer('xp').default(0),
  level: integer('level').default(1),
  coins: integer('coins').default(0),
  streak: integer('streak').default(0),
  pomodoroSessions: integer('pomodoro_sessions').default(0),
  dailyGoal: integer('daily_goal').default(5),
  badges: text('badges').array(), // store array of string ids
  lastActiveDate: timestamp('last_active_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // maps to clerkId
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: varchar('priority', { length: 50 }).default('Medium'),
  category: varchar('category', { length: 50 }).default('Other'),
  dueDate: varchar('due_date', { length: 50 }), // YYYY-MM-DD
  dueTime: varchar('due_time', { length: 50 }), // HH:MM
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
