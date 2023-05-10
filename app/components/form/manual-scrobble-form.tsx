import { useState } from "react";
import { useSubmit } from "@remix-run/react";
import InputWithLabel from "./input-with-label";
import { searchSong } from "~/services/apple-music";

import type { ChangeEvent } from "react";

import AppleMusicButton from "../apple-music-button";

const defaultManualScrobbleState = {
  artist: "",
  track: "",
  album: "",
  albumArtist: "",
};

type FormState = typeof defaultManualScrobbleState & {
  datetime?: string;
};

export default function ManualScrobbleForm() {
  const submit = useSubmit();
  const [formState, setFormState] = useState<FormState>(
    defaultManualScrobbleState
  );
  const { artist, album, albumArtist, datetime, track } = formState;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });
  };

  const appleMusicSearch = async () => {
    const result = await searchSong(`${artist} ${track}`);
    if (!result) {
      setFormState(defaultManualScrobbleState);
    } else if (result.artist && result.track) {
      setFormState({
        artist: result.artist,
        album: result.album!,
        albumArtist: result.albumArtist!,
        track: result.track,
      });
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      formData.append(key, value);
    });

    submit(formData, { method: "post", replace: true });
  };

  const areButtonsDisabled = !artist && !track;
  return (
    <div>
      <form method="post">
        <InputWithLabel
          label="Artist"
          type="text"
          name="artist"
          value={artist}
          onChange={handleInputChange}
        />
        <InputWithLabel
          label="Song title"
          type="text"
          name="track"
          value={track}
          onChange={handleInputChange}
        />
        <InputWithLabel
          label="Album"
          type="text"
          name="album"
          value={album}
          onChange={handleInputChange}
        />
        <InputWithLabel
          label="Album artist"
          type="text"
          name="albumArtist"
          value={albumArtist}
          onChange={handleInputChange}
        />
        <InputWithLabel
          label="Date"
          type="datetime-local"
          name="datetime"
          value={datetime}
          onChange={handleInputChange}
        />
        <p className="font-sm italic">
          Add button to use same artist as song artist
        </p>
      </form>
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
        <button
          className="btn-primary btn w-full sm:w-48"
          disabled={areButtonsDisabled}
          onClick={handleSubmit}
        >
          Scrobble
        </button>
        <div className="flex w-full flex-col items-end">
          <AppleMusicButton
            className="btn-secondary btn flex w-full items-center justify-center gap-4 sm:w-48"
            onClick={appleMusicSearch}
            aria-label="Search for song with Apple Music"
            disabled={areButtonsDisabled}
          />
        </div>
      </div>
    </div>
  );
}
