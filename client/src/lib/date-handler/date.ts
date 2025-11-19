import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

const UKRAINE_TZ = "Europe/Kyiv";

/**
 * Converts a local Ukrainian date (YYYY-MM-DD or Date object)
 * into a UTC ISO string before sending to backend
 */
export function toUtcForApi(input: string | Date | null): string | null {
  if (!input) return null;
  const date = typeof input === "string" ? new Date(input) : input;
  return fromZonedTime(date, UKRAINE_TZ).toISOString();
}

/**
 * Converts a UTC date from backend into local Ukrainian time
 */
export function fromUtcApi(utcString: string): string {
  return formatInTimeZone(utcString, UKRAINE_TZ, "yyyy-MM-dd HH:mm:ss");
}

/**
 * Format for date-only fields (forms)
 */
export function formatDateOnlyForInput(utcString: string | null): string {
  if (!utcString) return "";
  return formatInTimeZone(utcString, UKRAINE_TZ, "yyyy-MM-dd");
}

/**
 * Now in Ukrainian time
 */
export function nowUkraine(): string {
  return formatInTimeZone(new Date(), UKRAINE_TZ, "yyyy-MM-dd HH:mm:ss");
}