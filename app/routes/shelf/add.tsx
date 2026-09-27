import type { ActionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { redirect, typedjson, useTypedActionData } from "remix-typedjson";
import { ChevronLeft } from "lucide-react";

import { getLastfmSession, requireLogin } from "~/services/session.server";
import type { AlbumInfo } from "~/services/apple-music.server";
import { addToShelf, findOnShelf } from "~/services/shelf.server";
import { releaseYear, upscaleArtwork } from "~/services/shelf";
import { enrichSleeve } from "~/services/cover-art.server";
import { readTrimmed } from "~/services/scrobble-form.server";
import Alert from "~/components/common/alert";
import { Button } from "~/components/common/button";
import ScrobbleSearch from "~/components/search/scrobble-search";
import Sleeve from "~/components/shelf/sleeve";

export const meta: MetaFunction = () => ({
  title: "Add a record, Scrbbl",
});

export const loader = async ({ request }: { request: Request }) => {
  await requireLogin(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const artist = readTrimmed(formData, "artist");
  const title = readTrimmed(formData, "title");

  if (!artist || !title) {
    return typedjson(
      { ok: false as const, error: "Pick a record from the search first." },
      { status: 400 }
    );
  }

  const session = await getLastfmSession(request);
  if (!session?.username) {
    return typedjson(
      { ok: false as const, error: "Your Last.FM session has expired." },
      { status: 401 }
    );
  }

  // Warn rather than block, the same way the scrobble duplicate check does:
  // owning two pressings is rarer than adding one twice, but it happens.
  if (readTrimmed(formData, "confirmed") !== "true") {
    const existing = await findOnShelf(session.username, artist, title);
    if (existing) {
      return typedjson(
        {
          ok: false as const,
          duplicateOf: {
            id: existing.id,
            artist: existing.artist,
            title: existing.title,
          },
        },
        { status: 409 }
      );
    }
  }

  const added = await addToShelf({
    username: session.username,
    artist,
    title,
    year: Number(readTrimmed(formData, "year")) || null,
    artworkUrl: readTrimmed(formData, "artworkUrl") || null,
    itunesId: readTrimmed(formData, "itunesId") || null,
    owned: readTrimmed(formData, "owned") !== "false",
  });

  if (!added.ok) {
    return typedjson(
      { ok: false as const, error: added.error },
      { status: 500 }
    );
  }

  // Best effort and awaited: it is two quick lookups and the record page is
  // about to render the sleeve.
  await enrichSleeve(added.id);

  return redirect(`/shelf/${added.id}?added=1`);
};

export default function AddToShelf() {
  const actionData = useTypedActionData<typeof action>();
  const navigation = useNavigation();
  const [chosen, setChosen] = useState<AlbumInfo | null>(null);

  const artwork = upscaleArtwork(chosen?.albumArtwork ?? null);
  const year = chosen ? releaseYear(String(chosen.releaseDate)) : null;
  const duplicate =
    actionData && "duplicateOf" in actionData ? actionData.duplicateOf : null;
  const error = actionData && "error" in actionData ? actionData.error : null;
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

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
          Add a record
        </h1>
        <p className="max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          Find the album, then say whether it is one you own or one you have
          only heard.
        </p>
      </header>

      {error ? (
        <Alert variant="error" title="That did not work">
          {error}
        </Alert>
      ) : null}

      <ScrobbleSearch
        label="Search for a record"
        type="album"
        placeholder="An album you own"
        autoFocus
        onSelectAlbum={setChosen}
      />

      {chosen ? (
        <Form method="post" className="flex flex-col gap-6">
          <input type="hidden" name="artist" value={chosen.artist} />
          <input type="hidden" name="title" value={chosen.album} />
          <input type="hidden" name="year" value={year ?? ""} />
          <input type="hidden" name="artworkUrl" value={artwork ?? ""} />
          <input type="hidden" name="itunesId" value={String(chosen.albumId)} />

          <div className="bezel flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="w-40 shrink-0 [perspective:1000px]">
              <Sleeve
                artist={chosen.artist}
                artworkUrl={artwork}
                title={chosen.album}
              />
            </div>

            <div className="flex flex-1 flex-col gap-4 text-center sm:text-left">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold tracking-[-0.02em]">
                  {chosen.album}
                </h2>
                <p className="text-muted-foreground">
                  {chosen.artist}
                  {year ? (
                    <span className="font-mono tabular-nums"> · {year}</span>
                  ) : null}
                </p>
              </div>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  On the shelf as
                </legend>
                <label className="flex items-center gap-2.5 text-sm">
                  <input
                    type="radio"
                    name="owned"
                    value="true"
                    defaultChecked
                    className="h-4 w-4 accent-primary"
                  />
                  A record I own
                </label>
                <label className="flex items-center gap-2.5 text-sm">
                  <input
                    type="radio"
                    name="owned"
                    value="false"
                    className="h-4 w-4 accent-primary"
                  />
                  One I have only heard
                </label>
              </fieldset>
            </div>
          </div>

          {duplicate ? (
            <Alert variant="warning" title="That one is already on your shelf">
              <p className="text-sm">
                <Link
                  className="font-medium text-foreground underline underline-offset-4"
                  to={`/shelf/${duplicate.id}`}
                >
                  {duplicate.title}
                </Link>{" "}
                by {duplicate.artist}. Add it again only if you genuinely own
                two pressings.
              </p>
              <button
                type="submit"
                name="confirmed"
                value="true"
                className="mt-3 rounded-sm text-sm font-semibold text-foreground underline underline-offset-4"
              >
                Add it anyway
              </button>
            </Alert>
          ) : null}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Putting it on the shelf…" : "Put it on the shelf"}
            </Button>
            <button
              type="button"
              onClick={() => setChosen(null)}
              className="rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Choose a different one
            </button>
          </div>
        </Form>
      ) : null}
    </div>
  );
}
