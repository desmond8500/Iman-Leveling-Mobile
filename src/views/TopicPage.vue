<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" text="" />
        </ion-buttons>
        <ion-title>{{ topic?.title ?? 'Rubrique' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div v-if="topic" class="wrap">
        <section class="card intro">
          <p>{{ topic.intro }}</p>
          <p class="source">{{ topic.source }}</p>
        </section>

        <section v-for="(item, i) in topic.items" :key="item.title" class="card">
          <div class="head">
            <span class="num">{{ i + 1 }}</span>
            <h2>{{ item.title }}</h2>
            <span v-if="item.arabic" class="arabic" dir="rtl" lang="ar">{{ item.arabic }}</span>
          </div>
          <p>{{ item.text }}</p>
          <router-link v-if="item.href" class="link" :to="item.href">{{ item.linkLabel ?? 'Voir' }}</router-link>
        </section>

        <p v-if="topic.note" class="note">{{ topic.note }}</p>
      </div>
      <div v-else class="wrap">
        <p class="note">Rubrique introuvable.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { topicById } from '@/data/topics';

const props = defineProps<{ id: string }>();
const topic = computed(() => topicById(props.id));
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
  margin: 0;
  line-height: 1.5;
}
.intro {
  border: 1px solid rgba(242, 201, 76, 0.25);
}
.source {
  margin-top: 8px !important;
  font-size: 12px;
  color: var(--iman-gold);
}
.head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.head h2 {
  flex: 1;
  margin: 0;
  font-size: 16px;
}
.num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--iman-gold);
  color: #0f2a4a;
  font-size: 13px;
  font-weight: 700;
}
.arabic {
  font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Geeza Pro', serif;
  font-size: 22px;
  color: var(--iman-gold);
}
.link {
  display: inline-block;
  margin-top: 8px;
  color: var(--iman-gold);
  font-size: 14px;
}
.note {
  color: var(--iman-text-soft);
  font-size: 13px;
}
</style>
