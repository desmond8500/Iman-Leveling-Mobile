import {
  FITR_DEFAULT_KG,
  emptyMaalInput,
  formatMoney,
  parseAmount,
  zakatFitr,
  zakatMaal,
} from '../../src/utils/zakat';

describe('parseAmount', () => {
  it('lit les nombres à la française', () => {
    expect(parseAmount('1 234,5')).toBe(1234.5);
    expect(parseAmount('1 000')).toBe(1000);
    expect(parseAmount('12.75')).toBe(12.75);
    expect(parseAmount(42)).toBe(42);
  });
  it('renvoie 0 pour le vide, le négatif et le non numérique', () => {
    for (const bad of ['', ' ', 'abc', '-5', '1,2,3', '.', null, undefined, -3, NaN]) {
      expect(parseAmount(bad as never)).toBe(0);
    }
  });
});

describe('zakat al-Maal', () => {
  const base = { ...emptyMaalInput(), goldPricePerGram: 70, silverPricePerGram: 0.8 };

  it('nisab en or : 85 g × prix du gramme', () => {
    expect(zakatMaal(base).nisab).toBe(5950);
  });
  it('2,5 % quand le nisab est atteint', () => {
    const r = zakatMaal({ ...base, cash: 10000 });
    expect(r.nisabReached).toBe(true);
    expect(r.due).toBe(250);
  });
  it('rien en dessous du nisab', () => {
    const r = zakatMaal({ ...base, cash: 5000 });
    expect(r.nisabReached).toBe(false);
    expect(r.due).toBe(0);
  });
  it('pile au nisab : due', () => {
    expect(zakatMaal({ ...base, cash: 5950 }).due).toBe(148.75);
  });
  it('les dettes sont déduites', () => {
    const r = zakatMaal({ ...base, cash: 10000, debts: 6000 });
    expect(r.net).toBe(4000);
    expect(r.nisabReached).toBe(false);
  });
  it('dettes supérieures aux biens : net à 0, jamais négatif', () => {
    expect(zakatMaal({ ...base, cash: 100, debts: 900 }).net).toBe(0);
  });
  it('compte l\'or et l\'argent détenus au prix du jour', () => {
    const r = zakatMaal({ ...base, goldGrams: 100, silverGrams: 100 });
    expect(r.assets).toBe(7080);
    expect(r.due).toBe(177);
  });
  it('additionne toutes les catégories', () => {
    const r = zakatMaal({ ...base, cash: 1000, savings: 2000, investments: 3000, tradeGoods: 4000, receivables: 500 });
    expect(r.assets).toBe(10500);
  });
  it('seuil en argent, plus bas', () => {
    const input = { ...base, cash: 600 };
    expect(zakatMaal(input, 'gold').nisabReached).toBe(false);
    const silver = zakatMaal(input, 'silver');
    expect(silver.nisab).toBe(476);
    expect(silver.nisabReached).toBe(true);
    expect(silver.due).toBe(15);
  });
  it('sans prix du métal de référence, le seuil est inconnu et rien n\'est calculé', () => {
    const r = zakatMaal({ ...emptyMaalInput(), cash: 1000000 });
    expect(r.nisabKnown).toBe(false);
    expect(r.due).toBe(0);
  });
});

describe('zakat al-Fitr', () => {
  it('multiplie par le nombre de personnes', () => {
    const r = zakatFitr(4, 2.5, 500);
    expect(r.perPerson).toBe(1250);
    expect(r.total).toBe(5000);
    expect(r.totalKg).toBe(10);
  });
  it('0 personne ou nombre négatif : 0', () => {
    expect(zakatFitr(0, 2.5, 500).total).toBe(0);
    expect(zakatFitr(-2, 2.5, 500).total).toBe(0);
  });
  it('arrondit au centime', () => {
    expect(zakatFitr(1, 2.5, 1.333).perPerson).toBe(3.33);
    expect(FITR_DEFAULT_KG).toBe(2.5);
  });
});

describe('formatMoney', () => {
  it('format français avec devise', () => {
    const text = formatMoney(1234.5, 'EUR').replace(/[  ]/g, ' ');
    expect(text).toBe('1 234,5 EUR');
    expect(formatMoney(10)).toBe('10');
  });
});
