import * as SQLite from 'expo-sqlite';
import { runMigrationsAsync } from './migrator';
import { DatabaseError, TransactionError } from './errors';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const DB_NAME = 'growpro.db';

/**
 * Strict child-first table deletion order to preserve foreign-key integrity.
 * Child tables with foreign-key references are dropped before their respective parent tables.
 */
export const TABLE_DELETION_ORDER = [
  'custom_field_values',
  'custom_fields',
  'custom_categories',
  'custom_units',
  'user_preferences',
  'ideas',
  'weekly_reviews',
  'skill_logs',       // references skills
  'skills',
  'goal_milestones',  // references goals
  'goals',
  'trades',
  'journal_entries',
  'project_tasks',    // references projects
  'projects',
  'study_sessions',   // references subjects
  'study_topics',     // references subjects
  'subjects',
  'focus_sessions',
  'habit_logs',       // references habits
  'habits',
  'tasks',
  'profile',
] as const;

/**
 * Opens and initializes the GrowPro SQLite database asynchronously.
 * Configures WAL mode, enables foreign keys, and executes versioned migrations.
 */
export async function getDatabaseAsync(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);

      // Concurrency & integrity settings
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');

      // Safely apply versioned migrations
      await runMigrationsAsync(db);

      ensureProjectsSchemaSync(db);

      dbInstance = db;
      return db;
    } catch (error: unknown) {
      initPromise = null;
      throw new DatabaseError(
        `Failed to initialize SQLite database asynchronously: ${
          error instanceof Error ? error.message : String(error)
        }`,
        undefined,
        error
      );
    }
  })();

  return initPromise;
}

function ensureProjectsSchemaSync(db: SQLite.SQLiteDatabase): void {
  try {
    const cols = db.getAllSync<{ name: string }>('PRAGMA table_info(projects);');
    const colNames = cols.map((c) => c.name);
    if (colNames.length > 0) {
      if (!colNames.includes('name')) {
        db.execSync('ALTER TABLE projects ADD COLUMN name TEXT;');
        db.execSync('UPDATE projects SET name = COALESCE(title, "Untitled Project");');
      }
      if (!colNames.includes('title')) {
        db.execSync('ALTER TABLE projects ADD COLUMN title TEXT;');
        db.execSync('UPDATE projects SET title = name;');
      }
      if (!colNames.includes('description')) {
        db.execSync('ALTER TABLE projects ADD COLUMN description TEXT;');
      }
      if (!colNames.includes('category_id')) {
        db.execSync('ALTER TABLE projects ADD COLUMN category_id TEXT;');
      }
      if (!colNames.includes('deleted_at')) {
        db.execSync('ALTER TABLE projects ADD COLUMN deleted_at TEXT;');
      }
      if (!colNames.includes('category')) {
        db.execSync("ALTER TABLE projects ADD COLUMN category TEXT NOT NULL DEFAULT 'General';");
      }
      if (!colNames.includes('check_in_rhythm')) {
        db.execSync("ALTER TABLE projects ADD COLUMN check_in_rhythm TEXT NOT NULL DEFAULT 'none';");
      }
      if (!colNames.includes('status')) {
        db.execSync("ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'active';");
      }
    }

    const taskCols = db.getAllSync<{ name: string }>('PRAGMA table_info(tasks);');
    const taskColNames = taskCols.map((c) => c.name);
    if (taskColNames.length > 0 && !taskColNames.includes('project_id')) {
      db.execSync('ALTER TABLE tasks ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL;');
    }
  } catch {
    // safe ignore if table doesn't exist yet
  }
}

/**
 * Synchronous database getter for synchronous callers and backward compatibility.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    try {
      dbInstance = SQLite.openDatabaseSync(DB_NAME);
      dbInstance.execSync('PRAGMA journal_mode = WAL;');
      dbInstance.execSync('PRAGMA foreign_keys = ON;');
      ensureProjectsSchemaSync(dbInstance);
    } catch (error: unknown) {
      throw new DatabaseError(
        `Failed to open SQLite database synchronously: ${
          error instanceof Error ? error.message : String(error)
        }`,
        undefined,
        error
      );
    }
  }
  return dbInstance;
}

/**
 * Resets the database atomically within a transaction.
 * Preserves foreign-key integrity by dropping child tables before parent tables.
 */
export async function resetDatabaseAsync(): Promise<void> {
  const db = await getDatabaseAsync();

  try {
    await db.withTransactionAsync(async () => {
      // Drop in strict child-first dependency order
      for (const table of TABLE_DELETION_ORDER) {
        await db.execAsync(`DROP TABLE IF EXISTS ${table};`);
      }
      // Reset migration version
      await db.execAsync('PRAGMA user_version = 0;');
    });

    // Re-apply current migrations to rebuild the fresh schema
    await runMigrationsAsync(db);
  } catch (error: unknown) {
    throw new TransactionError(
      `Failed to reset database: ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}

/**
 * Synchronous database reset helper.
 */
export function resetDatabase(): void {
  const db = getDatabase();
  try {
    db.withTransactionSync(() => {
      for (const table of TABLE_DELETION_ORDER) {
        db.execSync(`DROP TABLE IF EXISTS ${table};`);
      }
      db.execSync('PRAGMA user_version = 0;');
    });
  } catch (error: unknown) {
    throw new TransactionError(
      `Failed to synchronously reset database: ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}
