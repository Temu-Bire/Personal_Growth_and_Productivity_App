import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { FAQ_DATA } from '../faq.data';
import { useTheme } from '../../../hooks/useTheme';

export const HelpScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  const handleSendFeedback = async () => {
    const mailtoUrl = 'mailto:support@growpro.local?subject=GrowPro%20Feedback&body=Hi%20GrowPro%20Team,%0A%0AHere%20is%20my%20feedback:%0A';
    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('Send Feedback', 'Feedback email: feedback@growpro.local');
      }
    } catch {
      Alert.alert('Send Feedback', 'Feedback email: feedback@growpro.local');
    }
  };

  return (
    <Screen scroll backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary }]}>
          Help & Support
        </Text>

        {/* Quick Help Links */}
        <Card style={styles.linksCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                'App Guide',
                '1. Use Dashboard for daily focus.\n2. Log habits and view streaks.\n3. Use Study Planner for courses.\n4. Record trades with P&L.\n5. Reflect daily in Journal.'
              )
            }
            style={styles.linkRow}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.accentMint }]}>
              <Ionicons name="book-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.linkText, typography.bodyBold, { color: colors.textPrimary }]}>
              App Guide
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSendFeedback}
            style={styles.linkRow}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.purpleSoft }]}>
              <Ionicons name="mail-outline" size={20} color={colors.purple} />
            </View>
            <Text style={[styles.linkText, typography.bodyBold, { color: colors.textPrimary }]}>
              Send Feedback
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* FAQ Section */}
        <Text style={[styles.sectionTitle, typography.h2, { color: colors.textPrimary }]}>
          Frequently Asked Questions
        </Text>

        <View style={styles.faqList}>
          {FAQ_DATA.map((item, index) => {
            const isExpanded = expandedFaqIndex === index;
            return (
              <Card key={index} style={styles.faqCard}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleFaq(index)}
                  style={styles.faqHeader}
                >
                  <Text style={[styles.faqQuestion, typography.bodyBold, { color: colors.textPrimary }]}>
                    {item.question}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <Text style={[styles.faqAnswer, typography.body, { color: colors.textSecondary }]}>
                    {item.answer}
                  </Text>
                )}
              </Card>
            );
          })}
        </View>

        {/* Footer Encouragement Banner */}
        <Card style={[styles.footerCard, { backgroundColor: colors.accentMint }]}>
          <Text style={{ fontSize: 24, marginBottom: 4 }}>🌱</Text>
          <Text style={[typography.h3, { color: colors.deepGreen, textAlign: 'center' }]}>
            Keep Growing!
          </Text>
          <Text style={[typography.caption, { color: colors.deepGreen, textAlign: 'center', marginTop: 2 }]}>
            You're doing great. Build tomorrow starting today.
          </Text>
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontWeight: '800',
    marginVertical: 8,
  },
  linksCard: {
    padding: 10,
    marginBottom: 20,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    flex: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  faqList: {
    gap: 10,
    marginBottom: 24,
  },
  faqCard: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    marginTop: 10,
    lineHeight: 20,
  },
  footerCard: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 30,
  },
});
