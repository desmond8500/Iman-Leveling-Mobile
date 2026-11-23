<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/prayer" text="" />
        </ion-buttons>
        <ion-title>Oubli dans la prière</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <section class="card intro">
          <h2>Sujûd as-sahw</h2>
          <p class="ar" dir="rtl" lang="ar">سُجُودُ السَّهْوِ</p>
          <ul class="basics">
            <li v-for="b in SAHW_BASICS" :key="b">{{ b }}</li>
          </ul>
        </section>

        <section class="card">
          <h2>Ton école</h2>
          <div class="schools" role="radiogroup" aria-label="École juridique">
            <button
              v-for="s in SCHOOLS"
              :key="s.id"
              type="button"
              class="chip"
              :class="{ on: school === s.id }"
              role="radio"
              :aria-checked="school === s.id"
              @click="choose(s.id)"
            >
              {{ s.label }}
            </button>
          </div>
          <p class="rule">{{ currentSchool.rule }}</p>
        </section>

        <section class="card">
          <h2>Que s'est-il passé ?</h2>
          <ul class="cases">
            <li v-for="c in SAHW_CASES" :key="c.id">
              <button type="button" class="case" :class="{ on: selected === c.id }" :aria-expanded="selected === c.id" @click="toggle(c.id)">
                <span class="cursor" aria-hidden="true">▶</span>
                <span class="c-text">
                  <strong>{{ c.title }}</strong>
                  <small>{{ c.situation }}</small>
                </span>
                <span class="tag" :class="timingOf(c)">{{ TIMING_SHORT[timingOf(c)] }}</span>
              </button>

              <div v-if="selected === c.id" class="answer" aria-live="polite">
                <p class="verdict" :class="timingOf(c)">{{ TIMING_LONG[timingOf(c)] }}</p>
                <h3>Que faire maintenant</h3>
                <ol class="fix">
                  <li v-for="f in c.fix" :key="f">{{ f }}</li>
                </ol>
                <p v-if="c.schoolNotes?.[school]" class="note">{{ c.schoolNotes[school] }}</p>
                <template v-if="stepsOf(c).length">
                  <h3>Les deux prosternations ({{ TIMING_SHORT[timingOf(c)].toLowerCase() }})</h3>
                  <ol class="steps">
                    <li v-for="s in stepsOf(c)" :key="s.title">
                      <strong>{{ s.title }}</strong>
                      <span>{{ s.text }}</span>
                    </li>
                  </ol>
                </template>
                <p class="source">Source : {{ c.source }}</p>
              </div>
            </li>
          </ul>
        </section>

        <section class="card">
          <h2>Prier derrière un imam</h2>
          <ol class="steps">
            <li v-for="r in IMAM_RULES" :key="r.title">
              <strong>{{ r.title }}</strong>
              <span>{{ r.text }}</span>
            </li>
          </ol>
          <p class="source">Source : {{ IMAM_SOURCE }}</p>
        </section>

        <p class="hint">
          Les écoles divergent sur certains détails. En cas de doute, demande à un imam ou à un enseignant de confiance.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import {
  DEFAULT_SCHOOL,
  IMAM_RULES,
  IMAM_SOURCE,
  isSchoolId,
  SAHW_BASICS,
  SAHW_CASES,
  SCHOOLS,
  sahwSteps,
  sahwTiming,
  type SahwCase,
  type SahwTiming,
  type SchoolId,
} from '@/data/sahw';
import { loadJson, saveJson } from '@/services/storage';

const STORAGE_KEY = 'iman.sahw.school.v1';

const TIMING_SHORT: Record<SahwTiming, string> = {
  avant: 'Avant le salam',
  apres: 'Après le salam',
  aucune: 'Rien à faire',
  recommencer: 'Recommencer',
};
const TIMING_LONG: Record<SahwTiming, string> = {
  avant: 'Deux prosternations de l’oubli, avant le salam.',
  apres: 'Deux prosternations de l’oubli, après le salam.',
  aucune: 'Pas de prosternation de l’oubli : ta prière est valable.',
  recommencer: 'La prière est à recommencer.',
};

const school = ref<SchoolId>(DEFAULT_SCHOOL);
const selected = ref<string | null>(null);
const currentSchool = computed(() => SCHOOLS.find((s) => s.id === school.value) ?? SCHOOLS[0]);

const timingOf = (c: SahwCase) => sahwTiming(c.kind, school.value);
function stepsOf(c: SahwCase) {
  const t = timingOf(c);
  return t === 'avant' || t === 'apres' ? sahwSteps(t, school.value) : [];
}

function choose(id: SchoolId) {
  school.value = id;
  void saveJson(STORAGE_KEY, id);
}
function toggle(id: string) {
  selected.value = selected.value === id ? null : id;
}

onMounted(async () => {
  const stored = await loadJson<unknown>(STORAGE_KEY, DEFAULT_SCHOOL);
  if (isSchoolId(stored)) school.value = stored;
});
</script>

<style scoped>
.card {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 18px;
  background: var(--iman-card);
}
h2 {
  margin: 0 0 12px;
  font-size: 18px;
}
h3 {
  margin: 14px 0 6px;
  font-size: 14px;
  color: var(--iman-gold);
}
.intro .ar {
  margin: -6px 0 10px;
  font-size: 22px;
  color: var(--iman-gold);
}
.basics {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}
.schools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  padding: 8px 14px;
  border: 1px solid var(--iman-text-soft);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
}
.chip.on {
  border-color: var(--iman-gold);
  background: var(--iman-gold);
  color: #1a2150;
}
.rule,
.hint,
.source,
.steps span,
.c-text small {
  color: var(--iman-text-soft);
  font-size: 13px;
}
.rule {
  margin: 12px 0 0;
}
.hint {
  margin: 0 4px 24px;
  text-align: center;
}
.cases {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.case {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 0;
  border-radius: 12px;
  background: var(--iman-card-done);
  color: inherit;
  font: inherit;
  text-align: left;
}
.cursor {
  flex: none;
  width: 12px;
  font-size: 10px;
  color: var(--iman-gold);
  visibility: hidden;
}
.case.on .cursor,
.case:focus-visible .cursor {
  visibility: visible;
}
.case.on {
  box-shadow: 0 0 0 2px var(--iman-gold);
}
.c-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tag {
  flex: none;
  max-width: 96px;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
}
.tag.avant,
.verdict.avant {
  background: #2f6fe2;
  color: #fff;
}
.tag.apres,
.verdict.apres {
  background: #e2862f;
  color: #fff;
}
.tag.aucune,
.verdict.aucune {
  background: #1d8a50;
  color: #fff;
}
.tag.recommencer,
.verdict.recommencer {
  background: #c93a3a;
  color: #fff;
}
.answer {
  padding: 10px 6px 4px 30px;
}
.verdict {
  margin: 0;
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 700;
}
.fix {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}
.note {
  margin: 10px 0 0;
  padding: 8px 10px;
  border-left: 3px solid var(--iman-gold);
  border-radius: 6px;
  background: var(--iman-card-done);
  font-size: 13px;
}
.steps {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.steps li {
  counter-increment: step;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-left: 34px;
}
.steps li::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--iman-card-done);
  color: var(--iman-gold);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.source {
  margin: 12px 0 0;
  font-style: italic;
}
</style>
