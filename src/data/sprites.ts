import type { Look } from '@/utils/sprite';

const SKIN = { light: '#f2c9a0', tan: '#d9a273', brown: '#a8704a', dark: '#6f4630' };

/** Personnages du parcours (par identifiant de rencontre). */
export const NPC_LOOKS: Record<string, Look> = {
  'maison-pere': { skin: SKIN.tan, hair: '#3a2a22', top: '#3f7a62', pants: '#3b4a68', shoes: '#4a3328', head: 'kufi', accent: '#f4f0e4', beard: true },
  'maison-mere': { skin: SKIN.light, hair: '#3a2a22', top: '#8a4f9e', pants: '#4b3a6a', shoes: '#4a3328', head: 'hijab', accent: '#c88bd8', robe: true },
  'maison-frere': { skin: SKIN.tan, hair: '#2b2220', top: '#c9573f', pants: '#2f3b57', shoes: '#f1f1f1', head: 'hair' },
  'maison-oncle': { skin: SKIN.brown, hair: '#5a5a5a', top: '#e8e2d0', pants: '#e8e2d0', shoes: '#4a3328', head: 'turban', accent: '#2f5fa8', beard: true, robe: true },
  'maison-soeur': { skin: SKIN.light, hair: '#3a2a22', top: '#e87fa4', pants: '#6d4aa8', shoes: '#c94f7b', head: 'hijab', accent: '#ffb3cc', scale: 0.8 },
  'maison-grand-mere': { skin: SKIN.light, hair: '#d8d8d8', top: '#6a7ea8', pants: '#4b5a7a', shoes: '#4a3328', head: 'hijab', accent: '#f1ecdf', robe: true },
  'ecole-triche': { skin: SKIN.tan, hair: '#2b2220', top: '#3a7ac9', pants: '#2f3b57', shoes: '#f1f1f1', head: 'hair', scale: 0.92 },
  'ecole-priere': { skin: SKIN.brown, hair: '#2b2220', top: '#d9a53a', pants: '#2f3b57', shoes: '#3a2a22', head: 'kufi', accent: '#ffffff', scale: 0.92 },
  'ecole-moquerie': { skin: SKIN.light, hair: '#8a5a2b', top: '#c93a3a', pants: '#2b2f3a', shoes: '#222222', head: 'hair', scale: 0.92 },
  'ecole-savoir': { skin: SKIN.tan, hair: '#3a2a22', top: '#2f7f7a', pants: '#3a3a4a', shoes: '#3a2a22', head: 'hijab', accent: '#d8c27a', glasses: true },
  'travail-patron': { skin: SKIN.light, hair: '#444444', top: '#2f3445', pants: '#252836', shoes: '#151515', head: 'hair', glasses: true, tie: '#b33a3a' },
  'travail-cadeau': { skin: SKIN.dark, hair: '#1f1a18', top: '#7a5a3a', pants: '#3a3226', shoes: '#2a2018', head: 'hair', beard: true, tie: '#3a8a5a' },
  'travail-paie': { skin: SKIN.tan, hair: '#3a2a22', top: '#5a5ab8', pants: '#2f2f4a', shoes: '#2a2a3a', head: 'hijab', accent: '#cfd0f2', glasses: true },
  'travail-pointage': { skin: SKIN.brown, hair: '#2b2220', top: '#4a8a4a', pants: '#3a3a3a', shoes: '#4a3328', head: 'hair' },
};

/** Apparence par défaut quand une rencontre n'a pas de personnage dessiné. */
export const FALLBACK_LOOK: Look = { skin: SKIN.tan, hair: '#2b2220', top: '#7a7a9a', pants: '#3a3a4a', shoes: '#2a2a2a', head: 'hair' };

export const npcLook = (encounterId: string): Look => NPC_LOOKS[encounterId] ?? FALLBACK_LOOK;

/** Personnages jouables (identifiants de `AVATARS`). */
export const AVATAR_LOOKS: Record<string, Look> = {
  marcheur: { skin: SKIN.tan, hair: '#3a2a22', top: '#3a7ac9', pants: '#2f3b57', shoes: '#f1f1f1', head: 'hair' },
  frere: { skin: SKIN.tan, hair: '#2b2220', top: '#e8e2d0', pants: '#e8e2d0', shoes: '#4a3328', head: 'kufi', accent: '#ffffff', beard: true, robe: true },
  soeur: { skin: SKIN.light, hair: '#3a2a22', top: '#2f9a8a', pants: '#2f5a5a', shoes: '#f1f1f1', head: 'hijab', accent: '#6fd6c4' },
  etudiant: { skin: SKIN.brown, hair: '#1f1a18', top: '#c9573f', pants: '#2f3b57', shoes: '#f1f1f1', head: 'hair', glasses: true },
  voyageur: { skin: SKIN.light, hair: '#8a5a2b', top: '#d98a2b', pants: '#4a4a5a', shoes: '#4a3328', head: 'hair' },
  sage: { skin: SKIN.brown, hair: '#d8d8d8', top: '#3f5a8a', pants: '#3f5a8a', shoes: '#4a3328', head: 'turban', accent: '#e8e2d0', beard: true, robe: true },
};

export const avatarLook = (id: string): Look => AVATAR_LOOKS[id] ?? AVATAR_LOOKS.marcheur;
