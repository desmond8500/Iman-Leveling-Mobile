import {
  METHODS,
  METHOD_IDS,
  PRAYER_KEYS,
  computePrayerTimes,
  computeTimeHours,
  defaultMethodForCountry,
  currentPrayerWindow,
  formatTime,
  prayerWindows,
  isMethodId,
  nextPrayer,
} from '../../src/utils/prayerTimes';

const hm = (h: number) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
/** Heures décimales -> minutes depuis minuit. */
const minutes = (h: number) => h * 60;

describe('computeTimeHours : cas dont les valeurs sont connues', () => {
  it('équateur à l\'équinoxe : lever vers 6 h, Asr à 3 h après midi, Fajr environ 69 min avant le lever', () => {
    const t = computeTimeHours(2026, 3, 20, { lat: 0, lon: 0 }, METHODS.MWL, 1, 0);
    // Midi solaire : 12 h 07 (équation du temps d'environ -7 min).
    expect(Math.abs(minutes(t.dhuhr) - (12 * 60 + 7))).toBeLessThan(4);
    // Lever et coucher à ±6 h 03 de midi (altitude -0,833°).
    expect(Math.abs(minutes(t.dhuhr - t.sunrise) - 363)).toBeLessThan(4);
    expect(Math.abs(minutes(t.maghrib - t.dhuhr) - 363)).toBeLessThan(4);
    // Asr (ombre = taille) : soleil à 45° de hauteur, soit 3 h après midi.
    expect(Math.abs(minutes(t.asr - t.dhuhr) - 180)).toBeLessThan(6);
    // Fajr à 18° : (18 - 0,833) / 15 h avant le lever = environ 68,7 min.
    expect(Math.abs(minutes(t.sunrise - t.fajr) - 68.7)).toBeLessThan(3);
    // Isha à 17° : environ 64,7 min après le coucher.
    expect(Math.abs(minutes(t.isha - t.maghrib) - 64.7)).toBeLessThan(3);
  });

  it('La Mecque, 10 novembre 2026 (UTC+3) : Dhuhr vers 12 h 04', () => {
    const t = computeTimeHours(2026, 11, 10, { lat: 21.4225, lon: 39.8262 }, METHODS.MAKKAH, 1, 3);
    expect(Math.abs(minutes(t.dhuhr) - (12 * 60 + 4))).toBeLessThan(4);
    expect(t.fajr).toBeLessThan(t.sunrise);
  });

  it('Paris, solstice d\'été 2026 (UTC+2) : lever 5 h 47, midi 13 h 52, coucher 21 h 58', () => {
    const t = computeTimeHours(2026, 6, 21, { lat: 48.8566, lon: 2.3522 }, METHODS.MWL, 1, 2);
    expect(Math.abs(minutes(t.sunrise) - (5 * 60 + 47))).toBeLessThan(5);
    expect(Math.abs(minutes(t.dhuhr) - (13 * 60 + 52))).toBeLessThan(4);
    expect(Math.abs(minutes(t.maghrib) - (21 * 60 + 58))).toBeLessThan(5);
  });

  it('garde les heures dans l\'ordre de la journée', () => {
    const cases = [
      { lat: 48.8566, lon: 2.3522, tz: 1, m: 11 },
      { lat: 14.6928, lon: -17.4467, tz: 0, m: 11 }, // Dakar
      { lat: 40.7128, lon: -74.006, tz: -5, m: 11 }, // New York
      { lat: -33.8688, lon: 151.2093, tz: 11, m: 12 }, // Sydney
    ];
    for (const c of cases) {
      const t = computeTimeHours(2026, c.m, 10, { lat: c.lat, lon: c.lon }, METHODS.MWL, 1, c.tz);
      const order = [t.fajr, t.sunrise, t.dhuhr, t.asr, t.maghrib, t.isha];
      expect(order.every(Number.isFinite)).toBe(true);
      expect([...order].sort((a, b) => a - b)).toEqual(order);
    }
  });
});

describe('computeTimeHours : méthodes et cas limites', () => {
  const paris = { lat: 48.8566, lon: 2.3522 };

  it('Asr est plus tard avec l\'ombre double (école hanafite)', () => {
    const a = computeTimeHours(2026, 11, 10, paris, METHODS.MWL, 1, 1);
    const b = computeTimeHours(2026, 11, 10, paris, METHODS.MWL, 2, 1);
    expect(b.asr).toBeGreaterThan(a.asr);
  });

  it('Oumm al-Qora : Isha est 90 minutes après Maghrib', () => {
    const t = computeTimeHours(2026, 11, 10, { lat: 21.4225, lon: 39.8262 }, METHODS.MAKKAH, 1, 3);
    expect(minutes(t.isha - t.maghrib)).toBeCloseTo(90, 5);
  });

  it('un angle plus grand donne un Fajr plus tôt (UOIF 12° puis MWL 18°)', () => {
    const uoif = computeTimeHours(2026, 11, 10, paris, METHODS.UOIF, 1, 1);
    const mwl = computeTimeHours(2026, 11, 10, paris, METHODS.MWL, 1, 1);
    expect(mwl.fajr).toBeLessThan(uoif.fajr);
    expect(mwl.isha).toBeGreaterThan(uoif.isha);
  });

  it('hautes latitudes : Paris au solstice (soleil jamais à -18°) donne quand même Fajr et Isha', () => {
    const t = computeTimeHours(2026, 6, 21, paris, METHODS.MWL, 1, 2);
    expect(Number.isFinite(t.fajr)).toBe(true);
    expect(Number.isFinite(t.isha)).toBe(true);
    expect(t.fajr).toBeLessThan(t.sunrise);
    expect(t.isha).toBeGreaterThan(t.maghrib);
  });

  it('soleil de minuit : pas de lever ni de coucher (NaN)', () => {
    const t = computeTimeHours(2026, 6, 21, { lat: 80, lon: 10 }, METHODS.MWL, 1, 2);
    expect(Number.isNaN(t.sunrise)).toBe(true);
    expect(Number.isNaN(t.maghrib)).toBe(true);
  });

  it('reste stable autour de l\'équinoxe de mars (là où la longitude moyenne repasse par 0°)', () => {
    for (let day = 15; day <= 25; day++) {
      const t = computeTimeHours(2026, 3, day, { lat: 0, lon: 0 }, METHODS.MWL, 1, 0);
      expect(t.dhuhr).toBeGreaterThan(12.0);
      expect(t.dhuhr).toBeLessThan(12.25);
    }
  });
});

describe('computePrayerTimes', () => {
  const dakar = { lat: 14.6928, lon: -17.4467 };
  const day = new Date(2026, 10, 10, 15, 0);

  it('renvoie des dates du jour demandé, dans l\'ordre', () => {
    const times = computePrayerTimes(day, dakar, { method: 'MWL' });
    const dates = [times.fajr, times.sunrise, times.dhuhr, times.asr, times.maghrib, times.isha];
    expect(dates.every((d) => d instanceof Date)).toBe(true);
    for (const d of dates) {
      expect(d!.getFullYear()).toBe(2026);
      expect(d!.getMonth()).toBe(10);
      expect(d!.getDate()).toBe(10);
    }
    const stamps = dates.map((d) => d!.getTime());
    expect([...stamps].sort((a, b) => a - b)).toEqual(stamps);
  });

  it('arrondit à la minute', () => {
    const times = computePrayerTimes(day, dakar, { method: 'MWL' });
    for (const key of PRAYER_KEYS) {
      expect(times[key]!.getSeconds()).toBe(0);
      expect(times[key]!.getMilliseconds()).toBe(0);
    }
  });

  it('renvoie null quand le lever n\'existe pas', () => {
    const times = computePrayerTimes(new Date(2026, 5, 21), { lat: 80, lon: 10 }, { method: 'MWL' });
    expect(times.sunrise).toBeNull();
  });
});

describe('formatTime', () => {
  it('met sur deux chiffres', () => {
    expect(formatTime(new Date(2026, 0, 1, 5, 8))).toBe('05:08');
    expect(formatTime(new Date(2026, 0, 1, 17, 30))).toBe('17:30');
    expect(hm(5.1333)).toBe('05:08');
  });
});

describe('nextPrayer', () => {
  const coords = { lat: 14.6928, lon: -17.4467 };
  const opts = { method: 'MWL' as const };
  const today = new Date(2026, 10, 10);
  const times = computePrayerTimes(today, coords, opts);
  const minus = (d: Date, min: number) => new Date(d.getTime() - min * 60000);
  const plus = (d: Date, min: number) => new Date(d.getTime() + min * 60000);

  it('avant Fajr : c\'est Fajr', () => {
    expect(nextPrayer(minus(times.fajr!, 5), coords, opts)?.id).toBe('fajr');
  });

  it('entre deux prières : la suivante', () => {
    expect(nextPrayer(plus(times.fajr!, 1), coords, opts)?.id).toBe('dhuhr');
    expect(nextPrayer(plus(times.dhuhr!, 1), coords, opts)?.id).toBe('asr');
    expect(nextPrayer(plus(times.asr!, 1), coords, opts)?.id).toBe('maghrib');
    expect(nextPrayer(plus(times.maghrib!, 1), coords, opts)?.id).toBe('isha');
  });

  it('après Isha : Fajr de demain', () => {
    const next = nextPrayer(plus(times.isha!, 1), coords, opts)!;
    expect(next.id).toBe('fajr');
    expect(next.time.getDate()).toBe(11);
  });

  it('à l\'heure pile, la prière est déjà passée', () => {
    expect(nextPrayer(times.dhuhr!, coords, opts)?.id).toBe('asr');
  });
});

describe('méthodes', () => {
  it('propose une méthode par pays, MWL par défaut', () => {
    expect(defaultMethodForCountry('SA')).toBe('MAKKAH');
    expect(defaultMethodForCountry('EG')).toBe('EGYPT');
    expect(defaultMethodForCountry('PK')).toBe('KARACHI');
    expect(defaultMethodForCountry('US')).toBe('ISNA');
    expect(defaultMethodForCountry('FR')).toBe('MWL');
    expect(defaultMethodForCountry(null)).toBe('MWL');
  });

  it('reconnaît les identifiants valides', () => {
    expect(METHOD_IDS.every(isMethodId)).toBe(true);
    expect(isMethodId('XXX')).toBe(false);
    expect(isMethodId(undefined)).toBe(false);
  });
});

describe('temps de validité', () => {
  const coords = { lat: 14.6928, lon: -17.4467 };
  const opts = { method: 'MWL' as const };
  const day = new Date(2026, 10, 10);
  const times = computePrayerTimes(day, coords, opts);
  const windows = prayerWindows(day, coords, opts);

  it('chaque prière dure jusqu\'au début de la suivante (Soubh jusqu\'au lever)', () => {
    expect(windows.fajr!.end.getTime()).toBe(times.sunrise!.getTime());
    expect(windows.dhuhr!.end.getTime()).toBe(times.asr!.getTime());
    expect(windows.asr!.end.getTime()).toBe(times.maghrib!.getTime());
    expect(windows.maghrib!.end.getTime()).toBe(times.isha!.getTime());
  });
  it('Isha va jusqu\'au Soubh du lendemain', () => {
    const tomorrow = computePrayerTimes(new Date(2026, 10, 11), coords, opts);
    expect(windows.isha!.end.getTime()).toBe(tomorrow.fajr!.getTime());
  });
  it('trouve la prière en cours', () => {
    const at = new Date(times.dhuhr!.getTime() + 60000);
    expect(currentPrayerWindow(at, coords, opts)?.id).toBe('dhuhr');
    // Entre le lever du soleil et Dhuhr : aucune prière obligatoire en cours.
    const gap = new Date(times.sunrise!.getTime() + 60000);
    expect(currentPrayerWindow(gap, coords, opts)).toBeNull();
  });
  it('après minuit, Isha de la veille est encore en cours', () => {
    const lateNight = new Date(2026, 10, 11, 0, 30);
    expect(currentPrayerWindow(lateNight, coords, opts)?.id).toBe('isha');
  });
});
