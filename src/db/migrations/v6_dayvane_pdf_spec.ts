import type { SQLiteDatabase } from 'expo-sqlite';
import { Migration } from './types';

export const migrationV6: Migration = {
  version: 6,
  description: 'Align schema with Dayvane Mobile PDF specification (Projects, Settings, CoachMessages, PDF Categories)',
  up: async (db: SQLiteDatabase) => {
    const now = new Date().toISOString();

    // 1. Projects Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category_id TEXT,
        category TEXT NOT NULL DEFAULT 'General',
        status TEXT NOT NULL DEFAULT 'active',
        check_in_rhythm TEXT NOT NULL DEFAULT 'none',
        last_check_in TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    `);

    // 2. Add project_id to tasks if missing
    const taskCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(tasks);');
    const taskColNames = taskCols.map((c) => c.name);
    if (!taskColNames.includes('project_id')) {
      await db.execAsync('ALTER TABLE tasks ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL;');
    }

    // 3. App Settings Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY NOT NULL,
        display_name TEXT NOT NULL DEFAULT 'Temesgen Birhenu',
        daily_digest_enabled INTEGER NOT NULL DEFAULT 1,
        digest_time TEXT NOT NULL DEFAULT '08:00 AM',
        app_lock INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await db.runAsync(
      `INSERT OR IGNORE INTO settings (id, display_name, daily_digest_enabled, digest_time, app_lock, created_at, updated_at)
       VALUES ('user_settings', 'Temesgen Birhenu', 1, '08:00 AM', 0, ?, ?);`,
      [now, now]
    );

    // 4. Coach Messages Table (local offline chat)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS coach_messages (
        id TEXT PRIMARY KEY NOT NULL,
        role TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_coach_messages_created ON coach_messages(created_at);
    `);

    // 5. Journal Entries columns from PDF
    const journalCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(journal_entries);');
    const journalColNames = journalCols.map((c) => c.name);
    if (!journalColNames.includes('recap')) {
      await db.execAsync('ALTER TABLE journal_entries ADD COLUMN recap TEXT;');
    }
    if (!journalColNames.includes('learned')) {
      await db.execAsync('ALTER TABLE journal_entries ADD COLUMN learned TEXT;');
    }
    if (!journalColNames.includes('notes')) {
      await db.execAsync('ALTER TABLE journal_entries ADD COLUMN notes TEXT;');
    }

    // 6. Ensure standard PDF categories exist: Health, Career, Finance, Learning, Faith, Personal
    const defaultCategories = [
      { id: 'cat_health', name: 'Health', color: '#22C55E', icon: 'fitness-outline', sort_order: 1 },
      { id: 'cat_career', name: 'Career', color: '#3B82F6', icon: 'briefcase-outline', sort_order: 2 },
      { id: 'cat_finance', name: 'Finance', color: '#EAB308', icon: 'cash-outline', sort_order: 3 },
      { id: 'cat_learning', name: 'Learning', color: '#A855F7', icon: 'book-outline', sort_order: 4 },
      { id: 'cat_faith', name: 'Faith', color: '#14B8A6', icon: 'heart-outline', sort_order: 5 },
      { id: 'cat_personal', name: 'Personal', color: '#64748B', icon: 'person-outline', sort_order: 6 },
    ];

    for (const cat of defaultCategories) {
      await db.runAsync(
        `INSERT INTO categories (id, name, color, icon, module, sort_order, created_at)
         VALUES (?, ?, ?, ?, 'all', ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, color = excluded.color;`,
        [cat.id, cat.name, cat.color, cat.icon, cat.sort_order, now]
      );
    }
  },
};

