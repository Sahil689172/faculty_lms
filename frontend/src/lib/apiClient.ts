import axios from "axios";

/**
 * Vite inlines VITE_* at build time.
 * - Development: falls back to local API if unset.
 * - Production builds: VITE_API_BASE_URL is required (set it on Netlify).
 */
function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();

  if (fromEnv) {
    return fromEnv;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:4000/api";
  }

  throw new Error(
    "VITE_API_BASE_URL is missing. Set it in the Netlify site env (e.g. https://your-api.onrender.com/api) and rebuild.",
  );
}

const baseURL = resolveApiBaseUrl();

const TOKEN_KEY = "faculty_lms_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export const apiClient = axios.create({
  baseURL,
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);
