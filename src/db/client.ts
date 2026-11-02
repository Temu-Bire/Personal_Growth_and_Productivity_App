import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('growpro.db');
    // Enable WAL mode for better concurrency and performance
    dbInstance.execSync('PRAGMA journal_mode = WAL;');
    dbInstance.execSync('PRAGMA foreign_keys = ON;');
    // Initialize schema
    dbInstance.execSync(CREATE_TABLES_SQL);
  }
  return dbInstance;
}

export function resetDatabase(): void {
  const db = getDatabase();
  const tables = [
    'weekly_reviews',
    'skill_logs',
    'skills',
    'goal_milestones',
    'goals',
    'trades',
    'journal_entries',
    'project_tasks',
    'projects',
    'study_sessions',
    'study_topics',
    'subjects',
    'focus_sessions',
    'habit_logs',
    'habits',
    'tasks',
    'profile',
  ];

  for (const table of tables) {
    db.runSync(`DROP TABLE IF EXISTS ${table}`);
  }
  db.execSync(CREATE_TABLES_SQL);
}
