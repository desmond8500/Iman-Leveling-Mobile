import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import AdhkarPage from '@/views/AdhkarPage.vue';
import HomePage from '@/views/HomePage.vue';
import NameDetailPage from '@/views/NameDetailPage.vue';
import NamesPage from '@/views/NamesPage.vue';
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
