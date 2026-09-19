import { CreatePageWizard } from "@/app/(main)/pages/new/create-page-wizard";
import prisma from "@/lib/prisma";
import { PageType } from "@prisma/client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Page",
};

export default async function CreatePagePage() {
  const venues = await prisma.page.findMany({
    where: { type: PageType.VENUE, status: "ACTIVE" },
    select: { id: true, name: true, handle: true },
    orderBy: { name: "asc" },
    take: 50,
  });

  return <CreatePageWizard venues={venues} />;
}
