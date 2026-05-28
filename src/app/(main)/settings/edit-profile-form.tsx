"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import CropImageDialog from "@/components/CropImageDialog";
import { MapboxLocationAutocomplete } from "@/components/mapbox-location-autocomplete";
import UserAvatar from "@/components/UserAvatar";
import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { getInitials, type UserSettingsData } from "@/lib/settings";
import { useUploadThing } from "@/lib/uploadthing";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Resizer from "react-image-file-resizer";
import {
  SettingsError,
  SettingsLoading,
  SettingsSubpageLayout,
  useUserSettings,
} from "./settings-shared";

const labelClassName =
  "mb-1.5 block text-xs tracking-[0.5px] text-[#888888] uppercase";
const inputClassName =
  "w-full rounded-[10px] border border-[#2a2a2a] bg-[#161616] p-3 text-[15px] text-[#f0f0f0] focus:border-[#C9F31D] focus:outline-none";

export function EditProfileForm() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data, status } = useUserSettings();
  const { startUpload: startAvatarUpload } = useUploadThing("avatar");

  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const [imageToCrop, setImageToCrop] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data) return;
    setDisplayName(data.displayName);
    setLocation(data.location ?? "");
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const updated = await kyInstance
        .patch("/api/users/profile", {
          json: {
            displayName: displayName.trim(),
            location: location.trim(),
          },
        })
        .json<UserSettingsData>();

      if (croppedAvatar) {
        await startAvatarUpload([
          new File([croppedAvatar], `avatar_${user.id}.webp`),
        ]);
      }

      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["user-settings"], updated);
      setCroppedAvatar(null);
      router.refresh();
      toast({ description: "Profile saved successfully" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to save profile. Please try again.",
      });
    },
  });

  function onImageSelected(image: File | undefined) {
    if (!image) return;

    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      "WEBP",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file",
    );
  }

  if (status === "pending") return <SettingsLoading />;
  if (status === "error" || !data) return <SettingsError />;

  const initials = getInitials(displayName || data.displayName);
  const avatarPreview = croppedAvatar
    ? URL.createObjectURL(croppedAvatar)
    : user.avatarUrl;

  return (
    <SettingsSubpageLayout title="Edit Profile">
      <div className="space-y-8">
        <section className="flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#1a1a1a]">
            {avatarPreview ? (
              <UserAvatar
                avatarUrl={avatarPreview}
                size={80}
                className="h-full w-full max-h-none max-w-none border-0"
              />
            ) : (
              <span className="text-lg font-semibold text-[#C9F31D]">
                {initials}
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only hidden"
            onChange={(e) => onImageSelected(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-[20px] border border-[#2a2a2a] bg-[#161616] px-5 py-2 text-[13px] text-[#C9F31D] transition-colors hover:bg-[#1f1f1f]"
          >
            Change photo
          </button>
          {imageToCrop && (
            <CropImageDialog
              src={URL.createObjectURL(imageToCrop)}
              cropAspectRatio={1}
              onCropped={setCroppedAvatar}
              onClose={() => {
                setImageToCrop(undefined);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            />
          )}
        </section>

        <section>
          <label htmlFor="displayName" className={labelClassName}>
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputClassName}
          />
        </section>

        <section>
          <label htmlFor="location" className={labelClassName}>
            Location
          </label>
          <MapboxLocationAutocomplete
            id="location"
            value={location}
            onChange={setLocation}
            onPlaceSelect={setLocation}
            inputClassName={inputClassName}
          />
        </section>

        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !displayName.trim()}
          className="w-full rounded-xl bg-[#C9F31D] py-3.5 text-[15px] font-bold text-[#0d0d0d] transition-opacity disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </SettingsSubpageLayout>
  );
}
