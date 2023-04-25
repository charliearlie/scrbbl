// lastfm-api.d.ts
declare module "lastfmapi" {
  interface LastfmApiOptions {
    api_key: string;
    secret: string;
  }

  interface LastfmApiError {
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

  type AuthenticateCallback = (
    error: LastfmApiError | null,
    session: LastfmApiSession
  ) => void;

  type ScrobbleCallback = (
    error: LastfmApiError | null,
    scrobbledTracks: LastfmApiTrack[]
  ) => void;

  type GetInfoCallback = (
    error: LastfmApiError | null,
    user: User // will sort out type
  ) => void;

  class LastfmApi {
    constructor(options: LastfmApiOptions);
    authenticate(token: string, callback: AuthenticateCallback): void;
    setSessionCredentials(name: string | null, key: string | null): void;

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
