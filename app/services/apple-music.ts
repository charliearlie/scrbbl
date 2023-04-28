import axios, { AxiosResponse } from "axios";
import { defaultManualScrobbleState } from "~/utils";

import type { AppleMusicAlbumSearchResult, LastfmApiTrack } from "lastfmapi";

const baseUrl = "https://itunes.apple.com";

export async function searchSong(query: string) {
  try {
    const response = await axios.get(
      `${baseUrl}/search?term=${query.replace(
        " ",
        "+"
      )}&media=music&entity=song`
    );

    const topResult = response.data.results[0];

    return {
      artist: topResult.artistName,
      album: topResult.collectionName,
      albumArtist: topResult.artistName, //Need to actually get the album artist
      track: topResult.trackName,
    } as LastfmApiTrack;
  } catch {
    console.error("Something went wrong with the search");
    return defaultManualScrobbleState;
  }
}

type AlbumResponse = {
  results: AppleMusicAlbumSearchResult[];
};

export type AlbumInfo = {
  albumId: number;
  artist: string;
  album: string;
  albumArtwork: string;
};

export async function searchAlbum(query: string) {
  const response: AxiosResponse<AlbumResponse> = await axios.get(
    `${baseUrl}/search?term=${query.replace(" ", "+")}&media=music&entity=album`
  );

  return response.data.results.map((result) => ({
    albumId: result.collectionId,
    artist: result.artistName,
    album: result.collectionName,
    albumArtwork: result.artworkUrl100,
  })) as AlbumInfo[];
}
