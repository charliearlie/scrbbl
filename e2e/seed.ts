import { createClient } from "@libsql/client";

/**
 * Writes a record straight into the test database.
 *
 * End-to-end tests should exercise the real search once, not six times — the
 * iTunes API is a third party and hammering it makes the suite flaky for
 * reasons that have nothing to do with this app.
 */
const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./e2e-scrbbl.db",
});

export async function seedRecord(
  username: string,
  record: {
    artist: string;
    title: string;
    year?: number;
    rating?: number;
    body?: string;
    coverFront?: string;
    coverBack?: string;
    /** Pass null to let the record page look the sleeve up for real. */
    mbid?: string | null;
  }
) {
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  await db.execute({
    sql: `INSERT INTO shelf_albums
            (id, username, artist, title, year, artwork_url, itunes_id,
             mbid, cover_front, cover_back, owned, added_at)
          VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, 1, ?)`,
    args: [
      id,
      username,
      record.artist,
      record.title,
      record.year ?? null,
      // A non-null mbid means "already looked up", which keeps the record
      // page from calling MusicBrainz and overwriting these seeded values.
      record.mbid ?? `seeded-${id}`,
      record.coverFront ?? null,
      record.coverBack ?? null,
      now,
    ],
  });

  if (record.rating !== undefined || record.body !== undefined) {
    await db.execute({
      sql: `INSERT INTO shelf_reviews (album_id, rating, body, first_played_at, updated_at)
            VALUES (?, ?, ?, NULL, ?)`,
      args: [id, record.rating ?? null, record.body ?? "", now],
    });
  }

  return id;
}
