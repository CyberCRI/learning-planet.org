/**
 * Site-wide constants and confirmed external links.
 * Keep all outbound URLs here so they're easy to audit/update.
 */
export const SITE = {
  name: 'Learning Planet Festival',
  // Site descriptor (from og:site_name on the live site).
  descriptor: 'Uniting to Transform Education',
  // The movement's mission line.
  mission: 'Learning to take care of oneself, others and the planet',
} as const;

export const EDITION = {
  label: 'Learning Planet Festival 2027',
  // Dates confirmed by the July 2026 editorial review.
  when: '25–29 January 2027',
} as const;

export const LINKS = {
  youtubeChannel: 'https://www.youtube.com/@LearningPlanetOrg',
  youtube2026Playlist:
    'https://www.youtube.com/playlist?list=PLhoivKx89OU4t6JuXmeK5bYQw371RspfG',
  newsletter: 'https://learningplanetinstitute.org/en/subscribe-to-our-newsletter/',
  linkedin: 'https://www.linkedin.com/school/learningplanetinstitute/',
  instagram: 'https://www.instagram.com/lpiparis/',
  facebook: 'https://www.facebook.com/lpiparis',
  contactEmail: 'festival@learningplanetinstitute.org',
  mediaEmail: 'team.communication@learningplanetinstitute.org',
  lpi: 'https://learningplanetinstitute.org/',
  unesco: 'https://www.unesco.org/',
  stayInformedHeroForm: 'https://airtable.com/appST8T9zV5GeU5el/pagEtT7DsERDt2Q2C/form',
  stayInformedForm: 'https://airtable.com/appST8T9zV5GeU5el/pagEtT7DsERDt2Q2C/form',
  coDesignForm: 'https://airtable.com/appST8T9zV5GeU5el/pagEtT7DsERDt2Q2C/form',
} as const;

/** Confirmed evergreen impact figures for the movement, per the July 2026 editorial review. */
export type ImpactStat = {
  value: number;
  suffix: string;
  labelKey: string;
};

export const IMPACT: ImpactStat[] = [
  { value: 800, suffix: '+', labelKey: 'impact.events' },
  { value: 500, suffix: '+', labelKey: 'impact.partners' },
  { value: 190, suffix: '+', labelKey: 'impact.countries' },
  { value: 7, suffix: '', labelKey: 'impact.editions' },
];
