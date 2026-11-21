import Link from 'next/link';
import { Code } from '@/components/code';
import { pluginCommands } from '@/lib/install';
import { blobUrl, extractBlock, extractTableRows } from '@/lib/repo';

export const metadata = { title: 'Get it', description: 'Install the vibe-to-prod Claude Code plugin, or copy the files.' };

export default function Page() {
  const commands = extractTableRows('README.md', '`/vibe:');
  const onePrompt = extractBlock('README.md', 'INSTALL.md', 'text');

  return (
    <main className="prose mx-auto w-full max-w-3xl px-6 py-16">
      <p className="not-prose font-mono text-xs text-fd-primary">get it</p>
      <h1>Get it</h1>
      <p>Everything on these pages is read from the repo when the site is built, so it always matches what you get.</p>

      <h2>Claude Code plugin</h2>
      <p>Install it once. In Claude Code, run:</p>
      {pluginCommands().map((command) => (
        <Code key={command} code={command} />
      ))}
      <p>
        Then open your project in Claude Code and run <code>/vibe:setup</code>.
      </p>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          {commands.map(([command, description]) => (
            <tr key={command}>
              <td className="whitespace-nowrap">
                <code>{command.replaceAll('`', '')}</code>
              </td>
              <td>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Cursor, Codex or another agent</h2>
      <p>Open your project in it and paste this:</p>
      <Code code={onePrompt.code} />
      <p>
        The agent follows <a href={blobUrl('INSTALL.md')}>INSTALL.md</a>: it adds the rules and guardrails, adapts them
        to your project, runs your checks and tells you what it changed.
      </p>

      <h2>Or copy the files yourself</h2>
      <ul>
        <li>
          <Link href="/get-it/agent-rules">Agent rules</Link>: the files your AI reads every session.
        </li>
        <li>
          <Link href="/get-it/prompts">Prompts</Link>: plan, build, review, audit, launch, incident.
        </li>
        <li>
          <Link href="/get-it/guardrails">Guardrails</Link>: hooks and CI checks that block bad code.
        </li>
      </ul>
    </main>
  );
}
