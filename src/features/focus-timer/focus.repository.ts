import { getDatabase, getDatabaseAsync } from '../../db/client';
import { generateId } from '../../utils/id';

export interface FocusSession {
  id: string;
  task_id: string | null;
  type: string;
  duration_minutes: number;
  completed_seconds: number;
  start_timestamp: string;
  end_timestamp: string;
  is_completed: number;
  category: string;
  created_at: string;
}

export class FocusRepository {
  // Sync
  static logSession(session: {
    taskId?: string | null;
    type: 'pomodoro' | 'short_break' | 'long_break';
    durationMinutes: number;
    completedSeconds: number;
    startTimestamp: string;
    endTimestamp: string;
    category?: string;
  }): FocusSession {
    const db = getDatabase();
    const id = generateId('fses');
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO focus_sessions (id, task_id, type, duration_minutes, completed_seconds, start_timestamp, end_timestamp, is_completed, category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        id,
        session.taskId || null,
        session.type,
        session.durationMinutes,
        session.completedSeconds,
        session.startTimestamp,
        session.endTimestamp,
        session.category || 'Study',
        now,
      ]
    );

    return db.getFirstSync<FocusSession>('SELECT * FROM focus_sessions WHERE id = ?', [id])!;
  }

  // Async non-blocking
  static async logSessionAsync(session: {
    taskId?: string | null;
    type: 'pomodoro' | 'short_break' | 'long_break';
    durationMinutes: number;
    completedSeconds: number;
    startTimestamp: string;
    endTimestamp: string;
    category?: string;
  }): Promise<FocusSession> {
    const db = await getDatabaseAsync();
    const id = generateId('fses');
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO focus_sessions (id, task_id, type, duration_minutes, completed_seconds, start_timestamp, end_timestamp, is_completed, category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        id,
        session.taskId || null,
        session.type,
        session.durationMinutes,
        session.completedSeconds,
        session.startTimestamp,
        session.endTimestamp,
        session.category || 'Study',
        now,
      ]
    );

    const created = await db.getFirstAsync<FocusSession>('SELECT * FROM focus_sessions WHERE id = ?', [id]);
    return created!;
  }

  // Sync
  static getTodayTotalFocusMinutes(): number {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const rows = db.getAllSync<{ completed_seconds: number }>(
      `SELECT completed_seconds FROM focus_sessions WHERE type = 'pomodoro' AND DATE(created_at) = ?`,
      [today]
    );
    const totalSecs = rows.reduce((acc, row) => acc + (row.completed_seconds || 0), 0);
    return Math.round(totalSecs / 60);
  }

  // Async non-blocking
  static async getTodayTotalFocusMinutesAsync(): Promise<number> {
    const db = await getDatabaseAsync();
    const today = new Date().toISOString().split('T')[0];
    const rows = await db.getAllAsync<{ completed_seconds: number }>(
      `SELECT completed_seconds FROM focus_sessions WHERE type = 'pomodoro' AND DATE(created_at) = ?`,
      [today]
    );
    const totalSecs = rows.reduce((acc, row) => acc + (row.completed_seconds || 0), 0);
    return Math.round(totalSecs / 60);
  }

  // Sync
  static getCategoryUsage(): { category: string; minutes: number }[] {
    const db = getDatabase();
    const rows = db.getAllSync<{ category: string; total_secs: number }>(
      `SELECT category, SUM(completed_seconds) as total_secs FROM focus_sessions GROUP BY category`
    );
    return rows.map((r) => ({
      category: r.category || 'Other',
      minutes: Math.round((r.total_secs || 0) / 60),
    }));
  }

  // Async non-blocking
  static async getCategoryUsageAsync(): Promise<{ category: string; minutes: number }[]> {
    const db = await getDatabaseAsync();
    const rows = await db.getAllAsync<{ category: string; total_secs: number }>(
      `SELECT category, SUM(completed_seconds) as total_secs FROM focus_sessions GROUP BY category`
    );
    return rows.map((r) => ({
      category: r.category || 'Other',
      minutes: Math.round((r.total_secs || 0) / 60),
    }));
  }
}

