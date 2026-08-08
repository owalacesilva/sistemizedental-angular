const MS_PER_DAY = 86_400_000;

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** Local-calendar `YYYY-MM-DD` — never `toISOString()`, which shifts to UTC. */
export function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Parses `YYYY-MM-DD` as local midnight, not UTC midnight. */
export function fromIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function isToday(date: Date): boolean {
  return startOfDay(date).getTime() === startOfDay(new Date()).getTime();
}

/**
 * Coarse "how long ago" label for a visit date. Deliberately coarse — the exact
 * timestamp is never what a receptionist is scanning for.
 */
export function relativeDay(iso: string | null): string {
  if (!iso) {
    return 'No visits yet';
  }

  const days = Math.round((Date.now() - new Date(iso).getTime()) / MS_PER_DAY);
  if (days <= 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 30) {
    return `${days} days ago`;
  }

  const months = Math.round(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}
