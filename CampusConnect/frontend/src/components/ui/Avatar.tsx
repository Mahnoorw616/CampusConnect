import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  bgColor?: string;
}

const colorPalette = [
  'bg-[#17243A] text-white',
  'bg-[#285943] text-white',
  'bg-[#334155] text-slate-100',
  'bg-[#1E293B] text-slate-100',
  'bg-[#1E3A5F] text-slate-100',
  'bg-[#2D3748] text-slate-100',
];

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getDeterministicColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  className = '',
  bgColor,
}) => {
  const initials = getInitials(name);
  const colorClass = bgColor ? '' : getDeterministicColor(name);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base font-semibold',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-medium shrink-0 select-none ${sizeClasses[size]} ${colorClass} ${className}`}
      style={bgColor ? { backgroundColor: bgColor, color: '#ffffff' } : undefined}
      aria-label={`Avatar of ${name}`}
    >
      {initials}
    </div>
  );
};
