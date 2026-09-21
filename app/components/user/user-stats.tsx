import type { User } from "lastfmapi";
import { formatCount } from "~/utils";

type Props = {
  user: User;
  className?: string;
};

/**
 * The four numbers Last.FM gives us, each linking to the matching library
 * page. Tabular figures so the column lines up.
 */
export default function UserStats({ className, user }: Props) {
  const stats = [
    { label: "Scrobbles", value: user.playcount, href: user.url },
    {
      label: "Tracks",
      value: user.track_count,
      href: `${user.url}/library/tracks`,
    },
    {
      label: "Artists",
      value: user.artist_count,
      href: `${user.url}/library/artists`,
    },
    {
      label: "Albums",
      value: user.album_count,
      href: `${user.url}/library/albums`,
    },
  ];

  return (
    <dl className={className}>
      {stats.map(({ href, label, value }) => (
        <div
          key={label}
          className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0"
        >
          <dt>
            <a
              href={href}
              className="rounded-sm text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {label}
            </a>
          </dt>
          <dd className="font-mono text-[0.9375rem] tabular-nums tracking-[-0.02em]">
            {formatCount(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
