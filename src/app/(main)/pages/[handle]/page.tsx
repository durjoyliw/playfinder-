import { PageView } from "@/app/(main)/pages/[handle]/page-view";
import { getPageViewByHandle } from "@/lib/pages/get-page-view";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: { handle: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const page = await getPageViewByHandle(params.handle);
  if (!page) return { title: "Page" };
  return { title: page.name };
}

export default async function PageRoute({ params }: PageProps) {
  const page = await getPageViewByHandle(params.handle);
  if (!page) notFound();

  return <PageView page={page} />;
}
