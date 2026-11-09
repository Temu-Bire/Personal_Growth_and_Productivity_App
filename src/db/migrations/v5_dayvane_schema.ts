import type { SQLiteDatabase } from 'expo-sqlite';
import { Migration } from './types';

export const migrationV5: Migration = {
  version: 5,
  description: 'Normalize Dayvane schema: goals, milestones, habit_completions, daily_summaries, coach_insights, categories',
  up: async (db: SQLiteDatabase) => {
    // 1. Categories table for goals, habits, tasks
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#10B981',
        icon TEXT NOT NULL DEFAULT 'bookmark-outline',
        module TEXT NOT NULL DEFAULT 'all',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_categories_module ON categories(module);
    `);

    // Seed initial Dayvane categories if empty
    const catCount = await db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM categories;');
    if (!catCount || catCount.count === 0) {
      const now = new Date().toISOString();
      await db.execAsync(`
        INSERT INTO categories (id, name, color, icon, module, sort_order, created_at) VALUES
        ('cat_health', 'Health & Fitness', '#10B981', 'fitness-outline', 'all', 1, '${now}'),
        ('cat_career', 'Career & Work', '#3B82F6', 'briefcase-outline', 'all', 2, '${now}'),
        ('cat_personal', 'Personal Growth', '#8B5CF6', 'bulb-outline', 'all', 3, '${now}'),
        ('cat_finance', 'Finance & Wealth', '#F59E0B', 'cash-outline', 'all', 4, '${now}'),
        ('cat_mindset', 'Mindset & Well-being', '#EC4899', 'heart-outline', 'all', 5, '${now}');
      `);
    }

    // 2. Add any missing columns to goals table
    const goalCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(goals);');
    const goalColNames = goalCols.map((c) => c.name);

    if (!goalColNames.includes('description')) {
      await db.execAsync('ALTER TABLE goals ADD COLUMN description TEXT;');
    }
    if (!goalColNames.includes('category_id')) {
      await db.execAsync('ALTER TABLE goals ADD COLUMN category_id TEXT REFERENCES categories(id) ON DELETE SET NULL;');
    }
    if (!goalColNames.includes('term_type')) {
      await db.execAsync("ALTER TABLE goals ADD COLUMN term_type TEXT NOT NULL DEFAULT 'short_term';");
    }
    if (!goalColNames.includes('priority')) {
      await db.execAsync("ALTER TABLE goals ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium';");
    }
    if (!goalColNames.includes('status')) {
      await db.execAsync("ALTER TABLE goals ADD COLUMN status TEXT NOT NULL DEFAULT 'active';");
    }
    if (!goalColNames.includes('target_date')) {
      // If target_date doesn't exist, we can use due_date or add target_date
      await db.execAsync("ALTER TABLE goals ADD COLUMN target_date TEXT;");
      await db.execAsync("UPDATE goals SET target_date = due_date WHERE target_date IS NULL;");
    }
    if (!goalColNames.includes('progress_percent')) {
      await db.execAsync("ALTER TABLE goals ADD COLUMN progress_percent INTEGER NOT NULL DEFAULT 0;");
    }

    // 3. Milestones table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS milestones (
        id TEXT PRIMARY KEY NOT NULL,
        goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        due_date TEXT,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_milestones_goal ON milestones(goal_id);
    `);

    // Migrate any legacy goal_milestones data if exists
    try {
      await db.execAsync(`
        INSERT OR IGNORE INTO milestones (id, goal_id, title, is_completed, created_at)
        SELECT id, goal_id, title, is_completed, created_at FROM goal_milestones;
      `);
    } catch {
      // safe if goal_milestones doesn't exist
    }

    // 4. Update habits table columns
    const habitCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(habits);');
    const habitColNames = habitCols.map((c) => c.name);

    if (!habitColNames.includes('description')) {
      await db.execAsync('ALTER TABLE habits ADD COLUMN description TEXT;');
    }
    if (!habitColNames.includes('category_id')) {
      await db.execAsync('ALTER TABLE habits ADD COLUMN category_id TEXT REFERENCES categories(id) ON DELETE SET NULL;');
    }
    if (!habitColNames.includes('schedule_days')) {
      await db.execAsync("ALTER TABLE habits ADD COLUMN schedule_days TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]';");
    }
    if (!habitColNames.includes('preferred_time')) {
      await db.execAsync('ALTER TABLE habits ADD COLUMN preferred_time TEXT;');
    }
    if (!habitColNames.includes('duration_minutes')) {
      await db.execAsync('ALTER TABLE habits ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 15;');
    }
    if (!habitColNames.includes('reminder_enabled')) {
      await db.execAsync('ALTER TABLE habits ADD COLUMN reminder_enabled INTEGER NOT NULL DEFAULT 0;');
    }

    // 5. habit_completions table (preserving historical completions with UNIQUE(habit_id, date))
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habit_completions (
        id TEXT PRIMARY KEY NOT NULL,
        habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        completed_at TEXT NOT NULL,
        UNIQUE(habit_id, date)
      );
      CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(date);
      CREATE INDEX IF NOT EXISTS idx_habit_completions_habit ON habit_completions(habit_id);
    `);

    // Migrate legacy habit_logs data if exists
    try {
      await db.execAsync(`
        INSERT OR IGNORE INTO habit_completions (id, habit_id, date, count, completed_at)
        SELECT id, habit_id, date, count, created_at FROM habit_logs;
      `);
    } catch {
      // safe
    }

    // 6. Update tasks table columns
    const taskCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(tasks);');
    const taskColNames = taskCols.map((c) => c.name);

    if (!taskColNames.includes('notes')) {
      await db.execAsync('ALTER TABLE tasks ADD COLUMN notes TEXT;');
    }
    if (!taskColNames.includes('goal_id')) {
      await db.execAsync('ALTER TABLE tasks ADD COLUMN goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL;');
    }
    if (!taskColNames.includes('category_id')) {
      await db.execAsync('ALTER TABLE tasks ADD COLUMN category_id TEXT REFERENCES categories(id) ON DELETE SET NULL;');
    }
    if (!taskColNames.includes('estimated_minutes')) {
      await db.execAsync('ALTER TABLE tasks ADD COLUMN estimated_minutes INTEGER NOT NULL DEFAULT 30;');
    }
    if (!taskColNames.includes('actual_minutes')) {
      await db.execAsync('ALTER TABLE tasks ADD COLUMN actual_minutes INTEGER;');
    }

    // 7. Update journal_entries columns (1-5 ratings for mood, energy, productivity)
    const journalCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(journal_entries);');
    const journalColNames = journalCols.map((c) => c.name);

    if (!journalColNames.includes('mood_rating')) {
      await db.execAsync('ALTER TABLE journal_entries ADD COLUMN mood_rating INTEGER NOT NULL DEFAULT 4;');
      // Populate from legacy mood if present
      await db.execAsync('UPDATE journal_entries SET mood_rating = mood WHERE mood_rating IS NULL OR mood_rating = 0;');
    }
    if (!journalColNames.includes('energy_rating')) {
      await db.execAsync('ALTER TABLE journal_entries ADD COLUMN energy_rating INTEGER NOT NULL DEFAULT 4;');
    }
    if (!journalColNames.includes('productivity_rating')) {
      await db.execAsync('ALTER TABLE journal_entries ADD COLUMN productivity_rating INTEGER NOT NULL DEFAULT 4;');
    }
    if (!journalColNames.includes('reflection')) {
      await db.execAsync('ALTER TABLE journal_entries ADD COLUMN reflection TEXT;');
      await db.execAsync('UPDATE journal_entries SET reflection = content WHERE reflection IS NULL;');
    }
    if (!journalColNames.includes('lessons_learned')) {
      await db.execAsync('ALTER TABLE journal_entries ADD COLUMN lessons_learned TEXT;');
    }

    // 8. Daily summaries table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_summaries (
        date TEXT PRIMARY KEY NOT NULL,
        productivity_score INTEGER NOT NULL DEFAULT 0,
        tasks_total INTEGER NOT NULL DEFAULT 0,
        tasks_completed INTEGER NOT NULL DEFAULT 0,
        habits_total INTEGER NOT NULL DEFAULT 0,
        habits_completed INTEGER NOT NULL DEFAULT 0,
        journal_logged INTEGER NOT NULL DEFAULT 0,
        computed_at TEXT NOT NULL
      );
    `);

    // 9. Coach insights table (offline AI coach engine)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS coach_insights (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium',
        action_route TEXT,
        is_dismissed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_coach_insights_date ON coach_insights(date);
    `);
  },
};

