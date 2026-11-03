import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { MoodPicker } from '../../../components/ui/MoodPicker';
import { Chip } from '../../../components/ui/Chip';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { useTheme } from '../../../hooks/useTheme';
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { CustomizationRepository } from '../../customization/customization.repository';
import { ViewModeSwitcher } from '../../customization/components/ViewModeSwitcher';
import { CustomFieldsSection } from '../../customization/components/CustomFieldsSection';
import { CustomFieldsBadgeRow } from '../../customization/components/CustomFieldsBadgeRow';
import { sortItemsByLayout } from '../../customization/layout.utils';
import { JournalRepository, JournalEntry } from '../journal.repository';

const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '😊',
  5: '🤩',
};

const MOOD_LABELS: Record<number, string> = {
  1: 'Very Low',
  2: 'Down',
  3: 'Neutral',
  4: 'Good',
  5: 'Amazing',
};

export const JournalScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const pageLayout = useCustomizationStore((state) => state.pageLayouts['journal']);
  const todayStr = new Date().toISOString().split('T')[0];

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    'Productive', 'Study', 'Happy', 'Workout', 'Reading', 'Grateful', 'Focus', 'Mindset'
  ]);

  // Composer / Add State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [mood, setMood] = useState<number>(5);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Productive', 'Study']);
  const [addCustomValues, setAddCustomValues] = useState<Record<string, any>>({});

  // Detail Modal State
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editMood, setEditMood] = useState<number>(5);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editCustomValues, setEditCustomValues] = useState<Record<string, any>>({});

  const loadEntries = useCallback(() => {
    const list = JournalRepository.getEntries();
    setEntries(list);

    // Load custom categories for journal tags
    const customCats = CustomizationRepository.getCategories('journal');
    const baseTags = ['Productive', 'Study', 'Happy', 'Workout', 'Reading', 'Grateful', 'Focus', 'Mindset'];
    customCats.forEach((c) => {
      if (!baseTags.includes(c.name)) baseTags.push(c.name);
    });
    setAvailableTags(baseTags);

    if (selectedEntry) {
      const refreshed = list.find((e) => e.id === selectedEntry.id);
      setSelectedEntry(refreshed || null);
    }
  }, [selectedEntry?.id]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const toggleTag = (tag: string, isEditing = false) => {
    if (isEditing) {
      if (editTags.includes(tag)) {
        setEditTags(editTags.filter((t) => t !== tag));
      } else {
        setEditTags([...editTags, tag]);
      }
    } else {
      if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
      } else {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleSaveEntry = () => {
    if (!content.trim()) {
      Alert.alert('Required', 'Please write a few thoughts about your day.');
      return;
    }

    const created = JournalRepository.saveEntry({
      date: todayStr,
      mood,
      content: content.trim(),
      tags: selectedTags,
    });

    if (created && Object.keys(addCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('journal', created.id, addCustomValues);
    }

    setContent('');
    setAddCustomValues({});
    setIsComposeOpen(false);
    loadEntries();
  };

  const handleOpenDetail = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditMood(entry.mood);
    setEditContent(entry.content);
    let parsed: string[] = [];
    if (entry.tags) {
      try {
        parsed = JSON.parse(entry.tags);
      } catch {
        parsed = [];
      }
    }
    setEditTags(parsed);
    const existingVals = CustomizationRepository.getFieldValues('journal', entry.id);
    setEditCustomValues(existingVals);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedEntry || !editContent.trim()) {
      Alert.alert('Required', 'Please write your reflection content.');
      return;
    }

    JournalRepository.updateEntry(selectedEntry.id, {
      mood: editMood,
      content: editContent.trim(),
      tags: editTags,
    });

    if (Object.keys(editCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('journal', selectedEntry.id, editCustomValues);
    }

    setIsEditOpen(false);
    loadEntries();
  };

  const handleDeleteEntry = (entry: JournalEntry) => {
    Alert.alert(
      'Delete Reflection',
      `Are you sure you want to delete your journal entry from ${entry.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            JournalRepository.deleteEntry(entry.id);
            setSelectedEntry(null);
            setIsEditOpen(false);
            loadEntries();
          },
        },
      ]
    );
  };

  const sortedEntries = useMemo(() => {
    return sortItemsByLayout(entries, pageLayout);
  }, [entries, pageLayout]);

  const viewMode = pageLayout?.viewMode || 'card';

  return (
    <Screen backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Header */}
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
            <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary, marginLeft: 12 }]} numberOfLines={1}>
              My Journal
            </Text>
          </View>

          <View style={styles.headerRight}>
            <ViewModeSwitcher pageKey="journal" />
            <TouchableOpacity
              onPress={() => setIsComposeOpen(true)}
              style={[styles.addBtn, { backgroundColor: colors.accentMint, marginLeft: 8 }]}
              accessibilityRole="button"
              accessibilityLabel="New Reflection"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Filters */}
        <SegmentedTabs
          tabs={[
            { key: 'daily', label: 'Daily' },
            { key: 'weekly', label: 'Weekly' },
            { key: 'monthly', label: 'Monthly' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          style={{ marginBottom: 16 }}
        />

        {/* List of Journal Entries */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={[
            styles.scrollPadding,
            viewMode === 'grid' && styles.gridContainer,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {sortedEntries.length === 0 ? (
            <EmptyState
              icon="book-outline"
              title="No reflections recorded yet"
              description="Capture your thoughts, mood, and daily milestones."
              actionTitle="Write First Reflection"
              onAction={() => setIsComposeOpen(true)}
            />
          ) : (
            sortedEntries.map((item) => {
              const tags: string[] = item.tags ? JSON.parse(item.tags) : [];

              // 1. Compact View Mode
              if (viewMode === 'compact') {
                return (
                  <Card key={item.id} style={styles.compactCard}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOpenDetail(item)}
                      style={styles.compactRow}
                    >
                      <Text style={{ fontSize: 18, marginRight: 8 }}>{MOOD_EMOJIS[item.mood] || '😊'}</Text>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                        {item.content}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 6 }]}>
                        {item.date}
                      </Text>
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 2. List View Mode
              if (viewMode === 'list') {
                return (
                  <Card key={item.id} style={styles.listCard}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOpenDetail(item)}
                      style={styles.listRow}
                    >
                      <View style={[styles.moodCircle, { backgroundColor: colors.accentMint, width: 36, height: 36, borderRadius: 18 }]}>
                        <Text style={{ fontSize: 20 }}>{MOOD_EMOJIS[item.mood] || '😊'}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
                          {item.date}
                        </Text>
                        <Text style={[typography.body, { color: colors.textPrimary }]} numberOfLines={1}>
                          {item.content}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 3. Grid View Mode
              if (viewMode === 'grid') {
                return (
                  <Card key={item.id} style={styles.gridCard}>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => handleOpenDetail(item)}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 22 }}>{MOOD_EMOJIS[item.mood] || '😊'}</Text>
                        <Text style={[typography.caption, { color: colors.textMuted, fontSize: 10 }]}>
                          {item.date}
                        </Text>
                      </View>
                      <Text style={[typography.body, { color: colors.textPrimary, marginTop: 6 }]} numberOfLines={3}>
                        {item.content}
                      </Text>
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 4. Card View Mode (Default)
              return (
                <Card key={item.id} style={styles.entryCard}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleOpenDetail(item)}
                  >
                    <View style={styles.entryHeader}>
                      <View style={styles.entryHeaderLeft}>
                        <View style={[styles.moodCircle, { backgroundColor: colors.accentMint }]}>
                          <Text style={{ fontSize: 24 }}>{MOOD_EMOJIS[item.mood] || '😊'}</Text>
                        </View>
                        <View style={{ marginLeft: 12 }}>
                          <Text style={[typography.h3, { color: colors.textPrimary }]}>
                            {item.date}
                          </Text>
                          <Text style={[typography.caption, { color: colors.textSecondary }]}>
                            Feeling {MOOD_LABELS[item.mood] || 'Good'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.entryActions}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(item);
                          }}
                          style={styles.actionIconBtn}
                          accessibilityLabel="Edit Entry"
                        >
                          <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteEntry(item);
                          }}
                          style={styles.actionIconBtn}
                          accessibilityLabel="Delete Entry"
                        >
                          <Ionicons name="trash-outline" size={18} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text
                      style={[styles.entryText, typography.body, { color: colors.textPrimary }]}
                      numberOfLines={3}
                    >
                      {item.content}
                    </Text>

                    {/* Custom Fields Badges */}
                    <CustomFieldsBadgeRow entityType="journal" entityId={item.id} />

                    {tags.length > 0 && (
                      <View style={styles.tagsRow}>
                        {tags.map((t, idx) => (
                          <View key={idx} style={[styles.tagBadge, { backgroundColor: colors.accentMint }]}>
                            <Text style={[typography.caption, { color: colors.primary }]}>#{t}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                </Card>
              );
            })
          )}
        </ScrollView>

        {/* Compose Reflection Modal */}
        <BottomSheetModal
          visible={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          title="Daily Reflection"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.composerForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              HOW ARE YOU FEELING TODAY?
            </Text>
            <MoodPicker value={mood} onChange={setMood} />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 16 }]}>
              YOUR REFLECTION
            </Text>
            <TextInput
              style={[
                styles.composerInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
              multiline
              numberOfLines={6}
              placeholder="What went well today? What did you learn? What will you do better tomorrow?"
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={setContent}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 16 }]}>
              CATEGORIES & TAGS
            </Text>
            <View style={styles.tagGrid}>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    selected={isSelected}
                    onPress={() => toggleTag(tag)}
                    style={styles.tagChip}
                  />
                );
              })}
            </View>

            {/* Custom Fields Section */}
            <CustomFieldsSection
              entityType="journal"
              values={addCustomValues}
              onChange={(k, v) => setAddCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

            <Button
              title="Save Reflection"
              onPress={handleSaveEntry}
              style={{ marginTop: 20 }}
            />
          </ScrollView>
        </BottomSheetModal>

        {/* Detail Modal */}
        {selectedEntry && (
          <BottomSheetModal
            visible={!!selectedEntry && !isEditOpen}
            onClose={() => setSelectedEntry(null)}
            title="Reflection Detail"
          >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContainer}>
              <View style={styles.detailHeader}>
                <View style={[styles.moodCircleLarge, { backgroundColor: colors.accentMint }]}>
                  <Text style={{ fontSize: 32 }}>{MOOD_EMOJIS[selectedEntry.mood] || '😊'}</Text>
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={[typography.h2, { color: colors.textPrimary }]}>
                    {selectedEntry.date}
                  </Text>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    Mood: {MOOD_LABELS[selectedEntry.mood] || 'Good'}
                  </Text>
                </View>
              </View>

              <Text style={[typography.body, { color: colors.textPrimary, lineHeight: 22, marginTop: 16 }]}>
                {selectedEntry.content}
              </Text>

              <CustomFieldsBadgeRow entityType="journal" entityId={selectedEntry.id} />

              <View style={{ flexDirection: 'row', marginTop: 24, gap: 10 }}>
                <Button
                  title="Edit"
                  variant="secondary"
                  onPress={() => handleOpenEdit(selectedEntry)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Delete"
                  variant="ghost"
                  onPress={() => handleDeleteEntry(selectedEntry)}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </BottomSheetModal>
        )}

        {/* Edit Modal */}
        <BottomSheetModal
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Reflection"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.composerForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              UPDATE MOOD
            </Text>
            <MoodPicker value={editMood} onChange={setEditMood} />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 16 }]}>
              UPDATE CONTENT
            </Text>
            <TextInput
              style={[
                styles.composerInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
              multiline
              numberOfLines={6}
              value={editContent}
              onChangeText={setEditContent}
            />

            {/* Custom Fields Section */}
            <CustomFieldsSection
              entityType="journal"
              values={editCustomValues}
              onChange={(k, v) => setEditCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

            <Button
              title="Save Changes"
              onPress={handleSaveEdit}
              style={{ marginTop: 20 }}
            />
          </ScrollView>
        </BottomSheetModal>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
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
    marginRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
    flexShrink: 1,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  scrollPadding: {
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
    marginBottom: 12,
    padding: 12,
  },
  entryCard: {
    marginBottom: 14,
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCircleLarge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    padding: 4,
  },
  entryText: {
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  composerForm: {
    paddingBottom: 24,
  },
  formLabel: {
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  composerInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    height: 120,
    textAlignVertical: 'top',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    marginBottom: 6,
  },
  detailContainer: {
    paddingBottom: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
