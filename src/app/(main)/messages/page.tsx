import { Metadata } from "next";
import { NoActiveChatState } from "./NoActiveChatState";

export const metadata: Metadata = {
  title: "Messages",
};

// The conversation list itself is rendered once, by the messages layout.
// This page only fills the desktop thread pane when no chat is open.
export default function MessagesPage() {
  return (
    <div className="flex h-full min-h-0 flex-1">
      <NoActiveChatState />
    </div>
  );
}
