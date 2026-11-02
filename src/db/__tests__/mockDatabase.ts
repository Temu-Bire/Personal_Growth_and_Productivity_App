import type { SQLiteDatabase } from 'expo-sqlite';

export interface ExecutedQuery {
  sql: string;
  params?: unknown[];
}

export class MockSQLiteDatabase {
  userVersion = 0;
  executedQueries: ExecutedQuery[] = [];
  tables = new Map<string, Array<Record<string, unknown>>>();
  failOnQueryRegex?: RegExp;

  async getFirstAsync<T>(sql: string, params?: unknown[]): Promise<T | null> {
    this.executedQueries.push({ sql, params });

    if (sql.includes('PRAGMA user_version;')) {
      return { user_version: this.userVersion } as unknown as T;
    }

    if (sql.includes('SELECT count(*) as count FROM profile')) {
      const rows = this.tables.get('profile') || [];
      return { count: rows.length } as unknown as T;
    }

    if (sql.includes('SELECT count(*) as count FROM tasks')) {
      const rows = this.tables.get('tasks') || [];
      return { count: rows.length } as unknown as T;
    }

    return null;
  }

  async getAllAsync<T>(sql: string, params?: unknown[]): Promise<T[]> {
    this.executedQueries.push({ sql, params });
    return [];
  }

  async runAsync(sql: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowId: number }> {
    this.executedQueries.push({ sql, params });

    if (this.failOnQueryRegex && this.failOnQueryRegex.test(sql)) {
      throw new Error(`Simulated query failure for: ${sql}`);
    }

    if (sql.startsWith('INSERT INTO profile')) {
      const current = this.tables.get('profile') || [];
      current.push({ id: params?.[0] });
      this.tables.set('profile', current);
    } else if (sql.startsWith('INSERT INTO tasks')) {
      const current = this.tables.get('tasks') || [];
      current.push({ id: params?.[0] });
      this.tables.set('tasks', current);
    }

    return { changes: 1, lastInsertRowId: 1 };
  }

  async execAsync(sql: string): Promise<void> {
    this.executedQueries.push({ sql });

    if (this.failOnQueryRegex && this.failOnQueryRegex.test(sql)) {
      throw new Error(`Simulated execAsync failure for: ${sql}`);
    }

    const versionMatch = sql.match(/PRAGMA user_version\s*=\s*(\d+);?/);
    if (versionMatch) {
      this.userVersion = parseInt(versionMatch[1], 10);
    }

    const dropMatch = sql.match(/DROP TABLE IF EXISTS\s+(\w+);?/);
    if (dropMatch) {
      this.tables.delete(dropMatch[1]);
    }
  }

  async withTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
    const backupVersion = this.userVersion;
    const backupQueriesCount = this.executedQueries.length;
    try {
      return await task();
    } catch (err) {
      // Transaction rollback simulation
      this.userVersion = backupVersion;
      throw err;
    }
  }
}
