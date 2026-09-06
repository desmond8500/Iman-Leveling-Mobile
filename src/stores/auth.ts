import { defineStore } from "pinia";
import { ref } from "vue";
import { Preferences } from "@capacitor/preferences";
import api from "@/services/api";

import {
  login as loginApi,
  getProfile,
  logout as logoutApi,
} from "@/services/authService";

export const useAuthStore = defineStore("auth", () => {
  const token = ref("");
  const user = ref<any>(null);

  async function setAuth(newToken: string, newUser: any) {
    token.value = newToken;
    user.value = newUser;

    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

    await Preferences.set({
      key: "token",
      value: newToken,
    });
  }

  async function loadToken() {
    const { value } = await Preferences.get({
      key: "token",
    });

    if (value) {
      token.value = value;

      api.defaults.headers.common.Authorization = `Bearer ${value}`;
    }
  }

  // ✅ Cette fonction doit exister
  async function login(email: string, password: string) {
    const data = await loginApi({
      email,
      password,
    });

    await setAuth(data.token, data.user);
  }

  // ✅ Cette fonction aussi
  async function fetchUser() {
    user.value = await getProfile();
  }

  async function logout() {
    await logoutApi();

    delete api.defaults.headers.common.Authorization;

    token.value = "";
    user.value = null;

    await Preferences.remove({
      key: "token",
    });
  }

  // ⚠️ TRÈS IMPORTANT
  // login doit être ici
  return {
    token,
    user,
    setAuth,
    loadToken,
    login,
    fetchUser,
    logout,
  };
});
