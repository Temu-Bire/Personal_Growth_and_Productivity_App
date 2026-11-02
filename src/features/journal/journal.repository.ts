import { getDatabase, getDatabaseAsync } from '../../db/client';
import { generateId } from '../../utils/id';

export interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  content: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export class JournalRepository {
  // Sync
  static getEntries(): JournalEntry[] {
    const db = getDatabase();
    return db.getAllSync<JournalEntry>('SELECT * FROM journal_entries ORDER BY date DESC, created_at DESC');
  }

  // Async non-blocking
  static async getEntriesAsync(): Promise<JournalEntry[]> {
    const db = await getDatabaseAsync();
    return db.getAllAsync<JournalEntry>('SELECT * FROM journal_entries ORDER BY date DESC, created_at DESC');
  }

  // Sync
  static getEntryByDate(date: string): JournalEntry | null {
    const db = getDatabase();
    return db.getFirstSync<JournalEntry>('SELECT * FROM journal_entries WHERE date = ?', [date]);
  }

  // Async non-blocking
  static async getEntryByDateAsync(date: string): Promise<JournalEntry | null> {
    const db = await getDatabaseAsync();
    return db.getFirstAsync<JournalEntry>('SELECT * FROM journal_entries WHERE date = ?', [date]);
  }

  // Sync
  static saveEntry(entry: {
    date: string;
    mood: number;
    content: string;
    tags: string[];
  }): JournalEntry {
    const db = getDatabase();
    const existing = db.getFirstSync<JournalEntry>('SELECT id FROM journal_entries WHERE date = ?', [entry.date]);
    const now = new Date().toISOString();
    const tagsJson = JSON.stringify(entry.tags);

    if (existing) {
      db.runSync(
        'UPDATE journal_entries SET mood = ?, content = ?, tags = ?, updated_at = ? WHERE id = ?',
        [entry.mood, entry.content, tagsJson, now, existing.id]
      );
      return db.getFirstSync<JournalEntry>('SELECT * FROM journal_entries WHERE id = ?', [existing.id])!;
    } else {
      const id = generateId('jrnl');
      db.runSync(
        'INSERT INTO journal_entries (id, date, mood, content, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, entry.date, entry.mood, entry.content, tagsJson, now, now]
      );
      return db.getFirstSync<JournalEntry>('SELECT * FROM journal_entries WHERE id = ?', [id])!;
    }
  }

  // Async non-blocking
  static async saveEntryAsync(entry: {
    date: string;
    mood: number;
    content: string;
    tags: string[];
  }): Promise<JournalEntry> {
    const db = await getDatabaseAsync();
    const existing = await db.getFirstAsync<JournalEntry>('SELECT id FROM journal_entries WHERE date = ?', [entry.date]);
    const now = new Date().toISOString();
    const tagsJson = JSON.stringify(entry.tags);

    if (existing) {
      await db.runAsync(
        'UPDATE journal_entries SET mood = ?, content = ?, tags = ?, updated_at = ? WHERE id = ?',
        [entry.mood, entry.content, tagsJson, now, existing.id]
      );
      const res = await db.getFirstAsync<JournalEntry>('SELECT * FROM journal_entries WHERE id = ?', [existing.id]);
      return res!;
    } else {
      const id = generateId('jrnl');
      await db.runAsync(
        'INSERT INTO journal_entries (id, date, mood, content, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, entry.date, entry.mood, entry.content, tagsJson, now, now]
      );
      const res = await db.getFirstAsync<JournalEntry>('SELECT * FROM journal_entries WHERE id = ?', [id]);
      return res!;
    }
  }

  // Sync
  static getAverageMoodLast7Days(): number {
    const db = getDatabase();
    const rows = db.getAllSync<{ mood: number }>(
      'SELECT mood FROM journal_entries ORDER BY date DESC LIMIT 7'
    );
    if (rows.length === 0) return 4.5;
    const sum = rows.reduce((acc, r) => acc + r.mood, 0);
    return Number((sum / rows.length).toFixed(1));
  }

  // Async non-blocking
  static async getAverageMoodLast7DaysAsync(): Promise<number> {
    const db = await getDatabaseAsync();
    const rows = await db.getAllAsync<{ mood: number }>(
      'SELECT mood FROM journal_entries ORDER BY date DESC LIMIT 7'
    );
    if (rows.length === 0) return 4.5;
    const sum = rows.reduce((acc, r) => acc + r.mood, 0);
    return Number((sum / rows.length).toFixed(1));
  }
}

