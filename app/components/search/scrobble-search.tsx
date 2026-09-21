import { useEffect, useMemo, useState } from "react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { useCombobox } from "downshift";
import { useDebounce } from "use-debounce";
import { Loader2, Search, SearchX } from "lucide-react";
import type { AlbumInfo, SongInfo } from "~/services/apple-music.server";
import type { SearchResults, SearchType } from "~/routes/api/search";
import { SearchResultSkeleton } from "~/components/common/skeleton";
import EmptyState from "~/components/common/empty-state";
import ResultRow from "./result-row";
import { cn, formatDuration } from "~/utils";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

type SearchItem =
  | { kind: "album"; id: string; album: AlbumInfo }
  | { kind: "song"; id: string; song: SongInfo };

type Props = {
  label: string;
  type?: SearchType;
  placeholder?: string;
  autoFocus?: boolean;
  /** Given, a chosen song is handed back instead of navigating. */
  onSelectSong?: (song: SongInfo) => void;
  size?: "hero" | "default";
  className?: string;
};

function itemTitle(item: SearchItem) {
  return item.kind === "album" ? item.album.album : item.song.track;
}

/**
 * One combobox behind every search surface: the home page searches both
 * kinds, the album page only albums, the scrobble dialog only songs.
 *
 * Downshift was already a dependency but only `getInputProps` was being used,
 * so the results had no keyboard support and no combobox semantics. This
 * wires up the rest: arrow keys move, Enter picks, Escape closes.
 */
export default function ScrobbleSearch({
  autoFocus,
  className,
  label,
  onSelectSong,
  placeholder = "Search a song or an album",
  size = "default",
  type = "all",
}: Props) {
  const fetcher = useFetcher<SearchResults>();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_MS);
  const trimmed = debouncedQuery.trim();

  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    fetcher.submit(
      { query: trimmed, type },
      { method: "get", action: "/api/search" }
    );
    // `fetcher` is a new object on every state transition, so including it
    // here would re-fire the search forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, type]);

  const items = useMemo<SearchItem[]>(() => {
    if (!fetcher.data) return [];
    return [
      ...fetcher.data.albums.map((album) => ({
        kind: "album" as const,
        id: `album-${album.albumId}`,
        album,
      })),
      ...fetcher.data.songs.map((song, index) => ({
        kind: "song" as const,
        id: `song-${index}-${song.track}`,
        song,
      })),
    ];
  }, [fetcher.data]);

  const isOpen = query.trim().length >= MIN_QUERY_LENGTH;
  // Either the request is in flight, or the debounce has not caught up yet.
  const isSearching =
    isOpen && (fetcher.state !== "idle" || debouncedQuery !== query);

  const {
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
  } = useCombobox<SearchItem>({
    items,
    isOpen,
    // Downshift owns the input value. Passing `inputValue` back in as a
    // controlled prop made every keystroke resolve against a stale value,
    // so only the last character ever stuck.
    itemToString: (item) => (item ? itemTitle(item) : ""),
    onInputValueChange: ({ inputValue }) => setQuery(inputValue ?? ""),
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return;

      if (selectedItem.kind === "album") {
        navigate(`/album-information/${selectedItem.album.albumId}`);
        return;
      }

      if (onSelectSong) {
        onSelectSong(selectedItem.song);
        return;
      }

      // No handler, so carry the song over to the scrobble form pre-filled.
      const { album, albumArtist, artist, track } = selectedItem.song;
      const params = new URLSearchParams({ artist, track, album, albumArtist });
      navigate(`/manual-scrobble?${params.toString()}`);
    },
  });

  const firstSongIndex = items.findIndex((item) => item.kind === "song");

  return (
    <div className={cn("relative w-full", className)}>
      <label {...getLabelProps()} className="sr-only">
        {label}
      </label>

      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-border bg-card px-4",
          "bezel-lift transition-colors duration-200 ease-swift",
          "focus-within:border-primary/70",
          size === "hero" ? "h-[4.25rem]" : "h-14"
        )}
      >
        <Search
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
        />
        <input
          {...getInputProps({
            placeholder,
            autoFocus,
            type: "search",
            className: cn(
              // 16px keeps iOS Safari from zooming the viewport on focus.
              "w-full min-w-0 flex-1 border-0 bg-transparent text-base text-foreground outline-none",
              // The bordered wrapper carries the focus treatment for both.
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground",
              "[&::-webkit-search-cancel-button]:appearance-none",
              size === "hero" && "sm:text-lg"
            ),
          })}
        />
        {isSearching ? (
          <Loader2
            aria-hidden="true"
            className="h-4 w-4 shrink-0 animate-spin text-muted-foreground"
            strokeWidth={2}
          />
        ) : null}
      </div>

      <div
        className={cn(
          "absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-lg border border-border",
          "bezel bg-popover shadow-[0_28px_70px_hsl(240_10%_2%/0.7)]",
          isOpen ? "block animate-rise-in" : "hidden"
        )}
      >
        {/* getMenuProps has to be applied on every render, open or not. */}
        <ul {...getMenuProps()} className="max-h-[22rem] overflow-y-auto p-1.5">
          {isOpen && isSearching && items.length === 0 ? (
            <li>
              <SearchResultSkeleton />
            </li>
          ) : null}

          {isOpen && !isSearching && items.length === 0 ? (
            <li>
              <EmptyState
                Icon={SearchX}
                title="Nothing matched that"
                description="Apple Music has no result for this search. Check the spelling, or type the details in by hand."
              />
            </li>
          ) : null}

          {items.map((item, index) => {
            const groupLabel =
              index === 0 && item.kind === "album"
                ? "Albums"
                : index === firstSongIndex && item.kind === "song"
                ? "Songs"
                : null;

            return (
              <li key={item.id}>
                {groupLabel ? (
                  <span className="block px-2.5 pb-1 pt-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {groupLabel}
                  </span>
                ) : null}
                <div
                  {...getItemProps({ item, index })}
                  className="cursor-pointer"
                >
                  {item.kind === "album" ? (
                    <ResultRow
                      highlighted={highlightedIndex === index}
                      artwork={item.album.albumArtwork}
                      title={item.album.album}
                      subtitle={item.album.artist}
                      meta={
                        Number.isNaN(item.album.releaseDate)
                          ? undefined
                          : String(item.album.releaseDate)
                      }
                    />
                  ) : (
                    <ResultRow
                      highlighted={highlightedIndex === index}
                      artwork={item.song.thumbnail}
                      title={item.song.track}
                      subtitle={`${item.song.artist}, ${item.song.album}`}
                      meta={formatDuration(item.song.durationMs / 1000)}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
