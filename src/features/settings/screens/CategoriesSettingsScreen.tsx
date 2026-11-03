import React, { useState, useEffect, useCallback } from 'react';
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
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { useTheme } from '../../../hooks/useTheme';
import { CustomizationRepository } from '../../customization/customization.repository';
import { CustomCategory, CustomUnit } from '../../customization/customization.types';

const ENTITY_OPTIONS = [
  { key: 'goals', label: 'Goals' },
  { key: 'habits', label: 'Habits' },
  { key: 'projects', label: 'Projects' },
  { key: 'study', label: 'Study' },
  { key: 'journal', label: 'Journal' },
  { key: 'trading', label: 'Trading' },
  { key: 'challenges', label: 'Challenges' },
];

const PRESET_COLORS = [
  '#1E8E4E', '#10B981', '#2563EB', '#3B82F6',
  '#7C3AED', '#8B5CF6', '#D97706', '#F59E0B',
  '#E11D48', '#EC4899', '#0D9488', '#475569',
];

const PRESET_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'bookmark-outline', 'flag-outline', 'fitness-outline', 'heart-outline',
  'flash-outline', 'school-outline', 'briefcase-outline', 'sparkles-outline',
  'book-outline', 'folder-open-outline', 'trending-up-outline', 'leaf-outline',
  'cash-outline', 'globe-outline', 'cube-outline', 'timer-outline',
];

export const CategoriesSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography } = useTheme();

  const [selectedEntity, setSelectedEntity] = useState('goals');
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'units'>('categories');
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [units, setUnits] = useState<CustomUnit[]>([]);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CustomCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#1E8E4E');
  const [catIcon, setCatIcon] = useState<keyof typeof Ionicons.glyphMap>('bookmark-outline');

  // Unit Modal State
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitName, setUnitName] = useState('');
  const [unitAbbr, setUnitAbbr] = useState('');

  const loadData = useCallback(() => {
    const catList = CustomizationRepository.getCategories(selectedEntity);
    setCategories(catList);

    if (selectedEntity === 'habits' || selectedEntity === 'goals') {
      const unitList = CustomizationRepository.getUnits(selectedEntity);
      setUnits(unitList);
    }
  }, [selectedEntity]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Categories CRUD
  const handleOpenAddCat = () => {
    setEditingCat(null);
    setCatName('');
    setCatColor('#1E8E4E');
    setCatIcon('bookmark-outline');
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (cat: CustomCategory) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatColor(cat.color);
    setCatIcon(cat.icon as any);
    setIsCatModalOpen(true);
  };

  const handleSaveCat = () => {
    if (!catName.trim()) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }

    if (editingCat) {
      CustomizationRepository.updateCategory(editingCat.id, {
        name: catName,
        color: catColor,
        icon: catIcon,
      });
    } else {
      CustomizationRepository.addCategory({
        entityType: selectedEntity,
        name: catName,
        color: catColor,
        icon: catIcon,
      });
    }

    setIsCatModalOpen(false);
    loadData();
  };

  const handleDeleteCat = (cat: CustomCategory) => {
    Alert.alert(
      'Delete Category',
      `Delete "${cat.name}"? Existing items with this category will keep their label.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            CustomizationRepository.deleteCategory(cat.id);
            loadData();
          },
        },
      ]
    );
  };

  // Units CRUD
  const handleOpenAddUnit = () => {
    setUnitName('');
    setUnitAbbr('');
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = () => {
    if (!unitName.trim() || !unitAbbr.trim()) {
      Alert.alert('Required', 'Please enter both unit name and abbreviation.');
      return;
    }

    CustomizationRepository.addUnit({
      entityType: selectedEntity,
      name: unitName,
      abbreviation: unitAbbr,
    });

    setIsUnitModalOpen(false);
    loadData();
  };

  const handleDeleteUnit = (u: CustomUnit) => {
    Alert.alert(
      'Delete Unit',
      `Delete unit "${u.name}" (${u.abbreviation})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            CustomizationRepository.deleteUnit(u.id);
            loadData();
          },
        },
      ]
    );
  };

  const supportsUnits = selectedEntity === 'habits' || selectedEntity === 'goals';

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
          <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary, marginLeft: 12, flex: 1 }]}>
            Categories & Units
          </Text>
          <TouchableOpacity
            onPress={activeSubTab === 'categories' ? handleOpenAddCat : handleOpenAddUnit}
            style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="Add New"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Module Picker Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.entityRow}>
          {ENTITY_OPTIONS.map((e) => {
            const isSelected = selectedEntity === e.key;
            return (
              <TouchableOpacity
                key={e.key}
                onPress={() => setSelectedEntity(e.key)}
                style={[
                  styles.entityChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.inputBg,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {e.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sub-Tabs: Categories vs Units (if supported) */}
        {supportsUnits && (
          <SegmentedTabs
            tabs={[
              { key: 'categories', label: 'Categories' },
              { key: 'units', label: 'Measurement Units' },
            ]}
            activeTab={activeSubTab}
            onTabChange={(k) => setActiveSubTab(k as any)}
            style={{ marginBottom: 14 }}
          />
        )}

        {/* CATEGORIES VIEW */}
        {activeSubTab === 'categories' && (
          <View style={styles.list}>
            {categories.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="bookmark-outline" size={32} color={colors.textMuted} />
                <Text style={[typography.bodyMedium, { color: colors.textMuted, marginTop: 8 }]}>
                  No custom categories yet. Tap '+' to create one!
                </Text>
              </Card>
            ) : (
              categories.map((cat) => (
                <Card key={cat.id} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <View style={[styles.catIconWrap, { backgroundColor: cat.color + '22' }]}>
                      <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                    </View>

                    <View style={styles.itemInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                          {cat.name}
                        </Text>
                        {cat.is_default === 1 && (
                          <View style={[styles.defaultBadge, { backgroundColor: colors.border }]}>
                            <Text style={[typography.captionBold, { color: colors.textMuted, fontSize: 10 }]}>
                              DEFAULT
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        Color: {cat.color}
                      </Text>
                    </View>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        onPress={() => handleOpenEditCat(cat)}
                        style={styles.actionBtn}
                        accessibilityLabel="Edit category"
                      >
                        <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteCat(cat)}
                        style={styles.actionBtn}
                        accessibilityLabel="Delete category"
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* UNITS VIEW */}
        {activeSubTab === 'units' && supportsUnits && (
          <View style={styles.list}>
            {units.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="scale-outline" size={32} color={colors.textMuted} />
                <Text style={[typography.bodyMedium, { color: colors.textMuted, marginTop: 8 }]}>
                  No measurement units yet. Tap '+' to add one!
                </Text>
              </Card>
            ) : (
              units.map((u) => (
                <Card key={u.id} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <View style={[styles.unitBadge, { backgroundColor: colors.accentMint }]}>
                      <Text style={[typography.captionBold, { color: colors.primary }]}>
                        {u.abbreviation}
                      </Text>
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                        {u.name}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        Unit label: "{u.abbreviation}"
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteUnit(u)}
                      style={styles.actionBtn}
                      accessibilityLabel="Delete unit"
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* Add/Edit Category Modal */}
        <BottomSheetModal
          visible={isCatModalOpen}
          onClose={() => setIsCatModalOpen(false)}
          title={editingCat ? 'Edit Category' : 'Add Category'}
        >
          <View style={styles.modalContent}>
            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
              CATEGORY NAME *
            </Text>
            <TextInput
              value={catName}
              onChangeText={setCatName}
              placeholder="e.g. Health & Fitness"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.textInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 14 }]}>
              CATEGORY COLOR
            </Text>
            <View style={styles.colorSwatches}>
              {PRESET_COLORS.map((hex) => {
                const isSelected = catColor === hex;
                return (
                  <TouchableOpacity
                    key={hex}
                    onPress={() => setCatColor(hex)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: hex },
                      isSelected && styles.colorSelected,
                    ]}
                  />
                );
              })}
            </View>

            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 14 }]}>
              CATEGORY ICON
            </Text>
            <View style={styles.iconsGrid}>
              {PRESET_ICONS.map((ico) => {
                const isSelected = catIcon === ico;
                return (
                  <TouchableOpacity
                    key={ico}
                    onPress={() => setCatIcon(ico)}
                    style={[
                      styles.iconChoice,
                      {
                        backgroundColor: isSelected ? catColor : colors.inputBg,
                        borderColor: isSelected ? catColor : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={ico}
                      size={20}
                      color={isSelected ? '#FFFFFF' : colors.textPrimary}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsCatModalOpen(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={editingCat ? 'Save Changes' : 'Create Category'}
                variant="primary"
                onPress={handleSaveCat}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </BottomSheetModal>

        {/* Add Unit Modal */}
        <BottomSheetModal
          visible={isUnitModalOpen}
          onClose={() => setIsUnitModalOpen(false)}
          title="Add Measurement Unit"
        >
          <View style={styles.modalContent}>
            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
              UNIT NAME *
            </Text>
            <TextInput
              value={unitName}
              onChangeText={setUnitName}
              placeholder="e.g. Kilometers, Minutes, Pages"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.textInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 14 }]}>
              ABBREVIATION / SYMBOL *
            </Text>
            <TextInput
              value={unitAbbr}
              onChangeText={setUnitAbbr}
              placeholder="e.g. km, mins, p, reps"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.textInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsUnitModalOpen(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Add Unit"
                variant="primary"
                onPress={handleSaveUnit}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </BottomSheetModal>
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
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  entityChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  list: {
    gap: 10,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCard: {
    padding: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 6,
  },
  modalContent: {
    paddingBottom: 24,
  },
  inputLabel: {
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  textInput: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  colorSwatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  iconChoice: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});

