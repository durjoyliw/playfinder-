"use client";

import { DateOfBirthInput } from "@/components/date-of-birth-input";
import LoadingButton from "@/components/LoadingButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { joinBetaSchema, JoinBetaValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { joinBeta } from "./actions";

export default function JoinForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<JoinBetaValues>({
    resolver: zodResolver(joinBetaSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      // react-hook-form needs a boolean here; the schema insists on `true`.
      acceptTerms: false as unknown as true,
    },
  });

  function onSubmit(values: JoinBetaValues) {
    setError(undefined);
    startTransition(async () => {
      const result = await joinBeta(values);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <p role="alert" className="text-center text-sm text-destructive">
            {error}
          </p>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Jordan"
                  autoComplete="given-name"
                  autoFocus
                  maxLength={40}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                This is what other players see. You can change it later.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="birthDate"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <DateOfBirthInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={!!fieldState.error}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                PlayFinder is 18+. Your birthday is never shown on your profile.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem>
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[var(--pf-volt)]"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-foreground underline underline-offset-2"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-foreground underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                  , and to the use of cookies described in the{" "}
                  <Link
                    href="/cookies"
                    target="_blank"
                    className="text-foreground underline underline-offset-2"
                  >
                    Cookie Policy
                  </Link>
                  .
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={isPending} type="submit" className="w-full">
          Join the beta
        </LoadingButton>
      </form>
    </Form>
  );
}
