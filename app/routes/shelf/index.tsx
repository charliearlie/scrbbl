import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useSearchParams } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Library, Plus } from "lucide-react";

import { getLastfmSession, requireLogin } from "~/services/session.server";
import { getShelf } from "~/services/shelf.server";
import {
  crateImage,
  ratingToStars,
  sortShelf,
  spineColour,
} from "~/services/shelf";
import type { ShelfSort } from "~/services/shelf";
import { Button } from "~/components/common/button";
import EmptyState from "~/components/common/empty-state";
import Sleeve from "~/components/shelf/sleeve";
import Rating from "~/components/shelf/rating";

export const meta: MetaFunction = () => ({
  title: "Your shelf, Scrbbl",
});

const SORTS: Array<{ value: ShelfSort; label: string }> = [
  { value: "added", label: "Recently added" },
  { value: "artist", label: "Artist" },
  { value: "rating", label: "Rating" },
  { value: "year", label: "Year" },
];

function isSort(value: string | null): value is ShelfSort {
  return SORTS.some((sort) => sort.value === value);
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireLogin(request);

  const session = await getLastfmSession(request);
  const username = session?.username ?? "";

  const sortParam = new URL(request.url).searchParams.get("sort");
  const sort: ShelfSort = isSort(sortParam) ? sortParam : "added";

  return typedjson({
    sort,
    albums: sortShelf(await getShelf(username), sort),
  });
};

export default function Shelf() {
  const { albums, sort } = useTypedLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();

  const rated = albums.filter((album) => album.review?.rating != null);
  const average =
    rated.length > 0
      ? rated.reduce((total, a) => total + (a.review?.rating ?? 0), 0) /
        rated.length
      : null;

  return (
    <div className="flex flex-col">
      <header className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-5 pt-10 sm:px-8 sm:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
              Your shelf
            </h1>
            <p className="max-w-[50ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
              {albums.length === 0
                ? "Records you add, and what you made of them."
                : `${albums.length} record${albums.length === 1 ? "" : "s"}${
                    average !== null
                      ? `, averaging ${ratingToStars(
                          Math.round(average)
                        )} stars`
                      : ""
                  }.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {albums.length > 0 ? (
              <Link
                to="/shelf/missing"
                className="rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Owned and played
              </Link>
            ) : null}
            <Button asChild size="sm">
              <Link to="/shelf/add">
                <Plus
                  aria-hidden="true"
                  className="mr-1.5 h-4 w-4"
                  strokeWidth={2.2}
                />
                Add a record
              </Link>
            </Button>
          </div>
        </div>

        {albums.length > 1 ? (
          <Form
            method="get"
            className="flex items-center gap-2"
            onChange={(event) => {
              const data = new FormData(event.currentTarget);
              setSearchParams({ sort: String(data.get("sort") ?? "added") });
            }}
          >
            <label
              className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              htmlFor="shelf-sort"
            >
              Order
            </label>
            <select
              id="shelf-sort"
              name="sort"
              defaultValue={sort}
              className="rounded-md border border-border bg-raised px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Form>
        ) : null}
      </header>

      {albums.length === 0 ? (
        <div className="mx-auto mt-10 w-full max-w-3xl px-5 sm:px-8">
          <div className="bezel rounded-xl border border-border bg-card">
            <EmptyState
              Icon={Library}
              title="Nothing on the shelf yet"
              description="Search for a record you own, put it on the shelf, and say what you thought of it. Scrbbl already knows what you play — this is for what you keep."
            >
              <Button asChild size="sm">
                <Link to="/shelf/add">Find a record</Link>
              </Button>
            </EmptyState>
          </div>
        </div>
      ) : (
        <>
          <div className="crate">
            {albums.map((album) => (
              <div className="crate-item" key={album.id}>
                <Link
                  to={`/shelf/${album.id}`}
                  className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                >
                  <Sleeve
                    artist={album.artist}
                    artworkUrl={crateImage(album)}
                    spine={spineColour(album.artist, album.title)}
                    title={album.title}
                  />
                  <div className="mt-6 flex flex-col items-center gap-1.5 text-center">
                    <p className="text-[0.9375rem] font-semibold leading-tight tracking-[-0.01em]">
                      {album.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {album.artist}
                      {album.year ? (
                        <span className="font-mono tabular-nums">
                          {" "}
                          · {album.year}
                        </span>
                      ) : null}
                    </p>
                    <Rating
                      className="mt-1"
                      rating={album.review?.rating ?? null}
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <p className="mx-auto max-w-3xl px-5 pb-16 text-center text-xs text-muted-foreground sm:px-8">
            Scroll sideways to dig through them.
          </p>
        </>
      )}
    </div>
  );
}
