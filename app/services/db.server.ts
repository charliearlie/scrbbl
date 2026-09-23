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
      await client.execute(statement);
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
