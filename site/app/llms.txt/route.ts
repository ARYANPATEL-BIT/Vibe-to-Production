import { contentPages, pageUrl, textResponse } from '@/lib/llms';

export const revalidate = false;

export function GET() {
  const sections = { learn: '## Learn', ship: '## Ship it' } as const;
  const lines = [
    '# vibe-to-prod',
    '',
    `> What production-ready means for AI-built apps, and a system design curriculum. Full text: ${pageUrl('/llms-full.txt')}`,
  ];
  for (const [key, heading] of Object.entries(sections)) {
    lines.push('', heading, '');
    for (const page of contentPages().filter((p) => p.slugs[0] === key)) {
      lines.push(`- [${page.data.title}](${pageUrl(page.url)}): ${page.data.description}`);
    }
  }
  return textResponse(lines.join('\n') + '\n');
}
