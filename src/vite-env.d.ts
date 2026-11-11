/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

/** Version de l'application, injectée par Vite depuis package.json (voir vite.config.ts). */
declare const __APP_VERSION__: string;
