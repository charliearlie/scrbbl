import { useState } from "react";
import { AlbumSearchInput } from "../album-search-input";

export default function AlbumSearch() {
  const [query] = useState<string>("");
  return (
    <div>
      <AlbumSearchInput />
    </div>
  );
}
