import { fastingInfo, isForbiddenFastDay } from './fasting';
import { toHijri } from './hijri';

export type ThemeSetting = 'auto' | 'emerald' | 'blue' | 'yellow' | 'gold';
export type ResolvedTheme = 'emerald' | 'blue' | 'yellow' | 'gold';

export const THEME_SETTINGS: ThemeSetting[] = ['auto', 'emerald', 'blue', 'yellow', 'gold'];

/** Thèmes portés par une classe sur <html> (l'émeraude est le thème de base, sans classe). */
const THEME_CLASSES: Exclude<ResolvedTheme, 'emerald'>[] = ['blue', 'yellow', 'gold'];

export const isThemeSetting = (v: unknown): v is ThemeSetting => THEME_SETTINGS.includes(v as ThemeSetting);

/** Couleur de la barre du navigateur / du système, par thème. */
export const THEME_COLOR: Record<ResolvedTheme, string> = {
  emerald: '#0b1d1a',
  blue: '#0b1a33',
  yellow: '#1f1d0c',
  gold: '#24180a',
};

/** Jour de fête : Aïd al-Fitr (1er Chawwal) et Aïd al-Adha avec les jours de tachriq (10 à 13 Dhou al-hijja). */
export function isFeastDay(date: Date): boolean {
  const h = toHijri(date);
  return isForbiddenFastDay(h.month, h.day);
}

/**
 * En mode auto, par ordre de priorité :
 * - or les jours de fête ;
 * - jaune les jours blancs (13, 14 et 15 du mois hégirien, hors Ramadan) ;
 * - bleu le vendredi (jour de la sourate Al-Kahf) ;
 * - émeraude les autres jours.
 */
export function resolveTheme(setting: ThemeSetting, date: Date): ResolvedTheme {
  if (setting !== 'auto') return setting;
  if (isFeastDay(date)) return 'gold';
  if (fastingInfo(date).white) return 'yellow';
  return date.getDay() === 5 ? 'blue' : 'emerald';
}

/** Applique le thème au document (classe sur <html> et couleur de la barre système). */
export function applyTheme(theme: ResolvedTheme, doc: Document = document) {
  for (const t of THEME_CLASSES) doc.documentElement.classList.toggle(`theme-${t}`, theme === t);
  doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}
