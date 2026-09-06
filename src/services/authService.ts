import api from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export async function login(credentials: { email: string; password: string }) {
  const response = await api.post("/login", credentials);

  return response.data;
}

export async function register(user: RegisterData) {
  const response = await api.post("/register", user);

  return response.data;
}

export async function getProfile() {
  const response = await api.get("/me");

  return response.data;
}

export async function logout() {
  const response = await api.post("/logout");

  return response.data;
}
