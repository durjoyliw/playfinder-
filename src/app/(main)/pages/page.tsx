import { validateRequest } from "@/auth";
import { PageBackHeader } from "@/components/playfinder/page-back-header";
import UserAvatar from "@/components/UserAvatar";
import { getInitials } from "@/lib/settings";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { PageType } from "@prisma/client";
import { LayoutGrid, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function YourPagesPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  // Pages the user owns or admins — any PageMembership role.
  const pages = await prisma.page.findMany({
    where: {
      memberships: { some: { userId: user.id } },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      handle: true,
      name: true,
      type: true,
      avatarUrl: true,
    },
  });

  return (
    <div className="min-h-full bg-[#08090a] font-grotesk text-[#f2f5ef]">
      <PageBackHeader title="Your Pages" />

      <div className="flex flex-col gap-3.5 px-4 py-4 lg:px-6">
        <Link
          href="/pages/new"
          className="flex w-full items-center gap-3 rounded-2xl bg-[#a1c217] px-4 py-3.5 text-left text-[15px] font-bold tracking-[-0.02em] text-[#0a0b0a] transition-[filter] hover:brightness-110 active:scale-[0.99]"
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dashed border-[rgba(10,11,10,0.35)] bg-[rgba(10,11,10,0.18)]"
            aria-hidden
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </span>
          <span>
            Create a Page
            <span className="mt-0.5 block font-dm-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#0a0b0a]/70">
              Club or venue
            </span>
          </span>
        </Link>

        {pages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#353c34] px-5 py-12 text-center">
            <div className="mx-auto mb-3.5 grid h-14 w-14 place-items-center rounded-[14px] border border-[#2a2f2a] bg-[#131614] text-[#5a635a]">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <h2 className="text-[16px] font-bold tracking-[-0.02em]">
              No pages yet
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#7e8a7e]">
              No pages yet — create your first
            </p>
            <Link
              href="/pages/new"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#a1c217] px-5 text-[14px] font-bold text-[#0a0b0a] transition-[filter] hover:brightness-110"
            >
              Create a Page
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {pages.map((page) => {
              const initials = getInitials(page.name);
              const isVenue = page.type === PageType.VENUE;
              return (
                <li key={page.id}>
                  <Link
                    href={`/pages/${page.handle}`}
                    className="flex items-center gap-3 rounded-2xl border border-[#2a2f2a] bg-[#131614] p-3 transition-colors hover:bg-[#1a1e1b] active:scale-[0.99]"
                  >
                    {page.avatarUrl ? (
                      <UserAvatar
                        avatarUrl={page.avatarUrl}
                        size={48}
                        className="h-12 w-12 rounded-xl border-0"
                      />
                    ) : (
                      <div
                        className={cn(
                          "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#232824] text-[15px] font-bold",
                          isVenue ? "text-[#c9a227]" : "text-[#a1c217]",
                        )}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[15px] font-bold tracking-[-0.02em]">
                          {page.name}
                        </span>
                        <span
                          className={cn(
                            "inline-flex h-5 items-center rounded-full border px-2 font-dm-mono text-[9px] font-medium uppercase tracking-[0.1em]",
                            isVenue
                              ? "border-[rgba(201,162,39,0.32)] bg-[rgba(201,162,39,0.1)] text-[#c9a227]"
                              : "border-[rgba(86,204,242,0.28)] bg-[rgba(86,204,242,0.1)] text-[#56ccf2]",
                          )}
                        >
                          {isVenue ? "Venue" : "Club"}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-[#7e8a7e]">
                        @{page.handle}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
