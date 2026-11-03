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
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { CustomizationRepository } from '../../customization/customization.repository';
import { ViewModeSwitcher } from '../../customization/components/ViewModeSwitcher';
import { CustomFieldsSection } from '../../customization/components/CustomFieldsSection';
import { CustomFieldsBadgeRow } from '../../customization/components/CustomFieldsBadgeRow';
import { sortItemsByLayout } from '../../customization/layout.utils';
import { ProjectsRepository, Project, ProjectTask } from '../projects.repository';

export const ProjectsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const pageLayout = useCustomizationStore((state) => state.pageLayouts['projects']);

  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedPrjId, setExpandedPrjId] = useState<string | null>(null);
  const [tasksMap, setTasksMap] = useState<Record<string, ProjectTask[]>>({});
  const [categories, setCategories] = useState<string[]>(['Mobile App', 'Web Dev', 'Career', 'Personal']);

  // Add Project Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-15');
  const [color, setColor] = useState('#1E8E4E');
  const [selectedCategory, setSelectedCategory] = useState('Mobile App');
  const [initialTasks, setInitialTasks] = useState('');
  const [addCustomValues, setAddCustomValues] = useState<Record<string, any>>({});

  // Edit Project Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<'planning' | 'in_progress' | 'completed' | 'on_hold'>('in_progress');
  const [editCustomValues, setEditCustomValues] = useState<Record<string, any>>({});

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

    // Load custom categories for Projects
    const customCats = CustomizationRepository.getCategories('projects');
    const baseCats = ['Mobile App', 'Web Dev', 'Career', 'Personal'];
    customCats.forEach((c) => {
      if (!baseCats.includes(c.name)) baseCats.push(c.name);
    });
    setCategories(baseCats);
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

    const created = ProjectsRepository.create({
      title: title.trim(),
      dueDate,
      color,
      initialTasks: tasksList,
    });

    if (created && Object.keys(addCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('projects', created.id, addCustomValues);
    }

    setTitle('');
    setInitialTasks('');
    setAddCustomValues({});
    setIsAddOpen(false);
    loadProjects();
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setEditTitle(project.title);
    setEditDueDate(project.due_date);
    setEditStatus(project.status);
    const existingVals = CustomizationRepository.getFieldValues('projects', project.id);
    setEditCustomValues(existingVals);
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

    if (Object.keys(editCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('projects', editingProject.id, editCustomValues);
    }

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

  const sortedProjects = useMemo(() => {
    return sortItemsByLayout(projects, pageLayout);
  }, [projects, pageLayout]);

  const viewMode = pageLayout?.viewMode || 'card';
  const visibleFields = pageLayout?.visibleFields || [
    'show_dates',
    'show_categories',
    'show_progress',
    'show_notes',
    'show_status',
  ];

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

          <View style={styles.headerRight}>
            <ViewModeSwitcher pageKey="projects" />
            <TouchableOpacity
              onPress={() => setIsAddOpen(true)}
              style={[styles.addBtn, { backgroundColor: colors.accentMint, marginLeft: 8 }]}
              accessibilityRole="button"
              accessibilityLabel="Add Project"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Project List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={[
            styles.scrollListPadding,
            viewMode === 'grid' && styles.gridContainer,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {sortedProjects.length === 0 ? (
            <EmptyState
              icon="folder-open-outline"
              title="No projects yet"
              description="Track milestone deliverables and project deadlines."
              actionTitle="+ Add Project"
              onAction={() => setIsAddOpen(true)}
            />
          ) : (
            sortedProjects.map((p) => {
              const isExpanded = expandedPrjId === p.id;
              const tasks = tasksMap[p.id] || [];

              // 1. Compact View Mode
              if (viewMode === 'compact') {
                return (
                  <Card key={p.id} style={styles.compactCard}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleExpand(p.id)}
                      style={styles.compactRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                          {p.title}
                        </Text>
                        {visibleFields.includes('show_dates') && (
                          <Text style={[typography.caption, { color: colors.textSecondary }]}>
                            Due: {p.due_date}
                          </Text>
                        )}
                      </View>
                      {visibleFields.includes('show_progress') && (
                        <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 8 }]}>
                          {p.progressPercent}%
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 2. List View Mode
              if (viewMode === 'list') {
                return (
                  <Card key={p.id} style={styles.listCard}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleExpand(p.id)}
                      style={styles.listRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                          {p.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {p.status} · Due: {p.due_date}
                        </Text>
                      </View>
                      {visibleFields.includes('show_progress') && (
                        <Text style={[typography.h3, { color: colors.primary, fontWeight: '800' }]}>
                          {p.progressPercent}%
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 3. Grid View Mode
              if (viewMode === 'grid') {
                return (
                  <Card key={p.id} style={styles.gridCard}>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => toggleExpand(p.id)}>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={2}>
                        {p.title}
                      </Text>
                      <ProgressBar
                        progress={p.progressPercent || 0}
                        height={4}
                        color={p.color || colors.primary}
                        style={{ marginVertical: 8 }}
                      />
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[typography.captionBold, { color: colors.primary }]}>
                          {p.progressPercent}%
                        </Text>
                        {visibleFields.includes('show_dates') && (
                          <Text style={[typography.caption, { color: colors.textMuted, fontSize: 10 }]}>
                            {p.due_date}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 4. Card View Mode (Default)
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
                        {visibleFields.includes('show_dates') && (
                          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                            {p.progressPercent}% · Due: {p.due_date}
                          </Text>
                        )}
                      </View>

                      {visibleFields.includes('show_status') && (
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                p.status === 'completed'
                                  ? colors.accentMint
                                  : p.status === 'in_progress'
                                  ? colors.orangeSoft
                                  : colors.surface,
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
                                    : p.status === 'in_progress'
                                    ? colors.orange
                                    : colors.textSecondary,
                              },
                            ]}
                          >
                            {p.status.replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>

                    {visibleFields.includes('show_progress') && (
                      <ProgressBar
                        progress={p.progressPercent || 0}
                        height={6}
                        color={p.color || colors.primary}
                        style={{ marginVertical: 10 }}
                      />
                    )}

                    {/* Custom fields badges */}
                    <CustomFieldsBadgeRow entityType="projects" entityId={p.id} />

                    <View style={styles.projectFooter}>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        {p.completedTasksCount} of {p.tasksCount} deliverables done
                      </Text>
                      <View style={styles.actionsRow}>
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

                  {/* Subtasks breakdown */}
                  {isExpanded && (
                    <View style={[styles.subtasksBox, { borderTopColor: colors.border }]}>
                      {tasks.map((task) => (
                        <View key={task.id} style={styles.subtaskItem}>
                          <Checkbox
                            checked={task.is_completed === 1}
                            onToggle={() => handleToggleTask(task.id)}
                          />
                          <Text
                            style={[
                              styles.subtaskTitle,
                              typography.bodyMedium,
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
                            style={styles.deleteSubtaskBtn}
                          >
                            <Ionicons name="close" size={16} color={colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      ))}

                      {addingTaskForPrjId === p.id ? (
                        <View style={styles.addSubtaskRow}>
                          <TextInput
                            value={newSubtaskTitle}
                            onChangeText={setNewSubtaskTitle}
                            placeholder="Deliverable title..."
                            placeholderTextColor={colors.textMuted}
                            style={[
                              styles.subtaskInput,
                              { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                            ]}
                          />
                          <Button
                            title="Add"
                            size="sm"
                            onPress={() => handleAddSubtask(p.id)}
                            style={{ marginLeft: 6 }}
                          />
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => setAddingTaskForPrjId(p.id)}
                          style={styles.addDeliverableBtn}
                        >
                          <Ionicons name="add" size={16} color={colors.primary} />
                          <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 4 }]}>
                            Add Deliverable
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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Project Name *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Mobile App Redesign"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Target Date (YYYY-MM-DD)
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
              Category
            </Text>
            <View style={styles.catGrid}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedCategory(c)}
                  style={[
                    styles.catChip,
                    selectedCategory === c && { backgroundColor: colors.primary, borderColor: colors.primary },
                    { borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: selectedCategory === c ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Fields Section */}
            <CustomFieldsSection
              entityType="projects"
              values={addCustomValues}
              onChange={(k, v) => setAddCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 10 }]}>
              Deliverables / Subtasks (one per line)
            </Text>
            <TextInput
              value={initialTasks}
              onChangeText={setInitialTasks}
              multiline
              numberOfLines={4}
              placeholder="UI Mockups&#10;Database schema&#10;Beta deployment"
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
          </ScrollView>
        </BottomSheetModal>

        {/* Edit Project Modal */}
        <BottomSheetModal
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Project"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Project Name *
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
              Target Date (YYYY-MM-DD)
            </Text>
            <TextInput
              value={editDueDate}
              onChangeText={setEditDueDate}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            {/* Custom Fields Section */}
            <CustomFieldsSection
              entityType="projects"
              values={editCustomValues}
              onChange={(k, v) => setEditCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

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
  },
  headerRight: {
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  scrollListPadding: {
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
    justifyContent: 'space-between',
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 4,
  },
  subtasksBox: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  subtaskTitle: {
    marginLeft: 10,
    flex: 1,
  },
  deleteSubtaskBtn: {
    padding: 4,
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
  addDeliverableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});
