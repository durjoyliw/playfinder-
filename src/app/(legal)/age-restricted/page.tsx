import { LegalLink, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { UNDER_AGE_MESSAGE } from "@/lib/age";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Age requirement",
};

/** Where an under-18 sign-up lands after the account has been removed. */
export default function Page() {
  return (
    <LegalPage title="Sorry, you can’t join yet" eyebrow="Age requirement">
      <LegalSection title={UNDER_AGE_MESSAGE}>
        <p>
          PlayFinder connects people to meet up and play sport, so it’s only
          open to adults. We haven’t kept your account or your date of birth.
        </p>
        <p>
          See our <LegalLink href="/terms">Terms of Service</LegalLink> and{" "}
          <LegalLink href="/privacy">Privacy Policy</LegalLink>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
