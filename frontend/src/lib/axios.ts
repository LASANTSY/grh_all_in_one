import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  path?: string;
  timestamp?: string;
}

/**
 * Client Axios global.
 *
 * - Envoie automatiquement les cookies (withCredentials) pour que le
 *   refresh token httpOnly soit transmis au backend.
 * - Injecte l'access token depuis le stockage local dans l en-tete
 *   Authorization.
 * - Sur reponse 401, tente un refresh silencieux une seule fois, puis
 *   rejoue la requete initiale. Si le refresh echoue, l evenement
 *   'auth:logout' est emis pour que le contexte d auth se vide.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const AUTH_STORAGE_KEY = 'grh-emmn-auth';

interface StoredAuth {
  accessToken: string;
  user: unknown;
}

function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    return parsed.accessToken ?? null;
  } catch {
    return null;
  }
}

function clearAuthStorage(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// ============================================================
// INTERCEPTEUR REQUETE : injecter le token
// ============================================================
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// INTERCEPTEUR REPONSE : gerer les 401 via refresh silencieux
// ============================================================

interface RefreshState {
  isRefreshing: boolean;
  subscribers: Array<(token: string | null) => void>;
}

const refreshState: RefreshState = {
  isRefreshing: false,
  subscribers: [],
};

function subscribeToRefresh(callback: (token: string | null) => void): void {
  refreshState.subscribers.push(callback);
}

function notifySubscribers(token: string | null): void {
  refreshState.subscribers.forEach((cb) => cb(token));
  refreshState.subscribers = [];
}

function shouldSkipRefresh(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const { status } = error.response;
    const url = originalRequest.url ?? '';

    if (status !== 401 || shouldSkipRefresh(url) || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (refreshState.isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeToRefresh((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    refreshState.isRefreshing = true;

    try {
      const response = await axios.post<{ accessToken: string; user: unknown }>(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newToken = response.data.accessToken;
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      const previous = raw ? (JSON.parse(raw) as StoredAuth) : null;

      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          accessToken: newToken,
          user: response.data.user ?? previous?.user,
        } satisfies StoredAuth),
      );

      notifySubscribers(newToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthStorage();
      notifySubscribers(null);
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);
    } finally {
      refreshState.isRefreshing = false;
    }
  },
);