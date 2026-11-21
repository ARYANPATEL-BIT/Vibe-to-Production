// Plain-text views of the content for AI tools (https://llmstxt.org), built from the raw .md files.
import fs from 'node:fs';
import path from 'node:path';
import { source } from './source';
import { siteUrl } from './shared';

const contentDir = path.join(process.cwd(), '..', 'content');

export function contentPages() {
  return source.getPages().sort((a, b) => a.path.localeCompare(b.path));
}

/** The raw markdown of a page, without its frontmatter. */
export function rawBody(pagePath: string): string {
  const raw = fs.readFileSync(path.join(contentDir, pagePath), 'utf8').replace(/\r\n/g, '\n');
  return raw.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
}

export const pageUrl = (url: string) => `${siteUrl}${url}`;

export function textResponse(text: string) {
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
