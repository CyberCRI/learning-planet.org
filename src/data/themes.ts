/**
 * The six themes LPF 2027 will explore — confirmed for announcement.
 * Titles are prominent; the framing question is a subline. Each theme keys
 * to one brand bright so the grid carries the festival's rainbow signature.
 * Wording per the July 2026 editorial review.
 *
 * Translatable: titles/questions live here as data, not hardcoded in markup.
 */
export type Theme = {
  id: string;
  color: string; // brand bright (CSS custom-property name)
  title: string;
  question: string;
};

export const themes: Theme[] = [
  {
    id: 'youth-agency',
    color: '--c-green',
    title: 'Youth Agency & Meaningful Youth Engagement',
    question: 'What conditions enable young people to act meaningfully?',
  },
  {
    id: 'peace-citizenship',
    color: '--c-blue',
    title: 'Peace & Global Citizenship',
    question: 'How can we train 250 million young peacemakers by 2035?',
  },
  {
    id: 'wellbeing-ehf',
    color: '--c-lilac',
    title: 'Wellbeing & Education for Human Flourishing',
    question: 'From framework to action: what does Education for Human Flourishing look like in practice?',
  },
  {
    id: 'climate-sustainability',
    color: '--c-coral',
    title: 'Climate & Sustainability',
    question: 'How can we train and support the next generation of climate changemakers?',
  },
  {
    id: 'ai-youth-skills',
    color: '--c-yellow',
    title: 'AI, Youth & Skills',
    question:
      'What could learning look like in 2050, and what roles should AI, educators and young people play in shaping it?',
  },
  {
    id: 'beyond-2030',
    color: '--c-deep-green',
    title: 'Beyond 2030',
    question:
      'What will the future of the SDGs and the global agenda look like after 2030, and how can youth voices help shape them?',
  },
];
