import { FARD_RAKAAT, PRAYER_STEPS, WUDU_STEPS } from '../../src/data/prayerGuide';
import { PRAYERS } from '../../src/data/prayers';

describe('guide de la prière', () => {
  it('17 rak\'ahs obligatoires par jour', () => {
    expect(Object.values(FARD_RAKAAT).reduce((a, b) => a + b, 0)).toBe(17);
  });
  it('couvre chaque prière', () => {
    for (const p of PRAYERS) expect(FARD_RAKAAT[p.id]).toBeGreaterThan(0);
  });
  it('étapes renseignées', () => {
    for (const s of [...WUDU_STEPS, ...PRAYER_STEPS]) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.text.length).toBeGreaterThan(0);
    }
    expect(WUDU_STEPS).toHaveLength(8);
  });
});

import { AFTER_PRAYER_INVOCATIONS, WUDU_INVOCATIONS } from '../../src/data/prayerGuide';

describe('invocations de la prière', () => {
  it('chaque invocation a arabe, phonétique, français et source', () => {
    const all = [...WUDU_INVOCATIONS, ...AFTER_PRAYER_INVOCATIONS];
    for (const i of all) {
      expect(i.arabic).toMatch(/[؀-ۿ]/);
      expect(i.phonetic.length).toBeGreaterThan(3);
      expect(i.french.length).toBeGreaterThan(3);
      expect(i.source.length).toBeGreaterThan(0);
    }
    expect(new Set(all.map((i) => i.id)).size).toBe(all.length);
  });
  it('couvre avant et après les ablutions, et la fin de prière', () => {
    expect(WUDU_INVOCATIONS.map((i) => i.id)).toEqual(['wudu-before', 'wudu-after']);
    expect(AFTER_PRAYER_INVOCATIONS.length).toBeGreaterThanOrEqual(4);
  });
});
