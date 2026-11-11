import type { Gender, LevelInfo } from '../types';

/** Prière obligatoire : 27 à la mosquée, 1 à la maison (hommes). */
export const PRAYER_MOSQUE_HASANAT = 27;
export const PRAYER_HOME_HASANAT = 1;
/** Prière obligatoire pour les femmes (et tant que le genre n'est pas renseigné). */
export const PRAYER_DEFAULT_HASANAT = 27;
/** Prière surérogatoire : 27 pour les hommes comme pour les femmes. */
export const SUNNAH_HASANAT = 27;
export const ALL_PRAYERS_BONUS = 50;
export const ADHKAR_HASANAT = 5;

/**
 * Hasanat d'une prière obligatoire. Le lieu (mosquée ou maison) ne compte que pour les hommes.
 */
export function prayerReward(gender: Gender | null, atMosque: boolean): number {
  if (gender === 'male') return atMosque ? PRAYER_MOSQUE_HASANAT : PRAYER_HOME_HASANAT;
  return PRAYER_DEFAULT_HASANAT;
}

export interface DayTally {
  /** Somme des Hasanat des prières obligatoires faites (selon le lieu et le genre). */
  prayerHasanat: number;
  /** Nombre de prières obligatoires faites, et nombre total possible. */
  done: number;
  total: number;
  sunnah: number;
  adhkar: number;
}

/**
 * Hasanat d'une journée : prières obligatoires, +50 de bonus si toutes sont faites,
 * 27 par prière surérogatoire et 5 par invocation du matin ou du soir.
 */
export function hasanatForDay({ prayerHasanat, done, total, sunnah, adhkar }: DayTally): number {
  const bonus = total > 0 && done === total ? ALL_PRAYERS_BONUS : 0;
  return prayerHasanat + bonus + sunnah * SUNNAH_HASANAT + adhkar * ADHKAR_HASANAT;
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
