import type { LoaderArgs } from "@remix-run/node";

/**
 * Catch-all. Anything that matches no route throws a 404 here and the root
 * CatchBoundary renders it. There was no 404 page before, so an unknown URL
 * fell through to a framework error page.
 */
export const loader = async ({ request }: LoaderArgs) => {
  throw new Response("Not found", { status: 404, statusText: "Not found" });
};

export default function NotFound() {
  return null;
}
