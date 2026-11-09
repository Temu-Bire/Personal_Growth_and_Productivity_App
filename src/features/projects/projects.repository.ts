import { getDatabase } from '../../db/client';
import { generateId } from '../../utils/id';

export type ProjectStatus = 'active' | 'paused' | 'archived';
export type CheckInRhythm = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  category: string;
  status: ProjectStatus;
  check_in_rhythm: CheckInRhythm;
  last_check_in?: string | null;
  created_at: string;
  updated_at: string;
  // Computed
  openTasksCount: number;
  doneTasksCount: number;
  isCheckInDue: boolean;
}

export interface CreateProjectDTO {
  name: string;
  description?: string | null;
  category?: string;
  category_id?: string | null;
  status?: ProjectStatus;
  check_in_rhythm?: CheckInRhythm;
}

export class ProjectsRepository {
  static getAll(status?: ProjectStatus): Project[] {
    const db = getDatabase();
    let query = 'SELECT * FROM projects WHERE deleted_at IS NULL';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC;';

    const rows = db.getAllSync<any>(query, params);

    return rows.map((p) => {
      // Calculate tasks for this project
      const taskRows = db.getAllSync<{ is_completed: number }>(
        'SELECT is_completed FROM tasks WHERE project_id = ? AND deleted_at IS NULL;',
        [p.id]
      );
      const openTasks = taskRows.filter((t) => t.is_completed === 0).length;
      const doneTasks = taskRows.filter((t) => t.is_completed === 1).length;

      // Check-in rhythm due calculation
      let isCheckInDue = false;
      if (p.status === 'active' && p.check_in_rhythm && p.check_in_rhythm !== 'none') {
        if (!p.last_check_in) {
          isCheckInDue = true;
        } else {
          const lastDate = new Date(p.last_check_in).getTime();
          const now = Date.now();
          const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);
          if (p.check_in_rhythm === 'daily' && diffDays >= 1) isCheckInDue = true;
          if (p.check_in_rhythm === 'weekly' && diffDays >= 7) isCheckInDue = true;
          if (p.check_in_rhythm === 'monthly' && diffDays >= 30) isCheckInDue = true;
        }
      }

      return {
        id: p.id,
        name: p.name || p.title || 'Untitled Project',
        description: p.description,
        category_id: p.category_id,
        category: p.category || 'General',
        status: (p.status as ProjectStatus) || 'active',
        check_in_rhythm: (p.check_in_rhythm as CheckInRhythm) || 'none',
        last_check_in: p.last_check_in,
        created_at: p.created_at,
        updated_at: p.updated_at,
        openTasksCount: openTasks,
        doneTasksCount: doneTasks,
        isCheckInDue,
      };
    });
  }

  static getActiveProject(): (Project & { latestNote?: string }) | null {
    const list = this.getAll('active');
    return list.length > 0 ? list[0] : null;
  }

  static create(dto: CreateProjectDTO): Project {
    const db = getDatabase();
    const id = generateId('proj');
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO projects (
        id, name, description, category, category_id, status, check_in_rhythm, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        dto.name.trim(),
        dto.description?.trim() || null,
        dto.category || 'General',
        dto.category_id || null,
        dto.status || 'active',
        dto.check_in_rhythm || 'none',
        now,
        now,
      ]
    );

    return this.getAll().find((p) => p.id === id)!;
  }

  static update(id: string, dto: Partial<CreateProjectDTO>): void {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.runSync(
      `UPDATE projects SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        status = COALESCE(?, status),
        check_in_rhythm = COALESCE(?, check_in_rhythm),
        updated_at = ?
       WHERE id = ?;`,
      [
        dto.name ? dto.name.trim() : null,
        dto.description !== undefined ? dto.description : null,
        dto.category || null,
        dto.status || null,
        dto.check_in_rhythm || null,
        now,
        id,
      ]
    );
  }

  static checkIn(id: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.runSync('UPDATE projects SET last_check_in = ?, updated_at = ? WHERE id = ?;', [now, now, id]);
  }

  static delete(id: string): void {
    const db = getDatabase();
    db.runSync('UPDATE projects SET deleted_at = ? WHERE id = ?;', [new Date().toISOString(), id]);
  }
}
