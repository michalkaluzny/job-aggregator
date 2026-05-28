import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Prefer stored preference, otherwise fall back to OS setting
    const stored = localStorage.getItem('juniorhub-dark-mode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('juniorhub-dark-mode', String(isDark));
  }, [isDark]);

  return {
    isDark,
    toggle: () => setIsDark((prev) => !prev),
  };
}
