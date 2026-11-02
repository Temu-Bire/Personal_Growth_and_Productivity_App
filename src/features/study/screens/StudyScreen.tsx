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
import { StudyRepository, Subject, StudyTopic, StudyScheduleSession } from '../study.repository';

export const StudyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [activeTab, setActiveTab] = useState<'subjects' | 'schedule'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scheduleSessions, setScheduleSessions] = useState<StudyScheduleSession[]>([]);
  const [expandedSubjId, setExpandedSubjId] = useState<string | null>(null);
  const [topicsMap, setTopicsMap] = useState<Record<string, StudyTopic[]>>({});

  // Add Subject Modal
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjTopics, setNewSubjTopics] = useState('');

  // Edit Subject Modal
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [editingSubj, setEditingSubj] = useState<Subject | null>(null);
  const [editSubjName, setEditSubjName] = useState('');

  // Add Topic inline
  const [addingTopicForSubjId, setAddingTopicForSubjId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // Add Schedule Session Modal
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [selectedSubjIdForSession, setSelectedSubjIdForSession] = useState('');
  const [sessionDayOfWeek, setSessionDayOfWeek] = useState(1);
  const [sessionStartTime, setSessionStartTime] = useState('09:00 AM');
  const [sessionEndTime, setSessionEndTime] = useState('10:30 AM');

  const loadData = useCallback(() => {
    const list = StudyRepository.getSubjectsWithProgress();
    setSubjects(list);

    const map: Record<string, StudyTopic[]> = {};
    list.forEach((s) => {
      map[s.id] = StudyRepository.getTopics(s.id);
    });
    setTopicsMap(map);

    const sessions = StudyRepository.getScheduleSessions();
    setScheduleSessions(sessions);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleToggleTopic = (topicId: string) => {
    StudyRepository.toggleTopic(topicId);
    loadData();
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
    loadData();
  };

  const handleOpenEditSubject = (subj: Subject) => {
    setEditingSubj(subj);
    setEditSubjName(subj.name);
    setIsEditSubjectOpen(true);
  };

  const handleSaveEditSubject = () => {
    if (!editingSubj || !editSubjName.trim()) {
      Alert.alert('Required', 'Please enter subject name.');
      return;
    }

    StudyRepository.updateSubject(editingSubj.id, editSubjName.trim());
    setIsEditSubjectOpen(false);
    setEditingSubj(null);
    loadData();
  };

  const handleDeleteSubject = (subj: Subject) => {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete "${subj.name}" and all its topics and study sessions? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            StudyRepository.deleteSubject(subj.id);
            loadData();
          },
        },
      ]
    );
  };

  const handleAddTopic = (subjectId: string) => {
    if (!newTopicTitle.trim()) return;
    StudyRepository.addTopic(subjectId, newTopicTitle.trim());
    setNewTopicTitle('');
    setAddingTopicForSubjId(null);
    loadData();
  };

  const handleDeleteTopic = (topicId: string) => {
    StudyRepository.deleteTopic(topicId);
    loadData();
  };

  const handleCreateSession = () => {
    if (!selectedSubjIdForSession && subjects.length > 0) {
      setSelectedSubjIdForSession(subjects[0].id);
    }
    const subjId = selectedSubjIdForSession || (subjects.length > 0 ? subjects[0].id : '');
    if (!subjId) {
      Alert.alert('Required', 'Please create a subject first.');
      return;
    }

    StudyRepository.addScheduleSession({
      subjectId: subjId,
      dayOfWeek: sessionDayOfWeek,
      startTime: sessionStartTime,
      endTime: sessionEndTime,
    });

    setIsAddSessionOpen(false);
    loadData();
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert('Delete Session', 'Are you sure you want to delete this study session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          StudyRepository.deleteSession(sessionId);
          loadData();
        },
      },
    ]);
  };

  const toggleExpand = (subjId: string) => {
    setExpandedSubjId(expandedSubjId === subjId ? null : subjId);
  };

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
            onPress={() => (activeTab === 'subjects' ? setIsAddSubjectOpen(true) : setIsAddSessionOpen(true))}
            style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="Add"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <SegmentedTabs
          tabs={[
            { key: 'subjects', label: 'Subjects' },
            { key: 'schedule', label: 'Schedule' },
          ]}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          style={{ marginBottom: 16 }}
        />

        {activeTab === 'subjects' ? (
          /* Subjects Tab */
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollListPadding}
            showsVerticalScrollIndicator={false}
          >
            {subjects.length === 0 ? (
              <EmptyState
                icon="school-outline"
                title="No subjects yet"
                description="Organize your courses and study materials into chapters."
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
                        <View style={styles.subjectTitleRow}>
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
                        <View style={styles.headerActions}>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleOpenEditSubject(subj);
                            }}
                            style={styles.actionIconBtn}
                            accessibilityLabel="Edit Subject"
                          >
                            <Ionicons name="pencil-outline" size={17} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeleteSubject(subj);
                            }}
                            style={styles.actionIconBtn}
                            accessibilityLabel="Delete Subject"
                          >
                            <Ionicons name="trash-outline" size={17} color={colors.danger} />
                          </TouchableOpacity>
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={colors.textMuted}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Topics Accordion List */}
                    {isExpanded && (
                      <View style={[styles.topicsList, { borderTopColor: colors.border }]}>
                        {topics.map((t) => (
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
                            <TouchableOpacity
                              onPress={() => handleDeleteTopic(t.id)}
                              style={{ padding: 4 }}
                            >
                              <Ionicons name="close-circle-outline" size={16} color={colors.textMuted} />
                            </TouchableOpacity>
                          </View>
                        ))}

                        {/* Add Topic inline */}
                        {addingTopicForSubjId === subj.id ? (
                          <View style={styles.addTopicRow}>
                            <TextInput
                              value={newTopicTitle}
                              onChangeText={setNewTopicTitle}
                              placeholder="Chapter or topic title..."
                              placeholderTextColor={colors.textMuted}
                              style={[
                                styles.topicInput,
                                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                              ]}
                              autoFocus
                            />
                            <TouchableOpacity
                              onPress={() => handleAddTopic(subj.id)}
                              style={[styles.topicAddBtn, { backgroundColor: colors.primary }]}
                            >
                              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => setAddingTopicForSubjId(null)}
                              style={{ padding: 6 }}
                            >
                              <Ionicons name="close" size={18} color={colors.textMuted} />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => setAddingTopicForSubjId(subj.id)}
                            style={styles.addTopicTrigger}
                          >
                            <Ionicons name="add" size={16} color={colors.primary} />
                            <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 4 }]}>
                              Add Topic / Chapter
                            </Text>
                          </TouchableOpacity>
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
            {scheduleSessions.length === 0 ? (
              <EmptyState
                icon="calendar-outline"
                title="No study sessions scheduled"
                description="Plan your weekly study schedule to stay consistent."
                actionTitle="+ Add Study Session"
                onAction={() => setIsAddSessionOpen(true)}
              />
            ) : (
              scheduleSessions.map((sess) => (
                <Card key={sess.id} style={styles.scheduleCard}>
                  <View style={styles.scheduleRow}>
                    <View style={[styles.dayBadge, { backgroundColor: colors.accentMint }]}>
                      <Text style={[typography.captionBold, { color: colors.primary }]}>
                        {DAY_NAMES[sess.day_of_week % 7].substring(0, 3)}
                      </Text>
                    </View>
                    <View style={styles.sessDetails}>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                        {sess.subject_name || 'Study Session'}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {DAY_NAMES[sess.day_of_week % 7]} · {sess.start_time} - {sess.end_time}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteSession(sess.id)}
                      style={{ padding: 6 }}
                      accessibilityLabel="Delete Session"
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* Add Subject Modal */}
        <BottomSheetModal
          visible={isAddSubjectOpen}
          onClose={() => setIsAddSubjectOpen(false)}
          title="Create New Subject"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Subject Name *
            </Text>
            <TextInput
              value={newSubjName}
              onChangeText={setNewSubjName}
              placeholder="e.g. Mathematics, System Design"
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
              multiline
              numberOfLines={4}
              placeholder="Linear Algebra&#10;Calculus Foundations&#10;Probability"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                styles.textArea,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Button
              title="Create Subject"
              onPress={handleCreateSubject}
              style={{ marginTop: 16 }}
            />
          </View>
        </BottomSheetModal>

        {/* Edit Subject Modal */}
        <BottomSheetModal
          visible={isEditSubjectOpen}
          onClose={() => setIsEditSubjectOpen(false)}
          title="Edit Subject"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Subject Name *
            </Text>
            <TextInput
              value={editSubjName}
              onChangeText={setEditSubjName}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsEditSubjectOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Changes"
                variant="primary"
                onPress={handleSaveEditSubject}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </BottomSheetModal>

        {/* Add Session Modal */}
        <BottomSheetModal
          visible={isAddSessionOpen}
          onClose={() => setIsAddSessionOpen(false)}
          title="Add Study Session"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Subject *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {subjects.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSelectedSubjIdForSession(s.id)}
                  style={[
                    styles.subjPill,
                    selectedSubjIdForSession === s.id && { backgroundColor: colors.accentMint, borderColor: colors.primary },
                    { borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: selectedSubjIdForSession === s.id ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Day of Week
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {DAY_NAMES.map((day, idx) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSessionDayOfWeek(idx)}
                  style={[
                    styles.subjPill,
                    sessionDayOfWeek === idx && { backgroundColor: colors.accentMint, borderColor: colors.primary },
                    { borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: sessionDayOfWeek === idx ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {day.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Start Time
                </Text>
                <TextInput
                  value={sessionStartTime}
                  onChangeText={setSessionStartTime}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  End Time
                </Text>
                <TextInput
                  value={sessionEndTime}
                  onChangeText={setSessionEndTime}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>
            </View>

            <Button
              title="Schedule Session"
              onPress={handleCreateSession}
              style={{ marginTop: 12 }}
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
  scrollListPadding: {
    paddingBottom: 110,
  },
  subjectCard: {
    marginBottom: 12,
    padding: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  subjectName: {
    fontWeight: '700',
  },
  subMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 4,
  },
  topicsList: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  topicTitle: {
    marginLeft: 10,
    flex: 1,
  },
  addTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  topicInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  topicAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addTopicTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 4,
  },
  scheduleCard: {
    marginBottom: 10,
    padding: 14,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  sessDetails: {
    flex: 1,
  },
  modalForm: {
    paddingBottom: 24,
  },
  formLabel: {
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  subjPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
});
