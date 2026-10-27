import { unstable_after } from "next/server";

/**
 * Runs `task` after the current response has been sent, keeping the
 * serverless function alive until it finishes (Next's `after()`, backed by
 * Vercel's waitUntil). Anything the request awaited -- including database
 * transactions -- has finished by then.
 *
 * Outside a request (scripts, seeding) `after()` throws, so the task just
 * runs in the background instead.
 *
 * Requires `experimental.after: true` in next.config.mjs (Next 15 RC).
 */
export function runAfterResponse(task: () => Promise<unknown>, label: string) {
  const run = async () => {
    try {
      await task();
    } catch (error) {
      console.error(`${label} failed`, error);
    }
  };

  try {
    unstable_after(run);
  } catch {
    void run();
  }
}
