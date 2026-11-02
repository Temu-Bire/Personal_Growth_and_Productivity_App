import { getDatabase } from '../../db/client';
import { generateId } from '../../utils/id';

export interface Project {
  id: string;
  title: string;
  due_date: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  color: string;
  created_at: string;
  updated_at: string;
  // Computed
  tasksCount?: number;
  completedTasksCount?: number;
  progressPercent?: number;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  is_completed: number;
  created_at: string;
}

export class ProjectsRepository {
  static getAllWithProgress(): Project[] {
    const db = getDatabase();
    const projects = db.getAllSync<Project>('SELECT * FROM projects ORDER BY due_date ASC');

    return projects.map((p) => {
      const tasks = db.getAllSync<ProjectTask>(
        'SELECT is_completed FROM project_tasks WHERE project_id = ?',
        [p.id]
      );
      const total = tasks.length;
      const completed = tasks.filter((t) => t.is_completed === 1).length;
      const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

      return {
        ...p,
        tasksCount: total,
        completedTasksCount: completed,
        progressPercent,
      };
    });
  }

  static getProjectTasks(projectId: string): ProjectTask[] {
    const db = getDatabase();
    return db.getAllSync<ProjectTask>(
      'SELECT * FROM project_tasks WHERE project_id = ? ORDER BY created_at ASC',
      [projectId]
    );
  }

  static toggleProjectTask(taskId: string): boolean {
    const db = getDatabase();
    const current = db.getFirstSync<ProjectTask>('SELECT is_completed FROM project_tasks WHERE id = ?', [taskId]);
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    db.runSync('UPDATE project_tasks SET is_completed = ? WHERE id = ?', [newCompleted, taskId]);
    return newCompleted === 1;
  }

  static create(project: {
    title: string;
    dueDate: string;
    color?: string;
    status?: string;
    initialTasks?: string[];
  }): Project {
    const db = getDatabase();
    const id = generateId('prj');
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO projects (id, title, due_date, status, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, project.title, project.dueDate, project.status || 'in_progress', project.color || '#1E8E4E', now, now]
    );

    if (project.initialTasks) {
      project.initialTasks.forEach((t) => {
        if (t.trim()) {
          db.runSync(
            'INSERT INTO project_tasks (id, project_id, title, is_completed, created_at) VALUES (?, ?, ?, 0, ?)',
            [generateId('ptask'), id, t.trim(), now]
          );
        }
      });
    }

    return db.getFirstSync<Project>('SELECT * FROM projects WHERE id = ?', [id])!;
  }

  static addSubtask(projectId: string, title: string): ProjectTask {
    const db = getDatabase();
    const id = generateId('ptask');
    const now = new Date().toISOString();

    db.runSync(
      'INSERT INTO project_tasks (id, project_id, title, is_completed, created_at) VALUES (?, ?, ?, 0, ?)',
      [id, projectId, title, now]
    );

    return db.getFirstSync<ProjectTask>('SELECT * FROM project_tasks WHERE id = ?', [id])!;
  }
}
