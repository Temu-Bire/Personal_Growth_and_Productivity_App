import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../hooks/useTheme';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { CoachRepository, CoachMessage } from '../coach.repository';

const QUICK_ACTIONS = [
  'Why am I slipping?',
  'Plan my week',
  'Help me stay consistent',
];

export const CoachScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const profileName = useSettingsStore((s) => s.profileName) || 'Temesgen';
  const scrollViewRef = useRef<any>(null);

  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [weeklyInsight, setWeeklyInsight] = useState<{ title: string; body: string } | null>(null);

  const loadCoachData = useCallback(() => {
    const list = CoachRepository.getMessages(profileName);
    setMessages(list);

    const insight = CoachRepository.getWeeklyInsight();
    setWeeklyInsight(insight);
  }, [profileName]);

  useFocusEffect(
    useCallback(() => {
      loadCoachData();
    }, [loadCoachData])
  );

  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;

    // Add user message
    CoachRepository.addMessage('user', content);
    setInputText('');

    // Generate local offline reply
    const reply = CoachRepository.generateOfflineReply(content);
    CoachRepository.addMessage('coach', reply);

    // Refresh messages
    const updated = CoachRepository.getMessages(profileName);
    setMessages(updated);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
              <Text style={[typography.h1, { color: colors.textPrimary }]}>Coach</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                Your personal AI habit coach
              </Text>
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Weekly Insight Card */}
            {weeklyInsight && (
              <Card style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[typography.captionBold, { color: '#EAB308', marginBottom: 6 }]}>
                  {weeklyInsight.title}
                </Text>
                <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>
                  {weeklyInsight.body}
                </Text>
              </Card>
            )}

            {/* Quick Action Suggestion Chips */}
            <View style={styles.quickChipsRow}>
              {QUICK_ACTIONS.map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => handleSendMessage(action)}
                  style={[
                    styles.quickChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
                    {action}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Conversation Bubbles */}
            <View style={styles.messagesContainer}>
              {messages.map((msg) => {
                const isCoach = msg.role === 'coach';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubbleWrapper,
                      isCoach ? styles.coachWrapper : styles.userWrapper,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isCoach
                          ? { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }
                          : { backgroundColor: colors.card, borderColor: colors.textPrimary, borderWidth: 1 },
                      ]}
                    >
                      <Text
                        style={[
                          typography.bodyMedium,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Bottom Chat Input Bar */}
          <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask your coach..."
              placeholderTextColor={colors.textMuted}
              style={[styles.textInput, { color: colors.textPrimary }]}
              onSubmitEditing={() => handleSendMessage()}
              returnKeyType="send"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSendMessage()}
              style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="arrow-up" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
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
  scrollContent: {
    paddingBottom: 20,
  },
  insightCard: {
    padding: 14,
    marginBottom: 14,
    borderRadius: 12,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  messagesContainer: {
    gap: 12,
  },
  messageBubbleWrapper: {
    width: '100%',
  },
  coachWrapper: {
    alignItems: 'flex-start',
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderRadius: 14,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
