import { Link } from "@remix-run/react";
import { LoaderArgs } from "@remix-run/server-runtime";
import { redirect, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { Card, CardContent } from "~/components/card";
import { searchAlbum } from "~/services/apple-music.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.query, "Expected an album id you sausage");

  const { query } = params;
  const albumSearchResults = await searchAlbum(query);

  if (!albumSearchResults) {
    redirect("/album-scrobble");
  } else {
    return albumSearchResults;
  }
};

export default function SearchResults() {
  const loaderData = useTypedLoaderData<typeof loader>();

  if (!loaderData) {
    return null;
  }
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loaderData.map((result) => (
            <Link
              to={encodeURI(
                `/album-scrobble/album-information/${result.albumId}`
              )}
            >
              <img src={result.albumArtwork} alt={result.album} />
              <h3>{result.album}</h3>
              <p>{result.artist}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
