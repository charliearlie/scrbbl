import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useNavigation, useSearchParams } from "@remix-run/react";
import { redirect, typedjson, useTypedLoaderData } from "remix-typedjson";
import { ChevronLeft, Scale } from "lucide-react";

import { getLastfmSession, requireLogin } from "~/services/session.server";
import { getShelf, addToShelf } from "~/services/shelf.server";
import { getTopAlbums } from "~/services/shelf-gap.server";
import {
  PERIODS,
  findUnowned,
  findUnplayed,
  isPeriod,
} from "~/services/shelf-gap";
import { readTrimmed } from "~/services/scrobble-form.server";
import Alert from "~/components/common/alert";
import { Button } from "~/components/common/button";
import EmptyState from "~/components/common/empty-state";
import Rating from "~/components/shelf/rating";

export const meta: MetaFunction = () => ({
  title: "Owned and played, Scrbbl",
});

export const loader = async ({ request }: LoaderArgs) => {
  await requireLogin(request);

  const session = await getLastfmSession(request);
  const username = session?.username ?? "";

  const requested = new URL(request.url).searchParams.get("period");
  const period = isPeriod(requested) ? requested : "12month";

  const [shelf, top] = await Promise.all([
    getShelf(username),
    getTopAlbums({ user: username, period }),
  ]);

  if (!top.ok) {
    return typedjson({
      period,
      error: top.error,
      unowned: [],
      unplayed: [],
      shelfSize: shelf.length,
    });
  }

  return typedjson({
    period,
    error: null as string | null,
    unowned: findUnowned(top.albums, shelf).slice(0, 12),
    unplayed: findUnplayed(shelf, top.albums).slice(0, 12),
    shelfSize: shelf.length,
  });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const session = await getLastfmSession(request);
  if (!session?.username) return redirect("/login");

  const added = await addToShelf({
    username: session.username,
    artist: readTrimmed(formData, "artist"),
    title: readTrimmed(formData, "title"),
    artworkUrl: readTrimmed(formData, "artworkUrl") || null,
  });

  return added.ok ? redirect(`/shelf/${added.id}`) : redirect("/shelf/missing");
};

export default function OwnedAndPlayed() {
  const { error, period, shelfSize, unowned, unplayed } =
    useTypedLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
      <Link
        to="/shelf"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
        Back to the shelf
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
          Owned and played
        </h1>
        <p className="max-w-[54ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          Discogs knows what you own. Last.FM knows what you play. Scrbbl is the
          only thing that knows both, so it can tell you where they disagree.
        </p>
      </header>

      <Form
        method="get"
        onChange={(event) => {
          const data = new FormData(event.currentTarget);
          setSearchParams({ period: String(data.get("period") ?? "12month") });
        }}
        className="flex items-center gap-2"
      >
        <label
          className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
          htmlFor="gap-period"
        >
          Counting
        </label>
        <select
          id="gap-period"
          name="period"
          defaultValue={period}
          className="rounded-md border border-border bg-raised px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          {PERIODS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Form>

      {error ? (
        <Alert variant="warning" title="Could not read your listening">
          {error} Without it there is nothing to compare your shelf against, so
          neither list below can be trusted and both are hidden.
        </Alert>
      ) : null}

      {error ? null : (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold tracking-[-0.02em]">
            Played, but not on the shelf
          </h2>

          {unowned.length === 0 ? (
            <div className="bezel rounded-xl border border-border bg-card">
              <EmptyState
                Icon={Scale}
                title="Nothing missing"
                description={
                  shelfSize === 0
                    ? "Put some records on the shelf and this fills up with what you play but have not added."
                    : "Everything you play regularly is already on the shelf."
                }
              />
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {unowned.map((album) => (
                <li
                  key={`${album.artist}-${album.title}`}
                  className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 sm:gap-4"
                >
                  <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-primary">
                    {album.playcount}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9375rem]">
                      {album.title}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {album.artist}
                    </span>
                  </span>
                  <Form method="post">
                    <input type="hidden" name="artist" value={album.artist} />
                    <input type="hidden" name="title" value={album.title} />
                    <input
                      type="hidden"
                      name="artworkUrl"
                      value={album.artworkUrl ?? ""}
                    />
                    <Button size="sm" type="submit" disabled={busy}>
                      Shelve it
                    </Button>
                  </Form>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {unplayed.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold tracking-[-0.02em]">
            On the shelf, barely played
          </h2>
          <p className="-mt-2 max-w-[54ch] text-sm text-muted-foreground">
            Scrbbl only sees what reached Last.FM, so a record you played on
            vinyl and never scrobbled will sit here accusingly. That is rather
            the point.
          </p>

          <ul className="flex flex-col gap-1">
            {unplayed.map(({ album, playcount }) => (
              <li key={album.id}>
                <Link
                  to={`/shelf/${album.id}`}
                  className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 transition-colors hover:bg-raised sm:gap-4"
                >
                  <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-muted-foreground">
                    {playcount}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9375rem]">
                      {album.title}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {album.artist}
                    </span>
                  </span>
                  <Rating rating={album.review?.rating ?? null} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
