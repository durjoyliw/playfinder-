"use server";

import { lucia, validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { getUploadThingFileKey } from "@/lib/uploadthing-file-key";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UTApi } from "uploadthing/server";

export interface DeleteAccountResult {
  error: string;
}

/**
 * Permanently deletes the signed-in user (GDPR erasure).
 *
 * Database (one transaction):
 * - the User row, which cascades to: sessions, sports, follows (both ways),
 *   posts (incl. posts published as a Page) and their comments, likes,
 *   bookmarks, interests and notifications; the user's own comments, likes,
 *   bookmarks, post interests, notifications (sent and received), message
 *   requests, push subscriptions, blocks, mutes, reports they filed,
 *   appeals, Page memberships and Page follows.
 * - Media rows attached to their posts (that FK is SetNull, so they would
 *   otherwise be left behind).
 * - Pages left with no OWNER become UNCLAIMED (the Page itself stays, like a
 *   seeded venue, so it can be claimed again). Pages they created keep
 *   existing; Page.createdById is set to null by the FK.
 *
 * Outside the database (best effort, after the commit):
 * - their avatar + post images on UploadThing
 * - their Stream Chat user, hard-deleting their messages
 *
 * Kept: reports and audit-log entries that others/admins filed about this
 * account (moderation records, no FK).
 */
export async function deleteAccount(
  confirmation: string,
): Promise<DeleteAccountResult | never> {
  const { user, session } = await validateRequest();
  if (!user || !session) {
    return { error: "You need to be signed in." };
  }

  // Server-side re-check of the typed confirmation.
  if (confirmation.trim().replace(/^@/, "").toLowerCase() !== user.username.toLowerCase()) {
    return { error: "That doesn't match your username." };
  }

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      avatarUrl: true,
      posts: { select: { attachments: { select: { id: true, url: true } } } },
      pageMemberships: {
        where: { role: "OWNER" },
        select: { pageId: true },
      },
    },
  });
  if (!account) {
    return { error: "Account not found." };
  }

  const media = account.posts.flatMap((post) => post.attachments);
  const ownedPageIds = account.pageMemberships.map((m) => m.pageId);

  try {
    await prisma.$transaction(async (tx) => {
      if (media.length > 0) {
        await tx.media.deleteMany({
          where: { id: { in: media.map((m) => m.id) } },
        });
      }

      await tx.user.delete({ where: { id: user.id } });

      if (ownedPageIds.length > 0) {
        await tx.page.updateMany({
          where: {
            id: { in: ownedPageIds },
            status: "ACTIVE",
            memberships: { none: { role: "OWNER" } },
          },
          data: { status: "UNCLAIMED" },
        });
      }
    });
  } catch (error) {
    console.error("deleteAccount: database step failed", error);
    return { error: "Something went wrong. Your account was not deleted." };
  }

  // The account is gone; external clean-up must not undo that, so failures
  // here are logged only.
  const fileUrls = [account.avatarUrl, ...media.map((m) => m.url)].filter(
    (url): url is string => !!url,
  );
  if (fileUrls.length > 0) {
    try {
      await new UTApi().deleteFiles(fileUrls.map(getUploadThingFileKey));
    } catch (error) {
      console.error("deleteAccount: UploadThing clean-up failed", error);
    }
  }

  try {
    await streamServerClient.deleteUser(user.id, {
      mark_messages_deleted: true,
      hard_delete: true,
    });
  } catch (error) {
    console.error("deleteAccount: Stream clean-up failed", error);
  }

  // Sessions were deleted with the user; also clear the browser cookie.
  const sessionCookie = lucia.createBlankSessionCookie();
  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  redirect("/");
}
