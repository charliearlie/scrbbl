import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { History, TriangleAlert } from "lucide-react";

import { getLastfmSession, requireLogin } from "~/services/session.server";
import { getRecentBatches } from "~/services/scrobble-log.server";
import type { LoggedBatch } from "~/services/scrobble-log.server";
import { Button } from "~/components/common/button";
import EmptyState from "~/components/common/empty-state";

export const meta: MetaFunction = () => ({
  title: "What you sent, Scrbbl",
});

export const loader = async ({ request }: LoaderArgs) => {
  await requireLogin(request);

  const session = await getLastfmSession(request);
  const username = session?.username ?? "";

  return typedjson({
    username,
    batches: await getRecentBatches(username),
  });
};

const SOURCE_LABEL: Record<LoggedBatch["source"], string> = {
  album: "Album",
  manual: "Single track",
  bbc: "BBC radio",
  paste: "Pasted list",
};

function when(seconds: number) {
  return new Date(seconds * 1000).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clock(seconds: number) {
  return new Date(seconds * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Batch({ batch, username }: { batch: LoggedBatch; username: string }) {
  const title = batch.album || batch.tracks[0]?.track || "Scrobble";
  const subtitle = batch.albumArtist || batch.tracks[0]?.artist || "";

  return (
    <li className="bezel overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border px-5 py-4">
        <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em]">
          {title}
        </h2>
        {subtitle ? (
          <p className="flex-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : (
          <span className="flex-1" />
        )}
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          {when(batch.sentAt)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-xs">
        <span className="rounded-full border border-border px-2.5 py-1 font-medium text-muted-foreground">
          {SOURCE_LABEL[batch.source] ?? batch.source}
        </span>
        <span className="font-mono tabular-nums text-success">
          {batch.accepted} accepted
        </span>
        {batch.ignored > 0 ? (
          <span className="font-mono tabular-nums text-muted-foreground">
            {batch.ignored} ignored
          </span>
        ) : null}
      </div>

      {batch.ignoredReasons.length > 0 ? (
        <p className="flex gap-2 border-t border-border px-5 py-3 text-xs leading-relaxed text-muted-foreground">
          <TriangleAlert
            aria-hidden="true"
            className="mt-px h-4 w-4 shrink-0"
            strokeWidth={1.75}
          />
          <span>Last.FM gave a reason: {batch.ignoredReasons.join("; ")}.</span>
        </p>
      ) : null}

      <ol className="divide-y divide-border border-t border-border">
        {batch.tracks.map((track, index) => (
          <li
            key={`${batch.id}-${index}`}
            className="flex items-baseline gap-3 px-5 py-2.5 text-sm"
          >
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {clock(track.timestamp)}
            </span>
            <span className="flex-1 truncate">{track.track}</span>
            <span className="truncate text-xs text-muted-foreground">
              {track.artist}
            </span>
          </li>
        ))}
      </ol>

      {username ? (
        <div className="border-t border-border px-5 py-3">
          <a
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            href={`https://www.last.fm/user/${encodeURIComponent(
              username
            )}/library?from=${new Date(batch.sentAt * 1000)
              .toISOString()
              .slice(0, 10)}`}
            rel="noreferrer noopener"
            target="_blank"
          >
            Open this day in your Last.FM library
          </a>
        </div>
      ) : null}
    </li>
  );
}

export default function ScrobbleLog() {
  const { batches, username } = useTypedLoaderData<typeof loader>();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
          What you sent
        </h1>
        <p className="max-w-[55ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          Every batch Scrbbl has pushed to Last.FM, with what it accepted and
          what it quietly threw away.
        </p>
      </header>

      {batches.length === 0 ? (
        <div className="bezel rounded-xl border border-border bg-card">
          <EmptyState
            Icon={History}
            title="Nothing sent yet"
            description="Scrobble a song or an album and the receipt turns up here, including anything Last.FM refused."
          >
            <Button asChild size="sm">
              <Link to="/album-scrobble">Scrobble an album</Link>
            </Button>
          </EmptyState>
        </div>
      ) : (
        <ol className="flex flex-col gap-4">
          {batches.map((batch) => (
            <Batch batch={batch} key={batch.id} username={username} />
          ))}
        </ol>
      )}
    </div>
  );
}
