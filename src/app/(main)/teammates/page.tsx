import { validateRequest } from "@/auth";
import { PageBackHeader } from "@/components/playfinder/page-back-header";
import { TeammatesList } from "@/components/teammates/teammates-list";
import { getTeammates } from "@/lib/teammate";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Teammates",
};

interface PageProps {
  searchParams: { user?: string };
}

export default async function TeammatesPage({ searchParams }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="px-4 py-8 text-center text-sm text-red-400">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  let profileUserId = loggedInUser.id;

  if (searchParams.user) {
    const profileUser = await prisma.user.findFirst({
      where: {
        username: { equals: searchParams.user, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (!profileUser) notFound();
    profileUserId = profileUser.id;
  }

  const teammates = await getTeammates(profileUserId);
  const canRemove = profileUserId === loggedInUser.id;

  return (
    <div className="min-h-full bg-[#0d0d0d] pb-28">
      <PageBackHeader title="Teammates" />
      <TeammatesList initialTeammates={teammates} canRemove={canRemove} />
    </div>
  );
}
