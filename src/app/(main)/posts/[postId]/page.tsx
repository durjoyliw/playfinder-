import { validateRequest } from "@/auth";
import { PostDetailView } from "@/components/playfinder/post-detail-view";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

interface PageProps {
  params: { postId: string };
}

const getPost = cache(async (postId: string, loggedInUserId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: getPostDataInclude(loggedInUserId),
  });

  if (!post) notFound();

  return post;
});

export async function generateMetadata({
  params: { postId },
}: PageProps): Promise<Metadata> {
  const { user } = await validateRequest();

  if (!user) return {};

  const post = await getPost(postId, user.id);

  return {
    title: `${post.user.displayName} on PlayFinder`,
  };
}

export default async function Page({ params: { postId } }: PageProps) {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <p className="bg-[#0d0d0d] p-8 text-center text-red-400">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const post = await getPost(postId, user.id);

  return <PostDetailView post={post} loggedInUserId={user.id} />;
}
