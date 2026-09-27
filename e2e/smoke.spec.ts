import { expect, test } from "@playwright/test";
import { seedRecord } from "./seed";
import { signIn } from "./session";

/**
 * Every route, loaded, with the console watched.
 *
 * Two bugs shipped before this existed, both the same shape: a component
 * imported a value from a `.server` module, Remix stripped that module out of
 * the client bundle, and the page crashed the moment it hydrated. The server
 * renders it fine and returns 200, TypeScript resolves the module the way the
 * server does, and unit tests never load a browser — so nothing but this
 * catches it.
 */
const ROUTES = [
  "/",
  "/manual-scrobble",
  "/album-scrobble",
  "/radio",
  "/shelf",
  "/shelf/add",
  "/shelf/missing",
  "/log",
];

test("no route crashes in the browser", async ({ page, context }) => {
  const user = `smoke-${Date.now()}`;
  // Seed one record so list pages render their populated state, not just empty.
  const id = await seedRecord(user, {
    artist: "Talk Talk",
    title: "Spirit of Eden",
    year: 1988,
    rating: 9,
    body: "The one that stops being rock music halfway through.",
  });
  await signIn(context, user);

  const failures: string[] = [];
  page.on("pageerror", (error) =>
    failures.push(`${page.url()} :: ${error.message}`)
  );
  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push(`${page.url()} :: ${message.text()}`);
    }
  });

  for (const route of [...ROUTES, `/shelf/${id}`]) {
    await page.goto(route, { waitUntil: "networkidle" });

    // An ErrorBoundary renders 200, so status is not enough to go on.
    await expect(
      page.getByRole("heading", { name: "Something went wrong" }),
      `${route} rendered the error boundary`
    ).toHaveCount(0);
  }

  expect(failures, failures.join("\n")).toEqual([]);
});
