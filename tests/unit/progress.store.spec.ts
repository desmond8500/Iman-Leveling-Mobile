import { createPinia, setActivePinia } from 'pinia';
import type { ProgressRepository } from '@/services/progressRepository';
import { setProgressRepository, useProgressStore } from '@/stores/progress';
import type { ProgressData } from '@/types';
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

  it('cocher une prière donne 20 Hasanat et sauvegarde', async () => {
    const store = useProgressStore();
    await store.load();
    const result = await store.togglePrayer('fajr');
    expect(result.hasanatDelta).toBe(20);
    expect(store.doneCount).toBe(1);
    expect(repo.saved().days[toDateKey(new Date())].prayers.fajr).toBe(true);
  });

  it('décocher retire les Hasanat (pas de farm)', async () => {
    const store = useProgressStore();
    await store.load();
    await store.togglePrayer('fajr');
    const result = await store.togglePrayer('fajr');
    expect(result.hasanatDelta).toBe(-20);
    expect(store.totalHasanat).toBe(0);
  });

  it('les 5 prières donnent 150 Hasanat, un niveau et une série de 1 jour', async () => {
    const store = useProgressStore();
    await store.load();
    for (const id of ['fajr', 'dhuhr', 'asr', 'maghrib'] as const) {
      await store.togglePrayer(id);
    }
    const last = await store.togglePrayer('isha');
    expect(last.hasanatDelta).toBe(70); // 20 + 50 de bonus
    expect(last.leveledUp).toBe(true);
    expect(store.totalHasanat).toBe(150);
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
    expect(store.totalHasanat).toBe(40);
  });

  describe('prières surérogatoires', () => {
    it('une sunna confirmée donne 10 Hasanat, une autre 5', async () => {
      const store = useProgressStore();
      await store.load();
      expect((await store.toggleSunnah('fajr-before')).hasanatDelta).toBe(10);
      expect((await store.toggleSunnah('asr-before')).hasanatDelta).toBe(5);
      expect(store.totalHasanat).toBe(15);
    });

    it('décocher une sunna retire ses Hasanat', async () => {
      const store = useProgressStore();
      await store.load();
      await store.toggleSunnah('witr');
      const result = await store.toggleSunnah('witr');
      expect(result.hasanatDelta).toBe(-10);
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
      expect(reloaded.totalHasanat).toBe(10);
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
      expect(store.selectedStats.hasanat).toBe(150);
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
