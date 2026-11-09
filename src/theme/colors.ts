export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  danger: string;
  warning: string;
  success: string;
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  inputBg: string;
  drawerBg: string;
  tabBarBg: string;
  tabBarBorder: string;
  overlay: string;
  lockBg: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Health: '#22C55E',
  Career: '#3B82F6',
  Finance: '#EAB308',
  Learning: '#A855F7',
  Faith: '#14B8A6',
  Personal: '#64748B',
  General: '#71717A',
};

export const darkColors: ColorPalette = {
  primary: '#FFFFFF',
  primaryLight: '#E4E4E7',
  primaryDark: '#A1A1AA',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
  background: '#09090B',
  surface: '#121215',
  card: '#18181B',
  cardBorder: '#27272A',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  border: '#27272A',
  divider: '#1F1F23',
  inputBg: '#18181B',
  drawerBg: '#09090B',
  tabBarBg: '#121215',
  tabBarBorder: '#27272A',
  overlay: 'rgba(0, 0, 0, 0.75)',
  lockBg: '#09090B',
};

export const lightColors: ColorPalette = {
  primary: '#18181B',
  primaryLight: '#27272A',
  primaryDark: '#09090B',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#16A34A',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E4E4E7',
  textPrimary: '#09090B',
  textSecondary: '#52525B',
  textMuted: '#A1A1AA',
  border: '#E4E4E7',
  divider: '#F4F4F5',
  inputBg: '#F4F4F5',
  drawerBg: '#18181B',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E4E4E7',
  overlay: 'rgba(0, 0, 0, 0.5)',
  lockBg: '#18181B',
};
