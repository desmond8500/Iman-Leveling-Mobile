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
  /** Faite à la mosquée (compte pour les hommes). */
  mosque: boolean;
  /** Hasanat que rapporte cette prière, selon le genre et le lieu. */
  reward: number;
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
  /** Prières faites à la mosquée. Absent avant l'ajout du choix du lieu. */
  mosque?: Partial<Record<PrayerId, boolean>>;
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

export type Gender = 'male' | 'female';

export interface AccountInfo {
  name: string;
  email: string;
}

export interface ServerSettings {
  /** Adresse du serveur (ex. https://iman.example.com). Vide tant qu'elle n'est pas renseignée. */
  url: string;
  /** Jeton d'accès, présent seulement quand le compte est lié. Le mot de passe n'est jamais enregistré. */
  token: string | null;
  user: AccountInfo | null;
  /** Date ISO de la dernière synchronisation réussie. */
  lastSync: string | null;
}

export interface SettingsData {
  version: 1;
  gender: Gender | null;
  /** Code pays ISO 3166-1 alpha-2 (ex. « FR »). */
  countryCode: string | null;
  /** Position approximative (arrondie à 0,01°, environ 1 km), pour calculer les heures de prière. */
  location: { lat: number; lon: number } | null;
  /** Méthode de calcul des heures ; `null` = celle qui correspond au pays. */
  prayerMethod: string | null;
  /** Apparence : automatique (bleu le vendredi), émeraude ou bleu. */
  theme: 'auto' | 'emerald' | 'blue';
  /** Rappels d'ablutions et de prière (application mobile uniquement). */
  notifications: { enabled: boolean; ablutionMinutes: number };
  server: ServerSettings;
}
