import { FolderPage } from '@/components/folder-page';

export const metadata = { title: 'Agent rules', description: 'Drop-in AGENTS.md, CLAUDE.md and Cursor rules.' };

export default function Page() {
  return <FolderPage dir="agent-rules" />;
}
