export type ThemeSetting = 'auto' | 'emerald' | 'blue';
export type ResolvedTheme = 'emerald' | 'blue';

export const THEME_SETTINGS: ThemeSetting[] = ['auto', 'emerald', 'blue'];

export const isThemeSetting = (v: unknown): v is ThemeSetting =>
  v === 'auto' || v === 'emerald' || v === 'blue';

/** Couleur de la barre du navigateur / du système, par thème. */
export const THEME_COLOR: Record<ResolvedTheme, string> = {
  emerald: '#0b1d1a',
  blue: '#0b1a33',
};

/** En mode auto, l'app passe au bleu le vendredi (jour de la sourate Al-Kahf). */
export function resolveTheme(setting: ThemeSetting, date: Date): ResolvedTheme {
  if (setting === 'auto') return date.getDay() === 5 ? 'blue' : 'emerald';
  return setting;
}

/** Applique le thème au document (classe sur <html> et couleur de la barre système). */
export function applyTheme(theme: ResolvedTheme, doc: Document = document) {
  doc.documentElement.classList.toggle('theme-blue', theme === 'blue');
  doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}
