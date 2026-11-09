import { calculateHabitStreak } from '../streak.utils';
import { parseISO } from 'date-fns';

describe('Habit Streak Calculator', () => {
  const refDate = parseISO('2026-03-10');

  it('calculates current streak when today is completed', () => {
    const logs = [
      { date: '2026-03-10', count: 1 },
      { date: '2026-03-09', count: 1 },
      { date: '2026-03-08', count: 1 },
    ];
    const { currentStreak, longestStreak } = calculateHabitStreak(logs, 1, refDate);
    expect(currentStreak).toBe(3);
    expect(longestStreak).toBe(3);
  });

  it('preserves streak if today is pending but yesterday was completed', () => {
    const logs = [
      { date: '2026-03-09', count: 1 },
      { date: '2026-03-08', count: 1 },
    ];
    const { currentStreak, longestStreak } = calculateHabitStreak(logs, 1, refDate);
    expect(currentStreak).toBe(2);
    expect(longestStreak).toBe(2);
  });

  it('returns 0 current streak if yesterday and today are missed', () => {
    const logs = [
      { date: '2026-03-07', count: 1 },
      { date: '2026-03-06', count: 1 },
    ];
    const { currentStreak, longestStreak } = calculateHabitStreak(logs, 1, refDate);
    expect(currentStreak).toBe(0);
    expect(longestStreak).toBe(2);
  });

  it('computes longest streak across historical data without fabrication', () => {
    const logs = [
      { date: '2026-01-01', count: 1 },
      { date: '2026-01-02', count: 1 },
      { date: '2026-01-03', count: 1 },
      { date: '2026-01-04', count: 1 },
      { date: '2026-01-05', count: 1 }, // 5-day streak
      { date: '2026-02-10', count: 1 },
      { date: '2026-03-10', count: 1 }, // today
    ];
    const { currentStreak, longestStreak } = calculateHabitStreak(logs, 1, refDate);
    expect(currentStreak).toBe(1);
    expect(longestStreak).toBe(5);
  });
});

