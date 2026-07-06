import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** The six 2027 theme ids — shared by the events schema. */
const themeId = z.enum([
  'youth-agency',
  'peace-citizenship',
  'wellbeing-ehf',
  'climate-sustainability',
  'ai-youth-skills',
  'beyond-2030',
]);

/**
 * Programme events. Shipped EMPTY (held behind the `programme` flag).
 * Pages render `status: 'confirmed'` entries only. Fields mirror the old
 * WordPress event model, narrowed to the new edition's needs.
 */
const events = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      start: z.coerce.date().optional(),
      end: z.coerce.date().optional(),
      timezone: z.string().default('Europe/Paris'),
      format: z.enum(['online', 'in-person', 'hybrid']),
      language: z.string().default('en'),
      location: z.string().optional(),
      theme: themeId,
      speakers: z.array(reference('speakers')).default([]),
      image: image().optional(),
      registerUrl: z.string().url().optional(),
      livestreamUrl: z.string().url().optional(),
      replayUrl: z.string().url().optional(),
      featured: z.boolean().default(false),
      edition: z.string().default('LPF 2027'),
      status: z.enum(['draft', 'confirmed']).default('draft'),
    }),
});

/** Speakers. Shipped EMPTY (held behind the `speakers` flag). */
const speakers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/speakers' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string().optional(),
      organisation: z.string().optional(),
      photo: image().optional(),
      bio: z.string().optional(),
      links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
      featured: z.boolean().default(false),
    }),
});

/** Partners. Shipped EMPTY (held behind the `partners` flag). */
const partners = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/partners' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      logo: image(),
      url: z.string().url().optional(),
      tier: z.enum(['lead', 'partner', 'supporter']).optional(),
    }),
});

export const collections = { events, speakers, partners };
