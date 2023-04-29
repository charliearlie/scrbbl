import { Link } from "@remix-run/react";
import { LoaderArgs } from "@remix-run/server-runtime";
import { redirect, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { Card, CardAction, CardContent, CardImage } from "~/components/card";
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
    <div className="grid grid-cols-2 gap-4">
      {loaderData.map((result) => (
        <Card>
          <CardContent>
            <div className="flex gap-2">
              <img
                className="rounded"
                src={result.albumArtwork}
                alt={`${result.artist} ${result.album}`}
              />
              <div>
                <h3 className="h-16">{result.album}</h3>
                <p className="font-semibold">{result.artist}</p>
                <p>{result.releaseDate}</p>
              </div>
            </div>
          </CardContent>
          <CardAction>
            <Link
              className="flex w-full items-center justify-between rounded py-1"
              to={encodeURI(
                `/album-scrobble/album-information/${result.albumId}`
              )}
            >
              <span className="text-xl font-semibold">View track list</span>
              <div className="cursor-pointer rounded p-2 text-gray-800 outline outline-1 outline-gray-400 dark:text-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>
            </Link>
          </CardAction>
        </Card>
      ))}
    </div>
  );
}
