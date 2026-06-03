import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../constants';

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
}

const MAX_SUGGESTIONS = 8;

export function CityAutocomplete({ value, onChange }: CityAutocompleteProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch all cities once on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/cities`)
      .then((r) => r.json())
      .then((data: string[]) => setCities(data))
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = value.trim()
    ? cities
        .filter((c) => c.toLowerCase().includes(value.toLowerCase()))
        .slice(0, MAX_SUGGESTIONS)
    : [];

  const showDropdown = isOpen && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <input
        id="filter-city"
        type="text"
        placeholder="e.g. Warszawa"
        value={value}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />

      {showDropdown && (
        <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((city) => {
            // Bold the matching fragment
            const idx = city.toLowerCase().indexOf(value.toLowerCase());
            const before = city.slice(0, idx);
            const match = city.slice(idx, idx + value.length);
            const after = city.slice(idx + value.length);

            return (
              <li key={city}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    // onMouseDown fires before onBlur, so the input doesn't lose focus before we set the value
                    e.preventDefault();
                    onChange(city);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-600 transition-colors"
                >
                  {before}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{match}</span>
                  {after}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
