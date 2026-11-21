import { FolderPage } from '@/components/folder-page';

export const metadata = { title: 'Guardrails', description: 'Git hooks and GitHub Actions that block bad code.' };

export default function Page() {
  return <FolderPage dir="guardrails" />;
}
