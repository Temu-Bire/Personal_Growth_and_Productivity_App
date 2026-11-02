import { getDatabase } from '../../db/client';
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
  static getAllWithProgress(date: string): Habit[] {
    const db = getDatabase();
    const habits = db.getAllSync<Habit>(
      'SELECT * FROM habits WHERE is_archived = 0 ORDER BY created_at ASC'
    );

    return habits.map((h) => {
      // Get today's log
      const todayLog = db.getFirstSync<{ count: number }>(
        'SELECT count FROM habit_logs WHERE habit_id = ? AND date = ?',
        [h.id, date]
      );
      const todayCount = todayLog ? todayLog.count : 0;
      const progressPercent = Math.min(
        100,
        Math.round((todayCount / (h.target_count || 1)) * 100)
      );

      // Get all logs for streak
      const allLogs = db.getAllSync<HabitLogEntry>(
        'SELECT date, count FROM habit_logs WHERE habit_id = ? ORDER BY date DESC',
        [h.id]
      );
      const { currentStreak, last7Days } = calculateHabitStreak(
        allLogs,
        h.target_count
      );

      return {
        ...h,
        todayCount,
        progressPercent,
        streak: currentStreak,
        last7Days,
      };
    });
  }

  static toggleOrIncrement(habitId: string, date: string): number {
    const db = getDatabase();
    const habit = db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?', [habitId]);
    if (!habit) return 0;

    const existingLog = db.getFirstSync<{ id: string; count: number }>(
      'SELECT id, count FROM habit_logs WHERE habit_id = ? AND date = ?',
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
      db.runSync('UPDATE habit_logs SET count = ? WHERE id = ?', [newCount, existingLog.id]);
    } else {
      db.runSync(
        'INSERT INTO habit_logs (id, habit_id, date, count, created_at) VALUES (?, ?, ?, ?, ?)',
        [generateId('hlog'), habitId, date, newCount, now]
      );
    }

    return newCount;
  }

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
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
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

    return db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?', [id])!;
  }

  static delete(id: string): void {
    const db = getDatabase();
    db.runSync('UPDATE habits SET is_archived = 1 WHERE id = ?', [id]);
  }
}

