/**
 * Site-wide constants and confirmed external links.
 * Keep all outbound URLs here so they're easy to audit/update.
 */
export const SITE = {
  name: 'LearningPlanet Festival',
  // Site descriptor (from og:site_name on the live site).
  descriptor: 'Uniting to Transform Education',
  // The movement's mission line.
  mission: 'Learning to take care of oneself, others and the planet',
} as const;

export const EDITION = {
  label: 'LearningPlanet Festival 2027',
  // Display only "January 2027" — exact dates are TBD and must not be asserted.
  when: 'January 2027',
  ideNote: 'around the International Day of Education (24 January)',
} as const;

export const LINKS = {
  youtubeChannel: 'https://www.youtube.com/@LearningPlanetOrg',
  youtube2026Playlist:
    'https://www.youtube.com/playlist?list=PLhoivKx89OU4t6JuXmeK5bYQw371RspfG',
  newsletter: 'https://learningplanetinstitute.org/en/subscribe-to-our-newsletter/',
  linkedin: 'https://www.linkedin.com/school/learningplanetinstitute/',
  instagram: 'https://www.instagram.com/lpiparis/',
  facebook: 'https://www.facebook.com/lpiparis',
  contactEmail: 'learningplanet@learningplanetinstitute.org',
  mediaEmail: 'team.communication@learningplanetinstitute.org',
  lpi: 'https://learningplanetinstitute.org/',
  unesco: 'https://www.unesco.org/',
} as const;

/** Confirmed evergreen impact figures for the movement. */
export type ImpactStat = {
  value: number;
  suffix: string;
  labelKey: string;
  isYear?: boolean;
};

export const IMPACT: ImpactStat[] = [
  { value: 600, suffix: '+', labelKey: 'impact.events' },
  { value: 500, suffix: '+', labelKey: 'impact.partners' },
  { value: 193, suffix: '', labelKey: 'impact.countries' },
  { value: 2020, suffix: '', labelKey: 'impact.since', isYear: true },
];
