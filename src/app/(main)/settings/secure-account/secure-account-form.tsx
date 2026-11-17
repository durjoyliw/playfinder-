"use client";

import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { secureAccountSchema, SecureAccountValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { SettingsError, SettingsLoading, useUserSettings } from "../settings-shared";
import { secureAccount } from "./actions";

export function SecureAccountForm() {
  const { data, isLoading, isError } = useUserSettings();

  if (isLoading) return <SettingsLoading />;
  if (isError || !data) return <SettingsError />;

  if (data.hasPassword || data.hasGoogle) {
    return (
      <div className="rounded-xl bg-[var(--pf-c-fill-161616)] p-5 pf-card">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--pf-volt-text)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--pf-c-ink-ffffff)]">
              Your account is secured
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.hasGoogle
                ? "You log in with Google."
                : `You can log in anywhere as @${data.username}.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <SecureAccountFields defaultUsername={data.username} />;
}

function SecureAccountFields({ defaultUsername }: { defaultUsername: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>();
  const [doneAs, setDoneAs] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SecureAccountValues>({
    resolver: zodResolver(secureAccountSchema),
    defaultValues: { username: defaultUsername, password: "", confirmPassword: "" },
  });

  function onSubmit(values: SecureAccountValues) {
    setError(undefined);
    startTransition(async () => {
      const result = await secureAccount(values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDoneAs(result.username);
      await queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      router.refresh();
    });
  }

  if (doneAs) {
    return (
      <div className="rounded-xl bg-[var(--pf-c-fill-161616)] p-5 pf-card">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--pf-volt-text)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--pf-c-ink-ffffff)]">
              All set
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Log in on any device with <strong>@{doneAs}</strong> and your new
              password.
            </p>
            <Link
              href="/settings"
              className="mt-3 inline-block text-sm font-semibold text-[var(--pf-volt-text)]"
            >
              Back to settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl bg-[var(--pf-c-fill-161616)] p-4 pf-card">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--pf-volt-text)]" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          You joined the beta with just your name, so your account only lives in
          this browser. Choose a username and password to log in on other
          devices — or get back in if you clear your cookies.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input autoComplete="username" autoCapitalize="none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton loading={isPending} type="submit" className="w-full">
            Save login details
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
}
