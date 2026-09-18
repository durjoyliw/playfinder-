import { hidePost, restorePost } from "@/lib/admin/posts";
import { format } from "date-fns";

type AdminPost = {
  id: string;
  content: string;
  createdAt: Date;
  deletedAt: Date | null;
  deletionReason: string | null;
};

export function UserPostsList({ posts }: { posts: AdminPost[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Recent posts</h2>
      {posts.length === 0 ? (
        <p className="text-sm text-[#8a8f86]">No posts</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => {
            const hide = hidePost.bind(null, post.id);
            const restore = restorePost.bind(null, post.id);

            return (
              <li
                key={post.id}
                className="rounded-xl border border-[#2a2f2a] bg-[#121412] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="line-clamp-3 text-sm text-[#c4c9bf]">
                    {post.content || "(empty)"}
                  </p>
                  {post.deletedAt && (
                    <span className="shrink-0 rounded-full border border-red-900/60 px-2 py-0.5 text-[10px] text-red-300">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-[#8a8f86]">
                  {format(post.createdAt, "d MMM yyyy HH:mm")}
                  {post.deletionReason ? ` · ${post.deletionReason}` : ""}
                </p>
                {post.deletedAt ? (
                  <form action={restore} className="mt-3">
                    <button
                      type="submit"
                      className="h-8 rounded-md border border-[#dcef5a]/40 px-3 text-xs text-[#dcef5a]"
                    >
                      Restore post
                    </button>
                  </form>
                ) : (
                  <form action={hide} className="mt-3 flex flex-wrap gap-2">
                    <input
                      name="deletionReason"
                      placeholder="Deletion reason"
                      className="h-8 min-w-[180px] flex-1 rounded-md border border-[#2a2f2a] bg-[#08090a] px-2 text-xs outline-none focus:border-[#dcef5a]"
                    />
                    <button
                      type="submit"
                      className="h-8 rounded-md border border-red-900/70 px-3 text-xs text-red-300"
                    >
                      Hide post
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
