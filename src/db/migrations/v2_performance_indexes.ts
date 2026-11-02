import type { SQLiteDatabase } from 'expo-sqlite';
import { Migration } from './types';

export const migrationV2: Migration = {
  version: 2,
  description: 'Add composite indexes for dashboard queries and trade date performance',
  up: async (db: SQLiteDatabase) => {
    // Composite index for fast tasks filtering by date and completion
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_tasks_date_priority ON tasks(date, is_priority, is_completed);
      CREATE INDEX IF NOT EXISTS idx_habit_logs_composite ON habit_logs(habit_id, date);
      CREATE INDEX IF NOT EXISTS idx_trades_composite ON trades(date, pnl);
      CREATE INDEX IF NOT EXISTS idx_focus_type_date ON focus_sessions(type, created_at);
    `);
  },
  down: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      DROP INDEX IF EXISTS idx_tasks_date_priority;
      DROP INDEX IF EXISTS idx_habit_logs_composite;
      DROP INDEX IF EXISTS idx_trades_composite;
      DROP INDEX IF EXISTS idx_focus_type_date;
    `);
  },
};
