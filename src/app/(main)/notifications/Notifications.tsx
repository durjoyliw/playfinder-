"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { SlidingPillTabs } from "@/components/playfinder/sliding-pill-tabs";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { NotificationsPage } from "@/lib/types";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Notification from "./Notification";

type NotificationsFilterTab = "all" | "mentions";

const FILTER_TABS = [
  { id: "all" as const, label: "All" },
  { id: "mentions" as const, label: "Mentions" },
];

export default function Notifications() {
  const [filterTab, setFilterTab] = useState<NotificationsFilterTab>("all");

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
      <div className="-mx-4">
        <SlidingPillTabs
          tabs={FILTER_TABS}
          activeId={filterTab}
          onTabChange={setFilterTab}
          ariaLabel="Notification filter"
        />
      </div>

      {filterTab === "mentions" ? (
        <MentionsEmptyStub />
      ) : (
        <AllNotificationsList
          notifications={notifications}
          status={status}
          hasNextPage={hasNextPage}
          isFetching={isFetching}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}
    </div>
  );
}

/**
 * Mentions is NOT wired to real data — NotificationType has no MENTION
 * (or tag) value. Empty stub only until a mention type ships.
 */
function MentionsEmptyStub() {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#f2f5ef]">
        No mentions yet
      </p>
      <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-[#7e8a7e]">
        When someone mentions you, it will show up here.
      </p>
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
      <p className="py-8 text-center text-[#7e8a7e]">
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
