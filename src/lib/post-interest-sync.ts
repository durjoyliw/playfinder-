import prisma from "@/lib/prisma";

// Split out from post-interest.ts (server-only: pulls in the Prisma client,
// which itself pulls in web-push for the push-notification extension). Kept
// separate so client components can import the pure helpers in
// post-interest.ts without dragging prisma/web-push into the browser bundle.

/** The global client or a transaction client (prisma is an extended client). */
type Db = Pick<typeof prisma, "postInterest" | "post">;

/** Accepted players for a post, counted inside the caller's transaction. */
export async function countAccepted(db: Db, postId: string): Promise<number> {
  return db.postInterest.count({ where: { postId, status: "ACCEPTED" } });
}

/**
 * Recomputes Post.isFull. Pass the transaction client when calling from
 * inside a transaction — it used to always write through the global client,
 * so the update wasn't part of the surrounding transaction.
 */
export async function syncPostIsFull(
  postId: string,
  slotsNeeded: number | null,
  acceptedCount: number,
  db: Db = prisma,
) {
  const isFull =
    slotsNeeded != null && slotsNeeded > 0 && acceptedCount >= slotsNeeded;

  await db.post.update({
    where: { id: postId },
    data: { isFull },
  });

  return isFull;
}

/**
 * Locks the post row for the rest of the transaction, so concurrent
 * accept / manual-fill requests on the same game run one at a time and
 * can't overfill it.
 */
export async function lockPost(
  tx: Pick<typeof prisma, "$queryRaw">,
  postId: string,
) {
  // $queryRaw (not $executeRaw) because it's a SELECT that returns rows.
  await tx.$queryRaw`SELECT 1 FROM "posts" WHERE "id" = ${postId} FOR UPDATE`;
}
