<template>
  <section class="card">
    <h2>Calculer la zakat al-Fitr</h2>

    <label class="field">
      <span>Nombre de personnes (toi et ceux dont tu as la charge)</span>
      <input v-model="persons" type="text" inputmode="numeric" placeholder="1" />
    </label>
    <label class="field">
      <span>Poids par personne (kg)</span>
      <input v-model="kg" type="text" inputmode="decimal" />
    </label>
    <label class="field">
      <span>Prix d'un kilo de la denrée de base</span>
      <input v-model="price" type="text" inputmode="decimal" placeholder="0" />
    </label>
    <label class="field">
      <span>Devise</span>
      <input v-model="currency" type="text" maxlength="8" placeholder="EUR, FCFA, MAD…" />
    </label>

    <div class="result" aria-live="polite">
      <p>
        Par personne : <strong>{{ formatMoney(result.perPerson, currency) }}</strong>
      </p>
      <p class="total">
        Total à verser : <strong>{{ formatMoney(result.total, currency) }}</strong>
        <small>({{ result.totalKg }} kg pour {{ count }} personne{{ count > 1 ? 's' : '' }})</small>
      </p>
    </div>

    <p class="hint">
      Le poids du sa' varie selon la denrée et l'avis suivi (environ 2 à 3 kg). Beaucoup de mosquées
      et d'institutions annoncent chaque année un montant par personne : en cas de doute, suis-le.
      À verser avant la prière de l'Aïd.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { FITR_DEFAULT_KG, formatMoney, parseAmount, zakatFitr } from '@/utils/zakat';

const persons = ref('1');
const kg = ref(String(FITR_DEFAULT_KG).replace('.', ','));
const price = ref('');
const currency = ref('');

const count = computed(() => Math.floor(parseAmount(persons.value)));
const result = computed(() => zakatFitr(count.value, parseAmount(kg.value), parseAmount(price.value)));
</script>

<style scoped>
.card {
  margin-bottom: 14px;
  padding: 16px;
  border-radius: 18px;
  background: var(--iman-card);
}
h2 {
  margin: 0 0 12px;
  font-size: 17px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  font-size: 13px;
}
.field input {
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: var(--iman-bg-top);
  color: inherit;
  font: inherit;
  font-size: 16px;
}
.result {
  margin: 16px 0 8px;
  padding: 12px;
  border-radius: 14px;
  background: var(--iman-card-done);
}
.result p {
  margin: 0 0 4px;
}
.total strong {
  color: var(--iman-gold);
  font-size: 20px;
}
.total small {
  display: block;
  color: var(--iman-text-soft);
}
.hint {
  margin: 0;
  font-size: 12px;
  color: var(--iman-text-soft);
}
</style>
