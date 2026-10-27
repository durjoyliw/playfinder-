"use client";

import { useChannelStateContext } from "stream-chat-react";
import { useSession } from "../SessionProvider";
import { useChatComposer } from "./chat-composer-context";
import { getChannelRequestData, getInitials, getOtherMember } from "./messages-utils";

export default function EmptyChatState() {
  const { user } = useSession();
  const { channel } = useChannelStateContext();
  const { fillInput } = useChatComposer();
  const other = getOtherMember(channel, user.id);
  const displayName = other?.name ?? "Player";
  const { isTeammate } = getChannelRequestData(channel);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[var(--pf-volt)] text-xl font-bold text-[var(--pf-on-accent)]">
        {other?.image ? (
          <img
            src={other.image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          getInitials(displayName)
        )}
      </div>
      <p className="mt-4 font-bold text-[var(--pf-c-ink-ffffff)]">{displayName}</p>
      <p
        className="mt-1 text-sm"
        style={{
          color: isTeammate ? "rgb(var(--pf-volt-rgb)/0.55)" : "var(--pf-c-ink-555555)",
        }}
      >
        {isTeammate ? "Teammates ⚡" : "Not teammates yet"}
      </p>
      <button
        type="button"
        onClick={() => fillInput("Hey! 👋")}
        className="mt-6 rounded-full bg-[var(--pf-c-fill-1f1f1f)] px-5 py-2.5 text-sm text-[var(--pf-c-ink-ffffff)] transition-colors hover:bg-[var(--pf-c-fill-2a2a2a)]"
      >
        Say hello 👋
      </button>
    </div>
  );
}
