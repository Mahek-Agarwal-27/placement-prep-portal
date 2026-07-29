/**
 * services/authService.js — Client-side authentication service calls
 *
 * Wraps Axios endpoint calls for:
 *  - signup
 *  - login
 *  - getProfile
 */

import api from './api';

const authService = {
  /**
   * Registers a new user account
   * @param {Object} userData - { name, email, password }
   */
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data; // { success, message, data: { token, user } }
  },

  /**
   * Logins user and fetches token
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; // { success, message, data: { token, user } }
  },

  /**
   * Fetches profile of the currently logged-in user
   */
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data; // { success, message, data: user }
  },

  /**
   * Updates profile of the currently logged-in user
   * @param {Object} profileData - fields to update
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data; // { success, message, data: user }
  },

  /**
   * Sends a request to send a password reset link to user's email
   * @param {string} email 
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Resets user password using the reset token
   * @param {string} token 
   * @param {string} password 
   */
  resetPassword: async (token, password) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
};

export default authService;
