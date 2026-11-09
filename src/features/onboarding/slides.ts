export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  badgeBg: string;
  cardBg: string;
  iconColor: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Intentional Living',
    description: 'Plan your day, cultivate consistency, and achieve your goals.',
    icon: 'time-outline',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    cardBg: '#18181B',
    iconColor: '#3B82F6',
  },
  {
    id: '2',
    title: 'Build Daily Habits',
    description: 'Track streaks, maintain habits, and stay accountable every day.',
    icon: 'checkbox-outline',
    badgeBg: 'rgba(234, 179, 8, 0.15)',
    cardBg: '#18181B',
    iconColor: '#EAB308',
  },
  {
    id: '3',
    title: '100% Offline & Private',
    description: 'All your data stays strictly on your device. Zero external tracking.',
    icon: 'shield-checkmark-outline',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    cardBg: '#18181B',
    iconColor: '#A855F7',
  },
];
