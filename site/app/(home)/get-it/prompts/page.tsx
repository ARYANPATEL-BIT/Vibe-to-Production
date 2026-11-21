import { Code } from '@/components/code';
import { RepoMarkdown } from '@/components/repo-markdown';
import { blobUrl, extractBlock, extractTitle, listRepoFiles, rawUrl, readRepoFile } from '@/lib/repo';

export const metadata = { title: 'Prompts', description: 'Copy-paste prompts for each phase.' };

const readmeFile = 'prompts/README.md';

export default function Page() {
  const readme = readRepoFile(readmeFile);
  const prompts = listRepoFiles('prompts').filter((file) => file !== readmeFile);

  return (
    <main className="prose mx-auto w-full max-w-3xl px-6 py-16">
      <p className="not-prose font-mono text-xs text-fd-primary">get it / prompts</p>
      <h1>{extractTitle(readme, readmeFile)}</h1>
      <RepoMarkdown file={readmeFile} onPage={prompts}>
        {readme.replace(/^# .+\n/, '')}
      </RepoMarkdown>
      {prompts.map((file) => {
        // Each prompt file is: a title, a short intro, the prompt in a ```text block, then notes.
        const prompt = extractBlock(file, '', 'text');
        return (
          <section key={file} id={file} className="mt-16 scroll-mt-20">
            <h2>{extractTitle(prompt.before, file)}</h2>
            <RepoMarkdown file={file} onPage={prompts}>
              {prompt.before.replace(/^# .+\n?/, '')}
            </RepoMarkdown>
            <Code code={prompt.code} title="Prompt" />
            {prompt.after && (
              <RepoMarkdown file={file} onPage={prompts}>
                {prompt.after}
              </RepoMarkdown>
            )}
            <p className="font-mono text-xs">
              <a href={rawUrl(file)}>raw</a> · <a href={blobUrl(file)}>{file}</a>
            </p>
          </section>
        );
      })}
    </main>
  );
}
