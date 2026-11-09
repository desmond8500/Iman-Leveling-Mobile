<template>
  <section class="player">
    <div class="badge" aria-label="Niveau">
      <span class="badge-label">NIV</span>
      <span class="badge-level">{{ level }}</span>
    </div>
    <div class="info">
      <div class="top-row">
        <strong>{{ totalXp }} XP</strong>
        <span class="streak" :class="{ active: streak > 0 }">
          <ion-icon :icon="flame" /> {{ streak }} j
        </span>
      </div>
      <XPBar :xp-into-level="xpIntoLevel" :xp-for-next="xpForNext" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { flame } from 'ionicons/icons';
import XPBar from './XPBar.vue';

defineProps<{
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
  totalXp: number;
  streak: number;
}>();
</script>

<style scoped>
.player {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 20px;
  background: var(--iman-card);
  border: 1px solid rgba(242, 201, 76, 0.25);
}
.badge {
  flex: none;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 30% 30%, #ffe08a, var(--iman-gold));
  color: #2b2100;
  box-shadow: 0 0 18px rgba(242, 201, 76, 0.35);
}
.badge-label {
  font-size: 10px;
  letter-spacing: 1px;
  font-weight: 700;
}
.badge-level {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}
.info {
  flex: 1;
  min-width: 0;
}
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.streak {
  color: var(--iman-text-soft);
  font-weight: 600;
}
.streak.active {
  color: #ff9f43;
}
</style>
