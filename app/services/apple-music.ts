import axios, { AxiosResponse } from "axios";

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
    return null;
  }
}
