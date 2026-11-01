"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { FACTS, HERO_VIDEO, HOURS } from "@/lib/site";

import { btnPrimary, btnSecondary } from "./ui";
import { Icon } from "./Icon";

/**
 * Calm full-width hero: the real hero video under one headline and one
 * action. The poster paints first; the video fades in once it has a frame.
 * Reduced motion keeps the poster still; everyone else gets a pause button.
 */
export function HomeHero() {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onReady = () => setReady(true);
    v.addEventListener("loadeddata", onReady);
    if (v.readyState >= 2) setReady(true);
    v.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
    return () => v.removeEventListener("loadeddata", onReady);
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) void v.play().then(() => setPlaying(true));
    else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[560px] items-end overflow-hidden h-[calc(100svh-4rem)] max-h-[860px]"
    >
      <Image
        src={HERO_VIDEO.poster}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
        unoptimized
      />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        poster={HERO_VIDEO.poster}
        aria-hidden="true"
        // The source files carry baked-in letterbox bars; scaling crops them.
        className={`absolute inset-0 -z-10 h-full w-full scale-[1.36] object-cover transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
      >
        {HERO_VIDEO.sources.map((s) => (
          <source
            key={s.src}
            src={s.src}
            type={s.type}
            {...("media" in s ? { media: s.media } : {})}
          />
        ))}
      </video>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/45 to-[#0A0F1E]/20"
      />

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 md:pb-20">
        <h1
          id="hero-title"
          className="max-w-4xl font-display text-[52px] font-black uppercase leading-[0.88] tracking-[-0.015em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-7xl lg:text-8xl"
        >
          Hyderabad&rsquo;s <span className="text-[#C8F400]">hottest</span> pickleball court
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#E2E8F0] md:text-lg">
          Four pro courts and an on-site café in Peerzadiguda. Book online in a minute, no app
          needed.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href="/play" className={btnPrimary}>
            Book a Court <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
          <Link href="/tournaments" className={`${btnSecondary} backdrop-blur-sm`}>
            Tournaments
          </Link>
          <p className="w-full font-mono text-[11px] uppercase tracking-[0.16em] text-[#CBD5E1] sm:ml-2 sm:w-auto">
            Open {HOURS}
          </p>
        </div>
        <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#CBD5E1]">
          {FACTS.filter((f) => !f.startsWith("Open")).map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#C8F400]" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {ready ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause background video" : "Play background video"}
          className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-colors hover:border-white/50"
        >
          {playing ? (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
              <rect x="3" y="2" width="3.5" height="12" rx="1" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
              <path d="M4 2.5v11a.5.5 0 0 0 .77.42l8.5-5.5a.5.5 0 0 0 0-.84l-8.5-5.5A.5.5 0 0 0 4 2.5Z" />
            </svg>
          )}
        </button>
      ) : null}
    </section>
  );
}
