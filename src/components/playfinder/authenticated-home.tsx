import SessionProvider from "@/app/(main)/SessionProvider";
import { PlayFinderHome } from "@/components/playfinder/playfinder-home";
import { PlayFinderShell } from "@/components/playfinder/playfinder-shell";
import type { Session, User } from "lucia";

interface PlayFinderAuthenticatedHomeProps {
  session: { user: User; session: Session };
  initialUnreadNotificationCount: number;
}

export function PlayFinderAuthenticatedHome({
  session,
  initialUnreadNotificationCount,
}: PlayFinderAuthenticatedHomeProps) {
  return (
    <SessionProvider value={session}>
      <PlayFinderShell
        initialUnreadNotificationCount={initialUnreadNotificationCount}
      >
        <PlayFinderHome />
      </PlayFinderShell>
    </SessionProvider>
  );
}
