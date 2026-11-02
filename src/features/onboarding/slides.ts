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
    title: 'Take Control of Your Time',
    description: 'Plan your day, achieve your goals.',
    icon: 'time-outline',
    badgeBg: '#D1FAE5',
    cardBg: '#ECFDF5',
    iconColor: '#059669',
  },
  {
    id: '2',
    title: 'Build Good Habits',
    description: 'Replace bad habits with positive ones. Track streaks every day.',
    icon: 'checkmark-circle-outline',
    badgeBg: '#FEF3C7',
    cardBg: '#FFFBEB',
    iconColor: '#D97706',
  },
  {
    id: '3',
    title: 'Be Your Best Self',
    description: 'Learn, grow and succeed — private and fully offline.',
    icon: 'trophy-outline',
    badgeBg: '#EDE9FE',
    cardBg: '#F5F3FF',
    iconColor: '#7C3AED',
  },
];
