import {
  computeEstate, computeShares, distribute, emptyHeirs, fracText, fracValue, sanitizeHeirs, type Heirs, type HeirId,
} from '../../src/utils/inheritance';

const heirs = (patch: Partial<Heirs>): Heirs => ({ ...emptyHeirs(patch.deceased ?? 'male'), ...patch });
const shareMap = (patch: Partial<Heirs>) => {
  const r = computeShares(heirs(patch));
  return { r, m: Object.fromEntries(r.shares.map((s) => [s.id, fracText(s.fraction)])) as Partial<Record<HeirId, string>> };
};
const total = (patch: Partial<Heirs>) => computeShares(heirs(patch)).shares.reduce((s, x) => s + fracValue(x.fraction), 0);

describe('parts fixes et résidu', () => {
  it('mari + fille + père : 1/4, 1/2, père 1/6 + reste = 1/4', () => {
    const { m } = shareMap({ deceased: 'female', husband: true, daughters: 1, father: true });
    expect(m).toEqual({ husband: '1/4', daughters: '1/2', father: '1/4' });
  });
  it('fils + fille : le fils a le double', () => {
    expect(shareMap({ sons: 1, daughters: 1 }).m).toEqual({ sons: '2/3', daughters: '1/3' });
    expect(shareMap({ sons: 2, daughters: 1 }).m).toEqual({ sons: '4/5', daughters: '1/5' });
  });
  it('deux filles + père + mère : 2/3, 1/6, 1/6', () => {
    expect(shareMap({ daughters: 2, father: true, mother: true }).m).toEqual({ daughters: '2/3', father: '1/6', mother: '1/6' });
  });
  it('épouses : 1/4 sans enfant, 1/8 avec enfants, partagé entre elles', () => {
    expect(shareMap({ wives: 2, father: true }).m).toEqual({ wives: '1/4', father: '3/4' });
    expect(shareMap({ wives: 2, sons: 1 }).m).toEqual({ wives: '1/8', sons: '7/8' });
  });
  it('mère : 1/3 seule, 1/6 avec deux frères et sœurs', () => {
    expect(shareMap({ mother: true, fullBrothers: 1 }).m).toEqual({ mother: '1/3', fullBrothers: '2/3' });
    expect(shareMap({ mother: true, fullBrothers: 2 }).m).toEqual({ mother: '1/6', fullBrothers: '5/6' });
  });
  it('« Oumariyyatayn » : épouse + mère + père', () => {
    const { r, m } = shareMap({ wives: 1, mother: true, father: true });
    expect(m).toEqual({ wives: '1/4', mother: '1/4', father: '1/2' });
    expect(r.warnings.join(' ')).toContain('Oumariyyatayn');
    expect(shareMap({ deceased: 'female', husband: true, mother: true, father: true }).m).toEqual({ husband: '1/2', mother: '1/6', father: '1/3' });
  });
  it('sœur germaine avec une fille : le reste', () => {
    expect(shareMap({ daughters: 1, fullSisters: 1 }).m).toEqual({ daughters: '1/2', fullSisters: '1/2' });
  });
  it('sœurs germaines : 1/2 puis 2/3 ; avec un frère 2:1', () => {
    // 1/3 + 1/2 = 5/6 : le sixième restant est redistribué (radd) en proportion 2:3.
    expect(shareMap({ fullSisters: 1, mother: true }).m).toEqual({ mother: '2/5', fullSisters: '3/5' });
    expect(shareMap({ fullSisters: 2, mother: false }).m).toEqual({ fullSisters: '1' });
    expect(shareMap({ fullBrothers: 1, fullSisters: 1 }).m).toEqual({ fullBrothers: '2/3', fullSisters: '1/3' });
  });
  it('utérins : 1/6 seul, 1/3 à plusieurs', () => {
    expect(shareMap({ uterine: 1, fullBrothers: 1 }).m).toEqual({ uterine: '1/6', fullBrothers: '5/6' });
    expect(shareMap({ uterine: 3, paternalBrothers: 1 }).m).toEqual({ uterine: '1/3', paternalBrothers: '2/3' });
  });
});

describe('petits-enfants et demi-frères', () => {
  it('fille + petite-fille par un fils : 1/2 + 1/6, reste redistribué', () => {
    const { r, m } = shareMap({ daughters: 1, sonsDaughters: 1 });
    expect(m).toEqual({ daughters: '3/4', sonsDaughters: '1/4' });
    expect(r.radd).toBe(true);
  });
  it('un fils exclut les petits-enfants', () => {
    const { r } = shareMap({ sons: 1, sonsSons: 2 });
    expect(r.blocked.map((b) => b.id)).toContain('sonsSons');
    expect(r.shares.map((s) => s.id)).toEqual(['sons']);
  });
  it('deux filles excluent les petites-filles seules ; un petit-fils les fait hériter avec lui', () => {
    expect(computeShares(heirs({ daughters: 2, sonsDaughters: 1 })).blocked.map((b) => b.id)).toContain('sonsDaughters');
    expect(shareMap({ daughters: 2, sonsSons: 1, sonsDaughters: 1 }).m).toEqual({ daughters: '2/3', sonsSons: '2/9', sonsDaughters: '1/9' });
  });
  it('le père exclut les frères et sœurs', () => {
    const r = computeShares(heirs({ father: true, fullBrothers: 2, uterine: 1 }));
    expect(r.shares.map((s) => s.id)).toEqual(['father']);
    expect(r.blocked.map((b) => b.id).sort()).toEqual(['fullBrothers', 'uterine']);
  });
  it('demi-sœur du père : 1/6 avec une sœur germaine', () => {
    const { m, r } = shareMap({ fullSisters: 1, paternalSisters: 1 });
    expect(m).toEqual({ fullSisters: '3/4', paternalSisters: '1/4' });
    expect(r.radd).toBe(true);
    expect(computeShares(heirs({ fullSisters: 2, paternalSisters: 1 })).blocked.map((b) => b.id)).toContain('paternalSisters');
  });
  it('un frère germain exclut les demi-frères du père', () => {
    const r = computeShares(heirs({ fullBrothers: 1, paternalBrothers: 2 }));
    expect(r.shares.map((s) => s.id)).toEqual(['fullBrothers']);
  });
});

describe('awl et radd', () => {
  it('awl : mari + mère + 2 sœurs germaines', () => {
    const { r, m } = shareMap({ deceased: 'female', husband: true, mother: true, fullSisters: 2 });
    expect(m).toEqual({ husband: '3/8', mother: '1/8', fullSisters: '1/2' });
    expect(r.awl).toBe(true);
  });
  it('awl : mari + sœur germaine + mère', () => {
    expect(shareMap({ deceased: 'female', husband: true, fullSisters: 1, mother: true }).m).toEqual({ husband: '3/8', fullSisters: '3/8', mother: '1/4' });
  });
  it('radd : fille + mère', () => {
    expect(shareMap({ daughters: 1, mother: true }).m).toEqual({ daughters: '3/4', mother: '1/4' });
  });
  it('radd exclut le conjoint s\'il y a d\'autres héritiers à part fixe', () => {
    const { m } = shareMap({ wives: 2, daughters: 2, mother: true });
    expect(m.wives).toBe('1/8');
    expect(fracValue(computeShares(heirs({ wives: 2, daughters: 2, mother: true })).shares.reduce((a, s) => ({ n: a.n + fracValue(s.fraction), d: 1 }), { n: 0, d: 1 }))).toBeCloseTo(1, 10);
  });
  it('conjoint seul : il reçoit tout, avec un avertissement', () => {
    const { r, m } = shareMap({ deceased: 'female', husband: true });
    expect(m).toEqual({ husband: '1' });
    expect(r.warnings.join(' ')).toContain('trésor');
  });
  it('« Himariyya » : frères germains sans part, avertissement', () => {
    const { r, m } = shareMap({ deceased: 'female', husband: true, mother: true, uterine: 2, fullBrothers: 1 });
    expect(m).toEqual({ husband: '1/2', mother: '1/6', uterine: '1/3' });
    expect(r.blocked.map((b) => b.id)).toContain('fullBrothers');
    expect(r.warnings.join(' ')).toContain('Himariyya');
  });
});

describe('invariants', () => {
  it('la somme des parts fait toujours 1 quand il y a un héritier couvert', () => {
    const cases: Partial<Heirs>[] = [
      { wives: 3, sons: 2, daughters: 3, father: true, mother: true },
      { deceased: 'female', husband: true, mother: true, uterine: 2, fullSisters: 2 },
      { daughters: 1, sonsDaughters: 3, fullSisters: 2, mother: true },
      { fullSisters: 3, paternalSisters: 2, uterine: 1, wives: 1 },
      { mother: true, paternalSisters: 2 },
      { father: true, mother: true, daughters: 1, sonsSons: 1 },
    ];
    for (const c of cases) expect(total(c)).toBeCloseTo(1, 10);
  });
  it('aucun héritier couvert', () => {
    const r = computeShares(emptyHeirs());
    expect(r.covered).toBe(false);
    expect(r.shares).toEqual([]);
  });
});

describe('sanitizeHeirs', () => {
  it('ramène les valeurs à des entiers valides et gère le sexe du défunt', () => {
    const h = sanitizeHeirs({ deceased: 'female', husband: true, wives: 3, sons: -2, daughters: 2.9, father: 'x', uterine: 999 });
    expect(h).toMatchObject({ deceased: 'female', husband: true, wives: 0, sons: 0, daughters: 2, father: false, uterine: 30 });
    expect(sanitizeHeirs({ deceased: 'male', husband: true, wives: 9 })).toMatchObject({ husband: false, wives: 4 });
    expect(sanitizeHeirs(null)).toEqual(emptyHeirs());
  });
});

describe('succession', () => {
  it('biens - dettes - obsèques, legs plafonné au tiers', () => {
    const e = computeEstate({ assets: [{ label: 'Maison', value: 90000 }, { label: 'Compte', value: 30000 }], debts: 10000, funeral: 2000, bequest: 50000 });
    expect(e).toMatchObject({ total: 120000, afterDebts: 108000, bequest: 36000, bequestCapped: true, net: 72000, insolvent: false });
  });
  it('dettes supérieures aux biens : rien à partager', () => {
    const e = computeEstate({ assets: [{ label: 'x', value: 100 }], debts: 500, funeral: 0, bequest: 10 });
    expect(e).toMatchObject({ afterDebts: 0, net: 0, bequest: 0, insolvent: true });
  });
  it('valeurs négatives ou invalides ignorées', () => {
    expect(computeEstate({ assets: [{ label: 'a', value: -5 }, { label: 'b', value: NaN }], debts: -1, funeral: 0, bequest: 0 }).total).toBe(0);
  });
  it('répartition : montants par groupe et par personne', () => {
    const rows = distribute(120000, computeShares(heirs({ sons: 2, daughters: 1 })));
    const sons = rows.find((r) => r.id === 'sons')!;
    expect(sons.amount).toBe(96000);
    expect(sons.perPerson).toBe(48000);
    expect(rows.find((r) => r.id === 'daughters')!.amount).toBe(24000);
  });
});
