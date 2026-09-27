import { getDb, runOnce } from "./db.server";

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

type ReleaseBrowse = {
  releases?: Array<{
    id: string;
    date?: string;
    "cover-art-archive"?: { front?: boolean; back?: boolean };
  }>;
};

export type Sleeve = { front: string | null; back: string | null };

function pick(image: CoverArtImage) {
  // 1200 when the archive has it, else the largest it does.
  const thumbs = image?.thumbnails ?? {};
  const url =
    thumbs["1200"] ?? thumbs["large"] ?? thumbs["500"] ?? image?.image ?? null;

  // The archive answers with http:// URLs. An https page refuses those as
  // mixed content, so the sleeve would simply never appear.
  return url ? url.replace(/^http:/, "https:") : null;
}

async function imagesFor(releaseId: string): Promise<Sleeve> {
  const data = await fetchJson<CoverArtResponse>(
    `https://coverartarchive.org/release/${releaseId}`
  );

  const images = data?.images ?? [];
  const front = images.find((image) => image.front);
  const back = images.find((image) => image.back);

  return { front: front ? pick(front) : null, back: back ? pick(back) : null };
}

/**
 * Finds the sleeve for a release group, back included where one exists.
 *
 * The obvious call — asking the archive for the release *group* — returns only
 * whichever release the group happens to point at, and that pressing usually
 * has a front and nothing else. Browsing the group's releases instead reports
 * `front` and `back` per pressing in a single request, and across a sample of
 * five albums every one of them had a back on some pressing even though only
 * one did on its chosen release.
 *
 * A pressing carrying both is preferred so the two faces belong together.
 */
export async function getSleeve(releaseGroupId: string): Promise<Sleeve> {
  const browse = await fetchJson<ReleaseBrowse>(
    `https://musicbrainz.org/ws/2/release?release-group=${releaseGroupId}` +
      "&fmt=json&limit=100"
  );

  const releases = browse?.releases ?? [];
  const art = (id: string) =>
    releases.find((release) => release.id === id)?.["cover-art-archive"] ?? {};

  const withBoth = releases.find((r) => art(r.id).front && art(r.id).back);
  if (withBoth) return imagesFor(withBoth.id);

  // No single pressing has both, so take each face from the best it can come
  // from. Different pressings of the same record almost always share artwork.
  const frontFrom = releases.find((r) => art(r.id).front);
  const backFrom = releases.find((r) => art(r.id).back);

  if (!frontFrom && !backFrom) {
    // Nothing in the browse said so — fall back to the group's own answer.
    const group = await fetchJson<CoverArtResponse>(
      `https://coverartarchive.org/release-group/${releaseGroupId}`
    );
    const image = group?.images?.find((i) => i.front);
    return { front: image ? pick(image) : null, back: null };
  }

  const [front, back] = await Promise.all([
    frontFrom ? imagesFor(frontFrom.id) : Promise.resolve(null),
    backFrom ? imagesFor(backFrom.id) : Promise.resolve(null),
  ]);

  return { front: front?.front ?? null, back: back?.back ?? null };
}

/**
 * Looks a record up and stores whatever it finds, once.
 *
 * Best-effort throughout: a record with no scans keeps its iTunes thumbnail
 * and nothing about the shelf breaks. `mbid` is written even when no art is
 * found, so a fruitless lookup is not repeated on every page load.
 */
/**
 * Records enriched before the release-browse lookup existed were told there
 * was no back cover when there usually was one. Clearing their mbid marks
 * them as never-looked-up, so the next view tries again with the better
 * question. Runs once, ever.
 */
export function recheckMissingBacks() {
  return runOnce("recheck-missing-backs-2026-09", async (client) => {
    await client.execute(
      `UPDATE shelf_albums SET mbid = NULL WHERE cover_back IS NULL`
    );
  });
}

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
