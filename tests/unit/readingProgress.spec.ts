import { createPinia, setActivePinia } from 'pinia';
import { useReadingStore } from '@/stores/reading';
import {
  addRange,
  countRanges,
  emptyReading,
  markRead,
  monthKeyOf,
  monthlyGoal,
  sanitizeReading,
  setBookmark,
  versesReadInMonth,
} from '../../src/utils/readingProgress';

describe('addRange', () => {
  it('ajoute et fusionne les plages qui se touchent ou se chevauchent', () => {
    expect(addRange([], 1, 5)).toEqual([[1, 5]]);
    expect(addRange([[1, 5]], 6, 8)).toEqual([[1, 8]]);
    expect(addRange([[1, 5]], 3, 9)).toEqual([[1, 9]]);
    expect(addRange([[1, 5], [10, 12]], 6, 9)).toEqual([[1, 12]]);
    expect(addRange([[1, 5]], 8, 9)).toEqual([[1, 5], [8, 9]]);
    expect(addRange([[10, 12]], 1, 2)).toEqual([[1, 2], [10, 12]]);
    expect(addRange([[1, 5]], 5, 1)).toEqual([[1, 5]]);
  });
  it('ne compte pas deux fois un verset relu', () => {
    const r = addRange(addRange([], 1, 10), 5, 12);
    expect(countRanges(r)).toBe(12);
  });
});

describe('markRead / setBookmark', () => {
  it('compte les versets du mois, sourate par sourate', () => {
    let d = emptyReading();
    d = markRead(d, '2026-11', 1, 1, 7);
    d = markRead(d, '2026-11', 112, 1, 4);
    d = markRead(d, '2026-10', 2, 1, 50);
    expect(versesReadInMonth(d, '2026-11')).toBe(11);
    expect(versesReadInMonth(d, '2026-10')).toBe(50);
    expect(versesReadInMonth(d, '2026-09')).toBe(0);
  });
  it('limite aux versets qui existent', () => {
    expect(versesReadInMonth(markRead(emptyReading(), '2026-11', 112, 1, 999), '2026-11')).toBe(4);
    expect(markRead(emptyReading(), '2026-11', 115, 1, 3)).toEqual(emptyReading());
    expect(markRead(emptyReading(), '2026-11', 112, 9, 12)).toEqual(emptyReading());
  });
  it('marque-page valide uniquement', () => {
    expect(setBookmark(emptyReading(), 18, 45).bookmark).toEqual({ surah: 18, verse: 45 });
    expect(setBookmark(emptyReading(), 18, 111).bookmark).toBeNull();
    expect(setBookmark(emptyReading(), 0, 1).bookmark).toBeNull();
  });
});

describe('monthlyGoal', () => {
  it('objectif : tout le Coran dans le mois', () => {
    const g = monthlyGoal(emptyReading(), '2026-11-10');
    expect(g.total).toBe(6236);
    expect(g.read).toBe(0);
    expect(g.daysLeft).toBe(21); // 30 novembre - 10 + 1
    expect(g.perDay).toBe(Math.ceil(6236 / 21));
  });
  it('pourcentage et reste à lire', () => {
    const d = markRead(emptyReading(), '2026-11', 2, 1, 286);
    const g = monthlyGoal(d, '2026-11-30');
    expect(g.read).toBe(286);
    expect(g.remaining).toBe(6236 - 286);
    expect(g.percent).toBe(4);
    expect(g.daysLeft).toBe(1);
  });
  it('objectif atteint : plus rien à lire par jour', () => {
    let d = emptyReading();
    for (let s = 1; s <= 114; s++) d = markRead(d, '2026-11', s, 1, 999);
    expect(monthlyGoal(d, '2026-11-15')).toMatchObject({ read: 6236, remaining: 0, perDay: 0, percent: 100 });
  });
  it('clé du mois', () => {
    expect(monthKeyOf('2026-11-09')).toBe('2026-11');
  });
});

describe('sanitizeReading', () => {
  it('ignore les données invalides', () => {
    expect(sanitizeReading(null)).toEqual(emptyReading());
    expect(sanitizeReading({ bookmark: { surah: 'x' }, months: 5 })).toEqual(emptyReading());
    const d = sanitizeReading({
      bookmark: { surah: 18, verse: 45 },
      months: { '2026-11': { '1': [[1, 7], 'x', [3]] }, mauvais: { '1': [[1, 2]] } },
    });
    expect(d.bookmark).toEqual({ surah: 18, verse: 45 });
    expect(versesReadInMonth(d, '2026-11')).toBe(7);
    expect(Object.keys(d.months)).toEqual(['2026-11']);
  });
});

describe('reading store', () => {
  it('enregistre la lecture, la relit au démarrage', async () => {
    setActivePinia(createPinia());
    const a = useReadingStore();
    await a.load();
    expect(a.bookmark).toBeNull();
    await a.record(18, 20, 1, 19);
    expect(a.bookmark).toEqual({ surah: 18, verse: 20 });
    expect(a.goal.read).toBe(19);
    expect(a.readInSurah(18)).toBe(19);

    setActivePinia(createPinia());
    const b = useReadingStore();
    await b.load();
    expect(b.bookmark).toEqual({ surah: 18, verse: 20 });
    expect(b.goal.read).toBe(19);
  });

  it('un simple marque-page ne compte aucun verset lu', async () => {
    setActivePinia(createPinia());
    const store = useReadingStore();
    await store.load();
    const before = store.goal.read;
    await store.record(112, 3, 3, 2);
    expect(store.bookmark).toEqual({ surah: 112, verse: 3 });
    expect(store.goal.read).toBe(before);
  });
});
