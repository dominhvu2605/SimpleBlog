import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'dd MMM yyyy', { locale: vi });
}

export function getYear(dateStr: string): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'yyyy');
}

export const categoryLabel: Record<string, string> = {
  life:     'Cuộc sống',
  notes:    'Ghi chú',
  thoughts: 'Suy nghĩ',
};
