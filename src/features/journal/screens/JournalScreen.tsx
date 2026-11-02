import React, { useState, useCallback } from 'react';
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
  const todayStr = new Date().toISOString().split('T')[0];

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Composer / Add State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [mood, setMood] = useState<number>(5);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Productive', 'Study']);

  // Detail Modal State (Requirement 4)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editMood, setEditMood] = useState<number>(5);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);

  const defaultTags = ['Productive', 'Study', 'Happy', 'Workout', 'Reading', 'Grateful', 'Focus', 'Mindset'];

  const loadEntries = useCallback(() => {
    const list = JournalRepository.getEntries();
    setEntries(list);

    // Refresh selected entry if open
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

    JournalRepository.saveEntry({
      date: todayStr,
      mood,
      content: content.trim(),
      tags: selectedTags,
    });

    setContent('');
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
            <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary, marginLeft: 12 }]}>
              My Journal
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsComposeOpen(true)}
            style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="New Reflection"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
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

        {/* Compact List of Journal Entries (Requirement 4) */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.scrollPadding}
          showsVerticalScrollIndicator={false}
        >
          {entries.length === 0 ? (
            <EmptyState
              icon="book-outline"
              title="No reflections recorded"
              description="Capture thoughts, daily gratitudes, and emotional momentum."
              actionTitle="Write First Reflection"
              onAction={() => setIsComposeOpen(true)}
            />
          ) : (
            entries.map((item) => {
              let tagsArray: string[] = [];
              if (item.tags) {
                try {
                  tagsArray = JSON.parse(item.tags);
                } catch {
                  // safe
                }
              }

              // Extract first sentence/line as title, rest as preview
              const lines = item.content.split('\n').filter(Boolean);
              const previewTitle = lines[0] || 'Daily Reflection';
              const previewSnippet = lines.slice(1).join(' ') || item.content;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.75}
                  onPress={() => handleOpenDetail(item)}
                >
                  <Card style={styles.compactCard}>
                    <View style={styles.compactRow}>
                      <View style={[styles.moodBadge, { backgroundColor: colors.accentMint }]}>
                        <Text style={{ fontSize: 24 }}>{MOOD_EMOJIS[item.mood] || '😊'}</Text>
                      </View>

                      <View style={styles.compactInfo}>
                        <View style={styles.compactHeader}>
                          <Text
                            style={[styles.compactTitle, typography.bodyBold, { color: colors.textPrimary }]}
                            numberOfLines={1}
                          >
                            {previewTitle}
                          </Text>
                          <Text style={[typography.caption, { color: colors.textMuted }]}>
                            {item.date}
                          </Text>
                        </View>

                        <Text
                          style={[styles.compactSnippet, typography.caption, { color: colors.textSecondary }]}
                          numberOfLines={2}
                        >
                          {previewSnippet}
                        </Text>

                        {tagsArray.length > 0 && (
                          <View style={styles.compactTagsRow}>
                            {tagsArray.slice(0, 3).map((tag, idx) => (
                              <View
                                key={idx}
                                style={[styles.compactTag, { backgroundColor: colors.background }]}
                              >
                                <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 11 }]}>
                                  #{tag}
                                </Text>
                              </View>
                            ))}
                            {tagsArray.length > 3 && (
                              <Text style={[typography.caption, { color: colors.textMuted, fontSize: 11 }]}>
                                +{tagsArray.length - 3}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textMuted}
                        style={{ marginLeft: 6 }}
                      />
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Compose New Entry Modal */}
        <BottomSheetModal
          visible={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          title="Daily Reflection"
        >
          <View style={styles.modalContent}>
            <Text style={[styles.sectionHeading, typography.captionBold, { color: colors.textSecondary }]}>
              HOW WAS YOUR DAY?
            </Text>
            <MoodPicker value={mood} onChange={setMood} />

            <Text style={[styles.sectionHeading, typography.captionBold, { color: colors.textSecondary, marginTop: 14 }]}>
              YOUR THOUGHTS & WINS *
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="What went well today? What did you learn?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={[
                styles.modalTextArea,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
              autoFocus
            />

            <Text style={[styles.sectionHeading, typography.captionBold, { color: colors.textSecondary, marginTop: 14 }]}>
              TAGS
            </Text>
            <View style={styles.tagsContainer}>
              {defaultTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={selectedTags.includes(tag)}
                  onPress={() => toggleTag(tag)}
                  style={{ marginRight: 6, marginBottom: 6 }}
                />
              ))}
            </View>

            <Button
              title="Save Reflection"
              onPress={handleSaveEntry}
              variant="primary"
              style={{ marginTop: 20 }}
            />
          </View>
        </BottomSheetModal>

        {/* Full Detail View Modal (Requirement 4) */}
        {selectedEntry && (
          <BottomSheetModal
            visible={!!selectedEntry && !isEditOpen}
            onClose={() => setSelectedEntry(null)}
            title="Reflection Detail"
          >
            <View style={styles.detailContainer}>
              <View style={styles.detailHeader}>
                <View style={[styles.detailMoodCircle, { backgroundColor: colors.accentMint }]}>
                  <Text style={{ fontSize: 32 }}>{MOOD_EMOJIS[selectedEntry.mood] || '😊'}</Text>
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {selectedEntry.date}
                  </Text>
                  <Text style={[typography.caption, { color: colors.primary, fontWeight: '600', marginTop: 2 }]}>
                    Mood: {MOOD_LABELS[selectedEntry.mood] || 'Good'}
                  </Text>
                </View>
              </View>

              <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                <Text style={[styles.detailBodyText, typography.body, { color: colors.textPrimary }]}>
                  {selectedEntry.content}
                </Text>

                {selectedEntry.tags && (
                  <View style={styles.detailTagsWrapper}>
                    {JSON.parse(selectedEntry.tags).map((t: string, idx: number) => (
                      <View key={idx} style={[styles.detailTagBadge, { backgroundColor: colors.accentMint }]}>
                        <Text style={[typography.captionBold, { color: colors.primary }]}>
                          #{t}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              <View style={styles.detailActionsRow}>
                <Button
                  title="Edit Entry"
                  variant="primary"
                  onPress={() => handleOpenEdit(selectedEntry)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Delete"
                  variant="ghost"
                  onPress={() => handleDeleteEntry(selectedEntry)}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          </BottomSheetModal>
        )}

        {/* Edit Entry Modal */}
        <BottomSheetModal
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Reflection"
        >
          <View style={styles.modalContent}>
            <Text style={[styles.sectionHeading, typography.captionBold, { color: colors.textSecondary }]}>
              MOOD
            </Text>
            <MoodPicker value={editMood} onChange={setEditMood} />

            <Text style={[styles.sectionHeading, typography.captionBold, { color: colors.textSecondary, marginTop: 14 }]}>
              REFLECTION CONTENT *
            </Text>
            <TextInput
              value={editContent}
              onChangeText={setEditContent}
              multiline
              numberOfLines={5}
              style={[
                styles.modalTextArea,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.sectionHeading, typography.captionBold, { color: colors.textSecondary, marginTop: 14 }]}>
              TAGS
            </Text>
            <View style={styles.tagsContainer}>
              {defaultTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={editTags.includes(tag)}
                  onPress={() => toggleTag(tag, true)}
                  style={{ marginRight: 6, marginBottom: 6 }}
                />
              ))}
            </View>

            <View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsEditOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Changes"
                variant="primary"
                onPress={handleSaveEdit}
                style={{ flex: 2 }}
              />
            </View>
          </View>
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
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  scrollPadding: {
    paddingBottom: 110,
  },
  compactCard: {
    marginBottom: 12,
    padding: 14,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  compactTitle: {
    flex: 1,
    marginRight: 8,
  },
  compactSnippet: {
    lineHeight: 18,
    marginBottom: 6,
  },
  compactTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalContent: {
    paddingBottom: 20,
  },
  sectionHeading: {
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalTextArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailContainer: {
    paddingBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailMoodCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailScroll: {
    maxHeight: 280,
    marginBottom: 16,
  },
  detailBodyText: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailTagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  detailTagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
