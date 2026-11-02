import { getDatabase } from '../../db/client';
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
  static getEntries(): JournalEntry[] {
    const db = getDatabase();
    return db.getAllSync<JournalEntry>('SELECT * FROM journal_entries ORDER BY date DESC, created_at DESC');
  }

  static getEntryByDate(date: string): JournalEntry | null {
    const db = getDatabase();
    return db.getFirstSync<JournalEntry>('SELECT * FROM journal_entries WHERE date = ?', [date]);
  }

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

  static getAverageMoodLast7Days(): number {
    const db = getDatabase();
    const rows = db.getAllSync<{ mood: number }>(
      'SELECT mood FROM journal_entries ORDER BY date DESC LIMIT 7'
    );
    if (rows.length === 0) return 4.5;
    const sum = rows.reduce((acc, r) => acc + r.mood, 0);
    return Number((sum / rows.length).toFixed(1));
  }
}

