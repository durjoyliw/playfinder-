"use client";

import { logout } from "@/app/(auth)/actions";
import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import {
  getInitials,
  getProfileIntentLabel,
} from "@/lib/settings";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Ban,
  FileText,
  MessageCircle,
  Info,
  MapPin,
  Power,
  Shield,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { PageBackHeader } from "@/components/playfinder/page-back-header";
import {
  SettingsError,
  SettingsLoading,
  SettingsRow,
  SettingsSection,
  useUserSettings,
} from "./settings-shared";

export function SettingsHub() {
  const { user } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, status } = useUserSettings();

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/users/${user.username}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ description: "Profile link copied to clipboard" });
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to copy link",
      });
    }
  };

  const handleSignOut = () => {
    queryClient.clear();
    logout();
  };

  if (status === "pending") {
    return (
      <div className="min-h-full bg-[#0d0d0d]">
        <PageBackHeader title="Settings" />
        <SettingsLoading />
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="min-h-full bg-[#0d0d0d]">
        <PageBackHeader title="Settings" />
        <SettingsError />
      </div>
    );
  }

  const locationLabel = data.location?.trim() || "Not set";
  const intentLabel = getProfileIntentLabel(data.profileIntent);

  return (
    <div className="min-h-full bg-[#0d0d0d] pb-8">
      <PageBackHeader title="Settings" />
      <div className="px-4 pb-2 pt-6 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#C9F31D] text-2xl font-bold text-black">
          {getInitials(data.displayName)}
        </div>
        <h1 className="text-2xl font-bold text-white">{data.displayName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">@{data.username}</p>
        <button
          type="button"
          onClick={handleShareProfile}
          className="mt-4 rounded-full border border-[#C9F31D] px-6 py-2 text-sm font-medium text-[#C9F31D] transition-colors hover:bg-[#C9F31D]/10"
        >
          Share profile
        </button>
      </div>

      <div className="px-4 pt-4">
        <SettingsSection title="Your Account">
          <SettingsRow
            href="/settings/edit-profile"
            icon={<User className="h-5 w-5" />}
            label="Edit Profile"
          />
          <SettingsRow
            href="/settings/sports"
            icon={<Trophy className="h-5 w-5" />}
            label="My Sports"
          />
          <SettingsRow
            href="/settings/activity"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Your Activity"
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsRow
            href="/settings/location"
            icon={<MapPin className="h-5 w-5" />}
            label="Location"
            value={locationLabel}
          />
          <SettingsRow
            href="/settings/intent"
            icon={<Zap className="h-5 w-5" />}
            label="Intent Status"
            value={intentLabel}
          />
        </SettingsSection>

        <SettingsSection title="Privacy">
          <SettingsRow
            href="/settings/blocked"
            icon={<Ban className="h-5 w-5" />}
            label="Blocked Accounts"
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsRow
            href="/settings/help"
            icon={<MessageCircle className="h-5 w-5" />}
            label="Help"
          />
          <SettingsRow
            href="/settings/about"
            icon={<Info className="h-5 w-5" />}
            label="About PlayFinder"
          />
        </SettingsSection>

        <SettingsSection title="Legal">
          <SettingsRow
            href="/settings/terms"
            icon={<FileText className="h-5 w-5" />}
            label="Terms of Use"
          />
          <SettingsRow
            href="/settings/privacy"
            icon={<Shield className="h-5 w-5" />}
            label="Privacy Policy"
          />
        </SettingsSection>
      </div>

      <div className="px-4 pt-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500"
        >
          <Power className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
