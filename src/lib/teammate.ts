import { getSportDisplay } from "@/lib/onboarding-sports";

export type TeammateUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  sports: { sport: string }[];
};

export function formatTeammateSportLabels(sports: { sport: string }[]): string {
  return sports.map((s) => getSportDisplay(s.sport).name).join(" · ");
}
