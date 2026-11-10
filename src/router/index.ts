import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import AdhkarPage from '@/views/AdhkarPage.vue';
import HomePage from '@/views/HomePage.vue';
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
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/tabs/home' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
