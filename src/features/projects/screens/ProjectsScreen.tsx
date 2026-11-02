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
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { ProjectsRepository, Project, ProjectTask } from '../projects.repository';

export const ProjectsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedPrjId, setExpandedPrjId] = useState<string | null>(null);
  const [tasksMap, setTasksMap] = useState<Record<string, ProjectTask[]>>({});

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-15');
  const [color, setColor] = useState('#1E8E4E');
  const [initialTasks, setInitialTasks] = useState('');

  const loadProjects = useCallback(() => {
    const list = ProjectsRepository.getAllWithProgress();
    setProjects(list);

    const map: Record<string, ProjectTask[]> = {};
    list.forEach((p) => {
      map[p.id] = ProjectsRepository.getProjectTasks(p.id);
    });
    setTasksMap(map);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

  const handleToggleTask = (taskId: string) => {
    ProjectsRepository.toggleProjectTask(taskId);
    loadProjects();
  };

  const handleCreateProject = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter project title.');
      return;
    }

    const tasksList = initialTasks
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    ProjectsRepository.create({
      title: title.trim(),
      dueDate,
      color,
      initialTasks: tasksList,
    });

    setTitle('');
    setInitialTasks('');
    setIsAddOpen(false);
    loadProjects();
  };

  const toggleExpand = (prjId: string) => {
    setExpandedPrjId(expandedPrjId === prjId ? null : prjId);
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
              My Projects
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsAddOpen(true)}
            style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="Add Project"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Project List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.scrollListPadding}
          showsVerticalScrollIndicator={false}
        >
          {projects.length === 0 ? (
            <EmptyState
              icon="folder-open-outline"
              title="No projects yet"
              description="Track milestone deliverables and project deadlines."
              actionTitle="+ Add Project"
              onAction={() => setIsAddOpen(true)}
            />
          ) : (
            projects.map((p) => {
              const isExpanded = expandedPrjId === p.id;
              const tasks = tasksMap[p.id] || [];

              return (
                <Card key={p.id} style={styles.projectCard}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(p.id)}
                  >
                    <View style={styles.projectHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.projectTitle, typography.h2, { color: colors.textPrimary }]}>
                          {p.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                          {p.progressPercent}% · Due: {p.due_date}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              p.status === 'completed'
                                ? colors.accentMint
                                : colors.orangeSoft,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            typography.captionBold,
                            {
                              color:
                                p.status === 'completed'
                                  ? colors.primary
                                  : colors.orange,
                            },
                          ]}
                        >
                          {p.status === 'completed' ? 'Completed' : 'Active'}
                        </Text>
                      </View>
                    </View>

                    <ProgressBar
                      progress={p.progressPercent || 0}
                      height={6}
                      color={p.color || colors.primary}
                      style={{ marginTop: 12, marginBottom: 8 }}
                    />

                    <View style={styles.projectFooter}>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        {p.completedTasksCount} of {p.tasksCount} tasks completed
                      </Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textMuted}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Tasks List */}
                  {isExpanded && (
                    <View style={[styles.tasksList, { borderTopColor: colors.border }]}>
                      {tasks.map((task) => (
                        <View key={task.id} style={styles.taskItem}>
                          <Checkbox
                            checked={task.is_completed === 1}
                            onToggle={() => handleToggleTask(task.id)}
                            size={18}
                          />
                          <Text
                            style={[
                              styles.taskTitle,
                              typography.body,
                              {
                                color: task.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                                textDecorationLine: task.is_completed === 1 ? 'line-through' : 'none',
                              },
                            ]}
                          >
                            {task.title}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Add Project Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="New Project"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Project Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Distributed Database Engine"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Due Date (YYYY-MM-DD)
            </Text>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="2026-12-31"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Key Milestones / Subtasks (one per line)
            </Text>
            <TextInput
              value={initialTasks}
              onChangeText={setInitialTasks}
              placeholder={'Architecture Plan\nPrototype Implementation\nUnit Testing\nDocumentation'}
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
              title="Create Project"
              onPress={handleCreateProject}
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
  projectCard: {
    padding: 16,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projectTitle: {
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tasksList: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  taskTitle: {
    marginLeft: 8,
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

