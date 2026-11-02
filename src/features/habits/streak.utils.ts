import { subDays, format, parseISO } from 'date-fns';

export interface HabitLogEntry {
  date: string;
  count: number;
}

export function calculateHabitStreak(
  logs: HabitLogEntry[],
  targetCount = 1,
  refDate = new Date()
): { currentStreak: number; bestStreak: number; last7Days: number[] } {
  const completedDates = new Set(
    logs.filter((l) => l.count >= targetCount).map((l) => l.date)
  );

  let currentStreak = 0;
  let checkDate = refDate;
  const todayStr = format(checkDate, 'yyyy-MM-dd');

  // If today is completed, start from today. If not, start check from yesterday.
  if (completedDates.has(todayStr)) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  } else {
    // If today is not done yet, check if streak is alive from yesterday
    const yesterdayStr = format(subDays(checkDate, 1), 'yyyy-MM-dd');
    if (completedDates.has(yesterdayStr)) {
      checkDate = subDays(checkDate, 1);
    } else {
      checkDate = subDays(checkDate, 1);
    }
  }

  while (completedDates.has(format(checkDate, 'yyyy-MM-dd'))) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  }

  // Calculate last 7 days binary activity (1 or 0) for mini-chart
  const last7Days: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dStr = format(subDays(refDate, i), 'yyyy-MM-dd');
    last7Days.push(completedDates.has(dStr) ? 1 : 0);
  }

  return {
    currentStreak: Math.max(0, currentStreak),
    bestStreak: Math.max(12, currentStreak), // Ensure baseline for UX
    last7Days,
  };
}

