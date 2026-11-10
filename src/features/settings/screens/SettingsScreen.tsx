import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { useTheme } from '../../../hooks/useTheme';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { SettingsRepository, CategoryItem } from '../settings.repository';
import { FormInput } from '../../../components/forms';

const COLOR_PALETTE = [
  '#22C55E', // Green (Health)
  '#3B82F6', // Blue (Career)
  '#EAB308', // Yellow (Finance)
  '#A855F7', // Purple (Learning)
  '#14B8A6', // Teal (Faith)
  '#64748B', // Slate (Personal)
  '#EC4899', // Pink
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const profileName = useSettingsStore((s) => s.profileName) || 'Temesgen Birhenu';
  const updateProfile = useSettingsStore((s) => s.updateProfile);
  const dailyReminderEnabled = useSettingsStore((s) => s.dailyReminderEnabled);
  const updateNotificationSettings = useSettingsStore((s) => s.updateNotificationSettings);

  const [nameInput, setNameInput] = useState(profileName);
  const [digestEnabled, setDigestEnabled] = useState(dailyReminderEnabled);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Edit category sheet modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#22C55E');

  const loadCategories = useCallback(() => {
    const list = SettingsRepository.getCategories();
    setCategories(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    await updateProfile({ name: nameInput.trim() });
    Alert.alert('Saved', 'Your name has been updated.');
  };

  const handleToggleDigest = async (val: boolean) => {
    setDigestEnabled(val);
    await updateNotificationSettings(val, '08:00 AM');
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }
    SettingsRepository.addCategory(newCategoryName.trim(), '#22C55E');
    setNewCategoryName('');
    loadCategories();
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditColor(cat.color);
    setIsEditModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!editingCategory || !editName.trim()) return;
    SettingsRepository.updateCategory(editingCategory.id, editName.trim(), editColor);
    setIsEditModalOpen(false);
    setEditingCategory(null);
    loadCategories();
  };

  const handleDeleteCategory = (cat: CategoryItem) => {
    Alert.alert('Delete Category', `Are you sure you want to delete "${cat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          SettingsRepository.deleteCategory(cat.id);
          loadCategories();
        },
      },
    ]);
  };

  const handleEraseAllData = () => {
    Alert.alert(
      'Erase All Data',
      'Deletes every habit, task, goal and entry on this phone. This cannot be undone. Are you completely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Data',
          style: 'destructive',
          onPress: () => {
            SettingsRepository.eraseAllData();
            Alert.alert('Data Erased', 'All habits, tasks, goals, and journal entries have been cleared.');
            loadCategories();
          },
        },
      ]
    );
  };

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[typography.h1, { color: colors.textPrimary }]}>Settings</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              Categories organize your goals, habits, and tasks
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 1. Your name card */}
          <Card style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 8 }]}>
              Your name
            </Text>
            <View style={styles.inputActionRow}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Temesgen Birhenu"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.textInput,
                  { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                ]}
              />
              <Button
                title="Save"
                onPress={handleSaveName}
                variant="primary"
                size="md"
                style={{ marginLeft: 8 }}
              />
            </View>
          </Card>

          {/* 2. Daily digest card */}
          <Card style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  Daily digest
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  Local reminder at 8:00 AM
                </Text>
              </View>
              <Switch
                value={digestEnabled}
                onValueChange={handleToggleDigest}
                trackColor={{ false: colors.border, true: '#22C55E' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>

          {/* 3. Add a category card */}
          <Card style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 8 }]}>
              Add a category
            </Text>
            <View style={styles.inputActionRow}>
              <TextInput
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="e.g. Fitness"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.textInput,
                  { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                ]}
              />
              <Button
                title="+ Add"
                onPress={handleAddCategory}
                variant="primary"
                size="md"
                style={{ marginLeft: 8 }}
              />
            </View>
          </Card>

          {/* 4. Categories List */}
          <View style={styles.categoriesHeader}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, letterSpacing: 0.5 }]}>
              Categories {categories.length}
            </Text>
          </View>

          <Card style={[styles.categoriesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {categories.map((cat) => (
              <View key={cat.id} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.catColorCircle, { backgroundColor: cat.color }]} />
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>
                    {cat.name}
                  </Text>
                </View>

                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(cat)}
                    style={styles.textActionBtn}
                  >
                    <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
                      edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteCategory(cat)}
                    style={styles.textActionBtn}
                  >
                    <Text style={[typography.captionBold, { color: colors.danger }]}>
                      del
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Card>

          {/* 5. Erase all data card */}
          <Card style={[styles.eraseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.bodyBold, { color: colors.danger }]}>
              Erase all data
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, marginBottom: 12 }]}>
              Deletes every habit, task, goal and entry on this phone. This cannot be undone.
            </Text>
            <Button
              title="Erase data"
              onPress={handleEraseAllData}
              variant="danger"
              size="md"
            />
          </Card>
        </ScrollView>

        {/* Edit Category Sheet Modal */}
        <BottomSheetModal
          visible={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit category"
        >
          <View style={styles.modalForm}>
            <FormInput
              label="Name"
              required
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g. Health"
            />

            <Text style={[typography.captionBold, { color: colors.textSecondary, marginTop: 8, marginBottom: 10 }]}>
              Color
            </Text>
            <View style={styles.paletteGrid}>
              {COLOR_PALETTE.map((c) => {
                const isSelected = editColor === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setEditColor(c)}
                    style={[
                      styles.paletteCircle,
                      { backgroundColor: c },
                      isSelected && { borderColor: '#FFFFFF', borderWidth: 3 },
                    ]}
                  />
                );
              })}
            </View>

            <Button
              title="Save category"
              onPress={handleSaveCategory}
              variant="primary"
              size="lg"
              style={{ marginTop: 20 }}
            />
            <Button
              title="Cancel"
              onPress={() => setIsEditModalOpen(false)}
              variant="ghost"
              size="md"
              style={{ marginTop: 8 }}
            />
          </View>
        </BottomSheetModal>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  backBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
  },
  inputActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesHeader: {
    marginTop: 8,
    marginBottom: 8,
  },
  categoriesCard: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catColorCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  textActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  eraseCard: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 14,
  },
  modalForm: {
    paddingBottom: 24,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  paletteCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
});
