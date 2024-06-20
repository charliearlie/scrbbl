import * as React from "react";

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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/common/drawer";
import { X } from "lucide-react";

export function AppleMusicDialogForm({ children }: React.PropsWithChildren) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const childrenWithClose = React.cloneElement(children as React.ReactElement, {
    onClose: () => setOpen(false),
  });

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="secondary">
            Search for track
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:min-h-[350px] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Search for a track</DialogTitle>
            <DialogDescription>{childrenWithClose}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" variant="secondary">
          Search for track
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center justify-between">
            <h3>Search for a track</h3>
            <DrawerClose>
              <X />
            </DrawerClose>
          </DrawerTitle>
          <DrawerDescription>{childrenWithClose}</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
