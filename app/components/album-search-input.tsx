import { Form, Link, useFetcher, useNavigation } from "@remix-run/react";
import { useCombobox } from "downshift";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import type { loader } from "~/routes/api/apple-music-search-album";

import { Input } from "~/components/common/input";

import { Separator } from "~/components/common/separator";
import { Label } from "./common/label";

export function AlbumSearchInput() {
  const fetcher = useFetcher<typeof loader>();
  const [showResults, setShowResults] = useState(false);
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  let [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length <= 2) {
      setShowResults(false);
      return;
    }
    fetcher.submit(
      { query: debouncedQuery },
      { method: "GET", action: "/api/apple-music-search-album" }
    );
    setShowResults(true);
  }, [debouncedQuery]);

  useEffect(() => {
    setShowResults(false);
  }, [navigation.location?.pathname]);

  const { getInputProps } = useCombobox({
    items: fetcher.data || [],
  });

  return (
    <div className="relative w-full">
      <Form
        action="/search"
        method="GET"
        className="flex w-full items-center space-x-2 rounded-md border p-2 text-foreground"
      >
        <Label htmlFor="query">
          <span className="sr-only">Search</span>
          <SearchIcon />
        </Label>
        <Input
          {...getInputProps({
            "aria-expanded":
              fetcher.data?.length && fetcher?.data?.length > 0 ? true : false,
            name: "query",
            onChange: (event) => setQuery(event.currentTarget.value),
            placeholder: "Search for an album",
            type: "search",
            className: "w-full bg-transparent",
            value: query,
          })}
        />
      </Form>
      {showResults && (
        <ul id="search-list" className="space-y-2">
          {fetcher?.data?.map(({ artist, album, albumId, albumArtwork }) => (
            <>
              <li key={album}>
                <Link
                  className="flex items-center space-x-2 p-3 hover:opacity-80"
                  to={encodeURI(`/album-information/${albumId}`)}
                >
                  <img className="rounded-lg" src={albumArtwork} alt={album} />
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">{album}</span>
                    <span>{artist}</span>
                  </div>
                </Link>
              </li>
              <Separator />
            </>
          ))}
        </ul>
      )}
    </div>
  );
}
