import type { AccountInfo, ProgressData } from '../types';
import { sanitizeProgress } from '../utils/merge';

export class ApiError extends Error {
  constructor(
    message: string,
    /** Code HTTP, ou 0 si le serveur n'a pas répondu. */
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/**
 * Valide l'adresse du serveur. HTTPS obligatoire, sauf pour localhost (développement).
 * Renvoie l'adresse sans barre finale, ni paramètres, ou `null` si elle est refusée.
 */
export function normalizeServerUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  const secure = url.protocol === 'https:';
  const local = url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname);
  if (!secure && !local) return null;
  return (url.origin + url.pathname).replace(/\/+$/, '');
}

export interface AuthResponse {
  token: string;
  user: AccountInfo;
}

export interface RemoteProgress {
  data: ProgressData;
  updated_at: string | null;
}

const TIMEOUT_MS = 15000;

/** Client du serveur de sauvegarde. Le contrat est décrit dans docs/API.md. */
export class ApiClient {
  constructor(
    private baseUrl: string,
    private token: string | null = null,
    private fetchFn: typeof fetch = (...args) => fetch(...args),
  ) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response: Response;
    try {
      response = await this.fetchFn(`${this.baseUrl}/api${path}`, {
        method,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      const timedOut = e instanceof Error && e.name === 'AbortError';
      throw new ApiError(timedOut ? 'Le serveur met trop de temps à répondre.' : 'Serveur injoignable.', 0);
    } finally {
      clearTimeout(timer);
    }

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      // Réponse vide ou non JSON (204, erreur HTML d'un proxy...)
    }

    if (!response.ok) {
      const message =
        typeof (payload as { message?: unknown } | null)?.message === 'string'
          ? (payload as { message: string }).message
          : `Erreur du serveur (${response.status}).`;
      throw new ApiError(message, response.status);
    }
    return payload as T;
  }

  register(name: string, email: string, password: string) {
    return this.request<AuthResponse>('POST', '/auth/register', { name, email, password });
  }

  login(email: string, password: string) {
    return this.request<AuthResponse>('POST', '/auth/login', { email, password });
  }

  async logout() {
    await this.request('POST', '/auth/logout');
  }

  /** Progression enregistrée sur le serveur, ou `null` s'il n'y en a pas encore (404). */
  async getProgress(): Promise<RemoteProgress | null> {
    try {
      const res = await this.request<{ data?: unknown; updated_at?: string | null }>('GET', '/progress');
      return { data: sanitizeProgress(res?.data), updated_at: res?.updated_at ?? null };
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }

  putProgress(data: ProgressData) {
    return this.request<{ updated_at?: string }>('PUT', '/progress', { data });
  }
}
