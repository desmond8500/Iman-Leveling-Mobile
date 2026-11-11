import { GRADES, gradeForLevel, nextGrade } from '../../src/data/grades';

describe('grades', () => {
  it('commence au niveau 1 et monte strictement', () => {
    expect(GRADES[0].minLevel).toBe(1);
    for (let i = 1; i < GRADES.length; i++) {
      expect(GRADES[i].minLevel).toBeGreaterThan(GRADES[i - 1].minLevel);
    }
  });

  it('a des noms, des identifiants et des couleurs valides et uniques', () => {
    expect(new Set(GRADES.map((g) => g.id)).size).toBe(GRADES.length);
    expect(new Set(GRADES.map((g) => g.name)).size).toBe(GRADES.length);
    expect(GRADES.every((g) => g.name.trim() !== '' && /^#[0-9a-f]{6}$/i.test(g.color))).toBe(true);
  });

  it('donne le grade selon le niveau, aux bornes', () => {
    expect(gradeForLevel(1).id).toBe('debutant');
    expect(gradeForLevel(2).id).toBe('debutant');
    expect(gradeForLevel(3).id).toBe('perseverant');
    expect(gradeForLevel(9).id).toBe('assidu');
    expect(gradeForLevel(10).id).toBe('devoue');
    expect(gradeForLevel(999).id).toBe('lumiere');
  });

  it('donne un grade même pour un niveau inférieur à 1', () => {
    expect(gradeForLevel(0).id).toBe('debutant');
  });

  it('annonce le prochain grade, puis aucun au maximum', () => {
    expect(nextGrade(1)?.id).toBe('perseverant');
    expect(nextGrade(3)?.id).toBe('assidu');
    expect(nextGrade(40)).toBeNull();
  });
});
