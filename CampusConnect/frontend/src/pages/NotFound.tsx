import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B111E] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 mb-4">
        <GraduationCap className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
        Page Not Found
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        The campus page or resource you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#17243A] text-white dark:bg-slate-200 dark:text-slate-900 text-xs font-semibold rounded-lg hover:bg-[#101827] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campus Feed</span>
      </Link>
    </div>
  );
};
