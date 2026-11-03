import { Ionicons } from '@expo/vector-icons';

export const GOAL_CATEGORIES = [
  'Health',
  'Skills',
  'Personality',
  'Career',
  'Spiritual',
  'Others',
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export interface CategoryConfig {
  name: GoalCategory;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

export const GOAL_CATEGORY_CONFIG: Record<GoalCategory, CategoryConfig> = {
  Health: {
    name: 'Health',
    icon: 'fitness-outline',
    color: '#10B981',
    bg: '#E6F6EC',
  },
  Skills: {
    name: 'Skills',
    icon: 'school-outline',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  Personality: {
    name: 'Personality',
    icon: 'sparkles-outline',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  Career: {
    name: 'Career',
    icon: 'briefcase-outline',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  Spiritual: {
    name: 'Spiritual',
    icon: 'leaf-outline',
    color: '#06B6D4',
    bg: '#ECFEFF',
  },
  Others: {
    name: 'Others',
    icon: 'bookmark-outline',
    color: '#6B7280',
    bg: '#F3F4F6',
  },
};

export function getGoalCategoryConfig(category?: string): CategoryConfig {
  if (!category) return GOAL_CATEGORY_CONFIG.Others;
  const found = GOAL_CATEGORIES.find(
    (c) => c.toLowerCase() === category.toLowerCase()
  );
  return found ? GOAL_CATEGORY_CONFIG[found] : GOAL_CATEGORY_CONFIG.Others;
}
