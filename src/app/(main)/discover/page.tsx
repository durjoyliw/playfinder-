import { DiscoverPage } from "@/components/discover/discover-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover",
};

export default function Page() {
  return <DiscoverPage />;
}
