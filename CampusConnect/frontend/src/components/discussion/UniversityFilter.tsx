import React from 'react';
import { University, UNIVERSITIES } from '../../types';

interface UniversityFilterProps {
  selectedUniversity: University;
  onSelectUniversity: (uni: University) => void;
  className?: string;
}

export const UniversityFilter: React.FC<UniversityFilterProps> = ({
  selectedUniversity,
  onSelectUniversity,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 ${className}`}
      role="tablist"
      aria-label="Filter discussions by university"
    >
      {UNIVERSITIES.map((uni) => {
        const isSelected = selectedUniversity === uni;
        const label = uni === 'All' ? 'All Campuses' : uni;

        return (
          <button
            key={uni}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectUniversity(uni)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[36px] flex items-center justify-center ${
              isSelected
                ? 'bg-[#17243A] text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs font-semibold'
                : 'bg-white dark:bg-[#131D31] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
