import axios, { isAxiosError } from 'axios';
import { API_URL, PUBLIC_PATHS } from './config';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // A 401 on a public page (e.g. wrong password on /login) is shown inline.
      const onPublicPage = PUBLIC_PATHS.some((path) => window.location.pathname.startsWith(path));
      if (!onPublicPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** Extracts the backend's error message (string or validation array) from a failed request. */
export function getErrorMessage(err: unknown, fallback: string): string {
  const message = isAxiosError(err) ? err.response?.data?.message : undefined;
  return (Array.isArray(message) ? message[0] : message) || fallback;
}

export function getErrorStatus(err: unknown): number | undefined {
  return isAxiosError(err) ? err.response?.status : undefined;
}
