/**
 * services/api.js — Axios base instance
 *
 * All API calls go through this pre-configured instance.
 * The interceptor automatically attaches the JWT token from localStorage
 * so every request is authenticated without manual headers.
 */

import axios from 'axios';

// Base URL: in development Vite proxies /api → localhost:5000
// In production set VITE_API_URL in your .env
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  // Do NOT set a default Content-Type here.
  // Axios auto-detects it per request:
  //   - JSON body  → 'application/json'
  //   - FormData   → 'multipart/form-data; boundary=...' (boundary is required for multer)
  timeout: 30000, // 30s — resume analysis + Gemini can take time
});

// ── Request Interceptor ───────────────────────────────────────────────────────
// Attach JWT token from localStorage before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// Handle 401 gracefully: clear storage if needed, but avoid hard window.location reloads
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      console.warn('Unauthorized request (401). Token may be missing or expired.');
      // Remove invalid tokens without triggering a full page refresh
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
