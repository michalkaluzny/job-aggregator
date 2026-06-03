export interface Location {
  city: string;
  street: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Offer {
  guid: string;
  slug: string;
  title: string;
  company_name: string;
  company_logo_url: string | null;
  experience_level: string | null;
  workplace_type: string | null;
  working_time: string | null;
  locations: Location[];
  salary_from: number | null;
  salary_to: number | null;
  salary_currency: string | null;
  required_skills: string | null;
  nice_to_have_skills: string | null;
  published_at: string;
  expires_at: string | null;
  url: string;
  apply_url: string | null;
}

export interface PaginatedResponse {
  items: Offer[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export type JuniorType = 'junior' | 'intern';

export interface Filters {
  juniorType: JuniorType;
  workplace_type: string;
  city: string;
  skill: string;
  title: string;
}

export interface SortOptions {
  sort_by: string;
  order: 'asc' | 'desc';
}
