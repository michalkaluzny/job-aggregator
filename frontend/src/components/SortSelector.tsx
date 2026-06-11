import { SortOptions } from '../types/offer';

interface SortSelectorProps {
  sort: SortOptions;
  onSort: (sort: SortOptions) => void;
}

const SORT_OPTIONS: Array<{ label: string; value: SortOptions }> = [
  { label: 'Newest first', value: { sort_by: 'published_at', order: 'desc' } },
  { label: 'Oldest first', value: { sort_by: 'published_at', order: 'asc' } },
  { label: 'Highest salary', value: { sort_by: 'salary_from', order: 'desc' } },
  { label: 'Lowest salary', value: { sort_by: 'salary_from', order: 'asc' } },
];

function toKey(s: SortOptions) {
  return `${s.sort_by}_${s.order}`;
}

export function SortSelector({ sort, onSort }: SortSelectorProps) {
  const currentKey = toKey(sort);

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <label htmlFor="sort-select" className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
        Sort by
      </label>
      <select
        id="sort-select"
        value={currentKey}
        onChange={(e) => {
          const option = SORT_OPTIONS.find((o) => toKey(o.value) === e.target.value);
          if (option) onSort(option.value);
        }}
        className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={toKey(o.value)} value={toKey(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
