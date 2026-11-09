// Dayvane Single Color Palette
export const DAYVANE_PALETTE = {
  id: 'dayvane-dark',
  name: 'Dayvane Dark',
  primary: '#FFFFFF',
  primaryDark: '#A1A1AA',
  background: '#09090B',
  surface: '#121215',
  card: '#18181B',
  border: '#27272A',
  drawerBgLight: '#18181B',
  drawerBgDark: '#09090B',
} as const;

export type PresetPalette = typeof DAYVANE_PALETTE;

export const PRESET_PALETTES: PresetPalette[] = [DAYVANE_PALETTE];
