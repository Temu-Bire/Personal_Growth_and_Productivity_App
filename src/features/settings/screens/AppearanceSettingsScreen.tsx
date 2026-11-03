import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { useTheme } from '../../../hooks/useTheme';
import { useSettingsStore, ThemeMode } from '../../../store/useSettingsStore';
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { PRESET_PALETTES } from '../../../theme/palettes';
import { FontSizeScale, LayoutDensity } from '../../customization/customization.types';

const QUICK_COLORS = [
  '#1E8E4E', '#10B981', '#2563EB', '#3B82F6',
  '#7C3AED', '#8B5CF6', '#D97706', '#F59E0B',
  '#E11D48', '#EC4899', '#0D9488', '#475569',
  '#111827', '#F8FAF9', '#FFFFFF', '#0B130E',
];

export const AppearanceSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, spacing, isDark } = useTheme();
  const { themeMode, setThemeMode } = useSettingsStore();
  const { themeCustomization, updateThemeCustomization, resetThemeToDefault } = useCustomizationStore();

  const [activeColorTarget, setActiveColorTarget] = useState<'primary' | 'accent' | 'background' | 'surface' | 'text'>('primary');
  const [customHexInput, setCustomHexInput] = useState('');

  const handleSelectPalette = (paletteId: string) => {
    updateThemeCustomization({
      paletteId,
      customPrimary: undefined,
      customAccent: undefined,
    });
  };

  const handleApplyColor = (color: string) => {
    switch (activeColorTarget) {
      case 'primary':
        updateThemeCustomization({ customPrimary: color });
        break;
      case 'accent':
        updateThemeCustomization({ customAccent: color });
        break;
      case 'background':
        updateThemeCustomization({ customBackground: color });
        break;
      case 'surface':
        updateThemeCustomization({ customSurface: color });
        break;
      case 'text':
        updateThemeCustomization({ customText: color });
        break;
    }
  };

  const handleApplyHex = () => {
    let hex = customHexInput.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      handleApplyColor(hex);
      setCustomHexInput('');
    } else {
      Alert.alert('Invalid Color', 'Please enter a valid 6-character hex code (e.g. #1E8E4E)');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Appearance',
      'Are you sure you want to restore the default theme and appearance?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setThemeMode('system');
            resetThemeToDefault();
          },
        },
      ]
    );
  };

  return (
    <Screen scroll backgroundColor={colors.background} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary, marginLeft: 12 }]}>
            Appearance & Themes
          </Text>
        </View>

        {/* Live Preview Card */}
        <Card variant="elevated" style={[styles.previewCard, { borderColor: colors.border }]}>
          <View style={styles.previewHeader}>
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
              LIVE PREVIEW
            </Text>
            <View style={[styles.contrastBadge, { backgroundColor: colors.accentMint }]}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                Readable Contrast
              </Text>
            </View>
          </View>

          <Text style={[typography.h2, { color: colors.textPrimary, marginTop: 8 }]}>
            GrowPro Personalization
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
            Experience your customized colors, typography scale, and layout density in real time.
          </Text>

          <ProgressBar progress={68} height={8} color={colors.primary} style={{ marginVertical: 12 }} />

          <View style={styles.previewActions}>
            <Button
              title="Primary Action"
              size="sm"
              onPress={() => {}}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Secondary"
              variant="secondary"
              size="sm"
              onPress={() => {}}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* 1. Theme Mode: Light / Dark / System */}
        <Card style={styles.sectionCard}>
          <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700', marginBottom: 12 }]}>
            Theme Mode
          </Text>
          <SegmentedTabs
            tabs={[
              { key: 'light', label: 'Light' },
              { key: 'dark', label: 'Dark' },
              { key: 'system', label: 'System' },
            ]}
            activeTab={themeMode}
            onTabChange={(mode) => setThemeMode(mode as ThemeMode)}
          />
        </Card>

        {/* 2. Color Palettes */}
        <Card style={styles.sectionCard}>
          <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700', marginBottom: 4 }]}>
            Color Palettes
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 14 }]}>
            Select a harmonious predefined palette for GrowPro.
          </Text>

          <View style={styles.palettesGrid}>
            {PRESET_PALETTES.map((p) => {
              const isSelected = themeCustomization.paletteId === p.id && !themeCustomization.customPrimary;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.8}
                  onPress={() => handleSelectPalette(p.id)}
                  style={[
                    styles.paletteCard,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: isSelected ? p.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.paletteSwatches}>
                    <View style={[styles.swatch, { backgroundColor: p.primary }]} />
                    <View style={[styles.swatch, { backgroundColor: p.primaryDark }]} />
                    <View style={[styles.swatch, { backgroundColor: p.accentMint }]} />
                  </View>
                  <Text
                    style={[
                      typography.bodyMedium,
                      {
                        color: isSelected ? p.primary : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                        marginTop: 8,
                      },
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* 3. Custom Color Overrides */}
        <Card style={styles.sectionCard}>
          <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700', marginBottom: 4 }]}>
            Custom Color Picker
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 14 }]}>
            Customize individual element colors with precision.
          </Text>

          {/* Color Target Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorTargetRow}>
            {[
              { key: 'primary', label: 'Primary' },
              { key: 'accent', label: 'Accent' },
              { key: 'background', label: 'Background' },
              { key: 'surface', label: 'Card / Surface' },
              { key: 'text', label: 'Text' },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setActiveColorTarget(t.key as any)}
                style={[
                  styles.targetBtn,
                  {
                    backgroundColor: activeColorTarget === t.key ? colors.primary : colors.inputBg,
                    borderColor: activeColorTarget === t.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: activeColorTarget === t.key ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Swatches */}
          <View style={styles.swatchesRow}>
            {QUICK_COLORS.map((hex) => (
              <TouchableOpacity
                key={hex}
                activeOpacity={0.8}
                onPress={() => handleApplyColor(hex)}
                style={[styles.colorBubble, { backgroundColor: hex }]}
              />
            ))}
          </View>

          {/* Hex Input */}
          <View style={styles.hexInputRow}>
            <TextInput
              value={customHexInput}
              onChangeText={setCustomHexInput}
              placeholder="#1E8E4E"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.hexInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
              autoCapitalize="characters"
              maxLength={7}
            />
            <Button title="Apply Hex" size="sm" onPress={handleApplyHex} style={{ marginLeft: 8 }} />
          </View>
        </Card>

        {/* 4. Font Size Scale */}
        <Card style={styles.sectionCard}>
          <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700', marginBottom: 4 }]}>
            Font Size Scale
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 12 }]}>
            Scale text size across the entire application.
          </Text>
          <SegmentedTabs
            tabs={[
              { key: 'small', label: 'Small' },
              { key: 'medium', label: 'Medium' },
              { key: 'large', label: 'Large' },
            ]}
            activeTab={themeCustomization.fontSizeScale}
            onTabChange={(scale) =>
              updateThemeCustomization({ fontSizeScale: scale as FontSizeScale })
            }
          />
        </Card>

        {/* 5. Layout Density */}
        <Card style={styles.sectionCard}>
          <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700', marginBottom: 4 }]}>
            Layout Density
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 12 }]}>
            Adjust padding and list spacing for your screen comfort.
          </Text>
          <SegmentedTabs
            tabs={[
              { key: 'compact', label: 'Compact' },
              { key: 'normal', label: 'Normal' },
              { key: 'comfortable', label: 'Comfortable' },
            ]}
            activeTab={themeCustomization.density}
            onTabChange={(density) =>
              updateThemeCustomization({ density: density as LayoutDensity })
            }
          />
        </Card>

        {/* Reset Button */}
        <Button
          title="Reset to Default Appearance"
          variant="ghost"
          onPress={handleReset}
          style={{ marginVertical: 16 }}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollPadding: {
    paddingBottom: 80,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
  },
  previewCard: {
    padding: 16,
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contrastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewActions: {
    flexDirection: 'row',
    marginTop: 4,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  palettesGrid: {
    gap: 10,
  },
  paletteCard: {
    padding: 12,
    borderRadius: 12,
  },
  paletteSwatches: {
    flexDirection: 'row',
    gap: 8,
  },
  swatch: {
    width: 32,
    height: 18,
    borderRadius: 4,
  },
  colorTargetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  targetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  swatchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  colorBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  hexInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hexInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});

