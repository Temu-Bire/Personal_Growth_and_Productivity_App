import { getDatabase, getDatabaseAsync } from '../../db/client';
import { generateId } from '../../utils/id';
import {
  CustomCategory,
  CustomUnit,
  CustomField,
  CustomFieldValue,
  SidebarNavItem,
  DashboardWidgetConfig,
  PageLayoutConfig,
  ThemeCustomization,
  GeneralPreferences,
} from './customization.types';

export const DEFAULT_SIDEBAR_ITEMS: SidebarNavItem[] = [
  { id: 'dashboard', routeName: 'DashboardScreen', label: 'Dashboard', icon: 'grid-outline', isHidden: false, isSystem: true, order: 0, category: 'Core' },
  { id: 'goals', routeName: 'GoalsScreen', label: 'My Goals', icon: 'flag-outline', isHidden: false, isSystem: false, order: 1, category: 'Planning' },
  { id: 'tasks', routeName: 'TasksScreen', label: 'Tasks & Schedule', icon: 'calendar-outline', isHidden: false, isSystem: false, order: 2, category: 'Planning' },
  { id: 'ideas', routeName: 'IdeasScreen', label: 'Ideas', icon: 'bulb-outline', isHidden: false, isSystem: false, order: 3, category: 'Productivity' },
  { id: 'habits', routeName: 'HabitsScreen', label: 'Habits', icon: 'flash-outline', isHidden: false, isSystem: false, order: 4, category: 'Productivity' },
  { id: 'study', routeName: 'StudyScreen', label: 'Study Planner', icon: 'school-outline', isHidden: false, isSystem: false, order: 5, category: 'Growth' },
  { id: 'projects', routeName: 'ProjectsScreen', label: 'Projects', icon: 'folder-open-outline', isHidden: false, isSystem: false, order: 6, category: 'Productivity' },
  { id: 'journal', routeName: 'JournalScreen', label: 'Journal', icon: 'book-outline', isHidden: false, isSystem: false, order: 7, category: 'Growth' },
  { id: 'trading', routeName: 'TradingScreen', label: 'Trading Journal', icon: 'trending-up-outline', isHidden: false, isSystem: false, order: 8, category: 'Finance' },
  { id: 'analytics', routeName: 'AnalyticsScreen', label: 'Analytics', icon: 'pie-chart-outline', isHidden: false, isSystem: false, order: 9, category: 'Core' },
  { id: 'settings', routeName: 'SettingsScreen', label: 'Settings', icon: 'settings-outline', isHidden: false, isSystem: true, order: 10, category: 'System' },
  { id: 'help', routeName: 'HelpScreen', label: 'Help & Support', icon: 'help-circle-outline', isHidden: false, isSystem: true, order: 11, category: 'System' },
];

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'w_focus_ring', type: 'focus_ring', label: "Today's Focus & Momentum", isEnabled: true, order: 0, size: 'full' },
  { id: 'w_quick_actions', type: 'quick_actions', label: 'Quick Actions', isEnabled: true, order: 1, size: 'full' },
  { id: 'w_priorities', type: 'priorities', label: "Today's Priorities", isEnabled: true, order: 2, size: 'full' },
  { id: 'w_current_goal', type: 'current_goal', label: 'Active Goal Progress', isEnabled: true, order: 3, size: 'full' },
  { id: 'w_current_project', type: 'current_project', label: 'Current Project', isEnabled: true, order: 4, size: 'full' },
  { id: 'w_habits', type: 'habits', label: 'Daily Habit Streaks', isEnabled: true, order: 5, size: 'full' },
  { id: 'w_study_plan', type: 'study_plan', label: 'Study Curriculum', isEnabled: true, order: 6, size: 'full' },
  { id: 'w_journal', type: 'journal', label: 'Latest Journal Reflection', isEnabled: true, order: 7, size: 'full' },
  { id: 'w_overdue', type: 'overdue_items', label: 'Overdue & Urgent Tasks', isEnabled: true, order: 8, size: 'full' },
];

export const DEFAULT_INITIAL_CATEGORIES: { entity_type: string; name: string; color: string; icon: string }[] = [
  // Goals
  { entity_type: 'goals', name: 'Health', color: '#10B981', icon: 'fitness-outline' },
  { entity_type: 'goals', name: 'Skills', color: '#3B82F6', icon: 'school-outline' },
  { entity_type: 'goals', name: 'Personality', color: '#8B5CF6', icon: 'sparkles-outline' },
  { entity_type: 'goals', name: 'Career', color: '#F59E0B', icon: 'briefcase-outline' },
  { entity_type: 'goals', name: 'Spiritual', color: '#06B6D4', icon: 'leaf-outline' },
  { entity_type: 'goals', name: 'Others', color: '#6B7280', icon: 'bookmark-outline' },
  // Habits
  { entity_type: 'habits', name: 'Health', color: '#10B981', icon: 'fitness-outline' },
  { entity_type: 'habits', name: 'Focus', color: '#6366F1', icon: 'timer-outline' },
  { entity_type: 'habits', name: 'Productivity', color: '#1E8E4E', icon: 'flash-outline' },
  { entity_type: 'habits', name: 'Learning', color: '#3B82F6', icon: 'book-outline' },
  { entity_type: 'habits', name: 'Wellness', color: '#EC4899', icon: 'heart-outline' },
  // Projects
  { entity_type: 'projects', name: 'Mobile App', color: '#1E8E4E', icon: 'phone-portrait-outline' },
  { entity_type: 'projects', name: 'Web Dev', color: '#3B82F6', icon: 'globe-outline' },
  { entity_type: 'projects', name: 'Career', color: '#F59E0B', icon: 'briefcase-outline' },
  { entity_type: 'projects', name: 'Personal', color: '#8B5CF6', icon: 'person-outline' },
  // Journal
  { entity_type: 'journal', name: 'Productive', color: '#10B981', icon: 'sparkles-outline' },
  { entity_type: 'journal', name: 'Study', color: '#3B82F6', icon: 'school-outline' },
  { entity_type: 'journal', name: 'Happy', color: '#F59E0B', icon: 'happy-outline' },
  { entity_type: 'journal', name: 'Reflection', color: '#8B5CF6', icon: 'journal-outline' },
  // Trading
  { entity_type: 'trading', name: 'Forex Majors', color: '#10B981', icon: 'cash-outline' },
  { entity_type: 'trading', name: 'Crypto', color: '#F59E0B', icon: 'logo-bitcoin' },
  { entity_type: 'trading', name: 'Indices', color: '#3B82F6', icon: 'trending-up-outline' },
  { entity_type: 'trading', name: 'Commodities', color: '#EC4899', icon: 'cube-outline' },
];

export const DEFAULT_INITIAL_UNITS: { entity_type: string; name: string; abbreviation: string }[] = [
  { entity_type: 'habits', name: 'Times', abbreviation: 'times' },
  { entity_type: 'habits', name: 'Minutes', abbreviation: 'mins' },
  { entity_type: 'habits', name: 'Hours', abbreviation: 'hrs' },
  { entity_type: 'habits', name: 'Pages', abbreviation: 'pages' },
  { entity_type: 'habits', name: 'Kilometers', abbreviation: 'km' },
  { entity_type: 'habits', name: 'Glasses / Cups', abbreviation: 'cups' },
  { entity_type: 'habits', name: 'Repetitions', abbreviation: 'reps' },
  { entity_type: 'goals', name: 'Percentage', abbreviation: '%' },
  { entity_type: 'goals', name: 'Hours', abbreviation: 'hrs' },
  { entity_type: 'goals', name: 'Items / Milestones', abbreviation: 'items' },
];

export class CustomizationRepository {
  // ===================== USER PREFERENCES =====================
  static getPreference<T>(key: string, defaultValue: T): T {
    try {
      const db = getDatabase();
      const row = db.getFirstSync<{ value_json: string }>(
        'SELECT value_json FROM user_preferences WHERE key = ?',
        [key]
      );
      if (row && row.value_json) {
        return JSON.parse(row.value_json) as T;
      }
    } catch {
      // safe fallback
    }
    return defaultValue;
  }

  static setPreference<T>(key: string, value: T): void {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();
      const json = JSON.stringify(value);
      db.runSync(
        `INSERT INTO user_preferences (key, value_json, updated_at) 
         VALUES (?, ?, ?) 
         ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`,
        [key, json, now]
      );
    } catch {
      // safe fallback
    }
  }

  // ===================== CUSTOM CATEGORIES =====================
  static getCategories(entityType: string): CustomCategory[] {
    try {
      const db = getDatabase();
      const rows = db.getAllSync<CustomCategory>(
        'SELECT * FROM custom_categories WHERE entity_type = ? ORDER BY sort_order ASC, name ASC',
        [entityType]
      );
      if (rows.length > 0) return rows;

      // Auto-populate default categories if none exist
      const defaults = DEFAULT_INITIAL_CATEGORIES.filter((c) => c.entity_type === entityType);
      if (defaults.length > 0) {
        const now = new Date().toISOString();
        defaults.forEach((d, idx) => {
          const id = generateId('cat');
          db.runSync(
            `INSERT INTO custom_categories (id, entity_type, name, color, icon, is_default, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
            [id, d.entity_type, d.name, d.color, d.icon, idx, now, now]
          );
        });
        return db.getAllSync<CustomCategory>(
          'SELECT * FROM custom_categories WHERE entity_type = ? ORDER BY sort_order ASC, name ASC',
          [entityType]
        );
      }
    } catch {
      // fallback
    }
    return [];
  }

  static addCategory(data: {
    entityType: string;
    name: string;
    color?: string;
    icon?: string;
  }): CustomCategory {
    const db = getDatabase();
    const id = generateId('cat');
    const now = new Date().toISOString();
    const color = data.color || '#1E8E4E';
    const icon = data.icon || 'bookmark-outline';

    db.runSync(
      `INSERT INTO custom_categories (id, entity_type, name, color, icon, is_default, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, 99, ?, ?)`,
      [id, data.entityType, data.name.trim(), color, icon, now, now]
    );

    return db.getFirstSync<CustomCategory>('SELECT * FROM custom_categories WHERE id = ?', [id])!;
  }

  static updateCategory(
    id: string,
    updates: { name?: string; color?: string; icon?: string; sortOrder?: number }
  ): boolean {
    const db = getDatabase();
    const current = db.getFirstSync<CustomCategory>('SELECT * FROM custom_categories WHERE id = ?', [id]);
    if (!current) return false;

    const now = new Date().toISOString();
    const name = updates.name !== undefined ? updates.name.trim() : current.name;
    const color = updates.color !== undefined ? updates.color : current.color;
    const icon = updates.icon !== undefined ? updates.icon : current.icon;
    const sortOrder = updates.sortOrder !== undefined ? updates.sortOrder : current.sort_order;

    db.runSync(
      `UPDATE custom_categories SET name = ?, color = ?, icon = ?, sort_order = ?, updated_at = ? WHERE id = ?`,
      [name, color, icon, sortOrder, now, id]
    );
    return true;
  }

  static deleteCategory(id: string): boolean {
    const db = getDatabase();
    db.runSync('DELETE FROM custom_categories WHERE id = ?', [id]);
    return true;
  }

  // ===================== CUSTOM UNITS =====================
  static getUnits(entityType: string): CustomUnit[] {
    try {
      const db = getDatabase();
      const rows = db.getAllSync<CustomUnit>(
        'SELECT * FROM custom_units WHERE entity_type = ? ORDER BY sort_order ASC, name ASC',
        [entityType]
      );
      if (rows.length > 0) return rows;

      // Populate default units
      const defaults = DEFAULT_INITIAL_UNITS.filter((u) => u.entity_type === entityType);
      if (defaults.length > 0) {
        const now = new Date().toISOString();
        defaults.forEach((d, idx) => {
          db.runSync(
            `INSERT INTO custom_units (id, entity_type, name, abbreviation, sort_order, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [generateId('unit'), d.entity_type, d.name, d.abbreviation, idx, now]
          );
        });
        return db.getAllSync<CustomUnit>(
          'SELECT * FROM custom_units WHERE entity_type = ? ORDER BY sort_order ASC, name ASC',
          [entityType]
        );
      }
    } catch {
      // safe
    }
    return [];
  }

  static addUnit(data: { entityType: string; name: string; abbreviation: string }): CustomUnit {
    const db = getDatabase();
    const id = generateId('unit');
    const now = new Date().toISOString();
    db.runSync(
      `INSERT INTO custom_units (id, entity_type, name, abbreviation, sort_order, created_at)
       VALUES (?, ?, ?, ?, 99, ?)`,
      [id, data.entityType, data.name.trim(), data.abbreviation.trim(), now]
    );
    return db.getFirstSync<CustomUnit>('SELECT * FROM custom_units WHERE id = ?', [id])!;
  }

  static deleteUnit(id: string): boolean {
    const db = getDatabase();
    db.runSync('DELETE FROM custom_units WHERE id = ?', [id]);
    return true;
  }

  // ===================== CUSTOM FIELDS (FORM BUILDER) =====================
  static getFields(entityType: string): CustomField[] {
    try {
      const db = getDatabase();
      const rows = db.getAllSync<CustomField>(
        'SELECT * FROM custom_fields WHERE entity_type = ? ORDER BY sort_order ASC, created_at ASC',
        [entityType]
      );
      return rows;
    } catch {
      return [];
    }
  }

  static addField(data: {
    entityType: string;
    fieldKey: string;
    label: string;
    fieldType: CustomField['field_type'];
    placeholder?: string;
    helpText?: string;
    defaultValue?: string;
    options?: string[];
    isRequired?: boolean;
    section?: string;
  }): CustomField {
    const db = getDatabase();
    const id = generateId('fld');
    const now = new Date().toISOString();
    const optionsJson = data.options ? JSON.stringify(data.options) : null;

    db.runSync(
      `INSERT INTO custom_fields (
        id, entity_type, field_key, label, field_type, placeholder, help_text, default_value,
        options_json, is_required, is_system, is_hidden, section, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 99, ?, ?)`,
      [
        id,
        data.entityType,
        data.fieldKey.trim().toLowerCase().replace(/\s+/g, '_'),
        data.label.trim(),
        data.fieldType,
        data.placeholder || null,
        data.helpText || null,
        data.defaultValue || null,
        optionsJson,
        data.isRequired ? 1 : 0,
        data.section || 'Additional Details',
        now,
        now,
      ]
    );

    return db.getFirstSync<CustomField>('SELECT * FROM custom_fields WHERE id = ?', [id])!;
  }

  static updateField(
    id: string,
    updates: Partial<{
      label: string;
      placeholder: string;
      helpText: string;
      defaultValue: string;
      options: string[];
      isRequired: boolean;
      isHidden: boolean;
      section: string;
      sortOrder: number;
    }>
  ): boolean {
    const db = getDatabase();
    const current = db.getFirstSync<CustomField>('SELECT * FROM custom_fields WHERE id = ?', [id]);
    if (!current) return false;

    const now = new Date().toISOString();
    const label = updates.label !== undefined ? updates.label.trim() : current.label;
    const placeholder = updates.placeholder !== undefined ? (updates.placeholder || null) : (current.placeholder ?? null);
    const helpText = updates.helpText !== undefined ? (updates.helpText || null) : (current.help_text ?? null);
    const defaultValue = updates.defaultValue !== undefined ? (updates.defaultValue || null) : (current.default_value ?? null);
    const optionsJson = updates.options !== undefined ? JSON.stringify(updates.options) : (current.options_json ?? null);
    const isRequired = updates.isRequired !== undefined ? (updates.isRequired ? 1 : 0) : current.is_required;
    const isHidden = updates.isHidden !== undefined ? (updates.isHidden ? 1 : 0) : current.is_hidden;
    const section = updates.section !== undefined ? updates.section : current.section;
    const sortOrder = updates.sortOrder !== undefined ? updates.sortOrder : current.sort_order;

    db.runSync(
      `UPDATE custom_fields SET
        label = ?, placeholder = ?, help_text = ?, default_value = ?, options_json = ?,
        is_required = ?, is_hidden = ?, section = ?, sort_order = ?, updated_at = ?
       WHERE id = ?`,
      [label, placeholder, helpText, defaultValue, optionsJson, isRequired, isHidden, section, sortOrder, now, id]
    );
    return true;
  }

  static deleteField(id: string): boolean {
    const db = getDatabase();
    // System fields are strictly protected
    const field = db.getFirstSync<CustomField>('SELECT * FROM custom_fields WHERE id = ?', [id]);
    if (field && field.is_system === 1) {
      return false;
    }
    db.runSync('DELETE FROM custom_fields WHERE id = ?', [id]);
    return true;
  }

  // ===================== CUSTOM FIELD VALUES =====================
  static getFieldValues(entityType: string, entityId: string): Record<string, string> {
    try {
      const db = getDatabase();
      const rows = db.getAllSync<CustomFieldValue>(
        'SELECT field_key, value_text FROM custom_field_values WHERE entity_type = ? AND entity_id = ?',
        [entityType, entityId]
      );
      const res: Record<string, string> = {};
      rows.forEach((r) => {
        if (r.value_text !== null) res[r.field_key] = r.value_text;
      });
      return res;
    } catch {
      return {};
    }
  }

  static saveFieldValues(
    entityType: string,
    entityId: string,
    values: Record<string, string | null | undefined>
  ): void {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();
      Object.entries(values).forEach(([fieldKey, val]) => {
        if (val !== undefined) {
          const valStr = val === null ? null : String(val);
          const existing = db.getFirstSync<{ id: string }>(
            'SELECT id FROM custom_field_values WHERE entity_type = ? AND entity_id = ? AND field_key = ?',
            [entityType, entityId, fieldKey]
          );
          if (existing) {
            db.runSync(
              'UPDATE custom_field_values SET value_text = ?, updated_at = ? WHERE id = ?',
              [valStr, now, existing.id]
            );
          } else if (valStr !== null) {
            db.runSync(
              `INSERT INTO custom_field_values (id, entity_type, entity_id, field_key, value_text, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [generateId('cfv'), entityType, entityId, fieldKey, valStr, now, now]
            );
          }
        }
      });
    } catch {
      // safe fallback
    }
  }
}
