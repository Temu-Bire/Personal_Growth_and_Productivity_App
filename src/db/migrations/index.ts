import { Migration } from './types';
import { migrationV1 } from './v1_initial_schema';
import { migrationV2 } from './v2_performance_indexes';

export const ALL_MIGRATIONS: Migration[] = [migrationV1, migrationV2];

export * from './types';
export * from './v1_initial_schema';
export * from './v2_performance_indexes';
