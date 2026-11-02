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

  // Add Project Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-15');
  const [color, setColor] = useState('#1E8E4E');
  const [initialTasks, setInitialTasks] = useState('');

  // Edit Project Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<'planning' | 'in_progress' | 'completed' | 'on_hold'>('in_progress');

  // New subtask state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [addingTaskForPrjId, setAddingTaskForPrjId] = useState<string | null>(null);

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

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setEditTitle(project.title);
    setEditDueDate(project.due_date);
    setEditStatus(project.status);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingProject || !editTitle.trim()) {
      Alert.alert('Required', 'Please enter project title.');
      return;
    }

    ProjectsRepository.update(editingProject.id, {
      title: editTitle.trim(),
      dueDate: editDueDate,
      status: editStatus,
    });

    setIsEditOpen(false);
    setEditingProject(null);
    loadProjects();
  };

  const handleDeleteProject = (project: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.title}" and all its subtasks? This action cannot be reversed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            ProjectsRepository.delete(project.id);
            loadProjects();
          },
        },
      ]
    );
  };

  const handleAddSubtask = (projectId: string) => {
    if (!newSubtaskTitle.trim()) return;
    ProjectsRepository.addProjectTask(projectId, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setAddingTaskForPrjId(null);
    loadProjects();
  };

  const handleDeleteSubtask = (taskId: string) => {
    ProjectsRepository.deleteProjectTask(taskId);
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
                      <View style={styles.headerActions}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(p);
                          }}
                          style={styles.actionIconBtn}
                          accessibilityLabel="Edit Project"
                        >
                          <Ionicons name="pencil-outline" size={17} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(p);
                          }}
                          style={styles.actionIconBtn}
                          accessibilityLabel="Delete Project"
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

                  {/* Tasks List */}
                  {isExpanded && (
                    <View style={[styles.tasksList, { borderTopColor: colors.border }]}>
                      {tasks.map((task) => (
                        <View key={task.id} style={styles.taskRow}>
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
                          <TouchableOpacity
                            onPress={() => handleDeleteSubtask(task.id)}
                            style={{ padding: 4 }}
                          >
                            <Ionicons name="close-circle-outline" size={16} color={colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      ))}

                      {/* Add subtask inline */}
                      {addingTaskForPrjId === p.id ? (
                        <View style={styles.addSubtaskRow}>
                          <TextInput
                            value={newSubtaskTitle}
                            onChangeText={setNewSubtaskTitle}
                            placeholder="New subtask title..."
                            placeholderTextColor={colors.textMuted}
                            style={[
                              styles.subtaskInput,
                              { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                            ]}
                            autoFocus
                          />
                          <TouchableOpacity
                            onPress={() => handleAddSubtask(p.id)}
                            style={[styles.subtaskAddBtn, { backgroundColor: colors.primary }]}
                          >
                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setAddingTaskForPrjId(null)}
                            style={{ padding: 6 }}
                          >
                            <Ionicons name="close" size={18} color={colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => setAddingTaskForPrjId(p.id)}
                          style={styles.addTaskTrigger}
                        >
                          <Ionicons name="add" size={16} color={colors.primary} />
                          <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 4 }]}>
                            Add Subtask
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

        {/* Add Project Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Create New Project"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Project Title *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. AI Portfolio Website"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Target Due Date (YYYY-MM-DD)
            </Text>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="2026-12-15"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Subtasks / Milestones (one per line)
            </Text>
            <TextInput
              value={initialTasks}
              onChangeText={setInitialTasks}
              multiline
              numberOfLines={4}
              placeholder="Design mockups&#10;Develop core UI&#10;Testing and launch"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                styles.textArea,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Button
              title="Create Project"
              onPress={handleCreateProject}
              style={{ marginTop: 16 }}
            />
          </View>
        </BottomSheetModal>

        {/* Edit Project Modal */}
        <BottomSheetModal
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Project"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Project Title *
            </Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Target Due Date (YYYY-MM-DD)
            </Text>
            <TextInput
              value={editDueDate}
              onChangeText={setEditDueDate}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Status
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {(['in_progress', 'completed', 'planning', 'on_hold'] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => setEditStatus(st)}
                  style={[
                    styles.statusSelectBtn,
                    editStatus === st && { backgroundColor: colors.accentMint, borderColor: colors.primary },
                    { borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: editStatus === st ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {st === 'in_progress' ? 'Active' : st.charAt(0).toUpperCase() + st.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
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
  scrollListPadding: {
    paddingBottom: 110,
  },
  projectCard: {
    marginBottom: 12,
    padding: 16,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 4,
  },
  tasksList: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  taskTitle: {
    marginLeft: 10,
    flex: 1,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  subtaskInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  subtaskAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addTaskTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 4,
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
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  statusSelectBtn: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
