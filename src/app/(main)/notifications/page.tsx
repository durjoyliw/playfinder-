import { PageBackHeader } from "@/components/playfinder/page-back-header";
import { Metadata } from "next";
import Notifications from "./Notifications";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function Page() {
  return (
    <div className="min-h-full bg-[#0d0d0d]">
      <PageBackHeader title="Notifications" />
      <div className="space-y-4 px-4 py-4">
        <Notifications />
      </div>
    </div>
  );
}
