import { redirect } from "next/navigation";

// Bookmarks became "Saved" -- keep old links working.
export default function Page() {
  redirect("/saved");
}
