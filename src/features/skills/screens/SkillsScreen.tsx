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
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { SkillsRepository, Skill } from '../skills.repository';

export const SkillsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [activeTab, setActiveTab] = useState<'technical' | 'soft'>('technical');
  const [skills, setSkills] = useState<Skill[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [progress, setProgress] = useState('50');
  const [notes, setNotes] = useState('');

  const loadSkills = useCallback(() => {
    const list = SkillsRepository.getSkills(activeTab);
    setSkills(list);
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadSkills();
    }, [loadSkills])
  );

  const handleCreateSkill = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter skill name.');
      return;
    }

    SkillsRepository.createSkill({
      name: name.trim(),
      category: activeTab,
      progress: parseInt(progress, 10) || 50,
      notes,
    });

    setName('');
    setNotes('');
    setIsAddOpen(false);
    loadSkills();
  };

  const handleIncrementSkill = (id: string, current: number) => {
    const next = Math.min(100, current + 10);
    SkillsRepository.updateProgress(id, next);
    loadSkills();
  };

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary, marginLeft: 12 }]}>
              Skills & Learning
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsAddOpen(true)}
            style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="Add Skill"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tabs: Technical vs Soft Skills */}
        <SegmentedTabs
          tabs={[
            { key: 'technical', label: 'Technical' },
            { key: 'soft', label: 'Soft Skills' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Skills List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.scrollListPadding}
          showsVerticalScrollIndicator={false}
        >
          {skills.length === 0 ? (
            <EmptyState
              icon="sparkles-outline"
              title="No skills logged"
              description="Track your mastery and deliberate practice across technologies and soft skills."
              actionTitle="+ Add Skill"
              onAction={() => setIsAddOpen(true)}
            />
          ) : (
            skills.map((skill) => (
              <Card key={skill.id} style={styles.skillCard}>
                <View style={styles.skillRow}>
                  <View style={[styles.skillIconBox, { backgroundColor: colors.accentMint }]}>
                    <Ionicons
                      name={skill.category === 'technical' ? 'code-slash' : 'people'}
                      size={20}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.skillDetails}>
                    <View style={styles.titleLine}>
                      <Text style={[styles.skillName, typography.bodyBold, { color: colors.textPrimary }]}>
                        {skill.name}
                      </Text>
                      <Text style={[typography.bodyBold, { color: colors.primary }]}>
                        {skill.progress}%
                      </Text>
                    </View>

                    <ProgressBar
                      progress={skill.progress}
                      height={6}
                      color={colors.primary}
                      style={{ marginTop: 6 }}
                    />

                    {skill.notes && (
                      <Text style={[typography.caption, { color: colors.textMuted, marginTop: 6 }]}>
                        {skill.notes}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleIncrementSkill(skill.id, skill.progress)}
                    style={[styles.plusLevelBtn, { borderColor: colors.border }]}
                    accessibilityRole="button"
                    accessibilityLabel="Practice +10%"
                  >
                    <Ionicons name="add" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Add Skill Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Skill"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Skill Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Docker, Rust, Public Speaking"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Current Proficiency (%)
            </Text>
            <TextInput
              value={progress}
              onChangeText={setProgress}
              keyboardType="numeric"
              placeholder="60"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Notes / Sub-topics
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Core concepts, advanced patterns"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Button
              title="Save Skill"
              onPress={handleCreateSkill}
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
  backBtn: {
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
  skillCard: {
    padding: 14,
    marginBottom: 10,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillDetails: {
    flex: 1,
    marginHorizontal: 12,
  },
  titleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillName: {
    fontWeight: '600',
  },
  plusLevelBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});

