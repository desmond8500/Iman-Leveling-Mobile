import type { ManifestOptions } from 'vite-plugin-pwa';

/** Manifeste de la PWA, partagé entre la config Vite et les tests. */
export const manifest: Partial<ManifestOptions> = {
  name: 'Iman Leveling',
  short_name: 'Iman',
  description:
    'Suivi des prières, des invocations et de la lecture, sous forme de jeu : Hasanat, niveaux et séries.',
  lang: 'fr',
  dir: 'ltr',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#0f3a31',
  theme_color: '#0b1d1a',
  categories: ['lifestyle', 'education'],
  icons: [
    { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
