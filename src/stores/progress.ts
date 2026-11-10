import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { ALL_SUNNAH, PRAYERS } from '@/data/prayers';
import {
  emptyProgress,
  LocalProgressRepository,
  type ProgressRepository,
} from '@/services/progressRepository';
import type { DayRecord, PrayerId, PrayerView, SunnahId } from '@/types';
import { toDateKey } from '@/utils/date';
import { levelFromHasanat, hasanatForDay, sunnahReward } from '@/utils/hasanat';
import { computeStreak } from '@/utils/streak';

let repository: ProgressRepository = new LocalProgressRepository();

/** Permet de brancher un autre stockage (API Laravel plus tard, faux stockage dans les tests). */
export function setProgressRepository(repo: ProgressRepository) {
  repository = repo;
}

const countDone = (day?: DayRecord) => PRAYERS.filter((p) => day?.prayers[p.id]).length;

const sunnahTotal = (day?: DayRecord) =>
  ALL_SUNNAH.reduce((sum, s) => (day?.sunnah?.[s.id] ? sum + sunnahReward(s.emphasized) : sum), 0);

export const useProgressStore = defineStore('progress', () => {
  const days = ref<Record<string, DayRecord>>({});
  const loaded = ref(false);
  const today = ref(toDateKey(new Date()));

  const todayPrayers = computed<PrayerView[]>(() => {
    const day = days.value[today.value];
    return PRAYERS.map((prayer) => ({
      ...prayer,
      done: !!day?.prayers[prayer.id],
      before: prayer.before.map((s) => ({ ...s, done: !!day?.sunnah?.[s.id] })),
      after: prayer.after.map((s) => ({ ...s, done: !!day?.sunnah?.[s.id] })),
    }));
  });

  const doneToday = computed(() => countDone(days.value[today.value]));

  // Les Hasanat sont recalculés à partir des journées : impossible de les « farmer » en cochant/décochant.
  const totalHasanat = computed(() =>
    Object.values(days.value).reduce(
      (sum, day) => sum + hasanatForDay(countDone(day), PRAYERS.length, sunnahTotal(day)),
      0,
    ),
  );

  const levelInfo = computed(() => levelFromHasanat(totalHasanat.value));

  // La série ne dépend que des 5 prières obligatoires.
  const streak = computed(() =>
    computeStreak(today.value, (key) => countDone(days.value[key]) === PRAYERS.length),
  );

  async function load() {
    const data = await repository.load();
    days.value = data.days ?? {};
    today.value = toDateKey(new Date());
    loaded.value = true;
  }

  /** À appeler quand l'app revient au premier plan (minuit passé). */
  function refreshToday() {
    today.value = toDateKey(new Date());
  }

  async function commit(update: (day: DayRecord) => DayRecord) {
    const key = today.value;
    const levelBefore = levelInfo.value.level;
    const hasanatBefore = totalHasanat.value;
    const current = days.value[key] ?? { prayers: {} };

    days.value = { ...days.value, [key]: update(current) };

    await repository.save({ ...emptyProgress(), days: days.value });

    return {
      hasanatDelta: totalHasanat.value - hasanatBefore,
      leveledUp: levelInfo.value.level > levelBefore,
    };
  }

  function togglePrayer(id: PrayerId) {
    return commit((day) => ({ ...day, prayers: { ...day.prayers, [id]: !day.prayers[id] } }));
  }

  function toggleSunnah(id: SunnahId) {
    return commit((day) => ({ ...day, sunnah: { ...day.sunnah, [id]: !day.sunnah?.[id] } }));
  }

  return {
    days,
    loaded,
    today,
    todayPrayers,
    doneToday,
    totalHasanat,
    levelInfo,
    streak,
    load,
    refreshToday,
    togglePrayer,
    toggleSunnah,
  };
});
