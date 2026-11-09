import { Preferences } from '@capacitor/preferences';

/**
 * Stockage local : Capacitor Preferences (natif sur mobile, localStorage dans le navigateur).
 */
export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  const { value } = await Preferences.get({ key });
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function saveJson<T>(key: string, value: T): Promise<void> {
  await Preferences.set({ key, value: JSON.stringify(value) });
}
