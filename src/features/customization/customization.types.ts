import { Ionicons } from '@expo/vector-icons';

export type FieldType =
  | 'text'
  | 'long_text'
  | 'number'
  | 'decimal'
  | 'dropdown'
  | 'multi_select'
  | 'checkbox'
  | 'toggle'
  | 'date'
  | 'time'
  | 'url';

export interface CustomCategory {
  id: string;
  entity_type: string;
  name: string;
  color: string;
  icon: string;
  is_default: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomUnit {
  id: string;
  entity_type: string;
  name: string;
  abbreviation: string;
  sort_order: number;
  created_at: string;
}

export interface CustomField {
  id: string;
  entity_type: string;
  field_key: string;
  label: string;
  field_type: FieldType;
  placeholder?: string | null;
  help_text?: string | null;
  default_value?: string | null;
  options_json?: string | null;
  is_required: number;
  is_system: number;
  is_hidden: number;
  section: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomFieldValue {
  id: string;
  entity_type: string;
  entity_id: string;
  field_key: string;
  value_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface SidebarNavItem {
  id: string;
  routeName: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isHidden: boolean;
  isSystem: boolean;
  order: number;
  category?: string;
  isCustom?: boolean;
}

export type DashboardWidgetType =
  | 'focus_ring'
  | 'priorities'
  | 'current_goal'
  | 'current_project'
  | 'habits'
  | 'study_plan'
  | 'journal'
  | 'quick_actions'
  | 'overdue_items'
  | 'deadlines';

export interface DashboardWidgetConfig {
  id: string;
  type: DashboardWidgetType;
  label: string;
  isEnabled: boolean;
  order: number;
  size: 'full' | 'half';
}

export type ViewMode = 'card' | 'list' | 'compact' | 'grid';

export interface PageLayoutConfig {
  viewMode: ViewMode;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  visibleFields: string[];
}

export type FontSizeScale = 'small' | 'medium' | 'large';
export type LayoutDensity = 'compact' | 'normal' | 'comfortable';

export interface ThemeCustomization {
  paletteId: string;
  customPrimary?: string;
  customAccent?: string;
  customBackground?: string;
  customSurface?: string;
  customText?: string;
  fontSizeScale: FontSizeScale;
  density: LayoutDensity;
}

export interface GeneralPreferences {
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  weekStartDay: 'monday' | 'sunday';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}
