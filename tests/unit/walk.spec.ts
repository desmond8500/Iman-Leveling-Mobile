import { describe, expect, test } from 'bun:test';
import { easeInOut, pathLength, pointAlong, walkPath } from '@/utils/walk';

describe('walkPath', () => {
  test('va en x puis en y, une case par pas', () => {
    expect(walkPath({ gx: 0, gy: 0 }, { gx: 2, gy: 1 })).toEqual([
      { gx: 0, gy: 0 },
      { gx: 1, gy: 0 },
      { gx: 2, gy: 0 },
      { gx: 2, gy: 1 },
    ]);
  });
  test('fonctionne en marche arrière et sans déplacement', () => {
    const p = walkPath({ gx: 3, gy: 3 }, { gx: 1, gy: 2 });
    expect(p[p.length - 1]).toEqual({ gx: 1, gy: 2 });
    expect(p.length).toBe(4);
    expect(walkPath({ gx: 1, gy: 1 }, { gx: 1, gy: 1 })).toEqual([{ gx: 1, gy: 1 }]);
  });
});

describe('pointAlong', () => {
  const line = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ];
  test('longueur et bornes', () => {
    expect(pathLength(line)).toBe(20);
    expect(pointAlong(line, 0)).toEqual({ x: 0, y: 0 });
    expect(pointAlong(line, 1)).toEqual({ x: 10, y: 10 });
  });
  test('interpole sur le bon segment', () => {
    expect(pointAlong(line, 0.25)).toEqual({ x: 5, y: 0 });
    expect(pointAlong(line, 0.75)).toEqual({ x: 10, y: 5 });
  });
  test('cas limites', () => {
    expect(pointAlong([], 0.5)).toEqual({ x: 0, y: 0 });
    expect(pointAlong([{ x: 2, y: 3 }], 0.5)).toEqual({ x: 2, y: 3 });
  });
});

describe('easeInOut', () => {
  test('0, 0.5 et 1 sont fixes et la courbe est croissante', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.3)).toBeLessThan(easeInOut(0.6));
  });
});
