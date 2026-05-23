import {
  IconBallBasketball,
  IconBallFootball,
  IconBallTennis,
  IconBarbell,
  IconRun,
  IconSwimming,
  IconBallVolleyball,
  IconBike,
  IconGolf,
  IconTarget,
  type Icon,
} from "@tabler/icons-react";

const DEFAULT_ICON = IconRun;

const SPORT_ICONS: Record<string, Icon> = {
  football: IconBallFootball,
  tennis: IconBallTennis,
  basketball: IconBallBasketball,
  gym: IconBarbell,
  running: IconRun,
  swimming: IconSwimming,
  rugby: IconBallFootball,
  cricket: IconTarget,
  cycling: IconBike,
  volleyball: IconBallVolleyball,
  golf: IconGolf,
  squash: IconBallTennis,
  badminton: IconBallTennis,
  hockey: IconBallFootball,
  boxing: IconTarget,
};

export function getSportIcon(sportKey: string): Icon {
  return SPORT_ICONS[sportKey.toLowerCase()] ?? DEFAULT_ICON;
}
