import type { SQLiteDatabase } from 'expo-sqlite';
import { Migration } from './types';

export const migrationV7: Migration = {
  version: 7,
  description: 'Ensure all projects and journal columns exist and match Dayvane specification',
  up: async (db: SQLiteDatabase) => {
    // 1. Ensure projects table exists
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        title TEXT,
        description TEXT,
        category_id TEXT,
        category TEXT NOT NULL DEFAULT 'General',
        status TEXT NOT NULL DEFAULT 'active',
        check_in_rhythm TEXT NOT NULL DEFAULT 'none',
        last_check_in TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
      );
    `);

    // 2. Check existing columns in projects and alter table if missing
    const prjCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(projects);');
    const colNames = prjCols.map((c) => c.name);

    if (!colNames.includes('name')) {
      await db.execAsync('ALTER TABLE projects ADD COLUMN name TEXT;');
    }
    if (!colNames.includes('title')) {
      await db.execAsync('ALTER TABLE projects ADD COLUMN title TEXT;');
    }
    if (!colNames.includes('description')) {
      await db.execAsync('ALTER TABLE projects ADD COLUMN description TEXT;');
    }
    if (!colNames.includes('category_id')) {
      await db.execAsync('ALTER TABLE projects ADD COLUMN category_id TEXT;');
    }
    if (!colNames.includes('category')) {
      await db.execAsync("ALTER TABLE projects ADD COLUMN category TEXT NOT NULL DEFAULT 'General';");
    }
    if (!colNames.includes('check_in_rhythm')) {
      await db.execAsync("ALTER TABLE projects ADD COLUMN check_in_rhythm TEXT NOT NULL DEFAULT 'none';");
    }
    if (!colNames.includes('last_check_in')) {
      await db.execAsync('ALTER TABLE projects ADD COLUMN last_check_in TEXT;');
    }
    if (!colNames.includes('deleted_at')) {
      await db.execAsync('ALTER TABLE projects ADD COLUMN deleted_at TEXT;');
    }

    // 3. Sync name and title columns in projects
    await db.execAsync(`
      UPDATE projects SET name = title WHERE (name IS NULL OR name = '') AND title IS NOT NULL;
      UPDATE projects SET title = name WHERE (title IS NULL OR title = '') AND name IS NOT NULL;
      UPDATE projects SET name = 'Untitled Project' WHERE name IS NULL OR name = '';
      UPDATE projects SET category = 'General' WHERE category IS NULL;
      UPDATE projects SET status = 'active' WHERE status IS NULL;
      UPDATE projects SET check_in_rhythm = 'none' WHERE check_in_rhythm IS NULL;
    `);

    // 4. Ensure index
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);');

    // 5. Ensure tasks has project_id
    const taskCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(tasks);');
    const taskColNames = taskCols.map((c) => c.name);
    if (!taskColNames.includes('project_id')) {
      await db.execAsync('ALTER TABLE tasks ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL;');
    }

    // 6. Ensure journal_entries has recap, learned, notes
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
    if (!journalColNames.includes('mood_rating')) {
      await db.execAsync('ALTER TABLE journal_entries ADD COLUMN mood_rating INTEGER NOT NULL DEFAULT 4;');
    }
    if (!journalColNames.includes('energy_rating')) {
      await db.execAsync('ALTER TABLE journal_entries ADD COLUMN energy_rating INTEGER NOT NULL DEFAULT 4;');
    }
    if (!journalColNames.includes('productivity_rating')) {
      await db.execAsync('ALTER TABLE journal_entries ADD COLUMN productivity_rating INTEGER NOT NULL DEFAULT 4;');
    }
  },
};
