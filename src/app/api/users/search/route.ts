import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (!q) {
      return Response.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        OR: [
          { displayName: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
      take: 20,
      orderBy: { displayName: "asc" },
    });

    return Response.json({ users });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
