import { Filters, JuniorType } from '../types/offer';

interface FilterPanelProps {
  filters: Filters;
  onUpdate: (f: Partial<Filters>) => void;
  onReset: () => void;
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition';

const labelClass = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5';

export function FilterPanel({ filters, onUpdate, onReset }: FilterPanelProps) {
  const isModified =
    filters.juniorType !== 'junior' ||
    filters.workplace_type !== '' ||
    filters.city !== '' ||
    filters.skill !== '';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
          Filters
        </h2>
        {isModified && (
          <button
            onClick={onReset}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Junior type */}
      <div>
        <label htmlFor="filter-junior-type" className={labelClass}>
          I'm looking for
        </label>
        <select
          id="filter-junior-type"
          value={filters.juniorType}
          onChange={(e) => onUpdate({ juniorType: e.target.value as JuniorType })}
          className={inputClass}
        >
          <option value="junior">Junior position</option>
          <option value="intern">Internship</option>
        </select>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {filters.juniorType === 'junior'
            ? 'Filters by experience level: junior'
            : 'Filters by working time: internship'}
        </p>
      </div>

      {/* Workplace type */}
      <div>
        <label htmlFor="filter-workplace" className={labelClass}>
          Workplace
        </label>
        <select
          id="filter-workplace"
          value={filters.workplace_type}
          onChange={(e) => onUpdate({ workplace_type: e.target.value })}
          className={inputClass}
        >
          <option value="">All locations</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="office">Office</option>
        </select>
      </div>

      {/* City */}
      <div>
        <label htmlFor="filter-city" className={labelClass}>
          City
        </label>
        <input
          id="filter-city"
          type="text"
          placeholder="e.g. Warszawa"
          value={filters.city}
          onChange={(e) => onUpdate({ city: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Skill */}
      <div>
        <label htmlFor="filter-skill" className={labelClass}>
          Technology / Skill
        </label>
        <input
          id="filter-skill"
          type="text"
          placeholder="e.g. Python, React"
          value={filters.skill}
          onChange={(e) => onUpdate({ skill: e.target.value })}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Searches in required skills
        </p>
      </div>

      {/* Reset button — shown at bottom too for convenience */}
      <button
        onClick={onReset}
        disabled={!isModified}
        className="w-full py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Reset filters
      </button>
    </div>
  );
}
