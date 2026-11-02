"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, {});

  if (state.sent) return <p className="ok">Check your inbox for a sign-in link.</p>;

  return (
    <>
      <form action={action}>
        <input name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        <button disabled={pending}>{pending ? "Sending…" : "Send link"}</button>
      </form>
      {state.error && <div className="error">{state.error}</div>}
    </>
  );
}
