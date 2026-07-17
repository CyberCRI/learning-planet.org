/**
 * Learning Planet Festival team — list revised per the July 2026 editorial
 * review (positions, companies, divisions, LinkedIn, headshots).
 * Sorted by the original WordPress menu_order.
 *
 * Headshots are referenced from src/assets/team via the `photo` import key.
 */
import type { ImageMetadata } from 'astro';

import olivier from '~/assets/team/olivier-brechard.jpg';
import katherine from '~/assets/team/katherine-brown.jpg';
import ikya from '~/assets/team/ikya-kondapolu.jpg';
import ilia from '~/assets/team/ilia-lysenko.jpeg';
import edward from '~/assets/team/edward-stevenette.jpg';
import damien from '~/assets/team/damien-sueur.jpg';

export type TeamMember = {
  name: string;
  position: string;
  organisation: string;
  linkedin: string;
  photo: ImageMetadata;
};

export const team: TeamMember[] = [
  {
    name: 'Olivier Bréchard',
    position: 'Director, Learning Planet International Relations & Festival',
    organisation: 'Learning Planet Institute',
    linkedin: 'https://fr.linkedin.com/in/olivier-brechard-1b104011',
    photo: olivier,
  },
  {
    name: 'Katherine Brown',
    position: 'Project Manager, Learning Ecosystems, Education for Human Flourishing',
    organisation: 'Learning Planet Alliance',
    linkedin: 'https://www.linkedin.com/in/katherine-brown-a5a0ba149/',
    photo: katherine,
  },
  {
    name: 'Ikya Kondapolu',
    position: 'Project Manager, Learning Planet Festival',
    organisation: 'Learning Planet Alliance',
    linkedin: 'https://www.linkedin.com/in/ikya-kondapolu/',
    photo: ikya,
  },
  {
    name: 'Ilia Lysenko',
    position: 'Project Manager, Peace Programmes',
    organisation: 'Learning Planet Alliance',
    linkedin: 'https://www.linkedin.com/in/lysenkoils/',
    photo: ilia,
  },
  {
    name: 'Edward Stevenette',
    position: 'Project Manager, Youth Programmes',
    organisation: 'Learning Planet Alliance',
    linkedin: 'https://fr.linkedin.com/in/edwardstevenette',
    photo: edward,
  },
  {
    name: 'Damien Sueur',
    position: 'Head of digital & audiovisual projects',
    organisation: 'Learning Planet Alliance',
    linkedin: 'https://fr.linkedin.com/in/damien-rayuela-sueur',
    photo: damien,
  },
];
