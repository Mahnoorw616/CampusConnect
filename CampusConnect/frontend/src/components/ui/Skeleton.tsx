import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800/80 ${className}`}
      aria-hidden="true"
    />
  );
};

export const PostCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#131D31] border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 mb-4 shadow-xs">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-24" />
        </div>
        <Skeleton className="h-5 w-16 rounded" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-2.5" />
      <Skeleton className="h-3.5 w-full mb-1.5" />
      <Skeleton className="h-3.5 w-5/6 mb-4" />
      <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
};

export const MarketplaceCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#131D31] border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xs">
      <Skeleton className="w-full aspect-[4/3]" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-5 w-4/5 mb-1.5" />
          <Skeleton className="h-3.5 w-full mb-1" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
