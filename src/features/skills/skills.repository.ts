import { getDatabase } from '../../db/client';
import { generateId } from '../../utils/id';

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft';
  progress: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export class SkillsRepository {
  static getSkills(category: 'technical' | 'soft'): Skill[] {
    const db = getDatabase();
    return db.getAllSync<Skill>(
      'SELECT * FROM skills WHERE category = ? ORDER BY progress DESC, created_at ASC',
      [category]
    );
  }

  static createSkill(skill: {
    name: string;
    category: 'technical' | 'soft';
    progress?: number;
    notes?: string | null;
  }): Skill {
    const db = getDatabase();
    const id = generateId('skill');
    const now = new Date().toISOString();

    db.runSync(
      'INSERT INTO skills (id, name, category, progress, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, skill.name, skill.category, skill.progress || 0, skill.notes || null, now, now]
    );

    return db.getFirstSync<Skill>('SELECT * FROM skills WHERE id = ?', [id])!;
  }

  static updateProgress(id: string, progress: number): void {
    const db = getDatabase();
    db.runSync('UPDATE skills SET progress = ?, updated_at = ? WHERE id = ?', [
      Math.min(100, Math.max(0, progress)),
      new Date().toISOString(),
      id,
    ]);
  }
}

