import { useState } from 'react';
import { Offer } from '../types/offer';
import {
  formatSalary,
  parseSkills,
  getAvatarGradient,
  getCompanyInitials,
  formatLabel,
  getOfferAge,
  getRelativeTime,
  EXPERIENCE_COLORS,
  WORKPLACE_COLORS,
  WORKING_TIME_COLORS,
  badgeColor,
} from '../utils/offer';

// ─── Sub-components ──────────────────────────────────────────────────────────

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

function CompanyLogo({ logoUrl, companyName }: { logoUrl: string | null; companyName: string }) {
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={companyName}
        onError={() => setImgError(true)}
        className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-1 flex-shrink-0"
      />
    );
  }

  return (
    <div
      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(companyName)} flex items-center justify-center flex-shrink-0 shadow-sm`}
    >
      <span className="text-white font-bold text-sm">{getCompanyInitials(companyName)}</span>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface OfferCardProps {
  offer: Offer;
  onSelect: (guid: string) => void;
}

const MAX_SKILLS_VISIBLE = 5;

export function OfferCard({ offer, onSelect }: OfferCardProps) {
  const salary = formatSalary(offer.salary_from, offer.salary_to, offer.salary_currency);
  const skills = parseSkills(offer.required_skills);
  const visibleSkills = skills.slice(0, MAX_SKILLS_VISIBLE);
  const hiddenSkillCount = skills.length - MAX_SKILLS_VISIBLE;
  const cities = offer.locations.map((l) => l.city).filter(Boolean);
  const ageDays = getOfferAge(offer.published_at);
  const isNew = ageDays <= 1;

  return (
    <article
      onClick={() => onSelect(offer.guid)}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 group"
    >
      {/* Top row: logo + title/company + salary */}
      <div className="flex items-start gap-4">
        <CompanyLogo logoUrl={offer.company_logo_url} companyName={offer.company_name} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate min-w-0">
              {offer.title}
            </h2>
            {isNew && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 flex-shrink-0">
                New!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {offer.company_name}
            </span>

            {cities.length > 0 && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <div className="flex gap-1 flex-wrap min-w-0">
                  {cities.map((city) => (
                    <span
                      key={city}
                      className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Salary — desktop: inline; mobile: shown below */}
        {salary && (
          <div className="hidden sm:flex flex-col items-end flex-shrink-0">
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg whitespace-nowrap">
              {salary}
            </span>
          </div>
        )}
      </div>

      {/* Mobile salary */}
      {salary && (
        <div className="sm:hidden mt-2">
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {salary}
          </span>
        </div>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mt-3">
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

      {/* Skills chips */}
      {visibleSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {visibleSkills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
            >
              {skill}
            </span>
          ))}
          {hiddenSkillCount > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
              +{hiddenSkillCount} more
            </span>
          )}
        </div>
      )}

      {/* Footer: posted time */}
      <div className="flex justify-end mt-3">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {getRelativeTime(ageDays)}
        </span>
      </div>
    </article>
  );
}
