"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitAppeal(
  formData: FormData,
): Promise<{ error?: string } | void> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "You must be signed in to appeal." };
  }

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { status: true },
  });

  if (
    !account ||
    (account.status !== "SUSPENDED" && account.status !== "BANNED")
  ) {
    return { error: "Your account is not restricted." };
  }

  const pending = await prisma.appeal.findFirst({
    where: { userId: user.id, status: "PENDING" },
  });

  if (pending) {
    return { error: "You already have a pending appeal." };
  }

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    return { error: "Please explain why your account should be reinstated." };
  }

  await prisma.appeal.create({
    data: {
      userId: user.id,
      reason,
    },
  });

  revalidatePath("/");
}
