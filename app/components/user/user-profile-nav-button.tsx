import SettingsPopover from "./settings-popover";
import { Link } from "@remix-run/react";
type Props = {
  profilePhoto: string;
  scrobbleCount: string;
  username: string;
};
export default function UserProfileNavButton({
  profilePhoto,
  scrobbleCount,
  username,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <img
          className="h-8 w-8 rounded-full"
          alt="Last.FM profile"
          src={profilePhoto}
        />
        <div className="">
          <Link to={`user/${username}`} className="text-xl hover:opacity-70">
            {username}
          </Link>
          <p className="text-sm">Scrobbles: {scrobbleCount}</p>
        </div>
      </div>
      <button>
        <SettingsPopover />
      </button>
    </div>
  );
}
