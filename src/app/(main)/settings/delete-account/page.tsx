import { Metadata } from "next";
import { SettingsSubpageLayout } from "../settings-shared";
import { DeleteAccountForm } from "./delete-account-form";

export const metadata: Metadata = {
  title: "Delete account",
};

export default function Page() {
  return (
    <SettingsSubpageLayout title="Delete account">
      <DeleteAccountForm />
    </SettingsSubpageLayout>
  );
}
