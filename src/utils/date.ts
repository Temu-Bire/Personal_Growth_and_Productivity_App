import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays } from 'date-fns';

export function formatDate(date: Date | string, pattern = 'yyyy-MM-dd'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, pattern);
  } catch {
    return String(date);
  }
}

export function formatTimeRange(start?: string | null, end?: string | null): string {
  if (!start && !end) return '';
  if (start && !end) return start;
  if (!start && end) return end;
  return `${start} - ${end}`;
}

export function getCurrentWeekDays(refDate = new Date()): Date[] {
  const start = startOfWeek(refDate, { weekStartsOn: 1 });
  const end = endOfWeek(refDate, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getDaysAgo(days: number): string {
  return formatDate(subDays(new Date(), days), 'yyyy-MM-dd');
}

export function getDaysAhead(days: number): string {
  return formatDate(addDays(new Date(), days), 'yyyy-MM-dd');
}

