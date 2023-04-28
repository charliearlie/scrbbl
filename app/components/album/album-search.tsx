import { ChangeEvent, useState } from "react";
import InputWithLabel from "../form/input-with-label";

type Props = {
  handleSearch: (query: string) => void;
};
export default function AlbumSearch({ handleSearch }: Props) {
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
        <button
          className="button button-primary mt-4 px-12"
          onClick={() => handleSearch(query)}
          disabled={!!!query}
        >
          Search
        </button>
      </div>
    </div>
  );
}
