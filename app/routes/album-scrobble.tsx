import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import {
  getLastfmSession,
  getUserToken,
  requireLogin,
} from "~/services/session.server";
import {
  typedjson,
  useTypedActionData,
  useTypedLoaderData,
} from "remix-typedjson";
import { lastfm } from "~/services/lastfm.server";
import { Card, CardContent } from "~/components/card";
import LastfmApi, { LastfmApiTrack } from "lastfmapi";
import Alert from "~/components/alert";
import AlbumSearch from "~/components/album/album-search";
import { useState } from "react";
import { Link, Outlet } from "@remix-run/react";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const albumName = formData.get("albumName");
  const timestamp = formData.get("timestamp");
  const tracks = formData.get("tracks");

  console.log("albumName", albumName);
  console.log("tracks", tracks);

  if (typeof albumName !== "string" || typeof tracks !== "string") return null;
  const lastfmSession = await getLastfmSession(request);

  if (!lastfmSession?.key || !lastfmSession?.username)
    return typedjson({ error: "No Last.FM session found" });

  const parsedTracks: LastfmApiTrack[] = JSON.parse(tracks);

  return null;

  // const trackToScrobble: LastfmApi.LastfmApiTrack = {
  //   albumArtist: typeof albumArtist === "string" ? albumArtist : "",
  //   artist: artist || "",
  //   track,
  //   timestamp,
  //   album: album ? String(album) : "",
  // };

  // lastfm.setSessionCredentials(lastfmSession?.username, lastfmSession?.key);

  // const scrobbles: LastfmApiTrack[] = await new Promise((resolve, reject) => {
  //   lastfm.track.scrobble(trackToScrobble, (error, scrobbles) => {
  //     if (error) {
  //       reject(error);
  //     }
  //     resolve(scrobbles);
  //   });
  // });

  return typedjson({ scrobbles });
};

export const loader = async ({ request }: LoaderArgs) => {
  await requireLogin(request);
  const userToken = await getUserToken(request);
  return typedjson({ token: userToken });
};

export default function AlbumScrobble() {
  const actionData = useTypedActionData<typeof action>();

  return (
    <main className="mt-12 p-2">
      <Card>
        <CardContent className="py-8 px-8">
          <h1>Album search</h1>
          <Alert visible={!!actionData}>Scrobbled Successfully</Alert>
          <AlbumSearch />
        </CardContent>
      </Card>
      <div className="mt-4">
        <Outlet />
      </div>
    </main>
  );
}
