"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageBackHeaderProps {
  title: string;
  className?: string;
}

export function PageBackHeader({ title, className }: PageBackHeaderProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center border-b border-[#2a2a2a] px-4 py-4",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute left-4 text-white"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="text-lg font-semibold text-white">{title}</h1>
    </div>
  );
}
