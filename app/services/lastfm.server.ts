import LastfmApi, {
  AppleMusicAlbumDetailsResult,
  LastfmApiTrack,
} from "lastfmapi";
import { forEachRight } from "~/utils";

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
      console.log("track DURATION", track.duration);
      trackTimestamp =
        trackTimestamp - Math.floor((track.duration || 3000) / 1000);

      console.log("Shapoopi", {
        albumArtist,
        album,
        artist: track.artist,
        track: track.track!,
        timestamp: trackTimestamp,
      });
      console.log("lastf,.track", lastfm.track);
      lastfm.track.scrobble(
        {
          albumArtist,
          album,
          artist: track.artist,
          track: track?.track,
          timestamp: trackTimestamp,
        },
        (error, scrobbles) => {
          console.info("HEIL", error);
          console.log("Scrobbles", scrobbles);
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
