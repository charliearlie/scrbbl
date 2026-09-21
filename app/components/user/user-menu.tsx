import { Form } from "@remix-run/react";
import type { User } from "lastfmapi";
import { ArrowUpRight, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/common/popover";
import { Button } from "~/components/common/button";
import Avatar from "./avatar";
import UserStats from "./user-stats";
import { formatCount } from "~/utils";

type Props = {
  user: User;
  /** Rail sits on the left, so the panel opens to the right of it. */
  side?: "right" | "top";
};

export default function UserMenu({ user, side = "right" }: Props) {
  const avatar =
    user.image?.find((image) => image.size === "large")?.["#text"] || undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Account, ${user.name}`}
          className="rounded-md transition-transform duration-300 ease-swift hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
        >
          <Avatar src={avatar} username={user.name} className="h-10 w-10" />
        </button>
      </PopoverTrigger>

      <PopoverContent side={side} align="end" className="w-72 p-0">
        <div className="flex items-center gap-3 p-4">
          <Avatar src={avatar} username={user.name} className="h-12 w-12" />
          <div className="min-w-0">
            <p className="truncate font-semibold tracking-[-0.01em]">
              {user.name}
            </p>
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {formatCount(user.playcount)} scrobbles
            </p>
          </div>
        </div>

        <div className="px-4">
          <UserStats user={user} />
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border p-3">
          <Button asChild variant="ghost" size="sm">
            <a href={user.url}>
              View on Last.FM
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={1.75}
              />
            </a>
          </Button>
          <Form method="post" action="/">
            <Button type="submit" variant="ghost" size="sm">
              Log out
              <LogOut
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={1.75}
              />
            </Button>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
