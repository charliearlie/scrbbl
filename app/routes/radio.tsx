import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { Form, useNavigation, useSearchParams } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import {
  typedjson,
  useTypedActionData,
  useTypedLoaderData,
} from "remix-typedjson";
import { RadioTower } from "lucide-react";

import { getLastfmSession, requireLogin } from "~/services/session.server";
import { lastfm, scrobbleTracks } from "~/services/lastfm.server";
import {
  BBC_STATIONS,
  getRecentPlays,
  isBbcStation,
} from "~/services/recent-tracks.server";
import { MAX_SCROBBLE_AGE_SECONDS } from "~/services/scrobble-timing";
import { readTrimmed } from "~/services/scrobble-form.server";
import type { ScrobbleFailure } from "~/services/scrobble-form.server";
import { recordScrobble } from "~/services/scrobble-log.server";
import Alert from "~/components/common/alert";
import { Button } from "~/components/common/button";
import Checkbox from "~/components/common/checkbox";
import EmptyState from "~/components/common/empty-state";
import { cn } from "~/utils";

export const meta: MetaFunction = () => ({
  title: "Scrobble the radio, Scrbbl",
});

/** Windows that match how people actually listen, rather than a date picker. */
const WINDOWS = [
  { value: "1", label: "Last hour" },
  { value: "2", label: "Last 2 hours" },
  { value: "3", label: "Last 3 hours" },
  { value: "6", label: "Last 6 hours" },
  { value: "12", label: "Last 12 hours" },
] as const;

const DEFAULT_STATION = BBC_STATIONS[0].id;
const DEFAULT_HOURS = "2";

function readWindow(value: string | null): number {
  const hours = Number(value);
  return WINDOWS.some((w) => w.value === value) && Number.isFinite(hours)
    ? hours
    : Number(DEFAULT_HOURS);
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireLogin(request);

  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("station");
  const station =
    requested && isBbcStation(requested) ? requested : DEFAULT_STATION;
  const hours = readWindow(searchParams.get("hours"));

  const now = Math.floor(Date.now() / 1000);
  const from = now - hours * 60 * 60;

  const history = await getRecentPlays({ user: station, from, to: now });

  if (!history.ok) {
    return typedjson({
      station,
      hours,
      plays: [],
      error: history.error,
    });
  }

  // Last.FM silently drops anything past its age limit, so never offer it.
  const oldest = now - MAX_SCROBBLE_AGE_SECONDS;

  return typedjson({
    station,
    hours,
    plays: history.plays.filter((play) => play.timestamp > oldest),
    error: null as string | null,
  });
};

function parseSelection(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    if (parsed.length > 200) return null;

    const tracks = parsed.map((entry) => ({
      artist: typeof entry?.artist === "string" ? entry.artist.trim() : "",
      track: typeof entry?.track === "string" ? entry.track.trim() : "",
      timestamp: Number(entry?.timestamp),
    }));

    return tracks.every(
      (t) => t.artist && t.track && Number.isFinite(t.timestamp)
    )
      ? tracks
      : null;
  } catch {
    return null;
  }
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const tracks = parseSelection(formData.get("selection"));

  if (!tracks) {
    return typedjson<ScrobbleFailure>(
      { ok: false, error: "Pick at least one track from the playlist." },
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

  // The broadcast times are the real times, so unlike an album these are not
  // computed backwards from an anchor. They go out exactly as they aired.
  const result = await scrobbleTracks(tracks);

  if (!result.ok) {
    return typedjson<ScrobbleFailure>(
      { ok: false, error: result.error },
      { status: 502 }
    );
  }

  await recordScrobble({
    username: session.username,
    source: "bbc",
    tracks: result.sent,
    accepted: result.accepted,
    ignored: result.ignored,
    ignoredReasons: result.ignoredReasons,
    album: readTrimmed(formData, "stationName"),
  });

  return typedjson({
    ok: true as const,
    accepted: result.accepted,
    ignored: result.ignored,
    username: session.username,
  });
};

function clockTime(seconds: number) {
  return new Date(seconds * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Radio() {
  const { error, hours, plays, station } = useTypedLoaderData<typeof loader>();
  const actionData = useTypedActionData<typeof action>();
  const navigation = useNavigation();
  const [, setSearchParams] = useSearchParams();

  const [excluded, setExcluded] = useState<Set<number>>(new Set());

  // A new window is a new playlist, so old exclusions mean nothing.
  useEffect(() => {
    setExcluded(new Set());
  }, [station, hours]);

  const included = useMemo(
    () => plays.filter((_, index) => !excluded.has(index)),
    [plays, excluded]
  );

  const stationName =
    BBC_STATIONS.find((s) => s.id === station)?.name ?? station;

  const succeeded = actionData?.ok === true;
  const failed = actionData?.ok === false;
  const loading = navigation.state === "loading";

  function toggle(index: number) {
    setExcluded((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
          Scrobble the radio
        </h1>
        <p className="max-w-[58ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          The BBC scrobbles its own stations, so Scrbbl can read exactly what
          went out and when. Pick what you actually heard — the times are the
          broadcast times, not a guess.
        </p>
      </header>

      <Form
        method="get"
        className="bezel flex flex-wrap gap-4 rounded-lg border border-border bg-card p-5"
        onChange={(event) => {
          const data = new FormData(event.currentTarget);
          setSearchParams({
            station: String(data.get("station") ?? DEFAULT_STATION),
            hours: String(data.get("hours") ?? DEFAULT_HOURS),
          });
        }}
      >
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Station
          </span>
          <select
            name="station"
            defaultValue={station}
            className="rounded-md border border-border bg-raised px-3 py-2 text-[0.9375rem] text-foreground focus:border-primary focus:outline-none"
          >
            {BBC_STATIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            How far back
          </span>
          <select
            name="hours"
            defaultValue={String(hours)}
            className="rounded-md border border-border bg-raised px-3 py-2 text-[0.9375rem] text-foreground focus:border-primary focus:outline-none"
          >
            {WINDOWS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <noscript>
          <Button type="submit" className="self-end">
            Show playlist
          </Button>
        </noscript>
      </Form>

      {succeeded ? (
        <Alert variant="success" title="Radio scrobbled">
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
        <Alert variant="error" title="That did not go through">
          {actionData.error}
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="error" title="Could not read the station">
          {error}
        </Alert>
      ) : null}

      <Form method="post" className="flex flex-col gap-4">
        <input type="hidden" name="stationName" value={stationName} />
        <input
          type="hidden"
          name="selection"
          value={JSON.stringify(included)}
          readOnly
        />

        {plays.length === 0 && !error ? (
          <div className="bezel rounded-lg border border-border bg-card">
            <EmptyState
              Icon={RadioTower}
              title="Nothing in that window"
              description={`${stationName} played no music in the last ${hours} hour${
                hours === 1 ? "" : "s"
              }, or the feed has not caught up yet. Try a longer window.`}
            />
          </div>
        ) : null}

        {plays.length > 0 ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold tracking-[-0.02em]">
                {stationName}
              </h2>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {included.length} of {plays.length} selected
              </span>
            </div>

            <ul className={cn("flex flex-col gap-1", loading && "opacity-50")}>
              {plays.map((play, index) => {
                const on = !excluded.has(index);
                return (
                  <li
                    key={`${play.timestamp}-${index}`}
                    className={cn(
                      "flex items-center gap-3 rounded-md border px-3 py-2.5 sm:gap-4",
                      "transition-colors duration-200 ease-swift",
                      on
                        ? "border-border bg-card"
                        : "border-transparent opacity-50"
                    )}
                  >
                    <Checkbox
                      label={`Scrobble ${play.track}`}
                      checked={on}
                      onChange={() => toggle(index)}
                    />
                    <span className="w-11 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {clockTime(play.timestamp)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.9375rem]">
                      {play.track}
                    </span>
                    <span className="min-w-0 max-w-[40%] truncate text-sm text-muted-foreground">
                      {play.artist}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="bg-background/85 sticky bottom-0 flex items-center gap-4 border-t border-border py-4 backdrop-blur-xl">
              <p className="hidden flex-1 text-sm text-muted-foreground sm:block">
                Scrobbled at the times they aired.
              </p>
              <Button type="submit" disabled={included.length === 0}>
                Scrobble {included.length} track
                {included.length === 1 ? "" : "s"}
              </Button>
            </div>
          </>
        ) : null}
      </Form>
    </div>
  );
}
