import prisma from "@/lib/prisma";
import { getUploadThingFileKey } from "@/lib/uploadthing-file-key";
import { UTApi } from "uploadthing/server";
import {
  isAuthorizedCronRequest,
  unauthorizedCronResponse,
} from "@/lib/cron-auth";

export async function GET(req: Request) {
  try {
    if (!isAuthorizedCronRequest(req)) {
      return unauthorizedCronResponse();
    }

    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        ...(process.env.NODE_ENV === "production"
          ? {
              createdAt: {
                lte: new Date(Date.now() - 1000 * 60 * 60 * 24),
              },
            }
          : {}),
      },
      select: {
        id: true,
        url: true,
      },
    });

    new UTApi().deleteFiles(
      unusedMedia.map((m) => getUploadThingFileKey(m.url)),
    );

    await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id),
        },
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
