// This file is specifically for Apple music functions called on the server.

import axios, { AxiosResponse } from "axios";
import {
  AlbumDetailsApiResponse,
  AppleMusicAlbumDetailsResult,
  AppleMusicAlbumSearchResult,
  LastfmApiTrack,
} from "lastfmapi";

const baseUrl = "https://itunes.apple.com";

type AlbumDetails = {
  tracks: LastfmApiTrack[];
} & Pick<
  AppleMusicAlbumDetailsResult,
  "artistName" | "collectionName" | "releaseDate"
>;

function isCollection(item: AppleMusicAlbumDetailsResult) {
  return item.wrapperType === "collection";
}

function isTrack(item: AppleMusicAlbumDetailsResult) {
  return item.wrapperType === "track";
}

export async function getAlbumDetails(
  albumId: string
): Promise<AlbumDetails | null> {
  const response: AxiosResponse<AlbumDetailsApiResponse> = await axios.get(
    `${baseUrl}/lookup?id=${albumId}&entity=song`
  );
  const albumDetails = response.data.results.find((result) =>
    isCollection(result)
  );

  if (albumDetails) {
    const { artistName, collectionName, releaseDate } = albumDetails;
    // We'll map over this
    const tracks = response.data.results
      .filter((result) => isTrack(result))
      .map((result) => ({
        albumId: result.collectionId,
        artist: result.artistName,
        track: result?.trackName,
        album: result.collectionName,
        releaseDate: result.releaseDate,
        trackNumber: result.trackNumber,
      })) as LastfmApiTrack[];

    return {
      artistName,
      collectionName,
      releaseDate,
      tracks,
    };
  }

  return null;
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
