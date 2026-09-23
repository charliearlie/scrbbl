import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Link, useNavigation } from "@remix-run/react";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import type { LastfmApiTrack } from "lastfmapi";
import {
  typedjson,
  useTypedActionData,
  useTypedLoaderData,
} from "remix-typedjson";
import invariant from "tiny-invariant";
import { ChevronLeft, Loader2 } from "lucide-react";

import Alert from "~/components/common/alert";
import Checkbox from "~/components/common/checkbox";
import WhenField, { justNow, lastNight } from "~/components/common/when-field";
import { Button } from "~/components/common/button";
import { Badge } from "~/components/common/badge";
import { getAlbumDetails } from "~/services/apple-music.server";
import {
  buildAlbumScrobbles,
  lastfm,
  scrobbleTracks,
} from "~/services/lastfm.server";
import { findDuplicatePlays } from "~/services/recent-tracks.server";
import { recordScrobble } from "~/services/scrobble-log.server";
import {
  albumDurationSeconds,
  buildAlbumTimestamps,
} from "~/services/scrobble-timing";
import type { ScrobbleFailure } from "~/services/scrobble-form.server";
import {
  readTrimmed,
  resolveScrobbleTime,
} from "~/services/scrobble-form.server";
import { getLastfmSession } from "~/services/session.server";
import { cn, formatDuration } from "~/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => ({
  title: data
    ? `${data.collectionName} by ${data.artistName}, Scrbbl`
    : "Album, Scrbbl",
});

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.albumId, "An album id is required");

  const albumDetails = await getAlbumDetails(params.albumId);

  // Throwing gives the branded 404 instead of bouncing back to search with
  // no explanation.
  if (!albumDetails) {
    throw new Response("Album not found", {
      status: 404,
      statusText: "Album not found",
    });
  }

  return typedjson(albumDetails);
};

/** Shape sent up from the tracklist. */
type SubmittedTrack = { artist: string; track: string; duration: number };

function parseTracks(raw: FormDataEntryValue | null): SubmittedTrack[] | null {
  if (typeof raw !== "string") return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    if (parsed.length > 100) return null;

    const tracks = parsed.map((entry) => ({
      artist: typeof entry?.artist === "string" ? entry.artist.trim() : "",
      track: typeof entry?.track === "string" ? entry.track.trim() : "",
      duration: Number(entry?.duration) || 0,
    }));

    return tracks.every((track) => track.artist && track.track) ? tracks : null;
  } catch {
    return null;
  }
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const albumName = readTrimmed(formData, "albumName");
  const albumArtist = readTrimmed(formData, "albumArtist");
  const tracks = parseTracks(formData.get("tracks"));

  if (!albumName || !albumArtist || !tracks) {
    return typedjson<ScrobbleFailure>(
      {
        ok: false,
        error: "Pick at least one track, and give every track a title.",
      },
      { status: 400 }
    );
  }

  const time = resolveScrobbleTime(formData);
  if (!time.ok) {
    return typedjson<ScrobbleFailure>(
      { ok: false, timeError: time.error },
      { status: 400 }
    );
  }

  const session = await getLastfmSession(request);
  if (!session?.key || !session?.username) {
    return typedjson<ScrobbleFailure>(
      {
        ok: false,
        error:
          "Your Last.FM session has expired. Log in again and your selection will still be here.",
      },
      { status: 401 }
    );
  }

  lastfm.setSessionCredentials(session.username, session.key);

  const scrobbles = buildAlbumScrobbles(
    albumName,
    tracks as LastfmApiTrack[],
    albumArtist,
    time.timestamp
  );

  // Advisory only, and skipped once the user has seen the warning and
  // chosen to send anyway.
  if (readTrimmed(formData, "confirmed") !== "true") {
    const duplicates = await findDuplicatePlays({
      username: session.username,
      tracks: scrobbles,
    });

    if (duplicates.length > 0) {
      return typedjson<ScrobbleFailure>(
        { ok: false, duplicates },
        { status: 409 }
      );
    }
  }

  const result = await scrobbleTracks(scrobbles);

  if (!result.ok) {
    return typedjson<ScrobbleFailure>(
      { ok: false, error: result.error },
      { status: 502 }
    );
  }

  await recordScrobble({
    username: session.username,
    source: "album",
    tracks: result.sent,
    accepted: result.accepted,
    ignored: result.ignored,
    ignoredReasons: result.ignoredReasons,
    album: albumName,
    albumArtist,
  });

  return typedjson({
    ok: true as const,
    accepted: result.accepted,
    ignored: result.ignored,
    username: session.username,
  });
};

function clockTime(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlbumDetails() {
  const album = useTypedLoaderData<typeof loader>();
  const actionData = useTypedActionData<typeof action>();
  const navigation = useNavigation();

  const tracksRef = useRef<HTMLInputElement>(null);
  const timestampRef = useRef<HTMLInputElement>(null);

  const [excluded, setExcluded] = useState<Set<number>>(() => new Set());
  const [titles, setTitles] = useState<Record<number, string>>({});
  const [datetime, setDatetime] = useState("");

  // "Now" is a client fact. Resolving it after mount keeps the server and
  // browser renders identical.
  const [finishedAt, setFinishedAt] = useState<Date | null>(null);
  useEffect(() => {
    setFinishedAt(datetime ? new Date(datetime) : new Date());
  }, [datetime]);

  const isSubmitting = navigation.state === "submitting";
  const succeeded = actionData?.ok === true;
  const failed = actionData?.ok === false;
  const duplicates = (failed && actionData.duplicates) || [];

  const rows = useMemo(
    () =>
      album.tracks.map((track, index) => ({
        index,
        included: !excluded.has(index),
        title: titles[index] ?? track.track ?? "",
        duration: track.duration ?? 0,
        artist: track.artist,
        trackNumber: track.trackNumber,
      })),
    [album.tracks, excluded, titles]
  );

  const includedRows = rows.filter((row) => row.included);

  /** index -> the moment that track starts playing. */
  const startTimes = useMemo(() => {
    if (!finishedAt) return new Map<number, number>();

    const finishSeconds = Math.floor(finishedAt.getTime() / 1000);
    const stamped = buildAlbumTimestamps(
      includedRows.map((row) => ({
        artist: row.artist,
        track: row.title,
        duration: row.duration,
      })),
      finishSeconds
    );

    return new Map(
      includedRows.map((row, position) => [
        row.index,
        stamped[position].timestamp as number,
      ])
    );
  }, [finishedAt, includedRows]);

  const totalSeconds = albumDurationSeconds(
    includedRows.map((row) => ({ duration: row.duration }))
  );

  const toggle = (index: number) =>
    setExcluded((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });

  const toggleAll = () =>
    setExcluded((current) =>
      current.size === 0 ? new Set(album.tracks.map((_, i) => i)) : new Set()
    );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (includedRows.length === 0) {
      event.preventDefault();
      return;
    }

    if (tracksRef.current) {
      tracksRef.current.value = JSON.stringify(
        includedRows.map((row) => ({
          artist: row.artist,
          track: row.title.trim(),
          duration: row.duration,
        }))
      );
    }

    if (timestampRef.current) {
      const seconds = datetime
        ? Math.floor(new Date(datetime).getTime() / 1000)
        : Math.floor(Date.now() / 1000);
      timestampRef.current.value = String(seconds);
    }
  };

  const releaseYear = album.releaseDate
    ? new Date(album.releaseDate).getFullYear()
    : null;

  return (
    <div className="relative">
      {/* The cover, blurred, as the page's only source of colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden"
      >
        <img
          alt=""
          src={album.artworkUrl}
          className="opacity-45 h-full w-full scale-125 object-cover blur-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
      </div>

      <Form
        method="post"
        onSubmit={handleSubmit}
        className="relative mx-auto max-w-4xl px-5 pb-32 pt-6 sm:px-8 sm:pb-36 sm:pt-8"
      >
        <input type="hidden" name="albumName" value={album.collectionName} />
        <input type="hidden" name="albumArtist" value={album.artistName} />
        <input type="hidden" name="tracks" ref={tracksRef} />
        <input type="hidden" name="timestamp" ref={timestampRef} />

        <Link
          to="/album-scrobble"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          Back to album search
        </Link>

        <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-7">
          <img
            alt={`${album.collectionName} by ${album.artistName}`}
            src={album.artworkUrl}
            width={180}
            height={180}
            className="h-36 w-36 rounded-lg border border-border object-cover shadow-[0_26px_60px_hsl(240_10%_2%/0.65)] sm:h-44 sm:w-44"
          />
          <div className="flex min-w-0 flex-col gap-2.5">
            <h1 className="text-3xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-5xl">
              {album.collectionName}
            </h1>
            <p className="text-lg font-medium text-foreground/90 sm:text-xl">
              {album.artistName}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs tabular-nums text-muted-foreground">
              {releaseYear ? <span>{releaseYear}</span> : null}
              <span aria-hidden="true" className="h-3 w-px bg-border" />
              <span className="font-sans">{album.genre}</span>
              <span aria-hidden="true" className="h-3 w-px bg-border" />
              <span>
                {album.tracks.length} tracks,{" "}
                {formatDuration(albumDurationSeconds(album.tracks))}
              </span>
              {album.contentRating ? (
                <Badge variant="outline">{album.contentRating}</Badge>
              ) : null}
            </div>
          </div>
        </header>

        <div className="mt-8 flex flex-col gap-6">
          {succeeded ? (
            <Alert variant="success" title="Album scrobbled">
              {actionData.accepted} tracks are on{" "}
              <a
                href={`https://www.last.fm/user/${actionData.username}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                your profile
              </a>
              {actionData.ignored > 0
                ? `. Last.FM ignored ${actionData.ignored}.`
                : "."}
            </Alert>
          ) : null}

          {failed && actionData.error ? (
            <Alert variant="error" title="Last.FM did not accept that">
              {actionData.error}
            </Alert>
          ) : null}

          {duplicates.length > 0 ? (
            <Alert
              variant="warning"
              title={
                duplicates.length === 1
                  ? "This one is already on your profile"
                  : `${duplicates.length} of these are already on your profile`
              }
            >
              <ul className="mt-1 flex flex-col gap-1">
                {duplicates.map((duplicate) => (
                  <li
                    key={`${duplicate.artist}-${duplicate.track}-${duplicate.playedAt}`}
                    className="flex flex-wrap gap-x-2 text-sm"
                  >
                    <span className="text-foreground">{duplicate.track}</span>
                    <span className="font-mono text-xs tabular-nums">
                      scrobbled {clockTime(new Date(duplicate.playedAt * 1000))}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="submit"
                name="confirmed"
                value="true"
                className="mt-3 rounded-sm font-semibold text-foreground underline underline-offset-4"
              >
                Send them anyway
              </button>
            </Alert>
          ) : null}

          <div className="bezel rounded-lg border border-border bg-card p-5 sm:p-6">
            <WhenField
              label="When did you finish it?"
              value={datetime}
              onChange={setDatetime}
              presets={[
                justNow,
                {
                  label: "This morning",
                  resolve: () => {
                    const date = new Date();
                    date.setHours(9, 0, 0, 0);
                    return date;
                  },
                },
                lastNight,
              ]}
              error={failed ? actionData.timeError : null}
              describe={(resolved) => {
                // Same element shape whether or not the clock has resolved:
                // only the text inside the spans changes after mount.
                const ready = resolved !== null && includedRows.length > 0;
                const startsAt = ready
                  ? clockTime(
                      new Date(
                        (resolved.getTime() / 1000 - totalSeconds) * 1000
                      )
                    )
                  : "--:--";
                const endsAt = ready ? clockTime(resolved) : "--:--";

                return (
                  <>
                    Tracks land between{" "}
                    <span className="font-mono tabular-nums text-foreground">
                      {startsAt}
                    </span>{" "}
                    and{" "}
                    <span className="font-mono tabular-nums text-foreground">
                      {endsAt}
                    </span>
                    , spaced by track length.
                  </>
                );
              }}
            />
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold tracking-[-0.02em]">
                Tracklist
              </h2>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {includedRows.length} of {album.tracks.length} selected
                </span>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="rounded-sm text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
                >
                  {excluded.size === 0 ? "Clear all" : "Select all"}
                </button>
              </div>
            </div>

            <ul className="flex flex-col gap-1">
              {rows.map((row) => {
                const startsAt = startTimes.get(row.index);

                return (
                  <li
                    key={row.index}
                    className={cn(
                      "flex items-center gap-3 rounded-md border px-3 py-2.5 sm:gap-4",
                      "transition-colors duration-200 ease-swift",
                      row.included
                        ? "border-border bg-card"
                        : "border-transparent bg-transparent opacity-50"
                    )}
                  >
                    <Checkbox
                      label={`Scrobble ${row.title}`}
                      checked={row.included}
                      onChange={() => toggle(row.index)}
                    />

                    <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {row.trackNumber ?? row.index + 1}
                    </span>

                    <input
                      type="text"
                      value={row.title}
                      aria-label={`Track ${
                        row.trackNumber ?? row.index + 1
                      } title`}
                      disabled={!row.included}
                      onChange={(event) =>
                        setTitles((current) => ({
                          ...current,
                          [row.index]: event.target.value,
                        }))
                      }
                      className={cn(
                        "min-w-0 flex-1 rounded-sm border border-transparent bg-transparent px-2 py-1.5",
                        "text-[0.9375rem] text-foreground",
                        "transition-colors duration-200 ease-swift",
                        "hover:border-border hover:bg-raised",
                        "focus:border-primary focus:bg-raised focus:outline-none",
                        "disabled:cursor-not-allowed disabled:line-through"
                      )}
                    />

                    <span className="hidden w-11 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground sm:block">
                      {formatDuration(row.duration / 1000)}
                    </span>

                    <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {!row.included
                        ? "skip"
                        : startsAt
                        ? clockTime(new Date(startsAt * 1000))
                        : "--:--"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Sticky, so the count and the action stay with you down a long
            tracklist. Blur is safe here: the bar does not scroll. */}
        <div className="bg-background/85 fixed inset-x-0 bottom-0 z-20 border-t border-border backdrop-blur-xl sm:left-[76px]">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-5 py-3.5 sm:px-8">
            <p className="hidden flex-1 text-sm text-muted-foreground sm:block">
              {includedRows.length === 0
                ? "Nothing selected yet."
                : `${includedRows.length} ${
                    includedRows.length === 1 ? "track" : "tracks"
                  } will be written to your profile.`}
            </p>
            <span className="flex-1 font-mono text-xs tabular-nums text-muted-foreground sm:hidden">
              {includedRows.length}/{album.tracks.length}
            </span>
            <Button
              type="submit"
              disabled={isSubmitting || includedRows.length === 0}
              className="min-w-[11rem]"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                    strokeWidth={2}
                  />
                  Scrobbling
                </>
              ) : (
                `Scrobble ${includedRows.length} ${
                  includedRows.length === 1 ? "track" : "tracks"
                }`
              )}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
