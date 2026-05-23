import { Metadata } from "next";
import ConversationsList from "./ChatSidebar";

export const metadata: Metadata = {
  title: "Messages",
};

export default function MessagesPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ConversationsList />
    </div>
  );
}
