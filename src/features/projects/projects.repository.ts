import { getDatabase, getDatabaseAsync } from '../../db/client';
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
  // Sync
  static getAllWithProgress(): Project[] {
    const db = getDatabase();
    const projects = db.getAllSync<Project>('SELECT * FROM projects ORDER BY due_date ASC;');

    return projects.map((p) => {
      const tasks = db.getAllSync<ProjectTask>(
        'SELECT is_completed FROM project_tasks WHERE project_id = ?;',
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

  // Async
  static async getAllWithProgressAsync(): Promise<Project[]> {
    const db = await getDatabaseAsync();
    const projects = await db.getAllAsync<Project>('SELECT * FROM projects ORDER BY due_date ASC;');

    const results: Project[] = [];
    for (const p of projects) {
      const tasks = await db.getAllAsync<ProjectTask>(
        'SELECT is_completed FROM project_tasks WHERE project_id = ?;',
        [p.id]
      );
      const total = tasks.length;
      const completed = tasks.filter((t) => t.is_completed === 1).length;
      const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

      results.push({
        ...p,
        tasksCount: total,
        completedTasksCount: completed,
        progressPercent,
      });
    }

    return results;
  }

  // Sync
  static getProjectTasks(projectId: string): ProjectTask[] {
    const db = getDatabase();
    return db.getAllSync<ProjectTask>(
      'SELECT * FROM project_tasks WHERE project_id = ? ORDER BY created_at ASC;',
      [projectId]
    );
  }

  // Async
  static async getProjectTasksAsync(projectId: string): Promise<ProjectTask[]> {
    const db = await getDatabaseAsync();
    return db.getAllAsync<ProjectTask>(
      'SELECT * FROM project_tasks WHERE project_id = ? ORDER BY created_at ASC;',
      [projectId]
    );
  }

  // Sync
  static toggleProjectTask(taskId: string): boolean {
    const db = getDatabase();
    const current = db.getFirstSync<ProjectTask>('SELECT is_completed FROM project_tasks WHERE id = ?;', [taskId]);
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    db.runSync('UPDATE project_tasks SET is_completed = ? WHERE id = ?;', [newCompleted, taskId]);
    return newCompleted === 1;
  }

  // Async
  static async toggleProjectTaskAsync(taskId: string): Promise<boolean> {
    const db = await getDatabaseAsync();
    const current = await db.getFirstAsync<ProjectTask>('SELECT is_completed FROM project_tasks WHERE id = ?;', [taskId]);
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    await db.runAsync('UPDATE project_tasks SET is_completed = ? WHERE id = ?;', [newCompleted, taskId]);
    return newCompleted === 1;
  }

  // Sync
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
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [id, project.title, project.dueDate, project.status || 'in_progress', project.color || '#1E8E4E', now, now]
    );

    if (project.initialTasks) {
      project.initialTasks.forEach((t) => {
        if (t.trim()) {
          db.runSync(
            'INSERT INTO project_tasks (id, project_id, title, is_completed, created_at) VALUES (?, ?, ?, 0, ?);',
            [generateId('ptask'), id, t.trim(), now]
          );
        }
      });
    }

    return db.getFirstSync<Project>('SELECT * FROM projects WHERE id = ?;', [id])!;
  }

  // Async with transaction
  static async createAsync(project: {
    title: string;
    dueDate: string;
    color?: string;
    status?: string;
    initialTasks?: string[];
  }): Promise<Project> {
    const db = await getDatabaseAsync();
    const id = generateId('prj');
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO projects (id, title, due_date, status, color, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [id, project.title, project.dueDate, project.status || 'in_progress', project.color || '#1E8E4E', now, now]
      );

      if (project.initialTasks) {
        for (const t of project.initialTasks) {
          if (t.trim()) {
            await db.runAsync(
              'INSERT INTO project_tasks (id, project_id, title, is_completed, created_at) VALUES (?, ?, ?, 0, ?);',
              [generateId('ptask'), id, t.trim(), now]
            );
          }
        }
      }
    });

    const created = await db.getFirstAsync<Project>('SELECT * FROM projects WHERE id = ?;', [id]);
    return created!;
  }
}
