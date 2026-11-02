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
import { IdeasRepository } from '../ideas.repository';
import { Idea } from '../ideas.types';

const CATEGORIES = ['All', 'App', 'Career', 'Creative', 'Business', 'Personal', 'General'];

export const IdeasScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const loadIdeas = useCallback(() => {
    const list = IdeasRepository.getAll(search);
    setIdeas(list);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      loadIdeas();
    }, [loadIdeas])
  );

  const filteredIdeas = useMemo(() => {
    if (selectedCategory === 'All') return ideas;
    return ideas.filter(
      (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [ideas, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingIdea(null);
    setTitle('');
    setDescription('');
    setCategory('General');
    setIsCategoryDropdownOpen(false);
    setTagsInput('');
    setIsPinned(false);
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

    if (editingIdea) {
      IdeasRepository.update(editingIdea.id, {
        title,
        description,
        category,
        tags: tagsArray,
        isPinned,
      });
    } else {
      IdeasRepository.create({
        title,
        description,
        category,
        tags: tagsArray,
        isPinned,
      });
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
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              brainstorm & create
            </Text>
          </View>
        </View>

        {/* Top button with only + icon like other screens */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenAdd}
          style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
          accessibilityRole="button"
          accessibilityLabel="Add Idea"
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
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
            onChangeText={(text) => {
              setSearch(text);
            }}
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

      {/* Filter Dropdown Menu (when open) */}
      {isFilterDropdownOpen && (
        <View style={[styles.filterDropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {CATEGORIES.map((cat) => (
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
                  typography.body,
                  {
                    color: selectedCategory === cat ? colors.primary : colors.textPrimary,
                    fontWeight: selectedCategory === cat ? '700' : '400',
                  },
                ]}
              >
                {cat}
              </Text>
              {selectedCategory === cat && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Ideas List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredIdeas.length === 0 ? (
          <EmptyState
            icon="bulb-outline"
            title="No ideas yet"
            description="Got a sudden spark or thought? Tap New to jot it down!"
            actionTitle="New Idea"
            onAction={handleOpenAdd}
          />
        ) : (
          filteredIdeas.map((idea) => {
            const parsedTags: string[] = idea.tags ? JSON.parse(idea.tags) : [];
            const dateStr = new Date(idea.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <Card key={idea.id} variant="elevated" style={styles.ideaCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    {idea.is_pinned === 1 && (
                      <Ionicons
                        name="pin"
                        size={16}
                        color={colors.orange}
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text
                      style={[styles.ideaTitle, typography.h3, { color: colors.textPrimary }]}
                      numberOfLines={2}
                    >
                      {idea.title}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => handleTogglePin(idea)}
                      style={styles.iconAction}
                      accessibilityLabel="Pin Idea"
                    >
                      <Ionicons
                        name={idea.is_pinned === 1 ? 'pin' : 'pin-outline'}
                        size={18}
                        color={idea.is_pinned === 1 ? colors.orange : colors.textMuted}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(idea)}
                      style={styles.iconAction}
                      accessibilityLabel="Edit Idea"
                    >
                      <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(idea)}
                      style={styles.iconAction}
                      accessibilityLabel="Delete Idea"
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                {idea.description ? (
                  <Text
                    style={[styles.ideaDescription, typography.body, { color: colors.textSecondary }]}
                    numberOfLines={4}
                  >
                    {idea.description}
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <View style={styles.tagsContainer}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.accentMint, borderColor: colors.primary + '30' },
                      ]}
                    >
                      <Text style={[typography.captionBold, { color: colors.primary }]}>
                        {idea.category}
                      </Text>
                    </View>
                    {parsedTags.map((tag, idx) => (
                      <View key={idx} style={[styles.tagBadge, { backgroundColor: colors.background }]}>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          #{tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>{dateStr}</Text>
                </View>
              </Card>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal: Quick Capture / Edit */}
      <BottomSheetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingIdea ? 'Edit Idea' : 'New Idea'}
      >
        <View style={styles.modalContent}>
          <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
            IDEA TITLE *
          </Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g., Personal productivity assistant app"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 12 }]}>
            DESCRIPTION / NOTES
          </Text>
          <TextInput
            style={[
              styles.modalInput,
              styles.modalTextArea,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
            ]}
            placeholder="Outline your thoughts, next steps, or key takeaways..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {/* Category Dropdown (replacing column list) */}
          <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 12 }]}>
            CATEGORY
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            style={[
              styles.categoryDropdownTrigger,
              {
                backgroundColor: colors.surface,
                borderColor: isCategoryDropdownOpen ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.categoryColorDot, { backgroundColor: colors.primary }]} />
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                {category}
              </Text>
            </View>
            <Ionicons
              name={isCategoryDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {isCategoryDropdownOpen && (
            <View style={[styles.categoryDropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.dropdownItem,
                    category.toLowerCase() === c.toLowerCase() && { backgroundColor: colors.accentMint },
                  ]}
                  onPress={() => {
                    setCategory(c);
                    setIsCategoryDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      typography.body,
                      {
                        color: category.toLowerCase() === c.toLowerCase() ? colors.primary : colors.textPrimary,
                        fontWeight: category.toLowerCase() === c.toLowerCase() ? '700' : '400',
                      },
                    ]}
                  >
                    {c}
                  </Text>
                  {category.toLowerCase() === c.toLowerCase() && (
                    <Ionicons name="checkmark" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 12 }]}>
            TAGS (comma-separated)
          </Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g., mobile, react-native, ai"
            placeholderTextColor={colors.textMuted}
            value={tagsInput}
            onChangeText={setTagsInput}
          />

          <TouchableOpacity
            style={styles.pinCheckbox}
            onPress={() => setIsPinned(!isPinned)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPinned ? 'checkbox' : 'square-outline'}
              size={22}
              color={isPinned ? colors.primary : colors.textMuted}
            />
            <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 8 }]}>
              Pin to top for quick reference
            </Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setModalVisible(false)}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title={editingIdea ? 'Save Changes' : 'New Idea'}
              variant="primary"
              onPress={handleSave}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      </BottomSheetModal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenPadding: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchAndFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  filterDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterDropdownMenu: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  list: {
    flex: 1,
  },
  ideaCard: {
    marginBottom: 14,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  ideaTitle: {
    fontWeight: '700',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconAction: {
    padding: 6,
  },
  ideaDescription: {
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modalContent: {
    paddingBottom: 20,
  },
  inputLabel: {
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  categoryDropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categoryColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryDropdownMenu: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  pinCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
});
