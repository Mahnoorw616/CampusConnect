import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import { REGISTER_UNIVERSITIES, University } from '../types';
import { BrandLogo } from '../components/ui/BrandLogo';
import { ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState<Exclude<University, 'All'>>('UOG');
  const [batch, setBatch] = useState('Batch 2026');
  const [whatsapp, setWhatsapp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email.trim())) {
      setError('Please provide a complete and valid email address, for example student@uog.edu.pk.');
      return;
    }
    if (password.length < 8) {
      setError('Password should be at least 8 characters.');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,}$/.test(password)) {
      setError('Password must include uppercase and lowercase letters, a number, and a special character.');
      return;
    }
    if (!whatsapp.trim()) {
      setError('Please provide your WhatsApp number for peer book/notes inquiries.');
      return;
    }
    const batchYear = Number(batch.replace(/\D/g, ''));
    if (!Number.isInteger(batchYear) || batchYear < 2000 || batchYear > 2100) {
      setError('Batch year must be a year between 2000 and 2100.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        university,
        batch,
        whatsapp,
      });
      showToast('Welcome to CampusCrew! Your student account is active.', 'success');
      navigate('/');
    } catch (error) {
      setError(getErrorMessage(error, 'Could not complete registration.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B111E] flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-2">
            <BrandLogo size="lg" />
          </Link>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
            Join the student-to-student community
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Discuss courses, discover notes, and connect with peers.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-[#131D31] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ahmed Khan"
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#17243A]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                University Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@uog.edu.pk or student@ilm.edu.pk"
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#17243A]"
              />
            </div>

            {/* University & Batch Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  University *
                </label>
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value as Exclude<University, 'All'>)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#17243A]"
                >
                  {REGISTER_UNIVERSITIES.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Batch Year *
                </label>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="e.g. Batch 2026"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#17243A]"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Contact Number *
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 03001234567 or 923001234567"
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#17243A]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Used strictly when students click to buy/request notes from your listings.
              </span>
            </div>

            {/* Password */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ chars: Aa1!"
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#17243A]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-[#17243A] hover:bg-[#101827] dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white transition-colors shadow-xs disabled:opacity-50 min-h-[42px]"
            >
              <span>{isLoading ? 'Creating account...' : 'Join CampusCrew'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-slate-900 dark:text-slate-100 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
