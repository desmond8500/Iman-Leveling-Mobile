/*
 * Calcul des heures de prière à partir de la position (méthode astronomique classique,
 * celle de praytimes.org). Précision : de l'ordre de la minute ; elle dépend de la méthode
 * de calcul choisie, qui varie selon les pays et les institutions.
 */

export type MethodId = 'MWL' | 'ISNA' | 'EGYPT' | 'MAKKAH' | 'KARACHI' | 'UOIF';

export interface CalcMethod {
  id: MethodId;
  name: string;
  /** Angle du soleil sous l'horizon pour Fajr. */
  fajr: number;
  /** Angle pour Isha, ou `null` si Isha se calcule en minutes après Maghrib. */
  isha: number | null;
  /** Minutes après Maghrib, quand `isha` est `null`. */
  ishaMinutes?: number;
}

export const METHODS: Record<MethodId, CalcMethod> = {
  MWL: { id: 'MWL', name: 'Ligue islamique mondiale', fajr: 18, isha: 17 },
  UOIF: { id: 'UOIF', name: 'UOIF (France)', fajr: 12, isha: 12 },
  ISNA: { id: 'ISNA', name: 'Amérique du Nord (ISNA)', fajr: 15, isha: 15 },
  EGYPT: { id: 'EGYPT', name: 'Autorité générale égyptienne', fajr: 19.5, isha: 17.5 },
  MAKKAH: { id: 'MAKKAH', name: 'Oumm al-Qora (La Mecque)', fajr: 18.5, isha: null, ishaMinutes: 90 },
  KARACHI: { id: 'KARACHI', name: 'Université de Karachi', fajr: 18, isha: 18 },
};

export const METHOD_IDS = Object.keys(METHODS) as MethodId[];

export const isMethodId = (value: unknown): value is MethodId =>
  typeof value === 'string' && value in METHODS;

/** Méthode proposée par défaut selon le pays (modifiable dans les paramètres). */
export function defaultMethodForCountry(code: string | null): MethodId {
  switch (code) {
    case 'SA':
      return 'MAKKAH';
    case 'EG':
      return 'EGYPT';
    case 'PK':
    case 'IN':
    case 'BD':
      return 'KARACHI';
    case 'US':
    case 'CA':
      return 'ISNA';
    default:
      return 'MWL';
  }
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

/** Les 5 prières obligatoires, dans l'ordre de la journée. */
export const PRAYER_KEYS: Exclude<PrayerKey, 'sunrise'>[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export type TimesInHours = Record<PrayerKey, number>;

// --- Trigonométrie en degrés ---
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const sin = (d: number) => Math.sin(rad(d));
const cos = (d: number) => Math.cos(rad(d));
const tan = (d: number) => Math.tan(rad(d));
const arcsin = (x: number) => deg(Math.asin(x));
const arccos = (x: number) => deg(Math.acos(x));
const arctan2 = (y: number, x: number) => deg(Math.atan2(y, x));
const arccot = (x: number) => deg(Math.atan(1 / x));

const fix = (a: number, b: number) => {
  const r = a - b * Math.floor(a / b);
  return r < 0 ? r + b : r;
};
const fixAngle = (a: number) => fix(a, 360);
const fixHour = (a: number) => fix(a, 24);

/** Jour julien à 0 h UT. `month` va de 1 à 12. */
function julian(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

/** Déclinaison du soleil (degrés) et équation du temps (heures, entre -12 et 12). */
function sunPosition(jd: number) {
  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const l = fixAngle(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
  const e = 23.439 - 0.00000036 * d;
  const ra = fixHour(arctan2(cos(e) * sin(l), cos(l)) / 15);
  // Ramené dans [-12 ; 12[ pour éviter un saut de 24 h quand q passe par 0°.
  const equation = fixHour(q / 15 - ra + 12) - 12;
  return { declination: arcsin(sin(e) * sin(l)), equation };
}

/** Altitude conventionnelle du soleil au lever et au coucher (réfraction et rayon solaire). */
const RISE_SET_ANGLE = 0.833;

/**
 * Heures de la journée `year-month-day` (`month` de 1 à 12) pour une position, en heures
 * décimales dans le fuseau `timeZone` (décalage en heures par rapport à UTC).
 * Une valeur vaut `NaN` quand l'événement n'existe pas (soleil de minuit, nuit polaire).
 */
export function computeTimeHours(
  year: number,
  month: number,
  day: number,
  coords: Coordinates,
  method: CalcMethod,
  asrFactor: 1 | 2,
  timeZone: number,
): TimesInHours {
  const { lat, lon } = coords;
  const jd = julian(year, month, day) - lon / (15 * 24);

  const midDay = (t: number) => fixHour(12 - sunPosition(jd + t).equation);
  const angleTime = (angle: number, t: number, ccw: boolean) => {
    const decl = sunPosition(jd + t).declination;
    const noon = midDay(t);
    const x = (-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat));
    return noon + (arccos(x) / 15) * (ccw ? -1 : 1);
  };
  const asrTime = (factor: number, t: number) => {
    const decl = sunPosition(jd + t).declination;
    return angleTime(-arccot(factor + tan(Math.abs(lat - decl))), t, false);
  };

  // Première estimation (en fractions de jour), comme dans l'algorithme d'origine.
  const t = { fajr: 5 / 24, sunrise: 6 / 24, dhuhr: 12 / 24, asr: 13 / 24, sunset: 18 / 24, isha: 18 / 24 };

  let fajr = angleTime(method.fajr, t.fajr, true);
  let sunrise = angleTime(RISE_SET_ANGLE, t.sunrise, true);
  let dhuhr = midDay(t.dhuhr);
  let asr = asrTime(asrFactor, t.asr);
  let sunset = angleTime(RISE_SET_ANGLE, t.sunset, false);
  let isha = method.isha === null ? NaN : angleTime(method.isha, t.isha, false);

  // Passage en heure locale du fuseau.
  const shift = timeZone - lon / 15;
  fajr += shift;
  sunrise += shift;
  dhuhr += shift;
  asr += shift;
  sunset += shift;
  isha += shift;

  // Hautes latitudes : si l'angle n'est jamais atteint (ou trop loin), on limite à une part de la nuit.
  const night = fixHour(sunrise - sunset);
  if (method.isha !== null) {
    const portion = method.isha / 60;
    if (Number.isNaN(isha) || fixHour(isha - sunset) > portion * night) isha = sunset + portion * night;
  }
  const fajrPortion = method.fajr / 60;
  if (Number.isNaN(fajr) || fixHour(sunrise - fajr) > fajrPortion * night) {
    fajr = sunrise - fajrPortion * night;
  }
  if (method.isha === null) isha = sunset + (method.ishaMinutes ?? 90) / 60;

  return { fajr, sunrise, dhuhr, asr, maghrib: sunset, isha };
}

export interface CalcOptions {
  method: MethodId;
  /** Ombre de l'objet égale à sa taille (1, majorité des écoles) ou au double (2, école hanafite). */
  asr?: 1 | 2;
  /** Décalage horaire en heures ; par défaut, celui de l'appareil à cette date. */
  timeZone?: number;
}

export type PrayerTimes = Record<PrayerKey, Date | null>;

/** Heures de la journée de `date` (calendrier local), sous forme de dates. `null` si indéterminé. */
export function computePrayerTimes(date: Date, coords: Coordinates, options: CalcOptions): PrayerTimes {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const timeZone = options.timeZone ?? -new Date(y, m, d, 12).getTimezoneOffset() / 60;
  const hours = computeTimeHours(y, m + 1, d, coords, METHODS[options.method], options.asr ?? 1, timeZone);

  const toDate = (h: number): Date | null =>
    Number.isFinite(h) ? new Date(y, m, d, 0, Math.round(h * 60)) : null;

  return {
    fajr: toDate(hours.fajr),
    sunrise: toDate(hours.sunrise),
    dhuhr: toDate(hours.dhuhr),
    asr: toDate(hours.asr),
    maghrib: toDate(hours.maghrib),
    isha: toDate(hours.isha),
  };
}

/** « 05:48 » (heure locale de l'appareil). */
export function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export interface NextPrayer {
  id: Exclude<PrayerKey, 'sunrise'>;
  time: Date;
}

/** Prochaine prière après `now`, en regardant jusqu'à demain. `null` si aucune n'est calculable. */
export function nextPrayer(now: Date, coords: Coordinates, options: CalcOptions): NextPrayer | null {
  for (let offset = 0; offset <= 1; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const times = computePrayerTimes(day, coords, options);
    for (const id of PRAYER_KEYS) {
      const time = times[id];
      if (time && time.getTime() > now.getTime()) return { id, time };
    }
  }
  return null;
}
