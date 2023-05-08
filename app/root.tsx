import type {
  ActionArgs,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Boxes, Database, Home, Music, RadioTower } from "lucide-react";

import tailwindStylesheetUrl from "~/tailwind.css";
import { logout } from "./services/session.server";
import UserProfileNavButton from "./components/user/user-profile-nav-button";
import LoginButton from "./components/login-link-button";
import NavigationLink from "./components/navigation/navigation-link";
import { getUserData } from "./services/lastfm.server";

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
  const location = useLocation();

  const userImage =
    loaderData?.image.find((image) => image.size === "medium")?.["#text"] || "";

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <nav className="fixed top-0 z-50 h-16 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="px-2 py-3 md:px-5 lg:pl-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start">
                <button
                  data-drawer-target="logo-sidebar"
                  data-drawer-toggle="logo-sidebar"
                  aria-controls="logo-sidebar"
                  type="button"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden"
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg
                    className="h-6 w-6"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clip-rule="evenodd"
                      fill-rule="evenodd"
                      d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                    ></path>
                  </svg>
                </button>
                <a href="https://flowbite.com" className="ml-2 flex md:mr-24">
                  <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                    Scrbbl
                  </span>
                </a>
              </div>
            </div>
          </div>
        </nav>

        <aside
          id="logo-sidebar"
          className={`fixed top-0 left-0 z-40 h-screen w-64 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full border-r"
          }  border-gray-200 bg-white pt-20 transition-transform dark:border-gray-700 dark:bg-gray-800 sm:translate-x-0`}
          aria-label="Sidebar"
        >
          <div className="flex h-full flex-col gap-4 overflow-y-auto bg-white px-3 pb-4 dark:bg-gray-800">
            <ul className="space-y-2 font-medium">
              <li>
                <NavigationLink Icon={Home} to="/" text="Home" />
              </li>
              <li>
                <NavigationLink
                  Icon={Music}
                  to="manual-scrobble"
                  text="Scrobble song"
                />
              </li>
              <li>
                <NavigationLink
                  Icon={Boxes}
                  to="album-scrobble"
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
                  scrobbleCount={loaderData?.playcount!}
                  username={loaderData?.name!}
                />
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </aside>

        <div className="mt-16 sm:ml-64">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </div>
      </body>
    </html>
  );
}
