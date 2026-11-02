import { describe, expect, it } from "vitest";
import { emailSchema, noteSchema } from "./validation";

describe("noteSchema", () => {
  it("accepts a normal note and trims it", () => {
    expect(noteSchema.parse({ content: "  buy milk  " })).toEqual({ content: "buy milk" });
  });

  it("rejects empty and whitespace-only notes", () => {
    expect(noteSchema.safeParse({ content: "" }).success).toBe(false);
    expect(noteSchema.safeParse({ content: "    " }).success).toBe(false);
  });

  it("rejects notes over 500 characters", () => {
    expect(noteSchema.safeParse({ content: "a".repeat(501) }).success).toBe(false);
  });

  it("rejects extra types sneaking in", () => {
    expect(noteSchema.safeParse({ content: 123 }).success).toBe(false);
  });
});

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    expect(emailSchema.safeParse({ email: "founder@example.com" }).success).toBe(true);
  });

  it("rejects garbage", () => {
    expect(emailSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});
