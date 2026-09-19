import { validateRequest } from "@/auth";
import { searchTeammates } from "@/lib/teammate-server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    const teammates = await searchTeammates(user.id, q);

    const users = teammates.map((t) => ({
      id: t.id,
      username: t.username,
      displayName: t.displayName,
      avatarUrl: t.avatarUrl,
    }));

    return Response.json({ users });
  } catch (error) {
    console.error("GET /api/teammates/search error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
