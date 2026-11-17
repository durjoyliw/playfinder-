"use server";

import { requireAdmin } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function setFeedbackStatus(id: string, status: "NEW" | "DONE") {
  await requireAdmin();
  await prisma.feedback.update({ where: { id }, data: { status } });
  revalidatePath("/admin/feedback");
}
