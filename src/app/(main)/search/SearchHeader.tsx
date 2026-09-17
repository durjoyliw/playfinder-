"use client";

import { ChevronLeft, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef } from "react";

interface SearchHeaderProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
}

export function SearchHeader({ value, onChange, onSubmit }: SearchHeaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) {
      router.push("/search");
      return;
    }
    onSubmit(q);
  };

  const clear = () => {
    onChange("");
    inputRef.current?.focus();
    router.push("/search");
  };

  return (
    <div className="flex items-center gap-2.5 px-4 pb-1 pt-3">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#2a2f2a] bg-[#131614] text-[#b4bcaf] transition-transform active:scale-90"
        aria-label="Back"
      >
        <ChevronLeft className="h-[22px] w-[22px]" />
      </button>

      <form onSubmit={handleSubmit} className="min-w-0 flex-1">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7e8a7e]" />
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search players, games, venues..."
            className="h-12 w-full rounded-[14px] border border-[#2a2f2a] bg-[#131614] py-3.5 pl-11 pr-10 text-base text-[#f2f5ef] outline-none placeholder:text-[#5a635a] focus:border-[#c9f31d]"
          />
          {value.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#7e8a7e] hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
