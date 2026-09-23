import type { LastfmApiTrack } from "lastfmapi";

import { getDb } from "./db.server";

/** Where a batch came from. New sources get added here as they land. */
export type ScrobbleSource = "album" | "manual" | "bbc" | "paste";

export type LoggedTrack = {
  artist: string;
  track: string;
  album: string | null;
  timestamp: number;
};

export type LoggedBatch = {
  id: string;
  source: ScrobbleSource;
  album: string | null;
  albumArtist: string | null;
  sentAt: number;
  accepted: number;
  ignored: number;
  ignoredReasons: string[];
  tracks: LoggedTrack[];
};

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Keeps a record of one batch Scrbbl sent.
 *
 * Deliberately best-effort: a scrobble that reached Last.FM has already
 * succeeded, and losing its receipt must never turn that into an error the
 * user sees. Failures are logged and swallowed.
 */
export async function recordScrobble({
  username,
  source,
  tracks,
  accepted,
  ignored,
  ignoredReasons,
  album,
  albumArtist,
}: {
  username: string;
  source: ScrobbleSource;
  tracks: LastfmApiTrack[];
  accepted: number;
  ignored: number;
  ignoredReasons: string[];
  album?: string;
  albumArtist?: string;
}): Promise<void> {
  if (!username || tracks.length === 0) return;

  try {
    const db = await getDb();
    if (!db) return;

    const id = crypto.randomUUID();
    const sentAt = Math.floor(Date.now() / 1000);

    await db.batch([
      {
        sql: `INSERT INTO scrobble_batches
                (id, username, source, album, album_artist, sent_at,
                 accepted, ignored, ignored_reasons)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          username,
          source,
          text(album),
          text(albumArtist),
          sentAt,
          accepted,
          ignored,
          JSON.stringify(ignoredReasons),
        ],
      },
      ...tracks.map((track, position) => ({
        sql: `INSERT INTO scrobble_batch_tracks
                (batch_id, position, artist, track, album, timestamp)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          position,
          track.artist,
          track.track,
          text(track.album),
          Number(track.timestamp ?? sentAt),
        ],
      })),
    ]);
  } catch (error) {
    console.error("[scrbbl] could not write the scrobble log", error);
  }
}

/** The most recent batches this user sent, newest first. */
export async function getRecentBatches(
  username: string,
  limit = 25
): Promise<LoggedBatch[]> {
  if (!username) return [];

  try {
    const db = await getDb();
    if (!db) return [];

    const batches = await db.execute({
      sql: `SELECT id, source, album, album_artist, sent_at,
                   accepted, ignored, ignored_reasons
              FROM scrobble_batches
             WHERE username = ?
             ORDER BY sent_at DESC
             LIMIT ?`,
      args: [username, limit],
    });

    if (batches.rows.length === 0) return [];

    const ids = batches.rows.map((row) => String(row.id));
    const placeholders = ids.map(() => "?").join(", ");

    const tracks = await db.execute({
      sql: `SELECT batch_id, artist, track, album, timestamp
              FROM scrobble_batch_tracks
             WHERE batch_id IN (${placeholders})
             ORDER BY batch_id, position`,
      args: ids,
    });

    const byBatch = new Map<string, LoggedTrack[]>();
    for (const row of tracks.rows) {
      const key = String(row.batch_id);
      const bucket = byBatch.get(key) ?? [];
      bucket.push({
        artist: String(row.artist),
        track: String(row.track),
        album: row.album === null ? null : String(row.album),
        timestamp: Number(row.timestamp),
      });
      byBatch.set(key, bucket);
    }

    return batches.rows.map((row) => {
      const id = String(row.id);
      let ignoredReasons: string[] = [];
      try {
        const parsed = JSON.parse(String(row.ignored_reasons ?? "[]"));
        if (Array.isArray(parsed)) ignoredReasons = parsed.map(String);
      } catch {
        // A malformed reasons blob is not worth failing the page over.
      }

      return {
        id,
        source: String(row.source) as ScrobbleSource,
        album: row.album === null ? null : String(row.album),
        albumArtist:
          row.album_artist === null ? null : String(row.album_artist),
        sentAt: Number(row.sent_at),
        accepted: Number(row.accepted),
        ignored: Number(row.ignored),
        ignoredReasons,
        tracks: byBatch.get(id) ?? [],
      };
    });
  } catch (error) {
    console.error("[scrbbl] could not read the scrobble log", error);
    return [];
  }
}
