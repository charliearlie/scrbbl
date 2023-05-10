import type { ChangeEvent } from "react";
import { useState } from "react";
import { Link } from "@remix-run/react";
import InputWithLabel from "../form/input-with-label";

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
          className="btn-primary btn mt-4 px-12"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
