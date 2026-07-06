/**
 * context/AuthContext.jsx — Global authentication state
 *
 * Provides user state and auth actions (login, signup, logout)
 * to the entire React tree.
 *
 * NOTE: Full implementation will be done in Phase 2.
 *       This file is scaffolded here so App.jsx can import it cleanly.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context object
const AuthContext = createContext(null);

/**
 * AuthProvider — Wrap your app with this to provide auth state globally.
 */
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // On mount: restore user from localStorage if a token exists
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * login — store token and user in state + localStorage
   * @param {string} token - JWT token from backend
   * @param {object} user  - User data object from backend
   */
  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  /**
   * logout — clear all auth state and redirect to login
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = { user, token, loading, login, logout, isAuthenticated: !!token };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — custom hook for consuming auth context
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
};

export default AuthContext;
