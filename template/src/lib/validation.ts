import { z } from "zod";

// Every input from the outside world gets checked against a schema on the server.
// Client-side checks are for user experience only; attackers skip the browser.
export const noteSchema = z.object({
  content: z.string().trim().min(1, "Note can't be empty").max(500, "Note is too long (500 characters max)"),
});

export const emailSchema = z.object({
  email: z.email("Enter a valid email address").max(254),
});
