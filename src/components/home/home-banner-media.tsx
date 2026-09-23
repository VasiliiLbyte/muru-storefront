"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { staticBlurProps } from "@/lib/images";

function usePrefersReducedMotion(): boolean {
  // Conservative default: show static poster until we know motion is OK.
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export type HomeBannerMediaProps = {
  imageUrl: string;
  alt: string;
  videoUrl?: string | null;
  priority?: boolean;
};

/**
 * Banner media: priority poster Image is always the LCP candidate.
 * Heavy MP4 (PSI saw ~7MB with preload=auto) mounts only after idle and
 * uses preload="none" so it cannot steal LCP from the poster.
 */
export function HomeBannerMedia({
  imageUrl,
  alt,
  videoUrl,
  priority = false,
}: HomeBannerMediaProps) {
  const reducedMotion = usePrefersReducedMotion();
  const allowVideo = Boolean(videoUrl) && !reducedMotion;
  const [videoMounted, setVideoMounted] = useState(false);

  useEffect(() => {
    if (!allowVideo) {
      setVideoMounted(false);
      return;
    }
    let cancelled = false;
    const mount = () => {
      if (!cancelled) setVideoMounted(true);
    };
    // Check typeof, not `in window` — TS otherwise narrows window to never
    // in the else branch (requestIdleCallback is non-optional on Window).
    const ric =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback.bind(window)
        : null;
    if (ric) {
      const id = ric(mount, { timeout: 2500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(mount, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [allowVideo]);

  return (
    <>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        {...staticBlurProps()}
        className="object-cover"
      />
      {allowVideo && videoMounted && videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          poster={imageUrl}
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          aria-hidden={alt ? undefined : true}
          aria-label={alt || undefined}
        />
      ) : null}
    </>
  );
}
