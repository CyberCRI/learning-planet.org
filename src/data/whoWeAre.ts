/**
 * "Who we are" canonical prose, per the July 2026 editorial review (no
 * longer verbatim WXR). Facts unchanged; presentation is enriched in the
 * component, not here.
 */

export const intro =
  'The Learning Planet Festival was first launched in 2020 in partnership with UNESCO. Since then, it has been organised each January to celebrate the International Day of Education, and has grown into a global movement uniting hundreds of thousands of participants from 193 countries. It has become a shared space for dialogue and action, where youth, educators, innovators, policymakers, researchers, and changemakers come together to reimagine education and take steps towards learning to take care of oneself, others, and the planet.';

export const organisers = {
  lpi: {
    name: 'Learning Planet Institute',
    paragraphs: [
      'Since 2006, the Learning Planet Institute has been reinventing education to address the global challenges of the 21st century. Its mission is to explore, research and share new ways of learning and cooperating, in order to build more sustainable and inclusive learning societies. Through collective intelligence, lifelong learning, action research and project-based approaches, the Institute develops cultures, methods and tools that empower people and transform organisations. Its work supports learners, communities and “Learning Planetizens” to take care of themselves, others and the planet.',
      'In March 2025, LPI became a <strong>United Nations University Hub</strong> on the <strong>Future of Learning with Youth</strong> and in November 2025, it was officially designated a <strong>UNESCO Category 2 Institute</strong> under the auspices of UNESCO.',
    ],
  },
  unesco: {
    name: 'UNESCO',
    paragraphs: [
      'UNESCO is the United Nations Educational, Scientific and Cultural Organization. It contributes to peace and security by promoting international cooperation in education, sciences, culture, communication and information. UNESCO promotes knowledge sharing and the free flow of ideas to accelerate mutual understanding and a more perfect knowledge of each other’s lives. UNESCO’s programmes contribute to the achievement of the Sustainable Development Goals defined in the 2030 Agenda, adopted by the UN General Assembly in 2015. The United Nations General Assembly proclaimed 24 January as International Day of Education, in celebration of the role of education for peace and development.',
    ],
  },
};

export type SharedGoal = {
  title: string;
  description: string;
  color: string;
};

export const sharedGoals: SharedGoal[] = [
  {
    title: 'A shared learning agenda',
    color: '--c-green',
    description:
      'Build a global coalition that amplifies diverse voices, particularly from the Global South, to advance a shared learning agenda that empower students and communities to shape a more inclusive, sustainable, and equitable future for all.',
  },
  {
    title: 'Youth participation & intergenerational leadership',
    color: '--c-blue',
    description:
      'Center youth participation and intergenerational collaboration in transforming education. Equip youth to think critically, act decisively, and co-create solutions for global challenges, preparing them to lead in a rapidly evolving world.',
  },
  {
    title: 'Education for Human Flourishing',
    color: '--c-lilac',
    description:
      'Advocate for shifting education’s purpose to prioritise well-being and human flourishing by nurturing creativity, emotional intelligence, ethical reasoning, and problem-solving to address global challenges and lead fulfilling lives.',
  },
  {
    title: 'A planetary mission for education',
    color: '--c-coral',
    description:
      'Champion a planetary mission for education: Shift from “best in the world” to “best for the world.” Advocate for inclusive learning models prioritising peace, sustainability, and care, fostering global responsibility and collaboration for planetary well-being.',
  },
];
