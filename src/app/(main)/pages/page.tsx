import { validateRequest } from "@/auth";
import { PageBackHeader } from "@/components/playfinder/page-back-header";
import { redirect } from "next/navigation";

/**
 * Stub Your Pages screen (Phase 1). Full list UI comes in a later phase.
 */
export default async function YourPagesPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  return (
    <div className="min-h-full bg-[#08090a] font-grotesk text-[#f2f5ef]">
      <PageBackHeader title="Your Pages" />
      <div className="px-4 py-8">
        <p className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
          Coming soon
        </p>
        <h1 className="mt-2 text-[22px] font-bold tracking-[-0.03em]">
          Your Pages
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#b4bcaf]">
          Manage the clubs and venues you own or admin. This screen is a stub
          until the Pages list ships.
        </p>
      </div>
    </div>
  );
}
