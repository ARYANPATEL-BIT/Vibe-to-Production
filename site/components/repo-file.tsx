import { Code } from './code';
import { blobUrl, languageOf, rawUrl, readRepoFile } from '@/lib/repo';

/** One repo file, shown in full with a copy button and links to it on GitHub. */
export function RepoFile({ file }: { file: string }) {
  return (
    <section className="not-prose mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id={file} className="font-mono text-sm font-medium">
          {file}
        </h3>
        <p className="font-mono text-xs text-fd-muted-foreground">
          <a href={rawUrl(file)} className="hover:text-fd-primary">raw</a>
          {' · '}
          <a href={blobUrl(file)} className="hover:text-fd-primary">github</a>
        </p>
      </div>
      <Code code={readRepoFile(file)} lang={languageOf(file)} />
    </section>
  );
}
