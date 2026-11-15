import { describe, expect, test } from 'bun:test';
import { AVATARS, avatarEmoji, DEFAULT_AVATAR, sanitizeAvatar } from '@/utils/avatar';

describe('avatar', () => {
  test('les identifiants sont uniques et le défaut existe', () => {
    expect(new Set(AVATARS.map((a) => a.id)).size).toBe(AVATARS.length);
    expect(AVATARS.some((a) => a.id === DEFAULT_AVATAR)).toBe(true);
  });
  test('sanitizeAvatar garde une valeur connue et ignore le reste', () => {
    expect(sanitizeAvatar('soeur')).toBe('soeur');
    expect(sanitizeAvatar('inconnu')).toBe(DEFAULT_AVATAR);
    expect(sanitizeAvatar(42)).toBe(DEFAULT_AVATAR);
    expect(sanitizeAvatar(null)).toBe(DEFAULT_AVATAR);
  });
  test('avatarEmoji retombe sur le défaut', () => {
    expect(avatarEmoji('soeur')).toBe('🧕');
    expect(avatarEmoji('zzz')).toBe(AVATARS[0].emoji);
  });
});
