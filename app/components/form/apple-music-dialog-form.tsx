import { useState } from "react";
import { Search } from "lucide-react";
import { useMediaQuery } from "~/hooks/use-media-query";
import { Button } from "~/components/common/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/common/drawer";
import ScrobbleSearch from "~/components/search/scrobble-search";
import type { SongInfo } from "~/services/apple-music.server";

type Props = {
  onSelect: (song: SongInfo) => void;
};

const TITLE = "Search Apple Music";
const BLURB =
  "Pick a track and Scrbbl fills in the artist, album and album artist for you.";

/**
 * A dialog on a pointer-sized screen, a bottom sheet on a phone.
 *
 * The search itself is the shared combobox now, so results are keyboard
 * navigable here too, and the component takes the chosen song as a callback
 * rather than cloning its children to inject an `onClose`.
 */
export function AppleMusicDialogForm({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSelect = (song: SongInfo) => {
    onSelect(song);
    setOpen(false);
  };

  const trigger = (
    <Button variant="secondary" className="w-full sm:w-auto">
      <Search aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
      {TITLE}
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="gap-5 border-border bg-card sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{TITLE}</DialogTitle>
            <DialogDescription>{BLURB}</DialogDescription>
          </DialogHeader>
          {/* Sits above the dialog's own padding so the dropdown has room. */}
          <div className="min-h-[19rem]">
            <ScrobbleSearch
              autoFocus
              type="song"
              label="Search Apple Music for a song"
              placeholder="Song or artist"
              onSelectSong={handleSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="border-border bg-card">
        <DrawerHeader className="text-left">
          <DrawerTitle>{TITLE}</DrawerTitle>
          <DrawerDescription>{BLURB}</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-[22rem] px-4 pb-8">
          <ScrobbleSearch
            type="song"
            label="Search Apple Music for a song"
            placeholder="Song or artist"
            onSelectSong={handleSelect}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default AppleMusicDialogForm;
