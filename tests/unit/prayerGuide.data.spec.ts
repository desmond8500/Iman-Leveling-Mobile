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
