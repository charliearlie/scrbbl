import { Settings, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../common/popover";
import { Form, Link } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";

import type { loader } from "~/root";

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
      <PopoverContent className="bg-base-100 w-96 p-4">
        {user && (
          <div>
            <div className="flex flex-col items-center">
              <div className="avatar">
                <div className="mask mask-hexagon w-24">
                  <img alt="Last.FM profile" src={userImage} />
                </div>
              </div>
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
            <div className="stats grid grid-cols-3 shadow">
              <div className="stat place-items-center">
                <a
                  className="link-hover stat-title"
                  href={`${user.url}/library/tracks`}
                >
                  Tracks
                </a>
                <div className="stat-value text-2xl">{user.track_count}</div>
              </div>

              <div className="stat place-items-center">
                <a
                  className="link-hover stat-title"
                  href={`${user.url}/library/artists`}
                >
                  Artists
                </a>
                <div className="stat-value text-2xl text-secondary">
                  {user.artist_count}
                </div>
              </div>

              <div className="stat place-items-center">
                <a
                  className="link-hover stat-title"
                  href={`${user.url}/library/albums`}
                >
                  Albums
                </a>
                <div className="stat-value text-2xl">{user.album_count}</div>
              </div>
            </div>
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
