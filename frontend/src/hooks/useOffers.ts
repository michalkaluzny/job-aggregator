import { useState, useEffect } from 'react';
import { fetchOffers } from '../api/offers';
import { PaginatedResponse, Filters, SortOptions, JuniorType } from '../types/offer';
import { PAGE_SIZE, DEBOUNCE_MS } from '../constants';
import { useDebounce } from './useDebounce';

const DEFAULT_FILTERS: Filters = {
  juniorType: 'junior',
  workplace_type: '',
  city: '',
  skill: '',
  title: '',
};

const DEFAULT_SORT: SortOptions = {
  sort_by: 'published_at',
  order: 'desc',
};

// ─── URL helpers ─────────────────────────────────────────────────────────────

function readFiltersFromUrl(): Filters {
  const p = new URLSearchParams(window.location.search);
  return {
    juniorType: (p.get('type') as JuniorType) ?? 'junior',
    workplace_type: p.get('workplace') ?? '',
    city: p.get('city') ?? '',
    skill: p.get('skill') ?? '',
    title: p.get('title') ?? '',
  };
}

function readSortFromUrl(): SortOptions {
  const p = new URLSearchParams(window.location.search);
  return {
    sort_by: p.get('sort_by') ?? 'published_at',
    order: (p.get('order') as 'asc' | 'desc') ?? 'desc',
  };
}

function readPageFromUrl(): number {
  const p = new URLSearchParams(window.location.search);
  const page = parseInt(p.get('page') ?? '1', 10);
  return isNaN(page) || page < 1 ? 1 : page;
}

// Only writes non-default values to keep the URL clean
function syncToUrl(filters: Filters, sort: SortOptions, page: number) {
  const p = new URLSearchParams();

  if (filters.juniorType !== 'junior') p.set('type', filters.juniorType);
  if (filters.workplace_type) p.set('workplace', filters.workplace_type);
  if (filters.city) p.set('city', filters.city);
  if (filters.skill) p.set('skill', filters.skill);
  if (filters.title) p.set('title', filters.title);
  if (sort.sort_by !== 'published_at') p.set('sort_by', sort.sort_by);
  if (sort.order !== 'desc') p.set('order', sort.order);
  if (page !== 1) p.set('page', String(page));

  const search = p.toString();
  window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOffers() {
  // Initialize state directly from the URL so a page refresh restores everything
  const [filters, setFilters] = useState<Filters>(readFiltersFromUrl);
  const [sort, setSort] = useState<SortOptions>(readSortFromUrl);
  const [page, setPage] = useState<number>(readPageFromUrl);
  const [retryCount, setRetryCount] = useState(0);

  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce text inputs so the API is not called on every keystroke
  const debouncedCity = useDebounce(filters.city, DEBOUNCE_MS);
  const debouncedSkill = useDebounce(filters.skill, DEBOUNCE_MS);
  const debouncedTitle = useDebounce(filters.title, DEBOUNCE_MS);

  useEffect(() => {
    // Sync debounced values to URL (not raw values, to avoid flicker while typing)
    syncToUrl(
      { ...filters, city: debouncedCity, skill: debouncedSkill, title: debouncedTitle },
      sort,
      page
    );

    // `cancelled` prevents a slow response from overwriting a newer one
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        sort_by: sort.sort_by,
        order: sort.order,
        page,
        size: PAGE_SIZE,
      };

      // "Junior" maps to experience_level; "Intern" maps to working_time
      if (filters.juniorType === 'junior') {
        params.experience_level = 'junior';
      } else {
        params.working_time = 'internship';
      }

      if (filters.workplace_type) params.workplace_type = filters.workplace_type;
      if (debouncedCity) params.city = debouncedCity;
      if (debouncedSkill) params.skill = debouncedSkill;
      if (debouncedTitle) params.title = debouncedTitle;

      try {
        const result = await fetchOffers(params);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Something went wrong. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [
    filters.juniorType,
    filters.workplace_type,
    debouncedCity,
    debouncedSkill,
    debouncedTitle,
    sort.sort_by,
    sort.order,
    page,
    retryCount,
  ]);

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const updateSort = (newSort: SortOptions) => {
    setSort(newSort);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
    setPage(1);
  };

  return {
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
    retry: () => setRetryCount((c) => c + 1),
  };
}
