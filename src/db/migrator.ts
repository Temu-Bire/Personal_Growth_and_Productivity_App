import type { SQLiteDatabase } from 'expo-sqlite';
import { ALL_MIGRATIONS, Migration } from './migrations';
import { MigrationError } from './errors';

export interface MigrationResult {
  fromVersion: number;
  toVersion: number;
  appliedCount: number;
  appliedVersions: number[];
}

export async function getCurrentVersionAsync(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  return result?.user_version ?? 0;
}

export async function setVersionAsync(db: SQLiteDatabase, version: number): Promise<void> {
  await db.execAsync(`PRAGMA user_version = ${version};`);
}

export async function runMigrationsAsync(
  db: SQLiteDatabase,
  migrations: Migration[] = ALL_MIGRATIONS
): Promise<MigrationResult> {
  const currentVersion = await getCurrentVersionAsync(db);
  const pending = migrations
    .filter((m) => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  if (pending.length === 0) {
    return {
      fromVersion: currentVersion,
      toVersion: currentVersion,
      appliedCount: 0,
      appliedVersions: [],
    };
  }

  let latestVersion = currentVersion;
  const appliedVersions: number[] = [];

  for (const migration of pending) {
    try {
      await db.withTransactionAsync(async () => {
        await migration.up(db);
        await setVersionAsync(db, migration.version);
      });
      latestVersion = migration.version;
      appliedVersions.push(migration.version);
    } catch (err: unknown) {
      throw new MigrationError(
        `Failed applying migration v${migration.version} ("${migration.description}"): ${
          err instanceof Error ? err.message : String(err)
        }`,
        latestVersion,
        migration.version,
        err
      );
    }
  }

  return {
    fromVersion: currentVersion,
    toVersion: latestVersion,
    appliedCount: appliedVersions.length,
    appliedVersions,
  };
}
