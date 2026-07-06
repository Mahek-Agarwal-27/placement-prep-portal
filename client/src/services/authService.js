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
};

export default authService;
