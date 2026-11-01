export function formatCurrencyINR(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatTime12h(hhmmss: string | null | undefined): string {
  if (!hhmmss) return "—";
  const [hStr, mStr] = hhmmss.split(":");
  const h = Number(hStr);
  const m = Number(mStr ?? "0");
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m.toString().padStart(2, "0");
  return `${h12}:${mm} ${period}`;
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", weekday: "short" });
}

function todayInTz(tz: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}

export function relativeDayLabel(
  iso: string | null | undefined,
  tz = "Asia/Kolkata",
): "TODAY" | "TOMORROW" | "YESTERDAY" | null {
  if (!iso) return null;
  const today = todayInTz(tz);
  if (iso === today) return "TODAY";
  const d = new Date(`${today}T00:00:00`);
  const diff = Math.round((new Date(`${iso}T00:00:00`).getTime() - d.getTime()) / 86400000);
  if (diff === 1) return "TOMORROW";
  if (diff === -1) return "YESTERDAY";
  return null;
}

export function istToday(): string {
  return todayInTz("Asia/Kolkata");
}
