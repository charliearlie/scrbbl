import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { ArrowRight, Disc3, Music2 } from "lucide-react";
import { getUserInfo } from "~/services/session.server";
import ScrobbleSearch from "~/components/search/scrobble-search";
import LoginLinkButton from "~/components/common/login-link-button";
import UserStats from "~/components/user/user-stats";
import { cn } from "~/utils";

export const meta: MetaFunction = () => ({
  title: "Scrbbl, a manual Last.FM scrobbler",
});

export const loader = async ({ request }: LoaderArgs) => {
  const userInfo = await getUserInfo(request);
  return typedjson({ userInfo });
};

type TileProps = {
  to: string;
  title: string;
  copy: string;
  cta: string;
  Icon: typeof Disc3;
  className?: string;
};

function EntryTile({ className, copy, cta, Icon, title, to }: TileProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative flex flex-col justify-between gap-8 overflow-hidden",
        "bezel rounded-lg border border-border bg-card p-6",
        "transition-all duration-300 ease-swift",
        "hover:border-foreground/20 hover:bg-raised",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      {/* Oversized glyph as the tile's texture, clipped by the card. */}
      <Icon
        aria-hidden="true"
        strokeWidth={0.75}
        className="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 text-foreground/[0.05] transition-transform duration-700 ease-swift group-hover:scale-110 group-hover:text-primary/[0.09]"
      />

      <div className="relative flex flex-col gap-3">
        <Icon
          aria-hidden="true"
          className="h-6 w-6 text-primary"
          strokeWidth={1.6}
        />
        <h2 className="text-2xl font-bold tracking-[-0.03em]">{title}</h2>
        <p className="max-w-[38ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          {copy}
        </p>
      </div>

      <span className="relative inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-primary">
        {cta}
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-300 ease-swift group-hover:translate-x-1"
          strokeWidth={2}
        />
      </span>
    </Link>
  );
}

export default function Index() {
  const { userInfo } = useTypedLoaderData<typeof loader>();

  return (
    <div className="ambient-wash">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:gap-16 lg:py-20">
        <section className="flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <h1 className="max-w-[15ch] text-[2.5rem] font-extrabold leading-[0.98] tracking-[-0.045em] [text-wrap:balance] sm:text-5xl lg:text-[3.75rem]">
              The listens your phone never sent.
            </h1>
            <p className="max-w-[52ch] text-base leading-relaxed text-muted-foreground sm:text-[1.0625rem]">
              Search once. Scrbbl pulls the artist, album and track length from
              Apple Music, then writes it to Last.FM at the minute you actually
              heard it.
            </p>
          </div>

          <div className="max-w-2xl">
            <ScrobbleSearch
              size="hero"
              label="Search for a song or an album"
              placeholder="Search a song or an album"
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
          <EntryTile
            to="/manual-scrobble"
            Icon={Music2}
            title="One song"
            copy="Search, pick the result, and every field fills itself. Change the time if it was not just now."
            cta="Scrobble a song"
          />
          <EntryTile
            to="/album-scrobble"
            Icon={Disc3}
            title="A whole album"
            copy="Each track gets its own timestamp, spaced by real track length, in the order you played them."
            cta="Find an album"
          />
        </section>

        <section className="border-t border-border pt-8">
          {userInfo ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold tracking-[-0.02em]">
                  Your library
                </h2>
                <p className="text-sm text-muted-foreground">
                  Signed in as {userInfo.name}.
                </p>
              </div>
              <UserStats user={userInfo} className="w-full sm:max-w-xs" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:max-w-lg">
              <h2 className="text-lg font-bold tracking-[-0.02em]">
                Connect your Last.FM account
              </h2>
              <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                Scrbbl writes to your profile, so it needs your permission
                first. You can search without logging in, but scrobbling needs
                the handshake.
              </p>
              <LoginLinkButton redirectTo="/" className="w-full sm:w-fit" />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
