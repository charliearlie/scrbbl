import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { searchAlbum } from "~/services/apple-music.server";

export const loader = async ({ request }: DataFunctionArgs) => {
  let { searchParams } = new URL(request.url);
  let query = searchParams.get("query");
  invariant(query, "Query is required");

  const searchResults = await searchAlbum(query);

  console.log("searchResults: ", searchResults);

  return json(searchResults);
};
