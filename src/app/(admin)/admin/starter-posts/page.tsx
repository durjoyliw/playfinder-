import {
  OFFICIAL_ACCOUNT,
  PADEL_DEMO_POSTS,
  STARTER_POSTS,
} from "@/lib/admin/starter-posts-content";
import { requireAdmin } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { PublishButton } from "./publish-button";

export const metadata: Metadata = { title: "Starter posts" };

export default async function StarterPostsPage() {
  await requireAdmin();

  const [official, counts, existing] = await Promise.all([
    prisma.user.findUnique({
      where: { id: OFFICIAL_ACCOUNT.id },
      select: { username: true },
    }),
    prisma.post.groupBy({
      by: ["sport"],
      where: {
        deletedAt: null,
        sport: { in: STARTER_POSTS.map((s) => s.sport) },
        userId: { not: OFFICIAL_ACCOUNT.id },
      },
      _count: { _all: true },
    }),
    prisma.post.findMany({
      where: {
        content: {
          in: [
            ...STARTER_POSTS.map((s) => s.content),
            ...PADEL_DEMO_POSTS.map((p) => p.content),
          ],
        },
      },
      select: { content: true },
    }),
  ]);
  const postsBySport = new Map(counts.map((c) => [c.sport, c._count._all]));
  const posted = new Set(existing.map((p) => p.content));

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Starter posts</h1>
        <p className="mt-1 text-sm text-[#8a8f86]">
          Gives empty sports something to reply to. Safe to press more than
          once: anything already posted is skipped.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Official account</h2>
        <p className="text-sm text-[#8a8f86]">
          {official
            ? `Exists as @${official.username}.`
            : `Will be created: "${OFFICIAL_ACCOUNT.displayName}" (@${OFFICIAL_ACCOUNT.username}).`}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">
          Conversation starters (from the official account)
        </h2>
        <ul className="space-y-2">
          {STARTER_POSTS.map((s) => {
            const count = postsBySport.get(s.sport) ?? 0;
            const status = posted.has(s.content)
              ? "Posted"
              : count > 0
                ? `Skipped: ${count} post${count === 1 ? "" : "s"} already`
                : "Will post";
            return (
              <li
                key={s.sport}
                className="rounded-xl border border-[#2a2f2a] p-3"
              >
                <div className="flex justify-between gap-3 text-xs text-[#8a8f86]">
                  <span>{s.sport}</span>
                  <span
                    className={status === "Will post" ? "text-[#a1c217]" : ""}
                  >
                    {status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#f2f5ef]">{s.content}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Padel demo posts</h2>
        <ul className="space-y-2">
          {PADEL_DEMO_POSTS.map((p) => (
            <li
              key={p.content}
              className="rounded-xl border border-[#2a2f2a] p-3"
            >
              <div className="flex justify-between gap-3 text-xs text-[#8a8f86]">
                <span>@{p.username}</span>
                <span className={posted.has(p.content) ? "" : "text-[#a1c217]"}>
                  {posted.has(p.content) ? "Posted" : "Will post"}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#f2f5ef]">{p.content}</p>
              {p.comments.length > 0 && (
                <p className="mt-1 text-xs text-[#8a8f86]">
                  + {p.comments.length} comment
                  {p.comments.length === 1 ? "" : "s"}, {p.likes.length} likes
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <PublishButton />
    </div>
  );
}
