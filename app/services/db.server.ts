import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";

/**
 * Scrbbl's only persistent store. Everything else lives in the session
 * cookie, which is signed, 4KB, and already full.
 *
 * Local development needs no account: an unset TURSO_DATABASE_URL falls back
 * to a SQLite file in the project root. Production without one gets no
 * database at all, and every caller is expected to cope — a missing store
 * costs you the scrobble log, never the scrobble.
 */
const LOCAL_FALLBACK_URL = "file:./scrbbl.db";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS scrobble_batches (
     id              TEXT    PRIMARY KEY,
     username        TEXT    NOT NULL,
     source          TEXT    NOT NULL,
     album           TEXT,
     album_artist    TEXT,
     sent_at         INTEGER NOT NULL,
     accepted        INTEGER NOT NULL,
     ignored         INTEGER NOT NULL,
     ignored_reasons TEXT    NOT NULL DEFAULT '[]'
   )`,
  `CREATE INDEX IF NOT EXISTS scrobble_batches_by_user
     ON scrobble_batches (username, sent_at DESC)`,
  `CREATE TABLE IF NOT EXISTS shelf_albums (
     id          TEXT    PRIMARY KEY,
     username    TEXT    NOT NULL,
     artist      TEXT    NOT NULL,
     title       TEXT    NOT NULL,
     year        INTEGER,
     artwork_url TEXT,
     itunes_id   TEXT,
     mbid        TEXT,
     discogs_id  TEXT,
     -- 1 = a record you own, 0 = one you have only heard. Keeping both in
     -- one table makes "own vs heard" a filter rather than a migration.
     owned       INTEGER NOT NULL DEFAULT 1,
     added_at    INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS shelf_albums_by_user
     ON shelf_albums (username, added_at DESC)`,
  // Added after shelf_albums shipped, so CREATE TABLE IF NOT EXISTS will not
  // introduce them on an existing database. A duplicate-column error here is
  // the expected steady state and is swallowed below.
  `ALTER TABLE shelf_albums ADD COLUMN cover_front TEXT`,
  `ALTER TABLE shelf_albums ADD COLUMN cover_back TEXT`,
  `CREATE TABLE IF NOT EXISTS shelf_reviews (
     album_id        TEXT    PRIMARY KEY,
     -- 1..10, so a five-star scale can carry halves.
     rating          INTEGER,
     body            TEXT,
     first_played_at INTEGER,
     updated_at      INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS scrobble_batch_tracks (
     batch_id  TEXT    NOT NULL,
     position  INTEGER NOT NULL,
     artist    TEXT    NOT NULL,
     track     TEXT    NOT NULL,
     album     TEXT,
     timestamp INTEGER NOT NULL,
     PRIMARY KEY (batch_id, position)
   )`,
];

let warned = false;
let connecting: Promise<Client | null> | null = null;

function resolveUrl(): string | null {
  const configured = process.env.TURSO_DATABASE_URL;
  if (configured) return configured;

  if (process.env.NODE_ENV !== "production") return LOCAL_FALLBACK_URL;

  if (!warned) {
    warned = true;
    console.warn(
      "[scrbbl] TURSO_DATABASE_URL is not set. The scrobble log is disabled; " +
        "scrobbling itself is unaffected."
    );
  }
  return null;
}

async function connect(): Promise<Client | null> {
  const url = resolveUrl();
  if (!url) return null;

  try {
    const client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Cheap and idempotent, so running it on first use beats shipping a
    // migration step somebody has to remember.
    for (const statement of SCHEMA) {
      try {
        await client.execute(statement);
      } catch (error) {
        // ALTER ... ADD COLUMN has no IF NOT EXISTS in SQLite, so re-running
        // it is expected. Anything else is worth knowing about.
        const message = String((error as { message?: unknown })?.message ?? "");
        if (!/duplicate column name/i.test(message)) throw error;
      }
    }

    return client;
  } catch (error) {
    console.error("[scrbbl] could not open the database", error);
    return null;
  }
}

/**
 * The shared client, or null when there is no database to talk to. Memoised,
 * so the schema check runs once per process rather than once per request.
 */
export function getDb(): Promise<Client | null> {
  if (!connecting) {
    connecting = connect().catch((error) => {
      console.error("[scrbbl] database connection failed", error);
      return null;
    });
  }
  return connecting;
}

/** Test seam: drops the memoised client so the next call reconnects. */
export function resetDbForTests() {
  connecting = null;
  warned = false;
}
