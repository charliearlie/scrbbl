import type {
  LastfmApiTrack,
  ScrobbleResponse,
  ScrobbledTrack,
  User,
} from "lastfmapi";
import LastfmApi from "lastfmapi";
import { getLastfmSession } from "./session.server";
import { LASTFM_API_KEY, LASTFM_API_SECRET } from "./env.server";
import { buildAlbumTimestamps } from "./scrobble-timing";

export {
  albumDurationSeconds,
  buildAlbumTimestamps,
  validateScrobbleTime,
} from "./scrobble-timing";

export const lastfm = new LastfmApi({
  api_key: LASTFM_API_KEY,
  secret: LASTFM_API_SECRET,
});

/** Last.FM accepts at most 50 tracks in one `track.scrobble` call. */
const MAX_BATCH_SIZE = 50;

export type ScrobbleResult =
  | {
      ok: true;
      accepted: number;
      ignored: number;
      ignoredReasons: string[];
      /** Exactly what went to Last.FM, timestamps included, for the log. */
      sent: LastfmApiTrack[];
    }
  | { ok: false; error: string };

function normaliseScrobbles(response: ScrobbleResponse): ScrobbledTrack[] {
  const { scrobble } = response;
  if (!scrobble) return [];
  return Array.isArray(scrobble) ? scrobble : [scrobble];
}

function describeError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    // Last.FM returns this whenever the stored session key is no longer good.
    if (/invalid session key|authentication failed/i.test(message)) {
      return "Your Last.FM session has expired. Log in again and retry.";
    }
    return message;
  }
  return "Last.FM did not accept the scrobble. Try again in a moment.";
}

function sendBatch(batch: LastfmApiTrack[]): Promise<ScrobbleResponse> {
  return new Promise((resolve, reject) => {
    lastfm.track.scrobble(batch, (error, response) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    });
  });
}

/**
 * Scrobbles a list of already-timestamped tracks, in batches, and reports
 * what Last.FM actually did with them.
 *
 * The previous implementation fired one request per track and resolved on
 * the first callback it received, so it reported success before the rest of
 * the album had been sent, and swallowed any per-track rejection.
 */
export async function scrobbleTracks(
  tracks: LastfmApiTrack[]
): Promise<ScrobbleResult> {
  if (tracks.length === 0) {
    return { ok: false, error: "There are no tracks selected to scrobble." };
  }

  const batches: LastfmApiTrack[][] = [];
  for (let index = 0; index < tracks.length; index += MAX_BATCH_SIZE) {
    batches.push(tracks.slice(index, index + MAX_BATCH_SIZE));
  }

  let accepted = 0;
  let ignored = 0;
  const ignoredReasons = new Set<string>();

  try {
    // Sequential on purpose: batches share one rate limit.
    for (const batch of batches) {
      const response = await sendBatch(batch);

      accepted += Number(response?.["@attr"]?.accepted ?? 0);
      ignored += Number(response?.["@attr"]?.ignored ?? 0);

      for (const scrobbled of normaliseScrobbles(response)) {
        const reason = scrobbled?.ignoredMessage?.["#text"];
        if (reason) ignoredReasons.add(reason);
      }
    }
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }

  if (accepted === 0) {
    return {
      ok: false,
      error:
        ignoredReasons.size > 0
          ? `Last.FM ignored every track: ${[...ignoredReasons].join(", ")}.`
          : "Last.FM accepted none of the tracks.",
    };
  }

  return {
    ok: true,
    accepted,
    ignored,
    ignoredReasons: [...ignoredReasons],
    sent: tracks,
  };
}

/**
 * Lays an album out in time without sending it, so a caller can look at the
 * timestamps first — the duplicate check needs them before anything goes out.
 */
export function buildAlbumScrobbles(
  album: string,
  tracks: LastfmApiTrack[],
  albumArtist: string,
  finishedAtSeconds: number
): LastfmApiTrack[] {
  return buildAlbumTimestamps(tracks, finishedAtSeconds).map((track) => ({
    albumArtist,
    album,
    artist: track.artist,
    track: track.track,
    timestamp: track.timestamp,
  }));
}

export async function scrobbleAlbum(
  album: string,
  tracks: LastfmApiTrack[],
  albumArtist: string,
  finishedAtSeconds: number
): Promise<ScrobbleResult> {
  return scrobbleTracks(
    buildAlbumScrobbles(album, tracks, albumArtist, finishedAtSeconds)
  );
}

export async function getUserData(request: Request): Promise<User | null> {
  const session = await getLastfmSession(request);
  if (!session) return null;

  lastfm.setSessionCredentials(session.username, session.key);

  try {
    return await new Promise<User>((resolve, reject) => {
      lastfm.user.getInfo("", (error, info) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(info);
      });
    });
  } catch (error) {
    // A stale session should not take the whole layout down; the user
    // simply reads as logged out.
    console.error("[scrbbl] could not load Last.FM profile", error);
    return null;
  }
}
