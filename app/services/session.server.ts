import { createCookieSessionStorage, Headers } from "@remix-run/node";
import { redirect } from "remix-typedjson";

import type { LastfmApiSession, User } from "lastfmapi";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["arandomsessionsecretlad"],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "token";
const LASTFM_SESSION_KEY = "lastfmSession";
const LASTFM_USER_KEY = "lastfmUser";

export async function createUserSession(
  token: string,
  lastfmSession: LastfmApiSession,
  user: User,
  redirectTo: string = "/"
) {
  const session = await sessionStorage.getSession();
  session.set(USER_SESSION_KEY, token);
  session.set(LASTFM_SESSION_KEY, lastfmSession);
  session.set(LASTFM_USER_KEY, user);

  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    await sessionStorage.commitSession(session, {
      maxAge: 60 * 60 * 24 * 7, // 7 days,
    })
  );

  return redirect(redirectTo, {
    headers,
  });
}

export async function requireLogin(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userToken = session.get(USER_SESSION_KEY);
  if (!userToken || typeof userToken !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userToken;
}

export function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUserToken(request: Request) {
  const session = await getUserSession(request);
  const userToken = session.get(USER_SESSION_KEY);
  if (!userToken || typeof userToken !== "string") return null;
  return userToken;
}

export async function getLastfmSession(request: Request) {
  const session = await getUserSession(request);
  const lastfmSession: LastfmApiSession = session.get(LASTFM_SESSION_KEY);

  if (!lastfmSession?.key) return null;

  return lastfmSession;
}

export async function getUserInfo(request: Request) {
  const session = await getUserSession(request);
  const user: User = session.get(LASTFM_USER_KEY);

  if (!user?.name) return null;

  return user;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  if (!session) {
    return redirect("/");
  }
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
