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
import { Card, CardContent } from "~/components/common/card";
import type { LastfmApiTrack } from "lastfmapi";
import type LastfmApi from "lastfmapi";
import ManualScrobbleForm from "~/components/form/manual-scrobble-form";
import Alert from "~/components/common/alert";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const albumArtist = formData.get("albumArtist");
  const artist = formData.get("artist");
  const track = formData.get("track");
  const album = formData.get("album");
  const datetime = formData.get("datetime");

  const isDateTimeValid = datetime && typeof datetime === "string";
  const timestamp =
    Math.floor(
      (isDateTimeValid ? new Date(datetime).getTime() : new Date().getTime()) /
        1000
    ) - 300;

  if (typeof artist !== "string" || typeof track !== "string") return null;
  const lastfmSession = await getLastfmSession(request);

  if (!lastfmSession?.key || !lastfmSession?.username)
    return typedjson({ error: "No Last.FM session found" });

  const trackToScrobble: LastfmApi.LastfmApiTrack = {
    albumArtist: typeof albumArtist === "string" ? albumArtist : "",
    artist: artist || "",
    track,
    timestamp,
    album: album ? String(album) : "",
  };

  lastfm.setSessionCredentials(lastfmSession?.username, lastfmSession?.key);

  const scrobbles: LastfmApiTrack[] = await new Promise((resolve, reject) => {
    lastfm.track.scrobble(trackToScrobble, (error, scrobbles) => {
      if (error) {
        reject(error);
      }
      resolve(scrobbles);
    });
  });

  return typedjson({ scrobbles });
};

export const loader = async ({ request }: LoaderArgs) => {
  await requireLogin(request);
  const userToken = await getUserToken(request);
  return typedjson({ token: userToken });
};

export default function ManualScrobble() {
  const actionData = useTypedActionData<typeof action>();
  return (
    <main className="mt-12 p-2">
      <Card>
        <CardContent className="py-8 px-8">
          <h1>Scrobble Song</h1>
          <Alert visible={!!actionData}>Scrobbled Successfully</Alert>
          <ManualScrobbleForm />
        </CardContent>
      </Card>
    </main>
  );
}
