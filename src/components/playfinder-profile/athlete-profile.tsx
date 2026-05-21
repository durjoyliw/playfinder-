"use client";

import ProfileActions from "@/app/(main)/users/[username]/ProfileActions";
import ProfilePostsGrid from "@/app/(main)/users/[username]/ProfilePostsGrid";
import EditProfileButton from "@/app/(main)/users/[username]/EditProfileButton";
import UserAvatar from "@/components/UserAvatar";
import { FollowerInfo, UserData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { AthleteProfileData, SkillTier } from "./types";

interface AthleteProfileProps {
  profile: AthleteProfileData;
  user: UserData;
  followerInfo: FollowerInfo;
}

function getTierColor(tier: SkillTier): string {
  switch (tier) {
    case "Advanced":
      return "text-[#C9F31D]";
    case "Intermediate":
      return "text-blue-500";
    case "Beginner":
      return "text-gray-500";
    default:
      return "text-gray-500";
  }
}

export default function AthleteProfile({
  profile,
  user,
  followerInfo,
}: AthleteProfileProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "games" | "highlights">(
    "posts",
  );

  const tabs = [
    { id: "posts" as const, label: "Posts" },
    { id: "games" as const, label: "Games played" },
    { id: "highlights" as const, label: "Highlights" },
  ];

  return (
    <div className="w-full pb-36 text-white">
      <div className="relative">
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]">
          {profile.avatarUrl && (
            <div
              className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-sm"
              style={{ backgroundImage: `url(${profile.avatarUrl})` }}
            />
          )}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                  135deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,0.03) 10px,
                  rgba(255,255,255,0.03) 20px
                )`,
            }}
          />
          {profile.isOwnProfile && (
            <div className="absolute right-3 top-3 [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-xs [&_button]:text-gray-400 [&_button]:shadow-none hover:[&_button]:text-white">
              <EditProfileButton user={user} />
            </div>
          )}
        </div>

        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[#0d0d0d] bg-[#1a1a1a]">
              {profile.avatarUrl ? (
                <UserAvatar
                  avatarUrl={profile.avatarUrl}
                  size={96}
                  className="h-full w-full max-h-none max-w-none border-0"
                />
              ) : (
                <span className="text-2xl font-semibold text-[#C9F31D]">
                  {profile.initials}
                </span>
              )}
            </div>
            {profile.isOnline && (
              <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-[#0d0d0d] bg-[#C9F31D]" />
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-white">{profile.displayName}</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          @{profile.username} · {profile.region}
        </p>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          <span>{profile.location}</span>
          <span>·</span>
          <Calendar className="h-3 w-3" />
          <span>{profile.joinedDate}</span>
        </div>

        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#C9F31D]/30 bg-[#C9F31D]/10 px-4 py-2 text-sm font-medium text-[#C9F31D] transition-colors hover:bg-[#C9F31D]/20"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#C9F31D]" />
          {profile.intent}
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-4 mt-6 rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-white">
              {profile.stats.gamesPlayed}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Games
            </p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">
              {profile.stats.reliability}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Reliability
            </p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">
              {profile.stats.connections}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Connections
            </p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">
              {profile.stats.broadcasts}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Broadcasts
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Sports Resume
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {profile.sports.map((sport) => (
            <div
              key={sport.name}
              className="flex items-start gap-3 rounded-xl border border-[#262626] bg-[#1a1a1a] p-3"
            >
              <span className="text-xl">{sport.emoji}</span>
              <div>
                <p className="text-sm font-medium text-white">{sport.name}</p>
                <p className={cn("text-xs", getTierColor(sport.tier))}>
                  {sport.tier}
                  {sport.detail && (
                    <span className="text-gray-500"> · {sport.detail}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
          {profile.isOwnProfile && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#333] p-3 text-gray-500 transition-colors hover:border-[#C9F31D] hover:text-[#C9F31D]"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add sport</span>
            </button>
          )}
        </div>
      </div>

      <div className="mx-4 mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Athlete Story
        </h2>
        <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
          <p className="text-sm leading-relaxed text-gray-300">
            {profile.bio ||
              "No athlete story yet. Add a bio to tell others about your sports background."}
          </p>
        </div>
      </div>

      <div className="mx-4 mt-6">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-[#C9F31D] text-[#0d0d0d]"
                  : "bg-[#1a1a1a] text-gray-400 hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4">
        {activeTab === "posts" && <ProfilePostsGrid userId={profile.userId} />}
        {activeTab === "games" && (
          <p className="py-8 text-center text-sm text-gray-500">
            Games played history coming soon.
          </p>
        )}
        {activeTab === "highlights" && (
          <p className="py-8 text-center text-sm text-gray-500">
            Highlights coming soon.
          </p>
        )}
      </div>

      {!profile.isOwnProfile && (
        <div className="fixed bottom-[4.75rem] left-0 right-0 z-40 border-t border-[#262626] bg-[#0d0d0d]/95 p-4 backdrop-blur-sm">
          <ProfileActions user={user} followerInfo={followerInfo} />
        </div>
      )}
    </div>
  );
}
