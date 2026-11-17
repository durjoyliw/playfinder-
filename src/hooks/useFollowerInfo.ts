import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo,
) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  // The same cache key is also used by the post menu, which registers it
  // without data until the menu is opened. initialData doesn't apply to an
  // entry that already exists, so fall back here instead of handing callers
  // undefined (search crashed when a person appeared as both a profile result
  // and a post author).
  return { ...query, data: query.data ?? initialState };
}
