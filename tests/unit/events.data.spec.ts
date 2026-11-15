import { EVENTS, eventById } from '../../src/data/events';

describe('événements', () => {
  it('cinq événements, identifiants uniques', () => {
    expect(EVENTS.map((e) => e.id)).toEqual(['aid-al-fitr', 'aid-al-adha', 'mariage', 'naissance', 'deces']);
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(EVENTS.length);
  });
  it('chaque événement décrit rituel, pratiques et invocations', () => {
    for (const e of EVENTS) {
      expect(e.intro.length).toBeGreaterThan(40);
      expect(e.sections.length).toBeGreaterThanOrEqual(3);
      const duas = e.sections.flatMap((s) => s.duas ?? []);
      expect(duas.length).toBeGreaterThan(0);
      for (const s of e.sections) {
        expect(s.title.length).toBeGreaterThan(2);
        expect((s.paragraphs?.length ?? 0) + (s.bullets?.length ?? 0) + (s.duas?.length ?? 0)).toBeGreaterThan(0);
      }
      for (const d of duas) {
        expect(d.arabic).toMatch(/[؀-ۿ]/);
        expect(d.french.length).toBeGreaterThan(10);
        expect(d.source.length).toBeGreaterThan(3);
      }
    }
  });
  it('les deux Aïd ont une date hégirienne', () => {
    expect(eventById('aid-al-fitr')!.hijri).toMatchObject({ month: 10, day: 1 });
    expect(eventById('aid-al-adha')!.hijri).toMatchObject({ month: 12, day: 10 });
    expect(eventById('mariage')!.hijri).toBeUndefined();
  });
  it('toute rubrique renvoie une sunna ou un conseil (puces)', () => {
    for (const e of EVENTS) expect(e.sections.some((s) => (s.bullets?.length ?? 0) > 0)).toBe(true);
  });
  it('événement inconnu', () => {
    expect(eventById('x')).toBeUndefined();
  });
});
