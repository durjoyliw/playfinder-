import {
  ACCENT_COOKIE,
  THEME_COOKIE,
  parseAccent,
  parseTheme,
} from "@/lib/appearance";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { SettingsSubpageLayout } from "../settings-shared";
import { AppearanceForm } from "./appearance-form";

export const metadata: Metadata = {
  title: "Appearance",
};

export default function Page() {
  const cookieStore = cookies();
  return (
    <SettingsSubpageLayout title="Appearance">
      <AppearanceForm
        initialTheme={parseTheme(cookieStore.get(THEME_COOKIE)?.value)}
        initialAccent={parseAccent(cookieStore.get(ACCENT_COOKIE)?.value)}
      />
    </SettingsSubpageLayout>
  );
}
