<template>
  <div class="group">
    <!-- Sunnas à faire avant la prière : au-dessus -->
    <SunnahRow
      v-for="s in simple ? [] : prayer.before"
      :key="s.id"
      :sunnah="s"
      :disabled="readonly"
      @toggle="$emit('toggle-sunnah', s.id)"
    />

    <PrayerCard
      :prayer="prayer"
      :time="time"
      :until="until"
      :disabled="readonly"
      @toggle="$emit('toggle-prayer', prayer.id)"
    />

    <!-- Lieu de la prière : mosquée ou maison (hommes uniquement) -->
    <PlaceToggle
      v-if="showPlace"
      :mosque="prayer.mosque"
      :disabled="readonly"
      @toggle="$emit('toggle-place', prayer.id)"
    />

    <!-- Sunnas à faire après la prière : en dessous -->
    <SunnahRow
      v-for="s in simple ? [] : prayer.after"
      :key="s.id"
      :sunnah="s"
      :disabled="readonly"
      @toggle="$emit('toggle-sunnah', s.id)"
    />
  </div>
</template>

<script setup lang="ts">
import PlaceToggle from './PlaceToggle.vue';
import PrayerCard from './PrayerCard.vue';
import SunnahRow from './SunnahRow.vue';
import type { PrayerId, PrayerView, SunnahId } from '@/types';

defineProps<{
  prayer: PrayerView;
  readonly?: boolean;
  /** Afficher le choix mosquée / maison (hommes). */
  showPlace?: boolean;
  /** Interface simplifiée : sans les sunnas. */
  simple?: boolean;
  /** Heure de la prière, déjà formatée. */
  time?: string | null;
  /** Fin du temps de la prière, déjà formatée. */
  until?: string | null;
}>();
defineEmits<{
  (e: 'toggle-prayer', id: PrayerId): void;
  (e: 'toggle-place', id: PrayerId): void;
  (e: 'toggle-sunnah', id: SunnahId): void;
}>();
</script>

<style scoped>
.group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
