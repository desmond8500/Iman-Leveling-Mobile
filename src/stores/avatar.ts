import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { loadJson, saveJson } from '@/services/storage';
import { avatarEmoji, DEFAULT_AVATAR, sanitizeAvatar } from '@/utils/avatar';

const KEY = 'iman.avatar.v1';

/** Personnage choisi pour le parcours, gardé sur l'appareil. */
export const useAvatarStore = defineStore('avatar', () => {
  const id = ref(DEFAULT_AVATAR);
  const emoji = computed(() => avatarEmoji(id.value));

  async function load() {
    id.value = sanitizeAvatar(await loadJson<unknown>(KEY, null));
  }
  function choose(next: string) {
    id.value = sanitizeAvatar(next);
    void saveJson(KEY, id.value).catch(() => undefined);
  }
  return { id, emoji, load, choose };
});
