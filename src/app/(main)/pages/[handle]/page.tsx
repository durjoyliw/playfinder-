import UserAvatar from "@/components/UserAvatar";
import { getInitials } from "@/lib/settings";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageInviteButton, PageShareButton } from "./page-share-button";

interface PageProps {
  params: { handle: string };
}

async function getPage(handle: string) {
  return prisma.page.findFirst({
    where: { handle: { equals: handle, mode: "insensitive" } },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const page = await getPage(params.handle);
  if (!page) return { title: "Page" };
  return { title: page.name };
}

export default async function PageView({ params }: PageProps) {
  const page = await getPage(params.handle);
  if (!page) notFound();

  const initials = getInitials(page.name);

  return (
    <div className="flex min-h-full flex-col items-center px-4 py-10 text-center font-grotesk text-[#f2f5ef] lg:px-6">
      {page.avatarUrl ? (
        <UserAvatar
          avatarUrl={page.avatarUrl}
          size={88}
          className="h-[88px] w-[88px] rounded-[1rem] border-0"
        />
      ) : (
        <div className="grid h-[88px] w-[88px] place-items-center rounded-[1rem] bg-[#1a1e1b]">
          <span className="text-2xl font-bold tracking-[-0.03em] text-[#a1c217]">
            {initials}
          </span>
        </div>
      )}
      <h1 className="mt-[18px] text-[26px] font-bold tracking-[-0.03em]">
        Your Page is live
      </h1>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <p className="text-[18px] font-bold tracking-[-0.03em]">{page.name}</p>
        <span className="inline-flex h-[22px] items-center rounded-full border border-[rgba(86,204,242,0.28)] bg-[rgba(86,204,242,0.1)] px-2 font-dm-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[#56ccf2]">
          {page.type === "VENUE" ? "Venue" : "Club"}
        </span>
      </div>
      <p className="mb-7 mt-1 text-sm text-[#7e8a7e]">
        @{page.handle} · anyone can find it now
      </p>
      <div className="flex w-full max-w-[360px] gap-2.5">
        <PageInviteButton />
        <PageShareButton handle={page.handle} name={page.name} />
      </div>
    </div>
  );
}
