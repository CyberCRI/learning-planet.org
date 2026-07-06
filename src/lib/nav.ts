import { show } from '~/config';

export type NavItem = {
  key: string;
  /** route path to localize, e.g. "who-we-are" or "" for home */
  path: string;
  /** optional in-page anchor appended after the localized path (e.g. "stay-informed") */
  anchor?: string;
  flag?: keyof typeof show;
};

/** Primary nav. Held items (with a flag) only appear when their flag is on. */
const ALL_NAV: NavItem[] = [
  { key: 'nav.whoWeAre', path: 'who-we-are' },
  { key: 'nav.programme', path: 'programme', flag: 'programme' },
  { key: 'nav.speakers', path: 'speakers', flag: 'speakers' },
  { key: 'nav.replays', path: 'replays' },
  { key: 'nav.partners', path: 'partners', flag: 'partners' },
  // Stay-informed has no page — it scrolls to the homepage section.
  { key: 'nav.stayInformed', path: '', anchor: 'stay-informed' },
];

export function visibleNav(): NavItem[] {
  return ALL_NAV.filter((item) => !item.flag || show[item.flag]);
}
