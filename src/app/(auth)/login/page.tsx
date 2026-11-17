import { SignupAnimationPanel } from "@/components/auth/signup-animation-panel";
import { BETA_OPEN_JOIN, JOIN_HREF } from "@/lib/beta";
import { Metadata } from "next";
import Link from "next/link";
import GoogleSignInButton from "./google/GoogleSignInButton";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl pf-card">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <h1 className="text-center text-3xl font-bold">Login to PlayFinder</h1>
          <div className="space-y-5">
            <GoogleSignInButton />
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted" />
              <span>OR</span>
              <div className="h-px flex-1 bg-muted" />
            </div>
            <LoginForm />
            <Link href={JOIN_HREF} className="block text-center hover:underline">
              {BETA_OPEN_JOIN
                ? "New here? Join the beta"
                : "Don\u2019t have an account? Sign up"}
            </Link>
          </div>
        </div>
        <SignupAnimationPanel />
      </div>
    </main>
  );
}
