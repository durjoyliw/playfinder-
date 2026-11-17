"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { NotificationsPage } from "@/lib/types";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import Notification from "./Notification";

// The Mentions tab is hidden until @-mentions exist (it was an empty stub).

export default function Notifications() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/notifications",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<NotificationsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: () => kyInstance.patch("/api/notifications/mark-as-read"),
    onSuccess: () => {
      queryClient.setQueryData(["unread-notification-count"], {
        unreadCount: 0,
      });
    },
    onError(error) {
      console.error("Failed to mark notifications as read", error);
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  return (
    <div className="font-grotesk">
      <div className="pt-2">
        <AllNotificationsList
          notifications={notifications}
          status={status}
          hasNextPage={hasNextPage}
          isFetching={isFetching}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>
    </div>
  );
}

function AllNotificationsList({
  notifications,
  status,
  hasNextPage,
  isFetching,
  isFetchingNextPage,
  fetchNextPage,
}: {
  notifications: NotificationsPage["notifications"];
  status: "pending" | "error" | "success";
  hasNextPage: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) {
  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !notifications.length && !hasNextPage) {
    return (
      <p className="py-8 text-center text-[var(--pf-c-ink-7e8a7e)]">
        You don&apos;t have any notifications yet.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="py-8 text-center text-destructive">
        An error occurred while loading notifications.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5 pt-2"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
