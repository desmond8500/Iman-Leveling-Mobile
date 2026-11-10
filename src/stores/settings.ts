import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { isCountryCode } from '@/data/countries';
import { ApiClient, ApiError, normalizeServerUrl, type AuthResponse } from '@/services/api';
import { detectCountry } from '@/services/geolocation';
import { loadJson, saveJson } from '@/services/storage';
import { useProgressStore } from '@/stores/progress';
import type { Gender, SettingsData } from '@/types';
import { mergeProgress } from '@/utils/merge';

const STORAGE_KEY = 'iman.settings.v1';

export const defaultSettings = (): SettingsData => ({
  version: 1,
  gender: null,
  countryCode: null,
  server: { url: '', token: null, user: null, lastSync: null },
});

/** Remet en forme des réglages lus sur l'appareil (anciennes versions, données altérées). */
export function normalizeSettings(stored: unknown): SettingsData {
  const base = defaultSettings();
  if (typeof stored !== 'object' || stored === null) return base;
  const s = stored as Partial<SettingsData>;
  const server = (s.server ?? {}) as Partial<SettingsData['server']>;
  const user = server.user;
  return {
    version: 1,
    gender: s.gender === 'male' || s.gender === 'female' ? s.gender : null,
    countryCode: isCountryCode(s.countryCode) ? s.countryCode : null,
    server: {
      url: typeof server.url === 'string' ? server.url : '',
      token: typeof server.token === 'string' && server.token ? server.token : null,
      user:
        user && typeof user.name === 'string' && typeof user.email === 'string'
          ? { name: user.name, email: user.email }
          : null,
      lastSync: typeof server.lastSync === 'string' ? server.lastSync : null,
    },
  };
}

export const useSettingsStore = defineStore('settings', () => {
  const data = ref<SettingsData>(defaultSettings());
  const loaded = ref(false);
  const syncing = ref(false);
  const syncError = ref<string | null>(null);

  const gender = computed(() => data.value.gender);
  const countryCode = computed(() => data.value.countryCode);
  const serverUrl = computed(() => data.value.server.url);
  const user = computed(() => data.value.server.user);
  const lastSync = computed(() => data.value.server.lastSync);
  const isLinked = computed(() => !!data.value.server.token);

  const persist = () => saveJson(STORAGE_KEY, data.value);

  async function load() {
    data.value = normalizeSettings(await loadJson<unknown>(STORAGE_KEY, null));
    loaded.value = true;
  }

  async function setGender(value: Gender | null) {
    data.value = { ...data.value, gender: value };
    await persist();
  }

  async function setCountry(code: string | null) {
    if (code !== null && !isCountryCode(code)) return;
    data.value = { ...data.value, countryCode: code };
    await persist();
  }

  /** Détecte le pays grâce à la position de l'appareil, puis l'enregistre. Lève une LocationError. */
  async function detectAndSetCountry(): Promise<string> {
    const code = await detectCountry();
    await setCountry(code);
    return code;
  }

  /** Enregistre l'adresse du serveur. Renvoie `false` si elle est refusée (voir normalizeServerUrl). */
  async function setServerUrl(input: string): Promise<boolean> {
    const url = normalizeServerUrl(input);
    if (url === null) return false;
    // Changer de serveur invalide la session en cours.
    const changed = url !== data.value.server.url;
    data.value = {
      ...data.value,
      server: changed ? { url, token: null, user: null, lastSync: null } : data.value.server,
    };
    await persist();
    return true;
  }

  function client(): ApiClient {
    const { url, token } = data.value.server;
    if (!url) throw new ApiError("Renseigne d'abord l'adresse du serveur.", 0);
    return new ApiClient(url, token);
  }

  function clearSession() {
    data.value = {
      ...data.value,
      server: { ...data.value.server, token: null, user: null, lastSync: null },
    };
  }

  /** Crée un compte ou se connecte, puis lance une première synchronisation. */
  async function authenticate(
    mode: 'login' | 'register',
    form: { name?: string; email: string; password: string },
  ): Promise<void> {
    const api = client();
    const res: AuthResponse =
      mode === 'register'
        ? await api.register(form.name ?? '', form.email, form.password)
        : await api.login(form.email, form.password);
    if (!res?.token) throw new ApiError('Réponse inattendue du serveur.', 0);
    data.value = {
      ...data.value,
      server: {
        ...data.value.server,
        token: res.token,
        user: { name: res.user?.name ?? '', email: res.user?.email ?? form.email },
      },
    };
    await persist();
    await syncNow();
  }

  /** Déconnecte le compte. La progression reste sur l'appareil. */
  async function logout() {
    try {
      if (isLinked.value) await client().logout();
    } catch {
      // Le jeton local est supprimé même si le serveur est injoignable.
    }
    clearSession();
    syncError.value = null;
    await persist();
  }

  /** Récupère, fusionne puis envoie la progression. Renvoie `true` si tout s'est bien passé. */
  async function syncNow(): Promise<boolean> {
    if (!isLinked.value || syncing.value) return false;
    syncing.value = true;
    syncError.value = null;
    try {
      const api = client();
      const progress = useProgressStore();
      const remote = await api.getProgress();
      const local = progress.exportData();
      const merged = remote ? mergeProgress(local, remote.data) : local;
      await progress.importData(merged);
      const res = await api.putProgress(merged);
      data.value = {
        ...data.value,
        server: {
          ...data.value.server,
          lastSync: res?.updated_at ?? new Date().toISOString(),
        },
      };
      await persist();
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        clearSession();
        await persist();
        syncError.value = 'Session expirée : reconnecte-toi.';
      } else {
        syncError.value = e instanceof Error ? e.message : 'Synchronisation impossible.';
      }
      return false;
    } finally {
      syncing.value = false;
    }
  }

  return {
    data,
    loaded,
    syncing,
    syncError,
    gender,
    countryCode,
    serverUrl,
    user,
    lastSync,
    isLinked,
    load,
    setGender,
    setCountry,
    detectAndSetCountry,
    setServerUrl,
    authenticate,
    logout,
    syncNow,
  };
});
