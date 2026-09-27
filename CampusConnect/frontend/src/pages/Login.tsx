import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import { BrandLogo } from '../components/ui/BrandLogo';
import { ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide your university email and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email.trim())) {
      setError('Please provide a complete and valid email address.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back to CampusCrew!', 'success');
      navigate('/');
    } catch (error) {
      setError(getErrorMessage(error, 'Invalid login credentials. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B111E] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <BrandLogo size="lg" />
          </Link>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
            Sign in to your campus community
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect with students from UOG, ILM, Superior, UOC, Swedish, and UOP.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white dark:bg-[#131D31] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                University Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@uog.edu.pk"
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#17243A]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Password reset instructions sent to university email', 'info')}
                  className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#17243A]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-[#17243A] hover:bg-[#101827] dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white transition-colors shadow-xs disabled:opacity-50 min-h-[42px]"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-slate-900 dark:text-slate-100 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};