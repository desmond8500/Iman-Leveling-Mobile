/*
 * Calendrier musulman (hégirien). Le calendrier d'Oumm al-Qora (Arabie saoudite) est calculé
 * à l'avance : il peut différer d'un jour de l'observation locale de la lune. Si le moteur du
 * navigateur ne le connaît pas, on se rabat sur le calendrier arithmétique (tabulaire).
 */

export interface HijriDate {
  year: number;
  /** De 1 (Mouharram) à 12 (Dhou al-hijja). */
  month: number;
  day: number;
}

export const HIJRI_MONTHS = [
  'Mouharram',
  'Safar',
  "Rabi' al-awwal",
  "Rabi' ath-thani",
  'Joumada al-oula',
  'Joumada ath-thania',
  'Rajab',
  "Cha'ban",
  'Ramadan',
  'Chawwal',
  "Dhou al-qi'da",
  'Dhou al-hijja',
] as const;

export const RAMADAN = 9;

/** Jour julien (entier) d'une date grégorienne du calendrier local, à midi. */
function julianDay(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

/** Calendrier arithmétique (années de 354 ou 355 jours, cycle de 30 ans). */
export function tabularHijri(date: Date): HijriDate {
  const jd = julianDay(date);
  const days = jd - 1948440 + 10632; // 1948440 = 1er Mouharram 1 AH (16 juillet 622, civil)
  const n = Math.floor((days - 1) / 10631);
  const rest = days - 10631 * n + 354;
  const j =
    Math.floor((10985 - rest) / 5316) * Math.floor((50 * rest) / 17719) +
    Math.floor(rest / 5670) * Math.floor((43 * rest) / 15238);
  const rest2 = rest - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * rest2) / 709);
  const day = rest2 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

let formatter: Intl.DateTimeFormat | null | undefined;

function umalquraFormatter(): Intl.DateTimeFormat | null {
  if (formatter !== undefined) return formatter;
  try {
    const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
    // Vérifie que le calendrier est bien reconnu (sinon le moteur renvoie une année grégorienne).
    const year = Number(f.formatToParts(new Date(2026, 5, 15)).find((p) => p.type === 'year')?.value);
    formatter = year > 1400 && year < 1500 ? f : null;
  } catch {
    formatter = null;
  }
  return formatter;
}

export function toHijri(date: Date): HijriDate {
  const f = umalquraFormatter();
  if (f) {
    const parts = f.formatToParts(date);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const result = { year: get('year'), month: get('month'), day: get('day') };
    if (Object.values(result).every(Number.isFinite)) return result;
  }
  return tabularHijri(date);
}

export const hijriMonthName = (month: number) => HIJRI_MONTHS[month - 1] ?? '';

/** « 1 Joumada al-oula 1448 » */
export function formatHijri(h: HijriDate): string {
  return `${h.day} ${hijriMonthName(h.month)} ${h.year}`;
}

/** Mois hégiriens couverts par un mois grégorien, ex. « Rajab – Cha'ban 1447 ». */
export function hijriRangeLabel(year: number, month: number): string {
  const first = toHijri(new Date(year, month, 1));
  const last = toHijri(new Date(year, month + 1, 0));
  if (first.month === last.month) return `${hijriMonthName(first.month)} ${first.year}`;
  if (first.year === last.year) return `${hijriMonthName(first.month)} – ${hijriMonthName(last.month)} ${first.year}`;
  return `${hijriMonthName(first.month)} ${first.year} – ${hijriMonthName(last.month)} ${last.year}`;
}
