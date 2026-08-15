import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The content lives here now, copied out of the Hugo tree and normalised by
 * `scripts/migrate-content.mjs`. Page bundles rather than flat files because
 * twenty-six assets are co-located with their entries.
 *
 * `generateId` matters: without it the id of `island-model-smc/index.md` keeps
 * its `/index` suffix and every generated href gains a path segment that does
 * not exist.
 *
 * The glob pattern also excludes the `index.it.md` translations, which are
 * carried in the repository but not yet routed.
 */
const bundleId = ({ entry }: { entry: string }) => entry.replace(/\/index\.md$/, '');

const link = z.object({
  name: z.string().optional(),
  url: z.string(),
  icon: z.string().optional(),
});

/** Hugo Blox image metadata. Carried through; nothing reads it yet. */
const image = z.record(z.any());

const publications = defineCollection({
  loader: glob({
    base: './src/content/publications',
    pattern: '*/index.md',
    generateId: bundleId,
  }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    date: z.coerce.date(),
    publishDate: z.coerce.date().optional(),
    type: z.string(),
    venue: z.string(),
    venue_short: z.string().optional(),
    abstract: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    // An enum, not a string: a typo must fail the build rather than quietly
    // empty a cluster of the constellation.
    pillar: z.enum(['multi-agent', 'statistical-verification', 'robust-quant', 'text-analytics']),
    projects: z.array(z.string()).optional(),
    links: z.array(link).default([]),
    image: image.optional(),
  }),
});

const projects = defineCollection({
  loader: glob({
    base: './src/content/projects',
    pattern: '*/index.md',
    generateId: bundleId,
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()),
    links: z.array(link).default([]),
    image: image.optional(),
  }),
});

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '*/index.md',
    generateId: bundleId,
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    authors: z.array(z.string()),
    tags: z.array(z.string()),
    image: image.optional(),
  }),
});

export const collections = { publications, projects, blog };
