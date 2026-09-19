"use client";

import {
  getActingIdentityState,
  setActingIdentity,
  type ActingIdentityState,
} from "@/app/(main)/pages/actions";
import UserAvatar from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { getInitials } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { PageType } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";

export const ACTING_IDENTITY_QUERY_KEY = ["acting-identity"] as const;

export function useActingIdentityState() {
  return useQuery({
    queryKey: ACTING_IDENTITY_QUERY_KEY,
    queryFn: () => getActingIdentityState(),
    staleTime: 30_000,
  });
}

interface IdentitySwitcherProps {
  /** Compact trigger for the mobile header */
  compact?: boolean;
  className?: string;
}

export function IdentitySwitcher({
  compact = false,
  className,
}: IdentitySwitcherProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isPending } = useActingIdentityState();

  const { mutate, isPending: isSwitching } = useMutation({
    mutationFn: setActingIdentity,
    onSuccess: (identity) => {
      queryClient.setQueryData<ActingIdentityState>(
        ACTING_IDENTITY_QUERY_KEY,
        (prev) => (prev ? { ...prev, identity } : prev),
      );
      void queryClient.invalidateQueries({ queryKey: ACTING_IDENTITY_QUERY_KEY });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Could not switch identity",
      });
    },
  });

  if (isPending || !data) {
    return (
      <div
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-[#131614]",
          compact ? "h-10 w-10" : "h-9 w-9",
          className,
        )}
        aria-hidden
      />
    );
  }

  const actingPage =
    data.identity.kind === "page"
      ? data.pages.find((p) => p.id === data.identity.id)
      : null;
  const isPage = Boolean(actingPage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isSwitching}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl text-[#b4bcaf] transition-colors active:bg-[#131614] disabled:opacity-70",
            compact
              ? "h-10 w-10 justify-center"
              : "min-h-9 px-1.5 py-1 hover:bg-[#131614]",
            className,
          )}
          aria-label={
            isPage
              ? `Acting as ${actingPage?.name ?? "page"}`
              : "Acting as yourself"
          }
        >
          {isPage && actingPage ? (
            actingPage.avatarUrl ? (
              <UserAvatar
                avatarUrl={actingPage.avatarUrl}
                size={compact ? 36 : 32}
                className={cn(
                  "border-0 object-cover",
                  compact ? "h-9 w-9 rounded-[10px]" : "h-8 w-8 rounded-lg",
                )}
              />
            ) : (
              <div
                className={cn(
                  "grid place-items-center bg-[#232824] text-[11px] font-bold text-[#a1c217]",
                  compact ? "h-9 w-9 rounded-[10px]" : "h-8 w-8 rounded-lg",
                )}
              >
                {getInitials(actingPage.name)}
              </div>
            )
          ) : (
            <UserAvatar
              avatarUrl={data.user.avatarUrl}
              size={compact ? 36 : 32}
              className={cn(
                "border-0",
                compact ? "h-9 w-9" : "h-8 w-8",
              )}
            />
          )}
          {!compact && (
            <ChevronsUpDown className="h-3.5 w-3.5 text-[#5a635a]" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[120] min-w-[220px] rounded-xl border-[#2a2f2a] bg-[#131614] p-1.5 text-[#f2f5ef]"
      >
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 focus:bg-[#1a1e1b] focus:text-[#f2f5ef]"
          onSelect={() =>
            mutate({ kind: "user", id: data.user.id })
          }
        >
          <UserAvatar
            avatarUrl={data.user.avatarUrl}
            size={32}
            className="h-8 w-8 border-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">
              {data.user.displayName}
            </p>
            <p className="truncate text-[11px] text-[#7e8a7e]">You</p>
          </div>
          {data.identity.kind === "user" && (
            <Check className="h-4 w-4 shrink-0 text-[#a1c217]" />
          )}
        </DropdownMenuItem>

        {data.pages.map((page) => {
          const selected =
            data.identity.kind === "page" && data.identity.id === page.id;
          return (
            <DropdownMenuItem
              key={page.id}
              className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 focus:bg-[#1a1e1b] focus:text-[#f2f5ef]"
              onSelect={() => mutate({ kind: "page", id: page.id })}
            >
              {page.avatarUrl ? (
                <UserAvatar
                  avatarUrl={page.avatarUrl}
                  size={32}
                  className="h-8 w-8 rounded-lg border-0"
                />
              ) : (
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#232824] text-[11px] font-bold text-[#a1c217]">
                  {getInitials(page.name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{page.name}</p>
                <p className="truncate text-[11px] text-[#7e8a7e]">
                  {page.type === PageType.VENUE ? "Venue" : "Club"} · @
                  {page.handle}
                </p>
              </div>
              {selected && (
                <Check className="h-4 w-4 shrink-0 text-[#a1c217]" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
