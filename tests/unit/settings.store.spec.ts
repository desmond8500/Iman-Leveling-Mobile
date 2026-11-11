import { createPinia, setActivePinia } from 'pinia';
import { DEFAULT_SERVER_URL, normalizeServerUrl } from '@/services/api';
import type { ProgressRepository } from '@/services/progressRepository';
import { setProgressRepository, useProgressStore } from '@/stores/progress';
import { normalizeSettings, useSettingsStore } from '@/stores/settings';
import type { ProgressData } from '@/types';
import { toDateKey } from '@/utils/date';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

interface Call {
  method: string;
  path: string;
  body: any;
  auth: string | undefined;
}

/** Faux serveur : `routes` associe « METHODE /chemin » à une réponse. */
function stubServer(routes: Record<string, () => Response>) {
  const calls: Call[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    const path = new URL(url).pathname.replace(/^\/api/, '');
    const method = init.method ?? 'GET';
    calls.push({
      method,
      path,
      body: init.body ? JSON.parse(init.body as string) : undefined,
      auth: (init.headers as Record<string, string>)?.Authorization,
    });
    const route = routes[`${method} ${path}`];
    if (!route) throw new TypeError('Failed to fetch');
    return route();
  }) as unknown as typeof fetch;
  return { calls, restore: () => (globalThis.fetch = original) };
}

function memoryRepository(initial?: ProgressData) {
  let data: ProgressData = initial ?? { version: 1, days: {} };
  const repo: ProgressRepository & { saved: () => ProgressData } = {
    load: async () => data,
    save: async (next) => {
      data = next;
    },
    saved: () => data,
  };
  return repo;
}

const today = () => toDateKey(new Date());
const AUTH = () => json({ token: 'tok123', user: { name: 'Aïcha', email: 'a@b.c' } });

describe('settings store', () => {
  let server: ReturnType<typeof stubServer> | null = null;
  let repo: ReturnType<typeof memoryRepository>;

  beforeEach(() => {
    localStorage.clear();
    repo = memoryRepository();
    setProgressRepository(repo);
    setActivePinia(createPinia());
  });

  afterEach(() => {
    server?.restore();
    server = null;
  });

  async function freshStores() {
    const progress = useProgressStore();
    const settings = useSettingsStore();
    await progress.load();
    await settings.load();
    return { progress, settings };
  }

  describe('normalizeSettings', () => {
    it('renvoie les valeurs par défaut pour des données invalides', () => {
      for (const bad of [null, undefined, 42, 'x', []]) {
        const s = normalizeSettings(bad);
        expect(s.gender).toBeNull();
        expect(s.countryCode).toBeNull();
        expect(s.server.token).toBeNull();
      }
    });

    it('écarte les valeurs hors liste', () => {
      const s = normalizeSettings({ gender: 'autre', countryCode: 'XX', server: { token: '', user: { name: 1 } } });
      expect(s.gender).toBeNull();
      expect(s.countryCode).toBeNull();
      expect(s.server.token).toBeNull();
      expect(s.server.user).toBeNull();
    });
  });

  describe('profil', () => {
    it('démarre sans genre ni pays', async () => {
      const { settings } = await freshStores();
      expect(settings.gender).toBeNull();
      expect(settings.countryCode).toBeNull();
      expect(settings.isLinked).toBe(false);
    });

    it('conserve le genre et le pays après un redémarrage', async () => {
      const { settings } = await freshStores();
      await settings.setGender('female');
      await settings.setCountry('SN');

      setActivePinia(createPinia());
      const reloaded = useSettingsStore();
      await reloaded.load();
      expect(reloaded.gender).toBe('female');
      expect(reloaded.countryCode).toBe('SN');
    });

    it('refuse un code pays inconnu', async () => {
      const { settings } = await freshStores();
      await settings.setCountry('FR');
      await settings.setCountry('XX');
      expect(settings.countryCode).toBe('FR');
    });
  });

  describe('position et méthode de calcul', () => {
    it('ignore une position ou une méthode invalide', () => {
      const s = normalizeSettings({ location: { lat: 99, lon: 0 }, prayerMethod: 'XXX' });
      expect(s.location).toBeNull();
      expect(s.prayerMethod).toBeNull();
      expect(normalizeSettings({ location: { lat: '1', lon: 2 } }).location).toBeNull();
      expect(normalizeSettings({ location: { lat: 14.69, lon: -17.45 } }).location).toEqual({ lat: 14.69, lon: -17.45 });
    });

    it('propose la méthode du pays, sauf choix explicite', async () => {
      const { settings } = await freshStores();
      expect(settings.prayerMethod).toBe('MWL');
      await settings.setCountry('SA');
      expect(settings.prayerMethod).toBe('MAKKAH');
      await settings.setPrayerMethod('UOIF');
      expect(settings.prayerMethod).toBe('UOIF');
      await settings.setPrayerMethod(null);
      expect(settings.prayerMethod).toBe('MAKKAH');
    });

    it('refuse une méthode inconnue', async () => {
      const { settings } = await freshStores();
      await settings.setPrayerMethod('ISNA');
      await settings.setPrayerMethod('XXX' as never);
      expect(settings.prayerMethod).toBe('ISNA');
    });
  });

  describe('début du Ramadan', () => {
    it('enregistre une date valide, refuse le reste, et revient au calendrier avec null', async () => {
      const { settings } = await freshStores();
      expect(settings.ramadanStart).toBeNull();
      await settings.setRamadanStart('2027-02-09');
      expect(settings.ramadanStart).toBe('2027-02-09');
      await settings.setRamadanStart('2027-13-45');
      expect(settings.ramadanStart).toBe('2027-02-09');
      await settings.setRamadanStart(null);
      expect(settings.ramadanStart).toBeNull();
    });
    it('écarte une valeur invalide lue sur l\'appareil', () => {
      expect(normalizeSettings({ ramadanStart: 'demain' }).ramadanStart).toBeNull();
      expect(normalizeSettings({ ramadanStart: '2027-02-09' }).ramadanStart).toBe('2027-02-09');
    });
  });

  describe('serveur par défaut', () => {
    it('utilise le serveur officiel tant qu\'aucun autre n\'est choisi', async () => {
      expect(normalizeSettings(null).server.url).toBe('https://imanserver.yonkou.info');
      expect(normalizeSettings({ server: { url: '' } }).server.url).toBe(DEFAULT_SERVER_URL);
      expect(normalizeSettings({ server: { url: 'https://autre.example.com' } }).server.url).toBe('https://autre.example.com');
      const { settings } = await freshStores();
      expect(settings.serverUrl).toBe(DEFAULT_SERVER_URL);
    });

    it('l\'adresse officielle est acceptée', () => {
      expect(normalizeServerUrl(DEFAULT_SERVER_URL)).toBe(DEFAULT_SERVER_URL);
    });
  });

  describe('adresse du serveur', () => {
    it('refuse http hors localhost et accepte https', async () => {
      const { settings } = await freshStores();
      expect(await settings.setServerUrl('http://iman.example.com')).toBe(false);
      expect(settings.serverUrl).toBe(DEFAULT_SERVER_URL);
      expect(await settings.setServerUrl('https://iman.example.com/')).toBe(true);
      expect(settings.serverUrl).toBe('https://iman.example.com');
    });

    it('change de serveur = déconnexion', async () => {
      server = stubServer({ 'POST /auth/login': AUTH, 'GET /progress': () => json({}, 404), 'PUT /progress': () => json({ updated_at: 'D' }) });
      const { settings } = await freshStores();
      await settings.setServerUrl('https://a.test');
      await settings.authenticate('login', { email: 'a@b.c', password: 'motdepasse' });
      expect(settings.isLinked).toBe(true);
      await settings.setServerUrl('https://autre.test');
      expect(settings.isLinked).toBe(false);
    });
  });

  describe('compte et synchronisation', () => {
    it('se connecte au serveur officiel tant qu\'aucune autre adresse n\'est choisie', async () => {
      const urls: string[] = [];
      const original = globalThis.fetch;
      globalThis.fetch = (async (url: string) => {
        urls.push(url);
        throw new TypeError('Failed to fetch');
      }) as unknown as typeof fetch;
      try {
        const { settings } = await freshStores();
        await expect(settings.authenticate('login', { email: 'a@b.c', password: 'x' })).rejects.toMatchObject({
          message: 'Serveur injoignable.',
        });
        expect(urls[0]).toBe(`${DEFAULT_SERVER_URL}/api/auth/login`);
      } finally {
        globalThis.fetch = original;
      }
    });

    it('connexion : jeton enregistré, progression locale envoyée au serveur', async () => {
      server = stubServer({
        'POST /auth/login': AUTH,
        'GET /progress': () => json({ message: 'none' }, 404),
        'PUT /progress': () => json({ updated_at: '2026-11-10T10:00:00Z' }),
      });
      const { settings, progress } = await freshStores();
      await progress.togglePrayer('fajr');
      await settings.setServerUrl('https://s.test');
      await settings.authenticate('login', { email: 'a@b.c', password: 'motdepasse' });

      expect(settings.isLinked).toBe(true);
      expect(settings.user).toEqual({ name: 'Aïcha', email: 'a@b.c' });
      expect(settings.lastSync).toBe('2026-11-10T10:00:00Z');
      expect(settings.syncError).toBeNull();

      const put = server.calls.find((c) => c.method === 'PUT')!;
      expect(put.auth).toBe('Bearer tok123');
      expect(put.body.data.days[today()].prayers.fajr).toBe(true);
    });

    it('le mot de passe n\'est jamais enregistré sur l\'appareil', async () => {
      server = stubServer({ 'POST /auth/login': AUTH, 'GET /progress': () => json({}, 404), 'PUT /progress': () => json({ updated_at: 'D' }) });
      const { settings } = await freshStores();
      await settings.setServerUrl('https://s.test');
      await settings.authenticate('login', { email: 'a@b.c', password: 'secret-unique-42' });
      const stored = JSON.stringify(Object.fromEntries(
        Array.from({ length: localStorage.length ?? 0 }, (_, i) => [i, localStorage.getItem(localStorage.key(i)!)]),
      )) + JSON.stringify(settings.data);
      expect(stored).not.toContain('secret-unique-42');
    });

    it('création de compte : envoie le nom', async () => {
      server = stubServer({ 'POST /auth/register': AUTH, 'GET /progress': () => json({}, 404), 'PUT /progress': () => json({ updated_at: 'D' }) });
      const { settings } = await freshStores();
      await settings.setServerUrl('https://s.test');
      await settings.authenticate('register', { name: 'Aïcha', email: 'a@b.c', password: 'motdepasse' });
      expect(server.calls[0].body).toEqual({ name: 'Aïcha', email: 'a@b.c', password: 'motdepasse' });
    });

    it('fusionne la progression du serveur avec celle de l\'appareil', async () => {
      const key = today();
      server = stubServer({
        'POST /auth/login': AUTH,
        'GET /progress': () =>
          json({ data: { version: 1, days: { [key]: { prayers: { dhuhr: true } }, '2026-01-01': { prayers: { fajr: true } } } }, updated_at: 'D0' }),
        'PUT /progress': () => json({ updated_at: 'D1' }),
      });
      const { settings, progress } = await freshStores();
      await progress.togglePrayer('fajr'); // local : fajr aujourd'hui
      await settings.setServerUrl('https://s.test');
      await settings.authenticate('login', { email: 'a@b.c', password: 'motdepasse' });

      // Local : fajr + dhuhr aujourd'hui, et le vieux jour du serveur
      expect(progress.dayStats(key).prayers).toBe(2);
      expect(progress.dayStats('2026-01-01').prayers).toBe(1);
      // Le serveur reçoit le résultat fusionné
      const put = server.calls.find((c) => c.method === 'PUT')!;
      expect(put.body.data.days[key].prayers).toEqual({ fajr: true, dhuhr: true });
      expect(repo.saved().days[key].prayers).toEqual({ fajr: true, dhuhr: true });
    });

    it('session expirée (401) : déconnecte et prévient', async () => {
      server = stubServer({
        'POST /auth/login': AUTH,
        'GET /progress': () => json({ message: 'Unauthenticated.' }, 401),
      });
      const { settings } = await freshStores();
      await settings.setServerUrl('https://s.test');
      await settings.authenticate('login', { email: 'a@b.c', password: 'motdepasse' });
      expect(settings.isLinked).toBe(false);
      expect(settings.syncError).toBe('Session expirée : reconnecte-toi.');
    });

    it('serveur injoignable : garde le compte lié et affiche l\'erreur', async () => {
      server = stubServer({ 'POST /auth/login': AUTH }); // GET /progress -> « Failed to fetch »
      const { settings, progress } = await freshStores();
      await progress.togglePrayer('fajr');
      await settings.setServerUrl('https://s.test');
      await settings.authenticate('login', { email: 'a@b.c', password: 'motdepasse' });
      expect(settings.isLinked).toBe(true);
      expect(settings.syncError).toBe('Serveur injoignable.');
      expect(settings.lastSync).toBeNull();
      expect(progress.dayStats(today()).prayers).toBe(1); // rien n'est perdu
    });

    it('ne synchronise pas sans compte lié', async () => {
      server = stubServer({});
      const { settings } = await freshStores();
      expect(await settings.syncNow()).toBe(false);
      expect(server.calls).toHaveLength(0);
    });

    it('déconnexion : jeton supprimé, progression conservée, même si le serveur est injoignable', async () => {
      server = stubServer({ 'POST /auth/login': AUTH, 'GET /progress': () => json({}, 404), 'PUT /progress': () => json({ updated_at: 'D' }) });
      const { settings, progress } = await freshStores();
      await progress.togglePrayer('fajr');
      await settings.setServerUrl('https://s.test');
      await settings.authenticate('login', { email: 'a@b.c', password: 'motdepasse' });

      await settings.logout(); // POST /auth/logout n'est pas défini : « Failed to fetch »
      expect(settings.isLinked).toBe(false);
      expect(settings.user).toBeNull();
      expect(settings.serverUrl).toBe('https://s.test');
      expect(progress.dayStats(today()).prayers).toBe(1);
    });
  });
});
