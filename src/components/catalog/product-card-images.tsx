"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

import type { Image as ImageData } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const CARD_IMAGE_SIZES =
  "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

const MAX_CAROUSEL_SLIDES = 3;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function ProductCardImages({
  images,
  href,
  priority = false,
}: {
  images: ImageData[];
  href: string;
  priority?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [extraSlidesMounted, setExtraSlidesMounted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const slides = images.slice(0, MAX_CAROUSEL_SLIDES);
  const isCarousel = slides.length > 1;
  const renderedSlides =
    isCarousel && !extraSlidesMounted ? slides.slice(0, 1) : slides;

  const mountExtraSlides = useCallback(() => {
    if (isCarousel) setExtraSlidesMounted(true);
  }, [isCarousel]);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(index, renderedSlides.length - 1));
  }, [renderedSlides.length]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({
        left: index * el.clientWidth,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  const onArrowClick = useCallback(
    (direction: -1 | 1) => (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const next = Math.max(
        0,
        Math.min(activeIndex + direction, renderedSlides.length - 1),
      );
      scrollToIndex(next);
    },
    [activeIndex, renderedSlides.length, scrollToIndex],
  );

  if (!slides[0]) return null;

  if (!isCarousel) {
    const image = slides[0];
    return (
      <Link
        href={href}
        className="absolute inset-0 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={image.url}
          alt=""
          fill
          sizes={CARD_IMAGE_SIZES}
          priority={priority}
          placeholder={image.blurDataURL ? "blur" : undefined}
          blurDataURL={image.blurDataURL}
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </Link>
    );
  }

  return (
    <div
      className="absolute inset-0"
      onPointerEnter={mountExtraSlides}
      onTouchStart={mountExtraSlides}
    >
      <div
        ref={scrollRef}
        onScroll={updateActiveIndex}
        className="flex h-full snap-x snap-mandatory overflow-x-auto [touch-action:pan-y] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {renderedSlides.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className="relative h-full min-w-full shrink-0 snap-center"
          >
            <Link
              href={href}
              className="absolute inset-0 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes={CARD_IMAGE_SIZES}
                priority={priority && index === 0}
                loading={index === 0 ? undefined : "lazy"}
                fetchPriority={index === 0 ? undefined : "low"}
                placeholder={image.blurDataURL ? "blur" : undefined}
                blurDataURL={image.blurDataURL}
                className="object-cover"
              />
            </Link>
          </div>
        ))}
      </div>

      {extraSlidesMounted && renderedSlides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Предыдущее фото"
            onClick={onArrowClick(-1)}
            className={cn(
              "absolute top-1/2 left-2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-body text-text-heading opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
              activeIndex === 0 && "pointer-events-none opacity-0",
            )}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Следующее фото"
            onClick={onArrowClick(1)}
            className={cn(
              "absolute top-1/2 right-2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-body text-text-heading opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
              activeIndex === renderedSlides.length - 1 &&
                "pointer-events-none opacity-0",
            )}
          >
            ›
          </button>
        </>
      ) : null}

      {isCarousel ? (
        <div
          className="pointer-events-none absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 gap-1.5"
          aria-hidden
        >
          {slides.map((image, index) => (
            <span
              key={`dot-${image.url}-${index}`}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                index === activeIndex ? "bg-brand" : "bg-brand/35",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
