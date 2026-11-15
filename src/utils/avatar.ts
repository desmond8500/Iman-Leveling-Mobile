export interface Avatar {
  id: string;
  emoji: string;
  label: string;
}

/** Personnages proposés pour le parcours (choix purement visuel). */
export const AVATARS: readonly Avatar[] = [
  { id: 'marcheur', emoji: '🚶', label: 'Marcheur' },
  { id: 'frere', emoji: '🧔', label: 'Frère' },
  { id: 'soeur', emoji: '🧕', label: 'Sœur' },
  { id: 'etudiant', emoji: '🧑‍🎓', label: 'Étudiant' },
  { id: 'voyageur', emoji: '🧳', label: 'Voyageur' },
  { id: 'sage', emoji: '👳', label: 'Sage' },
];

export const DEFAULT_AVATAR = AVATARS[0].id;

/** Renvoie un identifiant d'avatar valide (le défaut si la valeur est inconnue). */
export function sanitizeAvatar(raw: unknown): string {
  return typeof raw === 'string' && AVATARS.some((a) => a.id === raw) ? raw : DEFAULT_AVATAR;
}

export function avatarEmoji(id: string): string {
  return (AVATARS.find((a) => a.id === id) ?? AVATARS[0]).emoji;
}
