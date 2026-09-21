import { redirect } from "remix-typedjson";
import { lastfm } from "~/services/lastfm.server";
import { createUserSession } from "~/services/session.server";
import { safeRedirect } from "~/utils";

import type { LoaderArgs } from "@remix-run/server-runtime";
import type { LastfmApiSession, User } from "lastfmapi";

/**
 * Where Last.FM sends the browser back to after the user approves Scrbbl.
 *
 * The redirect target is run through `safeRedirect`, so a crafted callback
 * cannot bounce someone off to another host, and a failed handshake now
 * lands on the login page with a reason instead of throwing.
 */
export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectTo = safeRedirect(url.searchParams.get("redirectTo"), "/");

  if (!token) {
    return redirect("/login?error=missing-token");
  }

  try {
    const session = await new Promise<LastfmApiSession>((resolve, reject) => {
      lastfm.authenticate(token, (error, authenticated) => {
        if (error) reject(error);
        else resolve(authenticated);
      });
    });

    const userInfo = await new Promise<User>((resolve, reject) => {
      lastfm.user.getInfo(session.username, (error, info) => {
        if (error) reject(error);
        else resolve(info);
      });
    });

    return createUserSession(token, session, userInfo, redirectTo);
  } catch (error) {
    console.error("[scrbbl] Last.FM handshake failed", error);
    return redirect("/login?error=handshake");
  }
};

export default function AuthRedirectRoute() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-semibold">Finishing sign in</p>
      <p className="text-sm text-muted-foreground">
        Last.FM is handing you back to Scrbbl.
      </p>
    </div>
  );
}
