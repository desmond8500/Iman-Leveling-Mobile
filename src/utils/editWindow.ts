import { addDays } from './date';
import { computePrayerTimes, type CalcOptions, type Coordinates } from './prayerTimes';

/** Heure de repli (locale) quand la position n'est pas connue : on ne peut pas calculer Fajr. */
export const FALLBACK_CUTOFF_HOUR = 5;

/**
 * Moment où la veille cesse d'être modifiable : l'heure de Fajr du jour en cours (la nuit
 * précédente se prolonge jusqu'à l'aube). Sans position, 5 h du matin.
 */
export function editCutoff(now: Date, coords: Coordinates | null, calc: CalcOptions): Date {
  const fajr = coords ? computePrayerTimes(now, coords, calc).fajr : null;
  return fajr ?? new Date(now.getFullYear(), now.getMonth(), now.getDate(), FALLBACK_CUTOFF_HOUR);
}

/**
 * Un jour est modifiable s'il s'agit d'aujourd'hui, ou d'hier tant que Fajr n'est pas arrivé.
 * `cutoffMs` vaut `null` tant qu'il n'est pas connu : hier reste alors en lecture seule.
 */
export function canEditDay(dateKey: string, todayKey: string, nowMs: number, cutoffMs: number | null): boolean {
  if (dateKey === todayKey) return true;
  return dateKey === addDays(todayKey, -1) && cutoffMs !== null && nowMs < cutoffMs;
}
