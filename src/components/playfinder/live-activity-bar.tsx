"use client";

import { useUserSettings } from "@/hooks/use-user-settings";
import kyInstance from "@/lib/ky";
import { getDisplayArea } from "@/lib/location";
import { useQuery } from "@tanstack/react-query";

export function LiveActivityBar() {
  const { data: userSettings } = useUserSettings();
  const area = getDisplayArea(userSettings?.location);

  const { data } = useQuery({
    queryKey: ["playfinder", "active-count"],
    queryFn: () =>
      kyInstance.get("/api/playfinder/active-count").json<{ count: number }>(),
    refetchInterval: 60 * 1000,
  });

  const count = data?.count ?? 0;

  return (
    <div
      className="relative mx-4 mt-[18px] flex items-center gap-3.5 overflow-hidden rounded-2xl border border-[#2a2f2a] px-[18px] py-4"
      style={{
        background:
          "linear-gradient(135deg, var(--pf-surface) 0%, var(--pf-bg-2) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 85% 50%, var(--pf-volt-glow), transparent 60%)",
          opacity: 0.12,
        }}
      />
      <div className="relative">
        <div className="text-[28px] font-bold leading-none text-[#c9f31d]">
          {count}
        </div>
        <div className="mt-1 text-[13px] leading-snug text-[#b4bcaf]">
          <strong className="font-semibold text-[#f2f5ef]">
            athletes active
          </strong>{" "}
          nearby
          {area !== "your area" ? ` in ${area}` : ""}
        </div>
      </div>
      <div className="pf-live-orb" aria-hidden />
    </div>
  );
}
