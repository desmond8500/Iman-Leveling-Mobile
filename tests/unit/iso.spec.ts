import { MAX_LEVEL, TILE_H, TILE_W, buildStage, leftFace, project, rightFace, tileLevel, topFace, unitPoint } from '../../src/utils/iso';

describe('relief', () => {
  it('niveaux entre 0 et le maximum, stables pour un même lieu, variés', () => {
    const levels = new Set<number>();
    for (let gx = 0; gx < 6; gx++) {
      for (let gy = 0; gy < 6; gy++) {
        const l = tileLevel(gx, gy, 'maison');
        expect(l).toBeGreaterThanOrEqual(0);
        expect(l).toBeLessThanOrEqual(MAX_LEVEL);
        expect(l).toBe(tileLevel(gx, gy, 'maison'));
        levels.add(l);
      }
    }
    expect(levels.size).toBeGreaterThan(1);
  });
  it('deux lieux n\'ont pas le même relief', () => {
    const grid = (seed: string) => Array.from({ length: 36 }, (_, i) => tileLevel(i % 6, Math.floor(i / 6), seed)).join('');
    expect(grid('maison')).not.toBe(grid('travail'));
  });
});

describe('projection', () => {
  it('le coin (0,0) est en haut au centre, le coin opposé en bas au centre', () => {
    const top = project(0, 0, 0, 6);
    const bottom = project(5, 5, 0, 6);
    expect(top.x).toBe(bottom.x);
    expect(bottom.y).toBeGreaterThan(top.y);
  });
  it('une tuile plus haute est dessinée plus haut', () => {
    expect(project(2, 2, 2, 6).y).toBeLessThan(project(2, 2, 0, 6).y);
  });
  it('les faces forment des polygones à 4 sommets', () => {
    for (const face of [topFace(1, 1, 1, 6), leftFace(1, 1, 1, 6), rightFace(1, 1, 1, 6)]) {
      expect(face.split(' ')).toHaveLength(4);
    }
  });
});

describe('buildStage', () => {
  it('36 tuiles, dessinées de l\'arrière vers l\'avant', () => {
    const stage = buildStage('maison', 6);
    expect(stage.tiles).toHaveLength(36);
    const depth = stage.tiles.map((t) => t.gx + t.gy);
    expect([...depth].sort((a, b) => a - b)).toEqual(depth);
  });
  it('une case distincte et dans la grille par rencontre, loin du joueur', () => {
    for (const n of [1, 3, 4, 6]) {
      const stage = buildStage('ecole', n);
      expect(stage.spots).toHaveLength(n);
      expect(new Set(stage.spots.map((s) => `${s.gx},${s.gy}`)).size).toBe(n);
      for (const s of stage.spots) {
        expect(s.gx).toBeGreaterThanOrEqual(0);
        expect(s.gx).toBeLessThan(stage.cols);
        expect(s.gy).toBeGreaterThanOrEqual(0);
        expect(s.gy).toBeLessThan(stage.rows);
        expect(Math.abs(s.gx - stage.start.gx) + Math.abs(s.gy - stage.start.gy)).toBeGreaterThanOrEqual(3);
      }
    }
  });
  it('placement identique à chaque visite, différent d\'un lieu à l\'autre', () => {
    expect(buildStage('maison', 6).spots).toEqual(buildStage('maison', 6).spots);
    expect(buildStage('maison', 6).spots).not.toEqual(buildStage('travail', 6));
  });
  it('tout tient dans la zone de dessin', () => {
    const stage = buildStage('travail', 6);
    for (const t of stage.tiles) {
      const p = project(t.gx, t.gy, t.level, stage.cols);
      expect(p.x - TILE_W / 2).toBeGreaterThanOrEqual(0);
      expect(p.x + TILE_W / 2).toBeLessThanOrEqual(stage.width);
      expect(p.y - TILE_H / 2).toBeGreaterThanOrEqual(0);
    }
    const bottom = unitPoint(stage, stage.start, 'travail');
    expect(bottom.y).toBeLessThan(stage.height);
  });
});
