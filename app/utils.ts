import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function forEachRight<T>(
  array: T[],
  callback: (value: T, index: number, array: T[]) => void
): void {
  for (let index = array.length - 1; index >= 0; index--) {
    callback(array[index], index, array);
  }
}

export const capitalise = (str: string) => {
  const firstCharacter = str[0].toUpperCase();
  const remainingString = str.slice(1).toLowerCase();

  return `${firstCharacter}${remainingString}`;
};

/**
 * Formats a Date for a `datetime-local` input in the *viewer's* timezone.
 *
 * `toISOString().slice(0, 16)` was used before, which is UTC: anyone outside
 * UTC was handed a default time an hour or more out from the clock on their
 * wall.
 */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * Turns a `datetime-local` value into unix seconds.
 *
 * A datetime string with no offset is parsed in the local zone, so this must
 * run in the browser to mean what the user meant. The forms submit the result
 * as a hidden field rather than letting the server parse the string in
 * whatever zone the server happens to be in.
 */
export function dateTimeLocalToSeconds(value: string): number {
  const milliseconds = new Date(value).getTime();
  return Number.isNaN(milliseconds)
    ? Number.NaN
    : Math.floor(milliseconds / 1000);
}

/**
 * Thousands separators with a pinned locale.
 *
 * `toLocaleString()` with no locale uses the runtime's default, which differs
 * between the server and the browser and makes React complain about mismatched
 * text during hydration.
 */
const countFormatter = new Intl.NumberFormat("en-GB");

export function formatCount(value: string | number | undefined): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (numeric === undefined || Number.isNaN(numeric)) return "0";
  return countFormatter.format(numeric);
}

/** Seconds to `m:ss`, or `h:mm:ss` once it runs past an hour. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(Math.round(totalSeconds), 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}
