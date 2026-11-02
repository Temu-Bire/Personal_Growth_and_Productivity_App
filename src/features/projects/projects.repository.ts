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

  // Update Project
  static update(
    id: string,
    data: {
      title?: string;
      dueDate?: string;
      color?: string;
      status?: 'planning' | 'in_progress' | 'completed' | 'on_hold';
    }
  ): Project | null {
    const db = getDatabase();
    const existing = db.getFirstSync<Project>('SELECT * FROM projects WHERE id = ?;', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const title = data.title !== undefined ? data.title.trim() : existing.title;
    const dueDate = data.dueDate !== undefined ? data.dueDate : existing.due_date;
    const color = data.color !== undefined ? data.color : existing.color;
    const status = data.status !== undefined ? data.status : existing.status;

    db.runSync(
      'UPDATE projects SET title = ?, due_date = ?, color = ?, status = ?, updated_at = ? WHERE id = ?;',
      [title, dueDate, color, status, now, id]
    );

    return db.getFirstSync<Project>('SELECT * FROM projects WHERE id = ?;', [id]);
  }

  static async updateAsync(
    id: string,
    data: {
      title?: string;
      dueDate?: string;
      color?: string;
      status?: 'planning' | 'in_progress' | 'completed' | 'on_hold';
    }
  ): Promise<Project | null> {
    const db = await getDatabaseAsync();
    const existing = await db.getFirstAsync<Project>('SELECT * FROM projects WHERE id = ?;', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const title = data.title !== undefined ? data.title.trim() : existing.title;
    const dueDate = data.dueDate !== undefined ? data.dueDate : existing.due_date;
    const color = data.color !== undefined ? data.color : existing.color;
    const status = data.status !== undefined ? data.status : existing.status;

    await db.runAsync(
      'UPDATE projects SET title = ?, due_date = ?, color = ?, status = ?, updated_at = ? WHERE id = ?;',
      [title, dueDate, color, status, now, id]
    );

    return db.getFirstAsync<Project>('SELECT * FROM projects WHERE id = ?;', [id]);
  }

  // Delete Project with tasks
  static delete(id: string): boolean {
    const db = getDatabase();
    db.withTransactionSync(() => {
      db.runSync('DELETE FROM project_tasks WHERE project_id = ?;', [id]);
      db.runSync('DELETE FROM projects WHERE id = ?;', [id]);
    });
    return true;
  }

  static async deleteAsync(id: string): Promise<boolean> {
    const db = await getDatabaseAsync();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM project_tasks WHERE project_id = ?;', [id]);
      await db.runAsync('DELETE FROM projects WHERE id = ?;', [id]);
    });
    return true;
  }

  static addProjectTask(projectId: string, title: string): ProjectTask {
    const db = getDatabase();
    const id = generateId('ptask');
    const now = new Date().toISOString();
    db.runSync(
      'INSERT INTO project_tasks (id, project_id, title, is_completed, created_at) VALUES (?, ?, ?, 0, ?);',
      [id, projectId, title.trim(), now]
    );
    return db.getFirstSync<ProjectTask>('SELECT * FROM project_tasks WHERE id = ?;', [id])!;
  }

  static deleteProjectTask(taskId: string): boolean {
    const db = getDatabase();
    db.runSync('DELETE FROM project_tasks WHERE id = ?;', [taskId]);
    return true;
  }

  // Get active project with latest notes/tasks for dashboard
  static getActiveProject(): (Project & { latestNote?: string }) | null {
    const list = this.getAllWithProgress();
    const active = list.find((p) => p.status !== 'completed') || list[0] || null;
    if (!active) return null;

    const tasks = this.getProjectTasks(active.id);
    const latestTask = tasks.find((t) => t.is_completed === 0) || tasks[tasks.length - 1];

    return {
      ...active,
      latestNote: latestTask ? latestTask.title : 'All milestones on track',
    };
  }

  static async getActiveProjectAsync(): Promise<(Project & { latestNote?: string }) | null> {
    const list = await this.getAllWithProgressAsync();
    const active = list.find((p) => p.status !== 'completed') || list[0] || null;
    if (!active) return null;

    const tasks = await this.getProjectTasksAsync(active.id);
    const latestTask = tasks.find((t) => t.is_completed === 0) || tasks[tasks.length - 1];

    return {
      ...active,
      latestNote: latestTask ? latestTask.title : 'All milestones on track',
    };
  }
}
