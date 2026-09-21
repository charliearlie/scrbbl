import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import type { AlbumInfo, SongInfo } from "~/services/apple-music.server";
import { searchAlbum, searchSong } from "~/services/apple-music.server";

export type SearchType = "all" | "album" | "song";

export type SearchResults = {
  albums: AlbumInfo[];
  songs: SongInfo[];
  query: string;
};

/** Below this, iTunes returns noise. */
const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS_PER_GROUP = 6;

function isSearchType(value: string | null): value is SearchType {
  return value === "all" || value === "album" || value === "song";
}

/**
 * One endpoint for every search surface, replacing the two near-identical
 * routes this used to have.
 *
 * A short or missing query is an ordinary empty result. It used to throw
 * through `invariant`, which turned an empty search box into a 500.
 */
export const loader = async ({ request }: LoaderArgs) => {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  const typeParam = searchParams.get("type");
  const type: SearchType = isSearchType(typeParam) ? typeParam : "all";

  if (query.length < MIN_QUERY_LENGTH) {
    return json<SearchResults>({ albums: [], songs: [], query });
  }

  const [albums, songs] = await Promise.all([
    type === "song" ? Promise.resolve([]) : searchAlbum(query),
    type === "album" ? Promise.resolve([]) : searchSong(query),
  ]);

  return json<SearchResults>(
    {
      albums: albums.slice(0, MAX_RESULTS_PER_GROUP),
      songs: songs.slice(0, MAX_RESULTS_PER_GROUP),
      query,
    },
    {
      // iTunes results are stable enough to reuse across keystrokes.
      headers: { "Cache-Control": "private, max-age=60" },
    }
  );
};
