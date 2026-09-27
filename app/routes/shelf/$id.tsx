import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useNavigation } from "@remix-run/react";
import { Fragment } from "react";
import { redirect, typedjson, useTypedLoaderData } from "remix-typedjson";
import { ChevronLeft, Disc3, Trash2 } from "lucide-react";

import { getLastfmSession, requireLogin } from "~/services/session.server";
import { getAlbumDetails } from "~/services/apple-music.server";
import { albumDurationSeconds } from "~/services/scrobble-timing";
import {
  getShelfAlbum,
  removeFromShelf,
  saveReview,
} from "~/services/shelf.server";
import { MAX_RATING, sleeveImage } from "~/services/shelf";
import { readTrimmed } from "~/services/scrobble-form.server";
import Alert from "~/components/common/alert";
import { Button } from "~/components/common/button";
import { formatDuration } from "~/utils";
import Sleeve from "~/components/shelf/sleeve";

export const meta: MetaFunction<typeof loader> = ({ data }) => ({
  title: data ? `${data.album.title}, Scrbbl` : "Record, Scrbbl",
});

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireLogin(request);

  const session = await getLastfmSession(request);
  const album = await getShelfAlbum(session?.username ?? "", params.id ?? "");

  if (!album) {
    throw new Response("That record is not on your shelf", { status: 404 });
  }

  // Only iTunes-sourced records carry a tracklist; one shelved from the
  // owned-and-played page has no id to look up, and simply shows none.
  const details = album.itunesId ? await getAlbumDetails(album.itunesId) : null;

  return typedjson({
    album,
    tracks: details?.tracks ?? [],
    justAdded: new URL(request.url).searchParams.get("added") === "1",
  });
};

export const action = async ({ params, request }: ActionArgs) => {
  const formData = await request.formData();

  const session = await getLastfmSession(request);
  if (!session?.username) {
    return typedjson(
      { ok: false as const, error: "Your Last.FM session has expired." },
      { status: 401 }
    );
  }

  const id = params.id ?? "";

  if (readTrimmed(formData, "intent") === "remove") {
    await removeFromShelf(session.username, id);
    return redirect("/shelf");
  }

  const saved = await saveReview({
    username: session.username,
    albumId: id,
    rating: formData.get("rating"),
    body: readTrimmed(formData, "body"),
  });

  if (!saved) {
    return typedjson(
      { ok: false as const, error: "That review could not be saved." },
      { status: 500 }
    );
  }

  return redirect(`/shelf/${id}`);
};

function added(seconds: number) {
  return new Date(seconds * 1000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Half-star picker over the 1..10 scale a review is stored on.
 *
 * Radios rather than React state behind a hidden input: it submits with no
 * JavaScript, it is keyboard-navigable for free, and there is no window after
 * paint where clicking a star silently does nothing.
 */
function RatingPicker({ defaultValue }: { defaultValue: number | null }) {
  // Reversed so CSS can fill every half-star below the checked one.
  const halves = Array.from({ length: MAX_RATING }, (_, i) => MAX_RATING - i);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Rating
      </span>

      <div className="flex flex-wrap items-center gap-4">
        <div
          className="rating-input"
          role="radiogroup"
          aria-label="Rating out of five"
        >
          {halves.map((value) => (
            <Fragment key={value}>
              <input
                type="radio"
                id={`rating-${value}`}
                name="rating"
                value={value}
                defaultChecked={value === defaultValue}
              />
              <label
                htmlFor={`rating-${value}`}
                aria-label={`${value / 2} out of 5`}
                title={`${value / 2} out of 5`}
                data-half={value % 2 === 1 ? "left" : "right"}
              >
                <span aria-hidden="true" />
              </label>
            </Fragment>
          ))}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="radio"
            name="rating"
            value=""
            defaultChecked={defaultValue === null}
            className="h-3.5 w-3.5 accent-primary"
          />
          Not rated
        </label>
      </div>
    </div>
  );
}

export default function ShelfRecord() {
  const { album, justAdded, tracks } = useTypedLoaderData<typeof loader>();
  const navigation = useNavigation();
  const saving = navigation.state === "submitting";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
      <Link
        to="/shelf"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
        Back to the shelf
      </Link>

      {justAdded ? (
        <Alert variant="success" title="On the shelf">
          Now say what you made of it — the note is the bit you will want in
          five years, not the sleeve.
        </Alert>
      ) : null}

      <header className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        <div className="w-48 shrink-0 [perspective:1000px]">
          <Sleeve
            artist={album.artist}
            artworkUrl={sleeveImage(album)}
            backUrl={album.coverBack}
            flipId="turn-it-over"
            title={album.title}
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-[-0.035em]">
            {album.title}
          </h1>
          <p className="text-lg text-muted-foreground">{album.artist}</p>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:justify-start">
            <span className="rounded-full border border-border px-2.5 py-1 font-medium">
              {album.owned ? "On the shelf" : "Heard, not owned"}
            </span>
            {album.year ? (
              <span className="font-mono tabular-nums">{album.year}</span>
            ) : null}
            <span>Added {added(album.addedAt)}</span>
          </div>
        </div>
      </header>

      {tracks.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold tracking-[-0.02em]">Tracklist</h2>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {tracks.length} tracks &middot;{" "}
              {formatDuration(albumDurationSeconds(tracks))}
            </span>
          </div>

          <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {tracks.map((track, index) => (
              <li
                key={`${track.track}-${index}`}
                className="flex items-baseline gap-3 px-4 py-2.5 text-sm sm:gap-4"
              >
                <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">{track.track}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {formatDuration((track.duration ?? 0) / 1000)}
                </span>
              </li>
            ))}
          </ol>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="secondary">
              <Link to={`/album-information/${album.itunesId}`}>
                <Disc3
                  aria-hidden="true"
                  className="mr-1.5 h-4 w-4"
                  strokeWidth={1.8}
                />
                Put it on and scrobble it
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Opens the album scrobbler with this record already loaded.
            </p>
          </div>
        </section>
      ) : null}

      <Form method="post" className="flex flex-col gap-6">
        <div className="bezel flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:p-6">
          <RatingPicker defaultValue={album.review?.rating ?? null} />

          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              htmlFor="review-body"
            >
              What you made of it
            </label>
            <textarea
              id="review-body"
              name="body"
              rows={5}
              defaultValue={album.review?.body ?? ""}
              placeholder="Where you were, who put you onto it, which track you keep going back to."
              className="w-full resize-y rounded-md border border-border bg-raised px-3 py-2.5 text-[0.9375rem] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : album.review ? "Update" : "Save"}
            </Button>
            {album.review ? (
              <p className="text-xs text-muted-foreground">
                Last written {added(album.review.updatedAt)}
              </p>
            ) : null}
          </div>
        </div>
      </Form>

      <Form
        method="post"
        onSubmit={(event) => {
          if (
            // eslint-disable-next-line no-alert
            !window.confirm(
              `Take ${album.title} off the shelf? The review goes with it.`
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          name="intent"
          value="remove"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
          Take it off the shelf
        </button>
      </Form>
    </div>
  );
}
