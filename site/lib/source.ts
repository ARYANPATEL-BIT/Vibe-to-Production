import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

// The markdown lives outside the site, in the repo's content/ folder.
// The Claude Code plugin reads the same files raw.
const docs = defineDocs({
  dir: '../content',
  docs: {
    schema: pageSchema.extend({
      level: z.enum(['foundation', 'builder', 'scale', 'deep']).optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
});

export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
});

/** The 11 curriculum parts (content/learn/<part>/index.md), in order. */
export function getLearnParts() {
  return source
    .getPages()
    .filter((page) => page.slugs[0] === 'learn' && page.slugs.length === 2)
    .sort((a, b) => a.slugs[1].localeCompare(b.slugs[1]));
}
