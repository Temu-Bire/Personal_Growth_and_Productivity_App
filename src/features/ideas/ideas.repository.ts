import { getDatabase, getDatabaseAsync } from '../../db/client';
import { generateId } from '../../utils/id';
import { Idea, CreateIdeaDTO, UpdateIdeaDTO } from './ideas.types';

export class IdeasRepository {
  static getAll(search?: string, tag?: string): Idea[] {
    const db = getDatabase();
    let query = 'SELECT * FROM ideas WHERE 1=1';
    const params: unknown[] = [];

    if (search && search.trim()) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (tag && tag.trim()) {
      query += ' AND tags LIKE ?';
      params.push(`%${tag.trim()}%`);
    }

    query += ' ORDER BY is_pinned DESC, created_at DESC';
    return db.getAllSync<Idea>(query, params);
  }

  static async getAllAsync(search?: string, tag?: string): Promise<Idea[]> {
    const db = await getDatabaseAsync();
    let query = 'SELECT * FROM ideas WHERE 1=1';
    const params: unknown[] = [];

    if (search && search.trim()) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (tag && tag.trim()) {
      query += ' AND tags LIKE ?';
      params.push(`%${tag.trim()}%`);
    }

    query += ' ORDER BY is_pinned DESC, created_at DESC';
    return db.getAllAsync<Idea>(query, params);
  }

  static getById(id: string): Idea | null {
    const db = getDatabase();
    return db.getFirstSync<Idea>('SELECT * FROM ideas WHERE id = ?', [id]);
  }

  static async getByIdAsync(id: string): Promise<Idea | null> {
    const db = await getDatabaseAsync();
    return db.getFirstAsync<Idea>('SELECT * FROM ideas WHERE id = ?', [id]);
  }

  static create(dto: CreateIdeaDTO): Idea {
    const db = getDatabase();
    const id = generateId('idea');
    const now = new Date().toISOString();
    const tagsJson = dto.tags && dto.tags.length > 0 ? JSON.stringify(dto.tags) : null;

    db.runSync(
      `INSERT INTO ideas (id, title, description, category, tags, is_pinned, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dto.title.trim(),
        dto.description?.trim() || null,
        dto.category || 'General',
        tagsJson,
        dto.isPinned ? 1 : 0,
        dto.color || '#1E8E4E',
        now,
        now,
      ]
    );

    return db.getFirstSync<Idea>('SELECT * FROM ideas WHERE id = ?', [id])!;
  }

  static async createAsync(dto: CreateIdeaDTO): Promise<Idea> {
    const db = await getDatabaseAsync();
    const id = generateId('idea');
    const now = new Date().toISOString();
    const tagsJson = dto.tags && dto.tags.length > 0 ? JSON.stringify(dto.tags) : null;

    await db.runAsync(
      `INSERT INTO ideas (id, title, description, category, tags, is_pinned, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dto.title.trim(),
        dto.description?.trim() || null,
        dto.category || 'General',
        tagsJson,
        dto.isPinned ? 1 : 0,
        dto.color || '#1E8E4E',
        now,
        now,
      ]
    );

    const idea = await db.getFirstAsync<Idea>('SELECT * FROM ideas WHERE id = ?', [id]);
    return idea!;
  }

  static update(id: string, dto: UpdateIdeaDTO): Idea | null {
    const db = getDatabase();
    const existing = db.getFirstSync<Idea>('SELECT * FROM ideas WHERE id = ?', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updatedTitle = dto.title !== undefined ? dto.title.trim() : existing.title;
    const updatedDesc = dto.description !== undefined ? dto.description.trim() || null : existing.description;
    const updatedCategory = dto.category !== undefined ? dto.category : existing.category;
    const updatedTags = dto.tags !== undefined ? (dto.tags.length > 0 ? JSON.stringify(dto.tags) : null) : existing.tags;
    const updatedPinned = dto.isPinned !== undefined ? (dto.isPinned ? 1 : 0) : existing.is_pinned;
    const updatedColor = dto.color !== undefined ? dto.color : existing.color;

    db.runSync(
      `UPDATE ideas
       SET title = ?, description = ?, category = ?, tags = ?, is_pinned = ?, color = ?, updated_at = ?
       WHERE id = ?`,
      [updatedTitle, updatedDesc, updatedCategory, updatedTags, updatedPinned, updatedColor, now, id]
    );

    return db.getFirstSync<Idea>('SELECT * FROM ideas WHERE id = ?', [id]);
  }

  static async updateAsync(id: string, dto: UpdateIdeaDTO): Promise<Idea | null> {
    const db = await getDatabaseAsync();
    const existing = await db.getFirstAsync<Idea>('SELECT * FROM ideas WHERE id = ?', [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updatedTitle = dto.title !== undefined ? dto.title.trim() : existing.title;
    const updatedDesc = dto.description !== undefined ? dto.description.trim() || null : existing.description;
    const updatedCategory = dto.category !== undefined ? dto.category : existing.category;
    const updatedTags = dto.tags !== undefined ? (dto.tags.length > 0 ? JSON.stringify(dto.tags) : null) : existing.tags;
    const updatedPinned = dto.isPinned !== undefined ? (dto.isPinned ? 1 : 0) : existing.is_pinned;
    const updatedColor = dto.color !== undefined ? dto.color : existing.color;

    await db.runAsync(
      `UPDATE ideas
       SET title = ?, description = ?, category = ?, tags = ?, is_pinned = ?, color = ?, updated_at = ?
       WHERE id = ?`,
      [updatedTitle, updatedDesc, updatedCategory, updatedTags, updatedPinned, updatedColor, now, id]
    );

    return db.getFirstAsync<Idea>('SELECT * FROM ideas WHERE id = ?', [id]);
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    db.runSync('DELETE FROM ideas WHERE id = ?', [id]);
    return true;
  }

  static async deleteAsync(id: string): Promise<boolean> {
    const db = await getDatabaseAsync();
    await db.runAsync('DELETE FROM ideas WHERE id = ?', [id]);
    return true;
  }

  static togglePin(id: string): boolean {
    const db = getDatabase();
    const existing = db.getFirstSync<Idea>('SELECT is_pinned FROM ideas WHERE id = ?', [id]);
    if (!existing) return false;
    const nextPin = existing.is_pinned === 1 ? 0 : 1;
    db.runSync('UPDATE ideas SET is_pinned = ?, updated_at = ? WHERE id = ?', [
      nextPin,
      new Date().toISOString(),
      id,
    ]);
    return nextPin === 1;
  }
}
