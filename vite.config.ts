/// <reference types="vitest/config" />
import { env } from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { manifest } from './pwa.manifest';
import pkg from './package.json';

export default defineConfig({
  // Version injectée à la compilation (pas pendant les tests, où elle vaut « dev »).
  // En compilation automatique, APP_BUILD ajoute le numéro de build : « 0.3.0-b12 », comme l'APK.
  define: env.VITEST
    ? {}
    : { __APP_VERSION__: JSON.stringify(env.APP_BUILD ? `${pkg.version}-b${env.APP_BUILD}` : pkg.version) },
  plugins: [
    vue(),
    VitePWA({
      // Le service worker met à jour l'app tout seul au prochain lancement après un déploiement.
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      injectRegister: "auto",
      manifest,
      workbox: {
        // Toute l'app est mise en cache : elle fonctionne hors ligne (les données sont locales).
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff,woff2}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/unit/**/*.spec.ts"],
  },
});
