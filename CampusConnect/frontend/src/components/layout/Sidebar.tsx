import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { BrandLogo } from '../ui/BrandLogo';
import {
  Home,
  MessageSquare,
  ShoppingBag,
  Bookmark,
  User as UserIcon,
  Sun,
  Moon,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { UNIVERSITIES, University } from '../../types';

interface SidebarProps {
  onOpenCreatePost?: () => void;
  onOpenSellModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreatePost, onOpenSellModal }) => {
  const { user, logout, selectedUniversity, setSelectedUniversity } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Discussions', path: '/', icon: MessageSquare },
    { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag, isMarket: true },
    { label: 'Saved', path: '/saved', icon: Bookmark },
    { label: 'My Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between h-screen sticky top-0 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#101827] p-5 select-none z-20">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 mb-7">
          <Link to="/">
            <BrandLogo size="md" />
          </Link>
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
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[42px] ${
                    isActive
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
              onClick={onOpenCreatePost}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#17243A] hover:bg-[#101827] dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white text-white transition-colors shadow-xs min-h-[42px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Discussion</span>
            </button>
          )}

          {onOpenSellModal && (
            <button
              onClick={onOpenSellModal}
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
            onChange={(e) => setSelectedUniversity(e.target.value as University)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#17243A]"
          >
            {UNIVERSITIES.map((uni) => (
              <option key={uni} value={uni}>
                {uni === 'All' ? 'All Campuses' : `${uni} Islamabad`}
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
              onClick={() => navigate('/profile')}
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
              onClick={() => navigate('/login')}
              className="w-full py-2 text-xs font-semibold text-center text-[#17243A] dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
