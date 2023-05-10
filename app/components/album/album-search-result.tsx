import { Link } from "@remix-run/react";
import { Card, CardAction, CardContent } from "../card";

type Props = {
  album: string;
  albumArtwork: string;
  albumId: number;
  artist: string;
  releaseDate: number;
};

export default function AlbumSearchResult({
  album,
  albumArtwork,
  albumId,
  artist,
  releaseDate,
}: Props) {
  return (
    <Card>
      <CardContent>
        <div className="flex gap-2">
          <img
            className="rounded"
            src={albumArtwork}
            alt={`${artist} ${album}`}
          />
          <div>
            <h3 className="h-16">{album}</h3>
            <p className="font-semibold">{artist}</p>
            <p>{releaseDate}</p>
          </div>
        </div>
      </CardContent>
      <CardAction>
        <Link
          className="flex w-full items-center justify-between rounded py-1"
          to={encodeURI(`/album-scrobble/album-information/${albumId}`)}
        >
          <span className="text-xl font-semibold">View track list</span>
          <div className="cursor-pointer rounded p-2 outline outline-1 outline-gray-400 dark:text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </Link>
      </CardAction>
    </Card>
  );
}
