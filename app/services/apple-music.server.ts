// This file is specifically for Apple music functions called on the server.

import type { AxiosResponse } from "axios";
import axios from "axios";
import type {
  AlbumDetailsApiResponse,
  AppleMusicAlbumDetailsResult,
  AppleMusicAlbumSearchResult,
  LastfmApiTrack,
} from "lastfmapi";

const baseUrl = "https://itunes.apple.com";

/** Used when iTunes has no runtime for a track. Three minutes. */
const FALLBACK_TRACK_MS = 180_000;

const REQUEST_TIMEOUT_MS = 8000;

type AlbumDetails = {
  tracks: LastfmApiTrack[];
} & Pick<
  AppleMusicAlbumDetailsResult,
  "artistName" | "collectionId" | "collectionName" | "releaseDate"
> & {
    artworkUrl: string;
    contentRating: string | undefined;
    genre: string;
  };

function isCollection(item: AppleMusicAlbumDetailsResult) {
  return item.wrapperType === "collection";
}

function isTrack(item: AppleMusicAlbumDetailsResult) {
  return item.wrapperType === "track";
}

/**
 * `term` has to be percent-encoded as a whole. The previous version called
 * `.replace(" ", "+")`, which only swaps the *first* space, so anything past
 * the second word was dropped from the query.
 */
function searchUrl(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  return `${baseUrl}/search?${query.toString()}`;
}

/** Ask for a usable cover instead of the 100px thumbnail iTunes defaults to. */
function upscaleArtwork(url: string, size: number) {
  return url.replace(/\/\d+x\d+bb\./, `/${size}x${size}bb.`);
}

export async function getAlbumDetails(
  albumId: string
): Promise<AlbumDetails | null> {
  let response: AxiosResponse<AlbumDetailsApiResponse>;

  try {
    response = await axios.get(`${baseUrl}/lookup`, {
      params: { id: albumId, entity: "song" },
      timeout: REQUEST_TIMEOUT_MS,
    });
  } catch (error) {
    console.error("[scrbbl] iTunes lookup failed", error);
    return null;
  }

  const albumDetails = response.data?.results?.find((result) =>
    isCollection(result)
  );

  if (!albumDetails) return null;

  const { artistName, collectionId, collectionName, releaseDate } =
    albumDetails;

  const tracks = response.data.results
    .filter((result) => isTrack(result))
    .map((result) => ({
      albumId: result.collectionId,
      artist: result.artistName,
      duration: result.trackTimeMillis || FALLBACK_TRACK_MS,
      track: result?.trackName,
      album: result.collectionName,
      releaseDate: new Date(result.releaseDate ?? "").getFullYear(),
      trackNumber: result.trackNumber,
    })) as LastfmApiTrack[];

  return {
    artistName,
    artworkUrl: upscaleArtwork(albumDetails.artworkUrl100, 600),
    collectionId,
    collectionName,
    contentRating: albumDetails.contentAdvisoryRating,
    genre: albumDetails.primaryGenreName,
    releaseDate,
    tracks,
  };
}

type AlbumResponse = {
  results: AppleMusicAlbumSearchResult[];
};

export type AlbumInfo = {
  albumId: number;
  artist: string;
  album: string;
  albumArtwork: string;
  releaseDate: number;
  trackCount: number;
};

export async function searchAlbum(query: string): Promise<AlbumInfo[]> {
  try {
    const response: AxiosResponse<AlbumResponse> = await axios.get(
      searchUrl({
        term: query,
        media: "music",
        entity: "album",
        limit: "12",
      }),
      { timeout: REQUEST_TIMEOUT_MS }
    );

    return (response.data?.results ?? []).map((result) => ({
      albumId: result.collectionId,
      artist: result.artistName,
      album: result.collectionName,
      albumArtwork: upscaleArtwork(result.artworkUrl100, 300),
      releaseDate: new Date(result.releaseDate).getFullYear(),
      trackCount: result.trackCount,
    }));
  } catch (error) {
    console.error("[scrbbl] iTunes album search failed", error);
    return [];
  }
}

export type SongInfo = {
  artist: string;
  album: string;
  albumArtist: string;
  thumbnail: string;
  track: string;
  durationMs: number;
};

export async function searchSong(query: string): Promise<SongInfo[]> {
  try {
    const response = await axios.get(
      searchUrl({
        term: query,
        media: "music",
        entity: "song",
        limit: "12",
      }),
      { timeout: REQUEST_TIMEOUT_MS }
    );

    const results = response.data?.results ?? [];

    return results.map(
      (result: {
        artistName: string;
        artworkUrl100: string;
        collectionName: string;
        trackName: string;
        trackTimeMillis?: number;
      }) => ({
        artist: result.artistName,
        album: result.collectionName,
        // iTunes has no separate album-artist field on a song result.
        albumArtist: result.artistName,
        track: result.trackName,
        thumbnail: upscaleArtwork(result.artworkUrl100, 120),
        durationMs: result.trackTimeMillis || FALLBACK_TRACK_MS,
      })
    );
  } catch (error) {
    console.error("[scrbbl] iTunes song search failed", error);
    return [];
  }
}
