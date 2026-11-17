export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Server-side requests (layouts, server components) can't always reach the backend on the
// browser's URL, e.g. inside Docker, where it is http://backend:3000 instead of localhost.
export const SERVER_API_URL = process.env.INTERNAL_API_URL || API_URL;

// Must match AUTH_COOKIE_NAME in the backend environment.
export const AUTH_COOKIE_NAME = process.env.NEXT_AUTH_COOKIE_NAME || 'access_token';

// Routes that are reachable without being signed in.
export const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];
