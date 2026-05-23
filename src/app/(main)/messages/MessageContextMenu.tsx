"use client";

import { cn } from "@/lib/utils";

interface MessageContextMenuProps {
  x: number;
  y: number;
  isOwn: boolean;
  onReact: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function MessageContextMenu({
  x,
  y,
  isOwn,
  onReact,
  onCopy,
  onDelete,
  onClose,
}: MessageContextMenuProps) {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        className="fixed z-50 min-w-[120px] overflow-hidden rounded-xl border border-[#333] bg-[#1a1a1a] py-1 shadow-lg"
        style={{ left: x, top: y }}
      >
        <MenuItem onClick={onReact}>React</MenuItem>
        <MenuItem onClick={onCopy}>Copy</MenuItem>
        {isOwn && (
          <MenuItem onClick={onDelete} className="text-red-400">
            Delete
          </MenuItem>
        )}
      </div>
    </>
  );
}

function MenuItem({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2 text-left text-sm text-white transition-colors hover:bg-[#2a2a2a]",
        className,
      )}
    >
      {children}
    </button>
  );
}
