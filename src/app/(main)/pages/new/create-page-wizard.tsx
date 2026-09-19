"use client";

import { checkPageHandle, createPage } from "@/app/(main)/pages/actions";
import { PageLocationMap } from "@/app/(main)/pages/new/page-location-map";
import LoadingButton from "@/components/LoadingButton";
import {
  MapboxLocationAutocomplete,
  type MapboxGeocodeFeature,
} from "@/components/mapbox-location-autocomplete";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  geocodedPlaceFromFeature,
  type GeocodedPlace,
} from "@/lib/mapbox-geocode";
import { getInitials } from "@/lib/settings";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { PAGE_HANDLE_REGEX } from "@/lib/validation";
import {
  Building2,
  Check,
  ChevronDown,
  Flag,
  Sparkles,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import "./wizard.css";

type PageKind = "VENUE" | "CLUB";

interface VenueOption {
  id: string;
  name: string;
  handle: string;
}

interface CreatePageWizardProps {
  venues: VenueOption[];
}

const COMING_SOON = [
  { key: "league", title: "League", icon: Trophy },
  { key: "coach", title: "Coach", icon: UserRound },
  { key: "brand", title: "Brand", icon: Sparkles },
  { key: "community", title: "Community", icon: Users },
] as const;

const fieldInputClass =
  "h-10 rounded-[1rem] border-[#2a2f2a] bg-[#131614] px-3.5 text-[15px] text-[#f2f5ef] placeholder:text-[#5a635a] focus-visible:border-[#a1c217] focus-visible:ring-0 focus-visible:ring-offset-0";

const fieldLabelClass =
  "mb-2 block font-dm-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#7e8a7e]";

const primaryButtonClass =
  "h-10 w-full rounded-xl bg-[#a1c217] text-sm font-semibold text-[#08090a] hover:bg-[#a1c217]/90";

function Field({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("field", className)}>{children}</div>;
}

export function CreatePageWizard({ venues }: CreatePageWizardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const avatarInputId = useId();
  const bannerInputId = useId();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [type, setType] = useState<PageKind>("CLUB");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [city, setCity] = useState("");
  /** Map overlay from Settings Location autocomplete pick (radius vs pin). */
  const [mapPlace, setMapPlace] = useState<GeocodedPlace | null>(null);
  const [homeVenueId, setHomeVenueId] = useState("");
  const [sport, setSport] = useState("");
  const [facilities, setFacilities] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { startUpload } = useUploadThing("pageAsset");

  useEffect(() => {
    const normalized = handle.trim().toLowerCase().replace(/^@/, "");
    if (!PAGE_HANDLE_REGEX.test(normalized)) {
      setHandleAvailable(null);
      setCheckingHandle(false);
      return;
    }

    setCheckingHandle(true);
    const timeout = window.setTimeout(() => {
      void checkPageHandle(normalized)
        .then((result) => setHandleAvailable(result.available))
        .catch(() => setHandleAvailable(null))
        .finally(() => setCheckingHandle(false));
    }, 280);

    return () => window.clearTimeout(timeout);
  }, [handle]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [avatarPreview, bannerPreview]);

  function goTo(next: number) {
    setDirection(next < step ? "back" : "forward");
    setStep(next);
  }

  function canAdvance() {
    if (step === 1) return Boolean(type);
    if (step === 2) {
      return (
        name.trim().length > 0 &&
        PAGE_HANDLE_REGEX.test(handle.trim().toLowerCase().replace(/^@/, "")) &&
        handleAvailable === true
      );
    }
    if (step === 3) return city.trim().length > 0;
    return true;
  }

  async function uploadAsset(file: File | null) {
    if (!file) return null;
    const result = await startUpload([file]);
    return result?.[0]?.serverData?.url ?? result?.[0]?.url ?? null;
  }

  async function submitPage() {
    if (!canAdvance() && step < 4) return;
    setSubmitting(true);
    try {
      const [avatarUrl, bannerUrl] = await Promise.all([
        uploadAsset(avatarFile),
        uploadAsset(bannerFile),
      ]);

      const created = await createPage({
        type,
        name: name.trim(),
        handle: handle.trim(),
        city: city.trim(),
        homeVenueId: type === "CLUB" && homeVenueId ? homeVenueId : null,
        sport: type === "CLUB" ? sport.trim() || undefined : undefined,
        facilities:
          type === "VENUE" ? facilities.trim() || undefined : undefined,
        bio: bio.trim() || undefined,
        avatarUrl,
        bannerUrl,
      });

      router.push(`/pages/${created.handle}`);
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Could not create page",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function onPrimary() {
    if (step === 5) {
      void submitPage();
      return;
    }
    if (!canAdvance()) return;
    goTo(step + 1);
  }

  function onSkip() {
    if (step === 5) {
      void submitPage();
      return;
    }
    if (step === 3 && !city.trim()) return;
    goTo(Math.min(5, step + 1));
  }

  const initials = getInitials(name || "Page");
  const displayHandle = handle.trim().replace(/^@/, "");

  return (
    <div className="flex min-h-full flex-col font-grotesk text-[#f2f5ef]">
      <div className="relative flex items-center justify-center border-b border-[#2a2f2a] px-4 py-4 lg:px-6">
        <button
          type="button"
          onClick={() => (step > 1 ? goTo(step - 1) : router.back())}
          className="absolute left-4 grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-[rgba(8,9,10,0.6)] text-[#b4bcaf] lg:left-6"
          aria-label="Back"
        >
          <span className="text-lg leading-none">‹</span>
        </button>
        <h1 className="text-lg font-semibold">Create a Page</h1>
      </div>

      <div className="flex items-center px-4 pt-4 lg:px-6">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={cn("flex items-center", n < 5 && "flex-1")}>
            <button
              type="button"
              onClick={() => {
                if (n === 1 || (n > 1 && type)) goTo(n);
              }}
              className={cn(
                "grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full border font-dm-mono text-[10px] font-medium",
                step === n
                  ? "border-[#a1c217] bg-[#a1c217] text-[#08090a] shadow-[0_0_0_4px_rgba(161,194,23,0.35)]"
                  : step > n
                    ? "border-[#a1c217] bg-[#a1c217] text-[#08090a]"
                    : "border-[#2a2f2a] bg-[#131614] text-[#7e8a7e]",
              )}
              aria-label={`Step ${n}`}
            >
              {n}
            </button>
            {n < 5 && (
              <span
                className={cn(
                  "mx-1.5 h-px flex-1",
                  step > n ? "bg-[#76930f]" : "bg-[#2a2f2a]",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-6 pt-[22px] lg:px-6">
        <div
          key={`${step}-${direction}`}
          className={cn(
            "flex-1",
            direction === "back"
              ? "pf-wizard-step-back"
              : "pf-wizard-step-forward",
          )}
        >
          {step === 1 && (
            <StepShell
              label="Step 1 of 5 · Type"
              title="What are you creating?"
              copy="Pick a type. You can fill in the rest in under a minute."
            >
              <div className="grid gap-2.5 lg:grid-cols-2">
                <TypeCard
                  selected={type === "VENUE"}
                  title="Venue"
                  copy="Pitches, courts, and the place people play."
                  icon={<Building2 className="h-5 w-5" />}
                  onSelect={() => setType("VENUE")}
                />
                <TypeCard
                  selected={type === "CLUB"}
                  title="Club"
                  copy="A team or club with a home ground."
                  icon={<Flag className="h-5 w-5" />}
                  onSelect={() => setType("CLUB")}
                />
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                {COMING_SOON.map((item) => (
                  <div
                    key={item.key}
                    className="flex min-h-24 flex-col gap-2.5 rounded-[1rem] border border-[#2a2f2a] bg-[#131614] p-4 opacity-[0.42]"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#2a2f2a] bg-[#1a1e1b] text-[#b4bcaf]">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold tracking-[-0.02em]">
                        {item.title}
                      </p>
                      <p className="mt-1 font-dm-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[#5a635a]">
                        Coming soon
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              label="Step 2 of 5 · Name"
              title="Name it."
              copy="This is how it appears across PlayFinder."
            >
              <Field>
                <Label htmlFor="page-name" className={fieldLabelClass}>
                  Page name
                </Label>
                <Input
                  id="page-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={fieldInputClass}
                  maxLength={80}
                />
              </Field>
              <Field>
                <Label htmlFor="page-handle" className={fieldLabelClass}>
                  Handle
                </Label>
                <div className="relative">
                  <Input
                    id="page-handle"
                    value={handle}
                    onChange={(event) => setHandle(event.target.value)}
                    className={cn(fieldInputClass, "pr-11")}
                    placeholder="@handle"
                  />
                  {handleAvailable && (
                    <span
                      className="pf-handle-tick absolute right-3 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-[#a1c217] text-[#08090a]"
                      aria-label="Handle available"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2.5 6.2l2.4 2.4 4.6-5.2"
                          stroke="#08090a"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                {handle.trim() &&
                  !checkingHandle &&
                  handleAvailable === false && (
                    <p className="mt-2 text-[13px] text-[#7e8a7e]">
                      That handle is taken or invalid.
                    </p>
                  )}
              </Field>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell
              label="Step 3 of 5 · Location"
              title="Where is it?"
              copy={
                type === "CLUB"
                  ? "City first. Home venue can wait."
                  : "Drop a pin so players can find you."
              }
            >
              <PageLocationMap place={mapPlace} />
              <Field>
                <Label className={fieldLabelClass}>City</Label>
                <MapboxLocationAutocomplete
                  value={city}
                  onChange={(text) => {
                    setCity(text);
                    // Clear map overlay while typing a new query
                    if (!text.trim()) setMapPlace(null);
                  }}
                  onPlaceSelect={setCity}
                  onFeatureSelect={(feature: MapboxGeocodeFeature) => {
                    setMapPlace(geocodedPlaceFromFeature(feature));
                  }}
                  placeholder="City or neighbourhood"
                  inputClassName={fieldInputClass}
                />
              </Field>
              {type === "CLUB" && (
                <Field>
                  <div className="mb-2 flex items-baseline justify-between">
                    <Label className={fieldLabelClass}>Home venue</Label>
                    <span className="font-dm-mono text-[10px] uppercase tracking-[0.08em] text-[#5a635a]">
                      Optional
                    </span>
                  </div>
                  <HomeVenueDropdown
                    venues={venues}
                    value={homeVenueId}
                    onChange={setHomeVenueId}
                  />
                </Field>
              )}
            </StepShell>
          )}

          {step === 4 && type === "CLUB" && (
            <StepShell
              label="Step 4 of 5 · Essentials"
              title="Club details"
              copy="Skip anything you do not know yet."
            >
              <Field>
                <Label htmlFor="page-sport" className={fieldLabelClass}>
                  Sport · Optional
                </Label>
                <Input
                  id="page-sport"
                  value={sport}
                  onChange={(event) => setSport(event.target.value)}
                  className={fieldInputClass}
                  placeholder="e.g. Football"
                />
              </Field>
            </StepShell>
          )}

          {step === 4 && type === "VENUE" && (
            <StepShell
              label="Step 4 of 5 · Essentials"
              title="Venue details"
              copy="Skip anything you do not know yet."
            >
              <Field>
                <Label htmlFor="page-facilities" className={fieldLabelClass}>
                  Facilities · Optional
                </Label>
                <Input
                  id="page-facilities"
                  value={facilities}
                  onChange={(event) => setFacilities(event.target.value)}
                  className={fieldInputClass}
                  placeholder="e.g. 3G pitch, tennis courts"
                />
              </Field>
            </StepShell>
          )}

          {step === 5 && (
            <StepShell
              label="Step 5 of 5 · Identity"
              title="Make it look like you."
              copy="Rounded-square avatar — that is how a Page reads as a Page."
            >
              <div className="mb-8">
                <input
                  id={bannerInputId}
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
                    setBannerFile(file);
                    setBannerPreview(URL.createObjectURL(file));
                  }}
                />
                <input
                  id={avatarInputId}
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }}
                />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="relative flex h-[132px] w-full items-center justify-center overflow-hidden rounded-[1rem] border border-dashed border-[#353c34] font-dm-mono text-[10px] uppercase tracking-[0.12em] text-[#7e8a7e]"
                    style={{
                      background: bannerPreview
                        ? undefined
                        : "repeating-linear-gradient(135deg, #131614 0 10px, #161a17 10px 20px)",
                    }}
                  >
                    {bannerPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={bannerPreview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "Add banner"
                    )}
                  </button>
                  {/*
                    Absolute overlap: left-3 (12px) inset on all widths incl. 380px;
                    top-full + -translate-y-1/2 = half on banner; 3px --pf-bg ring.
                  */}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute left-3 top-full z-[1] grid h-20 w-20 -translate-y-1/2 place-items-center overflow-hidden rounded-[1rem] border-[3px] border-[#08090a] bg-[#1a1e1b]"
                    aria-label="Upload page avatar"
                  >
                    {avatarPreview ? (
                      // Preview is a blob URL; next/image cannot host it.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarPreview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold tracking-[-0.03em] text-[#a1c217]">
                        {initials}
                      </span>
                    )}
                  </button>
                </div>
                <div className="mt-12 flex flex-wrap items-center gap-2 pl-3">
                  <h3 className="text-[22px] font-bold tracking-[-0.03em]">
                    {name.trim() || "Your page"}
                  </h3>
                  <span className="inline-flex h-[22px] items-center rounded-full border border-[rgba(86,204,242,0.28)] bg-[rgba(86,204,242,0.1)] px-2 font-dm-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[#56ccf2]">
                    {type === "VENUE" ? "Venue" : "Club"}
                  </span>
                </div>
                {displayHandle && (
                  <p className="mt-1 pl-3 text-sm text-[#7e8a7e]">
                    @{displayHandle}
                  </p>
                )}
              </div>
              <Field>
                <div className="mb-2 flex items-baseline justify-between">
                  <Label htmlFor="page-bio" className={fieldLabelClass}>
                    Bio
                  </Label>
                  <span className="font-dm-mono text-[10px] uppercase tracking-[0.08em] text-[#5a635a]">
                    One line · optional
                  </span>
                </div>
                <Textarea
                  id="page-bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={80}
                  className="min-h-[72px] rounded-[1rem] border-[#2a2f2a] bg-[#131614] px-3.5 py-3 text-[15px] leading-relaxed text-[#f2f5ef] placeholder:text-[#5a635a] focus-visible:border-[#a1c217] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </Field>
            </StepShell>
          )}
        </div>

        <div className="mt-6 border-t border-[#2a2f2a] pt-3">
          <LoadingButton
            type="button"
            loading={submitting}
            disabled={!canAdvance() || submitting}
            onClick={onPrimary}
            className={primaryButtonClass}
          >
            {step === 5 ? "Create Page" : "Continue"}
          </LoadingButton>
          {step >= 3 && (
            <Button
              type="button"
              variant="ghost"
              className="mt-2 h-9 w-full text-[#7e8a7e] hover:bg-transparent hover:text-[#b4bcaf]"
              onClick={onSkip}
              disabled={submitting || (step === 3 && !city.trim())}
            >
              Skip for now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepShell({
  label,
  title,
  copy,
  children,
}: {
  label: string;
  title: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
        {label}
      </p>
      <h2 className="mb-2 text-[24px] font-bold tracking-[-0.03em] leading-tight">
        {title}
      </h2>
      <p className="mb-7 text-[15px] leading-relaxed text-[#b4bcaf]">{copy}</p>
      {children}
    </div>
  );
}

function TypeCard({
  selected,
  title,
  copy,
  icon,
  onSelect,
}: {
  selected: boolean;
  title: string;
  copy: string;
  icon: ReactNode;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex min-h-[118px] flex-col gap-2.5 rounded-[1rem] border p-4 text-left transition-[transform,border-color,background-color] duration-150 motion-safe:active:scale-[0.97]",
        selected
          ? "border-[#56ccf2] bg-[#1a1e1b] shadow-[inset_0_0_0_1px_rgba(86,204,242,0.25)]"
          : "border-[#2a2f2a] bg-[#131614] hover:border-[#353c34] hover:bg-[#1a1e1b]",
      )}
    >
      <div
        className={cn(
          "grid h-9 w-9 place-items-center rounded-[10px] border bg-[#1a1e1b]",
          selected
            ? "border-[rgba(86,204,242,0.35)] text-[#56ccf2]"
            : "border-[#2a2f2a] text-[#b4bcaf]",
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-[16px] font-bold tracking-[-0.02em]">{title}</p>
        <p className="mt-1 text-[13px] leading-snug text-[#7e8a7e]">{copy}</p>
      </div>
    </button>
  );
}

function HomeVenueDropdown({
  venues,
  value,
  onChange,
}: {
  venues: VenueOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = venues.find((v) => v.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            fieldInputClass,
            "flex w-full items-center justify-between text-left outline-none",
            !selected && "text-[#5a635a]",
          )}
        >
          <span className="truncate">
            {selected ? selected.name : "Select a venue"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[#7e8a7e]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="z-[120] max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-[1rem] border-[#2a2f2a] bg-[#131614] p-1 text-[#f2f5ef]"
      >
        <DropdownMenuItem
          className="cursor-pointer rounded-xl px-3 py-2.5 text-[15px] text-[#7e8a7e] focus:bg-[#1a1e1b] focus:text-[#f2f5ef]"
          onSelect={() => onChange("")}
        >
          <span className="flex-1">None</span>
          {!value && <Check className="h-4 w-4 text-[#a1c217]" />}
        </DropdownMenuItem>
        {venues.length === 0 ? (
          <DropdownMenuItem
            disabled
            className="rounded-xl px-3 py-2.5 text-[15px] text-[#5a635a]"
          >
            No venues yet
          </DropdownMenuItem>
        ) : (
          venues.map((venue) => (
            <DropdownMenuItem
              key={venue.id}
              className="cursor-pointer rounded-xl px-3 py-2.5 text-[15px] text-[#f2f5ef] focus:bg-[#1a1e1b] focus:text-[#f2f5ef]"
              onSelect={() => onChange(venue.id)}
            >
              <span className="min-w-0 flex-1 truncate">{venue.name}</span>
              {value === venue.id && (
                <Check className="ml-2 h-4 w-4 shrink-0 text-[#a1c217]" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
