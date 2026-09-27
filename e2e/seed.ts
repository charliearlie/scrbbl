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
  }
) {
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  await db.execute({
    sql: `INSERT INTO shelf_albums
            (id, username, artist, title, year, artwork_url, itunes_id,
             cover_front, cover_back, owned, added_at)
          VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, 1, ?)`,
    args: [
      id,
      username,
      record.artist,
      record.title,
      record.year ?? null,
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
