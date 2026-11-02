"use client";

import { useActionState } from "react";
import { createNote, type NoteState } from "./actions";

export function NoteForm() {
  const [state, action, pending] = useActionState<NoteState, FormData>(createNote, {});

  return (
    <>
      <form action={action}>
        <input name="content" placeholder="Write a note" maxLength={500} required />
        <button disabled={pending}>{pending ? "Saving…" : "Add"}</button>
      </form>
      {state.error && <div className="error">{state.error}</div>}
    </>
  );
}
