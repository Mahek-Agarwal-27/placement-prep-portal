/**
 * context/AuthContext.jsx — Global authentication state provider
 *
 * Syncs user auth credentials with localStorage and resolves profile data.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const res = await authService.getProfile();
          if (res.success) {
            setUser(res.data);
          } else {
            // Token might be corrupted/expired
            handleLogout();
          }
        } catch (error) {
          console.error('Failed to load profile on mount:', error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [token]);

  /**
   * Action: Signup handler
   */
  const handleSignup = async (userData) => {
    try {
      const res = await authService.signup(userData);
      if (res.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      return res;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMsg);
    }
  };

  /**
   * Action: Login handler
   */
  const handleLogin = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      return res;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      throw new Error(errorMsg);
    }
  };

  /**
   * Action: Update profile handler
   */
  const handleUpdateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
      return res;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Profile update failed';
      throw new Error(errorMsg);
    }
  };

  /**
   * Action: Logout handler
   */
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    signup: handleSignup,
    login: handleLogin,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
};

export default AuthContext;
