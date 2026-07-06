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
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 s timeout
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
