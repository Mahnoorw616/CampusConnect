import React from 'react';
import { MarketplaceItem } from '../../types';
import { Badge } from '../ui/Badge';
import { WhatsAppButton } from './WhatsAppButton';
import { FileText, ExternalLink } from 'lucide-react';

interface MarketplaceCardProps {
  item: MarketplaceItem;
  onClick: (item: MarketplaceItem) => void;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ item, onClick }) => {
  const isFree = item.price === 0;

  return (
    <article
      onClick={() => onClick(item)}
      className="group bg-white dark:bg-[#131D31] border border-[#D9E8DE]/60 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer text-left"
    >
      <div>
        {/* Cover image or clean educational placeholder */}
        <div className="relative aspect-[16/10] bg-[#EEF5F0] dark:bg-[#0E2319] overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80">
          {item.coverImage ? (
            <img
              src={item.coverImage}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                // Fallback to minimal academic slate if image path fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-[#285943] dark:text-[#88C6A5]">
              <FileText className="w-8 h-8 opacity-60 mb-1.5" />
              <span className="text-[11px] font-mono tracking-wider uppercase font-semibold">
                {item.courseCode}
              </span>
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-xs border border-slate-200/50 dark:border-slate-700/50 shadow-xs">
              {item.university}
            </span>
            {isFree ? (
              <Badge variant="free" size="sm">
                Free
              </Badge>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#285943] text-white shadow-xs">
                Rs. {item.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-[#285943] dark:text-[#88C6A5] font-medium mb-1">
            <span>{item.courseCode}</span>
            <span>·</span>
            <span className="truncate">{item.courseName}</span>
          </div>

          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug mb-2 group-hover:text-[#285943] dark:group-hover:text-[#91CEA9] transition-colors">
            {item.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">
            Listed by <span className="font-medium text-slate-700 dark:text-slate-300">{item.sellerName}</span>
          </div>
        </div>
      </div>

      {/* Footer: Price & WhatsApp Action */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Price</div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {isFree ? (
              <span className="text-[#285943] dark:text-[#88C6A5]">Free</span>
            ) : (
              `Rs. ${item.price.toLocaleString()}`
            )}
          </div>
        </div>

        <WhatsAppButton
          phone={item.sellerWhatsapp}
          itemTitle={item.title}
          sellerName={item.sellerName}
          size="sm"
        />
      </div>
    </article>
  );
};
