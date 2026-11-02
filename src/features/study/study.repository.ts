import { getDatabase } from '../../db/client';
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
  day_of_week: number; // 0 = Sun, 1 = Mon, etc.
  start_time: string;
  end_time: string;
  created_at: string;
}

export class StudyRepository {
  static getSubjectsWithProgress(): Subject[] {
    const db = getDatabase();
    const subjects = db.getAllSync<Subject>('SELECT * FROM subjects ORDER BY created_at ASC');

    return subjects.map((subj) => {
      const topics = db.getAllSync<StudyTopic>(
        'SELECT is_completed FROM study_topics WHERE subject_id = ?',
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

  static getTopics(subjectId: string): StudyTopic[] {
    const db = getDatabase();
    return db.getAllSync<StudyTopic>(
      'SELECT * FROM study_topics WHERE subject_id = ? ORDER BY order_index ASC, created_at ASC',
      [subjectId]
    );
  }

  static toggleTopic(topicId: string): boolean {
    const db = getDatabase();
    const current = db.getFirstSync<StudyTopic>('SELECT is_completed FROM study_topics WHERE id = ?', [topicId]);
    if (!current) return false;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    const completedAt = newCompleted === 1 ? new Date().toISOString() : null;

    db.runSync('UPDATE study_topics SET is_completed = ?, completed_at = ? WHERE id = ?', [
      newCompleted,
      completedAt,
      topicId,
    ]);
    return newCompleted === 1;
  }

  static createSubject(name: string, color = '#1E8E4E', initialTopics: string[] = []): Subject {
    const db = getDatabase();
    const id = generateId('subj');
    const now = new Date().toISOString();

    db.runSync('INSERT INTO subjects (id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [
      id,
      name,
      color,
      now,
      now,
    ]);

    initialTopics.forEach((t, idx) => {
      if (t.trim()) {
        db.runSync(
          'INSERT INTO study_topics (id, subject_id, title, is_completed, order_index, created_at) VALUES (?, ?, ?, 0, ?, ?)',
          [generateId('stopic'), id, t.trim(), idx, now]
        );
      }
    });

    return db.getFirstSync<Subject>('SELECT * FROM subjects WHERE id = ?', [id])!;
  }

  static addTopic(subjectId: string, title: string): StudyTopic {
    const db = getDatabase();
    const id = generateId('stopic');
    const now = new Date().toISOString();

    db.runSync(
      'INSERT INTO study_topics (id, subject_id, title, is_completed, order_index, created_at) VALUES (?, ?, ?, 0, 99, ?)',
      [id, subjectId, title, now]
    );

    return db.getFirstSync<StudyTopic>('SELECT * FROM study_topics WHERE id = ?', [id])!;
  }

  static getScheduleSessions(): StudyScheduleSession[] {
    const db = getDatabase();
    return db.getAllSync<StudyScheduleSession>(
      `SELECT ss.*, s.name as subject_name, s.color as subject_color
       FROM study_sessions ss
       JOIN subjects s ON s.id = ss.subject_id
       ORDER BY ss.day_of_week ASC, ss.start_time ASC`
    );
  }
}

