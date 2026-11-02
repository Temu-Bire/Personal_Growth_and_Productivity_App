# GrowPro — Offline Edition ("Plan · Focus · Achieve")

GrowPro is a production-quality, **100% offline-first** personal growth mobile application built with **React Native**, **Expo SDK 58**, and **TypeScript (strict mode)**.

It requires **no backend, no accounts, no authentication APIs, and no internet connectivity**. All personal growth data, habits, trade logs, focus timer sessions, and reflections remain strictly on the device inside **SQLite** and **AsyncStorage**.

---

## 📱 Features & Architecture

### 1. Visual Flow & Screens (Matching Design Specification)
- **Splash Screen**: Mountain landscape artwork, brand green identity (`#0F4D2E` / `#1E8E4E`), tagline "Plan · Focus · Achieve", automatic progression.
- **Onboarding Flow (3 Slides + Profile + App Lock)**:
  - Slide 1: "Take Control of Your Time" (Clock badge)
  - Slide 2: "Build Good Habits" (Checkmark badge)
  - Slide 3: "Be Your Best Self" (Trophy badge)
  - Profile Setup: Local display name, avatar photo picker, and main focus selection (Study, Habits, Work, Trading).
  - App Lock Setup: 4-digit PIN creation, biometric authentication toggle, and skip options.
- **Lock Screen**: Dark forest green theme, PIN keypad, biometric authentication (fingerprint / Face ID), security lock on app minimization.
- **Dashboard**:
  - Personalized greeting with user display name.
  - "Today's Focus %" circular progress ring (computed dynamically from today's completed tasks and habits).
  - "Today's Priorities" with top 3 checkable tasks and haptic feedback.
  - "Quick Actions": Focus Timer, Add Task, New Journal.
- **Tasks & Schedule**: Date switcher, segmented tabs ("Tasks" vs "Schedule" timeline), "+ Add Task" bottom sheet modal.
- **Focus Timer**:
  - Pomodoro (25m), Short Break (5m), Long Break (15m).
  - Circular countdown display (`25:00`), play/pause/reset.
  - Background-safe: tracks start timestamp against `Date.now()` to avoid drift when minimized.
  - Screen keep-awake (`expo-keep-awake`) and audio/notification chime on completion.
- **Habits Tracker**:
  - Streak banner ("🔥 12 Day Streak" with mini 7-day bar chart).
  - Habit cards with progress percentage bar, unit increments, and check completion.
- **Study Planner**:
  - Subjects tab: Mathematics 78%, Physics 44%, ICT 40%, English 63%.
  - Chapter/topic checklists that drive each subject's progress percentage.
  - Schedule tab: weekly study session timetable.
- **Projects Manager**:
  - Project cards (Trading Journal App, AI Churn Prediction, Chat App).
  - Due dates, milestone progress bars, subtask checklist.
- **Journal**:
  - Tabs: Daily, Weekly, Monthly.
  - 5 mood emojis (😢, 😔, 😐, 😊, 🤩).
  - Thoughts text area, categorized tag pills, offline persistence.
- **Trading Journal**:
  - Overview tab: Win Rate %, Total P&L ($), equity curve line chart, recent trade list.
  - Trades tab: Trade history with entry/exit/lot size.
  - Add Trade modal: Buy/Sell direction, lot size, P&L, strategy notes.
- **Analytics Dashboard**:
  - Productivity score (82%) with trend line chart.
  - Time usage SVG donut chart (Study, Work, Sports, Others).
- **Weekly Review**:
  - Weekly summary card, "Great week!" banner, tasks completed count, habit streak consistency, top achievements, and reflection note.
- **Settings & Security**:
  - Local profile editing (name, avatar).
  - App Lock & Security: PIN change, biometrics switch, lock when minimized, hide content in app switcher.
  - Data & Backup: Export `.growpro` backup file via `expo-sharing`, import `.growpro` backup via `expo-document-picker`, wipe database.
  - Appearance: Light / Dark / System mode toggle.
- **Help & Support**:
  - Expandable FAQ accordion.
  - App guide, feedback mailer (`Linking.openURL`), offline documentation.

---

## 🛠️ Tech Stack

- **Framework**: Expo SDK 58 (React Native 0.88.1, React 19)
- **Language**: TypeScript (strict mode enabled)
- **Database**: `expo-sqlite` (Synchronous WAL mode, typed repositories)
- **Storage**: `@react-native-async-storage/async-storage` for configuration flags
- **Navigation**: `@react-navigation/native` with `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, and `@react-navigation/drawer`
- **Charts**: Custom SVG visualizations using `react-native-svg` (Line Chart, Bar Chart, Donut Chart, Progress Ring)
- **Device Features**: `expo-local-authentication`, `expo-keep-awake`, `expo-haptics`, `expo-notifications`, `expo-file-system`, `expo-sharing`, `expo-document-picker`, `expo-image-picker`
- **Date Handling**: `date-fns`

---

## 🚀 Running the App

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code with Expo Go.

### 3. Type Checking
```bash
npx tsc --noEmit
```

---

## 🔒 100% Offline Guarantee
GrowPro has no remote dependencies, external APIs, telemetry, or cloud databases. All SQLite database files reside strictly within the application's sandboxed local document directory.
