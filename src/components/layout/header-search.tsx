"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Mic, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search/?q=${encodeURIComponent(q)}` : "/search/");
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn("relative min-w-0 flex-1", className)}
    >
      <label htmlFor="header-search" className="sr-only">
        Поиск по каталогу
      </label>
      <input
        id="header-search"
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по каталогу"
        autoComplete="off"
        className="h-[45px] w-full rounded-none border border-[#d7d8da] bg-background py-2.5 pr-24 pl-8 text-[15px] font-normal text-text-primary placeholder:text-text-secondary focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
      />
      <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2.5 text-text-muted">
        <button
          type="button"
          aria-label="Голосовой поиск"
          className="transition-colors hover:text-brand"
        >
          <Mic className="size-5" aria-hidden />
        </button>
        <span className="h-5 w-px bg-border" aria-hidden />
        <button
          type="submit"
          aria-label="Найти"
          className="transition-colors hover:text-brand"
        >
          <Search className="size-5" aria-hidden />
        </button>
      </div>
    </form>
  );
}
