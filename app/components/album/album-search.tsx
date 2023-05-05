import { ChangeEvent, useState } from "react";
import InputWithLabel from "../form/input-with-label";
import { Link } from "@remix-run/react";

export default function AlbumSearch() {
  const [query, setQuery] = useState<string>("");
  return (
    <div>
      <InputWithLabel
        label="Search query"
        placeholder="Enter artist or album name"
        type="text"
        name="query"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setQuery(e.target.value)
        }
      />
      <div className="flex justify-center">
        <Link
          to={`/album-scrobble/search-results/${query}`}
          className="button button-primary mt-4 px-12"
        >
          Search
        </Link>
      </div>
    </div>
  );
}