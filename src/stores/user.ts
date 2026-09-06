import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const profile = ref(null);

  function setProfile(data: any) {
    profile.value = data;
  }

  return { profile, setProfile };
});
