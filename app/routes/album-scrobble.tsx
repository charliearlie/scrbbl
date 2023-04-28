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
import { AlbumInfo, searchAlbum } from "~/services/apple-music";
import { useState } from "react";
import { Link, Outlet } from "@remix-run/react";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const albumArtist = formData.get("albumArtist");
  const artist = formData.get("artist");
  const track = formData.get("track");
  const album = formData.get("album");
  let timestamp = Math.floor(new Date().getTime() / 1000) - 300;

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

export default function AlbumScrobble() {
  const { token } = useTypedLoaderData<typeof loader>();
  const actionData = useTypedActionData<typeof action>();

  const [searchResults, setSearchResults] = useState<AlbumInfo[]>([]);

  const handleSearch = async (query: string) => {
    const results = await searchAlbum(query);
    setSearchResults(results);
  };

  const hasSearchResults = searchResults.length > 0;

  return (
    <main className="mt-12 p-2">
      <Card>
        <CardContent className="py-8 px-8">
          <h1>Album search</h1>
          <Alert visible={!!actionData}>Scrobbled Successfully</Alert>
          <AlbumSearch handleSearch={handleSearch} />
        </CardContent>
      </Card>
      {hasSearchResults && (
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {searchResults.map((result) => (
                <Link
                  to={`/album-scrobble/album-information/${result.albumId}}`}
                >
                  <img src={result.albumArtwork} alt={result.album} />
                  <h3>{result.album}</h3>
                  <p>{result.artist}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <div className="mt-4">
        <Outlet />
      </div>
    </main>
  );
}
