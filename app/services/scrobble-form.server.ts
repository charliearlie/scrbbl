import { validateScrobbleTime } from "./scrobble-timing";

/**
 * Every failed scrobble answers with the same shape. Two different failure
 * objects made the action's return type a union that TypeScript could not
 * narrow at the call site.
 */
export type ScrobbleFailure = {
  ok: false;
  error?: string;
  timeError?: string;
};

export function readTrimmed(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export type ResolvedTime =
  | { ok: true; timestamp: number }
  | { ok: false; error: string };

/**
 * Works out when the listen happened.
 *
 * The form computes the value in the browser and sends it as `timestamp`,
 * because a bare `datetime-local` string carries no timezone and the server
 * would otherwise read "21:22" as 21:22 UTC. `datetime` is the fallback for a
 * submission that arrives without JavaScript.
 */
export function resolveScrobbleTime(formData: FormData): ResolvedTime {
  const nowSeconds = Math.floor(Date.now() / 1000);

  const submitted = Number(formData.get("timestamp"));
  const datetime = readTrimmed(formData, "datetime");

  let timestamp: number;

  if (Number.isFinite(submitted) && submitted > 0) {
    timestamp = Math.floor(submitted);
  } else if (datetime) {
    const parsed = new Date(datetime).getTime();
    if (Number.isNaN(parsed)) {
      return { ok: false, error: "That time could not be read." };
    }
    timestamp = Math.floor(parsed / 1000);
  } else {
    timestamp = nowSeconds;
  }

  // A browser clock running fast would otherwise push "just now" into the
  // future, which Last.FM drops without explanation.
  timestamp = Math.min(timestamp, nowSeconds);

  const error = validateScrobbleTime(timestamp, nowSeconds);
  if (error) return { ok: false, error };

  return { ok: true, timestamp };
}
