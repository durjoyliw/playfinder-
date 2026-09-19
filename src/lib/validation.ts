import { isValidSportKey } from "@/lib/onboarding-sports";
import { PostIntent, ProfileIntent, SkillLevel, Sport } from "@prisma/client";
import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  email: requiredString.email("Invalid email address"),
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed",
  ),
  password: requiredString.min(8, "Must be at least 8 characters"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
});

export const createBroadcastSchema = z
  .object({
    sport: z.nativeEnum(Sport),
    intent: z.nativeEnum(PostIntent),
    location: requiredString.max(200),
    timeLabel: z.string().max(100).optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    content: requiredString.max(280),
    slotsNeeded: z.number().int().min(1).max(10).nullable().optional(),
    visibility: z.enum(["PUBLIC", "TEAMMATES_ONLY"]).default("PUBLIC"),
  })
  .refine(
    (data) =>
      data.intent === PostIntent.BANTER || !!data.timeLabel?.trim(),
    { message: "Game date and time are required" },
  )
  .refine(
    (data) =>
      data.intent !== PostIntent.LOOKING_TO_PLAY ||
      (data.slotsNeeded != null && data.slotsNeeded >= 1),
    { message: "Players needed is required for looking to play posts" },
  );

export type CreateBroadcastValues = z.infer<typeof createBroadcastSchema>;

export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Must be at most 1000 characters"),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const patchUserProfileSchema = z
  .object({
    displayName: requiredString.optional(),
    bio: z.string().max(1000, "Must be at most 1000 characters").optional(),
    location: z.string().max(200, "Must be at most 200 characters").optional(),
    profileIntent: z.nativeEnum(ProfileIntent).optional(),
    intentTag: z.nativeEnum(ProfileIntent).optional(),
  })
  .refine(
    (data) =>
      data.displayName !== undefined ||
      data.bio !== undefined ||
      data.location !== undefined ||
      data.profileIntent !== undefined ||
      data.intentTag !== undefined,
    { message: "At least one field is required" },
  )
  .transform((data) => ({
    displayName: data.displayName,
    bio: data.bio,
    location: data.location,
    profileIntent: data.profileIntent ?? data.intentTag,
  }));

export type PatchUserProfileValues = z.infer<typeof patchUserProfileSchema>;

const userSportEntrySchema = z.object({
  sport: z.string().refine(isValidSportKey, "Invalid sport"),
  skillLevel: z.preprocess(
    (value) => (value === "" ? null : value),
    z.nativeEnum(SkillLevel).nullish(),
  ),
});

export const updateUserSportsSchema = z.object({
  sports: z.array(userSportEntrySchema),
});

export type UpdateUserSportsValues = z.infer<typeof updateUserSportsSchema>;

export const completeOnboardingSchema = z.object({
  sports: z.array(userSportEntrySchema).min(1, "Select at least one sport"),
  location: requiredString.max(200, "Must be at most 200 characters"),
  profileIntent: z.nativeEnum(ProfileIntent),
});

export type CompleteOnboardingValues = z.infer<typeof completeOnboardingSchema>;

export const createCommentSchema = z.object({
  content: requiredString,
});

export const PAGE_HANDLE_REGEX = /^[a-z0-9][a-z0-9_-]{1,29}$/;

export const RESERVED_PAGE_HANDLES = [
  "new",
  "create",
  "edit",
  "settings",
  "invite",
  "admin",
] as const;

export const createPageSchema = z.object({
  type: z.enum(["VENUE", "CLUB"]),
  name: requiredString.max(80, "Must be at most 80 characters"),
  handle: requiredString
    .transform((value) => value.trim().toLowerCase().replace(/^@/, ""))
    .pipe(
      z
        .string()
        .regex(
          PAGE_HANDLE_REGEX,
          "Only letters, numbers, - and _ allowed; 2–30 characters",
        )
        .refine(
          (handle) =>
            !RESERVED_PAGE_HANDLES.includes(
              handle as (typeof RESERVED_PAGE_HANDLES)[number],
            ),
          "This handle is reserved",
        ),
    ),
  city: requiredString.max(120, "Must be at most 120 characters"),
  homeVenueId: z.string().min(1).optional().nullable(),
  sport: z.string().trim().max(80).optional(),
  facilities: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(80).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
});

export type CreatePageValues = z.infer<typeof createPageSchema>;
