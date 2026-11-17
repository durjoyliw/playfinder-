import { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSubpageLayout } from "../settings-shared";
import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = {
  title: "Send feedback",
};

export default function Page() {
  return (
    <SettingsSubpageLayout title="Send feedback">
      <Suspense>
        <FeedbackForm />
      </Suspense>
    </SettingsSubpageLayout>
  );
}
