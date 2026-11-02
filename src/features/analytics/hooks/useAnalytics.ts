import { useMemo } from 'react';
import { FocusRepository } from '../../focus-timer/focus.repository';
import { TasksRepository } from '../../tasks/tasks.repository';
import { HabitsRepository } from '../../habits/habits.repository';
import { DonutSegment } from '../../../components/charts/DonutChart';

export function useAnalytics() {
  const today = new Date().toISOString().split('T')[0];

  const categoryUsage = useMemo(() => {
    const raw = FocusRepository.getCategoryUsage();
    if (raw.length === 0) {
      return [
        { category: 'Study', minutes: 120 },
        { category: 'Work', minutes: 95 },
        { category: 'Sports', minutes: 48 },
        { category: 'Others', minutes: 36 },
      ];
    }
    return raw;
  }, []);

  const donutSegments: DonutSegment[] = useMemo(() => {
    const palette = ['#1E8E4E', '#6D4AFF', '#F59E0B', '#3B82F6', '#10B981'];
    return categoryUsage.map((c, i) => ({
      label: c.category,
      value: c.minutes,
      color: palette[i % palette.length],
    }));
  }, [categoryUsage]);

  const productivityScore = 82;
  const productivityTrend = [64, 68, 72, 75, 78, 80, 82];

  return {
    productivityScore,
    productivityTrend,
    donutSegments,
    categoryUsage,
  };
}

