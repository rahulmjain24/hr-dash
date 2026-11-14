// apps/frontend/src/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  // Point this to your NestJS backend
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  
  // CRITICAL: This tells the browser to send the HTTP-Only cookie with every request
  withCredentials: true,
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add a response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login page if the cookie expires
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);