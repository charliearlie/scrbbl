import type { LastfmApiTrack, User } from "lastfmapi";
import LastfmApi from "lastfmapi";
import { forEachRight } from "~/utils";
import { getLastfmSession } from "./session.server";
import { typedjson } from "remix-typedjson";

export const lastfm = new LastfmApi({
  api_key: "5e51b3c171721101d22f4101dd227f66",
  secret: "f7cb71083eceb100599f7f47d9c220a3",
});

export const scrobbleAlbum = async (
  album: string,
  tracks: LastfmApiTrack[],
  albumArtist: string,
  timestamp?: number
) => {
  let trackTimestamp = timestamp || Math.floor(new Date().getTime() / 1000);
  const scrobbles: LastfmApiTrack[] = await new Promise((resolve, reject) => {
    const scrobbleArray: LastfmApiTrack[] = [];
    forEachRight(tracks, (track, index) => {
      trackTimestamp =
        trackTimestamp - Math.floor((track.duration || 3000) / 1000);

      lastfm.track.scrobble(
        {
          albumArtist,
          album,
          artist: track.artist,
          track: track?.track,
          timestamp: trackTimestamp,
        },
        (error, scrobbles) => {
          if (error) reject(error);

          scrobbleArray.concat(scrobbles);

          if (index === tracks.length - 1) {
            resolve(scrobbleArray);
          }
        }
      );
    });
  });

  return scrobbles ? true : false;
};

export const getUserData = async (request: Request) => {
  const session = await getLastfmSession(request);
  if (session) {
    lastfm.setSessionCredentials(session?.username, session?.key);
    const userInfo: User = await new Promise((resolve, reject) => {
      lastfm.user.getInfo("", (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });

    return typedjson(userInfo);
  }

  return typedjson(null);
};
