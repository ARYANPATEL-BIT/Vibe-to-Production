import { redirect } from "next/navigation";
import { createClient, getUserId } from "@/lib/supabase/server";
import { deleteNote, signOut } from "./actions";
import { NoteForm } from "./note-form";

export default async function Dashboard() {
  // The proxy already redirects signed-out visitors, but check again here:
  // the page that reads the data is the one that must be sure who's asking.
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50); // never load an unbounded list

  return (
    <main>
      <div className="row">
        <h1>Your notes</h1>
        <form action={signOut}>
          <button className="link">Sign out</button>
        </form>
      </div>
      <NoteForm />
      {error && <div className="error">Couldn&apos;t load your notes. Refresh to try again.</div>}
      {notes?.length === 0 && <p>No notes yet.</p>}
      <ul>
        {notes?.map((note) => (
          <li key={note.id}>
            <span>{note.content}</span>
            <form action={deleteNote}>
              <input type="hidden" name="id" value={note.id} />
              <button className="link" aria-label="Delete note">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
