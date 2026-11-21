import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, repoUrl } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <span className="font-display text-[1.05rem] font-semibold">{appName}</span>,
    },
    links: [
      { text: 'Learn', url: '/learn/00-foundations', active: 'none' },
      { text: 'Ship it', url: '/ship/00-start-here', active: 'none' },
      { text: 'Get it', url: '/get-it', active: 'nested-url' },
    ],
    githubUrl: repoUrl,
  };
}
