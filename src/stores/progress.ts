import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { ADHKAR_KEYS, adhkarKey } from '@/data/adhkar';
import { ALL_SUNNAH, PRAYERS } from '@/data/prayers';
import {
  emptyProgress,
  LocalProgressRepository,
  type ProgressRepository,
} from '@/services/progressRepository';
import type {
  DayLevel,
  DayRecord,
  DayStats,
  Gender,
  Period,
  PrayerId,
  PrayerView,
  ProgressData,
  SunnahId,
} from '@/types';
import { toDateKey } from '@/utils/date';
import { hasanatForDay, levelFromHasanat, prayerReward } from '@/utils/hasanat';
import { computeStreak } from '@/utils/streak';

let repository: ProgressRepository = new LocalProgressRepository();

/** Permet de brancher un autre stockage (API Laravel plus tard, faux stockage dans les tests). */
export function setProgressRepository(repo: ProgressRepository) {
  repository = repo;
}

const countPrayers = (day?: DayRecord) => PRAYERS.filter((p) => day?.prayers[p.id]).length;

const countSunnah = (day?: DayRecord) => ALL_SUNNAH.filter((s) => day?.sunnah?.[s.id]).length;

// On ne compte que les invocations connues : une clé obsolète n'apporte pas de Hasanat.
const countAdhkar = (day?: DayRecord) => ADHKAR_KEYS.filter((k) => day?.adhkar?.[k]).length;

/** Hasanat des prières obligatoires faites : dépend du genre et, pour les hommes, du lieu. */
const prayerHasanatOf = (day: DayRecord | undefined, gender: Gender | null) =>
  PRAYERS.reduce(
    (sum, p) => (day?.prayers[p.id] ? sum + prayerReward(gender, !!day.mosque?.[p.id]) : sum),
    0,
  );

function statsOf(day: DayRecord | undefined, gender: Gender | null): DayStats {
  const prayers = countPrayers(day);
  const sunnah = countSunnah(day);
  const adhkar = countAdhkar(day);
  const level: DayLevel =
    prayers === PRAYERS.length ? 'full' : prayers + sunnah + adhkar > 0 ? 'partial' : 'none';
  return {
    prayers,
    sunnah,
    adhkar,
    hasanat: hasanatForDay({
      prayerHasanat: prayerHasanatOf(day, gender),
      done: prayers,
      total: PRAYERS.length,
      sunnah,
      adhkar,
    }),
    level,
  };
}

const NOOP_RESULT = { hasanatDelta: 0, leveledUp: false };

export const useProgressStore = defineStore('progress', () => {
  const days = ref<Record<string, DayRecord>>({});
  const loaded = ref(false);
  const today = ref(toDateKey(new Date()));
  /** Jour affiché sur l'accueil. Les jours passés sont en lecture seule. */
  const selectedDate = ref(today.value);
  /** Genre de l'utilisateur (renseigné depuis les paramètres) : il détermine la valeur des prières. */
  const gender = ref<Gender | null>(null);

  const isToday = computed(() => selectedDate.value === today.value);

  const dayPrayers = computed<PrayerView[]>(() => {
    const day = days.value[selectedDate.value];
    return PRAYERS.map((prayer) => ({
      ...prayer,
      done: !!day?.prayers[prayer.id],
      mosque: !!day?.mosque?.[prayer.id],
      reward: prayerReward(gender.value, !!day?.mosque?.[prayer.id]),
      before: prayer.before.map((s) => ({ ...s, done: !!day?.sunnah?.[s.id] })),
      after: prayer.after.map((s) => ({ ...s, done: !!day?.sunnah?.[s.id] })),
    }));
  });

  const selectedStats = computed(() => statsOf(days.value[selectedDate.value], gender.value));

  /** Prières obligatoires faites le jour affiché. */
  const doneCount = computed(() => selectedStats.value.prayers);

  // Les Hasanat sont recalculés à partir des journées : impossible de les « farmer » en cochant/décochant.
  const totalHasanat = computed(() =>
    Object.values(days.value).reduce((sum, day) => sum + statsOf(day, gender.value).hasanat, 0),
  );

  const levelInfo = computed(() => levelFromHasanat(totalHasanat.value));

  // La série ne dépend que des 5 prières obligatoires.
  const streak = computed(() =>
    computeStreak(today.value, (key) => countPrayers(days.value[key]) === PRAYERS.length),
  );

  function dayStats(key: string): DayStats {
    return statsOf(days.value[key], gender.value);
  }

  function isDhikrDone(period: Period, id: string): boolean {
    return !!days.value[today.value]?.adhkar?.[adhkarKey(period, id)];
  }

  /** Invocations faites aujourd'hui pour une période. */
  function adhkarDoneCount(period: Period): number {
    const prefix = `${period}:`;
    return ADHKAR_KEYS.filter((k) => k.startsWith(prefix) && days.value[today.value]?.adhkar?.[k])
      .length;
  }

  function setGender(value: Gender | null) {
    gender.value = value;
  }

  async function load() {
    const data = await repository.load();
    days.value = data.days ?? {};
    today.value = toDateKey(new Date());
    selectedDate.value = today.value;
    loaded.value = true;
  }

  /** Progression complète, pour la synchronisation avec un serveur. */
  function exportData(): ProgressData {
    return { ...emptyProgress(), days: days.value };
  }

  /** Remplace la progression (après une fusion avec le serveur) et l'enregistre. */
  async function importData(data: ProgressData) {
    days.value = data.days ?? {};
    await repository.save(exportData());
  }

  /** À appeler quand l'app revient au premier plan (minuit passé). */
  function refreshToday() {
    const wasToday = selectedDate.value === today.value;
    today.value = toDateKey(new Date());
    if (wasToday) selectedDate.value = today.value;
  }

  /** Affiche un jour sur l'accueil. Les jours futurs sont ignorés. */
  function selectDate(key: string) {
    if (key <= today.value) selectedDate.value = key;
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

  // Seul le jour en cours est modifiable.
  async function togglePrayer(id: PrayerId) {
    if (!isToday.value) return NOOP_RESULT;
    return commit((day) => ({ ...day, prayers: { ...day.prayers, [id]: !day.prayers[id] } }));
  }

  /** Lieu d'une prière : mosquée ou maison. Ne compte que pour les hommes ; sans effet sinon. */
  async function togglePlace(id: PrayerId) {
    if (!isToday.value || gender.value !== 'male') return NOOP_RESULT;
    return commit((day) => ({ ...day, mosque: { ...day.mosque, [id]: !day.mosque?.[id] } }));
  }

  async function toggleSunnah(id: SunnahId) {
    if (!isToday.value) return NOOP_RESULT;
    return commit((day) => ({ ...day, sunnah: { ...day.sunnah, [id]: !day.sunnah?.[id] } }));
  }

  /** Les invocations se cochent toujours pour aujourd'hui, quel que soit le jour affiché sur l'accueil. */
  function toggleDhikr(period: Period, id: string) {
    const key = adhkarKey(period, id);
    return commit((day) => ({ ...day, adhkar: { ...day.adhkar, [key]: !day.adhkar?.[key] } }));
  }

  return {
    days,
    loaded,
    today,
    selectedDate,
    gender,
    isToday,
    dayPrayers,
    selectedStats,
    doneCount,
    totalHasanat,
    levelInfo,
    streak,
    dayStats,
    isDhikrDone,
    adhkarDoneCount,
    load,
    exportData,
    importData,
    refreshToday,
    selectDate,
    setGender,
    togglePrayer,
    togglePlace,
    toggleSunnah,
    toggleDhikr,
  };
});
