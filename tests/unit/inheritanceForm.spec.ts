import { emptyEstateForm, estateInputFromForm, sanitizeEstateForm, MAX_ASSETS } from '../../src/utils/inheritanceForm';

describe('formulaire de succession', () => {
  it('convertit les montants saisis', () => {
    const form = { ...emptyEstateForm(), assets: [{ label: 'Maison', value: '90 000,5' }, { label: '', value: 'abc' }], debts: '1 000' };
    expect(estateInputFromForm(form)).toEqual({
      assets: [{ label: 'Maison', value: 90000.5 }, { label: '', value: 0 }],
      debts: 1000, funeral: 0, bequest: 0,
    });
  });
  it('relit un formulaire invalide sans planter', () => {
    expect(sanitizeEstateForm(null)).toEqual(emptyEstateForm());
    const f = sanitizeEstateForm({ assets: 'x', heirs: { sons: 99999 }, debts: 5, currency: 'FCFA-LONGUE-DEVISE' });
    expect(f.assets).toEqual([{ label: '', value: '' }]);
    expect(f.heirs.sons).toBe(30);
    expect(f.debts).toBe('');
    expect(f.currency).toBe('FCFA-LON');
  });
  it('limite le nombre de biens', () => {
    const many = Array.from({ length: MAX_ASSETS + 20 }, (_, i) => ({ label: `b${i}`, value: '1' }));
    expect(sanitizeEstateForm({ assets: many }).assets).toHaveLength(MAX_ASSETS);
  });
});
