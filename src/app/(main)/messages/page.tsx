import { Metadata } from "next";
import ConversationsList from "./ChatSidebar";
import { NoActiveChatState } from "./NoActiveChatState";

export const metadata: Metadata = {
  title: "Messages",
};

export default function MessagesPage() {
  return (
    <>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
        <ConversationsList />
      </div>
      <div className="hidden h-full min-h-0 flex-1 lg:flex">
        <NoActiveChatState />
      </div>
    </>
  );
}
