/**
 * Curated replay highlights from the LearningPlanet Festival 2026 Replays
 * playlist (titles confirmed via YouTube oEmbed). These three were the
 * homepage-featured highlights on the live site.
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
];
