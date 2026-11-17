import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function Page() {
  return (
    <LegalPage title="Terms of Service" updated="[DATE]" current="/terms">
      <LegalSection title="1. About these terms">
        <p>
          These terms are a contract between you and [CONTROLLER]
          (“PlayFinder”, “we”, “us”) for your use of the PlayFinder app and
          website (the “Service”). By creating an account or using the Service,
          you accept these terms. If you don’t agree, don’t use the Service.
        </p>
      </LegalSection>

      <LegalSection title="2. Who can use PlayFinder">
        <p>
          You must be 18 or over. By using it, you confirm you are. You’re
          responsible for keeping your login secure and for everything that
          happens under your account.
        </p>
      </LegalSection>

      <LegalSection title="3. What PlayFinder is (and isn’t)">
        <p>
          PlayFinder helps people find and organise local sport. We are a
          platform, not an organiser. We don’t run the games, vet the people,
          own the venues, or supervise what happens when you meet up. Arranging
          and attending games is at your own risk, and you’re responsible for
          your own safety and conduct.
        </p>
      </LegalSection>

      <LegalSection title="4. Your account and content">
        <p>
          You own the content you post. By posting, you give us a licence to
          host, display and distribute it within the Service so it works as
          intended. You’re responsible for what you post and confirm you have
          the right to post it. Keep your profile information accurate.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>
          You must not: harass, bully, threaten or abuse others; post illegal,
          hateful, violent, sexual or otherwise harmful content; impersonate
          anyone or create a Page for an organisation you’re not authorised to
          represent; spam, scrape or use bots; try to break, overload or gain
          unauthorised access to the Service; or use PlayFinder for anything
          unlawful. We can remove content and suspend or delete accounts that
          break these rules.
        </p>
      </LegalSection>

      <LegalSection title="6. Pages">
        <p>
          Pages represent venues, clubs, leagues and similar. If you create or
          manage a Page, you confirm you’re authorised to represent that
          organisation. We may reclaim, reassign or verify Pages, and remove
          ones that are misused or impersonate others.
        </p>
      </LegalSection>

      <LegalSection title="7. Safety and meeting people">
        <p>
          PlayFinder connects you with other people and real-world activities.
          Use normal caution: meet in public where you can, tell someone where
          you’re going, and don’t share sensitive personal details. We don’t
          carry out background checks on users. If someone makes you feel
          unsafe, stop and report them to [CONTACT EMAIL].
        </p>
      </LegalSection>

      <LegalSection title="8. Reporting and moderation">
        <p>
          You can report content or users to [CONTACT EMAIL]. We review reports
          and act at our discretion, which may include removing content,
          warning, suspending or banning. We aim to be fair but don’t guarantee
          a particular outcome or timescale.
        </p>
      </LegalSection>

      <LegalSection title="9. Our content and brand">
        <p>
          The Service, its design, and the PlayFinder name and branding are ours
          (or our licensors’). You don’t get any rights to them beyond using the
          Service as intended.
        </p>
      </LegalSection>

      <LegalSection title="10. Third-party services">
        <p>
          PlayFinder relies on third parties (maps, chat, sign-in, hosting).
          Their availability isn’t guaranteed, and features depending on them
          may be subject to their terms.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes and availability">
        <p>
          We’re in beta. Features may change, break or disappear, and the
          Service may be unavailable at times. We may update these terms; if we
          do, we’ll post the new version and update the date. Continuing to use
          the Service means you accept the changes.
        </p>
      </LegalSection>

      <LegalSection title="12. Ending your use">
        <p>
          You can stop using PlayFinder and delete your account at any time. We
          can suspend or end your access if you break these terms or if we stop
          offering the Service.
        </p>
      </LegalSection>

      <LegalSection title="13. Liability">
        <p>
          To the extent the law allows, the Service is provided “as is”, and
          we’re not liable for loss or harm arising from your use of it, from
          games or meetings you arrange through it, or from the conduct of other
          users. Nothing in these terms limits liability that can’t legally be
          limited (such as for death or personal injury caused by our
          negligence).
        </p>
      </LegalSection>

      <LegalSection title="14. Governing law">
        <p>
          These terms are governed by the law of Scotland, and disputes are
          subject to its courts.
        </p>
      </LegalSection>

      <LegalSection title="15. Contact">
        <p>Questions about these terms: [CONTACT EMAIL].</p>
      </LegalSection>
    </LegalPage>
  );
}
