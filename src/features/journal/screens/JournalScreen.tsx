import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import {
  JournalRepository,
  JournalEntry,
} from '../journal.repository';
import {
  FormInput,
  FormTextArea,
} from '../../../components/forms';

const MOOD_FACES = [
  { value: 1, label: ':(' },
  { value: 2, label: ':/' },
  { value: 3, label: ':|' },
  { value: 4, label: ':)' },
  { value: 5, label: ':D' },
];

const RATING_NUMBERS = [1, 2, 3, 4, 5];

export const JournalScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form fields
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [recap, setRecap] = useState('');
  const [learned, setLearned] = useState('');
  const [moodRating, setMoodRating] = useState(4);
  const [energyRating, setEnergyRating] = useState(4);
  const [productivityRating, setProductivityRating] = useState(4);
  const [notes, setNotes] = useState('');

  const loadEntries = useCallback(() => {
    const list = JournalRepository.getEntries();
    setEntries(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const handleOpenNew = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const existing = JournalRepository.getEntryByDate(todayStr);
    if (existing) {
      handleOpenEdit(existing);
      return;
    }
    setEntryDate(todayStr);
    setRecap('');
    setLearned('');
    setMoodRating(4);
    setEnergyRating(4);
    setProductivityRating(4);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEntryDate(entry.date);
    setRecap(entry.recap);
    setLearned(entry.learned);
    setMoodRating(entry.mood_rating);
    setEnergyRating(entry.energy_rating);
    setProductivityRating(entry.productivity_rating);
    setNotes(entry.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!recap.trim() && !learned.trim()) {
      Alert.alert('Required', 'Please write a brief recap or lesson learned.');
      return;
    }

    JournalRepository.saveEntry({
      date: entryDate,
      recap: recap.trim(),
      learned: learned.trim(),
      mood_rating: moodRating,
      energy_rating: energyRating,
      productivity_rating: productivityRating,
      notes: notes.trim() || null,
    });

    setIsModalOpen(false);
    loadEntries();
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
            <Text style={[typography.h1, { color: colors.textPrimary }]}>Journal</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              Daily reflection - feeds your insights
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenNew}
            style={[styles.newBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[typography.captionBold, { color: colors.textPrimary }]}>+ New entry</Text>
          </TouchableOpacity>
        </View>

        {/* Section title */}
        <Text style={[typography.captionBold, { color: colors.textSecondary, letterSpacing: 0.8, marginBottom: 12 }]}>
          PAST ENTRIES
        </Text>

        {/* List of Entries */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {entries.length === 0 ? (
            <EmptyState
              icon="book-outline"
              title="No entries yet"
              description="Reflect on your day to power your offline AI insights."
              actionTitle="+ Add First Entry"
              onAction={handleOpenNew}
            />
          ) : (
            entries.map((entry) => {
              const moodObj = MOOD_FACES.find((m) => m.value === entry.mood_rating) || MOOD_FACES[3];
              const dateObj = parseISO(entry.date);
              const formattedDate = format(dateObj, 'EEE, MMM d');

              return (
                <TouchableOpacity
                  key={entry.id}
                  activeOpacity={0.75}
                  onPress={() => handleOpenEdit(entry)}
                >
                  <Card style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                        {formattedDate}
                      </Text>
                      <Text style={[styles.moodFaceText, { color: colors.textPrimary }]}>
                        {moodObj.label}
                      </Text>
                    </View>

                    {entry.recap ? (
                      <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginTop: 6 }]}>
                        {entry.recap}
                      </Text>
                    ) : null}

                    {entry.learned ? (
                      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 6 }]}>
                        Learned: {entry.learned}
                      </Text>
                    ) : null}

                    <View style={styles.cardFooter}>
                      <View style={styles.ratingsRow}>
                        <View style={[styles.ratingPill, { borderColor: colors.border }]}>
                          <Text style={[typography.captionBold, { color: '#3B82F6', fontSize: 10 }]}>
                            ENERGY {entry.energy_rating}
                          </Text>
                        </View>
                        <View style={[styles.ratingPill, { borderColor: colors.border }]}>
                          <Text style={[typography.captionBold, { color: '#22C55E', fontSize: 10 }]}>
                            PRODUCTIVITY {entry.productivity_rating}
                          </Text>
                        </View>
                      </View>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        Tap to edit
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* New / Edit Entry Modal */}
        <BottomSheetModal
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="New entry"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 12 }]}>
              {format(parseISO(entryDate), 'MM/dd/yyyy')}
            </Text>

            <FormTextArea
              label="How did today go?"
              value={recap}
              onChangeText={(text) => text.length <= 150 && setRecap(text)}
              placeholder="A quick recap of the day..."
              characterCount={{ current: recap.length, max: 150 }}
              numberOfLines={3}
            />

            <FormTextArea
              label="What did I learn?"
              value={learned}
              onChangeText={(text) => text.length <= 150 && setLearned(text)}
              placeholder="One lesson or insight..."
              characterCount={{ current: learned.length, max: 150 }}
              numberOfLines={2}
            />

            {/* Mood selector */}
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginTop: 8, marginBottom: 8 }]}>
              Mood
            </Text>
            <View style={styles.selectorRow}>
              {MOOD_FACES.map((m) => {
                const active = moodRating === m.value;
                return (
                  <TouchableOpacity
                    key={m.value}
                    onPress={() => setMoodRating(m.value)}
                    style={[
                      styles.choiceBtn,
                      {
                        backgroundColor: active ? colors.card : 'transparent',
                        borderColor: active ? colors.textPrimary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.faceText,
                        { color: active ? colors.textPrimary : colors.textSecondary },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Energy selector */}
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginTop: 12, marginBottom: 8 }]}>
              Energy
            </Text>
            <View style={styles.selectorRow}>
              {RATING_NUMBERS.map((n) => {
                const active = energyRating === n;
                return (
                  <TouchableOpacity
                    key={n}
                    onPress={() => setEnergyRating(n)}
                    style={[
                      styles.choiceBtn,
                      {
                        backgroundColor: active ? colors.card : 'transparent',
                        borderColor: active ? colors.textPrimary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.bodyBold,
                        { color: active ? colors.textPrimary : colors.textSecondary },
                      ]}
                    >
                      {n}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Productivity selector */}
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginTop: 12, marginBottom: 8 }]}>
              Productivity
            </Text>
            <View style={styles.selectorRow}>
              {RATING_NUMBERS.map((n) => {
                const active = productivityRating === n;
                return (
                  <TouchableOpacity
                    key={n}
                    onPress={() => setProductivityRating(n)}
                    style={[
                      styles.choiceBtn,
                      {
                        backgroundColor: active ? colors.card : 'transparent',
                        borderColor: active ? colors.textPrimary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.bodyBold,
                        { color: active ? colors.textPrimary : colors.textSecondary },
                      ]}
                    >
                      {n}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <FormTextArea
              label="Notes"
              value={notes}
              onChangeText={(text) => text.length <= 150 && setNotes(text)}
              placeholder="Anything else on your mind..."
              characterCount={{ current: notes.length, max: 150 }}
              numberOfLines={2}
            />

            <Button
              title="Save entry"
              onPress={handleSave}
              variant="primary"
              size="lg"
              style={{ marginTop: 14 }}
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
  newBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  entryCard: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodFaceText: {
    fontWeight: '700',
    fontSize: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  ratingsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  ratingPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  modalForm: {
    paddingBottom: 24,
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  choiceBtn: {
    width: 48,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
