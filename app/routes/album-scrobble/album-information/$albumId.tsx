import { useEffect } from "react";
import { useNavigation, useSubmit } from "@remix-run/react";
import { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { LastfmApiTrack } from "lastfmapi";
import {
  redirect,
  typedjson,
  useTypedActionData,
  useTypedLoaderData,
} from "remix-typedjson";
import invariant from "tiny-invariant";
import Alert from "~/components/alert";
import { Card, CardContent } from "~/components/card";
import InputWithLabel from "~/components/form/input-with-label";
import { getAlbumDetails } from "~/services/apple-music.server";
import { lastfm, scrobbleAlbum } from "~/services/lastfm.server";
import { getLastfmSession } from "~/services/session.server";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.albumId, "Expected an album id you sausage");

  const { albumId } = params;
  const albumDetails = await getAlbumDetails(albumId);

  if (!albumDetails) {
    return redirect("/album-scrobble");
  } else {
    const { artistName, collectionName, releaseDate, tracks } = albumDetails;
    return typedjson({ artistName, collectionName, releaseDate, tracks });
  }
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const albumName = formData.get("albumName");
  const albumArtist = formData.get("albumArtist");
  const timestamp = formData.get("timestamp");
  const tracks = formData.get("tracks");

  if (
    typeof albumName !== "string" ||
    typeof timestamp !== "string" ||
    typeof albumArtist !== "string" ||
    typeof tracks !== "string"
  ) {
    return typedjson({ success: false, error: "Vital details are missing" });
  }
  const lastfmSession = await getLastfmSession(request);

  if (!lastfmSession?.key || !lastfmSession?.username)
    return typedjson({ success: false, error: "No Last.FM session found" });

  const tracksToScrobble: LastfmApiTrack[] = JSON.parse(tracks);

  lastfm.setSessionCredentials(lastfmSession?.username, lastfmSession?.key);
  const scrobbled = await scrobbleAlbum(
    albumName,
    tracksToScrobble,
    albumArtist
  );

  return typedjson({ success: scrobbled, error: null });
};

export default function AlbumDetails() {
  const loaderData = useTypedLoaderData<typeof loader>();
  const actionData = useTypedActionData<typeof action>();

  const navigation = useNavigation();
  const submit = useSubmit();

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToElement("album-name");
  }, []);

  const handleScrobble = () => {
    if (loaderData) {
      const formData = new FormData();
      formData.append("albumArtist", loaderData.artistName);
      formData.append("albumName", loaderData.collectionName ?? "");
      formData.append("tracks", JSON.stringify(loaderData.tracks));
      formData.append(
        "timestamp",
        String(Math.floor(new Date().getTime() / 1000))
      );

      submit(formData, { method: "post" });
    }
    return false;
  };

  if (loaderData) {
    return (
      <Card>
        <CardContent className="py-8 px-8">
          <h2 id="album-name" className="scroll-mt-16">
            {loaderData.collectionName}
          </h2>
          <h3>{loaderData.artistName}</h3>
          <div className="py-4">
            <Alert visible={actionData?.success || !!actionData?.error}>
              {`${actionData?.error || "Album scrobbled successfully"}`}
            </Alert>
          </div>
          <div className={`${actionData?.success ? "opacity-30" : ""}`}>
            <h4>Tracklist</h4>
            {loaderData.tracks.map((track) => (
              <div className="flex items-center justify-between">
                <div className="flex w-3/4">
                  <div className="w-full">
                    <InputWithLabel
                      label={`Track ${track.trackNumber}`}
                      onChange={() => {}}
                      value={track.track}
                    />
                  </div>
                </div>
                <input
                  className="flex-1/4"
                  type="checkbox"
                  onChange={() => {}}
                  checked
                />
              </div>
            ))}
          </div>
          <button onClick={handleScrobble} className="button button-danger">
            {`${
              navigation.state === "loading" ? "submitting" : "Scrobble album"
            }`}
          </button>
        </CardContent>
      </Card>
    );
  }
  return <div>Wagwan you fat fucking neek</div>;
}
