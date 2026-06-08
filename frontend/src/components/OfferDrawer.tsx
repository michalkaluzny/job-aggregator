import { useEffect, useState } from 'react';
import { useOfferDetail } from '../hooks/useOfferDetail';
import { Offer } from '../types/offer';
import {
  formatSalary,
  parseSkills,
  getAvatarGradient,
  getCompanyInitials,
  formatLabel,
  formatDate,
  getOfferAge,
  getRelativeTime,
  EXPERIENCE_COLORS,
  WORKPLACE_COLORS,
  WORKING_TIME_COLORS,
  badgeColor,
} from '../utils/offer';

interface OfferDrawerProps {
  guid: string | null;
  onClose: () => void;
}

export function OfferDrawer({ guid, onClose }: OfferDrawerProps) {
  const { offer, loading, error } = useOfferDetail(guid);
  const isOpen = guid !== null;

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-drawer-title"
        className={`fixed top-0 right-0 h-full w-full sm:max-w-xl bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sticky close button */}
        <button
          onClick={onClose}
          aria-label="Close offer details"
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && !offer && <DrawerSkeleton />}
          {error && <DrawerError message={error} />}
          {offer && <DrawerContent offer={offer} loading={loading} />}
        </div>
      </aside>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CompanyLogo({ logoUrl, companyName }: { logoUrl: string | null; companyName: string }) {
  const [imgError, setImgError] = useState(false);
  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={companyName}
        onError={() => setImgError(true)}
        className="w-16 h-16 rounded-xl object-contain bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-1.5 flex-shrink-0"
      />
    );
  }
  return (
    <div
      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getAvatarGradient(companyName)} flex items-center justify-center flex-shrink-0 shadow-sm`}
    >
      <span className="text-white font-bold text-lg">{getCompanyInitials(companyName)}</span>
    </div>
  );
}

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}

// ─── Drawer states ───────────────────────────────────────────────────────────

function DrawerSkeleton() {
  return (
    <div className="p-6 pt-16 animate-pulse">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
      </div>
    </div>
  );
}

function DrawerError({ message }: { message: string }) {
  return (
    <div className="p-6 pt-16 text-center">
      <div className="text-5xl mb-4">😵</div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
        Could not load offer
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{message}</p>
    </div>
  );
}

function DrawerContent({ offer, loading }: { offer: Offer; loading: boolean }) {
  const salary = formatSalary(offer.salary_from, offer.salary_to, offer.salary_currency);
  const requiredSkills = parseSkills(offer.required_skills);
  const niceSkills = parseSkills(offer.nice_to_have_skills);
  const applyUrl = offer.apply_url || offer.url;
  const ageDays = getOfferAge(offer.published_at);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pt-16 flex-1">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <CompanyLogo logoUrl={offer.company_logo_url} companyName={offer.company_name} />
          <div className="flex-1 min-w-0">
            <h2
              id="offer-drawer-title"
              className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1"
            >
              {offer.title}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 font-medium">
              {offer.company_name}
            </p>
            {loading && (
              <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 animate-pulse">
                Refreshing…
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {offer.experience_level && (
            <Badge
              label={formatLabel(offer.experience_level)}
              colorClass={badgeColor(EXPERIENCE_COLORS, offer.experience_level)}
            />
          )}
          {offer.workplace_type && (
            <Badge
              label={formatLabel(offer.workplace_type)}
              colorClass={badgeColor(WORKPLACE_COLORS, offer.workplace_type)}
            />
          )}
          {offer.working_time && (
            <Badge
              label={formatLabel(offer.working_time)}
              colorClass={badgeColor(WORKING_TIME_COLORS, offer.working_time)}
            />
          )}
        </div>

        {/* Salary */}
        {salary && (
          <Section title="Salary">
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <span className="text-lg font-bold text-amber-700 dark:text-amber-300">{salary}</span>
            </div>
          </Section>
        )}

        {/* Locations */}
        {offer.locations.length > 0 && (
          <Section title="Locations">
            <ul className="space-y-2">
              {offer.locations.map((loc, i) => (
                <li
                  key={`${loc.city}-${i}`}
                  className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0L6.343 16.657A8 8 0 1117.657 16.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <span className="font-medium">{loc.city}</span>
                    {loc.street && (
                      <span className="text-slate-500 dark:text-slate-400"> · {loc.street}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Required skills */}
        {requiredSkills.length > 0 && (
          <Section title="Required Skills">
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="text-sm px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Nice to have */}
        {niceSkills.length > 0 && (
          <Section title="Nice to Have">
            <div className="flex flex-wrap gap-1.5">
              {niceSkills.map((skill) => (
                <span
                  key={skill}
                  className="text-sm px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Dates */}
        <Section title="Details">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Posted</dt>
              <dd className="text-slate-700 dark:text-slate-200 font-medium">
                {getRelativeTime(ageDays)} ({formatDate(offer.published_at)})
              </dd>
            </div>
            {offer.expires_at && (
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Expires</dt>
                <dd className="text-slate-700 dark:text-slate-200 font-medium">
                  {formatDate(offer.expires_at)}
                </dd>
              </div>
            )}
          </dl>
        </Section>
      </div>

      {/* Sticky bottom CTA */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sticky bottom-0">
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors min-h-[44px]"
        >
          Apply on company website
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
