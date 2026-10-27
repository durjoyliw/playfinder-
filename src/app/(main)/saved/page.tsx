import { PageBackHeader } from "@/components/playfinder/page-back-header";
import { Metadata } from "next";
import { SavedPosts } from "./saved-posts";

export const metadata: Metadata = {
  title: "Saved",
};

export default function Page() {
  return (
    <div className="min-h-full bg-[var(--pf-bg)]">
      <PageBackHeader title="Saved" />
      <SavedPosts />
    </div>
  );
}
