import { getDatabase, getDatabaseAsync } from '../../db/client';
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
  // Sync
  static getSkills(category: 'technical' | 'soft'): Skill[] {
    const db = getDatabase();
    return db.getAllSync<Skill>(
      'SELECT * FROM skills WHERE category = ? ORDER BY progress DESC, created_at ASC',
      [category]
    );
  }

  // Async non-blocking
  static async getSkillsAsync(category: 'technical' | 'soft'): Promise<Skill[]> {
    const db = await getDatabaseAsync();
    return db.getAllAsync<Skill>(
      'SELECT * FROM skills WHERE category = ? ORDER BY progress DESC, created_at ASC',
      [category]
    );
  }

  // Sync
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

  // Async non-blocking
  static async createSkillAsync(skill: {
    name: string;
    category: 'technical' | 'soft';
    progress?: number;
    notes?: string | null;
  }): Promise<Skill> {
    const db = await getDatabaseAsync();
    const id = generateId('skill');
    const now = new Date().toISOString();

    await db.runAsync(
      'INSERT INTO skills (id, name, category, progress, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, skill.name, skill.category, skill.progress || 0, skill.notes || null, now, now]
    );

    const created = await db.getFirstAsync<Skill>('SELECT * FROM skills WHERE id = ?', [id]);
    return created!;
  }

  // Sync
  static updateProgress(id: string, progress: number): void {
    const db = getDatabase();
    db.runSync('UPDATE skills SET progress = ?, updated_at = ? WHERE id = ?', [
      Math.min(100, Math.max(0, progress)),
      new Date().toISOString(),
      id,
    ]);
  }

  // Async non-blocking
  static async updateProgressAsync(id: string, progress: number): Promise<void> {
    const db = await getDatabaseAsync();
    await db.runAsync('UPDATE skills SET progress = ?, updated_at = ? WHERE id = ?', [
      Math.min(100, Math.max(0, progress)),
      new Date().toISOString(),
      id,
    ]);
  }
}

