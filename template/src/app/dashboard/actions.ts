"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { log } from "@/lib/log";
import { rateLimit } from "@/lib/ratelimit";
import { createClient, getUserId } from "@/lib/supabase/server";
import { noteSchema } from "@/lib/validation";

export type NoteState = { error?: string };

// Server actions are public HTTP endpoints. Every one of them must check:
// 1. who is calling, 2. whether they're allowed, 3. that the input is valid.
export async function createNote(_prev: NoteState, formData: FormData): Promise<NoteState> {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const { ok } = await rateLimit(`notes:create:${userId}`);
  if (!ok) return { error: "You're going a bit fast. Wait a minute and try again." };

  const parsed = noteSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("notes").insert({ content: parsed.data.content, user_id: userId });

  if (error) {
    log.error("create note failed", { userId, code: error.code });
    return { error: "Couldn't save your note. Please try again." };
  }

  log.info("note created", { userId });
  revalidatePath("/dashboard");
  return {};
}

export async function deleteNote(formData: FormData) {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  const supabase = await createClient();
  // Row Level Security already blocks deleting other people's notes.
  // The user_id filter is a second lock on the same door.
  const { error } = await supabase.from("notes").delete().eq("id", id.data).eq("user_id", userId);
  if (error) log.error("delete note failed", { userId, code: error.code });

  revalidatePath("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
