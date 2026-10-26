import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function Page() {
  return (
    <LegalPage title="Contact" eyebrow="Support">
      <LegalSection title="Get in touch">
        <p>
          Questions, feedback, a problem with your account, or something you
          want to report? Email us at [CONTACT EMAIL] and we’ll get back to you
          as soon as we can.
        </p>
        <p>
          To report a user or content that makes you feel unsafe, include as
          much detail as you can — a username, a link, or a screenshot helps
          us act faster.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
