import { useRef, useState } from "react";
import { useSubmit } from "@remix-run/react";
import InputWithLabel from "../common/input-with-label";

import type { ChangeEvent } from "react";

import { Button } from "../common/button";
import { AppleMusicDialogForm } from "./apple-music-dialog-form";
import { SearchInput } from "../search-input";

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
  const artistInputRef = useRef<HTMLInputElement>(null);
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

  const clearForm = () => {
    setFormState(defaultManualScrobbleState);
    artistInputRef.current?.focus();
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
    <div className="flex min-h-full flex-col">
      <div className="flex justify-end">
        <AppleMusicDialogForm>
          <SearchInput callback={setFormState} />
        </AppleMusicDialogForm>
      </div>

      <form className="flex flex-col gap-4" method="post">
        <InputWithLabel
          ref={artistInputRef}
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
      </form>
      <div className="mt-12 flex flex-col items-center justify-center gap-4 justify-self-end sm:flex-row sm:justify-between">
        <Button
          className="w-full sm:w-48"
          disabled={areButtonsDisabled}
          onClick={handleSubmit}
        >
          Scrobble
        </Button>
        <Button
          className="w-full sm:w-48"
          variant="outline"
          disabled={areButtonsDisabled}
          onClick={clearForm}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
