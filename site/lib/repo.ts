// Reads the real repo files at build time, so the Get it pages never drift from the repo.
// Every extractor throws when what it expects is missing: a broken page fails the build
// instead of rendering empty.
import fs from 'node:fs';
import path from 'node:path';
import { gitConfig } from './shared';
import { source } from './source';

const repoRoot = path.join(process.cwd(), '..');
const { user, repo, branch } = gitConfig;

export const blobUrl = (file: string) => `https://github.com/${user}/${repo}/blob/${branch}/${file}`;
export const rawUrl = (file: string) => `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${file}`;

export function readRepoFile(file: string): string {
  return fs.readFileSync(path.join(repoRoot, file), 'utf8').replace(/\r\n/g, '\n');
}

/** Every file under a repo folder (dotfiles included), as sorted repo-relative paths. */
export function listRepoFiles(dir: string): string[] {
  const files = fs
    .readdirSync(path.join(repoRoot, dir), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(repoRoot, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'))
    .sort();
  if (files.length === 0) throw new Error(`${dir}/: no files found`);
  return files;
}

export interface Block {
  lang: string;
  code: string;
  before: string;
  after: string;
}

/** The first fenced code block in `file` whose content includes `contains`. */
export function extractBlock(file: string, contains: string, lang?: string): Block {
  const markdown = readRepoFile(file);
  for (const match of markdown.matchAll(/^```(\w*)\n([\s\S]*?)\n```$/gm)) {
    if ((lang === undefined || match[1] === lang) && match[2].includes(contains)) {
      return {
        lang: match[1] || 'text',
        code: match[2],
        before: markdown.slice(0, match.index).trim(),
        after: markdown.slice(match.index + match[0].length).trim(),
      };
    }
  }
  throw new Error(`${file}: no \`\`\`${lang ?? ''} code block containing "${contains}"`);
}

/** Rows of the markdown table in `file` whose first cell starts with `prefix`. */
export function extractTableRows(file: string, prefix: string): string[][] {
  const rows = readRepoFile(file)
    .split('\n')
    .filter((line) => line.startsWith(`| ${prefix}`))
    .map((line) => line.slice(1, -1).split('|').map((cell) => cell.trim()));
  if (rows.length === 0) throw new Error(`${file}: no table rows starting with "${prefix}"`);
  return rows;
}

/** The text of the first `# ` heading in `markdown`. */
export function extractTitle(markdown: string, file: string): string {
  const title = markdown.match(/^# (.+)$/m)?.[1];
  if (!title) throw new Error(`${file}: no # heading`);
  return title;
}

/**
 * Where a relative link inside a repo file should point on the site:
 * links into content/ go to the site page, everything else goes to GitHub.
 */
export function resolveRepoHref(href: string, fromFile: string): string {
  if (/^([a-z]+:|#)/i.test(href)) return href;
  const [target, hash] = path.posix.join(path.posix.dirname(fromFile), href).split('#');
  const suffix = hash ? `#${hash}` : '';
  if (target.startsWith('content/') && target.endsWith('.md')) {
    const slugs = target.slice('content/'.length, -'.md'.length).split('/').filter((s) => s !== 'index');
    const page = source.getPage(slugs);
    if (!page) throw new Error(`${fromFile}: link to missing page ${href}`);
    return page.url + suffix;
  }
  const absolute = path.join(repoRoot, target);
  if (!fs.existsSync(absolute)) throw new Error(`${fromFile}: link to missing file ${href}`);
  return (fs.statSync(absolute).isDirectory() ? blobUrl(target).replace('/blob/', '/tree/') : blobUrl(target)) + suffix;
}

const languages: Record<string, string> = { '.md': 'md', '.mdc': 'md', '.json': 'json', '.yml': 'yaml', '.yaml': 'yaml' };

export function languageOf(file: string): string {
  return languages[path.extname(file)] ?? 'text';
}
