import { redirect } from "next/navigation";

interface PageProps {
  params: { postId: string };
}

export default function Page({ params: { postId } }: PageProps) {
  redirect(`/posts/${postId}`);
}
