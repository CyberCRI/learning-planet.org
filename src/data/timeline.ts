/**
 * "Our journey so far" — the 5 PUBLISHED timeline-item records from WordPress.
 * The 12 `private` timeline drafts are unconfirmed and deliberately omitted
 * (confirmed-only display).
 *
 * Descriptions are verbatim from the WXR `lp_timeline_description` meta, with
 * two user-approved corrections applied:
 *   - "grown over the into" → "grown over the years into" (source typo)
 *   - dropped the past-dated "The second phase … December 2025." sentence
 * Ordered chronologically.
 */
export type TimelineEntry = {
  date: string;
  title: string;
  description: string;
};

export const timeline: TimelineEntry[] = [
  {
    date: '24 January 2020',
    title: 'The Birth of the LearningPlanet Festival',
    description:
      'Launched on the International Day of Education by the Learning Planet Institute and UNESCO at UNESCO headquarters in Paris, the Festival has grown over the years into a global event. Now featuring over 600 annual events organized by 500+ international partners, it engages hundreds of thousands of participants from 193 countries in hybrid, online, and on-site settings.',
  },
  {
    date: '29 June 2023',
    title: 'Report Launch: Exploring Local Learning Ecosystems in the Global South',
    description:
      "In partnership with the Global Education Leaders' Partnership (GELP) and Dream a Dream, the Learning Planet Institute published a report exploring the potential of local learning ecosystems in the Global South. The report highlights 11 ecosystems across Latin America, Africa, and South Asia, examining how focusing on thriving, trust, collaboration, and data can reshape education.",
  },
  {
    date: 'September 2024',
    title: 'Launch of the LearningPlanet Youth Design Challenge (YDC)',
    description:
      'Launched at the United Nations General Assembly in September 2024, the Youth Design Challenge empowers youth aged 15–26 to design innovative education projects that create real-world impact. The initiative supports young changemakers with mentorship, resources, and networks to address global challenges and shape a sustainable future.',
  },
  {
    date: 'March 2025',
    title: 'Launch of the United Nations University (UNU) Hub at the Learning Planet Institute',
    description:
      'The Learning Planet Institute, in partnership with the United Nations University (UNU), established the UNU Hub on Future of Learning with Youth in the Age of AI. This Hub empowers youth as planetary citizens, creating research, education, and policy programs to tackle global challenges. It champions youth participation, intergenerational collaboration, and scalable, human-centered learning, using AI to enhance educational experiences.',
  },
  {
    date: 'October 2025',
    title: 'Launch of the “Atlas of Peaceful Futures Practices”',
    description:
      'As part of the Peaceful Futures programme, the Learning Planet Institute, in collaboration with Global Education Futures, introduced a practitioner’s guide for building peace-based civilizations. The Atlas is a living document shaped by young changemakers and peacebuilders worldwide. It shares practices and insights that highlight youth as co-creators of peaceful futures, aligning with the Institute’s mission to empower learners as agents of change.',
  },
];
