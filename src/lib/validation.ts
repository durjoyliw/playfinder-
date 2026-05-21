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

export const createBroadcastSchema = z.object({
  sport: z.nativeEnum(Sport),
  intent: z.nativeEnum(PostIntent),
  location: requiredString.max(200),
  timeLabel: requiredString.max(100),
  content: requiredString.max(2000),
});

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

export const updateUserSportsSchema = z.object({
  sports: z.array(
    z.object({
      sport: z.nativeEnum(Sport),
      skillLevel: z.nativeEnum(SkillLevel),
    }),
  ),
});

export type UpdateUserSportsValues = z.infer<typeof updateUserSportsSchema>;

export const completeOnboardingSchema = z.object({
  sports: z
    .array(
      z.object({
        sport: z.nativeEnum(Sport),
        skillLevel: z.nativeEnum(SkillLevel),
      }),
    )
    .min(1, "Select at least one sport"),
  location: requiredString.max(200, "Must be at most 200 characters"),
  profileIntent: z.nativeEnum(ProfileIntent),
});

export type CompleteOnboardingValues = z.infer<typeof completeOnboardingSchema>;

export const createCommentSchema = z.object({
  content: requiredString,
});
