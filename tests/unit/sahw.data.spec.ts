import { IMAM_RULES, isSchoolId, SAHW_BASICS, SAHW_CASES, SCHOOLS, sahwSteps, sahwTiming, type SahwKind } from '../../src/data/sahw';

describe('prosternations de l’oubli', () => {
  it('quatre écoles, identifiants reconnus', () => {
    expect(SCHOOLS.map((s) => s.id)).toEqual(['maliki', 'hanafi', 'shafii', 'hanbali']);
    for (const s of SCHOOLS) expect(isSchoolId(s.id)).toBe(true);
    expect(isSchoolId('autre')).toBe(false);
  });

  it('moment des prosternations selon l’école', () => {
    // Malikites : manque avant, ajout après.
    expect(sahwTiming('manque', 'maliki')).toBe('avant');
    expect(sahwTiming('ajout', 'maliki')).toBe('apres');
    expect(sahwTiming('doute-certitude', 'maliki')).toBe('apres');
    // Hanafites : toujours après ; chafiites : toujours avant.
    for (const k of ['manque', 'ajout', 'salam-tot', 'doute-certitude', 'doute-penchant'] as SahwKind[]) {
      expect(sahwTiming(k, 'hanafi')).toBe('apres');
      expect(sahwTiming(k, 'shafii')).toBe('avant');
    }
    // Hanbalites : avant, sauf salam trop tôt et doute avec penchant.
    expect(sahwTiming('manque', 'hanbali')).toBe('avant');
    expect(sahwTiming('salam-tot', 'hanbali')).toBe('apres');
    expect(sahwTiming('doute-penchant', 'hanbali')).toBe('apres');
    expect(sahwTiming('doute-certitude', 'hanbali')).toBe('avant');
  });

  it('pas de prosternation ou prière à recommencer : même réponse partout', () => {
    for (const s of SCHOOLS) {
      expect(sahwTiming('aucune', s.id)).toBe('aucune');
      expect(sahwTiming('recommencer', s.id)).toBe('recommencer');
    }
  });

  it('chaque cas est complet', () => {
    const ids = new Set<string>();
    for (const c of SAHW_CASES) {
      expect(ids.has(c.id)).toBe(false);
      ids.add(c.id);
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.situation.length).toBeGreaterThan(0);
      expect(c.fix.length).toBeGreaterThan(0);
      expect(c.source.length).toBeGreaterThan(0);
    }
    expect(SAHW_CASES.length).toBeGreaterThanOrEqual(6);
    expect(SAHW_BASICS.length).toBeGreaterThan(0);
    expect(IMAM_RULES.length).toBeGreaterThan(0);
  });

  it('déroulé : deux prosternations et un salam final', () => {
    for (const s of SCHOOLS) {
      for (const t of ['avant', 'apres'] as const) {
        const steps = sahwSteps(t, s.id);
        expect(steps.filter((x) => x.title.includes('prosternation'))).toHaveLength(2);
        expect(steps[steps.length - 1].title).toBe('Salam');
      }
    }
    // Hanafites : un seul salam à droite avant les prosternations.
    expect(sahwSteps('apres', 'hanafi')[0].title).toBe('Un salam');
  });
});
