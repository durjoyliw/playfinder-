import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { sportTabToPostSport } from "@/lib/playfinder";
import { getPostDataInclude } from "@/lib/types";
import { z } from "zod";
import { PostIntent } from "@prisma/client";

const createSocialPostSchema = z.object({
  content: z.string().trim().min(1).max(280),
  type: z.enum(["SOCIAL", "ARENA"]).default("SOCIAL"),
  sportTags: z.array(z.string()).max(10).default([]),
  visibility: z.enum(["PUBLIC", "TEAMMATES_ONLY"]).default("PUBLIC"),
});

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = createSocialPostSchema.parse(await req.json());

    const firstSport = body.sportTags[0] ?? null;
    const mappedSport = firstSport ? sportTabToPostSport(firstSport) : undefined;

    const newPost = await prisma.post.create({
      data: {
        content: body.content,
        userId: user.id,
        type: body.type,
        intent: PostIntent.BANTER,
        sport: mappedSport ?? null,
        visibility: body.visibility,
        expiresAt: null,
        slotsNeeded: null,
        timeLabel: null,
        location: null,
      },
      include: getPostDataInclude(user.id),
    });

    return Response.json(newPost);
  } catch (error) {
    console.error("POST /api/posts failed:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

