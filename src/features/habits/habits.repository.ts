import { getDatabase, getDatabaseAsync } from '../../db/client';
import { generateId } from '../../utils/id';
import { calculateHabitStreak, HabitLogEntry } from './streak.utils';

export interface Habit {
  id: string;
  name: string;
  target_count: number;
  unit: string;
  frequency: 'daily' | 'weekly';
  icon: string;
  color: string;
  reminder_time: string | null;
  is_archived: number;
  created_at: string;
  updated_at: string;
  // Computed fields
  todayCount?: number;
  progressPercent?: number;
  streak?: number;
  last7Days?: number[];
}

export class HabitsRepository {
  // Sync
  static getAllWithProgress(date: string): Habit[] {
    const db = getDatabase();
    const habits = db.getAllSync<Habit>(
      'SELECT * FROM habits WHERE is_archived = 0 ORDER BY created_at ASC;'
    );

    return habits.map((h) => {
      const todayLog = db.getFirstSync<{ count: number }>(
        'SELECT count FROM habit_logs WHERE habit_id = ? AND date = ?;',
        [h.id, date]
      );
      const todayCount = todayLog ? todayLog.count : 0;
      const progressPercent = Math.min(
        100,
        Math.round((todayCount / (h.target_count || 1)) * 100)
      );

      const allLogs = db.getAllSync<HabitLogEntry>(
        'SELECT date, count FROM habit_logs WHERE habit_id = ? ORDER BY date DESC;',
        [h.id]
      );
      const { currentStreak, last7Days } = calculateHabitStreak(allLogs, h.target_count);

      return {
        ...h,
        todayCount,
        progressPercent,
        streak: currentStreak,
        last7Days,
      };
    });
  }

  // Async non-blocking
  static async getAllWithProgressAsync(date: string): Promise<Habit[]> {
    const db = await getDatabaseAsync();
    const habits = await db.getAllAsync<Habit>(
      'SELECT * FROM habits WHERE is_archived = 0 ORDER BY created_at ASC;'
    );

    const results: Habit[] = [];
    for (const h of habits) {
      const todayLog = await db.getFirstAsync<{ count: number }>(
        'SELECT count FROM habit_logs WHERE habit_id = ? AND date = ?;',
        [h.id, date]
      );
      const todayCount = todayLog ? todayLog.count : 0;
      const progressPercent = Math.min(
        100,
        Math.round((todayCount / (h.target_count || 1)) * 100)
      );

      const allLogs = await db.getAllAsync<HabitLogEntry>(
        'SELECT date, count FROM habit_logs WHERE habit_id = ? ORDER BY date DESC;',
        [h.id]
      );
      const { currentStreak, last7Days } = calculateHabitStreak(allLogs, h.target_count);

      results.push({
        ...h,
        todayCount,
        progressPercent,
        streak: currentStreak,
        last7Days,
      });
    }

    return results;
  }

  // Sync
  static toggleOrIncrement(habitId: string, date: string): number {
    const db = getDatabase();
    const habit = db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [habitId]);
    if (!habit) return 0;

    const existingLog = db.getFirstSync<{ id: string; count: number }>(
      'SELECT id, count FROM habit_logs WHERE habit_id = ? AND date = ?;',
      [habitId, date]
    );

    let newCount = 1;
    const now = new Date().toISOString();

    if (existingLog) {
      if (existingLog.count >= habit.target_count) {
        newCount = 0; // Toggle off if already completed
      } else {
        newCount = existingLog.count + 1;
      }
      db.runSync('UPDATE habit_logs SET count = ? WHERE id = ?;', [newCount, existingLog.id]);
    } else {
      db.runSync(
        'INSERT INTO habit_logs (id, habit_id, date, count, created_at) VALUES (?, ?, ?, ?, ?);',
        [generateId('hlog'), habitId, date, newCount, now]
      );
    }

    return newCount;
  }

  // Async
  static async toggleOrIncrementAsync(habitId: string, date: string): Promise<number> {
    const db = await getDatabaseAsync();
    const habit = await db.getFirstAsync<Habit>('SELECT * FROM habits WHERE id = ?;', [habitId]);
    if (!habit) return 0;

    const existingLog = await db.getFirstAsync<{ id: string; count: number }>(
      'SELECT id, count FROM habit_logs WHERE habit_id = ? AND date = ?;',
      [habitId, date]
    );

    let newCount = 1;
    const now = new Date().toISOString();

    if (existingLog) {
      if (existingLog.count >= habit.target_count) {
        newCount = 0;
      } else {
        newCount = existingLog.count + 1;
      }
      await db.runAsync('UPDATE habit_logs SET count = ? WHERE id = ?;', [newCount, existingLog.id]);
    } else {
      await db.runAsync(
        'INSERT INTO habit_logs (id, habit_id, date, count, created_at) VALUES (?, ?, ?, ?, ?);',
        [generateId('hlog'), habitId, date, newCount, now]
      );
    }

    return newCount;
  }

  // Sync
  static create(habit: {
    name: string;
    targetCount: number;
    unit: string;
    frequency: 'daily' | 'weekly';
    icon: string;
    color: string;
    reminderTime?: string | null;
  }): Habit {
    const db = getDatabase();
    const id = generateId('habit');
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO habits (id, name, target_count, unit, frequency, icon, color, reminder_time, is_archived, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?);`,
      [
        id,
        habit.name,
        habit.targetCount,
        habit.unit,
        habit.frequency,
        habit.icon,
        habit.color,
        habit.reminderTime || null,
        now,
        now,
      ]
    );

    return db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [id])!;
  }

  // Async
  static async createAsync(habit: {
    name: string;
    targetCount: number;
    unit: string;
    frequency: 'daily' | 'weekly';
    icon: string;
    color: string;
    reminderTime?: string | null;
  }): Promise<Habit> {
    const db = await getDatabaseAsync();
    const id = generateId('habit');
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO habits (id, name, target_count, unit, frequency, icon, color, reminder_time, is_archived, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?);`,
      [
        id,
        habit.name,
        habit.targetCount,
        habit.unit,
        habit.frequency,
        habit.icon,
        habit.color,
        habit.reminderTime || null,
        now,
        now,
      ]
    );

    const created = await db.getFirstAsync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
    return created!;
  }

  // Sync
  static delete(id: string): void {
    const db = getDatabase();
    db.withTransactionSync(() => {
      db.runSync('DELETE FROM habit_logs WHERE habit_id = ?;', [id]);
      db.runSync('DELETE FROM habits WHERE id = ?;', [id]);
    });
  }

  // Async
  static async deleteAsync(id: string): Promise<void> {
    const db = await getDatabaseAsync();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ?;', [id]);
      await db.runAsync('DELETE FROM habits WHERE id = ?;', [id]);
    });
  }

  // Update
  static update(
    id: string,
    habit: {
      name?: string;
      targetCount?: number;
      unit?: string;
      frequency?: 'daily' | 'weekly';
      icon?: string;
      color?: string;
      reminderTime?: string | null;
    }
  ): Habit | null {
    const db = getDatabase();
    const existing = db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const name = habit.name !== undefined ? habit.name.trim() : existing.name;
    const targetCount = habit.targetCount !== undefined ? habit.targetCount : existing.target_count;
    const unit = habit.unit !== undefined ? habit.unit : existing.unit;
    const frequency = habit.frequency !== undefined ? habit.frequency : existing.frequency;
    const icon = habit.icon !== undefined ? habit.icon : existing.icon;
    const color = habit.color !== undefined ? habit.color : existing.color;
    const reminderTime = habit.reminderTime !== undefined ? habit.reminderTime : existing.reminder_time;

    db.runSync(
      `UPDATE habits
       SET name = ?, target_count = ?, unit = ?, frequency = ?, icon = ?, color = ?, reminder_time = ?, updated_at = ?
       WHERE id = ?;`,
      [name, targetCount, unit, frequency, icon, color, reminderTime, now, id]
    );

    return db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
  }

  static async updateAsync(
    id: string,
    habit: {
      name?: string;
      targetCount?: number;
      unit?: string;
      frequency?: 'daily' | 'weekly';
      icon?: string;
      color?: string;
      reminderTime?: string | null;
    }
  ): Promise<Habit | null> {
    const db = await getDatabaseAsync();
    const existing = await db.getFirstAsync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const name = habit.name !== undefined ? habit.name.trim() : existing.name;
    const targetCount = habit.targetCount !== undefined ? habit.targetCount : existing.target_count;
    const unit = habit.unit !== undefined ? habit.unit : existing.unit;
    const frequency = habit.frequency !== undefined ? habit.frequency : existing.frequency;
    const icon = habit.icon !== undefined ? habit.icon : existing.icon;
    const color = habit.color !== undefined ? habit.color : existing.color;
    const reminderTime = habit.reminderTime !== undefined ? habit.reminderTime : existing.reminder_time;

    await db.runAsync(
      `UPDATE habits
       SET name = ?, target_count = ?, unit = ?, frequency = ?, icon = ?, color = ?, reminder_time = ?, updated_at = ?
       WHERE id = ?;`,
      [name, targetCount, unit, frequency, icon, color, reminderTime, now, id]
    );

    return db.getFirstAsync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
  }

  // Get full habit details for Habit Detail Screen / Modal
  static getHabitDetails(id: string, todayStr: string): (Habit & { totalCompletedDays: number; completionHistory: HabitLogEntry[] }) | null {
    const db = getDatabase();
    const habit = db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
    if (!habit) return null;

    const todayLog = db.getFirstSync<{ count: number }>(
      'SELECT count FROM habit_logs WHERE habit_id = ? AND date = ?;',
      [id, todayStr]
    );
    const todayCount = todayLog ? todayLog.count : 0;
    const progressPercent = Math.min(100, Math.round((todayCount / (habit.target_count || 1)) * 100));

    const allLogs = db.getAllSync<HabitLogEntry>(
      'SELECT date, count FROM habit_logs WHERE habit_id = ? ORDER BY date DESC LIMIT 30;',
      [id]
    );
    const { currentStreak, last7Days } = calculateHabitStreak(allLogs, habit.target_count);

    const totalLogs = db.getAllSync<{ count: number }>(
      'SELECT count FROM habit_logs WHERE habit_id = ? AND count >= ?;',
      [id, habit.target_count || 1]
    );

    return {
      ...habit,
      todayCount,
      progressPercent,
      streak: currentStreak,
      last7Days,
      totalCompletedDays: totalLogs.length,
      completionHistory: allLogs,
    };
  }
}
