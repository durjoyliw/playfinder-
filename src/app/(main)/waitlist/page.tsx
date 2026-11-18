import { validateRequest } from "@/auth";
import { PageBackHeader } from "@/components/playfinder/page-back-header";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { WaitlistPoints } from "@/components/waitlist/waitlist-points";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Join the waitlist" };

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) redirect("/");

  const entry = await prisma.waitlistEntry.findUnique({
    where: { userId: user.id },
    select: { email: true },
  });

  return (
    <div className="min-h-full bg-[var(--pf-bg)] pb-10">
      <PageBackHeader title="Waitlist" backHref="/home" />
      <div className="space-y-8 px-4 py-6">
        <section>
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-[var(--pf-c-ink-ffffff)]">
            You&apos;re early.
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--pf-c-ink-a3a3a3)]">
            PlayFinder is in beta, and you&apos;re one of the first people
            using it. Leave your email and we&apos;ll tell you first when the
            full version launches.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[15px] font-semibold text-[var(--pf-c-ink-ffffff)]">
            What&apos;s coming
          </h2>
          <WaitlistPoints />
        </section>

        <section>
          <h2 className="mb-3 text-[15px] font-semibold text-[var(--pf-c-ink-ffffff)]">
            Get the launch email
          </h2>
          <WaitlistForm initialEmail={entry?.email ?? null} source="page" />
          <p className="mt-3 text-xs leading-relaxed text-[var(--pf-c-ink-a3a3a3)]">
            We only use your email for PlayFinder news, never share it, and
            delete it if you leave the list or delete your account.
          </p>
        </section>
      </div>
    </div>
  );
}
