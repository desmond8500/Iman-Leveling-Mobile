import type { Prayer } from '@/types';

export const PRAYERS: Prayer[] = [
  { id: 'fajr', name: 'Fajr', arabic: 'الفجر', hint: 'Aube' },
  { id: 'dhuhr', name: 'Dhuhr', arabic: 'الظهر', hint: 'Midi' },
  { id: 'asr', name: 'Asr', arabic: 'العصر', hint: 'Après-midi' },
  { id: 'maghrib', name: 'Maghrib', arabic: 'المغرب', hint: 'Coucher du soleil' },
  { id: 'isha', name: 'Isha', arabic: 'العشاء', hint: 'Nuit' },
];
