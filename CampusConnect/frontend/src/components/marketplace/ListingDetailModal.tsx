import React from 'react';
import { MarketplaceItem } from '../../types';
import { WhatsAppButton } from './WhatsAppButton';
import { X, BookOpen, ExternalLink, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface ListingDetailModalProps {
  item: MarketplaceItem | null;
  onClose: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;
  const isFree = item.price === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-modal-title"
    >
      <div className="bg-white dark:bg-[#131D31] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF5F0] text-[#285943] dark:bg-[#132A1F] dark:text-[#91CEA9]">
              {item.university}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
              {item.courseCode}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Optional cover preview */}
          {item.coverImage && (
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <h2
              id="listing-modal-title"
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug mb-1.5"
            >
              {item.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#285943] dark:text-[#88C6A5] font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{item.courseName}</span>
              <span>({item.courseCode})</span>
            </div>
          </div>

          {/* Pricing & Availability Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#EEF5F0]/60 dark:bg-[#0E2319]/50 border border-[#D9E8DE]/60 dark:border-[#1E3F2D]">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Price
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isFree ? (
                  <span className="text-[#285943] dark:text-[#88C6A5]">Free (Student gift)</span>
                ) : (
                  `Rs. ${item.price.toLocaleString()}`
                )}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Exchange Type
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#285943] dark:text-[#88C6A5]" />
                <span>On-campus or direct link</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Item Details
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          {/* Digital Link if present */}
          {item.driveLink && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Google Drive / Cloud Resource Attached
                </div>
                <div className="text-[11px] text-slate-500 truncate">{item.driveLink}</div>
              </div>
              <a
                href={item.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#285943] dark:text-[#88C6A5] bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shrink-0"
              >
                <span>Open Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Seller Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D31] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={item.sellerName} size="md" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.sellerName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Student at {item.university} · Verified Peer
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-200/50 dark:border-emerald-800/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Verified</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#285943] dark:text-[#88C6A5] shrink-0" />
            <span>
              Tip: Reach out directly on WhatsApp to coordinate hand-off at your campus library or cafeteria.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Total</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isFree ? 'Free' : `Rs. ${item.price.toLocaleString()}`}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors min-h-[42px]"
            >
              Close
            </button>
            <WhatsAppButton
              phone={item.sellerWhatsapp}
              itemTitle={item.title}
              sellerName={item.sellerName}
              size="lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
