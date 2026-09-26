import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BrandLogo } from '../ui/BrandLogo';
import { Avatar } from '../ui/Avatar';
import { Moon, Sun, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenCreatePost?: () => void;
  pageTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreatePost, pageTitle }) => {
  const { user, selectedUniversity } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#101827]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Zone 1: Brand title, single line */}
      <Link to="/">
        <BrandLogo size="sm" />
      </Link>

      {/* Zone 2: Navigation / Current Context / Campus Filter label */}
      <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="text-slate-400 font-normal">Active Community:</span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#17243A] dark:text-slate-200">
          {selectedUniversity === 'All' ? 'All Campuses (ISB/RWP)' : `${selectedUniversity} Islamabad`}
        </span>
      </div>

      {/* Zone 3: Actions (Theme toggle, Quick create, User Profile) */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle light and dark mode"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {onOpenCreatePost && (
          <button
            onClick={onOpenCreatePost}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#17243A] hover:bg-[#101827] dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white rounded-lg transition-colors min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Campus</span>
          </button>
        )}

        {user && (
          <Link
            to="/profile"
            className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-[#17243A]/20 transition-all ml-1"
            aria-label="Open profile"
          >
            <Avatar name={user.name} size="sm" />
          </Link>
        )}
      </div>
    </header>
  );
};
