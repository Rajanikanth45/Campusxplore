import React from 'react';

export default function CategoryPill({
  category,
  isSelected = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
        isSelected
          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/20'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-orange-50 dark:hover:bg-slate-700 hover:border-orange-300 dark:hover:border-orange-600'
      }`}
    >
      <span>{category.name}</span>
      {category.facility_count !== undefined && (
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            isSelected
              ? 'bg-white/25 text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
          }`}
        >
          {category.facility_count}
        </span>
      )}
    </button>
  );
}
