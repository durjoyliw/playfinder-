import { redirect } from "next/navigation";

// Legacy placeholder route — the real page now lives at /privacy.
export default function Page() {
  redirect("/privacy");
}
