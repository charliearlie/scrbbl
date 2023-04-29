import type { LoaderArgs } from "@remix-run/node";
import { getUserToken } from "~/services/session.server";
import { typedjson } from "remix-typedjson";
import { Card, CardContent } from "~/components/card";

export const loader = async ({ request }: LoaderArgs) => {
  const userToken = await getUserToken(request);
  return typedjson({ token: userToken });
};

export default function Index() {
  return (
    <main className="p-2 sm:p-8">
      <Card>
        <CardContent className="py-8 px-8">
          <h2>Welcome lad</h2>
          <p>
            Click scrobble album in the sidebar, if not logged in it should
            instantly redirect you to a login page
          </p>
          <p>Ensure you're on the scrobble album page</p>
          <p>Search for any artist or album name</p>
          <p>Are the results both quick and accurate?</p>
          <p>Click an album (ignore design)</p>
          <p>
            Clicking the album should auto scroll you to the album's name,
            artist and list of tracks. Again this should be almost instant.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
