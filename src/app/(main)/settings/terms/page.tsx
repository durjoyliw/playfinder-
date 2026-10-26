import { redirect } from "next/navigation";

// Legacy placeholder route — the real page now lives at /terms.
export default function Page() {
  redirect("/terms");
}
