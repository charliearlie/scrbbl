import type { RecentTrack, RecentTracksResponse } from "lastfmapi";

/**
 * One play, flattened out of Last.FM's nested response shape.
 *
 * Pure on purpose, like scrobble-timing: this is the part worth testing, and
 * it should not drag the Last.FM client in with it.
 */
export type Play = {
  artist: string;
  track: string;
  album: string;
  /** Unix seconds. */
  timestamp: number;
};

/**
 * BBC stations that scrobble their own output to Last.FM, so their playlists
 * are readable through the same `user.getRecentTracks` call Scrbbl already
 * makes. Verified live rather than assumed.
 */
export const BBC_STATIONS = [
  { id: "bbc6music", name: "BBC 6 Music" },
  { id: "bbcradio1", name: "BBC Radio 1" },
  { id: "bbcradio2", name: "BBC Radio 2" },
  { id: "bbc1xtra", name: "BBC 1Xtra" },
  { id: "bbcradio3", name: "BBC Radio 3" },
] as const;

export type BbcStationId = typeof BBC_STATIONS[number]["id"];

export function isBbcStation(value: string): value is BbcStationId {
  return BBC_STATIONS.some((station) => station.id === value);
}

/**
 * Qualifiers that name a pressing rather than a recording. Stripping them
 * lets "Blue Weekend" match "Blue Weekend (Deluxe Edition)" without also
 * collapsing genuinely different takes, so "(Acoustic)" and "(Live)" stay.
 */
const PRESSING_QUALIFIER =
  /\b(remaster(ed)?|deluxe|expanded|anniversary|reissue|mono|stereo|explicit|clean|bonus track)\b/i;

const BRACKETED = /[([][^()[\]]*[)\]]/g;
const TRAILING_DASH_QUALIFIER = /\s[-–—]\s[^-–—]*$/;

/**
 * Folds a title down to something comparable: case, accents, curly quotes,
 * punctuation and pressing qualifiers all go. Used only for matching, never
 * for anything shown to the user or sent to Last.FM.
 */
export function normaliseTitle(value: string): string {
  let out = (value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’ʼ]/g, "'")
    .toLowerCase();

  out = out.replace(BRACKETED, (group) =>
    PRESSING_QUALIFIER.test(group) ? " " : group
  );

  const dashed = out.match(TRAILING_DASH_QUALIFIER);
  if (dashed && PRESSING_QUALIFIER.test(dashed[0])) {
    out = out.replace(TRAILING_DASH_QUALIFIER, " ");
  }

  return out
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Identity for comparison: the artist and the track, both folded. */
export function playKey(play: Pick<Play, "artist" | "track">): string {
  return `${normaliseTitle(play.artist)}\u0000${normaliseTitle(play.track)}`;
}

/**
 * Flattens a page of `user.getRecentTracks` into plain plays, dropping the
 * now-playing row, which carries no timestamp and so cannot be scrobbled.
 */
export function flattenRecentTracks(
  response: Pick<RecentTracksResponse, "track"> | null | undefined
): Play[] {
  const raw = response?.track;
  if (!raw) return [];

  const rows: RecentTrack[] = Array.isArray(raw) ? raw : [raw];

  const plays: Play[] = [];
  for (const row of rows) {
    if (row?.["@attr"]?.nowplaying === "true") continue;

    const seconds = Number(row?.date?.uts);
    if (!Number.isFinite(seconds)) continue;

    plays.push({
      artist: row.artist?.["#text"] ?? "",
      track: row.name ?? "",
      album: row.album?.["#text"] ?? "",
      timestamp: seconds,
    });
  }

  return plays;
}

/** Station feeds sometimes send the same track twice back to back. */
export const REPEAT_WINDOW_SECONDS = 90;

/**
 * Drops a play identical to the one immediately before it within
 * `withinSeconds`, and returns the result oldest-first, which is the order a
 * tracklist wants. A genuine back-to-back replay is rare enough, and a
 * duplicated feed entry common enough, that collapsing is the better default.
 */
export function collapseRepeats(
  plays: Play[],
  withinSeconds: number = REPEAT_WINDOW_SECONDS
): Play[] {
  const ordered = [...plays].sort((a, b) => a.timestamp - b.timestamp);

  const kept: Play[] = [];
  for (const play of ordered) {
    const previous = kept[kept.length - 1];
    const isRepeat =
      previous &&
      playKey(previous) === playKey(play) &&
      play.timestamp - previous.timestamp <= withinSeconds;

    if (!isRepeat) kept.push(play);
  }

  return kept;
}

/** How far apart two plays of the same track can sit and still look like one. */
export const DEFAULT_OVERLAP_TOLERANCE_SECONDS = 30 * 60;

export type Overlap<T> = {
  candidate: T;
  existing: Play;
  secondsApart: number;
};

/**
 * Finds tracks about to be scrobbled that already sit in the listening
 * history near the same time.
 *
 * Deliberately generous, and deliberately advisory: an album sent twice with
 * slightly different anchors should be caught, so the caller warns rather
 * than blocks. Returns one overlap per candidate, the nearest in time.
 */
export function findOverlaps<
  T extends { artist: string; track: string; timestamp: number }
>(
  candidates: T[],
  existing: Play[],
  toleranceSeconds: number = DEFAULT_OVERLAP_TOLERANCE_SECONDS
): Overlap<T>[] {
  if (candidates.length === 0 || existing.length === 0) return [];

  const byKey = new Map<string, Play[]>();
  for (const play of existing) {
    const key = playKey(play);
    const bucket = byKey.get(key);
    if (bucket) bucket.push(play);
    else byKey.set(key, [play]);
  }

  const overlaps: Overlap<T>[] = [];

  for (const candidate of candidates) {
    const bucket = byKey.get(playKey(candidate));
    if (!bucket) continue;

    let nearest: Play | null = null;
    let nearestApart = Infinity;

    for (const play of bucket) {
      const apart = Math.abs(play.timestamp - candidate.timestamp);
      if (apart < nearestApart) {
        nearest = play;
        nearestApart = apart;
      }
    }

    if (nearest && nearestApart <= toleranceSeconds) {
      overlaps.push({
        candidate,
        existing: nearest,
        secondsApart: nearestApart,
      });
    }
  }

  return overlaps;
}
