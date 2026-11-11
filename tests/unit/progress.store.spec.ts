import { createPinia, setActivePinia } from 'pinia';
import type { ProgressRepository } from '@/services/progressRepository';
import { setProgressRepository, useProgressStore } from '@/stores/progress';
import type { ProgressData } from '@/types';
import { adhkarKey } from '@/data/adhkar';
import { addDays, toDateKey } from '@/utils/date';

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

describe('progress store', () => {
  let repo: ReturnType<typeof memoryRepository>;

  beforeEach(() => {
    repo = memoryRepository();
    setProgressRepository(repo);
    setActivePinia(createPinia());
  });

  it('démarre vide', async () => {
    const store = useProgressStore();
    await store.load();
    expect(store.doneCount).toBe(0);
    expect(store.totalHasanat).toBe(0);
    expect(store.levelInfo.level).toBe(1);
  });

  it('cocher une prière donne 27 Hasanat (genre non renseigné) et sauvegarde', async () => {
    const store = useProgressStore();
    await store.load();
    const result = await store.togglePrayer('fajr');
    expect(result.hasanatDelta).toBe(27);
    expect(store.doneCount).toBe(1);
    expect(repo.saved().days[toDateKey(new Date())].prayers.fajr).toBe(true);
  });

  it('décocher retire les Hasanat (pas de farm)', async () => {
    const store = useProgressStore();
    await store.load();
    await store.togglePrayer('fajr');
    const result = await store.togglePrayer('fajr');
    expect(result.hasanatDelta).toBe(-27);
    expect(store.totalHasanat).toBe(0);
  });

  it('les 5 prières donnent 185 Hasanat (135 + 50 de bonus), le niveau 2 et une série de 1 jour', async () => {
    const store = useProgressStore();
    await store.load();
    for (const id of ['fajr', 'dhuhr', 'asr', 'maghrib'] as const) {
      await store.togglePrayer(id);
    }
    const last = await store.togglePrayer('isha');
    expect(last.hasanatDelta).toBe(77); // 27 + 50 de bonus
    expect(store.totalHasanat).toBe(185);
    expect(store.levelInfo.level).toBe(2);
    expect(store.streak).toBe(1);
  });

  it('recharge les données sauvegardées', async () => {
    const key = toDateKey(new Date());
    setProgressRepository(
      memoryRepository({ version: 1, days: { [key]: { prayers: { fajr: true, dhuhr: true } } } }),
    );
    const store = useProgressStore();
    await store.load();
    expect(store.doneCount).toBe(2);
    expect(store.totalHasanat).toBe(54);
  });

  describe('prières surérogatoires', () => {
    it('chaque sunna donne 27 Hasanat', async () => {
      const store = useProgressStore();
      await store.load();
      expect((await store.toggleSunnah('fajr-before')).hasanatDelta).toBe(27);
      expect((await store.toggleSunnah('asr-before')).hasanatDelta).toBe(27);
      expect(store.totalHasanat).toBe(54);
    });

    it('décocher une sunna retire ses Hasanat', async () => {
      const store = useProgressStore();
      await store.load();
      await store.toggleSunnah('witr');
      const result = await store.toggleSunnah('witr');
      expect(result.hasanatDelta).toBe(-27);
      expect(store.totalHasanat).toBe(0);
    });

    it('n\'influence pas la série ni le compteur des 5 prières', async () => {
      const store = useProgressStore();
      await store.load();
      await store.toggleSunnah('dhuhr-after');
      expect(store.doneCount).toBe(0);
      expect(store.streak).toBe(0);
    });

    it('expose les sunnas avec leur état dans la prière correspondante', async () => {
      const store = useProgressStore();
      await store.load();
      await store.toggleSunnah('dhuhr-before');
      const dhuhr = store.dayPrayers.find((p) => p.id === 'dhuhr')!;
      expect(dhuhr.before[0].done).toBe(true);
      expect(dhuhr.after[0].done).toBe(false);
    });

    it('conserve les sunnas cochées au rechargement', async () => {
      const store = useProgressStore();
      await store.load();
      await store.toggleSunnah('isha-after');

      setActivePinia(createPinia());
      const reloaded = useProgressStore();
      await reloaded.load();
      expect(reloaded.totalHasanat).toBe(27);
    });
  });

  describe('invocations', () => {
    it('chaque invocation faite donne 5 Hasanat', async () => {
      const store = useProgressStore();
      await store.load();
      const result = await store.toggleDhikr('morning', 'kursi');
      expect(result.hasanatDelta).toBe(5);
      expect(store.isDhikrDone('morning', 'kursi')).toBe(true);
      expect(store.isDhikrDone('evening', 'kursi')).toBe(false);
      expect(store.adhkarDoneCount('morning')).toBe(1);
    });

    it('décocher retire les Hasanat', async () => {
      const store = useProgressStore();
      await store.load();
      await store.toggleDhikr('evening', 'kalimat');
      const result = await store.toggleDhikr('evening', 'kalimat');
      expect(result.hasanatDelta).toBe(-5);
      expect(store.totalHasanat).toBe(0);
    });

    it('ignore les clés d\'invocation inconnues', async () => {
      const key = toDateKey(new Date());
      setProgressRepository(
        memoryRepository({
          version: 1,
          days: { [key]: { prayers: {}, adhkar: { 'morning:inconnue': true } } },
        }),
      );
      const store = useProgressStore();
      await store.load();
      expect(store.totalHasanat).toBe(0);
    });

    it('n\'influence pas la série', async () => {
      const store = useProgressStore();
      await store.load();
      await store.toggleDhikr('morning', 'kursi');
      expect(store.streak).toBe(0);
    });
  });

  describe('genre et lieu de la prière', () => {
    it('femme ou genre non renseigné : 27 Hasanat par prière, sans choix du lieu', async () => {
      const store = useProgressStore();
      await store.load();
      store.setGender('female');
      expect((await store.togglePrayer('fajr')).hasanatDelta).toBe(27);
      expect((await store.togglePlace('fajr')).hasanatDelta).toBe(0);
      expect(store.dayPrayers[0].mosque).toBe(false);
      expect(store.dayPrayers[0].reward).toBe(27);
    });

    it('homme : 1 Hasanat à la maison (par défaut), 27 à la mosquée', async () => {
      const store = useProgressStore();
      await store.load();
      store.setGender('male');
      expect((await store.togglePrayer('dhuhr')).hasanatDelta).toBe(1);
      expect(store.dayPrayers[1].reward).toBe(1);

      expect((await store.togglePlace('dhuhr')).hasanatDelta).toBe(26);
      expect(store.dayPrayers[1].mosque).toBe(true);
      expect(store.dayPrayers[1].reward).toBe(27);
      expect(store.totalHasanat).toBe(27);

      expect((await store.togglePlace('dhuhr')).hasanatDelta).toBe(-26);
      expect(store.totalHasanat).toBe(1);
    });

    it('le lieu n\'ajoute rien tant que la prière n\'est pas faite', async () => {
      const store = useProgressStore();
      await store.load();
      store.setGender('male');
      await store.togglePlace('asr');
      expect(store.totalHasanat).toBe(0);
      await store.togglePrayer('asr');
      expect(store.totalHasanat).toBe(27);
    });

    it('homme : 5 prières à la maison = 5 + 50 de bonus, toutes à la mosquée = 135 + 50', async () => {
      const store = useProgressStore();
      await store.load();
      store.setGender('male');
      const ids = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
      for (const id of ids) await store.togglePrayer(id);
      expect(store.totalHasanat).toBe(55);
      for (const id of ids) await store.togglePlace(id);
      expect(store.totalHasanat).toBe(185);
    });

    it('les sunnas valent 27 pour les hommes comme pour les femmes', async () => {
      const store = useProgressStore();
      await store.load();
      for (const g of ['male', 'female'] as const) {
        store.setGender(g);
        const before = store.totalHasanat;
        const d = (await store.toggleSunnah(g === 'male' ? 'witr' : 'isha-after')).hasanatDelta;
        expect(d).toBe(27);
        expect(store.totalHasanat).toBe(before + 27);
      }
    });

    it('recalcule tout l\'historique quand le genre change', async () => {
      const key = toDateKey(new Date());
      setProgressRepository(
        memoryRepository({ version: 1, days: { [key]: { prayers: { fajr: true, dhuhr: true } } } }),
      );
      const store = useProgressStore();
      await store.load();
      store.setGender('female');
      expect(store.totalHasanat).toBe(54);
      store.setGender('male');
      expect(store.totalHasanat).toBe(2);
    });

    it('conserve le lieu au rechargement', async () => {
      const store = useProgressStore();
      await store.load();
      store.setGender('male');
      await store.togglePrayer('isha');
      await store.togglePlace('isha');

      setActivePinia(createPinia());
      const reloaded = useProgressStore();
      await reloaded.load();
      reloaded.setGender('male');
      expect(reloaded.dayPrayers[4].mosque).toBe(true);
      expect(reloaded.totalHasanat).toBe(27);
    });
  });

  describe('calendrier et jours passés', () => {
    const yesterday = () => addDays(toDateKey(new Date()), -1);

    function withYesterday() {
      const y = yesterday();
      setProgressRepository(
        memoryRepository({
          version: 1,
          days: { [y]: { prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } } },
        }),
      );
      return y;
    }

    it('affiche par défaut le jour en cours', async () => {
      const store = useProgressStore();
      await store.load();
      expect(store.selectedDate).toBe(store.today);
      expect(store.isToday).toBe(true);
    });

    it('permet de consulter la veille avec ses prières', async () => {
      const y = withYesterday();
      const store = useProgressStore();
      await store.load();
      store.selectDate(y);
      expect(store.isToday).toBe(false);
      expect(store.doneCount).toBe(5);
      expect(store.dayPrayers.every((p) => p.done)).toBe(true);
      expect(store.selectedStats.hasanat).toBe(185);
    });

    it('refuse de modifier un jour passé', async () => {
      const y = withYesterday();
      const store = useProgressStore();
      await store.load();
      store.selectDate(y);
      const before = store.totalHasanat;
      expect((await store.togglePrayer('fajr')).hasanatDelta).toBe(0);
      expect((await store.toggleSunnah('witr')).hasanatDelta).toBe(0);
      expect(store.totalHasanat).toBe(before);
      expect(store.dayStats(y).prayers).toBe(5);
    });

    it('ignore la sélection d\'un jour futur', async () => {
      const store = useProgressStore();
      await store.load();
      store.selectDate(addDays(store.today, 1));
      expect(store.selectedDate).toBe(store.today);
    });

    it('calcule le niveau d\'accomplissement de chaque jour', async () => {
      const y = withYesterday();
      const store = useProgressStore();
      await store.load();
      expect(store.dayStats(y).level).toBe('full');
      expect(store.dayStats(store.today).level).toBe('none');
      await store.toggleSunnah('witr');
      expect(store.dayStats(store.today).level).toBe('partial');
    });

    it('la veille complète alimente la série du jour', async () => {
      withYesterday();
      const store = useProgressStore();
      await store.load();
      expect(store.streak).toBe(1);
    });
  });
});

describe('compteurs de récitations', () => {
  async function freshStore() {
    setProgressRepository(memoryRepository());
    setActivePinia(createPinia());
    const store = useProgressStore();
    await store.load();
    return store;
  }

  it('ajoute, retire et ne descend pas sous 0', async () => {
    const store = await freshStore();
    await store.bumpCount('citadelle:x', 1);
    await store.bumpCount('citadelle:x', 1);
    expect(store.countOf('citadelle:x')).toBe(2);
    await store.bumpCount('citadelle:x', -1);
    await store.bumpCount('citadelle:x', -1);
    await store.bumpCount('citadelle:x', -1);
    expect(store.countOf('citadelle:x')).toBe(0);
  });
  it('atteindre le nombre recommandé coche l\'invocation une seule fois', async () => {
    const store = await freshStore();
    const key = adhkarKey('morning', 'kursi');
    await store.bumpCount(key, 1, 2, key);
    expect(store.isDhikrDone('morning', 'kursi')).toBe(false);
    await store.bumpCount(key, 1, 2, key);
    expect(store.isDhikrDone('morning', 'kursi')).toBe(true);
    await store.bumpCount(key, -1, 2, key); // décrémenter ne décoche pas
    expect(store.isDhikrDone('morning', 'kursi')).toBe(true);
  });
});
