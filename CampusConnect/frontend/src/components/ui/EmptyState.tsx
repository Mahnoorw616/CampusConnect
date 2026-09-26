import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'navy' | 'forest';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'navy',
}) => {
  const isForest = variant === 'forest';

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 my-6">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3.5 ${
          isForest
            ? 'bg-[#EEF5F0] text-[#285943] dark:bg-[#132A1F] dark:text-[#91CEA9]'
            : 'bg-slate-100 text-[#17243A] dark:bg-slate-800 dark:text-slate-200'
        }`}
      >
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`inline-flex items-center justify-center px-4 py-2 text-xs font-medium rounded-lg text-white transition-colors min-h-[40px] ${
            isForest
              ? 'bg-[#285943] hover:bg-[#193D2D]'
              : 'bg-[#17243A] hover:bg-[#101827] dark:bg-slate-800 dark:hover:bg-slate-700'
          }`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
