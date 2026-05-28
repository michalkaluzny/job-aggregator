import { DarkModeToggle } from './DarkModeToggle';

interface HeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  totalOffers?: number;
}

export function Header({ isDark, onToggleDark, totalOffers }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-bold text-sm tracking-tight">JH</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              JuniorHub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block leading-tight">
              Find your first IT job
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {totalOffers !== undefined && totalOffers > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                {totalOffers.toLocaleString()} opportunities
              </span>
            </div>
          )}
          <DarkModeToggle isDark={isDark} onToggle={onToggleDark} />
        </div>
      </div>
    </header>
  );
}
