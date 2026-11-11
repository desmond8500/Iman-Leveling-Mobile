<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Iman Leveling</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <PlayerHeader
          :level="store.levelInfo.level"
          :hasanat-into-level="store.levelInfo.hasanatIntoLevel"
          :hasanat-for-next="store.levelInfo.hasanatForNext"
          :total-hasanat="store.totalHasanat"
          :streak="store.streak"
        />

        <WeekStrip
          :today="store.today"
          :selected="store.selectedDate"
          :level-of="levelOf"
          @select="store.selectDate"
          @open-calendar="calendarOpen = true"
        />

        <p v-if="next" class="next-prayer">
          <ion-icon :icon="timeOutline" />
          Prochaine prière : <strong>{{ next.name }}</strong> à {{ next.at }}
          <span class="in">dans {{ next.in }}</span>
        </p>
        <p v-else-if="!settings.location" class="next-prayer muted">
          <ion-icon :icon="locationOutline" />
          Active ta position dans les Paramètres pour afficher les heures de prière.
        </p>

        <div class="section-title">
          <h2>{{ store.isToday ? 'Prières du jour' : capitalize(formatLong(store.selectedDate)) }}</h2>
          <span class="count">{{ store.doneCount }} / {{ store.dayPrayers.length }}</span>
        </div>

        <p class="summary">
          {{ store.selectedStats.hasanat }} Hasanat · {{ store.selectedStats.sunnah }} sunnas ·
          {{ store.selectedStats.adhkar }} invocations
        </p>

        <p v-if="!store.isToday" class="readonly-note">
          <ion-icon :icon="lockClosedOutline" />
          Consultation seule : seul le jour en cours peut être modifié.
          <button type="button" class="link" @click="store.selectDate(store.today)">
            Revenir à aujourd'hui
          </button>
        </p>

        <div class="list">
          <PrayerGroup
            v-for="prayer in store.dayPrayers"
            :key="prayer.id"
            :prayer="prayer"
            :readonly="!store.isToday"
            :show-place="store.gender === 'male'"
            :time="timeOf(prayer.id)"
            @toggle-prayer="onTogglePrayer"
            @toggle-place="onTogglePlace"
            @toggle-sunnah="onToggleSunnah"
          />
        </div>

        <p class="tip">
          {{ rulesText }}
        </p>
      </div>

      <ion-toast
        :is-open="toast.open"
        :message="toast.message"
        :duration="1800"
        position="top"
        @didDismiss="toast.open = false"
      />
    </ion-content>

    <ion-modal :is-open="calendarOpen" @didDismiss="calendarOpen = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Calendrier</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="calendarOpen = false">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="iman-content">
        <div class="wrap">
          <MonthCalendar
            :today="store.today"
            :selected="store.selectedDate"
            :level-of="levelOf"
            @select="onPickDate"
          />
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/vue';
import { lockClosedOutline, locationOutline, timeOutline } from 'ionicons/icons';
import MonthCalendar from '@/components/MonthCalendar.vue';
import PlayerHeader from '@/components/PlayerHeader.vue';
import PrayerGroup from '@/components/PrayerGroup.vue';
import WeekStrip from '@/components/WeekStrip.vue';
import { useProgressStore } from '@/stores/progress';
import { useSettingsStore } from '@/stores/settings';
import type { PrayerId, SunnahId } from '@/types';
import { formatLong, parseKey } from '@/utils/calendar';
import { computePrayerTimes, formatTime, nextPrayer, type PrayerKey } from '@/utils/prayerTimes';
import {
  ALL_PRAYERS_BONUS,
  PRAYER_HOME_HASANAT,
  PRAYER_MOSQUE_HASANAT,
  SUNNAH_HASANAT,
} from '@/utils/hasanat';

const store = useProgressStore();
const settings = useSettingsStore();
const toast = reactive({ open: false, message: '' });
const calendarOpen = ref(false);

const levelOf = (key: string) => store.dayStats(key).level;

const rulesText = computed(() =>
  store.gender === 'male'
    ? `Chaque prière obligatoire rapporte ${PRAYER_MOSQUE_HASANAT} Hasanat à la mosquée et ${PRAYER_HOME_HASANAT} à la maison. Chaque sunna rapporte ${SUNNAH_HASANAT} Hasanat. Les 5 prières accomplies donnent un bonus de ${ALL_PRAYERS_BONUS}.`
    : `Chaque prière obligatoire et chaque sunna rapportent ${SUNNAH_HASANAT} Hasanat. Les 5 prières accomplies donnent un bonus de ${ALL_PRAYERS_BONUS}. Renseigne ton genre dans les Paramètres.`,
);
// --- Heures de prière ---
const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  now.value = new Date();
  timer = setInterval(() => (now.value = new Date()), 30000);
});
onBeforeUnmount(() => clearInterval(timer));

const calcOptions = computed(() => ({ method: settings.prayerMethod }));

/** Heures du jour affiché (les jours passés aussi, pour retrouver les horaires). */
const dayTimes = computed(() =>
  settings.location ? computePrayerTimes(parseKey(store.selectedDate), settings.location, calcOptions.value) : null,
);
const timeOf = (id: PrayerKey): string | null => {
  const date = dayTimes.value?.[id];
  return date ? formatTime(date) : null;
};

const next = computed(() => {
  if (!settings.location) return null;
  const n = nextPrayer(now.value, settings.location, calcOptions.value);
  if (!n) return null;
  const minutes = Math.max(1, Math.round((n.time.getTime() - now.value.getTime()) / 60000));
  const h = Math.floor(minutes / 60);
  const name = store.dayPrayers.find((p) => p.id === n.id)?.name ?? n.id;
  return { name, at: formatTime(n.time), in: h > 0 ? `${h} h ${String(minutes % 60).padStart(2, '0')}` : `${minutes} min` };
});

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function onPickDate(key: string) {
  store.selectDate(key);
  calendarOpen.value = false;
}

function notify({ hasanatDelta, leveledUp }: { hasanatDelta: number; leveledUp: boolean }) {
  if (leveledUp) {
    toast.message = `Niveau ${store.levelInfo.level} atteint !`;
  } else if (hasanatDelta > 0) {
    toast.message = `+${hasanatDelta} Hasanat`;
  } else {
    toast.message = `${hasanatDelta} Hasanat`;
  }
  toast.open = true;
}

async function onTogglePrayer(id: PrayerId) {
  notify(await store.togglePrayer(id));
}

async function onTogglePlace(id: PrayerId) {
  notify(await store.togglePlace(id));
}

async function onToggleSunnah(id: SunnahId) {
  notify(await store.toggleSunnah(id));
}
</script>

<style scoped>
.wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px;
}
.next-prayer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 16px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--iman-card);
  font-size: 13px;
}
.next-prayer .in {
  margin-left: auto;
  color: var(--iman-gold);
  font-weight: 700;
}
.next-prayer.muted {
  color: var(--iman-text-soft);
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 24px 4px 4px;
}
.section-title h2 {
  margin: 0;
  font-size: 18px;
}
.count {
  color: var(--iman-gold);
  font-weight: 700;
}
.summary {
  margin: 0 4px 12px;
  font-size: 13px;
  color: var(--iman-text-soft);
}
.readonly-note {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(242, 201, 76, 0.1);
  font-size: 13px;
  color: var(--iman-gold);
}
.link {
  display: block;
  margin-top: 4px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--iman-emerald);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tip {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--iman-text-soft);
}
</style>
