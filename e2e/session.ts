import { createCookieSessionStorage } from "@remix-run/node";
import type { BrowserContext } from "@playwright/test";

/**
 * Mints a real signed session cookie so tests can reach the logged-in routes
 * without driving Last.FM's OAuth. It uses the same cookie machinery the app
 * does, so anything that would reject a forged cookie still rejects one here.
 */
const SESSION_SECRET = process.env.SESSION_SECRET ?? "e2e-session-secret";

const storage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: false,
  },
});

export const TEST_USER = "e2e-listener";

export async function signIn(context: BrowserContext, username = TEST_USER) {
  const session = await storage.getSession();
  session.set("token", `token-for-${username}`);
  session.set("lastfmSession", {
    username,
    key: "not-a-real-key",
    subscriber: 0,
  });
  session.set("lastfmUser", {
    name: username,
    realname: "",
    playcount: "0",
    image: [],
    url: `https://www.last.fm/user/${username}`,
  });

  const header = await storage.commitSession(session);
  const value = header.split(";")[0].split("=").slice(1).join("=");

  await context.addCookies([
    {
      name: "__session",
      value: decodeURIComponent(value),
      domain: "localhost",
      path: "/",
    },
  ]);
}
