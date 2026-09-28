import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui/Avatar';
import {
  MessageSquare,
  ShoppingBag,
  Bookmark,
  User as UserIcon,
  Sun,
  Moon,
  LogOut,
  PlusCircle,
  X,
} from 'lucide-react';
import { UNIVERSITIES, University } from '../../types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenCreatePost?: () => void;
  onOpenSellModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  onOpenCreatePost,
  onOpenSellModal,
}) => {
  const { user, logout, selectedUniversity, setSelectedUniversity } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const navItems = [
    { label: 'Discussions', path: '/', icon: MessageSquare },
    { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag, isMarket: true },
    { label: 'Saved', path: '/saved', icon: Bookmark },
    { label: 'My Profile', path: '/profile', icon: UserIcon },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#1E293B] shadow-2xl flex flex-col justify-between p-5 select-none transition-transform duration-300 border-r border-slate-200/80 dark:border-slate-800"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
      >
        <div>
          {/* Drawer Header with Close Button */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[42px] ${isActive
                      ? item.isMarket
                        ? 'bg-[#EEF5F0] text-[#285943] dark:bg-[#132A1F] dark:text-[#91CEA9]'
                        : 'bg-slate-100 text-[#17243A] dark:bg-slate-800 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            {onOpenCreatePost && (
              <button
                onClick={() => {
                  if (onClose) onClose();
                  onOpenCreatePost();
                }}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#17243A] hover:bg-[#101827] dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white text-white transition-colors shadow-xs min-h-[42px]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Discussion</span>
              </button>
            )}

            {onOpenSellModal && (
              <button
                onClick={() => {
                  if (onClose) onClose();
                  onOpenSellModal();
                }}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#EEF5F0] hover:bg-[#E3EFE6] text-[#285943] dark:bg-[#132A1F] dark:text-[#91CEA9] dark:hover:bg-[#183527] transition-colors border border-[#D9E8DE]/80 dark:border-slate-700 min-h-[40px]"
              >
                <span>List Study Resource</span>
              </button>
            )}
          </div>

          {/* Quick University Scope */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Focus Campus
            </label>
            <select
              value={selectedUniversity}
              onChange={(e) => {
                setSelectedUniversity(e.target.value as University);
                if (onClose) onClose();
              }}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#17243A]"
            >
              {UNIVERSITIES.map((uni) => (
                <option key={uni} value={uni}>
                  {uni === 'All' ? 'All Campuses' : `${uni} Gujrat`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Profile & Theme Toggle */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
          {user ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div
                onClick={() => {
                  if (onClose) onClose();
                  navigate('/profile');
                }}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
              >
                <Avatar name={user.name} size="sm" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user.university} · {user.batch}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => {
                  if (onClose) onClose();
                  navigate('/login');
                }}
                className="w-full py-2 text-xs font-semibold text-center text-[#17243A] dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};


