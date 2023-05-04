import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import { getUserToken, requireLogin } from "~/services/session.server";
import { Card, CardContent } from "~/components/card";
import AlbumSearch from "~/components/album/album-search";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Scrbbl: Scrobble album",
  viewport: "width=device-width,initial-scale=1",
});

export const loader = async ({ request }: LoaderArgs) => {
  await requireLogin(request);
  const userToken = await getUserToken(request);
  return typedjson({ token: userToken });
};

export default function AlbumScrobble() {
  return (
    <main className="mt-12 p-2">
      <Card>
        <CardContent className="py-8 px-8">
          <h1>Album search</h1>
          <AlbumSearch />
        </CardContent>
      </Card>
      <div className="mt-4">
        <Outlet />
      </div>
    </main>
  );
}
