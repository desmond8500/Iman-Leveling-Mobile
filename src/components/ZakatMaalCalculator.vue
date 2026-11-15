<template>
  <section class="card">
    <h2>Calculer la zakat al-Maal</h2>

    <label class="field">
      <span>Devise</span>
      <input v-model="currency" type="text" maxlength="8" placeholder="EUR, FCFA, MAD…" />
    </label>

    <fieldset v-for="group in GROUPS" :key="group.title">
      <legend>{{ group.title }}</legend>
      <label v-for="f in group.fields" :key="f.key" class="field">
        <span>{{ f.label }}</span>
        <input v-model="form[f.key]" type="text" inputmode="decimal" placeholder="0" />
      </label>
    </fieldset>

    <fieldset>
      <legend>Seuil (nisab)</legend>
      <div class="basis" role="radiogroup" aria-label="Référence du seuil">
        <button type="button" role="radio" :aria-checked="basis === 'gold'" :class="{ active: basis === 'gold' }" @click="basis = 'gold'">
          Or (85 g)
        </button>
        <button type="button" role="radio" :aria-checked="basis === 'silver'" :class="{ active: basis === 'silver' }" @click="basis = 'silver'">
          Argent (595 g)
        </button>
      </div>
      <label class="check">
        <input v-model="hawl" type="checkbox" />
        <span>Ces biens sont détenus depuis une année lunaire complète</span>
      </label>
    </fieldset>

    <div class="result" aria-live="polite">
      <p>Total des biens : <strong>{{ formatMoney(result.assets, currency) }}</strong></p>
      <p>Dettes à rembourser : <strong>{{ formatMoney(result.debts, currency) }}</strong></p>
      <p>Patrimoine net : <strong>{{ formatMoney(result.net, currency) }}</strong></p>
      <p v-if="result.nisabKnown">Seuil (nisab) : <strong>{{ formatMoney(result.nisab, currency) }}</strong></p>

      <p v-if="!result.nisabKnown" class="status warn">
        Renseigne le prix du gramme {{ basis === 'gold' ? "d'or" : "d'argent" }} pour connaître le seuil.
      </p>
      <p v-else-if="!result.nisabReached" class="status">Le seuil n'est pas atteint : pas de zakat al-Maal à verser.</p>
      <template v-else>
        <p class="total">
          Zakat estimée (2,5 %) : <strong>{{ formatMoney(result.due, currency) }}</strong>
        </p>
        <p v-if="!hawl" class="status warn">
          Elle ne devient due qu'après une année lunaire complète pendant laquelle le patrimoine est resté au-dessus du seuil.
        </p>
      </template>
    </div>

    <button type="button" class="ghost" @click="clear">Tout effacer</button>

    <p class="hint">
      Estimation indicative. Les bijoux portés, les dettes à long terme, le commerce et les placements font
      l'objet d'avis différents selon les écoles : en cas de doute, demande à un savant ou à une institution
      de confiance. Les montants saisis restent sur ton appareil.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { loadJson, saveJson } from '@/services/storage';
import {
  emptyMaalForm, formatMoney, maalInputFromForm, sanitizeMaalForm, zakatMaal, type MaalForm, type NisabBasis,
} from '@/utils/zakat';

const KEY = 'iman.zakat.maal.v1';

const GROUPS: { title: string; fields: { key: keyof MaalForm; label: string }[] }[] = [
  {
    title: 'Argent et placements',
    fields: [
      { key: 'cash', label: 'Argent liquide et comptes courants' },
      { key: 'savings', label: 'Épargne' },
      { key: 'investments', label: 'Placements (actions, parts…)' },
      { key: 'tradeGoods', label: 'Marchandises destinées à la vente' },
      { key: 'receivables', label: 'Créances dont le remboursement est attendu' },
    ],
  },
  {
    title: 'Or et argent',
    fields: [
      { key: 'goldGrams', label: 'Or détenu (grammes)' },
      { key: 'goldPricePerGram', label: "Prix d'un gramme d'or" },
      { key: 'silverGrams', label: 'Argent détenu (grammes)' },
      { key: 'silverPricePerGram', label: "Prix d'un gramme d'argent" },
    ],
  },
  { title: 'À déduire', fields: [{ key: 'debts', label: 'Dettes à rembourser prochainement' }] },
];

const form = reactive<MaalForm>(emptyMaalForm());
const currency = ref('');
const basis = ref<NisabBasis>('gold');
const hawl = ref(false);
const ready = ref(false);

const result = computed(() => zakatMaal(maalInputFromForm(form), basis.value));

function clear() {
  Object.assign(form, emptyMaalForm());
  hawl.value = false;
}

onMounted(async () => {
  try {
    const saved = await loadJson<Record<string, unknown> | null>(KEY, null);
    if (saved) {
      Object.assign(form, sanitizeMaalForm(saved.form));
      if (typeof saved.currency === 'string') currency.value = saved.currency.slice(0, 8);
      if (saved.basis === 'gold' || saved.basis === 'silver') basis.value = saved.basis;
      hawl.value = saved.hawl === true;
    }
  } finally {
    ready.value = true;
  }
});

watch(
  () => [{ ...form }, currency.value, basis.value, hawl.value],
  () => {
    if (!ready.value) return;
    void saveJson(KEY, { form: { ...form }, currency: currency.value, basis: basis.value, hawl: hawl.value }).catch(() => undefined);
  },
  { deep: true },
);
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
fieldset {
  margin: 0 0 12px;
  padding: 0;
  border: 0;
}
legend {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--iman-gold);
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
.basis {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.basis button {
  flex: 1;
  padding: 8px;
  border: 1px solid rgba(242, 201, 76, 0.3);
  border-radius: 10px;
  background: transparent;
  color: inherit;
}
.basis button.active {
  background: var(--iman-gold);
  border-color: var(--iman-gold);
  color: #0f2a4a;
  font-weight: 700;
}
.check {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 13px;
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
.status {
  margin-top: 6px !important;
  font-size: 13px;
}
.warn {
  color: var(--iman-gold);
}
.ghost {
  margin: 8px 0;
  padding: 8px 14px;
  border: 1px solid rgba(242, 201, 76, 0.3);
  border-radius: 12px;
  background: transparent;
  color: inherit;
}
.hint {
  margin: 0;
  font-size: 12px;
  color: var(--iman-text-soft);
}
</style>
