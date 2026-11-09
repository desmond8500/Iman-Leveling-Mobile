import { createPinia, setActivePinia } from 'pinia';
import type { ProgressRepository } from '@/services/progressRepository';
import { setProgressRepository, useProgressStore } from '@/stores/progress';
import type { ProgressData } from '@/types';
import { toDateKey } from '@/utils/date';

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
    expect(store.doneToday).toBe(0);
    expect(store.totalXp).toBe(0);
    expect(store.levelInfo.level).toBe(1);
  });

  it('cocher une prière donne 20 XP et sauvegarde', async () => {
    const store = useProgressStore();
    await store.load();
    const result = await store.togglePrayer('fajr');
    expect(result.xpDelta).toBe(20);
    expect(store.doneToday).toBe(1);
    expect(repo.saved().days[toDateKey(new Date())].prayers.fajr).toBe(true);
  });

  it('décocher retire l\'XP (pas de farm)', async () => {
    const store = useProgressStore();
    await store.load();
    await store.togglePrayer('fajr');
    const result = await store.togglePrayer('fajr');
    expect(result.xpDelta).toBe(-20);
    expect(store.totalXp).toBe(0);
  });

  it('les 5 prières donnent 150 XP, un niveau et une série de 1 jour', async () => {
    const store = useProgressStore();
    await store.load();
    for (const id of ['fajr', 'dhuhr', 'asr', 'maghrib'] as const) {
      await store.togglePrayer(id);
    }
    const last = await store.togglePrayer('isha');
    expect(last.xpDelta).toBe(70); // 20 + 50 de bonus
    expect(last.leveledUp).toBe(true);
    expect(store.totalXp).toBe(150);
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
    expect(store.doneToday).toBe(2);
    expect(store.totalXp).toBe(40);
  });
});
