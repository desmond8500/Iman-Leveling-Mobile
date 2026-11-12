import type { Prayer, Sunnah } from '@/types';

/*
 * Les nombres de rak'ahs des sunnas varient selon les écoles juridiques ;
 * cette liste suit l'usage le plus courant et pourra devenir configurable.
 */
export const PRAYERS: Prayer[] = [
  {
    id: 'fajr',
    name: 'Soubh',
    arabic: 'الصبح',
    hint: 'Aube',
    before: [{ id: 'fajr-before', name: 'Sunna de Fajr', rakaat: 2 }],
    after: [],
  },
  {
    id: 'dhuhr',
    name: 'Dhuhr',
    arabic: 'الظهر',
    hint: 'Midi',
    before: [{ id: 'dhuhr-before', name: 'Sunna avant Dhuhr', rakaat: 4 }],
    after: [{ id: 'dhuhr-after', name: 'Sunna après Dhuhr', rakaat: 2 }],
  },
  {
    id: 'asr',
    name: 'Asr',
    arabic: 'العصر',
    hint: 'Après-midi',
    before: [{ id: 'asr-before', name: 'Sunna avant Asr', rakaat: 4 }],
    after: [],
  },
  {
    id: 'maghrib',
    name: 'Maghrib',
    arabic: 'المغرب',
    hint: 'Coucher du soleil',
    before: [],
    after: [{ id: 'maghrib-after', name: 'Sunna après Maghrib', rakaat: 2 }],
  },
  {
    id: 'isha',
    name: 'Isha',
    arabic: 'العشاء',
    hint: 'Nuit',
    before: [],
    after: [
      { id: 'isha-after', name: 'Sunna après Isha', rakaat: 2 },
      { id: 'witr', name: 'Witr', rakaat: 1 },
    ],
  },
];

export const ALL_SUNNAH: Sunnah[] = PRAYERS.flatMap((p) => [...p.before, ...p.after]);
