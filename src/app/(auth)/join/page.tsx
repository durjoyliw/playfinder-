import { SignupAnimationPanel } from "@/components/auth/signup-animation-panel";
import { BETA_OPEN_JOIN } from "@/lib/beta";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import JoinForm from "./JoinForm";

export const metadata: Metadata = {
  title: "Join the beta",
};

export default function Page() {
  if (!BETA_OPEN_JOIN) redirect("/signup");

  return (
    <main className="flex min-h-[100dvh] items-center justify-center p-5 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
      <div className="pf-card flex w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl md:h-[40rem]">
        <div className="w-full space-y-8 overflow-y-auto p-7 sm:p-10 md:w-1/2">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold leading-tight">
              What should we call you?
            </h1>
            <p className="text-sm text-muted-foreground">
              PlayFinder is in beta in Glasgow. Pick a name and you&apos;re in.
              No email or password needed.
            </p>
          </div>
          <JoinForm />
          <Link
            href="/login"
            className="block text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Already have an account? Log in
          </Link>
        </div>
        <SignupAnimationPanel />
      </div>
    </main>
  );
}
