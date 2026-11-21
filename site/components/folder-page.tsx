import { RepoFile } from './repo-file';
import { RepoMarkdown } from './repo-markdown';
import { extractTitle, listRepoFiles, readRepoFile } from '@/lib/repo';

/** A repo folder: its README as the intro, then every other file with a copy button. */
export function FolderPage({ dir }: { dir: string }) {
  const readmeFile = `${dir}/README.md`;
  const readme = readRepoFile(readmeFile);
  const files = listRepoFiles(dir).filter((file) => file !== readmeFile);

  return (
    <main className="prose mx-auto w-full max-w-3xl px-6 py-16">
      <p className="not-prose font-mono text-xs text-fd-primary">get it / {dir}</p>
      <h1>{extractTitle(readme, readmeFile)}</h1>
      <RepoMarkdown file={readmeFile}>{readme.replace(/^# .+\n/, '')}</RepoMarkdown>
      <h2>The files</h2>
      <p>
        Every file in <code>{dir}/</code>, exactly as it is in the repo.
      </p>
      {files.map((file) => (
        <RepoFile key={file} file={file} />
      ))}
    </main>
  );
}
