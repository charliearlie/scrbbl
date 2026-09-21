import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import { Disc3 } from "lucide-react";
import { requireLogin } from "~/services/session.server";
import ScrobbleSearch from "~/components/search/scrobble-search";

export const meta: MetaFunction = () => ({
  title: "Scrobble an album, Scrbbl",
});

export const loader = async ({ request }: LoaderArgs) => {
  await requireLogin(request);
  return typedjson({});
};

export default function AlbumScrobble() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
          Scrobble an album
        </h1>
        <p className="max-w-[55ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          Find the record, then pick the moment you finished it. Every track
          gets its own timestamp, spaced by its real length.
        </p>
      </header>

      <ScrobbleSearch
        autoFocus
        size="hero"
        type="album"
        label="Search for an album"
        placeholder="Album or artist"
      />

      <div className="flex items-start gap-3 rounded-lg border border-border bg-raised p-4">
        <Disc3
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
          strokeWidth={1.6}
        />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Results come from the Apple Music catalogue. Pick one and you can drop
          any track you skipped, and fix a title before it is sent.
        </p>
      </div>
    </div>
  );
}
