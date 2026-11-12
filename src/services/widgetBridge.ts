import { Capacitor, registerPlugin } from '@capacitor/core';
import { sanitizeWidgetActions, type WidgetAction, type WidgetSnapshot } from '@/utils/widgetSnapshot';

/**
 * Pont avec les widgets Android (plugin natif « WidgetBridge », voir README). Les données passent
 * en texte JSON. Sur le web et sur iOS, il n'y a pas de widget : tout est sans effet.
 */
interface WidgetBridgePlugin {
  /** Enregistre l'instantané et redessine les widgets. */
  update(options: { snapshot: string }): Promise<void>;
  /** Récupère (et vide) la file des validations faites depuis les widgets. */
  takeActions(): Promise<{ actions: string }>;
}

const bridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

export const widgetsSupported = () => Capacitor.getPlatform() === 'android';

export async function pushWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  if (!widgetsSupported()) return;
  await bridge.update({ snapshot: JSON.stringify(snapshot) });
}

export async function takeWidgetActions(): Promise<WidgetAction[]> {
  if (!widgetsSupported()) return [];
  const { actions } = await bridge.takeActions();
  try {
    return sanitizeWidgetActions(JSON.parse(actions));
  } catch {
    return [];
  }
}
