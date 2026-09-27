import type { TopAlbum, TopAlbumsResponse } from "lastfmapi";

import { lastfm } from "./lastfm.server";
import type { Period, PlayedAlbum } from "./shelf-gap";

export type { PlayedAlbum, Unowned, Unplayed } from "./shelf-gap";

// Values a component needs live in "./shelf-gap": importing one from a
// `.server` module gives `undefined` in the browser, because Remix strips
// these files out of the client bundle.

function biggest(images: TopAlbum["image"]): string | null {
  if (!Array.isArray(images)) return null;
  for (const size of ["extralarge", "large", "medium"]) {
    const hit = images.find((image) => image.size === size)?.["#text"];
    if (hit) return hit;
  }
  return null;
}

function request(params: {
  user: string;
  period: string;
  limit: number;
}): Promise<TopAlbumsResponse> {
  return new Promise((resolve, reject) => {
    lastfm.user.getTopAlbums(params, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}

export type TopAlbumsResult =
  | { ok: true; albums: PlayedAlbum[] }
  | { ok: false; error: string };

/** What this user has actually played, most played first. */
export async function getTopAlbums({
  user,
  period = "12month",
  limit = 200,
}: {
  user: string;
  period?: Period;
  limit?: number;
}): Promise<TopAlbumsResult> {
  if (!user) return { ok: false, error: "No Last.FM user to read." };

  try {
    const response = await request({ user, period, limit });

    const raw = response?.album;
    if (!raw) return { ok: true, albums: [] };

    const rows: TopAlbum[] = Array.isArray(raw) ? raw : [raw];

    const albums: PlayedAlbum[] = [];
    for (const row of rows) {
      const title = row?.name;
      const artist = row?.artist?.name;
      const playcount = Number(row?.playcount);
      if (!title || !artist || !Number.isFinite(playcount)) continue;

      albums.push({
        artist,
        title,
        playcount,
        artworkUrl: biggest(row.image),
        url: row.url ?? "",
      });
    }

    return { ok: true, albums };
  } catch (error) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : "Last.FM did not answer. Try again in a moment.";
    return { ok: false, error: message };
  }
}
