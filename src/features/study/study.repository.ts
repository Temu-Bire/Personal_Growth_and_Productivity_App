import { getDatabase, getDatabaseAsync } from '../../db/client';
import { generateId } from '../../utils/id';

export interface Subject {
  id: string;
  name: string;
  color: string;
  target_hours: number;
  created_at: string;
  updated_at: string;
  // Computed
  topicsCount?: number;
  completedTopicsCount?: number;
  progressPercent?: number;
}

export interface StudyTopic {
  id: string;
  subject_id: string;
  title: string;
  is_completed: number;
  completed_at: string | null;
  order_index: number;
  created_at: string;
}

export interface StudyScheduleSession {
  id: string;
  subject_id: string;
  subject_name?: string;
  subject_color?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export class StudyRepository {
  // Sync
  static getSubjectsWithProgress(): Subject[] {
    const db = getDatabase();
    const subjects = db.getAllSync<Subject>('SELECT * FROM subjects ORDER BY created_at ASC;');

    return subjects.map((subj) => {
      const topics = db.getAllSync<StudyTopic>(
        'SELECT is_completed FROM study_topics WHERE subject_id = ?;',
        [subj.id]
      );
      const total = topics.length;
      const completed = topics.filter((t) => t.is_completed === 1).length;
      const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

      return {
        ...subj,
        topicsCount: total,
        completedTopicsCount: completed,
        progressPercent,
      };
    });
  }

  // Async
  static async getSubjectsWithProgressAsync(): Promise<Subject[]> {
    const db = await getDatabaseAsync();
    const subjects = await db.getAllAsync<Subject>('SELECT * FROM subjects ORDER BY created_at ASC;');

    const results: Subject[] = [];
    for (const subj of subjects) {
      const topics = await db.getAllAsync<StudyTopic>(
        'SELECT is_completed FROM study_topics WHERE subject_id = ?;',
        [subj.id]
      );
      const total = topics.length;
      const completed = topics.filter((t) => t.is_completed === 1).length;
      const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

      results.push({
        ...subj,
        topicsCount: total,
        completedTopicsCount: completed,
        progressPercent,
      });
    }

    return results;
  }

  // Sync
  static getTopics(subjectId: string): StudyTopic[] {
    const db = getDatabase();
    return db.getAllSync<StudyTopic>(
      'SELECT * FROM study_topics WHERE subject_id = ? ORDER BY order_index ASC, created_at ASC;',
      [subjectId]
    );
  }

  // Async
  static async getTopicsAsync(subjectId: string): Promise<StudyTopic[]> {
    const db = await getDatabaseAsync();
    return db.getAllAsync<StudyTopic>(
      'SELECT * FROM study_topics WHERE subject_id = ? ORDER BY order_index ASC, created_at ASC;',
      [subjectId]
    );
  }

  // Sync
  static toggleTopic(topicId: string): boolean {
    const db = getDatabase();
    const current = db.getFirstSync<StudyTopic>('SELECT is_completed FROM study_topics WHERE id = ?;', [topicId]);
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    const completedAt = newCompleted === 1 ? new Date().toISOString() : null;

    db.runSync('UPDATE study_topics SET is_completed = ?, completed_at = ? WHERE id = ?;', [
      newCompleted,
      completedAt,
      topicId,
    ]);
    return newCompleted === 1;
  }

  // Async
  static async toggleTopicAsync(topicId: string): Promise<boolean> {
    const db = await getDatabaseAsync();
    const current = await db.getFirstAsync<StudyTopic>('SELECT is_completed FROM study_topics WHERE id = ?;', [topicId]);
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    const completedAt = newCompleted === 1 ? new Date().toISOString() : null;

    await db.runAsync('UPDATE study_topics SET is_completed = ?, completed_at = ? WHERE id = ?;', [
      newCompleted,
      completedAt,
      topicId,
    ]);
    return newCompleted === 1;
  }

  // Sync
  static createSubject(name: string, color = '#1E8E4E', initialTopics: string[] = []): Subject {
    const db = getDatabase();
    const id = generateId('subj');
    const now = new Date().toISOString();

    db.runSync('INSERT INTO subjects (id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?);', [
      id,
      name,
      color,
      now,
      now,
    ]);

    initialTopics.forEach((t, idx) => {
      if (t.trim()) {
        db.runSync(
          'INSERT INTO study_topics (id, subject_id, title, is_completed, order_index, created_at) VALUES (?, ?, ?, 0, ?, ?);',
          [generateId('stopic'), id, t.trim(), idx, now]
        );
      }
    });

    return db.getFirstSync<Subject>('SELECT * FROM subjects WHERE id = ?;', [id])!;
  }

  // Async with transaction
  static async createSubjectAsync(name: string, color = '#1E8E4E', initialTopics: string[] = []): Promise<Subject> {
    const db = await getDatabaseAsync();
    const id = generateId('subj');
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      await db.runAsync('INSERT INTO subjects (id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?);', [
        id,
        name,
        color,
        now,
        now,
      ]);

      for (let idx = 0; idx < initialTopics.length; idx++) {
        const t = initialTopics[idx];
        if (t.trim()) {
          await db.runAsync(
            'INSERT INTO study_topics (id, subject_id, title, is_completed, order_index, created_at) VALUES (?, ?, ?, 0, ?, ?);',
            [generateId('stopic'), id, t.trim(), idx, now]
          );
        }
      }
    });

    const created = await db.getFirstAsync<Subject>('SELECT * FROM subjects WHERE id = ?;', [id]);
    return created!;
  }

  // Update Subject
  static updateSubject(id: string, name: string, color?: string): Subject | null {
    const db = getDatabase();
    const existing = db.getFirstSync<Subject>('SELECT * FROM subjects WHERE id = ?;', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const newName = name.trim();
    const newColor = color || existing.color;

    db.runSync('UPDATE subjects SET name = ?, color = ?, updated_at = ? WHERE id = ?;', [
      newName,
      newColor,
      now,
      id,
    ]);

    return db.getFirstSync<Subject>('SELECT * FROM subjects WHERE id = ?;', [id]);
  }

  static async updateSubjectAsync(id: string, name: string, color?: string): Promise<Subject | null> {
    const db = await getDatabaseAsync();
    const existing = await db.getFirstAsync<Subject>('SELECT * FROM subjects WHERE id = ?;', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const newName = name.trim();
    const newColor = color || existing.color;

    await db.runAsync('UPDATE subjects SET name = ?, color = ?, updated_at = ? WHERE id = ?;', [
      newName,
      newColor,
      now,
      id,
    ]);

    return db.getFirstAsync<Subject>('SELECT * FROM subjects WHERE id = ?;', [id]);
  }

  // Delete Subject (with child topics and sessions in transaction)
  static deleteSubject(id: string): boolean {
    const db = getDatabase();
    db.withTransactionSync(() => {
      db.runSync('DELETE FROM study_sessions WHERE subject_id = ?;', [id]);
      db.runSync('DELETE FROM study_topics WHERE subject_id = ?;', [id]);
      db.runSync('DELETE FROM subjects WHERE id = ?;', [id]);
    });
    return true;
  }

  static async deleteSubjectAsync(id: string): Promise<boolean> {
    const db = await getDatabaseAsync();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM study_sessions WHERE subject_id = ?;', [id]);
      await db.runAsync('DELETE FROM study_topics WHERE subject_id = ?;', [id]);
      await db.runAsync('DELETE FROM subjects WHERE id = ?;', [id]);
    });
    return true;
  }

  // Study Schedule Session CRUD
  static updateSession(
    sessionId: string,
    data: { startTime?: string; endTime?: string; dayOfWeek?: number }
  ): boolean {
    const db = getDatabase();
    const existing = db.getFirstSync<StudyScheduleSession>('SELECT * FROM study_sessions WHERE id = ?;', [sessionId]);
    if (!existing) return false;

    const start = data.startTime || existing.start_time;
    const end = data.endTime || existing.end_time;
    const day = data.dayOfWeek !== undefined ? data.dayOfWeek : existing.day_of_week;

    db.runSync('UPDATE study_sessions SET start_time = ?, end_time = ?, day_of_week = ? WHERE id = ?;', [
      start,
      end,
      day,
      sessionId,
    ]);
    return true;
  }

  static deleteSession(sessionId: string): boolean {
    const db = getDatabase();
    db.runSync('DELETE FROM study_sessions WHERE id = ?;', [sessionId]);
    return true;
  }

  // Topics CRUD
  static addTopic(subjectId: string, title: string): StudyTopic {
    const db = getDatabase();
    const id = generateId('stopic');
    const now = new Date().toISOString();
    db.runSync(
      'INSERT INTO study_topics (id, subject_id, title, is_completed, order_index, created_at) VALUES (?, ?, ?, 0, 0, ?);',
      [id, subjectId, title.trim(), now]
    );
    return db.getFirstSync<StudyTopic>('SELECT * FROM study_topics WHERE id = ?;', [id])!;
  }

  static deleteTopic(topicId: string): boolean {
    const db = getDatabase();
    db.runSync('DELETE FROM study_topics WHERE id = ?;', [topicId]);
    return true;
  }

  // Get today's study plan for dashboard
  static getTodayPlan(): { subjectName: string; time: string; color: string } | null {
    const dayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    const sessions = this.getScheduleSessions(dayOfWeek);
    if (sessions.length > 0) {
      const first = sessions[0];
      return {
        subjectName: first.subject_name || 'Study Session',
        time: `${first.start_time} - ${first.end_time}`,
        color: first.subject_color || '#1E8E4E',
      };
    }

    // Fallback to top active subject
    const subjects = this.getSubjectsWithProgress();
    const activeSubj = subjects.find((s) => (s.progressPercent || 0) < 100) || subjects[0];
    if (activeSubj) {
      return {
        subjectName: activeSubj.name,
        time: `${activeSubj.progressPercent || 0}% covered`,
        color: activeSubj.color,
      };
    }

    return null;
  }
}
