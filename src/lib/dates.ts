/** Date helpers pinned to Sri Lanka time (UTC+05:30, no daylight saving). */

const TIME_ZONE = "Asia/Colombo";
const OFFSET_MS = 330 * 60 * 1000;

/** Midnight today in Colombo, as a UTC Date. */
export function startOfColomboDay(now: Date): Date {
  const local = new Date(now.getTime() + OFFSET_MS);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - OFFSET_MS);
}

/** Midnight on the 1st of this month in Colombo, as a UTC Date. */
export function startOfColomboMonth(now: Date): Date {
  const local = new Date(now.getTime() + OFFSET_MS);
  local.setUTCDate(1);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - OFFSET_MS);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-LK", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-LK", { timeZone: TIME_ZONE, month: "long", year: "numeric" });
}
