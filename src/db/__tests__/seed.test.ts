import { isDatabaseEmptyAsync, seedInitialDataAsync } from '../seed';
import { MockSQLiteDatabase } from './mockDatabase';
import type { SQLiteDatabase } from 'expo-sqlite';

describe('Safe Startup Seeding', () => {
  let mockDb: MockSQLiteDatabase;

  beforeEach(() => {
    mockDb = new MockSQLiteDatabase();
  });

  it('detects an empty database when no profile or tasks exist', async () => {
    const isEmpty = await isDatabaseEmptyAsync(mockDb as unknown as SQLiteDatabase);
    expect(isEmpty).toBe(true);
  });

  it('detects a non-empty database when profile records exist', async () => {
    mockDb.tables.set('profile', [{ id: 'user_1' }]);
    const isEmpty = await isDatabaseEmptyAsync(mockDb as unknown as SQLiteDatabase);
    expect(isEmpty).toBe(false);
  });

  it('detects a non-empty database when task records exist', async () => {
    mockDb.tables.set('tasks', [{ id: 'task_1' }]);
    const isEmpty = await isDatabaseEmptyAsync(mockDb as unknown as SQLiteDatabase);
    expect(isEmpty).toBe(false);
  });

  it('seeds initial data on first launch when database is empty', async () => {
    const seeded = await seedInitialDataAsync(mockDb as unknown as SQLiteDatabase);
    expect(seeded).toBe(true);

    // Profile table must now have an entry
    const profileRows = mockDb.tables.get('profile');
    expect(profileRows?.length).toBeGreaterThan(0);

    // Tasks table must now have entries
    const taskRows = mockDb.tables.get('tasks');
    expect(taskRows?.length).toBeGreaterThan(0);
  });

  it('never overwrites or re-seeds if data already exists on startup', async () => {
    mockDb.tables.set('profile', [{ id: 'existing_user' }]);

    const queryCountBefore = mockDb.executedQueries.length;
    const seeded = await seedInitialDataAsync(mockDb as unknown as SQLiteDatabase);

    expect(seeded).toBe(false);

    // No insert statements should have been executed
    const insertQueries = mockDb.executedQueries
      .slice(queryCountBefore)
      .filter((q) => q.sql.startsWith('INSERT'));
    expect(insertQueries.length).toBe(0);

    // Profile must still have only the pre-existing user
    const profileRows = mockDb.tables.get('profile');
    expect(profileRows).toEqual([{ id: 'existing_user' }]);
  });
});
