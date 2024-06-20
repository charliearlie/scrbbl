import { useState } from "react";
import { useNavigation, useSubmit } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import type { LastfmApiTrack } from "lastfmapi";
import {
  redirect,
  typedjson,
  useTypedActionData,
  useTypedLoaderData,
} from "remix-typedjson";
import invariant from "tiny-invariant";
import Alert from "~/components/common/alert";
import { Card, CardContent } from "~/components/common/card";
import InputWithLabel from "~/components/common/input-with-label";
import { getAlbumDetails } from "~/services/apple-music.server";
import { lastfm, scrobbleAlbum } from "~/services/lastfm.server";
import { getLastfmSession } from "~/services/session.server";
import { Badge } from "~/components/common/badge";
import { format } from "date-fns";
import { Button } from "~/components/common/button";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.albumId, "Expected an album id you sausage");

  const { albumId } = params;
  const albumDetails = await getAlbumDetails(albumId);

  if (!albumDetails) {
    return redirect("/album-scrobble");
  } else {
    const {
      artistName,
      artworkUrl,
      collectionName,
      genre,
      releaseDate,
      tracks,
    } = albumDetails;
    return typedjson({
      artistName,
      artworkUrl,
      collectionName,
      genre,
      releaseDate,
      tracks,
    });
  }
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const albumName = formData.get("albumName");
  const albumArtist = formData.get("albumArtist");
  const tracks = formData.get("tracks");
  const datetime = formData.get("datetime");

  const isDateTimeValid = datetime && typeof datetime === "string";
  const timestamp =
    Math.floor(
      (isDateTimeValid ? new Date(datetime).getTime() : new Date().getTime()) /
        1000
    ) - 300;

  if (
    typeof albumName !== "string" ||
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
    albumArtist,
    timestamp
  );

  return typedjson({ success: scrobbled, error: null });
};

export default function AlbumDetails() {
  const [dateTime, setDateTime] = useState<string>("");
  const loaderData = useTypedLoaderData<typeof loader>();
  const actionData = useTypedActionData<typeof action>();

  const navigation = useNavigation();
  const submit = useSubmit();

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateTime(event.target.value);
  };

  const handleScrobble = () => {
    if (loaderData) {
      const formData = new FormData();
      formData.append("albumArtist", loaderData.artistName);
      formData.append("albumName", loaderData.collectionName ?? "");
      formData.append("tracks", JSON.stringify(loaderData.tracks));
      formData.append("datetime", dateTime);

      submit(formData, { method: "post" });
    }
    return false;
  };

  if (loaderData) {
    return (
      <main className="container mt-12 bg-background p-2 md:max-w-4xl">
        <Card>
          <CardContent className="py-8 px-8">
            <div className="flex gap-8" id="album-info">
              <img
                className="h-72 w-72 rounded-md"
                src={loaderData.artworkUrl}
                alt=""
              />
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-primary">
                  {loaderData.collectionName}
                </h1>
                <h3 className="text-2xl font-semibold text-card-foreground">
                  {loaderData.artistName}
                </h3>
                <h4 className="text-xl font-medium opacity-90">
                  {format(new Date(loaderData.releaseDate || ""), "yyyy")}
                </h4>
                <Badge className="w-max bg-primary">{loaderData.genre}</Badge>
              </div>
            </div>
            <div className="py-4">
              <Alert visible={actionData?.success || !!actionData?.error}>
                {`${actionData?.error || "Album scrobbled successfully"}`}
              </Alert>
            </div>
            <InputWithLabel
              label="Date and time"
              type="datetime-local"
              name="datetime"
              defaultValue={new Date().toISOString().slice(0, 16)}
              onChange={handleDateChange}
            />
            <div
              className={`mt-4 mb-8 flex flex-col gap-4 ${
                actionData?.success ? "opacity-30" : ""
              }`}
            >
              <h4 className="text-3xl font-black text-primary">Tracklist</h4>
              {loaderData.tracks.map((track) => (
                <div
                  key={track.track}
                  className="flex items-end justify-between"
                >
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
                    className="flex-1/4 checkbox h-8 w-8"
                    type="checkbox"
                    onChange={() => {}}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4">
              <Button
                className="self-end justify-self-end text-lg font-semibold"
                onClick={handleScrobble}
              >
                {`${
                  navigation.state === "loading"
                    ? "submitting"
                    : "Scrobble album"
                }`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }
  return <div>Wagwan you fat fucking neek</div>;
}
