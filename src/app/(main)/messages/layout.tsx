import MessagesLayoutShell from "./messages-layout-shell";
import "stream-chat-react/dist/css/v2/index.css";
import "./playfinder-messages.css";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MessagesLayoutShell>{children}</MessagesLayoutShell>;
}
