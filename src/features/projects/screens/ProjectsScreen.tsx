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
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { CATEGORY_COLORS } from '../../../theme/colors';
import {
  ProjectsRepository,
  Project,
  ProjectStatus,
  CheckInRhythm,
} from '../projects.repository';
import {
  FormInput,
  FormTextArea,
  FormSelect,
} from '../../../components/forms';

const STATUS_FILTERS: { key: ProjectStatus; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused' },
  { key: 'archived', label: 'Archived' },
];

const CATEGORY_OPTIONS = [
  { label: 'None', value: 'None' },
  { label: 'Health', value: 'Health' },
  { label: 'Career', value: 'Career' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Learning', value: 'Learning' },
  { label: 'Faith', value: 'Faith' },
  { label: 'Personal', value: 'Personal' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Archived', value: 'archived' },
];

const RHYTHM_OPTIONS = [
  { label: 'No rhythm - only when I open it', value: 'none' },
  { label: 'Daily check-in', value: 'daily' },
  { label: 'Weekly rhythm', value: 'weekly' },
  { label: 'Monthly rhythm', value: 'monthly' },
];

export const ProjectsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius, isDark } = useTheme();

  const [statusFilter, setStatusFilter] = useState<ProjectStatus>('active');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('None');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [checkInRhythm, setCheckInRhythm] = useState<CheckInRhythm>('none');

  const loadProjects = useCallback(() => {
    const list = ProjectsRepository.getAll(statusFilter);
    setProjects(list);
  }, [statusFilter]);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('None');
    setStatus('active');
    setCheckInRhythm('none');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleCreateProject = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a project name.');
      return;
    }

    ProjectsRepository.create({
      name: name.trim(),
      description: description.trim() || null,
      category: category === 'None' ? 'General' : category,
      status,
      check_in_rhythm: checkInRhythm,
    });

    setIsAddOpen(false);
    resetForm();
    loadProjects();
  };

  const handleCheckIn = (project: Project) => {
    ProjectsRepository.checkIn(project.id);
    loadProjects();
  };

  const handleDelete = (project: Project) => {
    Alert.alert('Delete Project', `Are you sure you want to delete "${project.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          ProjectsRepository.delete(project.id);
          loadProjects();
        },
      },
    ]);
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
            <Text style={[typography.h1, { color: colors.textPrimary }]}>Projects</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              Ongoing work with no finish line
            </Text>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setStatusFilter(f.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.card : 'transparent',
                    borderColor: active ? colors.textPrimary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: active ? colors.textPrimary : colors.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Projects List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {projects.length === 0 ? (
            <EmptyState
              icon="folder-outline"
              title="No projects here"
              description={`You have no ${statusFilter} projects right now.`}
              actionTitle="+ Add Project"
              onAction={handleOpenAdd}
            />
          ) : (
            projects.map((project) => {
              const catColor = CATEGORY_COLORS[project.category] || colors.primary;
              return (
                <Card
                  key={project.id}
                  style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                      <View style={[styles.catDot, { backgroundColor: catColor }]} />
                      <Text style={[typography.bodyBold, { color: colors.textPrimary, flex: 1 }]}>
                        {project.name}
                      </Text>
                    </View>

                    <View style={[styles.statusBadge, { borderColor: '#22C55E' }]}>
                      <Text style={[typography.captionBold, { color: '#22C55E', fontSize: 10 }]}>
                        {project.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                    {project.category} ·{' '}
                    {project.last_check_in
                      ? 'checked in recently'
                      : project.check_in_rhythm === 'none'
                      ? 'never checked in'
                      : `${project.check_in_rhythm} rhythm`}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={[typography.captionBold, { color: colors.textMuted }]}>
                      {project.openTasksCount} open · {project.doneTasksCount} done
                    </Text>

                    {project.isCheckInDue && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleCheckIn(project)}
                        style={[styles.checkInDueBadge, { borderColor: '#EAB308' }]}
                      >
                        <Text style={[typography.captionBold, { color: '#EAB308', fontSize: 10 }]}>
                          CHECK-IN DUE
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>

        {/* Floating + Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleOpenAdd}
          style={[styles.fab, { backgroundColor: isDark ? '#FFFFFF' : '#09090B' }]}
          accessibilityRole="button"
          accessibilityLabel="Add Project"
        >
          <Ionicons name="add" size={28} color={isDark ? '#09090B' : '#FFFFFF'} />
        </TouchableOpacity>

        {/* New Project Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="New project"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <FormInput
              label="Name"
              required
              value={name}
              onChangeText={(text) => text.length <= 75 && setName(text)}
              placeholder="e.g. My website"
              characterCount={{ current: name.length, max: 75 }}
            />

            <FormTextArea
              label="Description"
              value={description}
              onChangeText={(text) => text.length <= 200 && setDescription(text)}
              placeholder="Optional - what this project covers"
              characterCount={{ current: description.length, max: 200 }}
              numberOfLines={3}
            />

            <FormSelect
              label="Category"
              value={category}
              options={CATEGORY_OPTIONS}
              onSelect={setCategory}
            />

            <FormSelect
              label="Status"
              value={status}
              options={STATUS_OPTIONS}
              onSelect={(val) => setStatus(val as ProjectStatus)}
            />

            <FormSelect
              label="Check in"
              value={checkInRhythm}
              options={RHYTHM_OPTIONS}
              onSelect={(val) => setCheckInRhythm(val as CheckInRhythm)}
            />

            <Text style={[typography.caption, { color: colors.textMuted, marginVertical: 12 }]}>
              Rhythms: none / daily / weekly / monthly. Paused and archived projects never show as due, whatever the rhythm.
            </Text>

            <Button
              title="Add project"
              onPress={handleCreateProject}
              variant="primary"
              size="lg"
              style={{ marginTop: 8 }}
            />
            <Button
              title="Cancel"
              onPress={() => setIsAddOpen(false)}
              variant="ghost"
              size="md"
              style={{ marginTop: 8 }}
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  projectCard: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  checkInDueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalForm: {
    paddingBottom: 24,
  },
});
