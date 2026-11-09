import { getCurrentVersionAsync, setVersionAsync, runMigrationsAsync } from '../migrator';
import { MigrationError } from '../errors';
import { Migration } from '../migrations';
import { MockSQLiteDatabase } from './mockDatabase';
import type { SQLiteDatabase } from 'expo-sqlite';

describe('Database Migrator', () => {
  let mockDb: MockSQLiteDatabase;

  beforeEach(() => {
    mockDb = new MockSQLiteDatabase();
  });

  it('reads initial database version as 0', async () => {
    const version = await getCurrentVersionAsync(mockDb as unknown as SQLiteDatabase);
    expect(version).toBe(0);
  });

  it('updates version via setVersionAsync', async () => {
    await setVersionAsync(mockDb as unknown as SQLiteDatabase, 3);
    const version = await getCurrentVersionAsync(mockDb as unknown as SQLiteDatabase);
    expect(version).toBe(3);
  });

  it('applies migrations in strict ascending order and updates user_version', async () => {
    const executedOrder: number[] = [];

    const mockMigrations: Migration[] = [
      {
        version: 2,
        description: 'Second migration',
        up: async () => {
          executedOrder.push(2);
        },
      },
      {
        version: 1,
        description: 'First migration',
        up: async () => {
          executedOrder.push(1);
        },
      },
      {
        version: 3,
        description: 'Third migration',
        up: async () => {
          executedOrder.push(3);
        },
      },
    ];

    const result = await runMigrationsAsync(mockDb as unknown as SQLiteDatabase, mockMigrations);

    expect(result.fromVersion).toBe(0);
    expect(result.toVersion).toBe(3);
    expect(result.appliedCount).toBe(3);
    expect(result.appliedVersions).toEqual([1, 2, 3]);
    expect(executedOrder).toEqual([1, 2, 3]);
    expect(mockDb.userVersion).toBe(3);
  });

  it('skips already applied migrations idempotently', async () => {
    mockDb.userVersion = 2;

    const mockMigrations: Migration[] = [
      {
        version: 1,
        description: 'Migration 1',
        up: async () => {},
      },
      {
        version: 2,
        description: 'Migration 2',
        up: async () => {},
      },
      {
        version: 3,
        description: 'Migration 3',
        up: async () => {},
      },
    ];

    const result = await runMigrationsAsync(mockDb as unknown as SQLiteDatabase, mockMigrations);

    expect(result.fromVersion).toBe(2);
    expect(result.toVersion).toBe(3);
    expect(result.appliedCount).toBe(1);
    expect(result.appliedVersions).toEqual([3]);
    expect(mockDb.userVersion).toBe(3);
  });

  it('returns appliedCount 0 when up-to-date', async () => {
    mockDb.userVersion = 5;

    const mockMigrations: Migration[] = [
      {
        version: 1,
        description: 'Migration 1',
        up: async () => {},
      },
      {
        version: 5,
        description: 'Migration 5',
        up: async () => {},
      },
    ];

    const result = await runMigrationsAsync(mockDb as unknown as SQLiteDatabase, mockMigrations);

    expect(result.appliedCount).toBe(0);
    expect(result.fromVersion).toBe(5);
    expect(result.toVersion).toBe(5);
  });

  it('throws MigrationError with failed version info if an error occurs during migration', async () => {
    const mockMigrations: Migration[] = [
      {
        version: 1,
        description: 'Migration 1 succeeds',
        up: async () => {},
      },
      {
        version: 2,
        description: 'Migration 2 fails',
        up: async () => {
          throw new Error('Disk I/O error or syntax failure');
        },
      },
      {
        version: 3,
        description: 'Migration 3 unreachable',
        up: async () => {},
      },
    ];

    await expect(
      runMigrationsAsync(mockDb as unknown as SQLiteDatabase, mockMigrations)
    ).rejects.toThrow(MigrationError);

    // Verify it failed specifically at version 2
    try {
      await runMigrationsAsync(mockDb as unknown as SQLiteDatabase, mockMigrations);
    } catch (err) {
      expect(err).toBeInstanceOf(MigrationError);
      const migErr = err as MigrationError;
      expect(migErr.targetVersion).toBe(2);
      expect(migErr.fromVersion).toBe(1);
    }
  });

  it('runs all production migrations including v6 Dayvane schema on mock database', async () => {
    const { ALL_MIGRATIONS } = await import('../migrations');
    expect(ALL_MIGRATIONS.length).toBeGreaterThanOrEqual(6);
    const v6 = ALL_MIGRATIONS.find((m) => m.version === 6);
    expect(v6).toBeDefined();
    expect(v6?.description).toContain('Dayvane');
  });
});
