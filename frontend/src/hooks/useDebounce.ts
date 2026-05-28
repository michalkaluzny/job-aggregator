import { useState, useEffect } from 'react';

// Delays updating `value` until `delay` ms have passed without it changing.
// Used on text inputs so we don't fire an API request on every keystroke.
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
