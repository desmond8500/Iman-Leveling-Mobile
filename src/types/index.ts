export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface Prayer {
  id: PrayerId;
  name: string;
  arabic: string;
  hint: string;
}

export interface DayRecord {
  prayers: Partial<Record<PrayerId, boolean>>;
}

export interface ProgressData {
  version: 1;
  /** Clé = date locale au format AAAA-MM-JJ */
  days: Record<string, DayRecord>;
}

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
}
