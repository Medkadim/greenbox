import type { ZodType } from "zod";

// Server actions must never throw on bad input — Zod's .parse() does, and an
// uncaught throw inside a Server Action crashes the whole request (a blank
// "Application error" for the user, no useful message). Route every action
// through this instead of calling schema.parse() directly.
export function parseInput<T>(
  schema: ZodType<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Invalid input." };
  }
  return { success: true, data: result.data };
}
