import SessionProvider from "@/app/(main)/SessionProvider";
import { PlayFinderHome } from "@/components/playfinder/playfinder-home";
import { PlayFinderShell } from "@/components/playfinder/playfinder-shell";
import type { FeedSportTab } from "@/lib/feed-sport-tabs";
import type { Session, User } from "lucia";

interface PlayFinderAuthenticatedHomeProps {
  session: { user: User; session: Session };
  initialUnreadNotificationCount: number;
  feedSportTabs: FeedSportTab[];
}

export function PlayFinderAuthenticatedHome({
  session,
  initialUnreadNotificationCount,
  feedSportTabs,
}: PlayFinderAuthenticatedHomeProps) {
  return (
    <SessionProvider value={session}>
      <PlayFinderShell
        initialUnreadNotificationCount={initialUnreadNotificationCount}
      >
        <PlayFinderHome feedSportTabs={feedSportTabs} />
      </PlayFinderShell>
    </SessionProvider>
  );
}
