import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { useTheme } from '../../../hooks/useTheme';
import { IdeasRepository } from '../ideas.repository';
import { Idea } from '../ideas.types';

const CATEGORIES = ['All', 'App', 'Career', 'Creative', 'Business', 'Personal'];

export const IdeasScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
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
    setTagsInput('');
    setIsPinned(false);
    setModalVisible(true);
  };

  const handleOpenEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setDescription(idea.description || '');
    setCategory(idea.category || 'General');
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
              Capture thoughts, brainstorm & create
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenAdd}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Capture Idea"
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={[typography.button, { color: '#FFFFFF', marginLeft: 4 }]}>Capture</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <Chip
              key={cat}
              label={cat}
              selected={isSelected}
              onPress={() => setSelectedCategory(cat)}
              style={styles.categoryChip}
            />
          );
        })}
      </ScrollView>

      {/* Ideas List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredIdeas.length === 0 ? (
          <EmptyState
            icon="bulb-outline"
            title="No ideas yet"
            description="Got a sudden spark or thought? Tap Capture to jot it down!"
            actionTitle="Capture an Idea"
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
        title={editingIdea ? 'Edit Idea' : 'Capture New Idea'}
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

          <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 12 }]}>
            CATEGORY
          </Text>
          <View style={styles.categorySelectRow}>
            {CATEGORIES.filter((c) => c !== 'All').map((c) => (
              <Chip
                key={c}
                label={c}
                selected={category.toLowerCase() === c.toLowerCase()}
                onPress={() => setCategory(c)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>

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
              title={editingIdea ? 'Save Changes' : 'Capture Idea'}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  categoriesScroll: {
    flexDirection: 'row',
    paddingBottom: 12,
    gap: 8,
  },
  categoryChip: {
    marginRight: 4,
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
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
