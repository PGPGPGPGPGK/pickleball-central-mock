"use client";

import Image from "next/image";

import type { CourtLook } from "@/lib/booking";
import { Icon } from "@/components/site/Icon";

/**
 * Top-down venue map — the web twin of the mobile app's VenueCourtMap, same
 * artwork, same geometry, same court order (apps/mobile/src/lib/venue-layout.ts
 * on the mobile redesign branch; keep the two in step):
 *
 *   COURT 1 | COURT 2      <- Nail Studio end
 *   COURT 4 | COURT 3      <- entrance end
 *   walkway on the left, entrance at the bottom
 *
 * The art's baked courts carry demo numbering (3 | 4) and fake states, so a
 * live SVG court is always drawn over every slot. Buttons, not the raster,
 * are the touch targets.
 */
const ART = { w: 441, h: 621 };
type Box = { x: number; y: number; w: number; h: number };
type Slot = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

const SLOT_FOR_COURT: Record<number, Slot> = {
  1: "topLeft",
  2: "topRight",
  4: "bottomLeft",
  3: "bottomRight",
};
const CELLS: Record<Slot, Box> = {
  topLeft: { x: 161, y: 147, w: 126, h: 204 },
  topRight: { x: 296, y: 147, w: 131, h: 204 },
  bottomLeft: { x: 161, y: 359, w: 126, h: 190 },
  bottomRight: { x: 296, y: 359, w: 131, h: 190 },
};
const SIGNS: { label: string; kind: "board" | "plate" | "entrance"; box: Box }[] = [
  { label: "Nail Studio", kind: "board", box: { x: 24, y: 64, w: 82, h: 52 } },
  { label: "Indoor Seating", kind: "plate", box: { x: 6, y: 256, w: 108, h: 30 } },
  { label: "Mini AlleyPally", kind: "plate", box: { x: 16, y: 327, w: 105, h: 81 } },
  { label: "Patio Seating", kind: "plate", box: { x: 17, y: 479, w: 98, h: 27 } },
  { label: "Entrance", kind: "entrance", box: { x: 19, y: 558, w: 99, h: 63 } },
];
const TITLE: Box = { x: 132, y: 12, w: 304, h: 84 };

const pct = (b: Box) => ({
  left: `${(b.x / ART.w) * 100}%`,
  top: `${(b.y / ART.h) * 100}%`,
  width: `${(b.w / ART.w) * 100}%`,
  height: `${(b.h / ART.h) * 100}%`,
});
/** Font size in art pixels → container-relative, so text scales with the map. */
const cq = (px: number) => `${(px / ART.w) * 100}cqw`;

export type MapCourt = { id: string; number: number; look: CourtLook; detail: string };

const STATE: Record<CourtLook, string> = {
  available: "available",
  selected: "selected",
  booked: "fully booked",
  closed: "closed",
};

export function CourtMap({
  courts,
  onSelect,
  dayLabel,
  loading,
}: {
  courts: MapCourt[];
  onSelect: (id: string) => void;
  dayLabel: string;
  loading: boolean;
}) {
  const bySlot = new Map<Slot, MapCourt>();
  const unplaced: MapCourt[] = [];
  for (const c of courts) {
    const slot = SLOT_FOR_COURT[c.number];
    if (slot && !bySlot.has(slot)) bySlot.set(slot, c);
    else unplaced.push(c);
  }

  return (
    <div>
      <div
        className="relative w-full overflow-hidden rounded-3xl bg-[#103028] [container-type:inline-size]"
        style={{ aspectRatio: `${ART.w} / ${ART.h}` }}
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/booking/venue-night.webp`}
          alt="Venue map. Four courts in two rows: Court 1 and Court 2 at the top, Court 4 and Court 3 nearest the entrance. The walkway runs along the left with the entrance at the bottom; from the entrance up: Patio Seating, Mini AlleyPally, Indoor Seating, Nail Studio."
          fill
          priority
          sizes="(min-width: 1024px) 460px, 100vw"
          className="object-fill"
        />
        <svg
          viewBox={`0 0 ${ART.w} ${ART.h}`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="surface" cx="50%" cy="50%" r="60%">
              <stop offset="0" stopColor="#1F6E66" />
              <stop offset="1" stopColor="#155953" />
            </radialGradient>
            <radialGradient id="turf" cx="50%" cy="50%" r="70%">
              <stop offset="0.55" stopColor="#1C4B20" />
              <stop offset="1" stopColor="#123316" />
            </radialGradient>
          </defs>
          {(Object.keys(CELLS) as Slot[]).map((slot) => (
            <CourtGraphic
              key={slot}
              box={CELLS[slot]}
              look={bySlot.get(slot)?.look ?? "available"}
            />
          ))}
        </svg>

        <div
          className="pointer-events-none absolute flex flex-col items-center justify-center text-center"
          style={pct(TITLE)}
        >
          <p
            className="font-display font-extrabold uppercase text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]"
            style={{ fontSize: cq(26), lineHeight: 1.05 }}
          >
            Choose your court
          </p>
          <p
            className="mt-[1cqw] text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]"
            style={{ fontSize: `max(11px, ${cq(12.5)})` }}
          >
            Showing {dayLabel} · pick the day next
          </p>
        </div>

        {SIGNS.map((s) => (
          <div
            key={s.label}
            aria-hidden="true"
            className={`pointer-events-none absolute flex flex-col items-center justify-center whitespace-nowrap rounded-[0.7cqw] px-[0.7cqw] text-center font-bold leading-tight ${
              s.kind === "board"
                ? "text-[#2A211C]"
                : s.kind === "entrance"
                  ? "bg-[#0E5A3D] text-white"
                  : "bg-[#1B2226] text-white"
            }`}
            style={{
              ...pct(s.box),
              // Signs are decorative (aria-hidden) and must fit their plates.
              fontSize: `max(10px, ${cq(s.kind === "plate" && s.label !== "Mini AlleyPally" ? 10.5 : 12.5)})`,
            }}
          >
            {s.label}
            {s.kind === "entrance" ? (
              <Icon name="arrow-up" className="h-[1.4em] w-[1.4em]" strokeWidth={2.6} />
            ) : null}
          </div>
        ))}

        {(Object.keys(CELLS) as Slot[]).map((slot) => {
          const c = bySlot.get(slot);
          if (!c) return null;
          const closed = c.look === "closed";
          const full = c.look === "booked";
          return (
            <button
              key={c.id}
              type="button"
              disabled={loading || closed}
              onClick={() => onSelect(c.id)}
              aria-pressed={c.look === "selected"}
              aria-label={`Court ${c.number}, ${full ? `fully booked ${dayLabel}` : STATE[c.look]}. ${c.detail}`}
              className="group absolute rounded-[1.8cqw] outline-none transition-colors duration-150 hover:bg-white/[0.07] focus-visible:ring-[0.8cqw] focus-visible:ring-[#C8F400] disabled:cursor-not-allowed"
              style={pct(CELLS[slot])}
            >
              <span className="absolute inset-x-0 top-[64%] flex justify-center">
                <span
                  className={`flex flex-col items-center rounded-[1.4cqw] border bg-[#08100F]/90 px-[2cqw] py-[0.9cqw] transition-transform duration-150 group-hover:scale-105 group-active:scale-95 ${
                    c.look === "selected" ? "border-[#59FF81]" : "border-transparent"
                  }`}
                >
                  <span
                    className="whitespace-nowrap font-semibold text-white"
                    style={{ fontSize: `max(12px, ${cq(14)})` }}
                  >
                    {c.look === "selected" ? (
                      <Icon
                        name="check"
                        className="mr-0.5 inline h-[1em] w-[1em] text-[#59FF81]"
                        strokeWidth={3}
                      />
                    ) : null}
                    Court {c.number}
                  </span>
                  {full || closed ? (
                    <span
                      className={full ? "text-[#FF7A8C]" : "text-[#C9D1CE]"}
                      style={{ fontSize: `max(11px, ${cq(11.5)})` }}
                    >
                      {full ? `Full ${dayLabel}` : "Closed"}
                    </span>
                  ) : (
                    <span className="text-[#9BE8B0]" style={{ fontSize: `max(11px, ${cq(11.5)})` }}>
                      {c.detail}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}

        {loading ? (
          <div className="absolute inset-x-0 top-[24%] flex justify-center" aria-hidden="true">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" />
          </div>
        ) : null}
      </div>

      <ul
        className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#CBD5E1]"
        aria-label="Map legend"
      >
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#099965]" aria-hidden="true" />
          Available
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ED4568]" aria-hidden="true" />
          Fully booked
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#5B6563]" aria-hidden="true" />
          Closed
        </li>
        <li className="flex items-center gap-1.5">
          <Icon name="arrow-up" className="h-3.5 w-3.5 text-[#C8F400]" strokeWidth={2.6} />
          Entrance
        </li>
      </ul>

      {unplaced.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {unplaced.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={loading || c.look === "closed"}
              onClick={() => onSelect(c.id)}
              className="rounded-xl border border-white/15 px-3 py-2 text-sm text-white"
            >
              Court {c.number} · {STATE[c.look]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** One top-down court: turf, lit surface, regulation lines, net, state overlay. */
function CourtGraphic({ box, look }: { box: Box; look: CourtLook }) {
  const ix = box.w * 0.12;
  const iy = box.h * 0.12;
  const L = box.x + ix;
  const T = box.y + iy;
  const W = box.w - ix * 2;
  const H = box.h - iy * 2;
  const netY = T + H / 2;
  const kitchen = (H / 2) * (7 / 22);
  const cx = L + W / 2;
  const line = { stroke: "#E4ECE8", strokeWidth: 1.6 };
  const off = look === "booked" || look === "closed";
  const r = Math.min(W, H) * 0.12;
  const iy2 = netY - H * 0.16;
  const tone = look === "booked" ? "#FF6B80" : "#C9D1CE";
  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="url(#turf)" />
      <rect x={L} y={T} width={W} height={H} fill="url(#surface)" />
      <rect x={L} y={T} width={W} height={H} fill="none" {...line} />
      <line x1={L} y1={netY - kitchen} x2={L + W} y2={netY - kitchen} {...line} />
      <line x1={L} y1={netY + kitchen} x2={L + W} y2={netY + kitchen} {...line} />
      <line x1={cx} y1={T} x2={cx} y2={netY - kitchen} {...line} />
      <line x1={cx} y1={netY + kitchen} x2={cx} y2={T + H} {...line} />
      <rect x={L - 4} y={netY + 1.4} width={W + 8} height={4} fill="#000" opacity={0.28} />
      <rect x={L - 4} y={netY - 1.8} width={W + 8} height={3.6} fill="#25302F" />
      <line
        x1={L - 4}
        y1={netY - 1.8}
        x2={L + W + 4}
        y2={netY - 1.8}
        stroke="#E9EFEC"
        strokeWidth={0.9}
      />
      <circle cx={L - 4.5} cy={netY} r={2} fill="#D7DEDB" />
      <circle cx={L + W + 4.5} cy={netY} r={2} fill="#D7DEDB" />
      {off ? (
        <>
          <rect
            x={L}
            y={T}
            width={W}
            height={H}
            fill={look === "booked" ? "#C2263F" : "#2B3331"}
            opacity={look === "booked" ? 0.55 : 0.62}
          />
          <rect
            x={L}
            y={T}
            width={W}
            height={H}
            fill="none"
            stroke={look === "booked" ? "#FF5A70" : "#9AA6A2"}
            strokeWidth={1.8}
          />
          <circle cx={cx} cy={iy2} r={r} fill="none" stroke={tone} strokeWidth={2.4} />
          <line
            x1={cx - r * 0.7}
            y1={iy2 - r * 0.7}
            x2={cx + r * 0.7}
            y2={iy2 + r * 0.7}
            stroke={tone}
            strokeWidth={2.4}
          />
        </>
      ) : null}
      {look === "selected" ? (
        <>
          {[13, 8.5, 4.5].map((w, i) => (
            <rect
              key={w}
              x={L - 3}
              y={T - 3}
              width={W + 6}
              height={H + 6}
              rx={6}
              fill="none"
              stroke="#45FA7D"
              strokeWidth={w}
              opacity={[0.1, 0.2, 0.38][i]}
            />
          ))}
          <rect
            x={L - 3}
            y={T - 3}
            width={W + 6}
            height={H + 6}
            rx={6}
            fill="none"
            stroke="#59FF81"
            strokeWidth={2.2}
          />
        </>
      ) : null}
    </g>
  );
}
