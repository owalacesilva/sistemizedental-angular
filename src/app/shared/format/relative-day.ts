import { injectPlural, injectT } from '../../core/i18n/translate';

const MS_PER_DAY = 86_400_000;

/** Deliberately coarse: the exact timestamp is never what a receptionist scans for. */
const MONTH_THRESHOLD_DAYS = 30;

export type RelativeDayFn = (iso: string | null) => string;

/**
 * A localised "how long ago" label for a visit date.
 *
 * Returned as a bound function so a component keeps the terse
 * `relativeDay(patient.lastVisit)` call in its template, and reads the active
 * locale as it formats — which is what makes the label re-render on a language
 * switch.
 *
 * Usage: `protected readonly relativeDay = injectRelativeDay();`
 */
export function injectRelativeDay(): RelativeDayFn {
  const t = injectT();
  const plural = injectPlural();

  return (iso) => {
    if (!iso) {
      return t('relative.never');
    }

    const days = Math.round((Date.now() - new Date(iso).getTime()) / MS_PER_DAY);

    if (days <= 0) {
      return t('relative.today');
    }
    if (days === 1) {
      return t('relative.yesterday');
    }
    if (days < MONTH_THRESHOLD_DAYS) {
      return plural('relative.days', days);
    }

    return plural('relative.months', Math.round(days / MONTH_THRESHOLD_DAYS));
  };
}
