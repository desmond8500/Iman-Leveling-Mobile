/**
 * Version de l'application (numérotation sémantique : MAJEUR.MINEUR.CORRECTIF).
 * La source unique est `version` dans package.json ; Vite l'injecte à la compilation.
 * Hors compilation (tests), on renvoie « dev ».
 */
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';

/** « v0.2.0 », ou « dev » hors compilation. */
export const versionLabel = (version: string = APP_VERSION): string => (/^\d/.test(version) ? `v${version}` : version);

/** `versionCode` Android déduit de la version : 0.2.0 -> 200, 1.4.12 -> 10412. Toujours croissant. */
export function androidVersionCode(version: string): number | null {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) return null;
  const [major, minor, patch] = match.slice(1).map(Number);
  if (minor > 99 || patch > 99) return null;
  return major * 10000 + minor * 100 + patch;
}
