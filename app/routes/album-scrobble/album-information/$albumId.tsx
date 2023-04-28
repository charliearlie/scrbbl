import { LoaderArgs } from "@remix-run/server-runtime";
import { useLayoutEffect } from "react";
import { redirect, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { Card, CardContent } from "~/components/card";
import InputWithLabel from "~/components/form/input-with-label";
import { getAlbumDetails } from "~/services/apple-music.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.albumId, "Expected an album id you sausage");

  const { albumId } = params;
  const albumDetails = await getAlbumDetails(albumId);

  if (!albumDetails) {
    redirect("/album-scrobble");
  } else {
    return albumDetails;
  }
};

export default function AlbumDetails() {
  const loaderData = useTypedLoaderData<typeof loader>();

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useLayoutEffect(() => {
    scrollToElement("album-name");
  }, []);

  if (loaderData) {
    return (
      <Card>
        <CardContent className="py-8 px-8">
          <h2 id="album-name" className="scroll-mt-16">
            {loaderData.collectionName}
          </h2>
          <h3>{loaderData.artistName}</h3>
          <button className="button button-danger">Scrobble album</button>
          <div>
            {loaderData.tracks.map((track) => (
              <>
                {/*Getting into div soup territory here*/}
                <div className="flex items-center justify-between">
                  <div className="flex w-3/4">
                    <div className="w-full">
                      <InputWithLabel
                        label={`Track ${track.trackNumber}`}
                        value={track.track}
                      />
                    </div>
                  </div>
                  <input className="flex-1/4" type="checkbox" checked />
                </div>
              </>
            ))}
          </div>
          <button className="button button-danger">Scrobble album</button>
        </CardContent>
      </Card>
    );
  }
  return <div>Wagwan you fat fucking neek</div>;
}
