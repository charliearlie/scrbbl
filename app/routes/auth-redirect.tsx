import { typedjson } from "remix-typedjson";
import { lastfm } from "~/services/lastfm.server";
import { createUserSession } from "~/services/session.server";

import type { LoaderArgs } from "@remix-run/server-runtime";
import type { LastfmApiSession, User } from "lastfmapi";

export const loader = async ({ params, request }: LoaderArgs) => {
  const { url } = request;
  const newUrl = new URL(url);
  const token = newUrl.searchParams.get("token");
  if (!token) {
    return typedjson({ error: "No token was provided" });
  }

  const session: LastfmApiSession = await new Promise((resolve, reject) => {
    lastfm.authenticate(token, function (error, sesh) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(sesh);
      }
    });
  });

  const userInfo: User = await new Promise((resolve, reject) => {
    lastfm.user.getInfo(session.username, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });

  return createUserSession(token, session, userInfo);
};

export default function AuthRedirectRoute() {
  return <p>Redirecting...</p>;
}
