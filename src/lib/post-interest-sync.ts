import prisma from "@/lib/prisma";

// Split out from post-interest.ts (server-only: pulls in the Prisma client,
// which itself pulls in web-push for the push-notification extension). Kept
// separate so client components can import the pure helpers in
// post-interest.ts without dragging prisma/web-push into the browser bundle.
export async function syncPostIsFull(
  postId: string,
  slotsNeeded: number | null,
  acceptedCount: number,
) {
  const isFull =
    slotsNeeded != null && slotsNeeded > 0 && acceptedCount >= slotsNeeded;

  await prisma.post.update({
    where: { id: postId },
    data: { isFull },
  });

  return isFull;
}
