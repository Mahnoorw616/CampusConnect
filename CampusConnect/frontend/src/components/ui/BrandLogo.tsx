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
      <span className="text-[#387652]">Crew</span>
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
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {showIcon && (
        <img
          src={feedLogo}
          alt="CampusCrew Logo"
          style={{ width: px, height: px, minWidth: px, minHeight: px }}
          className={`object-contain rounded-xl shadow-xs transition-transform hover:scale-105 shrink-0 ${iconClassName}`}
        />
      )}
      <BrandText size={size} />
    </div>
  );
};
