"use client";

import { usePlayFinder } from "@/components/playfinder/playfinder-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flag, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface CreateMenuProps {
  children: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
}

export function CreateMenu({
  children,
  align = "center",
  side = "top",
}: CreateMenuProps) {
  const { openComposer } = usePlayFinder();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={10}
        className="z-[120] min-w-[220px] rounded-xl border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-c-fill-131614)] p-1.5 text-[var(--pf-c-ink-f2f5ef)] pf-card"
      >
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-semibold text-[var(--pf-c-ink-f2f5ef)] focus:bg-[var(--pf-c-fill-1a1e1b)] focus:text-[var(--pf-c-ink-f2f5ef)]"
          onSelect={() => openComposer()}
        >
          <Zap className="h-4 w-4 text-[var(--pf-volt-text)]" />
          Broadcast
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-semibold text-[var(--pf-c-ink-f2f5ef)] focus:bg-[var(--pf-c-fill-1a1e1b)] focus:text-[var(--pf-c-ink-f2f5ef)]"
          onSelect={() => router.push("/pages/new")}
        >
          <Flag className="h-4 w-4 text-[#56ccf2]" />
          Create a Page
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
