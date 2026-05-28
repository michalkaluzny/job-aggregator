import { useState, useEffect } from 'react';
import { fetchOffers } from '../api/offers';
import { PaginatedResponse, Filters, SortOptions } from '../types/offer';
import { PAGE_SIZE, DEBOUNCE_MS } from '../constants';
import { useDebounce } from './useDebounce';

const DEFAULT_FILTERS: Filters = {
  juniorType: 'junior',
  workplace_type: '',
  city: '',
  skill: '',
};

const DEFAULT_SORT: SortOptions = {
  sort_by: 'published_at',
  order: 'desc',
};

export function useOffers() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOptions>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce text inputs so the API is not called on every keystroke
  const debouncedCity = useDebounce(filters.city, DEBOUNCE_MS);
  const debouncedSkill = useDebounce(filters.skill, DEBOUNCE_MS);

  useEffect(() => {
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
