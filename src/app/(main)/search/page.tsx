import { Metadata } from "next";
import { Suspense } from "react";
import { SearchPageClient } from "./search-page-client";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q ?? "";
  return {
    title: q ? `Search: ${q}` : "Search",
  };
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";

  return (
    <div className="mx-auto min-h-[calc(100dvh-3.5rem-5rem)] w-full max-w-[480px] bg-[#0d0d0d]">
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <p className="text-sm text-[#666666]">Loading…</p>
          </div>
        }
      >
        <SearchPageClient initialQuery={q} />
      </Suspense>
    </div>
  );
}
