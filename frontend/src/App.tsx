import { useState } from 'react';
import { useDarkMode } from './hooks/useDarkMode';
import { useOffers } from './hooks/useOffers';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { SortSelector } from './components/SortSelector';
import { OfferCard } from './components/OfferCard';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { Pagination } from './components/Pagination';

export default function App() {
  const { isDark, toggle } = useDarkMode();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    data,
    loading,
    error,
    filters,
    sort,
    page,
    setPage,
    updateFilters,
    updateSort,
    resetFilters,
    retry,
  } = useOffers();

  const hasActiveFilters =
    filters.juniorType !== 'junior' ||
    filters.workplace_type !== '' ||
    filters.city !== '' ||
    filters.skill !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900">
      <Header isDark={isDark} onToggleDark={toggle} totalOffers={data?.total} />

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-700 dark:to-violet-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <p className="text-2xl sm:text-3xl font-bold mb-1">
            Your first IT job starts here 🚀
          </p>
          <p className="text-indigo-200 text-sm sm:text-base">
            Curated junior & internship offers in Poland — updated daily.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile: filter toggle button */}
        <button
          className="md:hidden flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zM6 10a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zM10 16a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z" />
          </svg>
          {filtersOpen ? 'Hide filters' : 'Show filters'}
          {hasActiveFilters && (
            <span className="ml-1 w-2 h-2 bg-indigo-500 rounded-full" />
          )}
        </button>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Sidebar / collapsible filter panel */}
          <aside className={`w-full md:w-64 lg:w-72 flex-shrink-0 md:sticky md:top-20 ${filtersOpen ? 'block' : 'hidden'} md:block`}>
            <FilterPanel
              filters={filters}
              onUpdate={updateFilters}
              onReset={resetFilters}
            />
          </aside>

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar: results count + sort */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {loading ? (
                  <span className="bg-slate-200 dark:bg-slate-700 rounded animate-pulse inline-block w-36 h-4" />
                ) : data ? (
                  <>
                    Showing{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {data.items.length}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {data.total}
                    </span>{' '}
                    offers
                  </>
                ) : null}
              </p>
              <SortSelector sort={sort} onSort={updateSort} />
            </div>

            {/* Content states */}
            {loading && <LoadingSkeleton />}

            {error && !loading && <ErrorState message={error} onRetry={retry} />}

            {!loading && !error && data?.items.length === 0 && (
              <EmptyState hasActiveFilters={hasActiveFilters} onReset={resetFilters} />
            )}

            {!loading && !error && data && data.items.length > 0 && (
              <>
                <div className="space-y-4">
                  {data.items.map((offer) => (
                    <OfferCard key={offer.guid} offer={offer} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={data.pages}
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-400 dark:text-slate-500">
          <span>© {new Date().getFullYear()} JuniorHub</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
