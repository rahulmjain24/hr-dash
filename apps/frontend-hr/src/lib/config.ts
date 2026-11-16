export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Must match AUTH_COOKIE_NAME in the backend environment.
export const AUTH_COOKIE_NAME = process.env.NEXT_AUTH_COOKIE_NAME || 'access_token';

// Routes that are reachable without being signed in.
export const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];
