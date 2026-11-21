import type { Metadata } from 'next';
import { Fraunces, JetBrains_Mono } from 'next/font/google';
import { Provider } from '@/components/provider';
import { appName, siteUrl } from '@/lib/shared';
import './global.css';

// Display face for headings, monospace for commands and code. Self-hosted by next/font at build time.
const display = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', axes: ['opsz'] });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${appName}: vibe code it, ship it like a professional`, template: `%s · ${appName}` },
  description:
    'What production-ready actually means for AI-built apps, plus the rules, prompts and automated checks that make your AI build it that way.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
