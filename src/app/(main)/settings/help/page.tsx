import Link from "next/link";
import { SettingsSubpageLayout } from "../settings-shared";

const FAQS: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "How do I find a game?",
    a: (
      <>
        Open the <strong>Arena</strong> tab on Home or the <strong>Discover</strong>{" "}
        map, filter by sport, and tap <strong>I&apos;m in</strong> on a game.
        The host gets your request and can accept you.
      </>
    ),
  },
  {
    q: "How do I fill my own game?",
    a: (
      <>
        Tap the <strong>+</strong> button, choose <em>Looking to play</em>, set
        the kick-off time and how many players you need. Open your post to
        accept or decline requests. If you fill a spot outside the app, tap{" "}
        <em>Filled a spot elsewhere</em>.
      </>
    ),
  },
  {
    q: "I joined with just my name. How do I log in on another phone?",
    a: (
      <>
        Go to{" "}
        <Link href="/settings/secure-account" className="underline">
          Settings → Secure your account
        </Link>{" "}
        and pick a username and password. Until you do, your account only
        lives in this browser.
      </>
    ),
  },
  {
    q: "Someone is being abusive. What do I do?",
    a: (
      <>
        Use the <strong>⋯</strong> menu on their post or profile to report or
        block them. Reports go to a moderator. If you feel unsafe, leave and
        contact the police.
      </>
    ),
  },
  {
    q: "How do I delete my account?",
    a: (
      <>
        <Link href="/settings/delete-account" className="underline">
          Settings → Delete account
        </Link>
        . It removes your profile, posts and messages permanently.
      </>
    ),
  },
];

export default function Page() {
  return (
    <SettingsSubpageLayout title="Help">
      <div className="space-y-3">
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-xl bg-[var(--pf-c-fill-161616)] px-4 py-3.5 pf-card"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--pf-c-ink-ffffff)] marker:hidden">
              {q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {a}
            </p>
          </details>
        ))}
        <Link
          href="/settings/feedback?from=%2Fsettings%2Fhelp"
          className="mt-2 block rounded-xl border border-[rgb(var(--pf-volt-rgb)/0.35)] bg-[rgb(var(--pf-volt-rgb)/0.08)] px-4 py-3.5 text-sm font-semibold text-[var(--pf-c-ink-ffffff)]"
        >
          Still stuck? Send us feedback →
        </Link>
      </div>
    </SettingsSubpageLayout>
  );
}
