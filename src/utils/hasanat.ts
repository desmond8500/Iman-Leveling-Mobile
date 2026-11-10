import type { LevelInfo } from '../types';

export const PRAYER_HASANAT = 20;
export const ALL_PRAYERS_BONUS = 50;
export const SUNNAH_EMPHASIZED_HASANAT = 10;
export const SUNNAH_HASANAT = 5;

/** Hasanat d'une sunna : 10 pour une sunna confirmée, 5 sinon. */
export function sunnahReward(emphasized: boolean): number {
  return emphasized ? SUNNAH_EMPHASIZED_HASANAT : SUNNAH_HASANAT;
}

/**
 * Hasanat gagnés sur une journée : 20 par prière obligatoire, +50 de bonus si les 5 sont faites,
 * plus les Hasanat des sunnas (`sunnahTotal`).
 */
export function hasanatForDay(done: number, total: number, sunnahTotal = 0): number {
  const bonus = total > 0 && done === total ? ALL_PRAYERS_BONUS : 0;
  return done * PRAYER_HASANAT + bonus + sunnahTotal;
}

/** Hasanat nécessaires pour passer du niveau `level` au suivant (niveau 1 : 100, niveau 2 : 150, ...). */
export function hasanatToNextLevel(level: number): number {
  return 100 + 50 * (level - 1);
}

export function levelFromHasanat(total: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, Math.floor(total));
  while (remaining >= hasanatToNextLevel(level)) {
    remaining -= hasanatToNextLevel(level);
    level += 1;
  }
  return { level, hasanatIntoLevel: remaining, hasanatForNext: hasanatToNextLevel(level) };
}
