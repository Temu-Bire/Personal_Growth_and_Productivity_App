import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../hooks/useTheme';
import { CustomizationRepository } from '../../customization/customization.repository';
import { CustomField, FieldType } from '../../customization/customization.types';

const ENTITY_TABS = [
  { key: 'goals', label: 'Goals', icon: 'flag-outline' },
  { key: 'projects', label: 'Projects', icon: 'folder-open-outline' },
  { key: 'habits', label: 'Habits', icon: 'flash-outline' },
  { key: 'study', label: 'Study', icon: 'school-outline' },
  { key: 'journal', label: 'Journal', icon: 'book-outline' },
  { key: 'trading', label: 'Trading', icon: 'trending-up-outline' },
  { key: 'challenges', label: 'Challenges', icon: 'trophy-outline' },
];

const FIELD_TYPES: { type: FieldType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'text', label: 'Short Text', icon: 'text-outline' },
  { type: 'long_text', label: 'Long Text', icon: 'document-text-outline' },
  { type: 'number', label: 'Integer', icon: 'calculator-outline' },
  { type: 'decimal', label: 'Decimal', icon: 'stats-chart-outline' },
  { type: 'dropdown', label: 'Dropdown', icon: 'chevron-down-circle-outline' },
  { type: 'multi_select', label: 'Multi-Select', icon: 'list-circle-outline' },
  { type: 'checkbox', label: 'Checkbox', icon: 'checkbox-outline' },
  { type: 'toggle', label: 'Toggle Switch', icon: 'toggle-outline' },
  { type: 'date', label: 'Date', icon: 'calendar-outline' },
  { type: 'time', label: 'Time', icon: 'time-outline' },
  { type: 'url', label: 'Web URL', icon: 'link-outline' },
];

export const FormBuilderSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [activeTab, setActiveTab] = useState<string>('goals');
  const [fields, setFields] = useState<CustomField[]>([]);

  // Modal states
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  // Field Form State
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldHelpText, setFieldHelpText] = useState('');
  const [fieldDefaultValue, setFieldDefaultValue] = useState('');
  const [fieldSection, setFieldSection] = useState('Additional Details');
  const [fieldIsRequired, setFieldIsRequired] = useState(false);
  const [fieldOptionsText, setFieldOptionsText] = useState('');

  // Preview form simulation values
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  const loadFields = () => {
    CustomizationRepository.ensureDefaultFields(activeTab);
    const loaded = CustomizationRepository.getFields(activeTab);
    setFields(loaded);
  };

  useEffect(() => {
    loadFields();
  }, [activeTab]);

  const openAddField = () => {
    setEditingField(null);
    setFieldLabel('');
    setFieldKey('');
    setFieldType('text');
    setFieldPlaceholder('');
    setFieldHelpText('');
    setFieldDefaultValue('');
    setFieldSection('Custom Section');
    setFieldIsRequired(false);
    setFieldOptionsText('Option 1, Option 2, Option 3');
    setIsAddEditModalVisible(true);
  };

  const openEditField = (field: CustomField) => {
    setEditingField(field);
    setFieldLabel(field.label);
    setFieldKey(field.field_key);
    setFieldType(field.field_type);
    setFieldPlaceholder(field.placeholder || '');
    setFieldHelpText(field.help_text || '');
    setFieldDefaultValue(field.default_value || '');
    setFieldSection(field.section || 'General');
    setFieldIsRequired(field.is_required === 1);
    let opts = '';
    if (field.options_json) {
      try {
        const arr = JSON.parse(field.options_json);
        if (Array.isArray(arr)) opts = arr.join(', ');
      } catch {}
    }
    setFieldOptionsText(opts);
    setIsAddEditModalVisible(true);
  };

  const handleSaveField = () => {
    if (!fieldLabel.trim()) {
      Alert.alert('Required', 'Please enter a field label.');
      return;
    }

    const optionsArray =
      fieldType === 'dropdown' || fieldType === 'multi_select'
        ? fieldOptionsText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    if (editingField) {
      // Update
      CustomizationRepository.updateField(editingField.id, {
        label: fieldLabel.trim(),
        placeholder: fieldPlaceholder.trim() || undefined,
        helpText: fieldHelpText.trim() || undefined,
        defaultValue: fieldDefaultValue.trim() || undefined,
        options: optionsArray,
        isRequired: fieldIsRequired,
        section: fieldSection.trim() || 'General',
      });
    } else {
      // Add
      const generatedKey = (fieldKey.trim() || fieldLabel.trim())
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');

      CustomizationRepository.addField({
        entityType: activeTab,
        fieldKey: generatedKey,
        label: fieldLabel.trim(),
        fieldType,
        placeholder: fieldPlaceholder.trim(),
        helpText: fieldHelpText.trim(),
        defaultValue: fieldDefaultValue.trim(),
        options: optionsArray,
        isRequired: fieldIsRequired,
        section: fieldSection.trim() || 'General',
      });
    }

    setIsAddEditModalVisible(false);
    loadFields();
  };

  const handleDeleteField = (field: CustomField) => {
    if (field.is_system === 1) {
      Alert.alert(
        'System Field Protected',
        'This is a required system field for application logic and cannot be deleted. You can hide or rename it instead.'
      );
      return;
    }

    Alert.alert(
      'Delete Field',
      `Are you sure you want to delete "${field.label}"? Underlying data is retained in history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            CustomizationRepository.deleteField(field.id);
            loadFields();
          },
        },
      ]
    );
  };

  const handleToggleHide = (field: CustomField) => {
    const newHidden = field.is_hidden === 1 ? false : true;
    CustomizationRepository.updateField(field.id, { isHidden: newHidden });
    loadFields();
  };

  const handleToggleRequired = (field: CustomField) => {
    const newRequired = field.is_required === 1 ? false : true;
    CustomizationRepository.updateField(field.id, { isRequired: newRequired });
    loadFields();
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const current = [...fields];
    const itemA = current[index];
    const itemB = current[index - 1];

    CustomizationRepository.updateField(itemA.id, { sortOrder: index - 1 });
    CustomizationRepository.updateField(itemB.id, { sortOrder: index });
    loadFields();
  };

  const handleMoveDown = (index: number) => {
    if (index === fields.length - 1) return;
    const current = [...fields];
    const itemA = current[index];
    const itemB = current[index + 1];

    CustomizationRepository.updateField(itemA.id, { sortOrder: index + 1 });
    CustomizationRepository.updateField(itemB.id, { sortOrder: index });
    loadFields();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Form to Default',
      `Reset all fields for ${activeTab.toUpperCase()} back to default configuration? Custom fields will be cleared.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            CustomizationRepository.resetFieldsToDefault(activeTab);
            loadFields();
          },
        },
      ]
    );
  };

  const openPreview = () => {
    const initialVals: Record<string, any> = {};
    fields.forEach((f) => {
      initialVals[f.field_key] = f.default_value || '';
    });
    setPreviewValues(initialVals);
    setIsPreviewModalVisible(true);
  };

  return (
    <Screen backgroundColor={colors.background} contentContainerStyle={styles.container} scroll>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, typography.h2, { color: colors.textPrimary }]}>
          Form Builder
        </Text>
        <TouchableOpacity
          onPress={handleReset}
          style={[styles.resetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Reset form"
        >
          <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <Card variant="outlined" style={styles.infoCard}>
        <Ionicons name="construct-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
            Customizable Input Forms
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Add custom fields, reorder inputs, toggle required attributes, and preview live forms across modules.
          </Text>
        </View>
      </Card>

      {/* Entity Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {ENTITY_TABS.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={isSelected ? '#FFFFFF' : colors.textPrimary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  typography.captionBold,
                  { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Action Buttons: Add Field & Preview Form */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          onPress={openAddField}
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Add Field"
        >
          <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={[typography.captionBold, { color: '#FFFFFF' }]}>Add Field</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openPreview}
          style={[styles.actionBtn, { backgroundColor: colors.accentMint, borderColor: colors.primary, borderWidth: 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Preview Form"
        >
          <Ionicons name="eye-outline" size={18} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={[typography.captionBold, { color: colors.primary }]}>Preview Form</Text>
        </TouchableOpacity>
      </View>

      {/* Field List Header */}
      <View style={styles.sectionHeader}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          Fields ({fields.length})
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          Reorder & Toggle
        </Text>
      </View>

      {/* Fields List */}
      {fields.map((field, index) => {
        const isFirst = index === 0;
        const isLast = index === fields.length - 1;
        const isHidden = field.is_hidden === 1;

        return (
          <Card
            key={field.id}
            variant="elevated"
            style={[
              styles.fieldCard,
              {
                borderColor: isHidden ? colors.border : colors.primaryLight,
                opacity: isHidden ? 0.6 : 1,
              },
            ]}
          >
            <View style={styles.fieldRow}>
              {/* Reorder Buttons */}
              <View style={styles.reorderColumn}>
                <TouchableOpacity
                  onPress={() => handleMoveUp(index)}
                  disabled={isFirst}
                  style={[styles.arrowBtn, isFirst && styles.disabledBtn]}
                >
                  <Ionicons name="chevron-up" size={18} color={isFirst ? colors.textMuted : colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMoveDown(index)}
                  disabled={isLast}
                  style={[styles.arrowBtn, isLast && styles.disabledBtn]}
                >
                  <Ionicons name="chevron-down" size={18} color={isLast ? colors.textMuted : colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Main Info */}
              <View style={styles.fieldInfo}>
                <View style={styles.badgeRow}>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                    {field.label}
                  </Text>
                  {field.is_system === 1 ? (
                    <View style={[styles.pillBadge, { backgroundColor: colors.accentMint }]}>
                      <Text style={[typography.captionBold, { color: colors.primary, fontSize: 10 }]}>
                        SYSTEM
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.pillBadge, { backgroundColor: colors.orangeSoft }]}>
                      <Text style={[typography.captionBold, { color: '#92400E', fontSize: 10 }]}>
                        CUSTOM
                      </Text>
                    </View>
                  )}
                  {field.is_required === 1 && (
                    <View style={[styles.pillBadge, { backgroundColor: colors.dangerSoft }]}>
                      <Text style={[typography.captionBold, { color: colors.danger, fontSize: 10 }]}>
                        REQUIRED
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  Type: <Text style={{ fontWeight: '700' }}>{field.field_type}</Text> · Section: {field.section}
                </Text>

                {field.help_text ? (
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
                    💡 {field.help_text}
                  </Text>
                ) : null}
              </View>

              {/* Control Buttons */}
              <View style={styles.actionsCol}>
                {/* Hide / Show Toggle */}
                <TouchableOpacity
                  onPress={() => handleToggleHide(field)}
                  style={[styles.iconActionBtn, { backgroundColor: colors.surface }]}
                  accessibilityLabel="Toggle Visibility"
                >
                  <Ionicons
                    name={isHidden ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={isHidden ? colors.textMuted : colors.primary}
                  />
                </TouchableOpacity>

                {/* Edit Button */}
                <TouchableOpacity
                  onPress={() => openEditField(field)}
                  style={[styles.iconActionBtn, { backgroundColor: colors.surface }]}
                  accessibilityLabel="Edit Field"
                >
                  <Ionicons name="pencil-outline" size={18} color={colors.textPrimary} />
                </TouchableOpacity>

                {/* Delete Button */}
                {field.is_system === 0 && (
                  <TouchableOpacity
                    onPress={() => handleDeleteField(field)}
                    style={[styles.iconActionBtn, { backgroundColor: colors.dangerSoft }]}
                    accessibilityLabel="Delete Field"
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        );
      })}

      <View style={{ height: 40 }} />

      {/* ADD / EDIT FIELD MODAL */}
      <Modal visible={isAddEditModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h3, { color: colors.textPrimary }]}>
                {editingField ? 'Edit Field' : 'New Custom Field'}
              </Text>
              <TouchableOpacity onPress={() => setIsAddEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
              {/* Field Label */}
              <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
                FIELD LABEL *
              </Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                value={fieldLabel}
                onChangeText={setFieldLabel}
                placeholder="e.g. Estimated Budget, Reflection Tag"
                placeholderTextColor={colors.textMuted}
              />

              {/* Field Key (only when adding new) */}
              {!editingField && (
                <>
                  <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
                    FIELD KEY (IDENTIFIER)
                  </Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                    value={fieldKey}
                    onChangeText={setFieldKey}
                    placeholder="e.g. estimated_budget (auto-generated if empty)"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                  />
                </>
              )}

              {/* Field Type Selector (only when adding new) */}
              {!editingField && (
                <>
                  <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
                    FIELD TYPE
                  </Text>
                  <View style={styles.typeGrid}>
                    {FIELD_TYPES.map((t) => {
                      const isSelected = fieldType === t.type;
                      return (
                        <TouchableOpacity
                          key={t.type}
                          onPress={() => setFieldType(t.type)}
                          style={[
                            styles.typeChip,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.background,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Ionicons
                            name={t.icon}
                            size={14}
                            color={isSelected ? '#FFFFFF' : colors.textPrimary}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              typography.captionBold,
                              { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontSize: 11 },
                            ]}
                          >
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* Dropdown Options (when dropdown or multi_select) */}
              {(fieldType === 'dropdown' || fieldType === 'multi_select') && (
                <>
                  <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
                    DROPDOWN OPTIONS (comma separated)
                  </Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                    value={fieldOptionsText}
                    onChangeText={setFieldOptionsText}
                    placeholder="Option 1, Option 2, Option 3"
                    placeholderTextColor={colors.textMuted}
                  />
                </>
              )}

              {/* Section */}
              <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
                SECTION GROUP
              </Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                value={fieldSection}
                onChangeText={setFieldSection}
                placeholder="e.g. General, Details, Metrics"
                placeholderTextColor={colors.textMuted}
              />

              {/* Placeholder */}
              <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
                PLACEHOLDER TEXT
              </Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                value={fieldPlaceholder}
                onChangeText={setFieldPlaceholder}
                placeholder="e.g. Enter details here..."
                placeholderTextColor={colors.textMuted}
              />

              {/* Help Text */}
              <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
                HELP / TOOLTIP TEXT
              </Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                value={fieldHelpText}
                onChangeText={setFieldHelpText}
                placeholder="e.g. Enter value in USD"
                placeholderTextColor={colors.textMuted}
              />

              {/* Default Value */}
              <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
                DEFAULT VALUE
              </Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                value={fieldDefaultValue}
                onChangeText={setFieldDefaultValue}
                placeholder="e.g. Standard"
                placeholderTextColor={colors.textMuted}
              />

              {/* Required Switch */}
              <View style={styles.switchRow}>
                <View>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                    Required Field
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    User must provide a value before saving
                  </Text>
                </View>
                <Switch
                  value={fieldIsRequired}
                  onValueChange={setFieldIsRequired}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setIsAddEditModalVisible(false)}
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              >
                <Text style={[typography.bodyBold, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveField}
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[typography.bodyBold, { color: '#FFFFFF' }]}>Save Field</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FORM PREVIEW MODAL */}
      <Modal visible={isPreviewModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface, maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[typography.h3, { color: colors.textPrimary }]}>
                  {activeTab.toUpperCase()} Form Preview
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Live interactive preview of active form fields
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsPreviewModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 12 }}>
              {fields
                .filter((f) => f.is_hidden !== 1)
                .map((field) => {
                  let options: string[] = [];
                  if (field.options_json) {
                    try {
                      options = JSON.parse(field.options_json);
                    } catch {}
                  }

                  return (
                    <View key={field.id} style={styles.previewFieldItem}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[typography.captionBold, { color: colors.textPrimary }]}>
                          {field.label}
                        </Text>
                        {field.is_required === 1 && (
                          <Text style={{ color: colors.danger, marginLeft: 4 }}>*</Text>
                        )}
                      </View>

                      {field.help_text ? (
                        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 4 }]}>
                          {field.help_text}
                        </Text>
                      ) : null}

                      {/* Render preview control based on field_type */}
                      {field.field_type === 'long_text' ? (
                        <TextInput
                          style={[
                            styles.previewInput,
                            {
                              backgroundColor: colors.background,
                              color: colors.textPrimary,
                              borderColor: colors.border,
                              height: 70,
                              textAlignVertical: 'top',
                            },
                          ]}
                          multiline
                          placeholder={field.placeholder || 'Enter notes...'}
                          placeholderTextColor={colors.textMuted}
                          value={previewValues[field.field_key] || ''}
                          onChangeText={(val) =>
                            setPreviewValues((prev) => ({ ...prev, [field.field_key]: val }))
                          }
                        />
                      ) : field.field_type === 'checkbox' || field.field_type === 'toggle' ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                          <Switch
                            value={Boolean(previewValues[field.field_key])}
                            onValueChange={(val) =>
                              setPreviewValues((prev) => ({ ...prev, [field.field_key]: val }))
                            }
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor="#FFFFFF"
                          />
                          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 8 }]}>
                            {previewValues[field.field_key] ? 'Enabled / Checked' : 'Disabled'}
                          </Text>
                        </View>
                      ) : field.field_type === 'dropdown' ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                          {options.map((opt) => {
                            const isSelected = previewValues[field.field_key] === opt;
                            return (
                              <TouchableOpacity
                                key={opt}
                                onPress={() =>
                                  setPreviewValues((prev) => ({ ...prev, [field.field_key]: opt }))
                                }
                                style={[
                                  styles.previewOptionChip,
                                  {
                                    backgroundColor: isSelected ? colors.primary : colors.background,
                                    borderColor: isSelected ? colors.primary : colors.border,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    typography.captionBold,
                                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                                  ]}
                                >
                                  {opt}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      ) : (
                        <TextInput
                          style={[
                            styles.previewInput,
                            {
                              backgroundColor: colors.background,
                              color: colors.textPrimary,
                              borderColor: colors.border,
                            },
                          ]}
                          keyboardType={
                            field.field_type === 'number'
                              ? 'number-pad'
                              : field.field_type === 'decimal'
                              ? 'decimal-pad'
                              : field.field_type === 'url'
                              ? 'url'
                              : 'default'
                          }
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                          placeholderTextColor={colors.textMuted}
                          value={previewValues[field.field_key] || ''}
                          onChangeText={(val) =>
                            setPreviewValues((prev) => ({ ...prev, [field.field_key]: val }))
                          }
                        />
                      )}
                    </View>
                  );
                })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => {
                Alert.alert('Preview Validated', 'Form test completed successfully!');
                setIsPreviewModalVisible(false);
              }}
              style={[styles.modalSaveBtn, { backgroundColor: colors.primary, marginTop: 8 }]}
            >
              <Text style={[typography.bodyBold, { color: '#FFFFFF', textAlign: 'center' }]}>
                Test Save (Preview OK)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 16,
    borderRadius: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingBottom: 14,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldCard: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderColumn: {
    marginRight: 8,
    alignItems: 'center',
  },
  arrowBtn: {
    padding: 2,
  },
  disabledBtn: {
    opacity: 0.25,
  },
  fieldInfo: {
    flex: 1,
    marginRight: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  actionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  previewFieldItem: {
    marginBottom: 14,
  },
  previewInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    marginTop: 4,
  },
  previewOptionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
});

