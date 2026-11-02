export const openDatabaseAsync = jest.fn();
export const openDatabaseSync = jest.fn();

export interface SQLiteDatabase {
  execAsync(sql: string): Promise<void>;
  execSync(sql: string): void;
  runAsync(sql: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowId: number }>;
  runSync(sql: string, params?: unknown[]): { changes: number; lastInsertRowId: number };
  getAllAsync<T>(sql: string, params?: unknown[]): Promise<T[]>;
  getAllSync<T>(sql: string, params?: unknown[]): T[];
  getFirstAsync<T>(sql: string, params?: unknown[]): Promise<T | null>;
  getFirstSync<T>(sql: string, params?: unknown[]): T | null;
  withTransactionAsync<T>(task: () => Promise<T>): Promise<T>;
  withTransactionSync<T>(task: () => T): T;
}
