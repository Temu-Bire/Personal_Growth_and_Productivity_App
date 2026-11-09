import { getDatabase } from '../../db/client';
import { generateId } from '../../utils/id';

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  icon?: string;
  sort_order: number;
}

export class SettingsRepository {
  static getCategories(): CategoryItem[] {
    const db = getDatabase();
    const rows = db.getAllSync<any>('SELECT * FROM categories ORDER BY sort_order ASC, name ASC;');
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      color: r.color || '#22C55E',
      icon: r.icon,
      sort_order: r.sort_order || 0,
    }));
  }

  static addCategory(name: string, color: string = '#22C55E'): CategoryItem {
    const db = getDatabase();
    const id = generateId('cat');
    const now = new Date().toISOString();
    const countRow = db.getFirstSync<{ count: number }>('SELECT count(*) as count FROM categories;');
    const order = (countRow?.count || 0) + 1;

    db.runSync(
      'INSERT INTO categories (id, name, color, icon, module, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [id, name.trim(), color, 'bookmark-outline', 'all', order, now]
    );

    return { id, name: name.trim(), color, sort_order: order };
  }

  static updateCategory(id: string, name: string, color: string): void {
    const db = getDatabase();
    db.runSync('UPDATE categories SET name = ?, color = ? WHERE id = ?;', [name.trim(), color, id]);
  }

  static deleteCategory(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM categories WHERE id = ?;', [id]);
  }

  static eraseAllData(): void {
    const db = getDatabase();
    db.runSync('DELETE FROM habit_completions;');
    db.runSync('DELETE FROM habits;');
    db.runSync('DELETE FROM milestones;');
    db.runSync('DELETE FROM tasks;');
    db.runSync('DELETE FROM goals;');
    db.runSync('DELETE FROM projects;');
    db.runSync('DELETE FROM journal_entries;');
    db.runSync('DELETE FROM coach_messages;');
    db.runSync('DELETE FROM daily_summaries;');
  }
}

