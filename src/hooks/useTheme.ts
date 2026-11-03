import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorPalette } from '../theme/colors';
import { spacing as baseSpacing, radius } from '../theme/spacing';
import { typography as baseTypography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { useSettingsStore } from '../store/useSettingsStore';
import { useCustomizationStore } from '../store/useCustomizationStore';
import { PRESET_PALETTES } from '../theme/palettes';

export interface Theme {
  colors: ColorPalette;
  isDark: boolean;
  spacing: typeof baseSpacing;
  radius: typeof radius;
  typography: typeof baseTypography;
  shadows: typeof shadows;
}

export const useTheme = (): Theme => {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((state) => state.themeMode);
  const themeCustomization = useCustomizationStore((state) => state.themeCustomization);

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  return useMemo(() => {
    // 1. Base palette
    const colors: ColorPalette = { ...(isDark ? darkColors : lightColors) };

    // 2. Preset Palette
    const palette = PRESET_PALETTES.find((p) => p.id === themeCustomization.paletteId);
    if (palette && palette.id !== 'default') {
      colors.primary = palette.primary;
      colors.primaryDark = palette.primaryDark;
      colors.accentMint = isDark ? palette.drawerBgDark : palette.accentMint;
      colors.drawerBg = isDark ? palette.drawerBgDark : palette.drawerBgLight;
    }

    // 3. User Custom Overrides
    if (themeCustomization.customPrimary) {
      colors.primary = themeCustomization.customPrimary;
    }
    if (themeCustomization.customAccent) {
      colors.accentMint = themeCustomization.customAccent;
    }
    if (themeCustomization.customBackground) {
      colors.background = themeCustomization.customBackground;
    }
    if (themeCustomization.customSurface) {
      colors.surface = themeCustomization.customSurface;
      colors.card = themeCustomization.customSurface;
    }
    if (themeCustomization.customText) {
      colors.textPrimary = themeCustomization.customText;
    }

    // 4. Font Scaling
    const fontMultiplier =
      themeCustomization.fontSizeScale === 'small'
        ? 0.9
        : themeCustomization.fontSizeScale === 'large'
        ? 1.15
        : 1.0;

    const scaledTypography = Object.entries(baseTypography).reduce((acc, [key, style]) => {
      acc[key as keyof typeof baseTypography] = {
        ...style,
        fontSize: Math.round(style.fontSize * fontMultiplier),
        lineHeight: Math.round(style.lineHeight * fontMultiplier),
      };
      return acc;
    }, {} as typeof baseTypography);

    // 5. Layout Density Scaling
    const densityMultiplier =
      themeCustomization.density === 'compact'
        ? 0.8
        : themeCustomization.density === 'comfortable'
        ? 1.25
        : 1.0;

    const scaledSpacing = Object.entries(baseSpacing).reduce((acc, [key, val]) => {
      (acc as any)[key] = key === 'none' ? 0 : Math.round(val * densityMultiplier);
      return acc;
    }, {} as typeof baseSpacing);

    return {
      colors,
      isDark,
      spacing: scaledSpacing,
      radius,
      typography: scaledTypography,
      shadows,
    };
  }, [isDark, themeCustomization]);
};
