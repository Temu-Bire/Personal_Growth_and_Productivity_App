import React, { useState, useCallback } from 'react';
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
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { StudyRepository, Subject, StudyTopic } from '../study.repository';

export const StudyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [activeTab, setActiveTab] = useState<'subjects' | 'schedule'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expandedSubjId, setExpandedSubjId] = useState<string | null>(null);
  const [topicsMap, setTopicsMap] = useState<Record<string, StudyTopic[]>>({});

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjTopics, setNewSubjTopics] = useState('');

  const loadSubjects = useCallback(() => {
    const list = StudyRepository.getSubjectsWithProgress();
    setSubjects(list);

    // Load topics for each subject
    const map: Record<string, StudyTopic[]> = {};
    list.forEach((s) => {
      map[s.id] = StudyRepository.getTopics(s.id);
    });
    setTopicsMap(map);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [loadSubjects])
  );

  const handleToggleTopic = (topicId: string) => {
    StudyRepository.toggleTopic(topicId);
    loadSubjects();
  };

  const handleCreateSubject = () => {
    if (!newSubjName.trim()) {
      Alert.alert('Required', 'Please enter subject name.');
      return;
    }

    const topicsArray = newSubjTopics
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    StudyRepository.createSubject(newSubjName.trim(), '#1E8E4E', topicsArray);

    setNewSubjName('');
    setNewSubjTopics('');
    setIsAddSubjectOpen(false);
    loadSubjects();
  };

  const toggleExpand = (subjId: string) => {
    setExpandedSubjId(expandedSubjId === subjId ? null : subjId);
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
              Study Plan
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsAddSubjectOpen(true)}
            style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="Add Subject"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tabs: Subjects vs Schedule */}
        <SegmentedTabs
          tabs={[
            { key: 'subjects', label: 'Subjects' },
            { key: 'schedule', label: 'Schedule' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'subjects' ? (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollListPadding}
            showsVerticalScrollIndicator={false}
          >
            {subjects.length === 0 ? (
              <EmptyState
                icon="school-outline"
                title="No subjects added"
                description="Create subjects and chapters to systematically master your coursework."
                actionTitle="+ Add Subject"
                onAction={() => setIsAddSubjectOpen(true)}
              />
            ) : (
              subjects.map((subj) => {
                const isExpanded = expandedSubjId === subj.id;
                const topics = topicsMap[subj.id] || [];

                return (
                  <Card key={subj.id} style={styles.subjectCard}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleExpand(subj.id)}
                    >
                      <View style={styles.subjectHeader}>
                        <View style={styles.subjectLeft}>
                          <View
                            style={[
                              styles.colorIndicator,
                              { backgroundColor: subj.color || colors.primary },
                            ]}
                          />
                          <Text style={[styles.subjectName, typography.h3, { color: colors.textPrimary }]}>
                            {subj.name}
                          </Text>
                        </View>
                        <Text style={[typography.h3, { color: colors.primary }]}>
                          {subj.progressPercent}%
                        </Text>
                      </View>

                      <ProgressBar
                        progress={subj.progressPercent || 0}
                        height={6}
                        color={subj.color || colors.primary}
                        style={{ marginTop: 10, marginBottom: 8 }}
                      />

                      <View style={styles.subMeta}>
                        <Text style={[typography.caption, { color: colors.textMuted }]}>
                          {subj.completedTopicsCount} of {subj.topicsCount} topics completed
                        </Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={colors.textMuted}
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Topics Accordion List */}
                    {isExpanded && (
                      <View style={[styles.topicsList, { borderTopColor: colors.border }]}>
                        {topics.length === 0 ? (
                          <Text style={[typography.caption, { color: colors.textMuted, marginVertical: 6 }]}>
                            No topics added yet.
                          </Text>
                        ) : (
                          topics.map((t) => (
                            <View key={t.id} style={styles.topicRow}>
                              <Checkbox
                                checked={t.is_completed === 1}
                                onToggle={() => handleToggleTopic(t.id)}
                                size={20}
                              />
                              <Text
                                style={[
                                  styles.topicTitle,
                                  typography.body,
                                  {
                                    color: t.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                                    textDecorationLine: t.is_completed === 1 ? 'line-through' : 'none',
                                  },
                                ]}
                              >
                                {t.title}
                              </Text>
                            </View>
                          ))
                        )}
                      </View>
                    )}
                  </Card>
                );
              })
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        ) : (
          /* Study Schedule Tab */
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollListPadding}
            showsVerticalScrollIndicator={false}
          >
            {[
              { day: 'Monday', time: '9:00 AM - 10:30 AM', subj: 'Mathematics', loc: 'Room 204' },
              { day: 'Monday', time: '11:00 AM - 12:30 PM', subj: 'Physics', loc: 'Lab A' },
              { day: 'Wednesday', time: '2:00 PM - 3:30 PM', subj: 'ICT & Networks', loc: 'Comp Lab' },
              { day: 'Thursday', time: '10:00 AM - 11:30 AM', subj: 'English Writing', loc: 'Hall 3' },
              { day: 'Friday', time: '3:00 PM - 5:00 PM', subj: 'Mathematics Revision', loc: 'Library' },
            ].map((sess, i) => (
              <Card key={i} style={styles.scheduleCard}>
                <View style={styles.scheduleRow}>
                  <View style={[styles.dayBadge, { backgroundColor: colors.accentMint }]}>
                    <Text style={[typography.captionBold, { color: colors.primary }]}>
                      {sess.day.substring(0, 3)}
                    </Text>
                  </View>
                  <View style={styles.sessDetails}>
                    <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                      {sess.subj}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {sess.time} · {sess.loc}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* Add Subject Sheet Modal */}
        <BottomSheetModal
          visible={isAddSubjectOpen}
          onClose={() => setIsAddSubjectOpen(false)}
          title="Add New Subject"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Subject Name
            </Text>
            <TextInput
              value={newSubjName}
              onChangeText={setNewSubjName}
              placeholder="e.g. Algorithms & Data Structures"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Topics / Chapters (one per line)
            </Text>
            <TextInput
              value={newSubjTopics}
              onChangeText={setNewSubjTopics}
              placeholder={'Trees & Graphs\nSorting Algorithms\nDynamic Programming'}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={[
                styles.modalInput,
                styles.multilineInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Button
              title="Save Subject"
              onPress={handleCreateSubject}
              variant="primary"
              size="lg"
              style={{ marginTop: 20 }}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuBtn: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  scrollListPadding: {
    paddingBottom: 60,
  },
  subjectCard: {
    padding: 16,
    marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  subjectName: {
    fontWeight: '700',
  },
  subMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicsList: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  topicTitle: {
    marginLeft: 8,
    flex: 1,
  },
  scheduleCard: {
    padding: 14,
    marginBottom: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessDetails: {
    flex: 1,
  },
  modalForm: {
    paddingTop: 8,
  },
  formLabel: {
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

