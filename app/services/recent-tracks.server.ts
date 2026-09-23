import type { RecentTracksParams, RecentTracksResponse } from "lastfmapi";

import { lastfm } from "./lastfm.server";
import {
  DEFAULT_OVERLAP_TOLERANCE_SECONDS as DEFAULT_OVERLAP_TOLERANCE,
  collapseRepeats,
  findOverlaps,
  flattenRecentTracks,
} from "./recent-tracks";
import type { Play } from "./recent-tracks";
import type { DuplicateWarning } from "./scrobble-form.server";

export {
  BBC_STATIONS,
  DEFAULT_OVERLAP_TOLERANCE_SECONDS,
  collapseRepeats,
  findOverlaps,
  flattenRecentTracks,
  isBbcStation,
  normaliseTitle,
} from "./recent-tracks";
export type { BbcStationId, Overlap, Play } from "./recent-tracks";

/** Last.FM's own ceiling for this method. */
const MAX_PAGE_SIZE = 200;

/** A guard so a wide window cannot walk the whole of a station's history. */
const MAX_PAGES = 10;

function requestPage(
  params: RecentTracksParams
): Promise<RecentTracksResponse> {
  return new Promise((resolve, reject) => {
    lastfm.user.getRecentTracks(params, (error, response) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    });
  });
}

export type RecentTracksResult =
  | { ok: true; plays: Play[]; truncated: boolean }
  | { ok: false; error: string };

function describeError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    if (/user not found/i.test(message)) {
      return "Last.FM has no such user.";
    }
    return message;
  }
  return "Last.FM did not answer. Try again in a moment.";
}

/**
 * Reads a window of somebody's listening history, oldest first, with the
 * feed's back-to-back duplicates collapsed.
 *
 * `user` is any Last.FM account: your own for the duplicate check, or a
 * station's for BBC radio. Pages are fetched in sequence because they share
 * one rate limit, and capped so a wide window degrades rather than hangs.
 */
export async function getRecentPlays({
  user,
  from,
  to,
  maxPages = MAX_PAGES,
}: {
  user: string;
  from?: number;
  to?: number;
  maxPages?: number;
}): Promise<RecentTracksResult> {
  if (!user) return { ok: false, error: "No Last.FM user to read." };

  const collected: Play[] = [];
  let truncated = false;

  try {
    for (let page = 1; page <= maxPages; page++) {
      const response = await requestPage({
        user,
        limit: MAX_PAGE_SIZE,
        page,
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      });

      collected.push(...flattenRecentTracks(response));

      const totalPages = Number(response?.["@attr"]?.totalPages ?? 1);
      if (!Number.isFinite(totalPages) || page >= totalPages) break;

      if (page === maxPages) truncated = true;
    }
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }

  return { ok: true, plays: collapseRepeats(collected), truncated };
}

/**
 * Looks for tracks that are already on the profile around the time they are
 * about to be scrobbled again.
 *
 * Advisory by design. If Last.FM cannot be reached, or the window is
 * unreadable, this reports no duplicates rather than standing between you and
 * a scrobble: a missed warning is a smaller failure than a blocked send.
 */
export async function findDuplicatePlays({
  username,
  tracks,
  toleranceSeconds = DEFAULT_OVERLAP_TOLERANCE,
}: {
  username: string;
  tracks: Array<{ artist: string; track: string; timestamp?: number }>;
  toleranceSeconds?: number;
}): Promise<DuplicateWarning[]> {
  const dated = tracks.filter(
    (track): track is { artist: string; track: string; timestamp: number } =>
      Number.isFinite(track.timestamp)
  );
  if (!username || dated.length === 0) return [];

  const stamps = dated.map((track) => track.timestamp);
  const from = Math.min(...stamps) - toleranceSeconds;
  const to = Math.max(...stamps) + toleranceSeconds;

  const history = await getRecentPlays({ user: username, from, to });
  if (!history.ok) {
    console.warn("[scrbbl] duplicate check skipped:", history.error);
    return [];
  }

  return findOverlaps(dated, history.plays, toleranceSeconds).map(
    (overlap) => ({
      artist: overlap.candidate.artist,
      track: overlap.candidate.track,
      playedAt: overlap.existing.timestamp,
    })
  );
}
