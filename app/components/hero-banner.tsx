import type { User } from "lastfmapi";
import { Card, CardContent } from "./card";
import LoginButton from "./login-link-button";

type Props = {
  user: User | null;
};

export default function HeroBanner({ user }: Props) {
  return (
    <div className="bg-gradient-to-l from-white to-slate-100 py-8 px-4 dark:bg-gradient-to-r dark:from-black dark:to-gray-800 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="pb-8">
          <h1 className="py-2 font-bold">Welcome to Scrbbl</h1>
          <p className="text-lg">
            Can't find a scrobbler to work on your iPhone, or listened to some
            songs on the radio? Scrbbl makes adding these listens to your
            profile, as easy as possible.
          </p>
          {user?.name ? (
            <>
              <Card className="md:max-w-2xl">
                <CardContent>
                  <h2 className="mb-2 text-xl font-semibold">User insight</h2>
                  <a
                    href={`https://last.fm/user/${user.name}`}
                    className="text-lg"
                  >
                    {user.name}
                  </a>
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <p className="font-bold">Scrobbles</p>
                      <code>{user.playcount}</code>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold">Unique tracks</p>
                      <code>{user.track_count}</code>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold">Artists listened to</p>
                      <code>{user.artist_count}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <h2 className="text-base font-normal">
                Scrbbl works when you are logged in with Last.FM
              </h2>
              <LoginButton />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent>
              <h3 className="mb-4 font-semibold">Scrobble Songs</h3>
              <p>
                Keep track of every song you listen to and explore new music
                based on your listening habits.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="mb-4 font-semibold">Scrobble Albums</h3>
              <p>
                Expand your scrobbling experience by tracking complete albums
                and discovering hidden gems.
              </p>
            </CardContent>
          </Card>
          <Card className="block sm:hidden lg:block">
            <CardContent>
              <h3 className="mb-4 text-2xl font-semibold">Album a day</h3>
              <p>
                Every day we will recommend you an album based on your Last.FM
                history
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
