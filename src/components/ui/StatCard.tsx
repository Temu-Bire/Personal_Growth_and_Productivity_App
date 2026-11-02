import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  trend,
  trendPositive = true,
  icon,
  iconColor,
  style,
}) => {
  const { colors, typography, radius } = useTheme();

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={[styles.label, typography.subtext, { color: colors.textSecondary }]}>
          {label}
        </Text>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={iconColor || colors.primary}
          />
        )}
      </View>

      <Text style={[styles.value, typography.h2, { color: colors.textPrimary }]}>
        {value}
      </Text>

      {(trend || subtext) && (
        <View style={styles.footer}>
          {trend && (
            <View
              style={[
                styles.trendBadge,
                {
                  borderRadius: radius.sm,
                  backgroundColor: trendPositive ? colors.accentMint : colors.dangerSoft,
                },
              ]}
            >
              <Text
                style={[
                  typography.captionBold,
                  { color: trendPositive ? colors.primary : colors.danger },
                ]}
              >
                {trend}
              </Text>
            </View>
          )}
          {subtext && (
            <Text
              style={[
                styles.subtext,
                typography.caption,
                { color: colors.textMuted, marginLeft: trend ? 6 : 0 },
              ]}
            >
              {subtext}
            </Text>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontWeight: '500',
  },
  value: {
    fontWeight: '700',
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  subtext: {
    flex: 1,
  },
});

