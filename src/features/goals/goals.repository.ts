import { getDatabase, getDatabaseAsync } from '../../db/client';
import { generateId } from '../../utils/id';

export type GoalTermType = 'short_term' | 'long_term';
export type GoalPriority = 'high' | 'medium' | 'low';
export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  category: string;
  term_type: GoalTermType;
  priority: GoalPriority;
  status: GoalStatus;
  due_date: string;
  target_date: string;
  progress_percent: number;
  target_value?: number;
  unit?: string;
  is_completed: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Computed properties
  milestonesCount?: number;
  completedMilestonesCount?: number;
  tasksCount?: number;
  completedTasksCount?: number;
  progressPercent?: number;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  due_date?: string | null;
  is_completed: number;
  completed_at?: string | null;
  order_index: number;
  created_at: string;
}

export class GoalsRepository {
  static getAllWithProgress(options?: {
    status?: GoalStatus;
    termType?: GoalTermType;
    category?: string;
  }): Goal[] {
    const db = getDatabase();
    let query = 'SELECT * FROM goals WHERE 1=1';
    const params: any[] = [];

    if (options?.status) {
      query += ' AND status = ?';
      params.push(options.status);
    } else {
      // By default exclude archived
      query += " AND status != 'archived'";
    }

    if (options?.termType) {
      query += ' AND term_type = ?';
      params.push(options.termType);
    }

    if (options?.category && options.category !== 'All') {
      query += ' AND category = ?';
      params.push(options.category);
    }

    query += ' ORDER BY due_date ASC, created_at DESC';

    const goals = db.getAllSync<Goal>(query, params);

    return goals.map((g) => this.enrichGoal(g));
  }

  static enrichGoal(g: Goal): Goal {
    const db = getDatabase();
    const milestones = db.getAllSync<Milestone>(
      'SELECT is_completed FROM milestones WHERE goal_id = ?',
      [g.id]
    );
    const tasks = db.getAllSync<{ is_completed: number }>(
      'SELECT is_completed FROM tasks WHERE goal_id = ?',
      [g.id]
    );

    const mTotal = milestones.length;
    const mCompleted = milestones.filter((m) => m.is_completed === 1).length;
    const tTotal = tasks.length;
    const tCompleted = tasks.filter((t) => t.is_completed === 1).length;

    const totalItems = mTotal + tTotal;
    const completedItems = mCompleted + tCompleted;

    const progressPercent = totalItems > 0
      ? Math.round((completedItems / totalItems) * 100)
      : (g.status === 'completed' || g.is_completed === 1 ? 100 : g.progress_percent || 0);

    return {
      ...g,
      term_type: (g.term_type as GoalTermType) || 'short_term',
      priority: (g.priority as GoalPriority) || 'medium',
      status: (g.status as GoalStatus) || (g.is_completed === 1 ? 'completed' : 'active'),
      target_date: g.target_date || g.due_date,
      milestonesCount: mTotal,
      completedMilestonesCount: mCompleted,
      tasksCount: tTotal,
      completedTasksCount: tCompleted,
      progressPercent,
    };
  }

  static getGoalById(goalId: string): Goal | null {
    const db = getDatabase();
    const g = db.getFirstSync<Goal>('SELECT * FROM goals WHERE id = ?', [goalId]);
    return g ? this.enrichGoal(g) : null;
  }

  static getMilestones(goalId: string): Milestone[] {
    const db = getDatabase();
    return db.getAllSync<Milestone>(
      'SELECT * FROM milestones WHERE goal_id = ? ORDER BY order_index ASC, created_at ASC',
      [goalId]
    );
  }

  static addMilestone(goalId: string, title: string, dueDate?: string): Milestone {
    const db = getDatabase();
    const id = generateId('ms');
    const now = new Date().toISOString();
    const count = db.getFirstSync<{ c: number }>('SELECT count(*) as c FROM milestones WHERE goal_id = ?', [goalId]);
    const orderIndex = count?.c || 0;

    db.runSync(
      'INSERT INTO milestones (id, goal_id, title, due_date, is_completed, order_index, created_at) VALUES (?, ?, ?, ?, 0, ?, ?)',
      [id, goalId, title.trim(), dueDate || null, orderIndex, now]
    );

    this.recalculateGoalProgress(goalId);
    return db.getFirstSync<Milestone>('SELECT * FROM milestones WHERE id = ?', [id])!;
  }

  static toggleMilestone(milestoneId: string): boolean {
    const db = getDatabase();
    const current = db.getFirstSync<Milestone>('SELECT * FROM milestones WHERE id = ?', [milestoneId]);
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    const completedAt = newCompleted === 1 ? new Date().toISOString() : null;

    db.runSync(
      'UPDATE milestones SET is_completed = ?, completed_at = ? WHERE id = ?',
      [newCompleted, completedAt, milestoneId]
    );

    this.recalculateGoalProgress(current.goal_id);
    return newCompleted === 1;
  }

  static deleteMilestone(milestoneId: string): void {
    const db = getDatabase();
    const current = db.getFirstSync<Milestone>('SELECT goal_id FROM milestones WHERE id = ?', [milestoneId]);
    if (current) {
      db.runSync('DELETE FROM milestones WHERE id = ?', [milestoneId]);
      this.recalculateGoalProgress(current.goal_id);
    }
  }

  static recalculateGoalProgress(goalId: string): void {
    const db = getDatabase();
    const milestones = db.getAllSync<Milestone>(
      'SELECT is_completed FROM milestones WHERE goal_id = ?',
      [goalId]
    );
    const tasks = db.getAllSync<{ is_completed: number }>(
      'SELECT is_completed FROM tasks WHERE goal_id = ?',
      [goalId]
    );

    const mTotal = milestones.length;
    const mCompleted = milestones.filter((m) => m.is_completed === 1).length;
    const tTotal = tasks.length;
    const tCompleted = tasks.filter((t) => t.is_completed === 1).length;
    const total = mTotal + tTotal;
    const completed = mCompleted + tCompleted;

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isAllDone = total > 0 && completed === total;
    const now = new Date().toISOString();

    db.runSync(
      `UPDATE goals SET 
        progress_percent = ?, 
        is_completed = ?, 
        status = CASE WHEN ? = 1 THEN 'completed' ELSE CASE WHEN status = 'completed' THEN 'active' ELSE status END END,
        completed_at = CASE WHEN ? = 1 THEN ? ELSE NULL END,
        updated_at = ?
       WHERE id = ?`,
      [progress, isAllDone ? 1 : 0, isAllDone ? 1 : 0, isAllDone ? 1 : 0, now, now, goalId]
    );
  }

  static createGoal(data: {
    title: string;
    description?: string;
    dueDate: string;
    category?: string;
    termType?: GoalTermType;
    priority?: GoalPriority;
    milestones?: string[];
  }): Goal {
    const db = getDatabase();
    const id = generateId('goal');
    const now = new Date().toISOString();
    const termType = data.termType || 'short_term';
    const priority = data.priority || 'medium';
    const category = data.category || 'General';

    db.runSync(
      `INSERT INTO goals (
        id, title, description, due_date, target_date, category, term_type, priority, status, progress_percent, is_completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, 0, ?, ?)`,
      [id, data.title.trim(), data.description || '', data.dueDate, data.dueDate, category, termType, priority, now, now]
    );

    if (data.milestones && data.milestones.length > 0) {
      data.milestones.forEach((m, idx) => {
        if (m.trim()) {
          db.runSync(
            'INSERT INTO milestones (id, goal_id, title, is_completed, order_index, created_at) VALUES (?, ?, ?, 0, ?, ?)',
            [generateId('ms'), id, m.trim(), idx, now]
          );
        }
      });
      this.recalculateGoalProgress(id);
    }

    return this.getGoalById(id)!;
  }

  static updateGoal(
    goalId: string,
    data: {
      title?: string;
      description?: string;
      dueDate?: string;
      category?: string;
      termType?: GoalTermType;
      priority?: GoalPriority;
      status?: GoalStatus;
    }
  ): Goal | null {
    const db = getDatabase();
    const existing = db.getFirstSync<Goal>('SELECT * FROM goals WHERE id = ?', [goalId]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const title = data.title !== undefined ? data.title.trim() : existing.title;
    const description = data.description !== undefined ? data.description : existing.description;
    const dueDate = data.dueDate !== undefined ? data.dueDate : existing.due_date;
    const category = data.category !== undefined ? data.category : existing.category;
    const termType = data.termType !== undefined ? data.termType : existing.term_type;
    const priority = data.priority !== undefined ? data.priority : existing.priority;
    const status = data.status !== undefined ? data.status : existing.status;
    const isCompleted = status === 'completed' ? 1 : (existing.is_completed || 0);

    db.runSync(
      `UPDATE goals SET 
        title = ?, description = ?, due_date = ?, target_date = ?, category = ?, term_type = ?, priority = ?, status = ?, is_completed = ?, updated_at = ?
       WHERE id = ?`,
      [title, description ?? null, dueDate, dueDate, category, termType, priority, status, isCompleted, now, goalId]
    );

    return this.getGoalById(goalId);
  }

  static setGoalStatus(goalId: string, status: GoalStatus): Goal | null {
    const db = getDatabase();
    const now = new Date().toISOString();
    const isCompleted = status === 'completed' ? 1 : 0;
    const completedAt = status === 'completed' ? now : null;

    db.runSync(
      'UPDATE goals SET status = ?, is_completed = ?, completed_at = ?, updated_at = ? WHERE id = ?',
      [status, isCompleted, completedAt, now, goalId]
    );

    return this.getGoalById(goalId);
  }

  static deleteGoal(goalId: string): boolean {
    const db = getDatabase();
    db.withTransactionSync(() => {
      db.runSync('DELETE FROM milestones WHERE goal_id = ?', [goalId]);
      db.runSync('UPDATE tasks SET goal_id = NULL WHERE goal_id = ?', [goalId]);
      db.runSync('DELETE FROM goals WHERE id = ?', [goalId]);
    });
    return true;
  }

  static getActiveGoal(): Goal | null {
    const goals = this.getAllWithProgress({ status: 'active' });
    return goals.length > 0 ? goals[0] : null;
  }

  static getGoalStats(): {
    total: number;
    active: number;
    completed: number;
    completionRate: number;
  } {
    const db = getDatabase();
    const rows = db.getAllSync<{ status: string }>('SELECT status FROM goals WHERE status != "archived"');
    const total = rows.length;
    const active = rows.filter((r) => r.status === 'active').length;
    const completed = rows.filter((r) => r.status === 'completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, active, completed, completionRate };
  }
}
