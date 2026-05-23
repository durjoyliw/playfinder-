"use client";

import { cn } from "@/lib/utils";
import { REACTION_EMOJIS } from "./messages-utils";

interface ReactionPickerProps {
  className?: string;
  onSelect: (emoji: string) => void;
}

export default function ReactionPicker({
  className,
  onSelect,
}: ReactionPickerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-[#333] bg-[#1a1a1a] px-2 py-1.5 shadow-lg",
        className,
      )}
      role="toolbar"
      aria-label="Add reaction"
    >
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="rounded-full px-1.5 py-0.5 text-lg transition-colors hover:bg-[#2a2a2a]"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
