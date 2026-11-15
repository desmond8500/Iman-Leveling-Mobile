<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/events" text="" />
        </ion-buttons>
        <ion-title>{{ event?.title ?? 'Événement' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div v-if="event" class="wrap">
        <section class="card intro">
          <p v-if="event.arabic" class="arabic" dir="rtl" lang="ar">{{ event.arabic }}</p>
          <p>{{ event.intro }}</p>
          <p v-if="when" class="when">{{ when }}</p>
        </section>

        <section v-for="s in event.sections" :key="s.title" class="card">
          <h2>{{ s.title }}</h2>
          <p v-for="(p, i) in s.paragraphs ?? []" :key="`p${i}`">{{ p }}</p>
          <ul v-if="s.bullets?.length">
            <li v-for="(b, i) in s.bullets" :key="i">{{ b }}</li>
          </ul>
          <DuaCard v-for="d in s.duas ?? []" :key="d.title" :dua="d" />
        </section>

        <p v-if="event.note" class="note">{{ event.note }}</p>
      </div>
      <div v-else class="wrap">
        <p class="note">Événement introuvable.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import DuaCard from '@/components/DuaCard.vue';
import { eventById } from '@/data/events';
import { daysUntilLabel, nextHijriOccurrence } from '@/utils/events';

const props = defineProps<{ id: string }>();
const event = computed(() => eventById(props.id));

const dateFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const when = computed(() => {
  const h = event.value?.hijri;
  if (!h) return '';
  const now = new Date();
  const next = nextHijriOccurrence(now, h.month, h.day);
  return next ? `${h.label} : ${dateFormat.format(next)} (${daysUntilLabel(now, next)}), selon le calendrier.` : '';
});
</script>

<style scoped>
.wrap {
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card {
  padding: 16px;
  border-radius: 16px;
  background: var(--iman-card);
}
.card p {
  margin: 0 0 8px;
  line-height: 1.5;
}
.intro {
  border: 1px solid rgba(242, 201, 76, 0.25);
}
.arabic {
  font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Geeza Pro', serif;
  font-size: 32px;
  text-align: center;
  color: var(--iman-gold);
}
.when {
  color: var(--iman-gold);
  font-size: 13px;
}
h2 {
  margin: 0 0 8px;
  font-size: 16px;
}
ul {
  margin: 0 0 10px;
  padding-left: 18px;
  line-height: 1.5;
}
li {
  margin-bottom: 6px;
}
.note {
  color: var(--iman-text-soft);
  font-size: 13px;
}
</style>
