import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";

export async function POST() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: { id: true, displayName: true, username: true },
    });

    if (users.length > 0) {
      await streamServerClient.upsertUsers(
        users.map((u) => ({
          id: u.id,
          name: u.displayName,
          username: u.username,
        })),
      );
    }

    return Response.json({ synced: users.length });
  } catch (error) {
    console.error("Failed to sync Stream users", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
