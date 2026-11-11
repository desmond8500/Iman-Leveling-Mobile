import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import AdhkarPage from '@/views/AdhkarPage.vue';
import HomePage from '@/views/HomePage.vue';
import MorePage from '@/views/MorePage.vue';
import NameDetailPage from '@/views/NameDetailPage.vue';
import NamesPage from '@/views/NamesPage.vue';
import PrayerPage from '@/views/PrayerPage.vue';
import QuranPage from '@/views/QuranPage.vue';
import QuranReadPage from '@/views/QuranReadPage.vue';
import RamadanPage from '@/views/RamadanPage.vue';
import SettingsPage from '@/views/SettingsPage.vue';
import TabsPage from '@/views/TabsPage.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/tabs/home' },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      { path: '', redirect: '/tabs/home' },
      { path: 'home', name: 'home', component: HomePage },
      { path: 'adhkar', name: 'adhkar', component: AdhkarPage },
      { path: 'names', name: 'names', component: NamesPage },
      { path: 'names/:n(\\d+)', name: 'name-detail', component: NameDetailPage, props: true },
      { path: 'more', name: 'more', component: MorePage },
      { path: 'prayer', name: 'prayer', component: PrayerPage },
      { path: 'quran', name: 'quran', component: QuranPage },
      { path: 'quran/:n(\\d+)', name: 'quran-read', component: QuranReadPage, props: true },
      { path: 'ramadan', name: 'ramadan', component: RamadanPage },
      { path: 'settings', name: 'settings', component: SettingsPage },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/tabs/home' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
