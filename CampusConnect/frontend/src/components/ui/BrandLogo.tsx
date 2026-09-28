import React from 'react';
import feedLogo from '../../assets/images/Feed_Logo.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  className?: string;
  iconClassName?: string;
  iconSize?: string;
}

export const BrandText: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl sm:text-3xl',
  };

  return (
    <span className={`${textSizes[size]} font-bold tracking-tight font-sans ${className}`}>
      <span className="text-[#152338] dark:text-slate-100">Campus</span>
      <span className="text-[#387652] dark:text-[#52B788]">Crew</span>
    </span>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showIcon = true,
  className = '',
  iconClassName = '',
  iconSize,
}) => {
  // Using inline pixel sizes instead of Tailwind classes to avoid purging issues
  const inlineSizes: Record<string, number> = {
    sm: 44,
    md: 56,
    lg: 64,
    xl: 80,
  };

  const px = inlineSizes[size] ?? 56;

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 whitespace-nowrap ${className}`}>
      {showIcon && (
        <div className="relative rounded-xl transition-all duration-300 p-1 bg-white border border-slate-200/80 shadow-xs dark:bg-white dark:ring-2 dark:ring-[#52B788] dark:shadow-[0_0_14px_rgba(82,183,136,0.4)] shrink-0 flex items-center justify-center">
          <img
            src={feedLogo}
            alt="CampusCrew Logo"
            style={{ width: px === 44 ? 32 : px, height: px === 44 ? 32 : px, minWidth: px === 44 ? 32 : px, minHeight: px === 44 ? 32 : px }}
            className={`object-contain rounded-lg shadow-xs transition-transform hover:scale-105 shrink-0 ${iconClassName}`}
          />
        </div>
      )}
      <BrandText size={size} className="whitespace-nowrap shrink-0" />
    </div>
  );
};
