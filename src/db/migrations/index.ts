import { Migration } from './types';
import { migrationV1 } from './v1_initial_schema';
import { migrationV2 } from './v2_performance_indexes';
import { migrationV3 } from './v3_ideas_table';
import { migrationV4 } from './v4_customization_tables';
import { migrationV5 } from './v5_dayvane_schema';
import { migrationV6 } from './v6_dayvane_pdf_spec';
import { migrationV7 } from './v7_fix_projects_schema';

export const ALL_MIGRATIONS: Migration[] = [
  migrationV1,
  migrationV2,
  migrationV3,
  migrationV4,
  migrationV5,
  migrationV6,
  migrationV7,
];

export * from './types';
export * from './v1_initial_schema';
export * from './v2_performance_indexes';
export * from './v3_ideas_table';
export * from './v4_customization_tables';
export * from './v5_dayvane_schema';
export * from './v6_dayvane_pdf_spec';
export * from './v7_fix_projects_schema';
