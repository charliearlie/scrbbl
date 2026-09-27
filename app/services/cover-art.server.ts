import { getDb } from "./db.server";

/**
 * Real sleeve scans from the Cover Art Archive, by way of MusicBrainz.
 *
 * iTunes gives a 600px front and nothing else. The archive has the actual
 * scans, at up to 1200px, and sometimes the back — which is where a record's
 * tracklist, credits and catalogue number live.
 */

/** MusicBrainz asks for an identifying User-Agent and allows ~1 request/sec. */
const USER_AGENT = "Scrbbl/1.0 ( https://scrbbl.vercel.app )";
const TIMEOUT_MS = 8000;

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    // A missing sleeve is never worth failing a page over.
    return null;
  } finally {
    clearTimeout(timer);
  }
}

type ReleaseGroupSearch = {
  "release-groups"?: Array<{ id: string; score?: number; title?: string }>;
};

/**
 * Finds the release *group* rather than a release.
 *
 * Cover art is attached per pressing, and most pressings have none — the
 * first search hit for "Blue Weekend" is an Afghan release with no images at
 * all. The group carries whichever of its releases does have artwork.
 */
export async function findReleaseGroup(
  artist: string,
  title: string
): Promise<string | null> {
  if (!artist || !title) return null;

  const query = `artist:"${artist.replace(
    /"/g,
    ""
  )}" AND releasegroup:"${title.replace(/"/g, "")}"`;
  const url =
    "https://musicbrainz.org/ws/2/release-group/?fmt=json&limit=1&query=" +
    encodeURIComponent(query);

  const data = await fetchJson<ReleaseGroupSearch>(url);
  return data?.["release-groups"]?.[0]?.id ?? null;
}

type CoverArtImage = {
  front?: boolean;
  back?: boolean;
  image?: string;
  thumbnails?: Record<string, string>;
};

type CoverArtResponse = { images?: CoverArtImage[] };

export type Sleeve = { front: string | null; back: string | null };

function pick(image: CoverArtImage) {
  // 1200 when the archive has it, else the largest it does.
  const thumbs = image?.thumbnails ?? {};
  return (
    thumbs["1200"] ?? thumbs["large"] ?? thumbs["500"] ?? image?.image ?? null
  );
}

export async function getSleeve(releaseGroupId: string): Promise<Sleeve> {
  const data = await fetchJson<CoverArtResponse>(
    `https://coverartarchive.org/release-group/${releaseGroupId}`
  );

  const images = data?.images ?? [];
  const front = images.find((image) => image.front);
  const back = images.find((image) => image.back);

  return {
    front: front ? pick(front) : null,
    back: back ? pick(back) : null,
  };
}

/**
 * Looks a record up and stores whatever it finds, once.
 *
 * Best-effort throughout: a record with no scans keeps its iTunes thumbnail
 * and nothing about the shelf breaks. `mbid` is written even when no art is
 * found, so a fruitless lookup is not repeated on every page load.
 */
export async function enrichSleeve(albumId: string): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const existing = await db.execute({
      sql: `SELECT artist, title, mbid FROM shelf_albums WHERE id = ? LIMIT 1`,
      args: [albumId],
    });

    const row = existing.rows[0];
    if (!row || row.mbid) return;

    const releaseGroup = await findReleaseGroup(
      String(row.artist),
      String(row.title)
    );
    if (!releaseGroup) return;

    const sleeve = await getSleeve(releaseGroup);

    await db.execute({
      sql: `UPDATE shelf_albums
               SET mbid = ?, cover_front = ?, cover_back = ?
             WHERE id = ?`,
      args: [releaseGroup, sleeve.front, sleeve.back, albumId],
    });
  } catch (error) {
    console.error("[scrbbl] could not look up sleeve art", error);
  }
}
