import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { CustomizationRepository } from '../../customization/customization.repository';
import { ViewModeSwitcher } from '../../customization/components/ViewModeSwitcher';
import { CustomFieldsSection } from '../../customization/components/CustomFieldsSection';
import { CustomFieldsBadgeRow } from '../../customization/components/CustomFieldsBadgeRow';
import { sortItemsByLayout } from '../../customization/layout.utils';
import { IdeasRepository } from '../ideas.repository';
import { Idea } from '../ideas.types';

export const IdeasScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const pageLayout = useCustomizationStore((state) => state.pageLayouts['ideas']);

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>(['All', 'App', 'Career', 'Creative', 'Business', 'Personal', 'General']);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  const loadIdeas = useCallback(() => {
    const list = IdeasRepository.getAll(search);
    setIdeas(list);

    // Merge custom categories
    const customCats = CustomizationRepository.getCategories('ideas');
    const base = ['All', 'App', 'Career', 'Creative', 'Business', 'Personal', 'General'];
    customCats.forEach((c) => {
      if (!base.includes(c.name)) base.push(c.name);
    });
    setCategories(base);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      loadIdeas();
    }, [loadIdeas])
  );

  const filteredIdeas = useMemo(() => {
    let list = ideas;
    if (selectedCategory !== 'All') {
      list = ideas.filter(
        (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    return sortItemsByLayout(list, pageLayout);
  }, [ideas, selectedCategory, pageLayout]);

  const viewMode = pageLayout?.viewMode || 'card';
  const visibleFields = pageLayout?.visibleFields || [
    'show_dates',
    'show_categories',
    'show_progress',
    'show_notes',
    'show_status',
  ];

  const handleOpenAdd = () => {
    setEditingIdea(null);
    setTitle('');
    setDescription('');
    setCategory('General');
    setIsCategoryDropdownOpen(false);
    setTagsInput('');
    setIsPinned(false);
    setCustomFieldValues({});
    setModalVisible(true);
  };

  const handleOpenEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setDescription(idea.description || '');
    setCategory(idea.category || 'General');
    setIsCategoryDropdownOpen(false);
    const parsedTags: string[] = idea.tags ? JSON.parse(idea.tags) : [];
    setTagsInput(parsedTags.join(', '));
    setIsPinned(idea.is_pinned === 1);
    const existingVals = CustomizationRepository.getFieldValues('ideas', idea.id);
    setCustomFieldValues(existingVals);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter an idea title.');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let savedId: string;
    if (editingIdea) {
      IdeasRepository.update(editingIdea.id, {
        title,
        description,
        category,
        tags: tagsArray,
        isPinned,
      });
      savedId = editingIdea.id;
    } else {
      const created = IdeasRepository.create({
        title,
        description,
        category,
        tags: tagsArray,
        isPinned,
      });
      savedId = created.id;
    }

    if (Object.keys(customFieldValues).length > 0) {
      CustomizationRepository.saveFieldValues('ideas', savedId, customFieldValues);
    }

    setModalVisible(false);
    loadIdeas();
  };

  const handleDelete = (idea: Idea) => {
    Alert.alert(
      'Delete Idea',
      `Are you sure you want to delete "${idea.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            IdeasRepository.delete(idea.id);
            loadIdeas();
          },
        },
      ]
    );
  };

  const handleTogglePin = (idea: Idea) => {
    IdeasRepository.togglePin(idea.id);
    loadIdeas();
  };

  return (
    <Screen backgroundColor={colors.background} contentContainerStyle={styles.screenPadding}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.openDrawer()}
            style={[styles.menuBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Open Menu"
          >
            <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.title, typography.h1, { color: colors.textPrimary }]}>Ideas</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <ViewModeSwitcher pageKey="ideas" />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenAdd}
            style={[styles.addBtn, { backgroundColor: colors.accentMint, marginLeft: 8 }]}
            accessibilityRole="button"
            accessibilityLabel="Add Idea"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Category Filter Row */}
      <View style={styles.searchAndFilterRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border, flex: 1 }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, typography.body, { color: colors.textPrimary }]}
            placeholder="Search ideas or tags..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={(text) => setSearch(text)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Dropdown Filter Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          style={[
            styles.filterDropdownBtn,
            {
              backgroundColor: colors.surface,
              borderColor: isFilterDropdownOpen ? colors.primary : colors.border,
            },
          ]}
        >
          <Ionicons name="filter-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[typography.captionBold, { color: colors.textPrimary }]}>
            {selectedCategory}
          </Text>
          <Ionicons
            name={isFilterDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textSecondary}
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Dropdown Menu */}
      {isFilterDropdownOpen && (
        <View style={[styles.filterDropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.dropdownItem,
                selectedCategory === cat && { backgroundColor: colors.accentMint },
              ]}
              onPress={() => {
                setSelectedCategory(cat);
                setIsFilterDropdownOpen(false);
              }}
            >
              <Text
                style={[
                  typography.bodyMedium,
                  { color: selectedCategory === cat ? colors.primary : colors.textPrimary },
                ]}
              >
                {cat}
              </Text>
              {selectedCategory === cat && (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Ideas Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listPadding,
          viewMode === 'grid' && styles.gridContainer,
        ]}
      >
        {filteredIdeas.length === 0 ? (
          <EmptyState
            icon="bulb-outline"
            title="No ideas found"
            description="Tap the + icon in header to capture your thoughts."
            actionTitle="+ New Idea"
            onAction={handleOpenAdd}
          />
        ) : (
          filteredIdeas.map((idea) => {
            const tags: string[] = idea.tags ? JSON.parse(idea.tags) : [];

            // 1. Compact View Mode
            if (viewMode === 'compact') {
              return (
                <Card key={idea.id} style={styles.compactCard}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenEdit(idea)}
                    style={styles.compactRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                        {idea.title}
                      </Text>
                    </View>
                    <View style={[styles.compactBadge, { backgroundColor: colors.accentMint }]}>
                      <Text style={[typography.captionBold, { color: colors.primary, fontSize: 10 }]}>
                        {idea.category}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Card>
              );
            }

            // 2. List View Mode
            if (viewMode === 'list') {
              return (
                <Card key={idea.id} style={styles.listCard}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenEdit(idea)}
                    style={styles.listRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                        {idea.title}
                      </Text>
                      {idea.description ? (
                        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                          {idea.description}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={[typography.captionBold, { color: colors.primary }]}>
                      {idea.category}
                    </Text>
                  </TouchableOpacity>
                </Card>
              );
            }

            // 3. Grid View Mode
            if (viewMode === 'grid') {
              return (
                <Card key={idea.id} style={styles.gridCard}>
                  <TouchableOpacity activeOpacity={0.8} onPress={() => handleOpenEdit(idea)}>
                    <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={2}>
                      {idea.title}
                    </Text>
                    {idea.description ? (
                      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
                        {idea.description}
                      </Text>
                    ) : null}
                    <View style={[styles.compactBadge, { backgroundColor: colors.accentMint, alignSelf: 'flex-start', marginTop: 8 }]}>
                      <Text style={[typography.captionBold, { color: colors.primary, fontSize: 10 }]}>
                        {idea.category}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Card>
              );
            }

            // 4. Card View Mode (Default)
            return (
              <Card key={idea.id} style={styles.ideaCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, typography.h3, { color: colors.textPrimary }]}>
                      {idea.title}
                    </Text>
                    <Text style={[styles.cardDate, typography.caption, { color: colors.textMuted }]}>
                      {idea.created_at.split('T')[0]} · {idea.category}
                    </Text>
                  </View>

                  <View style={styles.cardHeaderActions}>
                    <TouchableOpacity
                      onPress={() => handleTogglePin(idea)}
                      style={styles.iconBtn}
                      accessibilityLabel="Pin idea"
                    >
                      <Ionicons
                        name={idea.is_pinned === 1 ? 'pin' : 'pin-outline'}
                        size={18}
                        color={idea.is_pinned === 1 ? colors.orange : colors.textMuted}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(idea)}
                      style={styles.iconBtn}
                      accessibilityLabel="Edit idea"
                    >
                      <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(idea)}
                      style={styles.iconBtn}
                      accessibilityLabel="Delete idea"
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                {idea.description ? (
                  <Text style={[styles.cardDescription, typography.body, { color: colors.textSecondary }]}>
                    {idea.description}
                  </Text>
                ) : null}

                {/* Custom Fields Badges */}
                <CustomFieldsBadgeRow entityType="ideas" entityId={idea.id} />

                {tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {tags.map((tag, idx) => (
                      <View key={idx} style={[styles.tagBadge, { backgroundColor: colors.accentMint }]}>
                        <Text style={[typography.caption, { color: colors.primary }]}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Add / Edit Idea Modal */}
      <BottomSheetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingIdea ? 'Edit Idea' : 'Capture an Idea'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
          <Text style={[styles.label, typography.captionBold, { color: colors.textSecondary }]}>
            TITLE *
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="What's your idea?"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, typography.captionBold, { color: colors.textSecondary }]}>
            CATEGORY
          </Text>
          <View style={styles.catGrid}>
            {categories.filter((c) => c !== 'All').map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.catChip,
                  category === c && { backgroundColor: colors.primary, borderColor: colors.primary },
                  { borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: category === c ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, typography.captionBold, { color: colors.textSecondary }]}>
            DESCRIPTION
          </Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Add details, notes, or next steps..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.label, typography.captionBold, { color: colors.textSecondary }]}>
            TAGS (comma separated)
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="growth, feature, quick"
            placeholderTextColor={colors.textMuted}
            value={tagsInput}
            onChangeText={setTagsInput}
          />

          {/* Custom Fields Section */}
          <CustomFieldsSection
            entityType="ideas"
            values={customFieldValues}
            onChange={(k, v) => setCustomFieldValues((prev) => ({ ...prev, [k]: v }))}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setModalVisible(false)}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title={editingIdea ? 'Save Changes' : 'Save Idea'}
              onPress={handleSave}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </ScrollView>
      </BottomSheetModal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenPadding: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchAndFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  filterDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterDropdownMenu: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 6,
    marginBottom: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  listPadding: {
    paddingBottom: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  compactCard: {
    marginBottom: 8,
    padding: 10,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  listCard: {
    marginBottom: 8,
    padding: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    marginBottom: 10,
    padding: 10,
  },
  ideaCard: {
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontWeight: '700',
  },
  cardDate: {
    marginTop: 2,
  },
  cardHeaderActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    padding: 4,
  },
  cardDescription: {
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  formContainer: {
    paddingBottom: 24,
  },
  label: {
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    height: 90,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
});
