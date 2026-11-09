import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorPalette } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { useSettingsStore } from '../store/useSettingsStore';

export interface Theme {
  colors: ColorPalette;
  isDark: boolean;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
}

export const useTheme = (): Theme => {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((state) => state.themeMode);

  // Default to dark theme as required by Dayvane specification
  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode !== 'light';

  return useMemo(() => {
    const colors: ColorPalette = { ...(isDark ? darkColors : lightColors) };

    return {
      colors,
      isDark,
      spacing,
      radius,
      typography,
      shadows,
    };
  }, [isDark]);
};
