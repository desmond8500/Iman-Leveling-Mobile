import { createPinia, setActivePinia } from 'pinia';
import { RPG_PLACES } from '../../src/data/rpg';
import { useRpgStore } from '../../src/stores/rpg';
import {
  answer, canPlay, currentPlace, emptyProgress, findEncounter, isPlaceCleared, overall, placeStatus, sanitizeProgress, shuffledChoices,
  type RpgEncounter, type RpgPlace,
} from '../../src/utils/rpg';

const enc = (id: string): RpgEncounter => ({
  id, who: 'x', emoji: '🙂', topic: 't', prompt: 'p',
  choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }, { id: 'd', text: 'D' }],
  correct: 'b', lesson: { text: 'l' },
});
const places: RpgPlace[] = [
  { id: 'p1', title: 'P1', emoji: '1', intro: '', encounters: [enc('e1'), enc('e2')] },
  { id: 'p2', title: 'P2', emoji: '2', intro: '', encounters: [enc('e3')] },
];

describe('données du parcours', () => {
  it('lieux et rencontres uniques, bien formés', () => {
    expect(RPG_PLACES.map((p) => p.id)).toEqual(['maison', 'ecole', 'travail']);
    const ids = RPG_PLACES.flatMap((p) => p.encounters.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of RPG_PLACES) {
      expect(p.encounters.length).toBeGreaterThanOrEqual(3);
      for (const e of p.encounters) {
        expect(e.choices.length).toBeGreaterThanOrEqual(3);
        expect(new Set(e.choices.map((c) => c.id)).size).toBe(e.choices.length);
        expect(e.choices.filter((c) => c.id === e.correct)).toHaveLength(1);
        expect(e.prompt.length).toBeGreaterThan(20);
        expect(e.lesson.text.length).toBeGreaterThan(30);
        expect(e.lesson.source?.length ?? 0).toBeGreaterThan(3);
      }
    }
  });
  it('la maison couvre parents, famille, partage et pratique religieuse', () => {
    const topics = RPG_PLACES[0].encounters.map((e) => e.topic).join(' ');
    for (const word of ['parents', 'famille', 'partage', 'religieuse']) expect(topics.toLowerCase()).toContain(word);
  });
  it('le travail contient la situation du patron qui empêche de prier', () => {
    expect(RPG_PLACES[2].encounters.some((e) => e.topic === 'Prier au travail')).toBe(true);
  });
});

describe('progression', () => {
  it('seul le premier lieu est ouvert au départ', () => {
    const p = emptyProgress();
    expect(places.map((_, i) => placeStatus(places, i, p))).toEqual(['open', 'locked']);
    expect(currentPlace(places, p)?.id).toBe('p1');
    expect(canPlay(places, 'e1', p)).toBe(true);
    expect(canPlay(places, 'e3', p)).toBe(false);
    expect(canPlay(places, 'inconnue', p)).toBe(false);
  });
  it('bonne réponse : validée ; mauvaise : comptée, rien n\'est validé', () => {
    let p = emptyProgress();
    const wrong = answer(p, enc('e1'), 'a');
    expect(wrong.correct).toBe(false);
    expect(wrong.progress.cleared).toEqual([]);
    expect(wrong.progress.mistakes).toEqual({ e1: 1 });
    p = wrong.progress;
    const right = answer(p, enc('e1'), 'b');
    expect(right.correct).toBe(true);
    expect(right.progress.cleared).toEqual(['e1']);
    expect(answer(right.progress, enc('e1'), 'b').progress.cleared).toEqual(['e1']);
  });
  it('un choix inconnu est une erreur', () => {
    expect(answer(emptyProgress(), enc('e1'), 'z').correct).toBe(false);
  });
  it('terminer un lieu ouvre le suivant, puis finit le parcours', () => {
    let p = answer(emptyProgress(), enc('e1'), 'b').progress;
    expect(placeStatus(places, 1, p)).toBe('locked');
    p = answer(p, enc('e2'), 'b').progress;
    expect(isPlaceCleared(places[0], p)).toBe(true);
    expect(places.map((_, i) => placeStatus(places, i, p))).toEqual(['cleared', 'open']);
    expect(currentPlace(places, p)?.id).toBe('p2');
    p = answer(p, enc('e3'), 'b').progress;
    expect(currentPlace(places, p)).toBeNull();
    expect(overall(places, p)).toEqual({ done: 3, total: 3 });
  });
  it('findEncounter', () => {
    expect(findEncounter(places, 'e3')?.place.id).toBe('p2');
    expect(findEncounter(places, 'nope')).toBeNull();
  });
});

describe('mélange des choix', () => {
  it('stable pour un même nombre d\'erreurs, toujours les mêmes choix', () => {
    const e = enc('e1');
    expect(shuffledChoices(e, 0)).toEqual(shuffledChoices(e, 0));
    expect(shuffledChoices(e, 0).map((c) => c.id).sort()).toEqual(['a', 'b', 'c', 'd']);
  });
  it('l\'ordre change au moins une fois sur quelques erreurs', () => {
    const e = enc('e1');
    const orders = new Set([0, 1, 2, 3, 4].map((m) => shuffledChoices(e, m).map((c) => c.id).join('')));
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe('sanitizeProgress', () => {
  it('ne garde que les identifiants connus et des nombres valides', () => {
    const p = sanitizeProgress({ cleared: ['e1', 'e1', 'zz', 3], mistakes: { e2: 2, zz: 1, e3: -1, e1: 'x' } }, places);
    expect(p).toEqual({ cleared: ['e1'], mistakes: { e2: 2 } });
    expect(sanitizeProgress(null, places)).toEqual(emptyProgress());
  });
});

describe('store du parcours', () => {
  it('répond, valide, refuse les lieux fermés et se recharge', async () => {
    setActivePinia(createPinia());
    const store = useRpgStore();
    await store.load();
    const first = RPG_PLACES[0].encounters[0];
    const locked = RPG_PLACES[1].encounters[0];
    expect(store.answer(locked.id, locked.correct)).toBeNull();
    expect(store.answer(first.id, 'zzz')).toBe(false);
    expect(store.mistakesOf(first.id)).toBe(1);
    expect(store.answer(first.id, first.correct)).toBe(true);
    expect(store.cleared(first.id)).toBe(true);
    expect(store.totals.done).toBe(1);
    await new Promise((r) => setTimeout(r, 10));

    setActivePinia(createPinia());
    const again = useRpgStore();
    await again.load();
    expect(again.cleared(first.id)).toBe(true);
    again.reset();
    expect(again.totals.done).toBe(0);
  });
  it('terminer tout le parcours', async () => {
    setActivePinia(createPinia());
    const store = useRpgStore();
    await store.load();
    store.reset();
    for (const p of RPG_PLACES) for (const e of p.encounters) expect(store.answer(e.id, e.correct)).toBe(true);
    expect(store.finished).toBe(true);
    expect(store.current).toBeNull();
  });
});
