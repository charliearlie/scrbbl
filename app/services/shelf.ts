/**
 * Pure shelf logic. Kept apart from the database layer so the rules about
 * ratings and duplicates are testable without a store, in the same spirit as
 * scrobble-timing and recent-tracks.
 */

/** Ratings are stored 1..10 so a five-star scale can carry halves. */
export const MAX_RATING = 10;

export type ShelfAlbum = {
  id: string;
  artist: string;
  title: string;
  year: number | null;
  artworkUrl: string | null;
  itunesId: string | null;
  /** True for a record you own, false for one you have only heard. */
  owned: boolean;
  addedAt: number;
  review: ShelfReview | null;
};

export type ShelfReview = {
  rating: number | null;
  body: string;
  firstPlayedAt: number | null;
  updatedAt: number;
};

/** Clamps to the stored scale, or null for "not rated". */
export function normaliseRating(value: unknown): number | null {
  const rating = Math.round(Number(value));
  if (!Number.isFinite(rating) || rating <= 0) return null;
  return Math.min(rating, MAX_RATING);
}

/** 1..10 as stars out of five, e.g. 7 -> "3.5". */
export function ratingToStars(rating: number | null): string | null {
  if (rating === null) return null;
  return (rating / 2).toFixed(1).replace(/\.0$/, "");
}

/**
 * Folds an album title for duplicate detection, reusing the same idea as the
 * scrobble duplicate check: pressing qualifiers name a copy, not a record.
 */
const PRESSING_QUALIFIER =
  /\b(remaster(ed)?|deluxe|expanded|anniversary|reissue|mono|stereo|explicit|clean|bonus track)\b/i;
const BRACKETED = /[([][^()[\]]*[)\]]/g;

export function shelfKey(artist: string, title: string): string {
  const fold = (value: string) =>
    (value || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[‘’ʼ]/g, "'")
      .toLowerCase()
      .replace(BRACKETED, (group) =>
        PRESSING_QUALIFIER.test(group) ? " " : group
      )
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  return `${fold(artist)}\u0000${fold(title)}`;
}

/** The year off an iTunes release date, or null when it is unreadable. */
export function releaseYear(releaseDate: string | null | undefined) {
  const year = Number(String(releaseDate ?? "").slice(0, 4));
  return Number.isFinite(year) && year > 1900 ? year : null;
}

/**
 * iTunes hands back 100px artwork. The URL carries its own dimensions, so a
 * bigger copy is a string swap away — worth doing for something that renders
 * as a record sleeve rather than a search result.
 */
export function upscaleArtwork(url: string | null | undefined, size = 600) {
  if (!url) return null;
  return url.replace(/\/\d+x\d+bb\.(jpg|png)$/, `/${size}x${size}bb.$1`);
}

export type ShelfSort = "added" | "artist" | "rating" | "year";

/** Sorts in place-safe fashion; unrated records always sort last by rating. */
export function sortShelf(albums: ShelfAlbum[], sort: ShelfSort): ShelfAlbum[] {
  const sorted = [...albums];

  switch (sort) {
    case "artist":
      return sorted.sort(
        (a, b) =>
          a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title)
      );
    case "year":
      return sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    case "rating":
      return sorted.sort((a, b) => {
        const left = a.review?.rating ?? -1;
        const right = b.review?.rating ?? -1;
        return right - left || a.artist.localeCompare(b.artist);
      });
    default:
      return sorted.sort((a, b) => b.addedAt - a.addedAt);
  }
}
