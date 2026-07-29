import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      const msg = err.message || 'Invalid email or password';
      setError(msg.includes('credentials') ? 'Invalid email or password. Please check your credentials or click Sign Up to create an account.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-sm animate-fade-in">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo textClassName="text-2xl font-bold" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-1">
            Welcome Back
          </h1>
          <p className="text-slate-500 text-xs">
            Sign in to your HireNovaAI portal account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              className="input-field text-xs"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              className="input-field text-xs"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <div className="flex justify-end mt-1.5">
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-2.5 text-xs font-semibold mt-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 text-xs">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-4"
          >
            Sign up now
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
