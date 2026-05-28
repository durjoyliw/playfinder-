import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: currentUser } = await validateRequest();

    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const muted = await prisma.mute.findUnique({
      where: {
        muterId_mutedId: {
          muterId: currentUser.id,
          mutedId: userId,
        },
      },
      select: { id: true },
    });

    return Response.json({ muted: !!muted });
  } catch (error) {
    console.error("GET /api/users/[userId]/mute error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: currentUser } = await validateRequest();

    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.id === userId) {
      return Response.json({ error: "Cannot mute yourself" }, { status: 400 });
    }

    await prisma.mute.upsert({
      where: {
        muterId_mutedId: {
          muterId: currentUser.id,
          mutedId: userId,
        },
      },
      create: { muterId: currentUser.id, mutedId: userId },
      update: {},
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/users/[userId]/mute error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: currentUser } = await validateRequest();

    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.mute.deleteMany({
      where: {
        muterId: currentUser.id,
        mutedId: userId,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/users/[userId]/mute error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

