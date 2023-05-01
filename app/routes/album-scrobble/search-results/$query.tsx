import { LoaderArgs } from "@remix-run/server-runtime";
import { redirect, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import AlbumSearchResult from "~/components/album/album-search-result";
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {loaderData.map((result) => (
        <AlbumSearchResult {...result} />
      ))}
    </div>
  );
}
