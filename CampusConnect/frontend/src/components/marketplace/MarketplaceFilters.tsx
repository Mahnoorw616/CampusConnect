import React from 'react';
import { University, UNIVERSITIES } from '../../types';
import { Search } from 'lucide-react';

interface MarketplaceFiltersProps {
  selectedUniversity: University;
  onSelectUniversity: (uni: University) => void;
  priceFilter: 'all' | 'free' | 'paid';
  onSelectPriceFilter: (filter: 'all' | 'free' | 'paid') => void;
  courseQuery: string;
  onCourseQueryChange: (q: string) => void;
}

export const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  selectedUniversity,
  onSelectUniversity,
  priceFilter,
  onSelectPriceFilter,
  courseQuery,
  onCourseQueryChange,
}) => {
  return (
    <div className="space-y-3 mb-6">
      {/* University bar & quick course search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* University tabs */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5"
          role="tablist"
        >
          {UNIVERSITIES.map((uni) => {
            const isSelected = selectedUniversity === uni;
            return (
              <button
                key={uni}
                onClick={() => onSelectUniversity(uni)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[36px] ${
                  isSelected
                    ? 'bg-[#285943] text-white shadow-xs font-semibold'
                    : 'bg-white dark:bg-[#131D31] text-slate-700 dark:text-slate-300 hover:text-slate-900 border border-[#D9E8DE]/70 dark:border-slate-800'
                }`}
              >
                {uni === 'All' ? 'All Campuses' : uni}
              </button>
            );
          })}
        </div>

        {/* Quick filter by course / keyword */}
        <div className="relative min-w-[200px] sm:w-56 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={courseQuery}
            onChange={(e) => onCourseQueryChange(e.target.value)}
            placeholder="Course (e.g. MTH101, CS201)..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-white dark:bg-[#131D31] border border-[#D9E8DE]/80 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#285943]"
          />
        </div>
      </div>

      {/* Free vs Paid Toggle Bar */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-500 dark:text-slate-400 mr-1.5 font-medium">Pricing:</span>
        <button
          onClick={() => onSelectPriceFilter('all')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            priceFilter === 'all'
              ? 'bg-[#285943] text-white font-semibold'
              : 'bg-white/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-[#D9E8DE]/60 dark:border-slate-800'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => onSelectPriceFilter('free')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            priceFilter === 'free'
              ? 'bg-[#285943] text-white font-semibold'
              : 'bg-white/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-[#D9E8DE]/60 dark:border-slate-800'
          }`}
        >
          Free Only
        </button>
        <button
          onClick={() => onSelectPriceFilter('paid')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            priceFilter === 'paid'
              ? 'bg-[#285943] text-white font-semibold'
              : 'bg-white/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-[#D9E8DE]/60 dark:border-slate-800'
          }`}
        >
          Books & Paid
        </button>
      </div>
    </div>
  );
};
