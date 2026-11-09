import { subDays, format, parseISO, differenceInCalendarDays } from 'date-fns';

export interface HabitLogEntry {
  date: string;
  count: number;
  notes?: string | null;
}

export function calculateHabitStreak(
  logs: HabitLogEntry[],
  targetCount = 1,
  refDate = new Date()
): { currentStreak: number; longestStreak: number; last7Days: number[] } {
  // Extract and sort distinct dates where target count was met
  const validDates = Array.from(
    new Set(logs.filter((l) => l.count >= targetCount).map((l) => l.date))
  ).sort();

  const completedSet = new Set(validDates);

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let checkDate = refDate;
  const todayStr = format(checkDate, 'yyyy-MM-dd');

  if (completedSet.has(todayStr)) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  } else {
    // If today is not completed yet, streak is still active if yesterday was completed
    const yesterdayStr = format(subDays(checkDate, 1), 'yyyy-MM-dd');
    if (completedSet.has(yesterdayStr)) {
      checkDate = subDays(checkDate, 1);
    }
  }

  while (completedSet.has(format(checkDate, 'yyyy-MM-dd'))) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  }

  // 2. Calculate Longest Streak Across Entire History
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of validDates) {
    const currentDate = parseISO(dateStr);
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diff = differenceInCalendarDays(currentDate, prevDate);
      if (diff === 1) {
        runningStreak++;
      } else if (diff > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = currentDate;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // 3. Binary activity for the past 7 days (1 or 0)
  const last7Days: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dStr = format(subDays(refDate, i), 'yyyy-MM-dd');
    last7Days.push(completedSet.has(dStr) ? 1 : 0);
  }

  return {
    currentStreak,
    longestStreak,
    last7Days,
  };
}
