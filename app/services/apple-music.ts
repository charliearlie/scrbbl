import axios from "axios";
import { defaultManualScrobbleState } from "~/utils";

import type { LastfmApiTrack } from "lastfmapi";

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

export async function searchAlbum(query: string) {
  const response = await axios.get(
    `${baseUrl}/search?term=${query.replace(" ", "+")}&media=music&entity=album`
  );
  // We'll map over this
  return response.data.results.map((result: any) => ({
    artist: result.artistName,
    album: result.collectionName,
    albumArtist: result.artistName, //Need to actually get the album artist
    track: result.trackName,
  })) as LastfmApiTrack[];
}
