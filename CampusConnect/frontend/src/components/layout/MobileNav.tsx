import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, ShoppingBag, Bookmark, User as UserIcon } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const tabs = [
    { label: 'Feed', path: '/', icon: Home },
    { label: 'Discuss', path: '/discussions', icon: MessageSquare },
    { label: 'Market', path: '/marketplace', icon: ShoppingBag, isMarket: true },
    { label: 'Saved', path: '/saved', icon: Bookmark },
    { label: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#101827]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors select-none ${
                  isActive
                    ? tab.isMarket
                      ? 'text-[#285943] dark:text-[#91CEA9]'
                      : 'text-[#17243A] dark:text-slate-100 font-semibold'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={2} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
