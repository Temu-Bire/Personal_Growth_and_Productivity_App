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
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { useTheme } from '../../../hooks/useTheme';
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { SidebarNavItem } from '../../customization/customization.types';

const POPULAR_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'grid-outline', 'flag-outline', 'calendar-outline', 'bulb-outline',
  'flash-outline', 'school-outline', 'folder-open-outline', 'book-outline',
  'trending-up-outline', 'pie-chart-outline', 'settings-outline', 'help-circle-outline',
  'heart-outline', 'star-outline', 'sparkles-outline', 'briefcase-outline',
  'barbell-outline', 'musical-notes-outline', 'wallet-outline', 'bookmark-outline',
];

export const NavigationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography } = useTheme();
  const {
    sidebarItems,
    updateSidebarItems,
    toggleSidebarItemVisibility,
    renameSidebarItem,
    addCustomSidebarItem,
    deleteSidebarItem,
    resetSidebarToDefault,
  } = useCustomizationStore();

  // Modal: Edit/Rename Item
  const [editingItem, setEditingItem] = useState<SidebarNavItem | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState<keyof typeof Ionicons.glyphMap>('bookmark-outline');

  // Modal: Add Custom Item
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState<keyof typeof Ionicons.glyphMap>('star-outline');
  const [newCategory, setNewCategory] = useState('Custom');

  const handleOpenEdit = (item: SidebarNavItem) => {
    setEditingItem(item);
    setEditLabel(item.label);
    setEditIcon(item.icon);
  };

  const handleSaveEdit = () => {
    if (!editingItem || !editLabel.trim()) {
      Alert.alert('Required', 'Please enter a valid page name.');
      return;
    }
    renameSidebarItem(editingItem.id, editLabel, editIcon);
    setEditingItem(null);
  };

  const handleCreateCustom = () => {
    if (!newLabel.trim()) {
      Alert.alert('Required', 'Please enter a page label.');
      return;
    }
    addCustomSidebarItem({
      label: newLabel,
      icon: newIcon,
      category: newCategory.trim() || 'Custom',
      routeName: 'DashboardScreen',
    });
    setNewLabel('');
    setIsAddOpen(false);
  };

  const handleDelete = (item: SidebarNavItem) => {
    if (item.isSystem) {
      Alert.alert('Protected System Page', 'This essential system page cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete Sidebar Page',
      `Are you sure you want to remove "${item.label}" from your sidebar? (Underlying data will NOT be deleted).`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSidebarItem(item.id),
        },
      ]
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...sidebarItems];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    updateSidebarItems(items.map((it, idx) => ({ ...it, order: idx })));
  };

  const handleMoveDown = (index: number) => {
    if (index === sidebarItems.length - 1) return;
    const items = [...sidebarItems];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    updateSidebarItems(items.map((it, idx) => ({ ...it, order: idx })));
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Sidebar',
      'Are you sure you want to restore the default navigation layout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetSidebarToDefault,
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
          <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary, marginLeft: 12, flex: 1 }]}>
            Sidebar Navigation
          </Text>
          <TouchableOpacity
            onPress={() => setIsAddOpen(true)}
            style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="Add Custom Page"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Intro Card */}
        <Card style={styles.introCard}>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            Customize which pages appear in your sidebar, rename pages, pick custom icons, and reorder to your preferred workflow.
          </Text>
        </Card>

        {/* Sidebar Items List */}
        <View style={styles.itemsList}>
          {sidebarItems.map((item, index) => (
            <Card
              key={item.id}
              style={[
                styles.itemCard,
                item.isHidden && { opacity: 0.6, backgroundColor: colors.inputBg },
              ]}
            >
              <View style={styles.itemRow}>
                {/* Reorder Buttons */}
                <View style={styles.orderControls}>
                  <TouchableOpacity
                    onPress={() => handleMoveUp(index)}
                    disabled={index === 0}
                    style={[styles.arrowBtn, index === 0 && { opacity: 0.3 }]}
                  >
                    <Ionicons name="chevron-up" size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleMoveDown(index)}
                    disabled={index === sidebarItems.length - 1}
                    style={[styles.arrowBtn, index === sidebarItems.length - 1 && { opacity: 0.3 }]}
                  >
                    <Ionicons name="chevron-down" size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Icon & Details */}
                <View style={[styles.iconCircle, { backgroundColor: colors.accentMint }]}>
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>

                <View style={styles.itemDetails}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                      {item.label}
                    </Text>
                    {item.isSystem && (
                      <View style={[styles.systemBadge, { backgroundColor: colors.border }]}>
                        <Text style={[typography.captionBold, { color: colors.textMuted, fontSize: 10 }]}>
                          SYSTEM
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {item.category || 'General'} · {item.isHidden ? 'Hidden' : 'Visible'}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.itemActions}>
                  {/* Toggle Visibility */}
                  <TouchableOpacity
                    onPress={() => toggleSidebarItemVisibility(item.id)}
                    style={styles.actionBtn}
                    accessibilityLabel={item.isHidden ? 'Show in sidebar' : 'Hide from sidebar'}
                  >
                    <Ionicons
                      name={item.isHidden ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={item.isHidden ? colors.textMuted : colors.primary}
                    />
                  </TouchableOpacity>

                  {/* Edit/Rename */}
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(item)}
                    style={styles.actionBtn}
                    accessibilityLabel="Edit page details"
                  >
                    <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Delete (custom only) */}
                  {!item.isSystem && (
                    <TouchableOpacity
                      onPress={() => handleDelete(item)}
                      style={styles.actionBtn}
                      accessibilityLabel="Delete page"
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Reset Button */}
        <Button
          title="Reset Sidebar to Default"
          variant="ghost"
          onPress={handleReset}
          style={{ marginVertical: 20 }}
        />

        {/* Edit Item Modal */}
        <BottomSheetModal
          visible={editingItem !== null}
          onClose={() => setEditingItem(null)}
          title="Edit Page"
        >
          <View style={styles.modalContent}>
            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
              PAGE NAME
            </Text>
            <TextInput
              value={editLabel}
              onChangeText={setEditLabel}
              placeholder="e.g. My Custom Tracker"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.textInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 14 }]}>
              SELECT ICON
            </Text>
            <View style={styles.iconsGrid}>
              {POPULAR_ICONS.map((ico) => {
                const isSelected = editIcon === ico;
                return (
                  <TouchableOpacity
                    key={ico}
                    onPress={() => setEditIcon(ico)}
                    style={[
                      styles.iconChoice,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.inputBg,
                        borderColor: isSelected ? colors.primary : colors.border,
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
                onPress={() => setEditingItem(null)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Save Changes"
                variant="primary"
                onPress={handleSaveEdit}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </BottomSheetModal>

        {/* Add Custom Page Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add Custom Page"
        >
          <View style={styles.modalContent}>
            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
              PAGE TITLE *
            </Text>
            <TextInput
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="e.g. Reading List / Workout Log"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.textInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 14 }]}>
              CATEGORY / SECTION
            </Text>
            <TextInput
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="e.g. Custom / Wellness"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.textInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 14 }]}>
              PAGE ICON
            </Text>
            <View style={styles.iconsGrid}>
              {POPULAR_ICONS.map((ico) => {
                const isSelected = newIcon === ico;
                return (
                  <TouchableOpacity
                    key={ico}
                    onPress={() => setNewIcon(ico)}
                    style={[
                      styles.iconChoice,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.inputBg,
                        borderColor: isSelected ? colors.primary : colors.border,
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
                onPress={() => setIsAddOpen(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Add Page"
                variant="primary"
                onPress={handleCreateCustom}
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
  introCard: {
    padding: 14,
    marginBottom: 16,
  },
  itemsList: {
    gap: 10,
  },
  itemCard: {
    padding: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderControls: {
    alignItems: 'center',
    marginRight: 8,
  },
  arrowBtn: {
    padding: 2,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  systemBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

