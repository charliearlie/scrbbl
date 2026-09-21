import { redirect } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { LASTFM_API_KEY } from "~/services/env.server";
import { safeRedirect } from "~/utils";

/**
 * Builds the Last.FM authorisation URL on the server and sends the browser
 * to it.
 *
 * This used to be assembled in the browser: the API key was a literal in the
 * client bundle, the callback was pieced together with string interpolation
 * and never encoded, and the scheme was plain http. A "redirectTo" of the
 * literal string "null" was a common result.
 */
export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const redirectTo = safeRedirect(url.searchParams.get("redirectTo"), "/");

  const callback = new URL("/auth-redirect", url.origin);
  callback.searchParams.set("redirectTo", redirectTo);

  const authUrl = new URL("https://www.last.fm/api/auth/");
  authUrl.searchParams.set("api_key", LASTFM_API_KEY);
  authUrl.searchParams.set("cb", callback.toString());

  return redirect(authUrl.toString());
};
