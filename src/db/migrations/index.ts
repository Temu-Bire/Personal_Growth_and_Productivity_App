import { Migration } from './types';
import { migrationV1 } from './v1_initial_schema';
import { migrationV2 } from './v2_performance_indexes';
import { migrationV3 } from './v3_ideas_table';
import { migrationV4 } from './v4_customization_tables';

export const ALL_MIGRATIONS: Migration[] = [migrationV1, migrationV2, migrationV3, migrationV4];

export * from './types';
export * from './v1_initial_schema';
export * from './v2_performance_indexes';
export * from './v3_ideas_table';
export * from './v4_customization_tables';
