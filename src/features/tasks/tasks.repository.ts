import { getDatabase, getDatabaseAsync } from '../../db/client';
import { Task, CreateTaskDTO } from './tasks.types';
import { generateId } from '../../utils/id';

export class TasksRepository {
  // Sync
  static getTasksByDate(date: string): Task[] {
    const db = getDatabase();
    return db.getAllSync<Task>(
      `SELECT * FROM tasks WHERE date = ? AND deleted_at IS NULL ORDER BY is_completed ASC, start_time ASC, created_at ASC;`,
      [date]
    );
  }

  // Async non-blocking
  static async getTasksByDateAsync(date: string): Promise<Task[]> {
    const db = await getDatabaseAsync();
    return db.getAllAsync<Task>(
      `SELECT * FROM tasks WHERE date = ? AND deleted_at IS NULL ORDER BY is_completed ASC, start_time ASC, created_at ASC;`,
      [date]
    );
  }

  // Sync
  static getTodayPriorities(date: string): Task[] {
    const db = getDatabase();
    return db.getAllSync<Task>(
      `SELECT * FROM tasks WHERE date = ? AND is_priority = 1 AND deleted_at IS NULL ORDER BY is_completed ASC, created_at ASC LIMIT 3;`,
      [date]
    );
  }

  // Async
  static async getTodayPrioritiesAsync(date: string): Promise<Task[]> {
    const db = await getDatabaseAsync();
    return db.getAllAsync<Task>(
      `SELECT * FROM tasks WHERE date = ? AND is_priority = 1 AND deleted_at IS NULL ORDER BY is_completed ASC, created_at ASC LIMIT 3;`,
      [date]
    );
  }

  // Sync
  static getCompletionStats(date: string): { total: number; completed: number; percent: number } {
    const db = getDatabase();
    const rows = db.getAllSync<{ is_completed: number }>(
      `SELECT is_completed FROM tasks WHERE date = ? AND deleted_at IS NULL;`,
      [date]
    );
    const total = rows.length;
    const completed = rows.filter((r) => r.is_completed === 1).length;
    const percent = total === 0 ? 100 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }

  // Async
  static async getCompletionStatsAsync(date: string): Promise<{ total: number; completed: number; percent: number }> {
    const db = await getDatabaseAsync();
    const rows = await db.getAllAsync<{ is_completed: number }>(
      `SELECT is_completed FROM tasks WHERE date = ? AND deleted_at IS NULL;`,
      [date]
    );
    const total = rows.length;
    const completed = rows.filter((r) => r.is_completed === 1).length;
    const percent = total === 0 ? 100 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }

  // Sync
  static create(dto: CreateTaskDTO): Task {
    const db = getDatabase();
    const id = generateId('task');
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO tasks (id, title, date, start_time, end_time, category, priority, reminder_time, repeat, is_completed, is_priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?);`,
      [
        id,
        dto.title,
        dto.date,
        dto.start_time || null,
        dto.end_time || null,
        dto.category || 'General',
        dto.priority || 'medium',
        dto.reminder_time || null,
        dto.repeat || 'none',
        dto.is_priority || 0,
        now,
        now,
      ]
    );

    return db.getFirstSync<Task>('SELECT * FROM tasks WHERE id = ?;', [id])!;
  }

  // Async
  static async createAsync(dto: CreateTaskDTO): Promise<Task> {
    const db = await getDatabaseAsync();
    const id = generateId('task');
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO tasks (id, title, date, start_time, end_time, category, priority, reminder_time, repeat, is_completed, is_priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?);`,
      [
        id,
        dto.title,
        dto.date,
        dto.start_time || null,
        dto.end_time || null,
        dto.category || 'General',
        dto.priority || 'medium',
        dto.reminder_time || null,
        dto.repeat || 'none',
        dto.is_priority || 0,
        now,
        now,
      ]
    );

    const task = await db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?;', [id]);
    return task!;
  }

  // Sync
  static toggleComplete(id: string): boolean {
    const db = getDatabase();
    const current = db.getFirstSync<Task>('SELECT is_completed FROM tasks WHERE id = ?;', [id]);
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    const completedAt = newCompleted === 1 ? new Date().toISOString() : null;
    const now = new Date().toISOString();

    db.runSync(
      'UPDATE tasks SET is_completed = ?, completed_at = ?, updated_at = ? WHERE id = ?;',
      [newCompleted, completedAt, now, id]
    );
    return newCompleted === 1;
  }

  // Async
  static async toggleCompleteAsync(id: string): Promise<boolean> {
    const db = await getDatabaseAsync();
    const current = await db.getFirstAsync<Task>('SELECT is_completed FROM tasks WHERE id = ?;', [id]);
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    const completedAt = newCompleted === 1 ? new Date().toISOString() : null;
    const now = new Date().toISOString();

    await db.runAsync(
      'UPDATE tasks SET is_completed = ?, completed_at = ?, updated_at = ? WHERE id = ?;',
      [newCompleted, completedAt, now, id]
    );
    return newCompleted === 1;
  }

  // Sync
  static delete(id: string): void {
    const db = getDatabase();
    db.runSync('UPDATE tasks SET deleted_at = ? WHERE id = ?;', [new Date().toISOString(), id]);
  }

  // Async
  static async deleteAsync(id: string): Promise<void> {
    const db = await getDatabaseAsync();
    await db.runAsync('UPDATE tasks SET deleted_at = ? WHERE id = ?;', [new Date().toISOString(), id]);
  }

  // Get most relevant pending or in-progress task for dashboard
  static getCurrentTask(date: string): Task | null {
    const db = getDatabase();
    // Prefer incomplete priority task, then incomplete regular task by start_time
    const task = db.getFirstSync<Task>(
      `SELECT * FROM tasks
       WHERE date = ? AND is_completed = 0 AND deleted_at IS NULL
       ORDER BY is_priority DESC, start_time ASC, created_at ASC
       LIMIT 1;`,
      [date]
    );
    return task || null;
  }

  static async getCurrentTaskAsync(date: string): Promise<Task | null> {
    const db = await getDatabaseAsync();
    const task = await db.getFirstAsync<Task>(
      `SELECT * FROM tasks
       WHERE date = ? AND is_completed = 0 AND deleted_at IS NULL
       ORDER BY is_priority DESC, start_time ASC, created_at ASC
       LIMIT 1;`,
      [date]
    );
    return task || null;
  }
}
