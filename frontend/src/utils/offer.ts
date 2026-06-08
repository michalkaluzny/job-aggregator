export function formatSalary(
  from: number | null,
  to: number | null,
  currency: string | null
): string | null {
  if (!from && !to) return null;
  const curr = currency ?? 'PLN';
  const fmt = (n: number) => n.toLocaleString('pl-PL');
  if (from && to) return `${fmt(from)} – ${fmt(to)} ${curr}`;
  if (from) return `from ${fmt(from)} ${curr}`;
  return `up to ${fmt(to!)} ${curr}`;
}

export function getOfferAge(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export function getRelativeTime(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function parseSkills(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

// Picks a consistent gradient color based on the first character of the name
export function getAvatarGradient(name: string): string {
  const gradients = [
    'from-indigo-400 to-indigo-600',
    'from-violet-400 to-violet-600',
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-rose-400 to-rose-600',
    'from-amber-400 to-amber-600',
    'from-cyan-400 to-cyan-600',
    'from-pink-400 to-pink-600',
  ];
  return gradients[(name.charCodeAt(0) ?? 0) % gradients.length];
}

export function getCompanyInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function formatLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Badge color maps ────────────────────────────────────────────────────────

export const EXPERIENCE_COLORS: Record<string, string> = {
  junior: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  mid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  senior: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300',
};

export const WORKPLACE_COLORS: Record<string, string> = {
  remote: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  hybrid: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  office: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

export const WORKING_TIME_COLORS: Record<string, string> = {
  internship: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
  full_time: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  part_time: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
};

const DEFAULT_BADGE = 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';

export function badgeColor(map: Record<string, string>, key: string | null): string {
  return (key && map[key]) || DEFAULT_BADGE;
}
