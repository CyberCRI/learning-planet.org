/**
 * "Our journey so far" — entries per the July 2026 editorial review (the
 * previous WXR-verbatim note no longer applies).
 * Ordered chronologically.
 */
export type TimelineEntry = {
  date: string;
  title: string;
  /** Optional external link wrapping the title. */
  href?: string;
  /** May contain inline <a> links; rendered with set:html. */
  description: string;
};

export const timeline: TimelineEntry[] = [
  {
    date: '24 January 2020',
    title: 'The Birth of the LearningPlanet Festival',
    description:
      'The LearningPlanet Festival was first launched in 2020 by the Learning Planet Institute in partnership with UNESCO, to celebrate the International Day of Education.',
  },
  {
    date: '2021–2025',
    title: 'Exploring Local Learning Ecosystems in the Global South',
    href: 'https://www.learningplanetinstitute.org/en/programs/learning-ecosystems-2/',
    description:
      'In partnership with GELP and Dream a Dream, the Learning Planet Institute published a first report in June 2023 exploring the potential of local learning ecosystems across Latin America, Africa, and South Asia, examining how focusing on thriving, trust, collaboration, and data can reshape education. In 2025, a second report, co-designed with ten of these ecosystems, set out a strategic roadmap for scaling the approach and connecting formal and non-formal learning to support wider systems change.',
  },
  {
    date: 'September 2024',
    title: 'Launch of the LearningPlanet Youth Design Challenge (YDC)',
    href: 'https://www.learningplanetinstitute.org/en/programs/lp-ydc/',
    description:
      'Launched at the United Nations General Assembly in September 2024, the annual Youth Design Challenge empowers youth aged 15–26 to develop practical social impact projects addressing Peace, Wellbeing, and Sustainability. Its 2025–2026 edition attracted 3,200 sign-ups and 702 project submissions from 109 countries, with 60 finalists selected for an intensive learning and support programme.',
  },
  {
    date: 'March 2025',
    title: 'Launch of the United Nations University (UNU) Hub at the Learning Planet Institute',
    description:
      'The Learning Planet Institute and UNU established the <a href="https://www.learningplanetinstitute.org/en/news/one-year-ago-the-unu-hub-future-of-learning-with-youth-fly/" target="_blank" rel="noopener">UNU Hub on Future of Learning with Youth in the Age of AI</a> to empower youth as planetary citizens, creating research, education, and policy programs to tackle global challenges. This hub champions youth participation, intergenerational collaboration, and scalable, human-centered learning, using AI to enhance educational experiences.',
  },
  {
    date: 'November 2025',
    title: 'The Learning Planet Institute is officially designated a UNESCO Category 2 Institute',
    href: 'https://www.learningplanetinstitute.org/en/cc2-unesco/',
    description:
      'This recognition acknowledges nearly two decades of work in educational innovation, and reinforces the Institute’s role in advancing learning sciences, capacity-building and education transformation worldwide.',
  },
  {
    date: 'January 2026',
    title: 'Launch of the Learning Planet Academy at LPF 2026',
    description:
      'Grounded in research, strengthened by AI and co-created with young people, the <a href="https://www.learningplanetinstitute.org/en/learning-planet-academy/" target="_blank" rel="noopener">Learning Planet Academy</a> supports learning through experimentation, collaboration and purpose, helping learners build the capacity to act on key challenges such as environment and climate, peace and democracy, and mental health and wellbeing.',
  },
];
