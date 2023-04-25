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
            Click scrobble song in the sidebar, if not logged in it should
            instantly redirect you to a login page
          </p>
          <p>
            If you've come back here after logging in, check if your Last FM
            profile picture is in the nav bar (top right)
          </p>
          <p>
            If the above is true, go back to Scrobble song and scrobble
            something
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
