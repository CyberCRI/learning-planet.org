/**
 * Feature flags — control nav links and section/route visibility.
 *
 * Guiding rule: build the complete structure, display only confirmed content.
 * To switch a held section on later: populate its content collection, then
 * flip its flag here to `true`. Nothing else needs to change.
 */
export const show = {
  themes: true, // the six 2027 themes — confirmed, displayed now
  programme: false, // events collection — held until the programme is confirmed
  speakers: false, // speakers collection — held
  partners: false, // partners logo wall — held
} as const;

export type FeatureFlag = keyof typeof show;
