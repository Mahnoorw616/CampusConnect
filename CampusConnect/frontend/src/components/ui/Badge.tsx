import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'university' | 'category' | 'free' | 'price' | 'outline';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    default:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700',
    university:
      'bg-slate-100 text-[#17243A] dark:bg-slate-800/80 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium',
    category:
      'bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60',
    free:
      'bg-[#EEF5F0] text-[#285943] dark:bg-[#132B20] dark:text-[#88C6A5] border border-[#D9E8DE] dark:border-[#1E4231] font-semibold',
    price:
      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium',
    outline:
      'bg-transparent text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-normal leading-none tracking-tight ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
