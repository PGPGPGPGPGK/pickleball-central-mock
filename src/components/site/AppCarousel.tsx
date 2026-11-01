"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { APP_SCREENS } from "@/lib/site";
import { Icon } from "./Icon";

/**
 * Screenshot carousel on native scroll-snap: swipe on touch, arrows or the
 * keyboard (the strip is focusable) elsewhere. Every phone frame reserves its
 * size up front, so nothing shifts while the images load.
 */
export function AppCarousel() {
  const strip = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const n = APP_SCREENS.length;

  const goTo = (i: number) => {
    const el = strip.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div>
      <ul
        ref={strip}
        tabIndex={0}
        aria-label="App screenshots"
        onScroll={(e) => {
          const el = e.currentTarget;
          const w = el.scrollWidth / n;
          setIndex(Math.min(n - 1, Math.round(el.scrollLeft / w)));
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto rounded-3xl px-[12%] pb-2 outline-none focus-visible:ring-2 focus-visible:ring-[#C8F400] motion-reduce:scroll-auto sm:px-0 [scrollbar-width:none]"
      >
        {APP_SCREENS.map((s, i) => (
          <li
            key={s.src}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}: ${s.caption}`}
            className="w-[76%] shrink-0 snap-center sm:w-[260px]"
          >
            <div className="rounded-[2.2rem] border border-white/10 bg-[#111827] p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
              <div
                className={`relative overflow-hidden rounded-[1.8rem] bg-[#0A0F1E] ${s.crop ? "aspect-[720/1000]" : "aspect-[720/1566]"}`}
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  loading={i === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 640px) 260px, 76vw"
                  className="object-cover object-top"
                  unoptimized
                />
                {s.crop ? (
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111827] to-transparent"
                  />
                ) : null}
              </div>
            </div>
            <p className="mt-3 text-center text-sm text-[#CBD5E1]">{s.caption}</p>
          </li>
        ))}
      </ul>
      {n > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-3 sm:hidden">
          <button
            type="button"
            aria-label="Previous screenshot"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white disabled:opacity-30"
          >
            <Icon name="arrow-left" />
          </button>
          <div className="flex gap-1.5" aria-hidden="true">
            {APP_SCREENS.map((s, i) => (
              <span
                key={s.src}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-[#C8F400]" : "w-1.5 bg-white/25"}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next screenshot"
            disabled={index === n - 1}
            onClick={() => goTo(index + 1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white disabled:opacity-30"
          >
            <Icon name="arrow-right" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
