export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: 'How is GrowPro 100% offline?',
    answer:
      'All your goals, habits, study plans, trades, and personal logs are stored directly on your phone using SQLite and MMKV/AsyncStorage. GrowPro never connects to any external servers or sends data over the internet.',
  },
  {
    question: 'How does App Lock protect my privacy?',
    answer:
      'You can set a 4-digit PIN and activate fingerprint/Face ID. Once enabled, GrowPro locks upon minimization and hides screen contents in the system multitasking switcher.',
  },
  {
    question: 'How do I backup or transfer my data?',
    answer:
      'Go to Settings → Data & Backup → Export Backup. This generates a portable .growpro JSON file that you can store in your files or share to another phone to import anytime.',
  },
  {
    question: 'How does the Focus Timer handle backgrounding?',
    answer:
      'The timer anchors against your device system clock timestamp rather than relying on an active JavaScript tick loop, guaranteeing accurate elapsed time even when your phone screen turns off.',
  },
];

