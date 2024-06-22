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
} from "@remix-run/react";
import { useEffect } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import {
  AlignJustify,
  Boxes,
  Database,
  Home,
  Music,
  RadioTower,
} from "lucide-react";
import { themeChange } from "theme-change";

import tailwindStylesheetUrl from "~/tailwind.css";
import UserProfileNavButton from "./components/user/user-profile-nav-button";
import LoginButton from "./components/common/login-link-button";
import NavigationLink from "./components/navigation/navigation-link";
import { getUserData } from "./services/lastfm.server";
import { logout } from "./services/session.server";
import { Sheet, SheetContent, SheetTrigger } from "./components/common/sheet";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Scrbbl",
  viewport: "width=device-width,initial-scale=1",
});

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUserData(request);
  if (!user) return typedjson(null);

  return user;
};

export const action = async ({ request }: ActionArgs) => {
  return await logout(request);
};

export default function App() {
  const loaderData = useTypedLoaderData<typeof loader>();

  const userImage =
    loaderData?.image.find((image) => image.size === "medium")?.["#text"] || "";

  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <html lang="en" className="h-full bg-background">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <nav className="fixed top-0 z-20 w-full bg-background">
          <div className="p-2 md:px-5 lg:pl-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start">
                <span className="sr-only">Open sidebar</span>
                <Sheet>
                  <SheetTrigger className=" sm:hidden">
                    <AlignJustify size={24} />
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0">
                    <div className="flex h-full flex-col gap-4 overflow-y-auto bg-accent p-3 pb-4 ">
                      <div className="flex items-center justify-between">
                        <Link to="/" className="flex text-primary">
                          <span className="self-center whitespace-nowrap text-3xl font-black">
                            Scrbbl
                          </span>
                        </Link>
                      </div>
                      <ul className="space-y-2 font-medium">
                        <li>
                          <NavigationLink Icon={Home} to="/" text="Home" />
                        </li>
                        <li>
                          <NavigationLink
                            Icon={Music}
                            to="/manual-scrobble"
                            text="Scrobble song"
                          />
                        </li>
                        <li>
                          <NavigationLink
                            Icon={Boxes}
                            to="/album-scrobble"
                            text="Scrobble album"
                          />
                        </li>
                        <li>
                          <NavigationLink
                            Icon={RadioTower}
                            to="#"
                            text="Scrobble radio"
                          />
                        </li>
                        <li>
                          <NavigationLink
                            bannerText="Pro"
                            Icon={Database}
                            to="#"
                            text="Bulk Scrobble"
                          />
                        </li>
                      </ul>
                      {loaderData ? (
                        <div className="border-t-2 p-2">
                          <UserProfileNavButton
                            profilePhoto={userImage}
                            scrobbleCount={loaderData?.playcount}
                            username={loaderData?.name}
                          />
                        </div>
                      ) : (
                        <LoginButton redirectTo="/" />
                      )}
                    </div>
                  </SheetContent>
                </Sheet>

                <h1 className="ml-2 text-3xl font-black text-primary">
                  Scrbbl
                </h1>
              </div>
            </div>
          </div>
        </nav>

        <aside
          id="logo-sidebar"
          className={`color-accent-foreground fixed top-0 left-0 z-40 hidden h-screen w-64 bg-accent transition-transform sm:block sm:translate-x-0`}
          aria-label="Sidebar"
        >
          <div className="flex h-full flex-col gap-4 overflow-y-auto p-3 pb-4 ">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex text-primary">
                <span className="self-center whitespace-nowrap text-3xl font-black">
                  Scrbbl
                </span>
              </Link>
            </div>
            <ul className="space-y-2 font-medium">
              <li>
                <NavigationLink Icon={Home} to="/" text="Home" />
              </li>
              <li>
                <NavigationLink
                  Icon={Music}
                  to="/manual-scrobble"
                  text="Scrobble song"
                />
              </li>
              <li>
                <NavigationLink
                  Icon={Boxes}
                  to="/album-scrobble"
                  text="Scrobble album"
                />
              </li>
              <li>
                <NavigationLink
                  Icon={RadioTower}
                  to="#"
                  text="Scrobble radio"
                />
              </li>
              <li>
                <NavigationLink
                  bannerText="Pro"
                  Icon={Database}
                  to="#"
                  text="Bulk Scrobble"
                />
              </li>
            </ul>
            {loaderData ? (
              <div className="border-t-2 p-2">
                <UserProfileNavButton
                  profilePhoto={userImage}
                  scrobbleCount={loaderData?.playcount}
                  username={loaderData?.name}
                />
              </div>
            ) : (
              <LoginButton redirectTo="/" />
            )}
          </div>
        </aside>

        <div className="mt-12 sm:ml-64">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </div>
      </body>
    </html>
  );
}
