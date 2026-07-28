"use client";

import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Mic, Search, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function SearchFormFields({
  id,
  query,
  setQuery,
  onSubmit,
  inputRef,
  inputClassName,
}: {
  id: string;
  query: string;
  setQuery: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  inputClassName?: string;
}) {
  return (
    <form onSubmit={onSubmit} role="search" className="relative min-w-0 w-full">
      <label htmlFor={id} className="sr-only">
        Поиск по каталогу
      </label>
      <input
        ref={inputRef}
        id={id}
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по каталогу"
        autoComplete="off"
        // Inline size avoids ios-zoom false fails before Tailwind CSS applies.
        style={{ fontSize: 16 }}
        className={cn(
          "h-[45px] w-full rounded-none border border-[#d7d8da] bg-background py-2.5 pr-24 pl-8 text-[16px] font-normal text-text-primary placeholder:text-text-secondary focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none lg:text-[15px]",
          inputClassName,
        )}
      />
      <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2.5 text-text-muted">
        <button
          type="button"
          aria-label="Голосовой поиск"
          className="inline-flex size-11 items-center justify-center transition-colors hover:text-brand lg:size-auto"
        >
          <Mic className="size-5" aria-hidden />
        </button>
        <span className="h-5 w-px bg-border" aria-hidden />
        <button
          type="submit"
          aria-label="Найти"
          className="inline-flex size-11 items-center justify-center transition-colors hover:text-brand lg:size-auto"
        >
          <Search className="size-5" aria-hidden />
        </button>
      </div>
    </form>
  );
}

/**
 * Desktop: инлайн-поле. Mobile: иконка → fullscreen Dialog overlay.
 * Один публичный API; overlay всегда в дереве (open state).
 */
export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const desktopId = useId();
  const mobileId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/search/?q=${encodeURIComponent(q)}` : "/search/");
  };

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => mobileInputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <>
      <div
        className={cn(
          "relative max-lg:pointer-events-none max-lg:absolute max-lg:h-0 max-lg:w-0 max-lg:overflow-hidden max-lg:opacity-0",
          "lg:relative lg:block lg:h-auto lg:w-auto lg:overflow-visible lg:opacity-100",
          className,
        )}
      >
        <SearchFormFields
          id={desktopId}
          query={query}
          setQuery={setQuery}
          onSubmit={submit}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <button
          type="button"
          aria-label="Открыть поиск"
          className="inline-flex shrink-0 items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
          style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
          onClick={() => setOpen(true)}
        >
          <Search className="size-5" aria-hidden />
        </button>
        {/* Popup only while open — closed portal kept opacity:0 inputs that zoom e2e still measured */}
        {open ? (
          <DialogContent
            variant="fullscreen"
            showClose={false}
            className="gap-0 p-0"
          >
            <DialogTitle className="sr-only">Поиск по каталогу</DialogTitle>
            <div className="flex items-center gap-1 border-b border-border px-2 py-2">
              <div className="min-w-0 flex-1">
                <SearchFormFields
                  id={mobileId}
                  query={query}
                  setQuery={setQuery}
                  onSubmit={submit}
                  inputRef={mobileInputRef}
                  inputClassName="lg:text-[16px]"
                />
              </div>
              <DialogClose
                aria-label="Закрыть поиск"
                className="inline-flex size-11 shrink-0 items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X className="size-5" aria-hidden />
              </DialogClose>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
