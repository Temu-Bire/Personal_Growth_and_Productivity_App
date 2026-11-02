import { getDatabase } from '../../db/client';
import { generateId } from '../../utils/id';

export interface Goal {
  id: string;
  title: string;
  due_date: string;
  category: string;
  target_value: number;
  unit: string;
  is_completed: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Computed
  milestonesCount?: number;
  completedMilestonesCount?: number;
  progressPercent?: number;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  is_completed: number;
  created_at: string;
}

export class GoalsRepository {
  static getAllWithProgress(completedFilter = 0): Goal[] {
    const db = getDatabase();
    const goals = db.getAllSync<Goal>(
      'SELECT * FROM goals WHERE is_completed = ? ORDER BY due_date ASC',
      [completedFilter]
    );

    return goals.map((g) => {
      const milestones = db.getAllSync<GoalMilestone>(
        'SELECT is_completed FROM goal_milestones WHERE goal_id = ?',
        [g.id]
      );
      const total = milestones.length;
      const completed = milestones.filter((m) => m.is_completed === 1).length;
      const progressPercent = total === 0 ? (g.is_completed === 1 ? 100 : 0) : Math.round((completed / total) * 100);

      return {
        ...g,
        milestonesCount: total,
        completedMilestonesCount: completed,
        progressPercent,
      };
    });
  }

  static getMilestones(goalId: string): GoalMilestone[] {
    const db = getDatabase();
    return db.getAllSync<GoalMilestone>(
      'SELECT * FROM goal_milestones WHERE goal_id = ? ORDER BY created_at ASC',
      [goalId]
    );
  }

  static toggleMilestone(milestoneId: string): boolean {
    const db = getDatabase();
    const current = db.getFirstSync<GoalMilestone>(
      'SELECT goal_id, is_completed FROM goal_milestones WHERE id = ?',
      [milestoneId]
    );
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    db.runSync('UPDATE goal_milestones SET is_completed = ? WHERE id = ?', [newCompleted, milestoneId]);

    // Update parent goal completion status if all milestones complete
    const allMilestones = db.getAllSync<GoalMilestone>(
      'SELECT is_completed FROM goal_milestones WHERE goal_id = ?',
      [current.goal_id]
    );
    const allDone = allMilestones.length > 0 && allMilestones.every((m) => m.is_completed === 1);
    db.runSync('UPDATE goals SET is_completed = ?, completed_at = ? WHERE id = ?', [
      allDone ? 1 : 0,
      allDone ? new Date().toISOString() : null,
      current.goal_id,
    ]);

    return newCompleted === 1;
  }

  static createGoal(goal: {
    title: string;
    dueDate: string;
    category?: string;
    milestones?: string[];
  }): Goal {
    const db = getDatabase();
    const id = generateId('goal');
    const now = new Date().toISOString();

    db.runSync(
      'INSERT INTO goals (id, title, due_date, category, is_completed, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?)',
      [id, goal.title, goal.dueDate, goal.category || 'General', now, now]
    );

    if (goal.milestones) {
      goal.milestones.forEach((m) => {
        if (m.trim()) {
          db.runSync(
            'INSERT INTO goal_milestones (id, goal_id, title, is_completed, created_at) VALUES (?, ?, ?, 0, ?)',
            [generateId('gmil'), id, m.trim(), now]
          );
        }
      });
    }

    return db.getFirstSync<Goal>('SELECT * FROM goals WHERE id = ?', [id])!;
  }

  static markComplete(goalId: string): void {
    const db = getDatabase();
    db.runSync('UPDATE goals SET is_completed = 1, completed_at = ? WHERE id = ?', [
      new Date().toISOString(),
      goalId,
    ]);
  }
}

