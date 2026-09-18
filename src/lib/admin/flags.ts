"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeAuditLog } from "./audit";
import { ADMIN_ACTOR_ID, requireAdmin } from "./auth";

export async function toggleFeatureFlag(flagId: string) {
  await requireAdmin();

  const flag = await prisma.featureFlag.findUnique({ where: { id: flagId } });
  if (!flag) {
    throw new Error("Feature flag not found");
  }

  const enabled = !flag.enabled;

  await prisma.featureFlag.update({
    where: { id: flagId },
    data: {
      enabled,
      updatedBy: ADMIN_ACTOR_ID,
    },
  });

  await writeAuditLog({
    action: enabled ? "ENABLE_FEATURE_FLAG" : "DISABLE_FEATURE_FLAG",
    targetType: "FEATURE_FLAG",
    targetId: flag.key,
    reason: `${flag.key} ${enabled ? "enabled" : "disabled"}`,
  });

  revalidatePath("/admin/feature-flags");
  revalidatePath("/admin/audit-log");
}

export async function createFeatureFlag(formData: FormData) {
  await requireAdmin();

  const key = String(formData.get("key") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  const description = String(formData.get("description") ?? "").trim();
  const enabled = formData.get("enabled") === "on";
  const rolloutRaw = String(formData.get("rolloutPercent") ?? "").trim();
  const cityScope = String(formData.get("cityScope") ?? "").trim() || null;
  const rolloutPercent = rolloutRaw ? Number(rolloutRaw) : null;

  if (!key) {
    throw new Error("Flag key is required");
  }

  const flag = await prisma.featureFlag.create({
    data: {
      key,
      description: description || null,
      enabled,
      rolloutPercent:
        rolloutPercent !== null && Number.isFinite(rolloutPercent)
          ? rolloutPercent
          : null,
      cityScope,
      updatedBy: ADMIN_ACTOR_ID,
    },
  });

  await writeAuditLog({
    action: "CREATE_FEATURE_FLAG",
    targetType: "FEATURE_FLAG",
    targetId: flag.key,
    reason: `Created flag ${flag.key}`,
  });

  revalidatePath("/admin/feature-flags");
  revalidatePath("/admin/audit-log");
}
