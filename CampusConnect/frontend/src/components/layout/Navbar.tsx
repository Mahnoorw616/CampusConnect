import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BrandLogo } from '../ui/BrandLogo';
import { Avatar } from '../ui/Avatar';
import { Moon, Sun, Plus, Bell, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleDrawer?: () => void;
  onOpenCreatePost?: () => void;
  onOpenNotifications?: () => void;
  unreadCount?: number;
  pageTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleDrawer, onOpenCreatePost, onOpenNotifications, unreadCount = 0 }) => {
  const { user, selectedUniversity } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#101827] border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
      {/* Zone 1: Hamburger Menu + Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onToggleDrawer && (
          <button
            onClick={onToggleDrawer}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
            title="Open navigation menu"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to="/" className="flex items-center shrink-0">
          <BrandLogo size="sm" />
        </Link>
      </div>

      {/* Zone 2: Navigation / Current Context / Campus Filter label */}
      <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="text-slate-400 font-normal">Active Community:</span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#17243A] dark:text-slate-200">
          {selectedUniversity === 'All' ? 'All Campuses (Gujrat)' : `${selectedUniversity} Gujrat`}
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

        {user && onOpenNotifications && (
          <button onClick={onOpenNotifications} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} className="relative flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold">{unreadCount > 99 ? '99+' : unreadCount}</span>}
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
