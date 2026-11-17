import { PageBackHeader } from "@/components/playfinder/page-back-header";
import { Metadata } from "next";
import Notifications from "./Notifications";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function Page() {
  return (
    <div className="min-h-full bg-[var(--pf-bg)]">
      {/* A bottom-nav tab, so no back arrow; sits under the app header. */}
      <PageBackHeader
        title="Notifications"
        showBack={false}
        className="top-[var(--pf-header-h)] lg:top-0"
      />
      <div className="space-y-4 px-4 py-4">
        <Notifications />
      </div>
    </div>
  );
}
