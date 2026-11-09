import { addDays } from './date';

/**
 * Nombre de jours consécutifs où les 5 prières sont faites.
 * Si aujourd'hui n'est pas encore complet, la série d'hier reste affichée :
 * elle ne retombe à 0 que si hier est lui aussi incomplet.
 */
export function computeStreak(
  todayKey: string,
  isComplete: (dateKey: string) => boolean,
): number {
  let cursor = isComplete(todayKey) ? todayKey : addDays(todayKey, -1);
  let streak = 0;
  while (isComplete(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
