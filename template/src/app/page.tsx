import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Notes</h1>
      <p>
        A tiny app wired the way real products should be: verified auth, per-user data access,
        input validation, rate limiting, structured logs and error tracking.
      </p>
      <Link href="/dashboard">Open your notes →</Link>
    </main>
  );
}
