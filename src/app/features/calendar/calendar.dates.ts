import { addDays, fromIsoDate, startOfDay } from '../../shared/format/dates';

const MS_PER_DAY = 86_400_000;

/** Monday-first, matching the legacy agenda. */
export function startOfWeek(date: Date): Date {
  const start = startOfDay(date);
  return addDays(start, -((start.getDay() + 6) % 7));
}

export function daysBetween(startIso: string, endIso: string): number {
  const start = startOfDay(fromIsoDate(startIso)).getTime();
  const end = startOfDay(fromIsoDate(endIso)).getTime();
  return Math.max(0, Math.round((end - start) / MS_PER_DAY));
}

/** Every local day in an inclusive `YYYY-MM-DD` window. */
export function eachDay(startIso: string, endIso: string): Date[] {
  const first = fromIsoDate(startIso);
  return Array.from({ length: daysBetween(startIso, endIso) + 1 }, (_, index) =>
    addDays(first, index),
  );
}

export function minutesSinceMidnight(iso: string): number {
  const date = new Date(iso);
  return date.getHours() * 60 + date.getMinutes();
}
