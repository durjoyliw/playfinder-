import { requireAdmin } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

export default async function AdminHomePage() {
  await requireAdmin();
  redirect("/admin/users");
}
