/**
 * "Fill a game" notifications.
 *
 * They all use the GAME_INTEREST type; `Notification.body` carries which
 * event it was, so no database enum change is needed. One function builds
 * the wording for both the in-app list and device pushes, so the two can't
 * drift apart (the accept push used to say "is interested in your game").
 */

export const GAME_EVENT = {
  /** To the player: the host accepted their request. */
  ACCEPTED: "game:accepted",
  /** To the player: the host said no. */
  DECLINED: "game:declined",
  /** To the player: the host removed them after accepting. */
  REMOVED: "game:removed",
  /** To the host: an accepted player dropped out. */
  LEFT: "game:left",
} as const;

export type GameEventBody = (typeof GAME_EVENT)[keyof typeof GAME_EVENT];

/** Statuses a PostInterest row can have (stored as a plain string). */
export const INTEREST_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  /** Declined by the host (historic name, kept for existing rows). */
  DECLINED: "IGNORED",
  REMOVED: "REMOVED",
  LEFT: "LEFT",
} as const;

export function getGameNotificationMessage({
  recipientIsHost,
  body,
  issuerName,
}: {
  recipientIsHost: boolean;
  body: string | null | undefined;
  issuerName: string;
}): string {
  if (recipientIsHost) {
    if (body === GAME_EVENT.LEFT) return `${issuerName} dropped out of your game`;
    return `${issuerName} wants to join your game`;
  }
  switch (body) {
    case GAME_EVENT.DECLINED:
      return `${issuerName} couldn't fit you in this time`;
    case GAME_EVENT.REMOVED:
      return `${issuerName} removed you from the game`;
    case GAME_EVENT.ACCEPTED:
    default:
      // Older rows have no body; for a player that always meant "accepted".
      return `${issuerName} accepted you for the game`;
  }
}
