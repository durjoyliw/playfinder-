"use client";

import { PageBackHeader } from "@/components/playfinder/page-back-header";
import { useUserSettings } from "@/hooks/use-user-settings";
import { ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

export { useUserSettings };

interface SettingsSubpageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSubpageLayout({
  title,
  children,
}: SettingsSubpageLayoutProps) {
  return (
    <div className="min-h-full bg-[#0d0d0d] pb-8">
      <PageBackHeader title={title} />
      <div className="px-4 py-6">{children}</div>
    </div>
  );
}

export function SettingsLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#C9F31D]" />
    </div>
  );
}

export function SettingsError() {
  return (
    <p className="py-12 text-center text-sm text-red-400">
      Failed to load settings. Please try again.
    </p>
  );
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="overflow-hidden rounded-xl bg-[#161616]">{children}</div>
    </div>
  );
}

interface SettingsRowProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  value?: string;
}

export function SettingsRow({ href, icon, label, value }: SettingsRowProps) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-3 border-b border-[#2a2a2a] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-[#1f1f1f]"
    >
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[#C9F31D]">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-white">{label}</span>
      {value && (
        <span className="max-w-[40%] truncate text-xs text-muted-foreground">
          {value}
        </span>
      )}
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </Link>
  );
}

interface SettingsPlaceholderProps {
  title: string;
  description: string;
}

export function SettingsPlaceholder({
  title,
  description,
}: SettingsPlaceholderProps) {
  return (
    <SettingsSubpageLayout title={title}>
      <div className="rounded-xl bg-[#161616] p-6 text-center">
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </SettingsSubpageLayout>
  );
}

export const settingsInputClassName =
  "w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white focus:border-[#C9F31D] focus:outline-none";

export const settingsSaveButtonClassName =
  "w-full rounded-lg bg-[#C9F31D] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#d4f73a] disabled:opacity-60";
