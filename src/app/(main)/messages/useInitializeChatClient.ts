import { useSession } from "@/app/(main)/SessionProvider";
import kyInstance from "@/lib/ky";
import { getStreamBrowserClient } from "@/lib/stream-browser-client";
import { useEffect, useState } from "react";
import type { StreamChat } from "stream-chat";

type InitState =
  | { status: "loading" }
  | { status: "ready"; client: StreamChat }
  | { status: "error"; message: string };

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [state, setState] = useState<InitState>({ status: "loading" });

  useEffect(() => {
    const client = getStreamBrowserClient();
    if (!client) {
      setState({
        status: "error",
        message:
          "Stream Chat is not configured. Set NEXT_PUBLIC_STREAM_KEY in your environment.",
      });
      return;
    }

    let cancelled = false;

    async function connect() {
      try {
        const { token } = await kyInstance
          .get("/api/get-token")
          .json<{ token: string }>();

        if (!token) {
          throw new Error("No token returned from /api/get-token");
        }

        await client.connectUser(
          {
            id: user.id,
            name: user.displayName,
            username: user.username,
            image: user.avatarUrl ?? undefined,
          },
          token,
        );

        if (!cancelled) {
          setState({ status: "ready", client });
        }
      } catch (error) {
        console.error("Failed to initialize Stream Chat", error);
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Failed to connect to Stream Chat",
          });
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (client.userID) {
        client.disconnectUser().catch((error) => {
          console.error("Failed to disconnect Stream Chat user", error);
        });
      }
    };
  }, [user.id, user.username, user.displayName, user.avatarUrl]);

  return state;
}
