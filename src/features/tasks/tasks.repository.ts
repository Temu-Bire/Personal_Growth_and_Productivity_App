import { getDatabase } from '../../db/client';
import { Task, CreateTaskDTO } from './tasks.types';
import { generateId } from '../../utils/id';

export class TasksRepository {
  static getTasksByDate(date: string): Task[] {
    const db = getDatabase();
    return db.getAllSync<Task>(
      `SELECT * FROM tasks WHERE date = ? AND deleted_at IS NULL ORDER BY is_completed ASC, start_time ASC, created_at ASC`,
      [date]
    );
  }

  static getTodayPriorities(date: string): Task[] {
    const db = getDatabase();
    return db.getAllSync<Task>(
      `SELECT * FROM tasks WHERE date = ? AND is_priority = 1 AND deleted_at IS NULL ORDER BY is_completed ASC, created_at ASC LIMIT 3`,
      [date]
    );
  }

  static getCompletionStats(date: string): { total: number; completed: number; percent: number } {
    const db = getDatabase();
    const rows = db.getAllSync<{ is_completed: number }>(
      `SELECT is_completed FROM tasks WHERE date = ? AND deleted_at IS NULL`,
      [date]
    );
    const total = rows.length;
    const completed = rows.filter((r) => r.is_completed === 1).length;
    const percent = total === 0 ? 100 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }

  static create(dto: CreateTaskDTO): Task {
    const db = getDatabase();
    const id = generateId('task');
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO tasks (id, title, date, start_time, end_time, category, priority, reminder_time, repeat, is_completed, is_priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
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

    return db.getFirstSync<Task>('SELECT * FROM tasks WHERE id = ?', [id])!;
  }

  static toggleComplete(id: string): boolean {
    const db = getDatabase();
    const current = db.getFirstSync<Task>('SELECT is_completed FROM tasks WHERE id = ?', [id]);
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    const completedAt = newCompleted === 1 ? new Date().toISOString() : null;
    const now = new Date().toISOString();

    db.runSync(
      'UPDATE tasks SET is_completed = ?, completed_at = ?, updated_at = ? WHERE id = ?',
      [newCompleted, completedAt, now, id]
    );
    return newCompleted === 1;
  }

  static delete(id: string): void {
    const db = getDatabase();
    db.runSync('UPDATE tasks SET deleted_at = ? WHERE id = ?', [new Date().toISOString(), id]);
  }
}
