import { getDatabase } from './client';
import { generateId } from '../utils/id';

export function seedDevData(): void {
  const db = getDatabase();

  // Check if already seeded
  const existingTasks = db.getFirstSync<{ count: number }>('SELECT count(*) as count FROM tasks');
  if (existingTasks && existingTasks.count > 0) {
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  // 1. Profile
  db.runSync(
    `INSERT INTO profile (id, name, avatar_uri, main_focus, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['user_default', 'Temesgen', null, 'Study', now, now]
  );

  // 2. Tasks matching UI mockup:
  // - Study Mathematics (9:00 - 10:30 AM)
  // - Build portfolio (10:30 - 12:30 PM)
  // - Exercise (3:00 - 4:00 PM)
  // - Read a book (8:00 - 8:45 PM)
  // - Review notes (9:00 - 10:00 PM)
  const tasks = [
    { title: 'Study Mathematics', start: '9:00 AM', end: '10:30 AM', cat: 'Study', isPriority: 1, isDone: 1 },
    { title: 'Build portfolio', start: '10:30 AM', end: '12:30 PM', cat: 'Work', isPriority: 1, isDone: 0 },
    { title: 'Exercise', start: '3:00 PM', end: '4:00 PM', cat: 'Habits', isPriority: 1, isDone: 0 },
    { title: 'Read a book', start: '8:00 PM', end: '8:45 PM', cat: 'Habits', isPriority: 0, isDone: 0 },
    { title: 'Review notes', start: '9:00 PM', end: '10:00 PM', cat: 'Study', isPriority: 0, isDone: 0 },
  ];

  for (const t of tasks) {
    db.runSync(
      `INSERT INTO tasks (id, title, date, start_time, end_time, category, priority, is_priority, is_completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generateId('task'), t.title, today, t.start, t.end, t.cat, 'high', t.isPriority, t.isDone, now, now]
    );
  }

  // 3. Habits matching UI mockup:
  // - No Social Media (2 / 1 day, 100%)
  // - Read 20 Pages (4 / 7 days, 71%)
  // - Exercise (4 / 7 days, 57%)
  // - Drink Water (6 / 8 glasses, 75%)
  const habits = [
    { name: 'No Social Media', target: 1, unit: 'day', freq: 'daily', icon: 'phone-portrait-outline', color: '#1E8E4E', done: 2 },
    { name: 'Read 20 Pages', target: 7, unit: 'days', freq: 'weekly', icon: 'book-outline', color: '#6D4AFF', done: 5 },
    { name: 'Exercise', target: 7, unit: 'days', freq: 'weekly', icon: 'barbell-outline', color: '#F59E0B', done: 4 },
    { name: 'Drink Water', target: 8, unit: 'glasses', freq: 'daily', icon: 'water-outline', color: '#3B82F6', done: 6 },
  ];

  for (const h of habits) {
    const hId = generateId('habit');
    db.runSync(
      `INSERT INTO habits (id, name, target_count, unit, frequency, icon, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [hId, h.name, h.target, h.unit, h.freq, h.icon, h.color, now, now]
    );

    db.runSync(
      `INSERT INTO habit_logs (id, habit_id, date, count, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [generateId('hlog'), hId, today, h.done, now]
    );
  }

  // 4. Study subjects matching UI mockup:
  // Mathematics 78%, Physics 44%, ICT 40%, English 63%
  const subjects = [
    { name: 'Mathematics', color: '#1E8E4E', topics: [
      { title: 'Calculus III', done: 1 },
      { title: 'Linear Algebra', done: 1 },
      { title: 'Probability & Statistics', done: 1 },
      { title: 'Differential Equations', done: 0 },
    ]},
    { name: 'Physics', color: '#6D4AFF', topics: [
      { title: 'Thermodynamics', done: 1 },
      { title: 'Electromagnetism', done: 1 },
      { title: 'Quantum Mechanics', done: 0 },
      { title: 'Optics', done: 0 },
      { title: 'Relativity', done: 0 },
    ]},
    { name: 'ICT', color: '#F59E0B', topics: [
      { title: 'Data Communications', done: 1 },
      { title: 'Computer Architecture', done: 1 },
      { title: 'Operating Systems', done: 0 },
      { title: 'Database Systems', done: 0 },
      { title: 'Computer Networks', done: 0 },
    ]},
    { name: 'English', color: '#3B82F6', topics: [
      { title: 'Academic Writing', done: 1 },
      { title: 'Technical Presentation', done: 1 },
      { title: 'Vocabulary & Idioms', done: 0 },
    ]},
  ];

  for (const s of subjects) {
    const sId = generateId('subj');
    db.runSync(
      `INSERT INTO subjects (id, name, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [sId, s.name, s.color, now, now]
    );

    for (let i = 0; i < s.topics.length; i++) {
      const top = s.topics[i];
      db.runSync(
        `INSERT INTO study_topics (id, subject_id, title, is_completed, order_index, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [generateId('stopic'), sId, top.title, top.done, i, now]
      );
    }
  }

  // 5. Projects matching UI mockup:
  // - Trading Journal App (90% - Due: Nov 15)
  // - AI Churn Prediction (40% - Due: Nov 30)
  // - Chat App (Java) (60% - Due: Dec 10)
  const projects = [
    { title: 'Trading Journal App', due: '2026-11-15', color: '#1E8E4E', tasks: [
      { title: 'Setup database schema', done: 1 },
      { title: 'P&L calculations', done: 1 },
      { title: 'Trade logger UI', done: 1 },
      { title: 'Analytics dashboard', done: 1 },
      { title: 'Final testing', done: 0 },
    ]},
    { title: 'AI Churn Prediction', due: '2026-11-30', color: '#F59E0B', tasks: [
      { title: 'Data Cleaning', done: 1 },
      { title: 'Feature Engineering', done: 1 },
      { title: 'Model Training', done: 0 },
      { title: 'Evaluation & Metrics', done: 0 },
      { title: 'Deployment', done: 0 },
    ]},
    { title: 'Chat App (Java)', due: '2026-12-10', color: '#6D4AFF', tasks: [
      { title: 'Socket Server Architecture', done: 1 },
      { title: 'User Handshake & Auth', done: 1 },
      { title: 'Chat Room Multiplexing', done: 1 },
      { title: 'Message Persistence', done: 0 },
      { title: 'Desktop UI Client', done: 0 },
    ]},
  ];

  for (const p of projects) {
    const pId = generateId('prj');
    db.runSync(
      `INSERT INTO projects (id, title, due_date, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [pId, p.title, p.due, p.color, now, now]
    );

    for (const pt of p.tasks) {
      db.runSync(
        `INSERT INTO project_tasks (id, project_id, title, is_completed, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [generateId('ptask'), pId, pt.title, pt.done, now]
      );
    }
  }

  // 6. Trades matching UI mockup:
  // Win Rate: 62.5% (+5%), P&L: +$245.50
  // Recent Trades:
  // FX EURUSD +$25.20
  // FX XAUUSD -$12.00
  // FX GBPUSD +$41.75
  const trades = [
    { pair: 'EURUSD', dir: 'buy', entry: 1.0820, exit: 1.0845, lot: 1.0, pnl: 25.20, date: today, notes: 'Breakout pullback entry' },
    { pair: 'XAUUSD', dir: 'sell', entry: 2740.50, exit: 2742.00, lot: 0.1, pnl: -12.00, date: today, notes: 'Stopped out at resistance' },
    { pair: 'GBPUSD', dir: 'buy', entry: 1.2910, exit: 1.2952, lot: 1.0, pnl: 41.75, date: today, notes: 'Trend continuation after London open' },
    { pair: 'USDJPY', dir: 'buy', entry: 151.20, exit: 152.05, lot: 0.8, pnl: 85.00, date: today, notes: 'Key support bounce' },
    { pair: 'BTCUSD', dir: 'buy', entry: 68500, exit: 69800, lot: 0.05, pnl: 65.00, date: today, notes: 'Weekend accumulation breakout' },
    { pair: 'NZDUSD', dir: 'sell', entry: 0.5980, exit: 0.5950, lot: 0.5, pnl: 15.00, date: today, notes: 'Bearish pin bar rejection' },
    { pair: 'USDCAD', dir: 'buy', entry: 1.3820, exit: 1.3800, lot: 0.5, pnl: -10.00, date: today, notes: 'Premature entry before news' },
    { pair: 'AUDUSD', dir: 'buy', entry: 0.6550, exit: 0.6585, lot: 1.0, pnl: 35.55, date: today, notes: 'Clean retest of demand zone' },
  ];

  for (const tr of trades) {
    db.runSync(
      `INSERT INTO trades (id, pair, direction, entry_price, exit_price, lot_size, pnl, date, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generateId('trd'), tr.pair, tr.dir, tr.entry, tr.exit, tr.lot, tr.pnl, tr.date, tr.notes, now, now]
    );
  }

  // 7. Goals matching UI mockup:
  // - Pass the Exit Exam (70% - Due: Aug 2027)
  // - Build 3 Projects (46% - Due: Dec 2026)
  // - Learn Advanced AI (29% - Due: Dec 2026)
  const goals = [
    { title: 'Pass the Exit Exam', due: '2027-08-30', milestones: [
      { title: 'Complete Core CS Syllabus', done: 1 },
      { title: 'Solve 200 Mock Exam Questions', done: 1 },
      { title: 'Review Algorithms & Data Structures', done: 1 },
      { title: 'Final Department Simulation Test', done: 0 },
    ]},
    { title: 'Build 3 Production Projects', due: '2026-12-31', milestones: [
      { title: 'Fullstack Mobile Productivity App', done: 1 },
      { title: 'Trading Backtester System', done: 1 },
      { title: 'Distributed Microservices Platform', done: 0 },
    ]},
    { title: 'Learn Advanced AI & LLMs', due: '2026-12-15', milestones: [
      { title: 'Transformers & Attention Deep Dive', done: 1 },
      { title: 'Fine-tuning with LoRA / QLoRA', done: 0 },
      { title: 'Build Agentic Autonomous Systems', done: 0 },
    ]},
  ];

  for (const g of goals) {
    const gId = generateId('goal');
    db.runSync(
      `INSERT INTO goals (id, title, due_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [gId, g.title, g.due, now, now]
    );

    for (const m of g.milestones) {
      db.runSync(
        `INSERT INTO goal_milestones (id, goal_id, title, is_completed, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [generateId('gmil'), gId, m.title, m.done, now]
      );
    }
  }

  // 8. Skills matching UI mockup:
  // Python 80%, TypeScript 70%, System Design 50%, Communication 60%
  const skills = [
    { name: 'Python', cat: 'technical', prog: 80, notes: 'FastAPI, PyTorch, Scripting' },
    { name: 'TypeScript', cat: 'technical', prog: 70, notes: 'React Native, Strict Typing' },
    { name: 'System Design', cat: 'technical', prog: 50, notes: 'Distributed caches, load balancers' },
    { name: 'Communication', cat: 'soft', prog: 60, notes: 'Technical writing and presentations' },
  ];

  for (const sk of skills) {
    db.runSync(
      `INSERT INTO skills (id, name, category, progress, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [generateId('skill'), sk.name, sk.cat, sk.prog, sk.notes, now, now]
    );
  }

  // 9. Focus sessions for today (to feed productivity donut and focus ring)
  const focusSessions = [
    { type: 'pomodoro', duration: 25, completed: 1500, cat: 'Study' },
    { type: 'pomodoro', duration: 25, completed: 1500, cat: 'Study' },
    { type: 'pomodoro', duration: 25, completed: 1500, cat: 'Work' },
    { type: 'pomodoro', duration: 25, completed: 1500, cat: 'Work' },
  ];

  for (const fs of focusSessions) {
    db.runSync(
      `INSERT INTO focus_sessions (id, type, duration_minutes, completed_seconds, start_timestamp, end_timestamp, is_completed, category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [generateId('fses'), fs.type, fs.duration, fs.completed, now, now, fs.cat, now]
    );
  }

  // 10. Journal entry
  db.runSync(
    `INSERT INTO journal_entries (id, date, mood, content, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
}

