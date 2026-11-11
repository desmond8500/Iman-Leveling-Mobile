<template>
  <div class="counter" role="group" aria-label="Compteur de récitations">
    <button type="button" class="btn" aria-label="Retirer une récitation" :disabled="count === 0" @click="bump(-1)">
      <ion-icon :icon="removeOutline" />
    </button>
    <span class="value" :class="{ reached }" aria-live="polite">
      {{ count }}<template v-if="target"> / {{ target }}</template>
    </span>
    <button type="button" class="btn" aria-label="Ajouter une récitation" @click="bump(1)">
      <ion-icon :icon="addOutline" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { addOutline, removeOutline } from 'ionicons/icons';
import { useProgressStore } from '@/stores/progress';

const props = defineProps<{
  /** Clé du compteur (propre à l'invocation). */
  counterKey: string;
  /** Nombre de récitations recommandé. */
  target?: number;
  /** Clé de l'invocation à cocher quand le nombre recommandé est atteint. */
  completeKey?: string;
}>();

const store = useProgressStore();
const count = computed(() => store.countOf(props.counterKey));
const reached = computed(() => !!props.target && count.value >= props.target);

function bump(delta: 1 | -1) {
  void store.bumpCount(props.counterKey, delta, props.target, props.completeKey);
}
</script>

<style scoped>
.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 12px;
}
.btn {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: var(--iman-card-done);
  color: var(--iman-gold);
  font-size: 22px;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.3;
  cursor: default;
}
.value {
  min-width: 70px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.value.reached {
  color: var(--iman-emerald);
}
</style>
