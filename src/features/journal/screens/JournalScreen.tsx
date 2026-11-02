import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { MoodPicker } from '../../../components/ui/MoodPicker';
import { Chip } from '../../../components/ui/Chip';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../hooks/useTheme';
import { JournalRepository, JournalEntry } from '../journal.repository';

const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '😊',
  5: '🤩',
};

export const JournalScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();
  const todayStr = new Date().toISOString().split('T')[0];

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [mood, setMood] = useState<number>(5);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Productive', 'Study']);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const defaultTags = ['Productive', 'Study', 'Happy', 'Workout', 'Reading', 'Grateful'];

  const loadEntries = useCallback(() => {
    const list = JournalRepository.getEntries();
    setEntries(list);

    // If today has an entry, prepopulate form
    const todayEntry = JournalRepository.getEntryByDate(todayStr);
    if (todayEntry) {
      setMood(todayEntry.mood);
      setContent(todayEntry.content);
      if (todayEntry.tags) {
        try {
          setSelectedTags(JSON.parse(todayEntry.tags));
        } catch {
          // safe
        }
      }
    }
  }, [todayStr]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
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

    Alert.alert('Saved', 'Your reflection for today has been saved offline.');
    loadEntries();
  };

  return (
    <Screen scroll backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary }]}>
          My Journal
        </Text>

        {/* Tabs: Daily, Weekly, Monthly */}
        <SegmentedTabs
          tabs={[
            { key: 'daily', label: 'Daily' },
            { key: 'weekly', label: 'Weekly' },
            { key: 'monthly', label: 'Monthly' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Today's Reflection Composer Card */}
        <Card variant="elevated" style={styles.composeCard}>
          <Text style={[styles.sectionHeading, typography.h3, { color: colors.textPrimary }]}>
            How was your day?
          </Text>

          {/* Mood Emojis */}
          <MoodPicker value={mood} onChange={setMood} />

          {/* Thoughts Text Area */}
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write your thoughts, wins, and reflections..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={5}
            style={[
              styles.textArea,
              typography.body,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
          />

          {/* Tag Pills */}
          <Text style={[styles.tagsLabel, typography.captionBold, { color: colors.textSecondary }]}>
            Tags:
          </Text>
          <View style={styles.tagsContainer}>
            {defaultTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>

          {/* Save Button */}
          <Button
            title="Save Entry"
            onPress={handleSaveEntry}
            variant="primary"
            size="lg"
            style={{ marginTop: 12 }}
          />
        </Card>

        {/* Past Journal Entries */}
        <Text style={[styles.pastEntriesTitle, typography.h2, { color: colors.textPrimary }]}>
          Past Reflections
        </Text>

        <View style={styles.entriesList}>
          {entries.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                No past reflections yet. Write your first entry above!
              </Text>
            </Card>
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

              return (
                <Card key={item.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryDateRow}>
                      <Text style={{ fontSize: 24, marginRight: 8 }}>
                        {MOOD_EMOJIS[item.mood] || '😊'}
                      </Text>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                        {item.date}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.entryContent, typography.body, { color: colors.textSecondary }]}>
                    {item.content}
                  </Text>

                  {tagsArray.length > 0 && (
                    <View style={styles.entryTagsRow}>
                      {tagsArray.map((t, idx) => (
                        <View
                          key={idx}
                          style={[styles.smallBadge, { backgroundColor: colors.accentMint }]}
                        >
                          <Text style={[typography.captionBold, { color: colors.primary }]}>
                            #{t}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontWeight: '800',
    marginVertical: 8,
  },
  composeCard: {
    padding: 18,
    marginBottom: 24,
  },
  sectionHeading: {
    fontWeight: '700',
  },
  textArea: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    textAlignVertical: 'top',
    marginVertical: 12,
  },
  tagsLabel: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pastEntriesTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  entriesList: {
    gap: 12,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  entryCard: {
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryContent: {
    lineHeight: 22,
  },
  entryTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
