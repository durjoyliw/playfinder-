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
    <div className="min-h-full bg-[var(--pf-c-fill-08090a)] font-grotesk text-[var(--pf-c-ink-f2f5ef)]">
      <PageBackHeader title="Your Pages" />

      <div className="flex flex-col gap-3.5 px-4 py-4 lg:px-6">
        <Link
          href="/pages/new"
          className="flex w-full items-center gap-3 rounded-2xl bg-[var(--pf-volt)] px-4 py-3.5 text-left text-[15px] font-bold tracking-[-0.02em] text-[var(--pf-on-accent)] transition-[filter] hover:brightness-110 active:scale-[0.99]"
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dashed border-[color-mix(in_srgb,var(--pf-on-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--pf-on-accent)_18%,transparent)]"
            aria-hidden
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </span>
          <span>
            Create a Page
            <span className="mt-0.5 block font-dm-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--pf-on-accent)_70%,transparent)]">
              Club or venue
            </span>
          </span>
        </Link>

        {pages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--pf-c-line-353c34)] px-5 py-12 text-center">
            <div className="mx-auto mb-3.5 grid h-14 w-14 place-items-center rounded-[14px] border border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-c-fill-131614)] text-[var(--pf-c-ink-5a635a)] pf-card">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <h2 className="text-[16px] font-bold tracking-[-0.02em]">
              No pages yet
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--pf-c-ink-7e8a7e)]">
              No pages yet — create your first
            </p>
            <Link
              href="/pages/new"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--pf-volt)] px-5 text-[14px] font-bold text-[var(--pf-on-accent)] transition-[filter] hover:brightness-110"
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
                    className="flex items-center gap-3 rounded-2xl border border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-c-fill-131614)] p-3 transition-colors hover:bg-[var(--pf-c-fill-1a1e1b)] active:scale-[0.99] pf-card"
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
                          "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--pf-c-fill-232824)] text-[15px] font-bold",
                          isVenue ? "text-[#c9a227]" : "text-[var(--pf-volt-text)]",
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
                      <p className="mt-0.5 truncate text-[13px] text-[var(--pf-c-ink-7e8a7e)]">
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
