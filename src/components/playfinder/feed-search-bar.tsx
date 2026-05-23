"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function FeedSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <form onSubmit={submit} className="mx-3 mb-2">
      <div
        className="relative cursor-text rounded-full bg-[#1a1a1a] py-2.5 pl-11 pr-4"
        onClick={() => router.push("/search")}
        role="presentation"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#888888]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          placeholder="Search players or games..."
          className="relative z-20 w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-[#888888] focus:ring-0"
        />
      </div>
    </form>
  );
}
