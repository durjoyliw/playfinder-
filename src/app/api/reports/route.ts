import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

const ALLOWED_TARGET_TYPES = new Set(["POST", "USER"]);

export async function POST(req: Request) {
  try {
    const { user: currentUser } = await validateRequest();

    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const targetType =
      typeof body?.targetType === "string" ? body.targetType.toUpperCase() : "";
    const targetId =
      typeof body?.targetId === "string" ? body.targetId.trim() : "";
    const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

    if (!ALLOWED_TARGET_TYPES.has(targetType)) {
      return Response.json({ error: "Invalid target type" }, { status: 400 });
    }

    if (!targetId) {
      return Response.json({ error: "Missing target" }, { status: 400 });
    }

    if (!reason || reason.length > 300) {
      return Response.json({ error: "Invalid reason" }, { status: 400 });
    }

    if (targetType === "POST") {
      const post = await prisma.post.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!post) {
        return Response.json({ error: "Post not found" }, { status: 404 });
      }
    }

    if (targetType === "USER") {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!targetUser) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }
    }

    const report = await prisma.report.create({
      data: {
        reporterId: currentUser.id,
        targetType,
        targetId,
        reason,
      },
      select: { id: true },
    });

    return Response.json({ success: true, reportId: report.id });
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
