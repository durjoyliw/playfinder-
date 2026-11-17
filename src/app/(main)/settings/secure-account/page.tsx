import { Metadata } from "next";
import { SettingsSubpageLayout } from "../settings-shared";
import { SecureAccountForm } from "./secure-account-form";

export const metadata: Metadata = {
  title: "Secure your account",
};

export default function Page() {
  return (
    <SettingsSubpageLayout title="Secure your account">
      <SecureAccountForm />
    </SettingsSubpageLayout>
  );
}
