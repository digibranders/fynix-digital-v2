"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, Volume2, VolumeX } from "lucide-react";

type TalkVideoProps = {
  src: string;
  poster: string;
  label: string;
  /** Human-readable runtime, e.g. "4:43", shown on the poster overlay. */
  duration: string;
};

/**
 * Scroll-triggered talk recording. When it scrolls into view it tries to play
 * WITH sound and falls back to muted if the browser blocks unmuted autoplay;
 * it pauses when it leaves view. Once it has started, the native controls stay
 * on and the poster never returns, so pausing or scrubbing never interrupts.
 */
export const TalkVideo: React.FC<TalkVideoProps> = ({
  src,
  poster,
  label,
  duration,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const inView = useRef(false);
  const pausedByUser = useRef(false);
  const [activated, setActivated] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const figure = figureRef.current;
    if (!video || !figure) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    // Prefer sound; if the browser blocks unmuted autoplay (no prior user
    // gesture yet), retry muted so the talk still starts.
    const autoplay = () => {
      video.muted = false;
      video
        .play()
        .then(() => setMuted(false))
        .catch(() => {
          video.muted = true;
          setMuted(true);
          void video.play().catch(() => {});
        });
    };

    // Browsers block unmuted autoplay until the visitor interacts with the
    // page. Unmute on that first gesture (tap/click/key — a mobile scroll is a
    // touch) so sound is on by the time the talk is on screen. It stays paused
    // and silent while off screen regardless.
    const gestureEvents = ["pointerdown", "keydown", "touchstart"];
    const enableSound = () => {
      gestureEvents.forEach((e) => document.removeEventListener(e, enableSound));
      video.muted = false;
      setMuted(false);
      if (inView.current && !pausedByUser.current) {
        void video.play().catch(() => {});
      }
    };
    gestureEvents.forEach((e) =>
      document.addEventListener(e, enableSound, { passive: true }),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            if (!pausedByUser.current) autoplay();
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.55 },
    );

    observer.observe(figure);
    return () => {
      observer.disconnect();
      gestureEvents.forEach((e) => document.removeEventListener(e, enableSound));
    };
  }, []);

  // A pause while the video is on screen is the viewer's own doing (scrubber,
  // pause button) — remember it so the observer doesn't fight them back to play.
  const handlePause = () => {
    if (inView.current) pausedByUser.current = true;
  };

  // Explicit play from the poster = clear intent, so start with sound.
  const handleManualPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    pausedByUser.current = false;
    video.muted = false;
    setMuted(false);
    void video.play().catch(() => {});
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
    if (!next) void video.play().catch(() => {});
  };

  return (
    <figure
      ref={figureRef}
      className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-black shadow-[0_1px_2px_rgba(15,14,12,0.06),0_28px_60px_-30px_rgba(15,14,12,0.4)]"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        preload="none"
        controls={activated}
        onPlay={() => setActivated(true)}
        onPause={handlePause}
        className="h-full w-full object-cover"
      />

      {/* Poster overlay + manual play — only until the video first starts. */}
      {!activated && (
        <button
          type="button"
          onClick={handleManualPlay}
          aria-label={`Play video — ${label} (${duration})`}
          className="group absolute inset-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Image
            src={poster}
            alt={label}
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25 transition-colors group-hover:from-black/60"
          />
          <span className="relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105 md:h-20 md:w-20">
            <Play
              className="h-6 w-6 translate-x-[2px] md:h-7 md:w-7"
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 md:p-6 text-left">
            <figcaption className="max-w-[80%] text-[14px] font-medium leading-snug text-white md:text-[15px]">
              {label}
            </figcaption>
            <span className="shrink-0 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-medium tabular-nums text-white/90 backdrop-blur-sm">
              {duration}
            </span>
          </div>
        </button>
      )}

      {/* Sound toggle — shown while muted so muted autoplay is escapable. */}
      {activated && muted && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label="Unmute video"
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <VolumeX className="h-4 w-4" strokeWidth={1.75} />
          Tap for sound
        </button>
      )}

      {/* Once unmuted, a small mute affordance (native controls also cover it). */}
      {activated && !muted && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label="Mute video"
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Volume2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}
    </figure>
  );
};
