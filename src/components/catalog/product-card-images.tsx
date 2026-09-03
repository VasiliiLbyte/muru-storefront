"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";

import { useFineHover } from "@/hooks/use-match-media";
import type { Image as ImageData } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const CARD_IMAGE_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw";

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

function indexFromMouseX(event: MouseEvent<HTMLDivElement>, slideCount: number) {
  const rect = event.currentTarget.getBoundingClientRect();
  if (rect.width <= 0 || slideCount < 1) return 0;
  const x = event.clientX - rect.left;
  return Math.min(
    slideCount - 1,
    Math.max(0, Math.floor((x / rect.width) * slideCount)),
  );
}

export function ProductCardImages({
  images,
  href,
  priority = false,
  variant = "listing",
  sizes = CARD_IMAGE_SIZES,
  objectFit = "cover",
  dotsTone = "photo",
}: {
  images: ImageData[];
  href: string;
  priority?: boolean;
  variant?: "listing" | "compact";
  sizes?: string;
  objectFit?: "cover" | "contain";
  dotsTone?: "photo" | "sheet";
}) {
  const objectFitClass =
    objectFit === "contain" ? "object-contain" : "object-cover";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [extraSlidesMounted, setExtraSlidesMounted] = useState(false);
  const isFineHover = useFineHover();
  const reducedMotion = usePrefersReducedMotion();
  const showArrows = variant === "listing";

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
    (index: number, behavior: ScrollBehavior) => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({
        left: index * el.clientWidth,
        behavior,
      });
    },
    [],
  );

  const onArrowClick = useCallback(
    (direction: -1 | 1) => (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const next = Math.max(
        0,
        Math.min(activeIndex + direction, renderedSlides.length - 1),
      );
      scrollToIndex(next, reducedMotion ? "auto" : "smooth");
    },
    [activeIndex, reducedMotion, renderedSlides.length, scrollToIndex],
  );

  const onFineHoverMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!isCarousel) return;
      setActiveIndex(indexFromMouseX(event, slides.length));
    },
    [isCarousel, slides.length],
  );

  const onFineHoverLeave = useCallback(() => {
    if (!isCarousel) return;
    setActiveIndex(0);
  }, [isCarousel]);

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
          sizes={sizes}
          priority={priority}
          placeholder={image.blurDataURL ? "blur" : undefined}
          blurDataURL={image.blurDataURL}
          className={cn(
            objectFitClass,
            objectFit === "cover" &&
              "transition-transform duration-500 ease-in-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          )}
        />
      </Link>
    );
  }

  const dots = (
    <div
      className={cn(
        "pointer-events-none absolute left-1/2 z-30 flex -translate-x-1/2 gap-1.5",
        // Полосы «Добавить в корзину» под точками больше нет (CARD-001)
        "bottom-3",
      )}
      aria-hidden
    >
      {slides.map((image, index) => (
        <span
          key={`dot-${image.url}-${index}`}
          className={cn(
            "size-1.5 rounded-full transition-colors",
            index === activeIndex
              ? "bg-brand"
              : dotsTone === "sheet"
                ? "bg-black/25"
                : "bg-white/80 ring-1 ring-black/10",
          )}
        />
      ))}
    </div>
  );

  if (isFineHover) {
    return (
      <div
        className="absolute inset-0"
        onMouseEnter={onFineHoverMove}
        onMouseMove={onFineHoverMove}
        onMouseLeave={onFineHoverLeave}
      >
        {slides.map((image, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={`${image.url}-${index}`}
              className={cn(
                "absolute inset-0 transition-opacity duration-[180ms] ease-out motion-reduce:transition-none",
                isActive
                  ? "z-[1] opacity-100"
                  : "pointer-events-none z-0 opacity-0",
              )}
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
                  sizes={sizes}
                  priority={priority && index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  fetchPriority={index === 0 ? undefined : "low"}
                  placeholder={image.blurDataURL ? "blur" : undefined}
                  blurDataURL={image.blurDataURL}
                  className={objectFitClass}
                />
              </Link>
            </div>
          );
        })}
        {dots}
      </div>
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
        className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                sizes={sizes}
                priority={priority && index === 0}
                loading={index === 0 ? undefined : "lazy"}
                fetchPriority={index === 0 ? undefined : "low"}
                placeholder={image.blurDataURL ? "blur" : undefined}
                blurDataURL={image.blurDataURL}
                className={objectFitClass}
              />
            </Link>
          </div>
        ))}
      </div>

      {showArrows && extraSlidesMounted && renderedSlides.length > 1 ? (
        <>
          {activeIndex > 0 ? (
            <button
              type="button"
              aria-label="Предыдущее фото"
              onClick={onArrowClick(-1)}
              className="absolute top-1/2 left-2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-body text-text-heading opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              ‹
            </button>
          ) : null}
          {activeIndex < renderedSlides.length - 1 ? (
            <button
              type="button"
              aria-label="Следующее фото"
              onClick={onArrowClick(1)}
              className="absolute top-1/2 right-2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-body text-text-heading opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              ›
            </button>
          ) : null}
        </>
      ) : null}

      {dots}
    </div>
  );
}
