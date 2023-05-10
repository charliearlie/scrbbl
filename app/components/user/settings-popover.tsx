import { Settings } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../common/popover";
import { Form, Link } from "@remix-run/react";
import { LogOut } from "lucide-react";
import { useTypedLoaderData } from "remix-typedjson";

import { loader } from "~/root";

export default function SettingsPopover() {
  const user = useTypedLoaderData<typeof loader>();
  const userImage =
    user?.image.find((image) => image.size === "large")?.["#text"] || "";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button>
          <Settings className="h-6 w-6 hover:opacity-50" />
          <span className="sr-only">Open popover</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-base-100 p-4">
        {user && (
          <div>
            <div className="flex flex-col items-center">
              <img
                className="h-16 w-16 rounded-full"
                alt="Last.FM profile"
                src={userImage}
              />
              <h4 className="text-2xl">
                <Link
                  className="hover:text-blue-600 hover:underline"
                  to="user/profile"
                >
                  {user.name}
                </Link>
              </h4>
              <p>{user.playcount} Scrobbles</p>
            </div>
            <div className="grid grid-cols-3">
              <div className="flex flex-col items-center">
                <a
                  className="link-hover link"
                  href={`${user.url}/library/tracks`}
                >
                  Tracks
                </a>
                <p className="">{user.track_count}</p>
              </div>
              <div className="flex flex-col items-center">
                <a
                  className="link-hover link"
                  href={`${user.url}/library/artists`}
                >
                  Artists
                </a>
                <p>{user.artist_count}</p>
              </div>
              <div className="flex flex-col items-center">
                <a
                  className="link-hover link"
                  href={`${user.url}/library/albums`}
                >
                  Albums
                </a>
                <p>{user.album_count}</p>
              </div>
            </div>
            <div className="divider" />
            <div className="flex items-center justify-between p-4">
              <a className="standard-link" href={user.url}>
                View on Last.FM
              </a>
              <Form method="post" action="/">
                <button className="button button-danger flex items-center gap-1">
                  Log out <LogOut className="h-4 w-4" strokeWidth={4} />
                </button>
              </Form>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
