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
}
