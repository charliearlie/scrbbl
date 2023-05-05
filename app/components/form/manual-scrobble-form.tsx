import { useState } from "react";
import { useSubmit } from "@remix-run/react";
import InputWithLabel from "./input-with-label";
import { searchSong } from "~/services/apple-music";
import { defaultManualScrobbleState } from "~/utils";

import type { ChangeEvent } from "react";
import type { LastfmApiTrack } from "lastfmapi";
import AppleMusicButton from "../apple-music-button";

export default function ManualScrobbleForm() {
  const submit = useSubmit();
  const [formState, setFormState] = useState<LastfmApiTrack>(
    defaultManualScrobbleState
  );
  const { artist, album, albumArtist, track } = formState;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });
  };

  const appleMusicSearch = async () => {
    const result = await searchSong(`${artist} ${track}`);
    if (result.artist && result.track) {
      setFormState(result);
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
        <p className="font-sm italic">
          Add button to use same artist as song artist
        </p>
      </form>
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
        <button
          className="button button-danger h-3/6 w-full disabled:cursor-not-allowed sm:w-48"
          disabled={areButtonsDisabled}
          onClick={handleSubmit}
        >
          Scrobble
        </button>
        <div className="flex w-full flex-col items-end">
          <AppleMusicButton
            className="button button-secondary flex w-full items-center justify-center gap-4 sm:w-48"
            onClick={appleMusicSearch}
            aria-label="Search for song with Apple Music"
            disabled={areButtonsDisabled}
          />
        </div>
      </div>
    </div>
  );
}