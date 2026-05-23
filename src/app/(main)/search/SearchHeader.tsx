"use client";

import { ArrowLeft, Search, X } from "lucide-react";
import Link from "next/link";
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
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    onSubmit(q);
  };

  const clear = () => {
    onChange("");
    router.push("/search");
  };

  return (
    <header className="flex items-center gap-2 border-b border-[#111] px-3 py-3">
      <Link
        href="/"
        className="flex-shrink-0 rounded-full p-2 text-white transition-colors hover:bg-[#1a1a1a]"
        aria-label="Back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <form onSubmit={handleSubmit} className="min-w-0 flex-1">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search players or games..."
            className="w-full rounded-full border-none bg-[#1a1a1a] py-2.5 pl-11 pr-10 text-sm text-white outline-none placeholder:text-[#666666] focus:ring-1 focus:ring-[#333]"
          />
          {value.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#666666] transition-colors hover:bg-[#2a2a2a] hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </header>
  );
}
