import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import {
  typedjson,
  useTypedActionData,
  useTypedLoaderData,
} from "remix-typedjson";
import { getLastfmSession, requireLogin } from "~/services/session.server";
import { lastfm, scrobbleTracks } from "~/services/lastfm.server";
import type { ScrobbleFailure } from "~/services/scrobble-form.server";
import {
  readTrimmed,
  resolveScrobbleTime,
} from "~/services/scrobble-form.server";
import { recordScrobble } from "~/services/scrobble-log.server";
import ManualScrobbleForm from "~/components/form/manual-scrobble-form";
import Alert from "~/components/common/alert";

export const meta: MetaFunction = () => ({
  title: "Scrobble a song, Scrbbl",
});

export const loader = async ({ request }: LoaderArgs) => {
  await requireLogin(request);

  // The home search hands a song over through the query string.
  const { searchParams } = new URL(request.url);
  return typedjson({
    defaults: {
      artist: searchParams.get("artist") ?? "",
      track: searchParams.get("track") ?? "",
      album: searchParams.get("album") ?? "",
      albumArtist: searchParams.get("albumArtist") ?? "",
    },
  });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const artist = readTrimmed(formData, "artist");
  const track = readTrimmed(formData, "track");
  const album = readTrimmed(formData, "album");
  const albumArtist = readTrimmed(formData, "albumArtist");

  if (!artist || !track) {
    return typedjson<ScrobbleFailure>(
      {
        ok: false,
        error: "Last.FM needs both an artist and a song title.",
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
          "Your Last.FM session has expired. Log in again and the form will still be here.",
      },
      { status: 401 }
    );
  }

  lastfm.setSessionCredentials(session.username, session.key);

  const result = await scrobbleTracks([
    { artist, track, album, albumArtist, timestamp: time.timestamp },
  ]);

  if (!result.ok) {
    return typedjson<ScrobbleFailure>(
      { ok: false, error: result.error },
      { status: 502 }
    );
  }

  await recordScrobble({
    username: session.username,
    source: "manual",
    tracks: result.sent,
    accepted: result.accepted,
    ignored: result.ignored,
    ignoredReasons: result.ignoredReasons,
    album,
    albumArtist,
  });

  return typedjson({
    ok: true as const,
    artist,
    track,
    username: session.username,
  });
};

export default function ManualScrobble() {
  const { defaults } = useTypedLoaderData<typeof loader>();
  const actionData = useTypedActionData<typeof action>();

  const succeeded = actionData?.ok === true;
  const failed = actionData?.ok === false;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
          Scrobble a song
        </h1>
        <p className="max-w-[55ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          One track, written straight to your profile at the time you choose.
        </p>
      </header>

      {succeeded ? (
        <Alert variant="success" title="Scrobbled">
          {actionData.track} by {actionData.artist} is on{" "}
          <a
            href={`https://www.last.fm/user/${actionData.username}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            your profile
          </a>
          .
        </Alert>
      ) : null}

      {failed && actionData.error ? (
        <Alert variant="error" title="Last.FM did not accept that">
          {actionData.error}
        </Alert>
      ) : null}

      <ManualScrobbleForm
        defaults={defaults}
        timeError={failed ? actionData.timeError : null}
      />
    </div>
  );
}
