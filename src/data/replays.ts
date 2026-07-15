/**
 * Curated replay highlights from the LearningPlanet Festival 2026 Replays
 * playlist. The first three are the homepage-featured highlights (the
 * teaser slices 0–3); all six show on the Replays page. Titles confirmed
 * via YouTube oEmbed July 2026; emoji stripped from the MOOD title and
 * spacing normalized on the Youth Compass title.
 * Full playlist + channel links live in src/site.ts.
 */
export type Replay = {
  id: string;
  title: string;
};

export const featuredReplays: Replay[] = [
  {
    id: 'v8PYvjMg9Z0',
    title: 'Report Launch: Learning Ecosystems — Connecting Practice to Policy in the Global South',
  },
  {
    id: 'rzrQBVobffg',
    title: 'Education for Human Flourishing: A Global Dialogue with the OECD & Partners',
  },
  {
    id: 'XGxS9Oxoh-Q',
    title: 'From Local Innovation to Education Change: Inside the South-South Collaborative',
  },
  {
    id: 'wt0_SzMOHUs',
    title: 'MOOD: United Nations Certified Pedagogy for Purpose and the Planet',
  },
  {
    id: 'QMicGxdUUG8',
    title: 'UN Youth Compass — Making Meaningful Youth Engagement the Norm',
  },
  {
    id: 'yM4puWj0ekg',
    title: 'Peaceful Futures Practices: From Atlas to Daily Actions',
  },
];
