import { createPinia, setActivePinia } from 'pinia';
import {
  TASBIH_PRESETS, choosePreset, doneInRound, initialState, reset, roundTotal, sanitizeState, tap, undo, presetById, type TasbihState,
} from '../../src/utils/tasbih';
import { useTasbihStore } from '../../src/stores/tasbih';

const times = (state: TasbihState, n: number) => {
  let s = state;
  for (let i = 0; i < n; i++) s = tap(s).state;
  return s;
};

describe('modèles', () => {
  it('identifiants uniques, étapes valides', () => {
    expect(new Set(TASBIH_PRESETS.map((p) => p.id)).size).toBe(TASBIH_PRESETS.length);
    for (const p of TASBIH_PRESETS) {
      expect(p.steps.length).toBeGreaterThan(0);
      for (const s of p.steps) if (s.target !== null) expect(s.target).toBeGreaterThan(0);
    }
  });
  it('après la prière : 33 + 33 + 34 = 100', () => {
    const p = presetById('after-prayer')!;
    expect(p.steps.map((s) => s.target)).toEqual([33, 33, 34]);
    expect(roundTotal(p)).toBe(100);
    expect(roundTotal(presetById('libre')!)).toBeNull();
  });
});

describe('tap', () => {
  it('compte, puis passe à l\'étape suivante à l\'objectif', () => {
    let s = times(initialState(), 32);
    expect(s).toMatchObject({ step: 0, count: 32 });
    const r = tap(s);
    expect(r.event).toBe('step');
    expect(r.state).toMatchObject({ step: 1, count: 0, rounds: 0 });
    s = r.state;
    expect(doneInRound(s)).toBe(33);
  });
  it('termine la série à la 100e récitation', () => {
    const almost = times(initialState(), 99);
    expect(almost).toMatchObject({ step: 2, count: 33 });
    const r = tap(almost);
    expect(r.event).toBe('round');
    expect(r.state).toEqual({ preset: 'after-prayer', step: 0, count: 0, rounds: 1 });
  });
  it('compteur libre : jamais d\'événement, plafonné', () => {
    let s = initialState('libre');
    s = times(s, 150);
    expect(s.count).toBe(150);
    expect(tap({ ...s, count: 99999 }).state.count).toBe(99999);
  });
  it('modèle inconnu : sans effet', () => {
    const s = { preset: 'x', step: 0, count: 0, rounds: 0 };
    expect(tap(s)).toEqual({ state: s, event: null });
  });
});

describe('undo, reset, choix', () => {
  it('annule une récitation simple', () => {
    expect(undo(times(initialState(), 5)).count).toBe(4);
  });
  it('annule le passage d\'étape et de série', () => {
    const afterStep = times(initialState(), 33);
    expect(undo(afterStep)).toMatchObject({ step: 0, count: 32 });
    const afterRound = times(initialState(), 100);
    const back = undo(afterRound);
    expect(back).toMatchObject({ step: 2, count: 33, rounds: 0 });
    expect(tap(back).event).toBe('round');
  });
  it('ne descend jamais sous zéro', () => {
    expect(undo(initialState())).toEqual(initialState());
  });
  it('reset remet à zéro dans le même modèle ; choix change de modèle', () => {
    expect(reset(times(initialState('istighfar'), 10))).toEqual(initialState('istighfar'));
    expect(choosePreset(times(initialState(), 10), 'salawat')).toEqual(initialState('salawat'));
    const s = times(initialState(), 3);
    expect(choosePreset(s, 'inconnu')).toBe(s);
  });
});

describe('sanitizeState', () => {
  it('valeurs invalides ramenées à un état valide', () => {
    expect(sanitizeState(null)).toEqual(initialState());
    expect(sanitizeState({ preset: 'x' })).toEqual(initialState());
    expect(sanitizeState({ preset: 'after-prayer', step: 9, count: -4, rounds: 'a' })).toEqual({ preset: 'after-prayer', step: 2, count: 0, rounds: 0 });
    expect(sanitizeState({ preset: 'subhanallah', step: 0, count: 500, rounds: 2 })).toEqual({ preset: 'subhanallah', step: 0, count: 32, rounds: 2 });
  });
});

describe('store', () => {
  it('compte, change de modèle et se recharge', async () => {
    setActivePinia(createPinia());
    const store = useTasbihStore();
    await store.load();
    for (let i = 0; i < 33; i++) store.tap();
    expect(store.state.step).toBe(1);
    expect(store.progress).toBe(33);
    expect(store.total).toBe(100);
    await new Promise((r) => setTimeout(r, 10));

    setActivePinia(createPinia());
    const again = useTasbihStore();
    await again.load();
    expect(again.state).toMatchObject({ step: 1, count: 0 });

    again.selectPreset('libre');
    expect(again.total).toBeNull();
    again.tap();
    again.undo();
    expect(again.state.count).toBe(0);
  });
});
