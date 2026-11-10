import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iman.leveling',
  appName: 'Iman Leveling',
  webDir: 'dist',
  plugins: {
    // Splash natif : image générée depuis resources/splash.png, puis l'animation de l'app prend le relais.
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 800,
      backgroundColor: '#0f3a31',
      showSpinner: false,
    },
  },
};

export default config;
