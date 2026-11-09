import { getDatabase } from '../../db/client';
import { generateId } from '../../utils/id';

export interface JournalEntry {
  id: string;
  date: string;
  recap: string;
  learned: string;
  mood_rating: number; // 1 to 5
  energy_rating: number; // 1 to 5
  productivity_rating: number; // 1 to 5
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaveJournalDTO {
  date: string;
  recap: string;
  learned: string;
  mood_rating: number;
  energy_rating: number;
  productivity_rating: number;
  notes?: string | null;
}

export class JournalRepository {
  static getEntries(): JournalEntry[] {
    const db = getDatabase();
    const rows = db.getAllSync<any>(
      'SELECT * FROM journal_entries ORDER BY date DESC, created_at DESC;'
    );
    return rows.map((r) => ({
      id: r.id,
      date: r.date,
      recap: r.recap || r.content || '',
      learned: r.learned || r.lessons_learned || '',
      mood_rating: r.mood_rating || r.mood || 4,
      energy_rating: r.energy_rating || 4,
      productivity_rating: r.productivity_rating || 4,
      notes: r.notes || null,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  }

  static getEntryByDate(date: string): JournalEntry | null {
    const db = getDatabase();
    const r = db.getFirstSync<any>('SELECT * FROM journal_entries WHERE date = ?;', [date]);
    if (!r) return null;
    return {
      id: r.id,
      date: r.date,
      recap: r.recap || r.content || '',
      learned: r.learned || r.lessons_learned || '',
      mood_rating: r.mood_rating || r.mood || 4,
      energy_rating: r.energy_rating || 4,
      productivity_rating: r.productivity_rating || 4,
      notes: r.notes || null,
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  }

  static getLatestEntry(): JournalEntry | null {
    const list = this.getEntries();
    return list.length > 0 ? list[0] : null;
  }

  static saveEntry(entry: SaveJournalDTO): JournalEntry {
    const db = getDatabase();
    const existing = db.getFirstSync<any>('SELECT id FROM journal_entries WHERE date = ?;', [entry.date]);
    const now = new Date().toISOString();

    if (existing) {
      db.runSync(
        `UPDATE journal_entries SET
          recap = ?, learned = ?, mood_rating = ?, mood = ?, energy_rating = ?,
          productivity_rating = ?, notes = ?, content = ?, updated_at = ?
         WHERE id = ?;`,
        [
          entry.recap.trim(),
          entry.learned.trim(),
          entry.mood_rating,
          entry.mood_rating,
          entry.energy_rating,
          entry.productivity_rating,
          entry.notes?.trim() || null,
          entry.recap.trim(),
          now,
          existing.id,
        ]
      );
      return this.getEntryByDate(entry.date)!;
    } else {
      const id = generateId('jrnl');
      db.runSync(
        `INSERT INTO journal_entries (
          id, date, recap, learned, mood_rating, mood, energy_rating, productivity_rating, notes, content, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          id,
          entry.date,
          entry.recap.trim(),
          entry.learned.trim(),
          entry.mood_rating,
          entry.mood_rating,
          entry.energy_rating,
          entry.productivity_rating,
          entry.notes?.trim() || null,
          entry.recap.trim(),
          now,
          now,
        ]
      );
      return this.getEntryByDate(entry.date)!;
    }
  }

  static getAverages(daysLimit: number = 30): { mood: number; energy: number; productivity: number } {
    const entries = this.getEntries().slice(0, daysLimit);
    if (entries.length === 0) {
      return { mood: 0, energy: 0, productivity: 0 };
    }
    const sumMood = entries.reduce((acc, e) => acc + e.mood_rating, 0);
    const sumEnergy = entries.reduce((acc, e) => acc + e.energy_rating, 0);
    const sumProd = entries.reduce((acc, e) => acc + e.productivity_rating, 0);

    return {
      mood: parseFloat((sumMood / entries.length).toFixed(1)),
      energy: parseFloat((sumEnergy / entries.length).toFixed(1)),
      productivity: parseFloat((sumProd / entries.length).toFixed(1)),
    };
  }
}
