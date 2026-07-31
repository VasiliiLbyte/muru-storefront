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
 * Banner media slot: muted looping video when allowed, else poster Image.
 * Client-only so autoplay does not flash for prefers-reduced-motion users.
 */
export function HomeBannerMedia({
  imageUrl,
  alt,
  videoUrl,
  priority = false,
}: HomeBannerMediaProps) {
  const reducedMotion = usePrefersReducedMotion();
  const showVideo = Boolean(videoUrl) && !reducedMotion;

  if (showVideo && videoUrl) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={videoUrl}
        poster={imageUrl}
        muted
        loop
        playsInline
        autoPlay
        preload={priority ? "auto" : "metadata"}
        aria-hidden={alt ? undefined : true}
        aria-label={alt || undefined}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      priority={priority}
      sizes="100vw"
      {...staticBlurProps()}
      className="object-cover"
    />
  );
}
