"use client";

import ProfileActions from "@/app/(main)/users/[username]/ProfileActions";
import ProfileBioEditor from "@/app/(main)/users/[username]/ProfileBioEditor";
import ProfileIntentPill from "@/app/(main)/users/[username]/ProfileIntentPill";
import ProfilePostsSection from "@/app/(main)/users/[username]/profile-posts-section";
import UserAvatar from "@/components/UserAvatar";
import { useToast } from "@/components/ui/use-toast";
import { getSportColour } from "@/lib/sport-visuals";
import { FollowerInfo, UserProfileData } from "@/lib/types";
import { CalendarDays, MapPin, Pencil, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AthleteProfileData, SkillTier } from "./types";

interface AthleteProfileProps {
  profile: AthleteProfileData;
  user: UserProfileData;
  followerInfo: FollowerInfo;
}

const SKILL_LEVELS: SkillTier[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Pro",
];

function skillPipCount(level: SkillTier): number {
  const index = SKILL_LEVELS.indexOf(level);
  return index >= 0 ? index + 1 : 2;
}

export default function AthleteProfile({
  profile,
  user,
  followerInfo,
}: AthleteProfileProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/users/${profile.username}`
        : `/users/${profile.username}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ description: "Link copied" });
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to copy link",
      });
    }
  };

  return (
    <div className="w-full pb-10 font-grotesk text-[#f2f5ef]">
      <div className="relative -mx-0 h-[180px] overflow-hidden">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#1a1e1b] to-[#08090a]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,9,10,0.2)] via-[rgba(8,9,10,0.1)] to-[#08090a]" />
        <div className="absolute right-3.5 top-3.5 z-[2] flex gap-2">
          <button
            type="button"
            onClick={() => void handleShare()}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-[rgba(8,9,10,0.6)] text-[#b4bcaf] backdrop-blur-[10px] active:scale-90"
            aria-label="Share profile"
          >
            <Share2 className="h-[17px] w-[17px]" />
          </button>
          {profile.isOwnProfile && (
            <Link
              href="/settings/edit-profile"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-[rgba(8,9,10,0.6)] text-[#b4bcaf] backdrop-blur-[10px] active:scale-90"
              aria-label="Edit profile"
            >
              <Pencil className="h-[17px] w-[17px]" />
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-3.5 top-3.5 z-[2] grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-[rgba(8,9,10,0.6)] text-[#b4bcaf] backdrop-blur-[10px] active:scale-90"
          aria-label="Go back"
        >
          <span className="text-lg leading-none">‹</span>
        </button>
      </div>

      <div className="relative px-4">
        <div className="relative mb-3.5 -mt-12">
          <div className="relative inline-block">
            <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border-4 border-[#08090a] bg-[#1a1e1b]">
              {profile.avatarUrl ? (
                <UserAvatar
                  avatarUrl={profile.avatarUrl}
                  size={88}
                  className="h-full w-full max-h-none max-w-none border-0"
                />
              ) : (
                <span className="text-2xl font-bold text-[#c9f31d]">
                  {profile.initials}
                </span>
              )}
            </div>
            {profile.isOnline && (
              <span className="absolute bottom-2 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-[#08090a] bg-[#08090a]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#c9f31d] shadow-[0_0_8px_#c9f31d]" />
              </span>
            )}
          </div>
        </div>

        <h1 className="text-[26px] font-bold tracking-[-0.03em] text-white">
          {profile.displayName}
        </h1>
        <p className="mt-[3px] text-sm text-[#7e8a7e]">@{profile.username}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[13px] text-[#b4bcaf]">
          <MapPin className="h-[13px] w-[13px]" />
          <span>{profile.location}</span>
          <span className="mx-1.5 text-[#5a635a]">·</span>
          <CalendarDays className="h-[13px] w-[13px]" />
          <span>{profile.joinedDate}</span>
        </div>

        <ProfileIntentPill
          profileIntent={profile.profileIntent}
          isOwnProfile={profile.isOwnProfile}
        />

        {!profile.isOwnProfile && (
          <div className="mt-4 flex w-full gap-2">
            <ProfileActions user={user} followerInfo={followerInfo} />
          </div>
        )}
      </div>

      <div className="mx-4 mt-6 grid grid-cols-3 border-y border-[#2a2f2a] py-5">
        <div className="text-center">
          <p className="text-2xl font-bold">{profile.stats.games}</p>
          <p className="mt-[7px] font-dm-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#7e8a7e]">
            Games
          </p>
        </div>
        <div className="relative text-center before:absolute before:bottom-[20%] before:left-0 before:top-[20%] before:w-px before:bg-[#2a2f2a]">
          <p className="text-2xl font-bold">{profile.stats.broadcasts}</p>
          <p className="mt-[7px] font-dm-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#7e8a7e]">
            Broadcasts
          </p>
        </div>
        <Link
          href={`/teammates?user=${encodeURIComponent(profile.username)}`}
          className="relative text-center before:absolute before:bottom-[20%] before:left-0 before:top-[20%] before:w-px before:bg-[#2a2f2a]"
        >
          <p className="text-2xl font-bold">{profile.stats.teammates}</p>
          <p className="mt-[7px] font-dm-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#7e8a7e]">
            Teammates
          </p>
        </Link>
      </div>

      <div className="mt-7 px-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="mb-1 font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
              Athlete ID
            </p>
            <h2 className="text-[22px] font-bold tracking-[-0.03em]">
              Sports Resume
            </h2>
          </div>
          {profile.isOwnProfile && (
            <Link
              href="/settings/sports"
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#2a2f2a] bg-[#131614] text-[#7e8a7e]"
              aria-label="Edit sports"
            >
              <Pencil className="h-[17px] w-[17px]" />
            </Link>
          )}
        </div>

        {profile.sports.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {profile.sports.map((sport) => {
              const colour = getSportColour(sport.name);
              const pips = skillPipCount(sport.tier);
              return (
                <div
                  key={sport.name}
                  className="relative flex min-h-[130px] flex-col justify-between overflow-hidden rounded-[18px] border border-[#2a2f2a] bg-[#131614] p-[18px]"
                >
                  <div
                    className="pointer-events-none absolute -right-[30px] -top-[30px] h-[100px] w-[100px] rounded-full opacity-[0.06] blur-[30px]"
                    style={{ background: colour }}
                  />
                  <div>
                    <div className="mb-2 text-[26px]">{sport.emoji}</div>
                    <div className="text-[15px] font-bold">{sport.name}</div>
                  </div>
                  <div>
                    <div className="mt-2.5 flex gap-[3px]">
                      {SKILL_LEVELS.map((_, i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-sm"
                          style={{
                            background:
                              i < pips ? colour : "rgba(255,255,255,0.08)",
                          }}
                        />
                      ))}
                    </div>
                    <div
                      className="mt-2 font-dm-mono text-[10px] font-medium uppercase tracking-[0.08em]"
                      style={{ color: colour }}
                    >
                      {sport.tier}
                      {sport.detail ? ` · ${sport.detail}` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
            {profile.isOwnProfile && (
              <Link
                href="/settings/sports"
                className="grid min-h-[130px] place-items-center gap-1.5 rounded-[18px] border-[1.5px] border-dashed border-[#353c34] p-[18px] text-center text-[13px] font-semibold text-[#7e8a7e] active:scale-[0.97] active:border-[#c9f31d] active:text-[#c9f31d]"
              >
                <span className="text-[26px] leading-none">+</span>
                Add a sport
              </Link>
            )}
          </div>
        ) : profile.isOwnProfile ? (
          <Link
            href="/settings/sports"
            className="grid min-h-[130px] place-items-center gap-1.5 rounded-[18px] border-[1.5px] border-dashed border-[#353c34] p-[18px] text-center text-[13px] font-semibold text-[#7e8a7e]"
          >
            <span className="text-[26px] leading-none">+</span>
            Add a sport
          </Link>
        ) : (
          <p className="rounded-[18px] border border-[#2a2f2a] bg-[#131614] p-4 text-center text-sm text-[#7e8a7e]">
            No sports added yet.
          </p>
        )}
      </div>

      <ProfileBioEditor bio={profile.bio} isOwnProfile={profile.isOwnProfile} />

      <div className="mx-4 mt-7">
        <ProfilePostsSection
          userId={profile.userId}
          isOwnProfile={profile.isOwnProfile}
        />
      </div>
    </div>
  );
}
