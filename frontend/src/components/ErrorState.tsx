interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-6xl mb-4">😵</div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
        Could not load offers
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-2 leading-relaxed">
        Make sure the backend is running on{' '}
        <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono">
          http://localhost:8000
        </code>
        .
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-mono">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
