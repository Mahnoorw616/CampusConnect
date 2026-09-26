import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
  itemTitle: string;
  sellerName?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  itemTitle,
  sellerName,
  size = 'md',
  fullWidth = false,
  className = '',
}) => {
  // Normalize phone number to international Pakistani or standard format
  let cleanNumber = phone.replace(/\D/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '92' + cleanNumber.substring(1);
  } else if (!cleanNumber.startsWith('92') && cleanNumber.length === 10) {
    cleanNumber = '92' + cleanNumber;
  }

  const message = `Hi${sellerName ? ` ${sellerName}` : ''}, I saw your listing for "${itemTitle}" on CampusCrew. Is this still available?`;
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-3.5 py-2 text-xs font-medium gap-2 min-h-[40px]',
    lg: 'px-4 py-2.5 text-sm font-medium gap-2.5 min-h-[44px]',
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center rounded-lg transition-all text-white bg-[#285943] hover:bg-[#193D2D] active:scale-[0.98] ${
        sizeClasses[size]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      aria-label={`Chat on WhatsApp with seller for ${itemTitle}`}
    >
      <MessageCircle className="w-4 h-4 shrink-0" />
      <span>Chat on WhatsApp</span>
    </a>
  );
};
