import type { LastfmApiTrack } from "lastfmapi";

/** Used when iTunes has no runtime for a track. Three minutes. */
export const FALLBACK_TRACK_MS = 180_000;

/** Last.FM silently drops anything older than roughly two weeks. */
export const MAX_SCROBBLE_AGE_SECONDS = 14 * 24 * 60 * 60;

/** Small grace window so "just now" never reads as the future. */
const FUTURE_GRACE_SECONDS = 60;

export function trackSeconds(track: Pick<LastfmApiTrack, "duration">): number {
  return Math.max(Math.round((track.duration || FALLBACK_TRACK_MS) / 1000), 1);
}

/**
 * Spaces an album backwards from the moment it finished playing, so track one
 * carries the earliest timestamp and the running order on the profile matches
 * the record.
 *
 * Pure on purpose: this is the part worth testing, and it should not drag the
 * Last.FM client in with it.
 */
export function buildAlbumTimestamps<T extends LastfmApiTrack>(
  tracks: T[],
  finishedAtSeconds: number
): Array<T & { timestamp: number }> {
  const timestamped = new Array<T & { timestamp: number }>(tracks.length);
  let cursor = finishedAtSeconds;

  for (let index = tracks.length - 1; index >= 0; index--) {
    const track = tracks[index];
    cursor -= trackSeconds(track);
    timestamped[index] = { ...track, timestamp: cursor };
  }

  return timestamped;
}

/** Total runtime in seconds, used to show the play window before sending. */
export function albumDurationSeconds(
  tracks: Pick<LastfmApiTrack, "duration">[]
): number {
  return tracks.reduce((total, track) => total + trackSeconds(track), 0);
}

/**
 * Returns a human explanation when Last.FM would reject the timestamp, or
 * null when it is fine.
 */
export function validateScrobbleTime(
  timestampSeconds: number,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): string | null {
  if (!Number.isFinite(timestampSeconds)) {
    return "That is not a time we can read. Pick one from the calendar.";
  }
  if (timestampSeconds > nowSeconds + FUTURE_GRACE_SECONDS) {
    return "That time is in the future. Last.FM only accepts listens that have already happened.";
  }
  if (nowSeconds - timestampSeconds > MAX_SCROBBLE_AGE_SECONDS) {
    return "Last.FM refuses scrobbles more than 14 days old.";
  }
  return null;
}
