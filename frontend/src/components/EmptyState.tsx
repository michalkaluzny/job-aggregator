interface EmptyStateProps {
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function EmptyState({ hasActiveFilters, onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
        No offers found
      </h3>
      {hasActiveFilters ? (
        <>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
            Don't give up! Try removing some filters or check back tomorrow — new
            opportunities are added every day.
          </p>
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Reset all filters
          </button>
        </>
      ) : (
        <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          Looks like the database is empty. Make sure the backend scrapers have
          run at least once.
        </p>
      )}
    </div>
  );
}
