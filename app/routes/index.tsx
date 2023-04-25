import heroImageUrl from "../assets/hero-image.jpg";
import remixLogoUrl from "../assets/remix-logo.svg";
import tailwindLogoUrl from "../assets/tailwind.svg";
import vitestLogoUrl from "../assets/vitest.svg";
import prettierLogoUrl from "../assets/prettier.svg";
import eslintLogoUrl from "../assets/eslint.svg";
import type { ActionArgs, LinksFunction, LoaderArgs } from "@remix-run/node";
import { getUserToken } from "~/services/session.server";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { useLoaderData } from "react-router";
import { lastfm } from "~/services/lastfm.server";
import InputWithLabel from "~/components/form/input-with-label";
import { Card, CardContent } from "~/components/card";

const LIBRARIES = [
  {
    src: tailwindLogoUrl,
    alt: "Tailwind",
    href: "https://tailwindcss.com",
  },
  {
    src: vitestLogoUrl,
    alt: "Vitest",
    href: "https://vitest.dev",
  },
  {
    src: prettierLogoUrl,
    alt: "Prettier",
    href: "https://prettier.io",
  },
  {
    src: eslintLogoUrl,
    alt: "ESLint",
    href: "https://eslint.org",
  },
];

export const links: LinksFunction = () => {
  return [
    { rel: "preload", href: heroImageUrl },
    ...LIBRARIES.map(({ src }) => ({
      rel: "preload",
      href: src,
    })),
  ];
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const userToken = await getUserToken(request);
  return typedjson({ token: userToken });
};

export default function Index() {
  const { token } = useTypedLoaderData<typeof loader>();
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
