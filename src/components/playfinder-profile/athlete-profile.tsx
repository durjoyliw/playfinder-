"use client";

import ProfileActions from "@/app/(main)/users/[username]/ProfileActions";
import ProfileBioEditor from "@/app/(main)/users/[username]/ProfileBioEditor";
import ProfileIntentPill from "@/app/(main)/users/[username]/ProfileIntentPill";
import ProfilePostsSection from "@/app/(main)/users/[username]/profile-posts-section";
import EditProfileButton from "@/app/(main)/users/[username]/EditProfileButton";
import UserAvatar from "@/components/UserAvatar";
import { FollowerInfo, UserProfileData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Calendar, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { AthleteProfileData, SkillTier } from "./types";

interface AthleteProfileProps {
  profile: AthleteProfileData;
  user: UserProfileData;
  followerInfo: FollowerInfo;
}

function getTierColor(tier: SkillTier): string {
  switch (tier) {
    case "Advanced":
    case "Pro":
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

        <ProfileIntentPill
          profileIntent={profile.profileIntent}
          isOwnProfile={profile.isOwnProfile}
        />
      </div>

      <div className="mx-4 mt-6 rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-white">{profile.stats.games}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Games
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
        {profile.sports.length > 0 ? (
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
              <Link
                href="/settings/sports"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#333] p-3 text-gray-500 transition-colors hover:border-[#C9F31D] hover:text-[#C9F31D]"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add sport</span>
              </Link>
            )}
          </div>
        ) : profile.isOwnProfile ? (
          <Link
            href="/settings/sports"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#333] p-4 text-gray-500 transition-colors hover:border-[#C9F31D] hover:text-[#C9F31D]"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add sports to your resume</span>
          </Link>
        ) : (
          <p className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4 text-center text-sm text-gray-500">
            No sports added yet.
          </p>
        )}
      </div>

      <ProfileBioEditor bio={profile.bio} isOwnProfile={profile.isOwnProfile} />

      <div className="mx-4 mt-6">
        <ProfilePostsSection
          userId={profile.userId}
          isOwnProfile={profile.isOwnProfile}
        />
      </div>

      {!profile.isOwnProfile && (
        <div className="fixed bottom-[4.75rem] left-0 right-0 z-40 border-t border-[#262626] bg-[#0d0d0d]/95 p-4 backdrop-blur-sm">
          <ProfileActions user={user} followerInfo={followerInfo} />
        </div>
      )}
    </div>
  );
}
