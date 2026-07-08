/**
 * pages/LoginPage.jsx — User Login UI
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Redirect back to original path if specified, else dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="card w-full max-w-md bg-slate-900 border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden animate-fade-in">
        {/* Glow effect */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-10"></div>

        <div className="relative">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo className="h-10 w-10 animate-fade-in" textClassName="text-2xl font-black" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm">
              Sign in to your HireNova AI account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 mt-2"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
