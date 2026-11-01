"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { CONTACT, NAV, STORES } from "@/lib/site";
import { Icon } from "./Icon";

/**
 * Sticky site header. Activity-first navigation with a permanent Book a Court
 * button (the one job every page must reach in one tap). On phones the links
 * live in a compact sheet; it closes on route change, Escape and backdrop tap.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0F1E]/85 backdrop-blur-xl">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-[#C8F400] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#0A0F1E]"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Pickleball Central — home"
        >
          <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo.png`} alt="" width={40} height={40} priority className="h-10 w-10" />
          <span className="hidden font-display text-[17px] font-extrabold uppercase leading-[0.9] tracking-tight text-white sm:block">
            Pickleball
            <br />
            Central
          </span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`relative rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-200 ${
                isActive(item.href) ? "text-white" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {item.label}
              {isActive(item.href) ? (
                <span className="absolute inset-x-3.5 -bottom-[13px] h-[2px] rounded-full bg-[#C8F400]" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Link
            href="/account"
            className="hidden rounded-full px-3 py-2 text-[14px] font-medium text-[#94A3B8] transition-colors hover:text-white md:block"
          >
            My bookings
          </Link>
          <Link
            href="/play"
            className="inline-flex h-10 items-center rounded-full bg-[#C8F400] px-5 text-[14px] font-semibold text-[#0A0F1E] transition-[transform,background-color] duration-200 hover:bg-[#D8FF20] active:scale-[0.97]"
          >
            Book a Court
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white transition-colors hover:border-white/25 lg:hidden"
          >
            <span className="relative block h-3 w-4" aria-hidden="true">
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-current transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 top-1.5 h-[1.5px] w-4 bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-current transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.nav
              id="mobile-menu"
              aria-label="Main"
              className="absolute inset-x-0 top-16 z-50 border-b border-white/[0.06] bg-[#0A0F1E] px-4 pb-6 pt-2 lg:hidden"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <ul>
                {[...NAV, { label: "My bookings", href: "/account" }].map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduce ? 0 : 0.03 * i, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className="flex items-center justify-between border-b border-white/[0.06] py-3.5 font-display text-[26px] font-extrabold uppercase tracking-tight text-white"
                    >
                      {item.label}
                      <Icon name="arrow-right" className="h-5 w-5 text-[#C8F400]" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2 text-[13px]">
                <a
                  href={CONTACT.phoneHref}
                  className="rounded-full border border-white/10 px-3.5 py-2 text-[#CBD5E1]"
                >
                  Call {CONTACT.phone}
                </a>
                <a
                  href={STORES.android}
                  className="rounded-full border border-white/10 px-3.5 py-2 text-[#CBD5E1]"
                >
                  Android app
                </a>
                <a
                  href={STORES.ios}
                  className="rounded-full border border-white/10 px-3.5 py-2 text-[#CBD5E1]"
                >
                  iPhone app
                </a>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
