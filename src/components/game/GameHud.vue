<template>
  <section class="hud" aria-label="Ton personnage">
    <div class="face">
      <VectorSprite :look="avatarLook(avatar.id)" portrait :size="50" />
      <span class="lvl">{{ level }}</span>
    </div>
    <div class="stats">
      <strong class="name">{{ label }}</strong>
      <div class="stat" role="progressbar" aria-label="Iman (Hasanat du niveau)" :aria-valuenow="into" aria-valuemin="0" :aria-valuemax="forNext">
        <span class="key iman">IMAN</span>
        <span class="gauge"><i class="fill iman" :style="{ width: pct(into, forNext) }" /></span>
        <span class="num">{{ progress.totalHasanat }}</span>
      </div>
      <div class="stat" role="progressbar" aria-label="Nour (prières du jour)" :aria-valuenow="prayers" aria-valuemin="0" :aria-valuemax="PRAYERS.length">
        <span class="key nour">NOUR</span>
        <span class="gauge"><i class="fill nour" :style="{ width: pct(prayers, PRAYERS.length) }" /></span>
        <span class="num">{{ prayers }}/{{ PRAYERS.length }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import VectorSprite from '@/components/VectorSprite.vue';
import { PRAYERS } from '@/data/prayers';
import { avatarLook } from '@/data/sprites';
import { useAvatarStore } from '@/stores/avatar';
import { useProgressStore } from '@/stores/progress';
import { AVATARS } from '@/utils/avatar';

/**
 * Carte du joueur façon RPG : portrait, niveau, jauge « Iman » (Hasanat vers le niveau suivant)
 * et jauge « Nour » (prières faites aujourd'hui).
 */
const avatar = useAvatarStore();
const progress = useProgressStore();

const label = computed(() => AVATARS.find((a) => a.id === avatar.id)?.label ?? 'Toi');
const level = computed(() => progress.levelInfo.level);
const into = computed(() => progress.levelInfo.hasanatIntoLevel);
const forNext = computed(() => progress.levelInfo.hasanatForNext);
const prayers = computed(() => progress.dayStats(progress.today).prayers);
const pct = (value: number, max: number) => `${max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0}%`;

onMounted(() => void avatar.load());
</script>

<style scoped>
.hud {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 9px 5px 5px;
  border: 2px solid #e9ecf7;
  border-radius: 8px;
  background: rgba(14, 20, 48, 0.82);
  box-shadow: 0 0 0 2px rgba(14, 20, 48, 0.7), 0 6px 14px rgba(0, 0, 0, 0.4);
  color: #f4f6ff;
  min-width: 0;
}
.face {
  position: relative;
  flex: none;
  width: 50px;
  height: 50px;
  border: 2px solid #e9ecf7;
  border-radius: 6px;
  overflow: hidden;
  background: linear-gradient(180deg, #5b7fd6, #2a3a7a);
}
.face svg {
  display: block;
}
.lvl {
  position: absolute;
  right: 0;
  bottom: 0;
  min-width: 18px;
  padding: 0 3px;
  border-top-left-radius: 5px;
  background: #ffd34d;
  color: #1a2150;
  font-size: 11px;
  font-weight: 900;
  text-align: center;
}
.stats {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.name {
  font-size: 12px;
  line-height: 1.1;
  letter-spacing: 0.04em;
}
.stat {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  align-items: center;
  gap: 5px;
}
.key {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.06em;
}
.key.iman {
  color: #ffb84d;
}
.key.nour {
  color: #7fb2ff;
}
.gauge {
  height: 7px;
  border-radius: 4px;
  background: #1c2550;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  overflow: hidden;
}
.fill {
  display: block;
  height: 100%;
  transition: width 0.6s ease;
}
.fill.iman {
  background: linear-gradient(90deg, #e2562f, #ffb84d);
}
.fill.nour {
  background: linear-gradient(90deg, #2f6fe2, #7fd6ff);
}
.num {
  min-width: 26px;
  font-size: 11px;
  font-weight: 800;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
