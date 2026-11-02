import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main>
      <h1>Sign in</h1>
      <p>We&apos;ll email you a one-time link. No password to leak.</p>
      {error && <div className="error">That link expired or was already used. Request a new one.</div>}
      <LoginForm />
    </main>
  );
}
