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
// Handle 401 globally: clear storage and redirect to login
// BUT skip redirect for auth endpoints (login/signup) — those 401s are just
// "wrong credentials" and should be handled by the form's own catch block.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
