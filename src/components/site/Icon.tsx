/** The handful of drawn icons the site needs — one 24px grid, one stroke. */
const PATHS = {
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
  "arrow-left": "M19 12H5M11 6l-6 6 6 6",
  "arrow-up": "M12 19V5M6 11l6-6 6 6",
  "arrow-down": "M12 5v14M6 13l6 6 6-6",
  check: "M5 12.5l4.5 4.5L19 7",
  close: "M6 6l12 12M18 6L6 18",
} as const;

export function Icon({
  name,
  className = "h-4 w-4",
  strokeWidth = 2,
}: {
  name: keyof typeof PATHS;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
