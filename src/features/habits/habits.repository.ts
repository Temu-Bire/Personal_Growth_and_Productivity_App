import { getDatabase, getDatabaseAsync } from '../../db/client';
import { generateId } from '../../utils/id';
import { calculateHabitStreak, HabitLogEntry } from './streak.utils';

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  category_id?: string;
  target_count: number;
  unit: string;
  frequency: HabitFrequency;
  schedule_days: string; // JSON array of numbers e.g. "[1,2,3,4,5]"
  preferred_time?: string | null;
  duration_minutes: number;
  color: string;
  icon: string;
  reminder_time: string | null;
  reminder_enabled?: number;
  is_archived: number;
  created_at: string;
  updated_at: string;
  // Computed fields
  todayCount?: number;
  progressPercent?: number;
  streak?: number;
  current_streak?: number;
  longestStreak?: number;
  longest_streak?: number;
  last7Days?: number[];
  parsedDays?: number[];
}

export class HabitsRepository {
  // Sync: Get all active habits enriched with completion data and streaks
  static getAllWithProgress(date: string, includeArchived = false): Habit[] {
    const db = getDatabase();
    const query = includeArchived
      ? 'SELECT * FROM habits ORDER BY is_archived ASC, created_at ASC;'
      : 'SELECT * FROM habits WHERE is_archived = 0 ORDER BY created_at ASC;';

    const habits = db.getAllSync<Habit>(query);

    return habits.map((h) => {
      // Check habit_completions table first, fallback to habit_logs
      let todayCount = 0;
      try {
        const row = db.getFirstSync<{ count: number }>(
          'SELECT count FROM habit_completions WHERE habit_id = ? AND date = ?;',
          [h.id, date]
        );
        if (row) {
          todayCount = row.count;
        } else {
          const fallback = db.getFirstSync<{ count: number }>(
            'SELECT count FROM habit_logs WHERE habit_id = ? AND date = ?;',
            [h.id, date]
          );
          todayCount = fallback ? fallback.count : 0;
        }
      } catch {
        todayCount = 0;
      }

      const progressPercent = Math.min(
        100,
        Math.round((todayCount / (h.target_count || 1)) * 100)
      );

      // Fetch all completions for true streak calculation
      let allLogs: HabitLogEntry[] = [];
      try {
        allLogs = db.getAllSync<HabitLogEntry>(
          'SELECT date, count, notes FROM habit_completions WHERE habit_id = ? ORDER BY date DESC;',
          [h.id]
        );
        if (allLogs.length === 0) {
          allLogs = db.getAllSync<HabitLogEntry>(
            'SELECT date, count FROM habit_logs WHERE habit_id = ? ORDER BY date DESC;',
            [h.id]
          );
        }
      } catch {
        allLogs = [];
      }

      const { currentStreak, longestStreak, last7Days } = calculateHabitStreak(
        allLogs,
        h.target_count || 1
      );

      let parsedDays: number[] = [0, 1, 2, 3, 4, 5, 6];
      if (h.schedule_days) {
        try {
          parsedDays = JSON.parse(h.schedule_days);
        } catch {
          parsedDays = [0, 1, 2, 3, 4, 5, 6];
        }
      }

      return {
        ...h,
        category: (h as any).category || (h as any).category_name || 'General',
        duration_minutes: h.duration_minutes || 15,
        todayCount,
        progressPercent,
        streak: currentStreak,
        current_streak: currentStreak,
        longestStreak,
        longest_streak: longestStreak,
        last7Days,
        parsedDays,
      };
    });
  }

  static getAll(): Habit[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getAllWithProgress(today);
  }

  static getCompletionDates(habitId: string): string[] {
    const db = getDatabase();
    try {
      const rows = db.getAllSync<{ date: string }>(
        'SELECT date FROM habit_completions WHERE habit_id = ? ORDER BY date DESC;',
        [habitId]
      );
      if (rows.length > 0) return rows.map((r) => r.date);
      const fallback = db.getAllSync<{ date: string }>(
        'SELECT date FROM habit_logs WHERE habit_id = ? ORDER BY date DESC;',
        [habitId]
      );
      return fallback.map((r) => r.date);
    } catch {
      return [];
    }
  }

  static toggleCompletion(habitId: string, date: string): void {
    this.toggleOrIncrement(habitId, date);
  }

  // Toggle habit completion on a given date (with notes and atomic transaction)
  static toggleOrIncrement(habitId: string, date: string, notes?: string): number {
    const db = getDatabase();
    const habit = db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [habitId]);
    if (!habit) return 0;

    const targetCount = habit.target_count || 1;
    const now = new Date().toISOString();

    let existingCount = 0;
    const existing = db.getFirstSync<{ id: string; count: number }>(
      'SELECT id, count FROM habit_completions WHERE habit_id = ? AND date = ?;',
      [habitId, date]
    );

    if (existing) {
      existingCount = existing.count;
    }

    let newCount = 1;
    if (existingCount >= targetCount) {
      newCount = 0; // Toggle off
    } else {
      newCount = existingCount + 1;
    }

    db.withTransactionSync(() => {
      // 1. Update habit_completions
      db.runSync(
        `INSERT INTO habit_completions (id, habit_id, date, count, notes, completed_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(habit_id, date) DO UPDATE SET 
           count = excluded.count,
           notes = COALESCE(excluded.notes, notes),
           completed_at = excluded.completed_at;`,
        [generateId('hc'), habitId, date, newCount, notes || null, now]
      );

      // 2. Also keep habit_logs synchronized for backward compatibility
      db.runSync(
        `INSERT INTO habit_logs (id, habit_id, date, count, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO NOTHING;`,
        [generateId('hlog'), habitId, date, newCount, now]
      );
    });

    return newCount;
  }

  // Edit historical completion for a specific past date
  static editHistoricalCompletion(habitId: string, date: string, count: number, notes?: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.withTransactionSync(() => {
      db.runSync(
        `INSERT INTO habit_completions (id, habit_id, date, count, notes, completed_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(habit_id, date) DO UPDATE SET 
           count = excluded.count,
           notes = excluded.notes,
           completed_at = excluded.completed_at;`,
        [generateId('hc'), habitId, date, Math.max(0, count), notes || null, now]
      );
    });
  }

  // Create habit with complete Dayvane parameters
  static create(habit: {
    name: string;
    description?: string;
    category_id?: string;
    targetCount: number;
    unit: string;
    frequency?: HabitFrequency;
    scheduleDays?: number[];
    preferredTime?: string | null;
    durationMinutes?: number;
    icon?: string;
    color?: string;
    reminderTime?: string | null;
  }): Habit {
    const db = getDatabase();
    const id = generateId('habit');
    const now = new Date().toISOString();
    const scheduleDaysJson = JSON.stringify(habit.scheduleDays || [0, 1, 2, 3, 4, 5, 6]);

    db.runSync(
      `INSERT INTO habits (
        id, name, description, category_id, target_count, unit, frequency, schedule_days,
        preferred_time, duration_minutes, icon, color, reminder_time, reminder_enabled, is_archived, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?);`,
      [
        id,
        habit.name.trim(),
        habit.description || null,
        habit.category_id || null,
        habit.targetCount || 1,
        habit.unit || 'times',
        habit.frequency || 'daily',
        scheduleDaysJson,
        habit.preferredTime || null,
        habit.durationMinutes || 15,
        habit.icon || 'flash-outline',
        habit.color || '#10B981',
        habit.reminderTime || null,
        habit.reminderTime ? 1 : 0,
        now,
        now,
      ]
    );

    return db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [id])!;
  }

  // Update habit
  static update(
    id: string,
    data: {
      name?: string;
      description?: string;
      targetCount?: number;
      unit?: string;
      frequency?: HabitFrequency;
      scheduleDays?: number[];
      preferredTime?: string | null;
      durationMinutes?: number;
      icon?: string;
      color?: string;
      reminderTime?: string | null;
      isArchived?: number;
    }
  ): Habit | null {
    const db = getDatabase();
    const existing = db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const name = data.name !== undefined ? data.name.trim() : existing.name;
    const description = data.description !== undefined ? data.description : existing.description;
    const targetCount = data.targetCount !== undefined ? data.targetCount : existing.target_count;
    const unit = data.unit !== undefined ? data.unit : existing.unit;
    const frequency = data.frequency !== undefined ? data.frequency : existing.frequency;
    const scheduleDays = data.scheduleDays ? JSON.stringify(data.scheduleDays) : existing.schedule_days;
    const preferredTime = data.preferredTime !== undefined ? data.preferredTime : existing.preferred_time;
    const durationMinutes = data.durationMinutes !== undefined ? data.durationMinutes : existing.duration_minutes;
    const icon = data.icon !== undefined ? data.icon : existing.icon;
    const color = data.color !== undefined ? data.color : existing.color;
    const reminderTime = data.reminderTime !== undefined ? data.reminderTime : existing.reminder_time;
    const isArchived = data.isArchived !== undefined ? data.isArchived : existing.is_archived;

    db.runSync(
      `UPDATE habits SET 
        name = ?, description = ?, target_count = ?, unit = ?, frequency = ?, schedule_days = ?,
        preferred_time = ?, duration_minutes = ?, icon = ?, color = ?, reminder_time = ?, is_archived = ?, updated_at = ?
       WHERE id = ?;`,
      [
        name,
        description ?? null,
        targetCount,
        unit,
        frequency,
        scheduleDays,
        preferredTime ?? null,
        durationMinutes,
        icon,
        color,
        reminderTime ?? null,
        isArchived,
        now,
        id,
      ]
    );

    return db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
  }

  // Archive habit without deleting historical completion records
  static archive(id: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.runSync('UPDATE habits SET is_archived = 1, updated_at = ? WHERE id = ?;', [now, id]);
  }

  // Restore archived habit
  static unarchive(id: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.runSync('UPDATE habits SET is_archived = 0, updated_at = ? WHERE id = ?;', [now, id]);
  }

  // Delete habit (user-confirmed permanent deletion)
  static delete(id: string): void {
    const db = getDatabase();
    db.withTransactionSync(() => {
      db.runSync('DELETE FROM habit_completions WHERE habit_id = ?;', [id]);
      db.runSync('DELETE FROM habit_logs WHERE habit_id = ?;', [id]);
      db.runSync('DELETE FROM habits WHERE id = ?;', [id]);
    });
  }

  // Detail view with complete completion history and statistics
  static getHabitDetails(
    id: string,
    todayStr: string
  ): (Habit & { totalCompletedDays: number; completionHistory: HabitLogEntry[] }) | null {
    const db = getDatabase();
    const habit = db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
    if (!habit) return null;

    let todayCount = 0;
    const todayRow = db.getFirstSync<{ count: number }>(
      'SELECT count FROM habit_completions WHERE habit_id = ? AND date = ?;',
      [id, todayStr]
    );
    if (todayRow) todayCount = todayRow.count;

    const allLogs = db.getAllSync<HabitLogEntry>(
      'SELECT date, count, notes FROM habit_completions WHERE habit_id = ? ORDER BY date DESC LIMIT 60;',
      [id]
    );

    const { currentStreak, longestStreak, last7Days } = calculateHabitStreak(
      allLogs,
      habit.target_count || 1
    );

    const totalLogs = db.getAllSync<{ count: number }>(
      'SELECT count FROM habit_completions WHERE habit_id = ? AND count >= ?;',
      [id, habit.target_count || 1]
    );

    return {
      ...habit,
      todayCount,
      progressPercent: Math.min(100, Math.round((todayCount / (habit.target_count || 1)) * 100)),
      streak: currentStreak,
      longestStreak,
      last7Days,
      totalCompletedDays: totalLogs.length,
      completionHistory: allLogs,
    };
  }

  // Heatmap: aggregated daily completion rates for the past N days
  static getHeatmapData(days = 60): { date: string; completedCount: number; totalHabits: number; intensity: number }[] {
    const db = getDatabase();
    const totalHabitsRow = db.getFirstSync<{ count: number }>(
      'SELECT count(*) as count FROM habits WHERE is_archived = 0;'
    );
    const totalHabits = totalHabitsRow?.count || 1;

    const rows = db.getAllSync<{ date: string; completed: number }>(
      `SELECT date, count(*) as completed 
       FROM habit_completions 
       WHERE count >= 1 
       GROUP BY date 
       ORDER BY date DESC 
       LIMIT ?;`,
      [days]
    );

    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.date, r.completed));

    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const completedCount = map.get(dateStr) || 0;
      const intensity = Math.min(4, Math.round((completedCount / totalHabits) * 4));
      result.push({
        date: dateStr,
        completedCount,
        totalHabits,
        intensity,
      });
    }

    return result;
  }
}
