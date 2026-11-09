import type { ProgressData } from '../types';
import { loadJson, saveJson } from './storage';

/**
 * Interface unique d'accès aux données.
 * Aujourd'hui : stockage local. Plus tard : une implémentation qui parle à l'API Laravel,
 * sans rien changer au store ni aux écrans.
 */
export interface ProgressRepository {
  load(): Promise<ProgressData>;
  save(data: ProgressData): Promise<void>;
}

const STORAGE_KEY = 'iman.progress.v1';

export const emptyProgress = (): ProgressData => ({ version: 1, days: {} });

export class LocalProgressRepository implements ProgressRepository {
  load(): Promise<ProgressData> {
    return loadJson<ProgressData>(STORAGE_KEY, emptyProgress());
  }

  save(data: ProgressData): Promise<void> {
    return saveJson(STORAGE_KEY, data);
  }
}
