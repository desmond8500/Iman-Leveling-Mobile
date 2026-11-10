export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type SunnahId =
  | 'fajr-before'
  | 'dhuhr-before'
  | 'dhuhr-after'
  | 'asr-before'
  | 'maghrib-after'
  | 'isha-after'
  | 'witr';

/** Prière surérogatoire rattachée à une prière obligatoire. */
export interface Sunnah {
  id: SunnahId;
  name: string;
  rakaat: number;
  /** Sunna confirmée (mu'akkada) : récompense plus élevée. */
  emphasized: boolean;
}

export interface Prayer {
  id: PrayerId;
  name: string;
  arabic: string;
  hint: string;
  /** Sunnas à faire avant la prière obligatoire. */
  before: Sunnah[];
  /** Sunnas à faire après la prière obligatoire. */
  after: Sunnah[];
}

export type SunnahView = Sunnah & { done: boolean };

export interface PrayerView extends Prayer {
  done: boolean;
  before: SunnahView[];
  after: SunnahView[];
}

export type Period = 'morning' | 'evening';

/** Invocation prête à afficher pour une période donnée. */
export interface Dhikr {
  id: string;
  title: string;
  /** Nombre de répétitions recommandé. */
  count: number;
  source: string;
  arabic: string;
  phonetic: string;
  french: string;
}

export interface DayRecord {
  prayers: Partial<Record<PrayerId, boolean>>;
  /** Absent dans les données enregistrées avant l'ajout des sunnas. */
  sunnah?: Partial<Record<SunnahId, boolean>>;
  /** Clés « période:id » (voir adhkarKey). Absent avant l'ajout des invocations. */
  adhkar?: Record<string, boolean>;
}

/** Niveau d'accomplissement d'une journée, pour le calendrier. */
export type DayLevel = 'full' | 'partial' | 'none';

export interface DayStats {
  prayers: number;
  sunnah: number;
  adhkar: number;
  hasanat: number;
  level: DayLevel;
}

export interface ProgressData {
  version: 1;
  /** Clé = date locale au format AAAA-MM-JJ */
  days: Record<string, DayRecord>;
}

export interface LevelInfo {
  level: number;
  hasanatIntoLevel: number;
  hasanatForNext: number;
}
