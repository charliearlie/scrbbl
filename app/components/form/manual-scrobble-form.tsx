import { useRef, useState } from "react";
import { Form, useNavigation } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import InputWithLabel from "~/components/common/input-with-label";
import WhenField from "~/components/common/when-field";
import { Button } from "~/components/common/button";
import { AppleMusicDialogForm } from "./apple-music-dialog-form";
import type { SongInfo } from "~/services/apple-music.server";
import { dateTimeLocalToSeconds } from "~/utils";

export type ManualScrobbleDefaults = {
  artist: string;
  track: string;
  album: string;
  albumArtist: string;
};

export const emptyManualScrobble: ManualScrobbleDefaults = {
  artist: "",
  track: "",
  album: "",
  albumArtist: "",
};

type Props = {
  defaults?: ManualScrobbleDefaults;
  timeError?: string | null;
};

export default function ManualScrobbleForm({
  defaults = emptyManualScrobble,
  timeError,
}: Props) {
  const navigation = useNavigation();
  const artistInputRef = useRef<HTMLInputElement>(null);
  const timestampRef = useRef<HTMLInputElement>(null);

  const [fields, setFields] = useState<ManualScrobbleDefaults>(defaults);
  // Empty means "now", resolved at the moment of submitting.
  const [datetime, setDatetime] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  const update =
    (name: keyof ManualScrobbleDefaults) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setFields((current) => ({ ...current, [name]: event.target.value }));

  const fillFromAppleMusic = (song: SongInfo) => {
    setFields({
      artist: song.artist,
      track: song.track,
      album: song.album,
      albumArtist: song.albumArtist,
    });
    setShowErrors(false);
  };

  const clearForm = () => {
    setFields(emptyManualScrobble);
    setDatetime("");
    setShowErrors(false);
    artistInputRef.current?.focus();
  };

  // Last.FM rejects a scrobble without both of these, so the form says so
  // rather than letting the request fail silently. The old check was
  // `!artist && !track`, which let a half-filled form through.
  const missingArtist = fields.artist.trim() === "";
  const missingTrack = fields.track.trim() === "";
  const isIncomplete = missingArtist || missingTrack;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (isIncomplete) {
      event.preventDefault();
      setShowErrors(true);
      (missingArtist ? artistInputRef.current : null)?.focus();
      return;
    }

    // Resolved here so the timestamp is in the listener's timezone, not the
    // server's.
    const seconds = datetime
      ? dateTimeLocalToSeconds(datetime)
      : Math.floor(Date.now() / 1000);

    if (timestampRef.current) timestampRef.current.value = String(seconds);
  };

  return (
    <Form method="post" onSubmit={handleSubmit} className="flex flex-col gap-7">
      <input type="hidden" name="timestamp" ref={timestampRef} />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-raised p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Know the track? Search for it and every field fills itself.
        </p>
        <AppleMusicDialogForm onSelect={fillFromAppleMusic} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <InputWithLabel
          ref={artistInputRef}
          label="Artist"
          name="artist"
          type="text"
          autoComplete="off"
          value={fields.artist}
          onChange={update("artist")}
          error={
            showErrors && missingArtist ? "Last.FM needs an artist." : null
          }
        />
        <InputWithLabel
          label="Song title"
          name="track"
          type="text"
          autoComplete="off"
          value={fields.track}
          onChange={update("track")}
          error={
            showErrors && missingTrack ? "Last.FM needs a song title." : null
          }
        />
        <InputWithLabel
          label="Album"
          name="album"
          type="text"
          optional
          autoComplete="off"
          value={fields.album}
          onChange={update("album")}
        />
        <InputWithLabel
          label="Album artist"
          name="albumArtist"
          type="text"
          optional
          autoComplete="off"
          hint="Only needed for compilations and splits."
          value={fields.albumArtist}
          onChange={update("albumArtist")}
        />
      </div>

      <WhenField
        label="When did you listen?"
        value={datetime}
        onChange={setDatetime}
        error={timeError}
      />

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={clearForm}>
          Clear the form
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="sm:min-w-[10rem]"
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
            "Scrobble"
          )}
        </Button>
      </div>
    </Form>
  );
}
