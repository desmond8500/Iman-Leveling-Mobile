<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" text="" />
        </ion-buttons>
        <ion-title>Héritage</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <section class="card">
          <h2>1. Le défunt</h2>
          <div class="seg" role="radiogroup" aria-label="Sexe du défunt">
            <button type="button" role="radio" :aria-checked="form.heirs.deceased === 'male'" :class="{ active: form.heirs.deceased === 'male' }" @click="setDeceased('male')">Un homme</button>
            <button type="button" role="radio" :aria-checked="form.heirs.deceased === 'female'" :class="{ active: form.heirs.deceased === 'female' }" @click="setDeceased('female')">Une femme</button>
          </div>
        </section>

        <section class="card">
          <h2>2. Les héritiers</h2>
          <h3>Conjoint</h3>
          <label v-if="form.heirs.deceased === 'female'" class="check">
            <input v-model="form.heirs.husband" type="checkbox" /> <span>Mari</span>
          </label>
          <CountStepper v-else v-model="form.heirs.wives" label="Épouses" :max="4" />

          <h3>Parents</h3>
          <label class="check"><input v-model="form.heirs.father" type="checkbox" /> <span>Père (en vie)</span></label>
          <label class="check"><input v-model="form.heirs.mother" type="checkbox" /> <span>Mère (en vie)</span></label>

          <h3>Enfants</h3>
          <CountStepper v-model="form.heirs.sons" label="Fils" />
          <CountStepper v-model="form.heirs.daughters" label="Filles" />

          <h3>Petits-enfants (enfants d'un fils décédé)</h3>
          <CountStepper v-model="form.heirs.sonsSons" label="Petits-fils" />
          <CountStepper v-model="form.heirs.sonsDaughters" label="Petites-filles" />

          <h3>Frères et sœurs</h3>
          <CountStepper v-model="form.heirs.fullBrothers" label="Frères germains (mêmes père et mère)" />
          <CountStepper v-model="form.heirs.fullSisters" label="Sœurs germaines" />
          <CountStepper v-model="form.heirs.paternalBrothers" label="Demi-frères (même père)" />
          <CountStepper v-model="form.heirs.paternalSisters" label="Demi-sœurs (même père)" />
          <CountStepper v-model="form.heirs.uterine" label="Demi-frères et sœurs (même mère)" />

          <p class="hint">
            Non pris en charge : grands-parents, oncles, cousins et autres héritiers éloignés. Ne saisis
            que les héritiers en vie, ou les enfants d'un fils décédé.
          </p>
        </section>

        <section class="card">
          <h2>3. Les biens et les dettes</h2>
          <label class="field">
            <span>Devise</span>
            <input v-model="form.currency" type="text" maxlength="8" placeholder="EUR, FCFA, MAD…" />
          </label>

          <div v-for="(a, i) in form.assets" :key="i" class="asset">
            <input v-model="a.label" type="text" maxlength="60" placeholder="Bien (maison, compte…)" :aria-label="`Nom du bien ${i + 1}`" />
            <input v-model="a.value" type="text" inputmode="decimal" placeholder="Valeur" :aria-label="`Valeur du bien ${i + 1}`" />
            <button type="button" class="remove" :aria-label="`Retirer le bien ${i + 1}`" @click="removeAsset(i)">×</button>
          </div>
          <button type="button" class="ghost" :disabled="form.assets.length >= MAX_ASSETS" @click="addAsset">+ Ajouter un bien</button>

          <label class="field">
            <span>Dettes à rembourser</span>
            <input v-model="form.debts" type="text" inputmode="decimal" placeholder="0" />
          </label>
          <label class="field">
            <span>Frais d'obsèques</span>
            <input v-model="form.funeral" type="text" inputmode="decimal" placeholder="0" />
          </label>
          <label class="field">
            <span>Legs voulu par le défunt (pour un non-héritier)</span>
            <input v-model="form.bequest" type="text" inputmode="decimal" placeholder="0" />
          </label>
        </section>

        <section class="card result" aria-live="polite">
          <h2>4. La répartition</h2>

          <dl class="estate">
            <div><dt>Total des biens</dt><dd>{{ money(estate.total) }}</dd></div>
            <div><dt>Dettes et obsèques</dt><dd>− {{ money(estate.debts + estate.funeral) }}</dd></div>
            <div v-if="estate.bequest > 0"><dt>Legs (max. un tiers)</dt><dd>− {{ money(estate.bequest) }}</dd></div>
            <div class="net"><dt>À partager</dt><dd>{{ money(estate.net) }}</dd></div>
          </dl>

          <p v-if="estate.insolvent" class="warn">Les dettes dépassent les biens : il n'y a rien à partager.</p>
          <p v-if="estate.bequestCapped" class="warn">Le legs est limité au tiers de ce qui reste après les dettes, sauf accord des héritiers.</p>

          <p v-if="!result.covered" class="warn">Choisis au moins un héritier pris en charge pour voir la répartition.</p>
          <table v-else class="table">
            <thead>
              <tr><th>Héritier</th><th>Part</th><th>Montant</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="r.id">
                <td>
                  {{ heirLabel(r.id, r.count) }}<template v-if="r.count > 1"> ({{ r.count }})</template>
                  <small>{{ basisText(r.basis) }}</small>
                </td>
                <td>{{ fracText(r.fraction) }}</td>
                <td>
                  {{ money(r.amount) }}
                  <small v-if="r.count > 1">{{ money(r.perPerson) }} chacun</small>
                </td>
              </tr>
            </tbody>
          </table>

          <ul v-if="result.blocked.length" class="blocked">
            <li v-for="(b, i) in result.blocked" :key="i">
              <strong>{{ heirLabel(b.id, b.count) }}</strong> : {{ b.reason }}
            </li>
          </ul>
          <p v-for="(w, i) in result.warnings" :key="`w${i}`" class="warn">{{ w }}</p>
        </section>

        <p class="note">
          Ce calcul suit les règles courantes du fiqh sunnite (Coran 4:11-12 et 4:176) pour les cas simples. Les
          écoles divergent sur certains cas, et la loi de ton pays peut s'appliquer. Pour une succession réelle,
          consulte un notaire et un savant. Les données restent sur ton appareil.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import CountStepper from '@/components/CountStepper.vue';
import { loadJson, saveJson } from '@/services/storage';
import { computeEstate, computeShares, distribute, fracText, heirLabel, type Basis, type Sex } from '@/utils/inheritance';
import { MAX_ASSETS, emptyEstateForm, estateInputFromForm, sanitizeEstateForm, type EstateForm } from '@/utils/inheritanceForm';
import { formatMoney } from '@/utils/zakat';

const KEY = 'iman.heritage.v1';
const form = reactive<EstateForm>(emptyEstateForm());
const ready = ref(false);

const money = (n: number) => formatMoney(n, form.currency);
const estate = computed(() => computeEstate(estateInputFromForm(form)));
const result = computed(() => computeShares(form.heirs));
const rows = computed(() => distribute(estate.value.net, result.value));

const BASIS: Record<Basis, string> = { fard: 'part fixe', asaba: 'reste', radd: 'avec reliquat redistribué', awl: 'part réduite (awl)' };
const basisText = (basis: Basis[]) => basis.map((b) => BASIS[b]).join(' + ');

function setDeceased(sex: Sex) {
  form.heirs.deceased = sex;
  // Un mari n'existe que pour une défunte, des épouses que pour un défunt.
  if (sex === 'female') form.heirs.wives = 0;
  else form.heirs.husband = false;
}

const addAsset = () => {
  if (form.assets.length < MAX_ASSETS) form.assets.push({ label: '', value: '' });
};
const removeAsset = (i: number) => {
  form.assets.splice(i, 1);
  if (!form.assets.length) form.assets.push({ label: '', value: '' });
};

onMounted(async () => {
  try {
    Object.assign(form, sanitizeEstateForm(await loadJson<unknown>(KEY, null)));
  } finally {
    ready.value = true;
  }
});

watch(
  form,
  () => {
    if (ready.value) void saveJson(KEY, JSON.parse(JSON.stringify(form))).catch(() => undefined);
  },
  { deep: true },
);
</script>

<style scoped>
.wrap {
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.card {
  padding: 16px;
  border-radius: 16px;
  background: var(--iman-card);
}
h2 {
  margin: 0 0 10px;
  font-size: 17px;
}
h3 {
  margin: 14px 0 4px;
  font-size: 13px;
  color: var(--iman-gold);
}
.seg {
  display: flex;
  gap: 8px;
}
.seg button {
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(242, 201, 76, 0.3);
  border-radius: 12px;
  background: transparent;
  color: inherit;
}
.seg button.active {
  background: var(--iman-gold);
  border-color: var(--iman-gold);
  color: #0f2a4a;
  font-weight: 700;
}
.check {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 12px 0;
  font-size: 13px;
}
input[type='text'] {
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: var(--iman-bg-top);
  color: inherit;
  font: inherit;
  font-size: 16px;
  min-width: 0;
}
.asset {
  display: grid;
  grid-template-columns: 1fr 110px 32px;
  gap: 8px;
  margin-bottom: 8px;
}
.remove {
  border: 0;
  background: none;
  color: inherit;
  font-size: 22px;
}
.ghost {
  padding: 8px 14px;
  border: 1px solid rgba(242, 201, 76, 0.3);
  border-radius: 12px;
  background: transparent;
  color: inherit;
}
.ghost:disabled {
  opacity: 0.4;
}
.estate {
  margin: 0 0 10px;
}
.estate div {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}
.estate dt,
.estate dd {
  margin: 0;
}
.net {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-weight: 700;
  color: var(--iman-gold);
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.table th {
  text-align: left;
  font-size: 12px;
  color: var(--iman-text-soft);
}
.table th,
.table td {
  padding: 8px 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  vertical-align: top;
}
.table small {
  display: block;
  color: var(--iman-text-soft);
  font-size: 11px;
}
.blocked {
  margin: 12px 0 0;
  padding-left: 18px;
  font-size: 13px;
  color: var(--iman-text-soft);
}
.warn {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--iman-gold);
}
.hint,
.note {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--iman-text-soft);
}
</style>
