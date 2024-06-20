// lastfm-api.d.ts
declare module "lastfmapi" {
  interface LastfmApiOptions {
    api_key: string;
    secret: string;
  }

  export interface LastfmApiError {
    message: string;
    code: number;
  }

  export interface LastfmApiSession {
    username: string;
    key: string;
    subscriber: number;
  }

  export interface LastfmApiTrack {
    artist: string;
    track: string;
    timestamp?: number;
    album?: string;
    context?: string;
    streamId?: string;
    chosenByUser?: boolean;
    trackNumber?: number;
    mbid?: string;
    duration?: number;
    albumArtist?: string;
    albumArtwork?: string;
    releaseDate?: number;
  }

  type ImageSize = "small" | "medium" | "large" | "extralarge";

  interface Image {
    size: ImageSize;
    "#text": string;
  }

  interface Registered {
    unixtime: string;
    "#text": number;
  }

  export interface User {
    name: string;
    age: string;
    subscriber: string;
    realname: string;
    bootstrap: string;
    playcount: string;
    artist_count: string;
    playlists: string;
    track_count: string;
    album_count: string;
    image: Image[];
    registered: Registered;
    country: string;
    gender: string;
    url: string;
    type: string;
  }

  export type AppleMusicAlbumSearchResult = {
    amgArtistId: number;
    artistId: number;
    artistName: string;
    artistViewUrl: string;
    artworkUrl60: string;
    artworkUrl100: string;
    collectionCensoredName: string;
    collectionExplicitness: string;
    collectionId: number;
    collectionName: string;
    collectionPrice: number;
    collectionType: string;
    collectionViewUrl: string;
    contentAdvisoryRating: string;
    copyright: string;
    country: string;
    currency: string;
    primaryGenreName: string;
    releaseDate: string;
    trackCount: number;
    wrapperType: string;
  };

  export type AppleMusicTrack = {
    wrapperType: "track" | "collection";
    kind: string;
    artistId: number;
    collectionId: number;
    trackId: number;
    artistName: string;
    collectionName: string;
    trackName: string;
    collectionCensoredName: string;
    trackCensoredName: string;
    artistViewUrl: string;
    collectionViewUrl: string;
    trackViewUrl: string;
    previewUrl: string;
    artworkUrl30: string;
    artworkUrl60: string;
    artworkUrl100: string;
    collectionPrice: number;
    trackPrice: number;
    releaseDate: string;
    collectionExplicitness: string;
    trackExplicitness: string;
    discCount: number;
    discNumber: number;
    trackCount: number;
    trackNumber: number;
    trackTimeMillis: number;
    country: string;
    currency: string;
    primaryGenreName: string;
    contentAdvisoryRating: string;
    isStreamable: boolean;
  };

  export type AppleMusicAlbumDetailsResult = {
    wrapperType: "collection" | "track";
    artistId: number;
    artistName: string;
    collectionId: number;
    collectionName: string;
    collectionCensoredName: string;
    collectionViewUrl: string;
    artworkUrl60: string;
    artworkUrl100: string;
    collectionExplicitness: string;
    country: string;
    currency: string;
    primaryGenreName: string;

    // Fields specific to MusicCollection
    collectionType?: string;
    amgArtistId?: number;
    contentAdvisoryRating?: string;
    trackCount?: number;
    copyright?: string;
    releaseDate?: string;

    // Fields specific to MusicTrack
    kind?: string;
    trackId?: number;
    trackName?: string;
    trackCensoredName?: string;
    artistViewUrl?: string;
    trackViewUrl?: string;
    previewUrl?: string;
    artworkUrl30?: string;
    trackPrice?: number;
    trackExplicitness?: string;
    discCount?: number;
    discNumber?: number;
    trackNumber?: number;
    trackTimeMillis?: number;
    isStreamable?: boolean;
  };

  export type AlbumDetailsApiResponse = {
    resultCount: number;
    results: Array<AppleMusicAlbumDetailsResult>;
  };

  class LastfmApi {
    constructor(options: LastfmApiOptions);
    authenticate(token: string, callback: AuthenticateCallback): void;
    setSessionCredentials(name: string | null, key: string | null): void;

    album: {
      getInfo(
        { artist: string, album: string },
        callback: AlbumDetailsCallback
      ): void;
      search({ album: string }, callback: AlbumSearchCallback): void;
    };

    track: {
      scrobble(track: LastfmApiTrack, callback: ScrobbleCallback): void;
    };

    user: {
      getInfo(username: string, callback: GetInfoCallback): void;
    };

    // Add any other methods or properties here
  }

  export = LastfmApi;
}

type AuthenticateCallback = (
  error: LastfmApiError | null,
  session: LastfmApiSession
) => void;

type ScrobbleCallback = (
  error: LastfmApiError | null,
  scrobbledTracks: LastfmApiTrack[]
) => void;

type GetInfoCallback = (error: LastfmApiError | null, user: User) => void;

type AlbumSearchCallback = (
  error: LastfmApiError | null,
  results: any // will sort out type
) => void;

// todo get the type for album
type AlbumDetailsCallback = (error: LastfmApiError | null, album: any) => void;
