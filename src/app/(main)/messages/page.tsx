import { Metadata } from "next";
import Chat from "./Chat";
import StreamChatProvider from "./StreamChatProvider";

export const metadata: Metadata = {
  title: "Messages",
};

export default function Page() {
  return (
    <div className="flex h-[calc(100dvh-8.5rem)] min-h-[320px] w-full flex-col px-2 py-2">
      <StreamChatProvider>
        <Chat />
      </StreamChatProvider>
    </div>
  );
}
