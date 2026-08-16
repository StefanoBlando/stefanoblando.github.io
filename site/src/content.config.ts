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

/**
 * The Italian entries live beside their originals as `index.it.md` and are
 * loaded as parallel collections. The id is stripped of the language too, so
 * `/projects/pokenexus/` and `/it/projects/pokenexus/` are the same slug in
 * two languages rather than two unrelated pages — which is what lets one
 * `hreflang` pair point at the other.
 */
const bundleIdIt = ({ entry }: { entry: string }) => entry.replace(/\/index\.it\.md$/, '');

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
    /*
     * The two identifiers a paper is actually cited and found by. Optional
     * because most entries do not have them yet; when they are filled in the
     * detail page emits them as `citation_doi` and `citation_pdf_url`, which
     * is what Google Scholar reads to index a paper.
     *
     * `doi` is the bare identifier — 10.xxxx/yyyy — not a URL.
     */
    doi: z.string().optional(),
    pdf: z.string().optional(),
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

/** Same schemas, Italian sources. */
const publicationsIt = defineCollection({
  loader: glob({
    base: './src/content/publications',
    pattern: '*/index.it.md',
    generateId: bundleIdIt,
  }),
  schema: publications.schema,
});

const projectsIt = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '*/index.it.md', generateId: bundleIdIt }),
  schema: projects.schema,
});

const blogIt = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '*/index.it.md', generateId: bundleIdIt }),
  schema: blog.schema,
});

export const collections = {
  publications,
  projects,
  blog,
  publicationsIt,
  projectsIt,
  blogIt,
};
