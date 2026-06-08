import { useState, useEffect, useRef } from 'react';

interface AutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  items: string[];
  placeholder?: string;
}

const MAX_SUGGESTIONS = 8;

// Generic autocomplete input with dropdown.
// Parent fetches the `items` list and decides where the data comes from.
export function Autocomplete({ id, value, onChange, items, placeholder }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    ? items
        .filter((item) => item.toLowerCase().includes(value.toLowerCase()))
        .slice(0, MAX_SUGGESTIONS)
    : [];

  const showDropdown = isOpen && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        placeholder={placeholder}
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
        <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden max-h-80 overflow-y-auto">
          {suggestions.map((item) => {
            // Bold the matching fragment
            const idx = item.toLowerCase().indexOf(value.toLowerCase());
            const before = item.slice(0, idx);
            const match = item.slice(idx, idx + value.length);
            const after = item.slice(idx + value.length);

            return (
              <li key={item}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    // onMouseDown fires before onBlur, so the input doesn't lose focus before we set the value
                    e.preventDefault();
                    onChange(item);
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
