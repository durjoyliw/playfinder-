import { StreamChat } from "stream-chat";

let browserClient: StreamChat | null = null;

/** Browser Stream Chat client — created once per app lifetime via getInstance. */
export function getStreamBrowserClient(): StreamChat | null {
  const streamKey = process.env.NEXT_PUBLIC_STREAM_KEY;
  if (!streamKey) return null;
  if (!browserClient) {
    browserClient = StreamChat.getInstance(streamKey);
  }
  return browserClient;
}
