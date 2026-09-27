import { getDb } from "./db.server";
import { normaliseRating, shelfKey } from "./shelf";
import type { ShelfAlbum } from "./shelf";

// Deliberately NOT re-exporting the pure helpers from "./shelf".
//
// Remix strips a `.server` module out of the client bundle, so anything
// re-exported here is `undefined` in the browser and a component using it
// crashes at render — which TypeScript cannot see and unit tests never hit.
// Client code imports those from "~/services/shelf" instead.
export type { ShelfAlbum, ShelfReview, ShelfSort } from "./shelf";

type Row = Record<string, unknown>;

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toAlbum(row: Row): ShelfAlbum {
  const rating =
    row.rating === null || row.rating === undefined ? null : Number(row.rating);

  const hasReview =
    row.review_updated_at !== null && row.review_updated_at !== undefined;

  return {
    id: String(row.id),
    artist: String(row.artist),
    title: String(row.title),
    year: row.year === null || row.year === undefined ? null : Number(row.year),
    artworkUrl: row.artwork_url === null ? null : String(row.artwork_url ?? ""),
    coverFront: row.cover_front == null ? null : String(row.cover_front),
    coverBack: row.cover_back == null ? null : String(row.cover_back),
    mbid: row.mbid == null ? null : String(row.mbid),
    itunesId: row.itunes_id === null ? null : String(row.itunes_id ?? ""),
    owned: Number(row.owned) === 1,
    addedAt: Number(row.added_at),
    review: hasReview
      ? {
          rating,
          body: String(row.body ?? ""),
          firstPlayedAt:
            row.first_played_at === null || row.first_played_at === undefined
              ? null
              : Number(row.first_played_at),
          updatedAt: Number(row.review_updated_at),
        }
      : null,
  };
}

const SELECT = `
  SELECT a.id, a.artist, a.title, a.year, a.artwork_url, a.itunes_id,
         a.owned, a.added_at, a.cover_front, a.cover_back, a.mbid,
         r.rating, r.body, r.first_played_at,
         r.updated_at AS review_updated_at
    FROM shelf_albums a
    LEFT JOIN shelf_reviews r ON r.album_id = a.id
`;

export async function getShelf(username: string): Promise<ShelfAlbum[]> {
  if (!username) return [];

  try {
    const db = await getDb();
    if (!db) return [];

    const result = await db.execute({
      sql: `${SELECT} WHERE a.username = ? ORDER BY a.added_at DESC`,
      args: [username],
    });

    return result.rows.map((row) => toAlbum(row as Row));
  } catch (error) {
    console.error("[scrbbl] could not read the shelf", error);
    return [];
  }
}

export async function getShelfAlbum(
  username: string,
  id: string
): Promise<ShelfAlbum | null> {
  if (!username || !id) return null;

  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db.execute({
      sql: `${SELECT} WHERE a.username = ? AND a.id = ? LIMIT 1`,
      args: [username, id],
    });

    const row = result.rows[0];
    return row ? toAlbum(row as Row) : null;
  } catch (error) {
    console.error("[scrbbl] could not read that record", error);
    return null;
  }
}

/**
 * Finds a record already on the shelf that looks like this one, so adding
 * the same album twice can warn rather than quietly duplicate it. Matching
 * ignores pressing qualifiers, so "Blue Weekend (Deluxe)" finds "Blue
 * Weekend" — deliberately, since the usual case is adding the same record
 * twice by accident rather than owning two copies.
 */
export async function findOnShelf(
  username: string,
  artist: string,
  title: string
): Promise<ShelfAlbum | null> {
  const wanted = shelfKey(artist, title);
  const shelf = await getShelf(username);
  return (
    shelf.find((album) => shelfKey(album.artist, album.title) === wanted) ??
    null
  );
}

export type AddToShelfInput = {
  username: string;
  artist: string;
  title: string;
  year?: number | null;
  artworkUrl?: string | null;
  itunesId?: string | null;
  owned?: boolean;
};

export type AddResult = { ok: true; id: string } | { ok: false; error: string };

export async function addToShelf(input: AddToShelfInput): Promise<AddResult> {
  const artist = text(input.artist);
  const title = text(input.title);

  if (!input.username) return { ok: false, error: "You need to be logged in." };
  if (!artist || !title) {
    return { ok: false, error: "A record needs an artist and a title." };
  }

  try {
    const db = await getDb();
    if (!db) {
      return {
        ok: false,
        error: "The shelf needs a database, and there isn't one configured.",
      };
    }

    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO shelf_albums
              (id, username, artist, title, year, artwork_url, itunes_id,
               owned, added_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        input.username,
        artist,
        title,
        Number.isFinite(input.year as number) ? Number(input.year) : null,
        text(input.artworkUrl),
        text(input.itunesId),
        input.owned === false ? 0 : 1,
        Math.floor(Date.now() / 1000),
      ],
    });

    return { ok: true, id };
  } catch (error) {
    console.error("[scrbbl] could not add to the shelf", error);
    return { ok: false, error: "That record could not be added. Try again." };
  }
}

export async function removeFromShelf(username: string, id: string) {
  if (!username || !id) return;

  try {
    const db = await getDb();
    if (!db) return;

    // Scoped by username so an id from elsewhere cannot reach another shelf.
    await db.batch([
      {
        sql: `DELETE FROM shelf_reviews
               WHERE album_id IN
                 (SELECT id FROM shelf_albums WHERE id = ? AND username = ?)`,
        args: [id, username],
      },
      {
        sql: `DELETE FROM shelf_albums WHERE id = ? AND username = ?`,
        args: [id, username],
      },
    ]);
  } catch (error) {
    console.error("[scrbbl] could not remove that record", error);
  }
}

export type SaveReviewInput = {
  username: string;
  albumId: string;
  rating?: unknown;
  body?: string;
  firstPlayedAt?: number | null;
};

export async function saveReview(input: SaveReviewInput): Promise<boolean> {
  if (!input.username || !input.albumId) return false;

  try {
    const db = await getDb();
    if (!db) return false;

    // Confirm the record is on this user's shelf before writing a review for it.
    const owner = await db.execute({
      sql: `SELECT 1 FROM shelf_albums WHERE id = ? AND username = ? LIMIT 1`,
      args: [input.albumId, input.username],
    });
    if (owner.rows.length === 0) return false;

    await db.execute({
      sql: `INSERT INTO shelf_reviews
              (album_id, rating, body, first_played_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(album_id) DO UPDATE SET
              rating = excluded.rating,
              body = excluded.body,
              first_played_at = excluded.first_played_at,
              updated_at = excluded.updated_at`,
      args: [
        input.albumId,
        normaliseRating(input.rating),
        text(input.body) ?? "",
        Number.isFinite(input.firstPlayedAt as number)
          ? Number(input.firstPlayedAt)
          : null,
        Math.floor(Date.now() / 1000),
      ],
    });

    return true;
  } catch (error) {
    console.error("[scrbbl] could not save that review", error);
    return false;
  }
}
