import {
  LegalLink,
  LegalList,
  LegalPage,
  LegalSection,
  LegalTerm,
} from "@/components/legal/legal-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function Page() {
  return (
    <LegalPage title="Privacy Policy" updated="[DATE]" current="/privacy">
      <LegalSection title="Who we are">
        <p>
          PlayFinder (“we”, “us”) is a hyper-local sports social network
          operated by [CONTROLLER], based in [ADDRESS], United Kingdom. We are
          the data controller for the personal data described here. Contact us
          at [CONTACT EMAIL].
        </p>
      </LegalSection>

      <LegalSection title="What data we collect">
        <LegalList>
          <li>
            <LegalTerm>Account data:</LegalTerm> email and password (stored
            hashed). If you sign up with Google, we receive your name, email
            and profile picture from Google.
          </li>
          <li>
            <LegalTerm>Profile data:</LegalTerm> username, display name, bio,
            profile and banner images, the sports you play and skill levels,
            and your status.
          </li>
          <li>
            <LegalTerm>Location data:</LegalTerm> your city and an approximate
            location you provide, used to show nearby games, players and
            venues. We don’t continuously track your device location.
          </li>
          <li>
            <LegalTerm>Content you create:</LegalTerm> posts, broadcasts,
            comments, likes, bookmarks, and any Pages you create or administer.
          </li>
          <li>
            <LegalTerm>Messages:</LegalTerm> direct and group messages you send
            through the app.
          </li>
          <li>
            <LegalTerm>Usage &amp; device data:</LegalTerm> how you use the app,
            device/browser type, and IP address, via cookies and similar
            technologies.
          </li>
          <li>
            <LegalTerm>Push notifications:</LegalTerm> if enabled, a push
            subscription token.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="How we use it, and our legal basis">
        <LegalList>
          <li>To provide the service (performance of a contract).</li>
          <li>
            To keep it safe — moderation, preventing abuse (legitimate
            interests).
          </li>
          <li>
            To improve it — analytics (consent, or legitimate interests where
            lawful).
          </li>
          <li>To send notifications you opt into (consent).</li>
          <li>To meet legal obligations (legal obligation).</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Who we share it with">
        <p>
          We don’t sell your data. We share it with providers who help run
          PlayFinder, under contract and only as needed: Vercel (hosting), Neon
          (database), Stream (chat), UploadThing (image storage), Mapbox
          (maps), Google (sign-in), plus error-monitoring and analytics
          providers. Other users see what you choose to make public.
        </p>
      </LegalSection>

      <LegalSection title="International transfers">
        <p>
          Some providers are outside the UK (e.g. the US). We rely on
          appropriate safeguards (UK adequacy decisions or the UK International
          Data Transfer Agreement / Standard Contractual Clauses).
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          As long as your account is active. If you delete your account, we
          delete or anonymise your personal data within a reasonable period,
          except where the law requires us to keep records.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          You can access, correct, delete, restrict or object to, and port your
          data, and withdraw consent at any time. Email [CONTACT EMAIL] or use
          the in-app controls. You can also complain to the UK regulator, the
          Information Commissioner’s Office (ICO), at{" "}
          <LegalLink href="https://ico.org.uk">ico.org.uk</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          PlayFinder is for people aged 18 and over. We don’t knowingly collect
          data from under-18s. Contact [CONTACT EMAIL] to report an under-18
          account.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update this policy; we’ll post the new version and update the
          date. Contact: [CONTACT EMAIL].
        </p>
      </LegalSection>
    </LegalPage>
  );
}
