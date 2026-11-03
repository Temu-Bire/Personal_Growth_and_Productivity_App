export interface PresetPalette {
  id: string;
  name: string;
  primary: string;
  primaryDark: string;
  accentMint: string;
  drawerBgLight: string;
  drawerBgDark: string;
}

export const PRESET_PALETTES: PresetPalette[] = [
  {
    id: 'default',
    name: 'Forest Emerald (Default)',
    primary: '#1E8E4E',
    primaryDark: '#15733E',
    accentMint: '#E6F6EC',
    drawerBgLight: '#0F4D2E',
    drawerBgDark: '#091A10',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    accentMint: '#DBEAFE',
    drawerBgLight: '#1E3A8A',
    drawerBgDark: '#0C1938',
  },
  {
    id: 'violet',
    name: 'Royal Purple',
    primary: '#7C3AED',
    primaryDark: '#6D28D9',
    accentMint: '#EDE9FE',
    drawerBgLight: '#4C1D95',
    drawerBgDark: '#1E0E3D',
  },
  {
    id: 'amber',
    name: 'Warm Sunset',
    primary: '#D97706',
    primaryDark: '#B45309',
    accentMint: '#FEF3C7',
    drawerBgLight: '#78350F',
    drawerBgDark: '#331505',
  },
  {
    id: 'rose',
    name: 'Rose Gold',
    primary: '#E11D48',
    primaryDark: '#BE123C',
    accentMint: '#FFE4E6',
    drawerBgLight: '#881337',
    drawerBgDark: '#3B0716',
  },
  {
    id: 'teal',
    name: 'Nordic Teal',
    primary: '#0D9488',
    primaryDark: '#0F766E',
    accentMint: '#CCFBF1',
    drawerBgLight: '#134E4A',
    drawerBgDark: '#072422',
  },
  {
    id: 'slate',
    name: 'Minimal Slate',
    primary: '#475569',
    primaryDark: '#334155',
    accentMint: '#F1F5F9',
    drawerBgLight: '#1E293B',
    drawerBgDark: '#0F172A',
  },
];
