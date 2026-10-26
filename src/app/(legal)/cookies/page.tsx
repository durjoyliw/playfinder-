import {
  LegalLink,
  LegalList,
  LegalPage,
  LegalSection,
  LegalTerm,
} from "@/components/legal/legal-page";
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function Page() {
  return (
    <LegalPage title="Cookie Policy" updated="[DATE]" current="/cookies">
      <LegalSection title="How we use cookies">
        <p>
          PlayFinder uses cookies. Some are essential — they keep you logged in
          and the app secure, and are always on. We’d also like to use analytics
          cookies to understand how PlayFinder is used so we can improve it;
          these only run if you accept. You can change your choice at any time.
          See our <LegalLink href="/privacy">Privacy Policy</LegalLink> for
          detail.
        </p>
      </LegalSection>

      <LegalSection title="The cookies we use">
        <LegalList>
          <li>
            <LegalTerm>Essential cookies (always on):</LegalTerm> login/session,
            security, and the cookie that remembers your cookie choice.
          </li>
          <li>
            <LegalTerm>Analytics cookies (only with your consent):</LegalTerm>{" "}
            usage measurement.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Your choice">
        <p>
          Under UK law (PECR and UK GDPR), we set essential cookies without
          asking, but ask your consent before setting analytics or other
          non-essential cookies. You can accept or reject, and change your mind
          later.
        </p>
        <CookieSettingsButton />
      </LegalSection>
    </LegalPage>
  );
}
