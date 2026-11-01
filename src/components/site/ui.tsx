import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

/** One accent for every primary action, one quiet style for the rest. */
export const btnPrimary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#C8F400] px-6 text-[15px] font-semibold text-[#0A0F1E] transition-[transform,background-color] duration-200 hover:bg-[#D8FF20] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40";
export const btnSecondary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:border-white/35 hover:bg-white/[0.04]";

/** Inner-page header: label, display title, one supporting line, optional actions. */
export function PageIntro({
  title,
  lede,
  children,
}: {
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 md:pb-14 md:pt-16">
      <h1 className="max-w-3xl font-display text-[44px] font-extrabold uppercase leading-[0.92] tracking-[-0.01em] text-white md:text-7xl">
        {title}
      </h1>
      {lede ? (
        <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-[#CBD5E1] md:text-lg">
          {lede}
        </p>
      ) : null}
      {children ? <div className="mt-7 flex flex-wrap gap-3">{children}</div> : null}
    </header>
  );
}

export function SectionHead({
  title,
  action,
}: {
  title: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
      <div>
        <h2 className="font-display text-3xl font-extrabold uppercase leading-[0.95] text-white md:text-5xl">
          {title}
        </h2>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="shrink-0 pb-1 text-sm font-medium text-[#C8F400] underline-offset-4 hover:underline"
        >
          <span className="inline-flex items-center gap-1.5">
            {action.label} <Icon name="arrow-right" className="h-4 w-4" />
          </span>
        </Link>
      ) : null}
    </div>
  );
}

/** Marks anything that is sample data in the local preview. Never shipped data. */
export function SampleBadge({ children = "Sample data" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-amber-200">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-300" />
      {children}
    </span>
  );
}
