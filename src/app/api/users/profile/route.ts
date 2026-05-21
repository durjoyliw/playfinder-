import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import type { UserSettingsData } from "@/lib/settings";
import streamServerClient from "@/lib/stream";
import {
  patchUserProfileSchema,
  updateUserSportsSchema,
} from "@/lib/validation";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const userProfileSelect = {
  username: true,
  displayName: true,
  bio: true,
  location: true,
  profileIntent: true,
  email: true,
  sports: {
    select: {
      sport: true,
      skillLevel: true,
    },
    orderBy: {
      sport: "asc" as const,
    },
  },
} satisfies Prisma.UserSelect;

export async function GET() {
  try {
    const { user: sessionUser } = await auth();

    if (!sessionUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: sessionUser.id },
          ...(sessionUser.email
            ? [{ email: sessionUser.email }]
            : []),
        ],
      },
      select: userProfileSelect,
    });

    if (!dbUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const data: UserSettingsData = {
      username: dbUser.username,
      displayName: dbUser.displayName,
      bio: dbUser.bio,
      location: dbUser.location,
      profileIntent: dbUser.profileIntent,
      email: dbUser.email,
      sports: dbUser.sports,
    };

    return Response.json(data);
  } catch (error) {
    console.error("GET /api/users/profile failed:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user } = await auth();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = patchUserProfileSchema.parse(await req.json());

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          ...(body.displayName !== undefined && {
            displayName: body.displayName,
          }),
          ...(body.bio !== undefined && { bio: body.bio || null }),
          ...(body.location !== undefined && {
            location: body.location || null,
          }),
          ...(body.profileIntent !== undefined && {
            profileIntent: body.profileIntent,
          }),
        },
        select: userProfileSelect,
      });

      if (body.displayName !== undefined) {
        await streamServerClient.partialUpdateUser({
          id: user.id,
          set: {
            name: body.displayName,
          },
        });
      }

      return updated;
    });

    const data: UserSettingsData = {
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      bio: updatedUser.bio,
      location: updatedUser.location,
      profileIntent: updatedUser.profileIntent,
      email: updatedUser.email,
      sports: updatedUser.sports,
    };

    revalidatePath(`/users/${updatedUser.username}`);

    return Response.json(data);
  } catch (error) {
    console.error("PATCH /api/users/profile failed:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { user } = await auth();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sports } = updateUserSportsSchema.parse(await req.json());

    await prisma.$transaction([
      prisma.userSport.deleteMany({
        where: { userId: user.id },
      }),
      ...(sports.length > 0
        ? [
            prisma.userSport.createMany({
              data: sports.map((entry) => ({
                userId: user.id,
                sport: entry.sport,
                skillLevel: entry.skillLevel,
              })),
            }),
          ]
        : []),
    ]);

    const dbUser = await prisma.user.findFirst({
      where: { id: user.id },
      select: userProfileSelect,
    });

    if (!dbUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const data: UserSettingsData = {
      username: dbUser.username,
      displayName: dbUser.displayName,
      bio: dbUser.bio,
      location: dbUser.location,
      profileIntent: dbUser.profileIntent,
      email: dbUser.email,
      sports: dbUser.sports,
    };

    revalidatePath(`/users/${dbUser.username}`);

    return Response.json(data);
  } catch (error) {
    console.error("PUT /api/users/profile failed:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
