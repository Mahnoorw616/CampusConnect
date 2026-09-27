import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Post, MarketplaceItem } from '../../types';
import { ArrowUpRight, ShieldCheck, Sparkles, BookOpen, MessageSquare } from 'lucide-react';

interface RightSidebarProps {
  trendingPosts?: Post[];
  marketplaceHighlights?: MarketplaceItem[];
  onSelectPost?: (postId: string) => void;
  onSelectMarketplace?: (item: MarketplaceItem) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  trendingPosts = [],
  marketplaceHighlights = [],
  onSelectPost,
  onSelectMarketplace,
}) => {
  const navigate = useNavigate();

  return (
    <aside className="w-80 shrink-0 hidden xl:flex flex-col gap-5 py-6 pl-4 pr-6 select-none">
      {/* Community Ethos Card */}
      <div className="bg-white dark:bg-[#131D31] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-[#17243A] dark:text-slate-300" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#17243A] dark:text-slate-300">
            Students Helping Students
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
          CampusCrew is a peer-to-peer student community across Islamabad and Rawalpindi. Share notes, discuss electives, and connect without commercial markups.
        </p>
        <div className="text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2 flex items-center justify-between">
          <span>Active Campuses</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            UOG · ILM · Superior · UOC · Swedish · UOP
          </span>
        </div>
      </div>

      {/* Marketplace Highlights */}
      {marketplaceHighlights.length > 0 && (
        <div className="bg-[#EEF5F0]/70 dark:bg-[#0E2319]/50 border border-[#D9E8DE]/70 dark:border-[#1E3E2E] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#285943] dark:text-[#91CEA9]" />
              <h4 className="text-xs font-bold text-[#193D2D] dark:text-[#91CEA9] uppercase tracking-wider">
                Fresh Study Materials
              </h4>
            </div>
            <button
              onClick={() => navigate('/marketplace')}
              className="text-[11px] text-[#285943] dark:text-[#91CEA9] hover:underline flex items-center gap-0.5 font-medium"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {marketplaceHighlights.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => (onSelectMarketplace ? onSelectMarketplace(item) : navigate('/marketplace'))}
                className="p-2.5 rounded-lg bg-white/90 dark:bg-[#13281E] border border-[#D9E8DE]/80 dark:border-slate-800/80 hover:border-[#285943] dark:hover:border-[#387B5B] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
                  <span className="font-medium text-[#285943] dark:text-[#88C6A5]">
                    {item.courseCode}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.price === 0 ? 'Free' : `Rs. ${item.price}`}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#285943] dark:group-hover:text-[#88C6A5] transition-colors line-clamp-1">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {item.university} · {item.sellerName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Discussions */}
      {trendingPosts.length > 0 && (
        <div className="bg-white dark:bg-[#131D31] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Trending on Campus
              </h4>
            </div>
            <button
              onClick={() => navigate('/discussions')}
              className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
            >
              See More
            </button>
          </div>

          <div className="space-y-3">
            {trendingPosts.slice(0, 3).map((p) => (
              <div
                key={p.id}
                onClick={() => (onSelectPost ? onSelectPost(p.id) : navigate('/discussions'))}
                className="cursor-pointer group pb-2.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {p.authorUniversity}
                  </span>
                  <span>·</span>
                  <span>{p.category}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#17243A] dark:group-hover:text-white transition-colors line-clamp-2 leading-snug">
                  {p.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>
                    {Object.values(p.reactions ?? {}).reduce((a: number, b) => a + (b as number), 0)} reactions
                  </span>
                  <span>·</span>
                  <span>{p.commentCount} comments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines reminder */}
      <div className="px-2 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
        Respect fellow students. Keep discussions constructive. WhatsApp interactions should remain respectful and direct.
      </div>
    </aside>
  );
};