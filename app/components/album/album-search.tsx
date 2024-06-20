import { Link } from "@remix-run/react";
import { Button } from "../common/button";
import { AlbumSearchInput } from "../album-search-input";

export default function AlbumSearch() {
  return (
    <div>
      <AlbumSearchInput />
      <div className="flex justify-center">
        <Button asChild>
          <Link
            to={`/album-scrobble/search-results/${query}`}
            className="btn-primary btn mt-4 px-12"
          >
            Search
          </Link>
        </Button>
      </div>
    </div>
  );
}
