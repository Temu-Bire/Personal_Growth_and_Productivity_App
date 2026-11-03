import type { SQLiteDatabase } from 'expo-sqlite';
import { Migration } from './types';

export const migrationV4: Migration = {
  version: 4,
  description: 'Add customization tables: categories, units, custom fields and values, user preferences',
  up: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS custom_categories (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#1E8E4E',
        icon TEXT DEFAULT 'bookmark-outline',
        is_default INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_custom_categories_entity ON custom_categories(entity_type);

      CREATE TABLE IF NOT EXISTS custom_units (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL,
        name TEXT NOT NULL,
        abbreviation TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_custom_units_entity ON custom_units(entity_type);

      CREATE TABLE IF NOT EXISTS custom_fields (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL,
        field_key TEXT NOT NULL,
        label TEXT NOT NULL,
        field_type TEXT NOT NULL,
        placeholder TEXT,
        help_text TEXT,
        default_value TEXT,
        options_json TEXT,
        is_required INTEGER DEFAULT 0,
        is_system INTEGER DEFAULT 0,
        is_hidden INTEGER DEFAULT 0,
        section TEXT DEFAULT 'General',
        sort_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_custom_fields_entity ON custom_fields(entity_type);

      CREATE TABLE IF NOT EXISTS custom_field_values (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        field_key TEXT NOT NULL,
        value_text TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_field_values_entity ON custom_field_values(entity_type, entity_id);

      CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT PRIMARY KEY NOT NULL,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  },
  down: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      DROP TABLE IF EXISTS user_preferences;
      DROP INDEX IF EXISTS idx_field_values_entity;
      DROP TABLE IF EXISTS custom_field_values;
      DROP INDEX IF EXISTS idx_custom_fields_entity;
      DROP TABLE IF EXISTS custom_fields;
      DROP INDEX IF EXISTS idx_custom_units_entity;
      DROP TABLE IF EXISTS custom_units;
      DROP INDEX IF EXISTS idx_custom_categories_entity;
      DROP TABLE IF EXISTS custom_categories;
    `);
  },
};

