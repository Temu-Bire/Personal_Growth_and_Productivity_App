import type { SQLiteDatabase } from 'expo-sqlite';
import { Migration } from './types';

export const migrationV3: Migration = {
  version: 3,
  description: 'Add ideas table for rapid idea capture and organization',
  up: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ideas (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'General',
        tags TEXT,
        is_pinned INTEGER DEFAULT 0,
        color TEXT DEFAULT '#1E8E4E',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
      CREATE INDEX IF NOT EXISTS idx_ideas_is_pinned ON ideas(is_pinned);
    `);
  },
  down: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      DROP INDEX IF EXISTS idx_ideas_is_pinned;
      DROP INDEX IF EXISTS idx_ideas_created_at;
      DROP TABLE IF EXISTS ideas;
    `);
  },
};
