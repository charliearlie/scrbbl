import { describe, expect, it } from "vitest";
import type { LastfmApiTrack } from "lastfmapi";
import {
  albumDurationSeconds,
  buildAlbumTimestamps,
  FALLBACK_TRACK_MS,
  validateScrobbleTime,
} from "./scrobble-timing";

const track = (name: string, ms?: number): LastfmApiTrack => ({
  artist: "Wolf Alice",
  track: name,
  duration: ms,
});

// 21:22 exactly, as unix seconds.
const FINISHED_AT = 1_758_489_720;

describe("buildAlbumTimestamps", () => {
  it("puts track one earliest and the last track nearest the finish time", () => {
    const tracks = [
      track("The Beach", 155_000),
      track("Delicious Things", 304_000),
      track("Lipstick on the Glass", 247_000),
    ];

    const result = buildAlbumTimestamps(tracks, FINISHED_AT);

    expect(result[0].timestamp).toBeLessThan(result[1].timestamp!);
    expect(result[1].timestamp).toBeLessThan(result[2].timestamp!);
    // The last track starts its own runtime before the album ended.
    expect(result[2].timestamp).toBe(FINISHED_AT - 247);
  });

  it("spaces each track by its own runtime", () => {
    const tracks = [track("One", 120_000), track("Two", 240_000)];

    const [first, second] = buildAlbumTimestamps(tracks, FINISHED_AT);

    expect(second.timestamp! - first.timestamp!).toBe(120);
  });

  it("falls back to three minutes when iTunes has no runtime", () => {
    const [only] = buildAlbumTimestamps([track("Unknown")], FINISHED_AT);

    expect(only.timestamp).toBe(FINISHED_AT - FALLBACK_TRACK_MS / 1000);
  });

  it("leaves the source tracks untouched", () => {
    const tracks = [track("One", 120_000)];
    buildAlbumTimestamps(tracks, FINISHED_AT);

    expect(tracks[0].timestamp).toBeUndefined();
  });

  it("handles an empty tracklist", () => {
    expect(buildAlbumTimestamps([], FINISHED_AT)).toEqual([]);
  });
});

describe("albumDurationSeconds", () => {
  it("totals the runtimes", () => {
    expect(
      albumDurationSeconds([track("One", 155_000), track("Two", 304_000)])
    ).toBe(459);
  });

  it("counts the fallback for tracks with no runtime", () => {
    expect(albumDurationSeconds([track("Unknown")])).toBe(180);
  });
});

describe("validateScrobbleTime", () => {
  const now = FINISHED_AT;

  it("accepts a listen that already happened", () => {
    expect(validateScrobbleTime(now - 3600, now)).toBeNull();
  });

  it("rejects the future", () => {
    expect(validateScrobbleTime(now + 3600, now)).toMatch(/future/i);
  });

  it("allows a minute of grace so 'just now' is never the future", () => {
    expect(validateScrobbleTime(now + 30, now)).toBeNull();
  });

  it("rejects anything older than fourteen days", () => {
    const fifteenDays = now - 15 * 24 * 60 * 60;
    expect(validateScrobbleTime(fifteenDays, now)).toMatch(/14 days/i);
  });

  it("rejects an unreadable time", () => {
    expect(validateScrobbleTime(Number.NaN, now)).toMatch(/cannot|not a time/i);
  });
});
