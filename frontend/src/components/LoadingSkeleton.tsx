function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Logo placeholder */}
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4 mb-2" />
          {/* Company */}
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2 mb-3" />
          {/* Badges row */}
          <div className="flex gap-2">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
          </div>
        </div>

        {/* Salary placeholder */}
        <div className="hidden sm:block h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-28 flex-shrink-0" />
      </div>

      {/* Skills row */}
      <div className="flex gap-2 mt-4">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-14" />
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-12" />
      </div>

      {/* Footer row */}
      <div className="flex justify-end mt-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-24" />
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
