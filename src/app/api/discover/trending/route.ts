import { validateRequest } from "@/auth";
import { getTrendingTopics } from "@/lib/trending";

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trending = await getTrendingTopics();

    return Response.json({ trending });
  } catch (error) {
    console.error("GET /api/discover/trending error:", error);
    return Response.json(
      { error: "Failed to load trending topics" },
      { status: 500 },
    );
  }
}
