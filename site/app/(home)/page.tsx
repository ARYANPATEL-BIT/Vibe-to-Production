import Link from 'next/link';
import { Code } from '@/components/code';
import { pluginCommands } from '@/lib/install';
import { repoUrl } from '@/lib/shared';
import { getLearnParts } from '@/lib/source';

const layers = [
  {
    name: 'Rules',
    href: '/get-it/agent-rules',
    text: 'AGENTS.md, CLAUDE.md and Cursor rules your AI reads every session, so it writes safer code by default.',
  },
  {
    name: 'Prompts',
    href: '/get-it/prompts',
    text: 'Copy-paste prompts for each phase: plan, build, review, security audit, launch and incident.',
  },
  {
    name: 'Guardrails',
    href: '/get-it/guardrails',
    text: 'Git hooks and GitHub Actions that block secrets, broken builds, failing tests and vulnerable dependencies.',
  },
];

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-[0.18em] text-fd-primary">{children}</p>;
}

export default function HomePage() {
  const parts = getLearnParts();

  return (
    <main className="mx-auto w-full max-w-5xl px-6">
      <section className="border-b py-20 md:py-28">
        <Label>For founders shipping AI-built apps</Label>
        <h1 className="mt-6 max-w-4xl text-5xl font-medium leading-[1.04] md:text-7xl">
          Vibe code it.
          <br />
          Ship it like a professional.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-fd-muted-foreground">
          AI can build your app in a weekend. It won&apos;t, by default, make it safe to put in front of paying
          customers. This is the missing half: what production-ready actually means, and the rules, prompts and checks
          that make your AI build it that way.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6 text-sm font-medium">
          <Link
            href="/ship/00-start-here"
            className="rounded-md bg-fd-primary px-4 py-2.5 text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Start here
          </Link>
          <Link href="/learn/00-foundations" className="underline-offset-4 hover:underline">
            Learn system design
          </Link>
        </div>
      </section>

      <section className="grid gap-10 border-b py-16 md:grid-cols-[1fr_1.3fr] md:gap-16">
        <div>
          <Label>Install</Label>
          <h2 className="mt-4 text-3xl font-medium">Two commands in Claude Code.</h2>
          <p className="mt-4 leading-relaxed text-fd-muted-foreground">
            Then run <code className="font-mono text-[0.9em] text-fd-foreground">/vibe:setup</code> in your project. It
            adds the rules and guardrails, adapts them to your stack and runs your checks.
          </p>
          <Link href="/get-it" className="mt-6 inline-block text-sm font-medium underline-offset-4 hover:underline">
            Other agents and every command →
          </Link>
        </div>
        <div className="self-center">
          {pluginCommands().map((command) => (
            <Code key={command} code={command} />
          ))}
        </div>
      </section>

      <section className="border-b py-16">
        <Label>How it works</Label>
        <h2 className="mt-4 max-w-2xl text-3xl font-medium">Three layers, each catching what the one before misses.</h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {layers.map((layer, i) => (
            <li key={layer.name} className="border-t pt-5">
              <p className="font-mono text-sm text-fd-muted-foreground">{i + 1}</p>
              <h3 className="mt-2 font-display text-2xl font-medium">{layer.name}</h3>
              <p className="mt-3 leading-relaxed text-fd-muted-foreground">{layer.text}</p>
              <Link href={layer.href} className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
                Get the {layer.name.toLowerCase()} →
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-b py-16">
        <Label>Learn</Label>
        <h2 className="mt-4 max-w-2xl text-3xl font-medium">A system design curriculum in eleven parts.</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-fd-muted-foreground">
          From how a request travels to designing systems you can defend. Lessons are being written now.
        </p>
        <ol className="mt-10 grid md:grid-cols-2 md:gap-x-12">
          {parts.map((part) => (
            <li key={part.url} className="border-t">
              <Link href={part.url} className="group grid grid-cols-[2.75rem_1fr] gap-x-2 py-5">
                <span className="pt-1 font-mono text-sm text-fd-primary">{part.slugs[1].slice(0, 2)}</span>
                <span>
                  <span className="font-display text-xl font-medium group-hover:text-fd-primary">{part.data.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-fd-muted-foreground">
                    {part.data.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="py-12">
        <p className="max-w-3xl leading-relaxed text-fd-muted-foreground">
          <span className="mr-3 font-mono text-xs uppercase tracking-[0.18em] text-fd-foreground">Honest limits</span>
          This makes AI-built apps dramatically safer, not guaranteed safe. Nothing does. Once you handle sensitive data
          or real revenue, pay for a professional security review, and use this to make it short and cheap.
        </p>
      </section>

      <footer className="flex justify-between border-t py-8 font-mono text-xs text-fd-muted-foreground">
        <span>MIT licensed</span>
        <a href={repoUrl} className="hover:text-fd-primary">
          github
        </a>
      </footer>
    </main>
  );
}
