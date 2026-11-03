import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase, getDatabaseAsync } from './client';
import { generateId } from '../utils/id';

/**
 * Checks whether user data already exists in the database.
 * If data exists (e.g. profile or tasks), seeding is skipped to guarantee user data is never overwritten.
 */
export async function isDatabaseEmptyAsync(db: SQLiteDatabase): Promise<boolean> {
  try {
    const profileCount = await db.getFirstAsync<{ count: number }>(
      'SELECT count(*) as count FROM profile;'
    );
    const taskCount = await db.getFirstAsync<{ count: number }>(
      'SELECT count(*) as count FROM tasks WHERE deleted_at IS NULL;'
    );

    const hasProfile = (profileCount?.count ?? 0) > 0;
    const hasTasks = (taskCount?.count ?? 0) > 0;

    return !hasProfile && !hasTasks;
  } catch {
    // If tables don't exist yet, it's considered empty
    return true;
  }
}

/**
 * Asynchronously seeds starter sample data on a brand-new install only.
 * Safe and idempotent: wraps operations in a transaction and aborts if data already exists.
 */
export async function seedInitialDataAsync(database?: SQLiteDatabase): Promise<boolean> {
  const db = database || (await getDatabaseAsync());

  const shouldSeed = await isDatabaseEmptyAsync(db);
  if (!shouldSeed) {
    return false;
  }

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    // 1. Profile
    await db.runAsync(
      `INSERT INTO profile (id, name, avatar_uri, main_focus, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      ['user_default', 'Temesgen', null, 'Study', now, now]
    );

    // 2. Tasks
    const tasks = [
      { title: 'Study Mathematics', start: '9:00 AM', end: '10:30 AM', cat: 'Study', isPriority: 1, isDone: 1 },
      { title: 'Build portfolio', start: '10:30 AM', end: '12:30 PM', cat: 'Work', isPriority: 1, isDone: 0 },
      { title: 'Exercise', start: '3:00 PM', end: '4:00 PM', cat: 'Habits', isPriority: 1, isDone: 0 },
      { title: 'Read a book', start: '8:00 PM', end: '8:45 PM', cat: 'Habits', isPriority: 0, isDone: 0 },
      { title: 'Review notes', start: '9:00 PM', end: '10:00 PM', cat: 'Study', isPriority: 0, isDone: 0 },
    ];

    for (const t of tasks) {
      await db.runAsync(
        `INSERT INTO tasks (id, title, date, start_time, end_time, category, priority, is_priority, is_completed, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [generateId('task'), t.title, today, t.start, t.end, t.cat, 'high', t.isPriority, t.isDone, now, now]
      );
    }

    // 3. Habits
    const habits = [
      { name: 'No Social Media', target: 1, unit: 'day', freq: 'daily', icon: 'phone-portrait-outline', color: '#1E8E4E', done: 2 },
      { name: 'Read 20 Pages', target: 7, unit: 'days', freq: 'weekly', icon: 'book-outline', color: '#6D4AFF', done: 5 },
      { name: 'Exercise', target: 7, unit: 'days', freq: 'weekly', icon: 'barbell-outline', color: '#F59E0B', done: 4 },
      { name: 'Drink Water', target: 8, unit: 'glasses', freq: 'daily', icon: 'water-outline', color: '#3B82F6', done: 6 },
    ];

    for (const h of habits) {
      const hId = generateId('habit');
      await db.runAsync(
        `INSERT INTO habits (id, name, target_count, unit, frequency, icon, color, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [hId, h.name, h.target, h.unit, h.freq, h.icon, h.color, now, now]
      );

      await db.runAsync(
        `INSERT INTO habit_logs (id, habit_id, date, count, created_at)
         VALUES (?, ?, ?, ?, ?);`,
        [generateId('hlog'), hId, today, h.done, now]
      );
    }

    // 4. Study Subjects
    const subjects = [
      {
        name: 'Mathematics',
        color: '#1E8E4E',
        topics: [
          { title: 'Calculus III', done: 1 },
          { title: 'Linear Algebra', done: 1 },
          { title: 'Probability & Statistics', done: 1 },
          { title: 'Differential Equations', done: 0 },
        ],
      },
      {
        name: 'Physics',
        color: '#6D4AFF',
        topics: [
          { title: 'Thermodynamics', done: 1 },
          { title: 'Electromagnetism', done: 1 },
          { title: 'Quantum Mechanics', done: 0 },
          { title: 'Optics', done: 0 },
          { title: 'Relativity', done: 0 },
        ],
      },
      {
        name: 'ICT',
        color: '#F59E0B',
        topics: [
          { title: 'Data Communications', done: 1 },
          { title: 'Computer Architecture', done: 1 },
          { title: 'Operating Systems', done: 0 },
          { title: 'Database Systems', done: 0 },
          { title: 'Computer Networks', done: 0 },
        ],
      },
      {
        name: 'English',
        color: '#3B82F6',
        topics: [
          { title: 'Academic Writing', done: 1 },
          { title: 'Technical Presentation', done: 1 },
          { title: 'Vocabulary & Idioms', done: 0 },
        ],
      },
    ];

    for (const s of subjects) {
      const sId = generateId('subj');
      await db.runAsync(
        `INSERT INTO subjects (id, name, color, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?);`,
        [sId, s.name, s.color, now, now]
      );

      for (let i = 0; i < s.topics.length; i++) {
        const top = s.topics[i];
        await db.runAsync(
          `INSERT INTO study_topics (id, subject_id, title, is_completed, order_index, created_at)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [generateId('stopic'), sId, top.title, top.done, i, now]
        );
      }
    }

    // 5. Projects
    const projects = [
      {
        title: 'Trading Journal App',
        due: '2026-11-15',
        color: '#1E8E4E',
        tasks: [
          { title: 'Setup database schema', done: 1 },
          { title: 'P&L calculations', done: 1 },
          { title: 'Trade logger UI', done: 1 },
          { title: 'Analytics dashboard', done: 1 },
          { title: 'Final testing', done: 0 },
        ],
      },
      {
        title: 'AI Churn Prediction',
        due: '2026-11-30',
        color: '#F59E0B',
        tasks: [
          { title: 'Data Cleaning', done: 1 },
          { title: 'Feature Engineering', done: 1 },
          { title: 'Model Training', done: 0 },
          { title: 'Evaluation & Metrics', done: 0 },
          { title: 'Deployment', done: 0 },
        ],
      },
      {
        title: 'Chat App (Java)',
        due: '2026-12-10',
        color: '#6D4AFF',
        tasks: [
          { title: 'Socket Server Architecture', done: 1 },
          { title: 'User Handshake & Auth', done: 1 },
          { title: 'Chat Room Multiplexing', done: 1 },
          { title: 'Message Persistence', done: 0 },
          { title: 'Desktop UI Client', done: 0 },
        ],
      },
    ];

    for (const p of projects) {
      const pId = generateId('prj');
      await db.runAsync(
        `INSERT INTO projects (id, title, due_date, color, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [pId, p.title, p.due, p.color, now, now]
      );

      for (const pt of p.tasks) {
        await db.runAsync(
          `INSERT INTO project_tasks (id, project_id, title, is_completed, created_at)
           VALUES (?, ?, ?, ?, ?);`,
          [generateId('ptask'), pId, pt.title, pt.done, now]
        );
      }
    }

    // 6. Trades
    const trades = [
      { pair: 'EURUSD', dir: 'buy', entry: 1.082, exit: 1.0845, lot: 1.0, pnl: 25.2, date: today, notes: 'Breakout pullback entry' },
      { pair: 'XAUUSD', dir: 'sell', entry: 2740.5, exit: 2742.0, lot: 0.1, pnl: -12.0, date: today, notes: 'Stopped out at resistance' },
      { pair: 'GBPUSD', dir: 'buy', entry: 1.291, exit: 1.2952, lot: 1.0, pnl: 41.75, date: today, notes: 'Trend continuation after London open' },
      { pair: 'USDJPY', dir: 'buy', entry: 151.2, exit: 152.05, lot: 0.8, pnl: 85.0, date: today, notes: 'Key support bounce' },
    ];

    for (const tr of trades) {
      await db.runAsync(
        `INSERT INTO trades (id, pair, direction, entry_price, exit_price, lot_size, pnl, date, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [generateId('trd'), tr.pair, tr.dir, tr.entry, tr.exit, tr.lot, tr.pnl, tr.date, tr.notes, now, now]
      );
    }

    // 7. Goals
    const goals = [
      {
        title: 'Pass the Exit Exam',
        due: '2027-08-30',
        category: 'Skills',
        milestones: [
          { title: 'Complete Core CS Syllabus', done: 1 },
          { title: 'Solve 200 Mock Exam Questions', done: 1 },
          { title: 'Review Algorithms & Data Structures', done: 1 },
          { title: 'Final Department Simulation Test', done: 0 },
        ],
      },
      {
        title: 'Build 3 Production Projects',
        due: '2026-12-31',
        category: 'Career',
        milestones: [
          { title: 'Fullstack Mobile Productivity App', done: 1 },
          { title: 'Trading Backtester System', done: 1 },
          { title: 'Distributed Microservices Platform', done: 0 },
        ],
      },
      {
        title: 'Run a 10K Marathon',
        due: '2026-11-30',
        category: 'Health',
        milestones: [
          { title: 'Complete 5K non-stop run', done: 1 },
          { title: 'Train 3x weekly for 8 weeks', done: 1 },
          { title: 'Pace under 5:30 min/km', done: 0 },
        ],
      },
    ];

    for (const g of goals) {
      const gId = generateId('goal');
      await db.runAsync(
        `INSERT INTO goals (id, title, due_date, category, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [gId, g.title, g.due, g.category, now, now]
      );

      for (const m of g.milestones) {
        await db.runAsync(
          `INSERT INTO goal_milestones (id, goal_id, title, is_completed, created_at)
           VALUES (?, ?, ?, ?, ?);`,
          [generateId('gmil'), gId, m.title, m.done, now]
        );
      }
    }

    // 8. Skills
    const skills = [
      { name: 'Python', cat: 'technical', prog: 80, notes: 'FastAPI, PyTorch, Scripting' },
      { name: 'TypeScript', cat: 'technical', prog: 70, notes: 'React Native, Strict Typing' },
      { name: 'System Design', cat: 'technical', prog: 50, notes: 'Distributed caches, load balancers' },
      { name: 'Communication', cat: 'soft', prog: 60, notes: 'Technical writing and presentations' },
    ];

    for (const sk of skills) {
      await db.runAsync(
        `INSERT INTO skills (id, name, category, progress, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [generateId('skill'), sk.name, sk.cat, sk.prog, sk.notes, now, now]
      );
    }

    // 9. Focus sessions
    const focusSessions = [
      { type: 'pomodoro', duration: 25, completed: 1500, cat: 'Study' },
      { type: 'pomodoro', duration: 25, completed: 1500, cat: 'Work' },
    ];

    for (const fs of focusSessions) {
      await db.runAsync(
        `INSERT INTO focus_sessions (id, type, duration_minutes, completed_seconds, start_timestamp, end_timestamp, is_completed, category, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?);`,
        [generateId('fses'), fs.type, fs.duration, fs.completed, now, now, fs.cat, now]
      );
    }

    // 10. Journal entry
    await db.runAsync(
      `INSERT INTO journal_entries (id, date, mood, content, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        generateId('jrnl'),
        today,
        5,
        'Tremendous progress today! Finished algorithmic math problems, reviewed project deadlines, and stayed totally focused without phone distractions.',
        JSON.stringify(['Productive', 'Study', 'Happy']),
        now,
        now,
      ]
    );
  });

  return true;
}

/**
 * Synchronous seed helper for backward compatibility.
 */
export function seedDevData(): void {
  const db = getDatabase();

  const existingTasks = db.getFirstSync<{ count: number }>(
    'SELECT count(*) as count FROM tasks WHERE deleted_at IS NULL;'
  );
  if (existingTasks && existingTasks.count > 0) {
    return;
  }

  // Delegate safely
  seedInitialDataAsync(db).catch((err) => {
    console.warn('Initial seeding completed with notice:', err);
  });
}
