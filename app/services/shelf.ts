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
  /** The Cover Art Archive scan, when there is one. Preferred over iTunes. */
  coverFront: string | null;
  coverBack: string | null;
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

/**
 * A stable spine colour for a record.
 *
 * Deliberately not sampled from the artwork. Extracting a palette server-side
 * means shipping an image decoder — node-vibrant pulls in Jimp — for a band
 * about ten pixels wide that is mostly seen edge-on. What the spine actually
 * needs is to be distinct and stable per record, which a hash gives for free,
 * and which also works for a record that has no artwork at all.
 *
 * Saturation and lightness are fixed low so the shelf reads as a row of
 * cardboard spines rather than a paint chart, and so nothing competes with
 * the one accent colour the app uses.
 */
export function spineColour(artist: string, title: string): string {
  const source = `${artist}\u0000${title}`;

  // FNV-1a: short, well-spread, and stable across machines.
  let hash = 0x811c9dc5;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 32% 34%)`;
}

/** The best image we have: a real scan if one was found, else iTunes. */
export function sleeveImage(
  album: Pick<ShelfAlbum, "coverFront" | "artworkUrl">
) {
  return album.coverFront ?? album.artworkUrl;
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
