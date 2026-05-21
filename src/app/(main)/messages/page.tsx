import { PageBackHeader } from "@/components/playfinder/page-back-header";
import { Metadata } from "next";
import Chat from "./Chat";
import StreamChatProvider from "./StreamChatProvider";

export const metadata: Metadata = {
  title: "Messages",
};

export default function Page() {
  return (
    <div className="flex min-h-[320px] w-full flex-col">
      <PageBackHeader title="Messages" />
      <div className="flex min-h-0 flex-1 flex-col px-2 py-2">
        <StreamChatProvider>
          <Chat />
        </StreamChatProvider>
      </div>
    </div>
  );
}
