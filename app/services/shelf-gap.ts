import { shelfKey } from "./shelf";
import type { ShelfAlbum } from "./shelf";

/**
 * The gap between what you own and what you play.
 *
 * Scrbbl is the only thing that knows both sides of this: Discogs knows a
 * collection, Last.FM knows a listening history, and neither knows the other.
 * Pure so the matching rules are testable without either API.
 */

/** Last.FM's own vocabulary for how far back to count. */
export const PERIODS = [
  { value: "1month", label: "Last month" },
  { value: "3month", label: "Last 3 months" },
  { value: "12month", label: "Last year" },
  { value: "overall", label: "All time" },
] as const;

export type Period = typeof PERIODS[number]["value"];

export function isPeriod(value: string | null): value is Period {
  return PERIODS.some((period) => period.value === value);
}

export type PlayedAlbum = {
  artist: string;
  title: string;
  playcount: number;
  artworkUrl: string | null;
  url: string;
};

export type Unowned = PlayedAlbum;

export type Unplayed = {
  album: ShelfAlbum;
  playcount: number;
};

/** Albums you play often that are not on the shelf, most played first. */
export function findUnowned(
  played: PlayedAlbum[],
  shelf: ShelfAlbum[],
  minPlaycount = 5
): Unowned[] {
  const owned = new Set(shelf.map((a) => shelfKey(a.artist, a.title)));

  return played
    .filter(
      (album) =>
        album.playcount >= minPlaycount &&
        !owned.has(shelfKey(album.artist, album.title))
    )
    .sort((a, b) => b.playcount - a.playcount);
}

/**
 * Records on the shelf you barely play, least played first.
 *
 * Absence from the top-albums list means "below the threshold", never "zero" —
 * the list is truncated — so a missing album reads as 0 here and the caller
 * should say "rarely", not "never".
 */
export function findUnplayed(
  shelf: ShelfAlbum[],
  played: PlayedAlbum[],
  maxPlaycount = 2
): Unplayed[] {
  const plays = new Map<string, number>();
  for (const album of played) {
    plays.set(shelfKey(album.artist, album.title), album.playcount);
  }

  return shelf
    .map((album) => ({
      album,
      playcount: plays.get(shelfKey(album.artist, album.title)) ?? 0,
    }))
    .filter((row) => row.playcount <= maxPlaycount)
    .sort((a, b) => a.playcount - b.playcount);
}
