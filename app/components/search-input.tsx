import { Form, useFetcher, useNavigation } from "@remix-run/react";
import { useCombobox } from "downshift";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import type { loader } from "~/routes/api/apple-music-search";

import { Input } from "~/components/common/input";
import { Separator } from "~/components/common/separator";
import { Label } from "./common/label";

type FormState = {
  artist: string;
  track: string;
  album: string;
  albumArtist: string;
  datetime?: string;
};

export function SearchInput({
  callback,
  onClose,
}: {
  callback: (value: React.SetStateAction<FormState>) => void;
  onClose?: () => void;
}) {
  const fetcher = useFetcher<typeof loader>();
  const [showResults, setShowResults] = useState(false);
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  let [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length <= 2) return;
    fetcher.submit(
      { query: debouncedQuery },
      { method: "GET", action: "/api/apple-music-search" }
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
            placeholder: "Search",
            type: "search",
            className: "w-full bg-transparent",
            value: query,
          })}
        />
      </Form>
      {showResults && (
        <ul id="search-list" className="space-y-2 overflow-y-scroll">
          {fetcher?.data?.map(
            ({ artist, album, albumArtist, thumbnail, track }) => (
              <>
                <li
                  key={track}
                  className="flex items-center space-x-2 p-3"
                  role="button"
                  onClick={() => {
                    callback({ artist, album, albumArtist, track });
                    onClose?.();
                  }}
                >
                  <img className="rounded-lg" src={thumbnail} alt={track} />
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">{track}</span>
                    <span>{artist}</span>
                  </div>
                </li>
                <Separator />
              </>
            )
          )}
        </ul>
      )}
    </div>
  );
}
