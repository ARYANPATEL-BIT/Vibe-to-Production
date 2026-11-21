import path from 'node:path';
import { Markdown } from 'fumadocs-core/content/md';
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import Link from 'fumadocs-core/link';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { resolveRepoHref } from '@/lib/repo';

/**
 * Renders markdown taken from a repo file. Relative links go to the site page (for content/)
 * or to GitHub; links to a file listed in `onPage` jump to that file's section on this page.
 */
export function RepoMarkdown({ file, onPage = [], children }: { file: string; onPage?: string[]; children: string }) {
  function href(link: string) {
    const target = path.posix.join(path.posix.dirname(file), link.split('#')[0]);
    return onPage.includes(target) ? `#${target}` : resolveRepoHref(link, file);
  }

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        ...defaultMdxComponents,
        a: ({ href: link = '', ...props }) => <Link href={href(link)} {...props} />,
      }}
    >
      {children}
    </Markdown>
  );
}
