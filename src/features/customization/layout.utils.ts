import { PageLayoutConfig } from './customization.types';

export function sortItemsByLayout<T extends Record<string, any>>(
  items: T[],
  layout?: PageLayoutConfig
): T[] {
  if (!layout) return items;
  const { sortBy, sortDirection } = layout;
  if (!sortBy) return items;

  const sorted = [...items].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    // Fallbacks
    if (sortBy === 'title') {
      valA = a.title ?? a.name ?? '';
      valB = b.title ?? b.name ?? '';
    } else if (sortBy === 'due_date') {
      valA = a.due_date ?? a.date ?? '';
      valB = b.due_date ?? b.date ?? '';
    } else if (sortBy === 'created_at') {
      valA = a.created_at ?? '';
      valB = b.created_at ?? '';
    } else if (sortBy === 'priority') {
      const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
      valA = priorityOrder[a.priority] ?? 0;
      valB = priorityOrder[b.priority] ?? 0;
    }

    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  return sorted;
}

