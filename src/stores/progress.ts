import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { PRAYERS } from '@/data/prayers';
import {
  emptyProgress,
  LocalProgressRepository,
  type ProgressRepository,
} from '@/services/progressRepository';
import type { DayRecord, PrayerId } from '@/types';
import { toDateKey } from '@/utils/date';
import { computeStreak } from '@/utils/streak';
import { levelFromXp, xpForDay } from '@/utils/xp';

let repository: ProgressRepository = new LocalProgressRepository();

/** Permet de brancher un autre stockage (API Laravel plus tard, faux stockage dans les tests). */
export function setProgressRepository(repo: ProgressRepository) {
  repository = repo;
}

const countDone = (day?: DayRecord) =>
  PRAYERS.filter((p) => day?.prayers[p.id]).length;

export const useProgressStore = defineStore('progress', () => {
  const days = ref<Record<string, DayRecord>>({});
  const loaded = ref(false);
  const today = ref(toDateKey(new Date()));

  const todayPrayers = computed(() =>
    PRAYERS.map((prayer) => ({
      ...prayer,
      done: !!days.value[today.value]?.prayers[prayer.id],
    })),
  );

  const doneToday = computed(() => countDone(days.value[today.value]));

  // L'XP est recalculée à partir des journées : impossible de la « farmer » en cochant/décochant.
  const totalXp = computed(() =>
    Object.values(days.value).reduce(
      (sum, day) => sum + xpForDay(countDone(day), PRAYERS.length),
      0,
    ),
  );

  const levelInfo = computed(() => levelFromXp(totalXp.value));

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

  async function togglePrayer(id: PrayerId) {
    const key = today.value;
    const levelBefore = levelInfo.value.level;
    const xpBefore = totalXp.value;
    const current = days.value[key]?.prayers ?? {};

    days.value = {
      ...days.value,
      [key]: { prayers: { ...current, [id]: !current[id] } },
    };

    await repository.save({ ...emptyProgress(), days: days.value });

    return {
      xpDelta: totalXp.value - xpBefore,
      leveledUp: levelInfo.value.level > levelBefore,
    };
  }

  return {
    days,
    loaded,
    today,
    todayPrayers,
    doneToday,
    totalXp,
    levelInfo,
    streak,
    load,
    refreshToday,
    togglePrayer,
  };
});
