import { extractBlock } from './repo';

/** The /plugin install commands from the README's Quick start, one per line. */
export function pluginCommands(): string[] {
  const commands = extractBlock('README.md', '/plugin marketplace add', 'text').code.split('\n').filter(Boolean);
  if (!commands.every((line) => line.startsWith('/plugin '))) {
    throw new Error('README.md: the plugin install block should only contain /plugin commands');
  }
  return commands;
}
