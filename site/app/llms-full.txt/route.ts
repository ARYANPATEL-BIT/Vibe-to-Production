import { contentPages, pageUrl, rawBody, textResponse } from '@/lib/llms';

export const revalidate = false;

export function GET() {
  const pages = contentPages().map(
    (page) => `# ${page.data.title}\n\nURL: ${pageUrl(page.url)}\n\n${page.data.description}\n\n${rawBody(page.path)}`,
  );
  return textResponse(pages.join('\n\n---\n\n') + '\n');
}
