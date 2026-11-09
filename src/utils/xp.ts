import type { LevelInfo } from '../types';

export const PRAYER_XP = 20;
export const ALL_PRAYERS_BONUS = 50;

/** XP gagnée sur une journée : 20 par prière + 50 de bonus si toutes sont faites. */
export function xpForDay(done: number, total: number): number {
  const bonus = total > 0 && done === total ? ALL_PRAYERS_BONUS : 0;
  return done * PRAYER_XP + bonus;
}

/** XP nécessaire pour passer du niveau `level` au suivant (niveau 1 : 100, niveau 2 : 150, ...). */
export function xpToNextLevel(level: number): number {
  return 100 + 50 * (level - 1);
}

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining, xpForNext: xpToNextLevel(level) };
}
