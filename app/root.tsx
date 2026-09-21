import type {
  ActionArgs,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Disc3 } from "lucide-react";

import tailwindStylesheetUrl from "~/tailwind.css";
import NavRail from "./components/navigation/nav-rail";
import MobileNav from "./components/navigation/mobile-nav";
import UserMenu from "./components/user/user-menu";
import Avatar from "./components/user/avatar";
import LoginLinkButton from "./components/common/login-link-button";
import { Button } from "./components/common/button";
import { getUserData } from "./services/lastfm.server";
import { logout } from "./services/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStylesheetUrl },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "alternate icon", href: "/favicon.ico" },
  // Self-hosted, so these are same-origin and worth fetching early.
  {
    rel: "preload",
    as: "font",
    type: "font/woff2",
    href: "/fonts/schibsted-grotesk-latin.woff2",
    crossOrigin: "anonymous",
  },
  {
    rel: "preload",
    as: "font",
    type: "font/woff2",
    href: "/fonts/jetbrains-mono-latin.woff2",
    crossOrigin: "anonymous",
  },
];

const description =
  "Scrbbl adds the listens your scrobbler missed. Send single tracks or whole albums to your Last.FM profile, timestamped the way you actually heard them.";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width,initial-scale=1,viewport-fit=cover",
  title: "Scrbbl, a manual Last.FM scrobbler",
  description,
  "theme-color": "#0D0D10",
  "og:title": "Scrbbl",
  "og:description": description,
  "og:type": "website",
  "twitter:card": "summary",
  "twitter:title": "Scrbbl",
  "twitter:description": description,
});

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUserData(request);
  return typedjson(user);
};

export const action = async ({ request }: ActionArgs) => {
  return await logout(request);
};

function Document({ children, title }: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body className="min-h-[100dvh] bg-background">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function Shell({
  children,
  user,
}: PropsWithChildren<{ user: Awaited<ReturnType<typeof getUserData>> }>) {
  return (
    <>
      {/* Fixed and pointer-events-none, so it never touches scroll cost. */}
      <div className="grain" aria-hidden="true" />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <NavRail>{user ? <UserMenu user={user} /> : null}</NavRail>

      <header className="bg-background/85 sticky top-0 z-20 flex h-14 items-center gap-1 border-b border-border px-2 backdrop-blur-xl sm:hidden">
        <MobileNav user={user} />
        <Link
          to="/"
          className="flex-1 text-lg font-extrabold tracking-[-0.045em] text-foreground"
        >
          Scrbbl
        </Link>
        {user ? (
          <Link
            to="/"
            aria-label={`Signed in as ${user.name}`}
            className="mr-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Avatar
              username={user.name}
              src={
                user.image?.find((image) => image.size === "large")?.[
                  "#text"
                ] || undefined
              }
            />
          </Link>
        ) : (
          <LoginLinkButton size="sm" className="mr-1">
            Log in
          </LoginLinkButton>
        )}
      </header>

      <main id="main" className="sm:pl-[76px]">
        {children}
      </main>
    </>
  );
}

export default function App() {
  const user = useTypedLoaderData<typeof loader>();

  return (
    <Document>
      <Shell user={user}>
        <Outlet />
      </Shell>
    </Document>
  );
}

/** A route threw a Response, most often a 404. */
export function CatchBoundary() {
  const caught = useCatch();
  const isNotFound = caught.status === 404;

  return (
    <Document title={isNotFound ? "Page not found, Scrbbl" : "Scrbbl"}>
      <div className="grain" aria-hidden="true" />
      <main
        id="main"
        className="mx-auto flex min-h-[100dvh] max-w-xl flex-col items-center justify-center gap-6 px-6 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-raised text-primary">
          <Disc3 aria-hidden="true" className="h-6 w-6" strokeWidth={1.6} />
        </span>
        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm tabular-nums text-muted-foreground">
            {caught.status}
          </p>
          <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
            {isNotFound ? "That page is not here" : "Something went wrong"}
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            {isNotFound
              ? "The link may be out of date, or the album may have left the iTunes catalogue."
              : caught.statusText ||
                "The request could not be completed. Try again in a moment."}
          </p>
        </div>
        <Button asChild>
          <Link to="/">Back to Scrbbl</Link>
        </Button>
      </main>
    </Document>
  );
}

/** Anything unhandled. Keeps the page branded instead of showing a stack. */
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <Document title="Something went wrong, Scrbbl">
      <div className="grain" aria-hidden="true" />
      <main
        id="main"
        className="mx-auto flex min-h-[100dvh] max-w-xl flex-col items-center justify-center gap-6 px-6 text-center"
      >
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
            Something went wrong
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            Scrbbl hit an error it did not expect. Nothing was scrobbled.
          </p>
        </div>
        <Button asChild>
          <Link to="/">Back to Scrbbl</Link>
        </Button>
      </main>
    </Document>
  );
}
