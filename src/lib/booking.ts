/**
 * Booking-flow maths on top of the public facility grid — pure, no React, so
 * it can be checked on its own (booking.check.ts).
 */
import type { FacilityCell, FacilityCourt, FacilityGrid } from "./api";

/** 1 h minimum, 4 h maximum, 30-min steps (CLAUDE.md §7). */
export const DURATIONS = [60, 90, 120, 150, 180, 210, 240] as const;
export const GST_RATE = 0.18;

export const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
export const fromMin = (m: number): string =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const durationLabel = (m: number): string =>
  m % 60 === 0 ? `${m / 60} hr` : `${Math.floor(m / 60)}.5 hr`;

export type StartOption = { start: string; end: string; price: number; peak: boolean };

/**
 * Every start time on `courtId` where the whole `durationMin` run of cells is
 * free. Price is summed cell by cell, so a run crossing into peak hours costs
 * what the server will charge for each half hour.
 */
export function startOptions(
  grid: FacilityGrid,
  courtId: string,
  durationMin: number,
): StartOption[] {
  const step = grid.slot_minutes;
  const cells = new Map<number, FacilityCell>();
  for (const c of grid.cells) if (c.court_id === courtId) cells.set(toMin(c.start_time), c);
  const out: StartOption[] = [];
  for (const [start, first] of [...cells.entries()].sort(([a], [b]) => a - b)) {
    if (first.status !== "free") continue;
    let price = 0;
    let peak = false;
    let ok = true;
    for (let t = start; t < start + durationMin; t += step) {
      const c = cells.get(t);
      if (!c || c.status !== "free") {
        ok = false;
        break;
      }
      price += (c.price_per_hour * step) / 60;
      peak ||= c.is_peak;
    }
    if (ok) out.push({ start: fromMin(start), end: fromMin(start + durationMin), price, peak });
  }
  return out;
}

export type CourtLook = "available" | "selected" | "booked" | "closed";

/** How a court reads on the map for the shown day: bookable for 1 h, full, or closed. */
export function courtLook(
  grid: FacilityGrid,
  court: FacilityCourt,
): { look: CourtLook; free: number } {
  if (court.status !== "available") return { look: "closed", free: 0 };
  const free = startOptions(grid, court.id, DURATIONS[0]).length;
  return { look: free > 0 ? "available" : "booked", free };
}

export type DayPart = "Morning" | "Afternoon" | "Evening";
export const dayPart = (hhmm: string): DayPart =>
  toMin(hhmm) < 12 * 60 ? "Morning" : toMin(hhmm) < 17 * 60 ? "Afternoon" : "Evening";

/**
 * Court GST mode — must match the API's COURT_GST_MODE.
 *   inclusive: the grid rate is the all-in price (GST is part of it).
 *   exclusive: the grid rate is the net price; 18% GST is added on top.
 * After a hold, always show the server's own total instead.
 */
export const GST_EXCLUSIVE = process.env.NEXT_PUBLIC_COURT_GST_MODE === "exclusive";

/** What the customer pays for a grid amount. */
export const payable = (gridAmount: number): number =>
  GST_EXCLUSIVE ? Math.round(gridAmount * (1 + GST_RATE) * 100) / 100 : gridAmount;

/** The GST inside a payable total. */
export const gstIncluded = (total: number): number =>
  Math.round(((total * GST_RATE) / (1 + GST_RATE)) * 100) / 100;

export const time12 = (hhmm: string): string => {
  const m = toMin(hhmm);
  const h = Math.floor(m / 60) % 24;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m % 60).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

/** `n` consecutive YYYY-MM-DD dates from `from`. */
export function nextDays(from: string, n: number): string[] {
  const d = new Date(`${from}T12:00:00Z`);
  return Array.from({ length: n }, (_, i) =>
    new Date(d.getTime() + i * 86_400_000).toISOString().slice(0, 10),
  );
}

/** Indian mobile → E.164, or null. Accepts spaces, dashes, a leading 0 or +91. */
export function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

export const isEmail = (s: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
