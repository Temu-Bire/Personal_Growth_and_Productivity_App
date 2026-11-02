import { useMemo } from 'react';
import { format, isToday, parseISO } from 'date-fns';

export function useToday() {
  const today = useMemo(() => new Date(), []);
  const todayDateString = useMemo(() => format(today, 'yyyy-MM-dd'), [today]);
  const formattedToday = useMemo(() => format(today, 'EEE, MMM d, yyyy'), [today]);

  const checkIsToday = (dateString: string) => {
    try {
      return isToday(parseISO(dateString));
    } catch {
      return false;
    }
  };

  return {
    today,
    todayDateString,
    formattedToday,
    checkIsToday,
  };
}
