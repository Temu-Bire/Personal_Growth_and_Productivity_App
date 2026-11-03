import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { CustomizationRepository } from '../customization.repository';

interface CustomFieldsBadgeRowProps {
  entityType: string;
  entityId: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const CustomFieldsBadgeRow: React.FC<CustomFieldsBadgeRowProps> = React.memo(({
  entityType,
  entityId,
  containerStyle,
}) => {
  const { colors, typography } = useTheme();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const vals = CustomizationRepository.getFieldValues(entityType, entityId);
    setFieldValues(vals);
  }, [entityType, entityId]);

  const entries = Object.entries(fieldValues);
  if (entries.length === 0) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      {entries.map(([key, val]) => {
        if (!val) return null;
        const formattedKey = key.replace(/_/g, ' ');
        return (
          <View
            key={key}
            style={[
              styles.badge,
              { backgroundColor: colors.accentMint, borderColor: colors.primaryLight },
            ]}
          >
            <Ionicons name="pricetag-outline" size={11} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[typography.captionBold, { color: colors.primary, fontSize: 11 }]}>
              {formattedKey}: <Text style={{ fontWeight: '400' }}>{val}</Text>
            </Text>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
});
