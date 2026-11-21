import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';

/** A highlighted code block with a copy button, rendered at build time. */
export function Code({ code, lang = 'text', title }: { code: string; lang?: string; title?: string }) {
  return (
    <ServerCodeBlock
      code={code}
      lang={lang}
      themes={{ light: 'github-light', dark: 'github-dark' }}
      codeblock={{ title, className: 'my-4' }}
    />
  );
}
