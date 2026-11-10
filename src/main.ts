import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Capacitor } from '@capacitor/core';
import { IonicVue } from '@ionic/vue';
import { registerSW } from 'virtual:pwa-register';
import App from './App.vue';
import router from './router';

/* Core CSS Ionic */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Thème sombre permanent (esprit jeu mobile) */
import '@ionic/vue/css/palettes/dark.always.css';

import './theme/variables.css';

const app = createApp(App).use(IonicVue).use(createPinia()).use(router);

router.isReady().then(() => {
  app.mount('#app');
});

// Service worker (hors ligne + installation) : seulement sur le web, pas dans l'app native Capacitor.
if (!Capacitor.isNativePlatform()) {
  registerSW({ immediate: true });
}
