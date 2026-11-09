import { getDatabase, getDatabaseAsync } from '../../db/client';
import { Task, CreateTaskDTO, TaskPriority, TaskStatus } from './tasks.types';
import { generateId } from '../../utils/id';

export class TasksRepository {
  // Sync: Get tasks filtered by date, status, priority, and optional search
  static getTasks(options?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    goalId?: string;
    search?: string;
  }): Task[] {
    const db = getDatabase();
    let query = `
      SELECT t.*, g.title as goal_title 
      FROM tasks t 
      LEFT JOIN goals g ON t.goal_id = g.id 
      WHERE t.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (options?.date) {
      if (options.status === 'overdue') {
        query += ' AND t.date < ? AND t.is_completed = 0';
        params.push(options.date);
      } else {
        query += ' AND t.date = ?';
        params.push(options.date);
      }
    } else if (options?.startDate && options?.endDate) {
      query += ' AND t.date BETWEEN ? AND ?';
      params.push(options.startDate, options.endDate);
    }

    if (options?.status === 'completed') {
      query += ' AND t.is_completed = 1';
    } else if (options?.status === 'pending') {
      query += ' AND t.is_completed = 0';
    }

    if (options?.priority) {
      query += ' AND t.priority = ?';
      params.push(options.priority);
    }

    if (options?.goalId) {
      query += ' AND t.goal_id = ?';
      params.push(options.goalId);
    }

    if (options?.search && options.search.trim()) {
      query += ' AND (t.title LIKE ? OR t.notes LIKE ?)';
      params.push(`%${options.search.trim()}%`, `%${options.search.trim()}%`);
    }

    query += ' ORDER BY t.is_completed ASC, t.is_priority DESC, t.start_time ASC, t.created_at ASC;';

    const tasks = db.getAllSync<Task>(query, params);
    return tasks.map((t) => ({
      ...t,
      estimated_minutes: t.estimated_minutes || 30,
    }));
  }

  static getTasksByDate(date: string): Task[] {
    return this.getTasks({ date });
  }

  static async getTasksByDateAsync(date: string): Promise<Task[]> {
    return this.getTasks({ date });
  }

  static getTodayPriorities(date: string): Task[] {
    const db = getDatabase();
    return db.getAllSync<Task>(
      `SELECT t.*, g.title as goal_title 
       FROM tasks t 
       LEFT JOIN goals g ON t.goal_id = g.id 
       WHERE t.date = ? AND t.is_priority = 1 AND t.deleted_at IS NULL 
       ORDER BY t.is_completed ASC, t.created_at ASC LIMIT 3;`,
      [date]
    );
  }

  static getCompletionStats(date: string): { total: number; completed: number; percent: number } {
    const db = getDatabase();
    const rows = db.getAllSync<{ is_completed: number }>(
      'SELECT is_completed FROM tasks WHERE date = ? AND deleted_at IS NULL;',
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
      `INSERT INTO tasks (
        id, title, notes, date, start_time, end_time, category, priority, goal_id,
        estimated_minutes, actual_minutes, reminder_time, repeat, is_completed, is_priority, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?);`,
      [
        id,
        dto.title.trim(),
        dto.notes || null,
        dto.date,
        dto.start_time || null,
        dto.end_time || null,
        dto.category || 'General',
        dto.priority || 'medium',
        dto.goal_id || null,
        dto.estimated_minutes || 30,
        dto.actual_minutes || null,
        dto.reminder_time || null,
        dto.repeat || 'none',
        dto.is_priority || (dto.priority === 'high' ? 1 : 0),
        now,
        now,
      ]
    );

    return db.getFirstSync<Task>('SELECT * FROM tasks WHERE id = ?;', [id])!;
  }

  static update(id: string, dto: Partial<CreateTaskDTO>): Task | null {
    const db = getDatabase();
    const existing = db.getFirstSync<Task>('SELECT * FROM tasks WHERE id = ?;', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const title = dto.title !== undefined ? dto.title.trim() : existing.title;
    const notes = dto.notes !== undefined ? dto.notes : existing.notes;
    const date = dto.date !== undefined ? dto.date : existing.date;
    const startTime = dto.start_time !== undefined ? dto.start_time : existing.start_time;
    const endTime = dto.end_time !== undefined ? dto.end_time : existing.end_time;
    const category = dto.category !== undefined ? dto.category : existing.category;
    const priority = dto.priority !== undefined ? dto.priority : existing.priority;
    const goalId = dto.goal_id !== undefined ? dto.goal_id : existing.goal_id;
    const estimatedMinutes = dto.estimated_minutes !== undefined ? dto.estimated_minutes : existing.estimated_minutes;
    const actualMinutes = dto.actual_minutes !== undefined ? dto.actual_minutes : existing.actual_minutes;
    const reminderTime = dto.reminder_time !== undefined ? dto.reminder_time : existing.reminder_time;
    const repeat = dto.repeat !== undefined ? dto.repeat : existing.repeat;
    const isPriority = dto.is_priority !== undefined ? dto.is_priority : existing.is_priority;

    db.runSync(
      `UPDATE tasks SET 
        title = ?, notes = ?, date = ?, start_time = ?, end_time = ?, category = ?, priority = ?,
        goal_id = ?, estimated_minutes = ?, actual_minutes = ?, reminder_time = ?, repeat = ?, is_priority = ?, updated_at = ?
       WHERE id = ?;`,
      [
        title,
        notes ?? null,
        date,
        startTime ?? null,
        endTime ?? null,
        category,
        priority,
        goalId ?? null,
        estimatedMinutes,
        actualMinutes ?? null,
        reminderTime ?? null,
        repeat,
        isPriority,
        now,
        id,
      ]
    );

    return db.getFirstSync<Task>('SELECT * FROM tasks WHERE id = ?;', [id]);
  }

  static reschedule(id: string, newDate: string, startTime?: string, endTime?: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.runSync(
      'UPDATE tasks SET date = ?, start_time = COALESCE(?, start_time), end_time = COALESCE(?, end_time), updated_at = ? WHERE id = ?;',
      [newDate, startTime || null, endTime || null, now, id]
    );
  }

  static toggleComplete(id: string, actualMinutes?: number): boolean {
    const db = getDatabase();
    const current = db.getFirstSync<Task>('SELECT is_completed, estimated_minutes FROM tasks WHERE id = ?;', [id]);
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    const completedAt = newCompleted === 1 ? new Date().toISOString() : null;
    const now = new Date().toISOString();
    const recordedActual = newCompleted === 1 ? (actualMinutes || current.estimated_minutes) : null;

    db.runSync(
      'UPDATE tasks SET is_completed = ?, completed_at = ?, actual_minutes = COALESCE(?, actual_minutes), updated_at = ? WHERE id = ?;',
      [newCompleted, completedAt, recordedActual, now, id]
    );
    return newCompleted === 1;
  }

  static delete(id: string): void {
    const db = getDatabase();
    db.runSync('UPDATE tasks SET deleted_at = ? WHERE id = ?;', [new Date().toISOString(), id]);
  }

  static getCurrentTask(date: string): Task | null {
    const db = getDatabase();
    const task = db.getFirstSync<Task>(
      `SELECT t.*, g.title as goal_title 
       FROM tasks t 
       LEFT JOIN goals g ON t.goal_id = g.id 
       WHERE t.date = ? AND t.is_completed = 0 AND t.deleted_at IS NULL
       ORDER BY t.is_priority DESC, t.start_time ASC, t.created_at ASC
       LIMIT 1;`,
      [date]
    );
    return task || null;
  }

  static getOverdueTasks(date: string): Task[] {
    const db = getDatabase();
    return db.getAllSync<Task>(
      `SELECT t.*, g.title as goal_title 
       FROM tasks t 
       LEFT JOIN goals g ON t.goal_id = g.id 
       WHERE t.date < ? AND t.is_completed = 0 AND t.deleted_at IS NULL
       ORDER BY t.date DESC, t.is_priority DESC
       LIMIT 5;`,
      [date]
    );
  }

  static getTimelineTasks(date: string): Task[] {
    const db = getDatabase();
    return db.getAllSync<Task>(
      `SELECT t.*, g.title as goal_title 
       FROM tasks t 
       LEFT JOIN goals g ON t.goal_id = g.id 
       WHERE t.date = ? AND t.deleted_at IS NULL 
       ORDER BY CASE WHEN t.start_time IS NULL THEN 1 ELSE 0 END, t.start_time ASC, t.created_at ASC;`,
      [date]
    );
  }
}
