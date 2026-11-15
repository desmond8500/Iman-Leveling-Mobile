import { revealLength } from '../../src/utils/typewriter';

describe('revealLength', () => {
  test('avance avec le temps et reste borné', () => {
    expect(revealLength(0, 40, 100)).toBe(0);
    expect(revealLength(500, 40, 100)).toBe(20);
    expect(revealLength(10_000, 40, 100)).toBe(100);
    expect(revealLength(-5, 40, 100)).toBe(0);
  });
  test('cas limites : texte vide ou vitesse nulle affichent tout', () => {
    expect(revealLength(100, 40, 0)).toBe(0);
    expect(revealLength(100, 0, 12)).toBe(12);
  });
});
