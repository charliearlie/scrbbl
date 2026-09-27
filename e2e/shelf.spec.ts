import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { seedRecord } from "./seed";
import { signIn } from "./session";

/**
 * Every test signs in as its own listener. The shelf is scoped by username,
 * so tests never see each other's records and nothing has to be reset between
 * runs — which matters, because the server holds an open handle to the
 * database and deleting the file underneath it does not clear anything.
 */
let listener = 0;
const nextListener = () => `e2e-listener-${Date.now()}-${listener++}`;

async function putOnShelf(page: Page, query: string) {
  await page.goto("/shelf/add");
  await page.getByRole("combobox").fill(query);
  await page.getByRole("option").first().waitFor({ timeout: 15_000 });
  await page.getByRole("option").first().click();
  await page.getByRole("button", { name: "Put it on the shelf" }).click();
}

test.describe("the record shelf", () => {
  test("starts empty, and says what to do about it", async ({
    page,
    context,
  }) => {
    await signIn(context, nextListener());
    await page.goto("/shelf");

    await expect(
      page.getByRole("heading", { name: "Your shelf" })
    ).toBeVisible();
    await expect(page.getByText("Nothing on the shelf yet")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Find a record" })
    ).toBeVisible();
  });

  test("adds a record, reviews it, and shows it on the shelf", async ({
    page,
    context,
  }) => {
    await signIn(context, nextListener());

    await putOnShelf(page, "blue weekend wolf alice");

    await page.waitForURL(/\/shelf\/[0-9a-f-]{36}/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /blue weekend/i
    );

    // Three and a half stars is the 7th of ten half-steps.
    await page.locator('label[for="rating-7"]').click();
    await page
      .getByLabel("What you made of it")
      .fill("Delicious Things is the one.");
    await page.getByRole("button", { name: "Save", exact: true }).click();

    // "Update" only renders once a review exists, so this is the first
    // assertion that cannot pass against the pre-submit page.
    await expect(page.getByRole("button", { name: "Update" })).toBeVisible();
    await expect(page.getByLabel("What you made of it")).toHaveValue(
      "Delicious Things is the one."
    );
    await expect(page.locator("#rating-7")).toBeChecked();

    await page.goto("/shelf");
    await expect(
      page.getByText("1 record, averaging 3.5 stars.")
    ).toBeVisible();
  });

  test("the rating submits without JavaScript", async ({ browser }) => {
    // The picker used to be React state behind a hidden input, so a star
    // clicked before hydration silently did nothing. Radios have no such gap.
    const user = nextListener();
    const id = await seedRecord(user, {
      artist: "The Cure",
      title: "Disintegration",
    });

    const context = await browser.newContext({ javaScriptEnabled: false });
    await signIn(context, user);
    const page = await context.newPage();
    await page.goto(`/shelf/${id}`);
    await page.locator('label[for="rating-8"]').click();
    await page.getByRole("button", { name: "Save", exact: true }).click();

    await expect(page.locator("#rating-8")).toBeChecked();
    await context.close();
  });

  test("warns before the same record goes on twice", async ({
    page,
    context,
  }) => {
    const user = nextListener();
    await seedRecord(user, { artist: "Wolf Alice", title: "Blue Weekend" });
    await signIn(context, user);

    await putOnShelf(page, "blue weekend wolf alice");

    await expect(page.getByText("already on your shelf")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add it anyway" })
    ).toBeVisible();
  });

  test("keeps one listener's shelf away from another's", async ({
    page,
    context,
  }) => {
    const user = nextListener();
    await seedRecord(user, { artist: "Radiohead", title: "In Rainbows" });
    await signIn(context, user);
    await page.goto("/shelf");
    await expect(page.getByText("1 record.")).toBeVisible();

    await signIn(context, nextListener());
    await page.goto("/shelf");
    await expect(page.getByText("Nothing on the shelf yet")).toBeVisible();
  });

  test("the crate scrolls sideways, and the page never does", async ({
    page,
    context,
  }) => {
    const user = nextListener();
    await seedRecord(user, {
      artist: "Talk Talk",
      title: "Spirit of Eden",
      year: 1988,
    });
    await seedRecord(user, {
      artist: "Bark Psychosis",
      title: "Hex",
      year: 1994,
    });
    await signIn(context, user);
    await page.goto("/shelf");

    const crate = page.locator(".crate");
    await expect(crate).toBeVisible();

    const { clientWidth, scrollWidth } = await crate.evaluate((el) => ({
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
    }));
    expect(scrollWidth).toBeGreaterThanOrEqual(clientWidth);

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("takes a record back off the shelf", async ({ page, context }) => {
    const user = nextListener();
    const id = await seedRecord(user, {
      artist: "Frank Ocean",
      title: "Channel Orange",
    });
    await signIn(context, user);
    await page.goto(`/shelf/${id}`);

    page.on("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Take it off the shelf" }).click();

    await page.waitForURL(/\/shelf$/);
    await expect(page.getByText("Nothing on the shelf yet")).toBeVisible();
  });
});

test("the shelf needs a login", async ({ page }) => {
  await page.goto("/shelf");
  await expect(page).toHaveURL(/\/login/);
});

test.describe("owned and played", () => {
  test("needs a login", async ({ page }) => {
    await page.goto("/shelf/missing");
    await expect(page).toHaveURL(/\/login/);
  });

  test("renders for a shelf with records on it", async ({ page, context }) => {
    const user = nextListener();
    await seedRecord(user, { artist: "Talk Talk", title: "Spirit of Eden" });
    await signIn(context, user);

    await page.goto("/shelf/missing");
    await expect(
      page.getByRole("heading", { name: "Owned and played" })
    ).toBeVisible();
    await expect(page.getByLabel("Counting")).toBeVisible();
  });

  test("refuses to compare when it cannot read the listening", async ({
    page,
    context,
  }) => {
    // A test listener has no Last.FM account, so the API errors. The page
    // must say so rather than report an empty comparison as a real result.
    const user = nextListener();
    await seedRecord(user, { artist: "Bark Psychosis", title: "Hex" });
    await signIn(context, user);

    await page.goto("/shelf/missing");
    await expect(page.getByText("Could not read your listening")).toBeVisible();
    await expect(page.getByText("Nothing missing")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "On the shelf, barely played" })
    ).toHaveCount(0);
  });

  test("is reachable from the shelf once it has records", async ({
    page,
    context,
  }) => {
    const user = nextListener();
    await seedRecord(user, { artist: "The Cure", title: "Disintegration" });
    await signIn(context, user);

    await page.goto("/shelf");
    await page.getByRole("link", { name: "Owned and played" }).click();
    await expect(page).toHaveURL(/\/shelf\/missing/);
  });
});

test.describe("sleeve scans", () => {
  const FRONT = "https://coverartarchive.org/release/x/front-500.jpg";
  const BACK = "https://coverartarchive.org/release/x/back-500.jpg";

  test("prefers the archive scan over the iTunes thumbnail", async ({
    page,
    context,
  }) => {
    const user = nextListener();
    const id = await seedRecord(user, {
      artist: "Bark Psychosis",
      title: "Hex",
      coverFront: FRONT,
    });
    await signIn(context, user);

    await page.goto(`/shelf/${id}`);
    await expect(page.locator(`img[src="${FRONT}"]`)).toBeVisible();
  });

  test("turns over, without JavaScript", async ({ browser }) => {
    const user = nextListener();
    const id = await seedRecord(user, {
      artist: "Bark Psychosis",
      title: "Hex",
      coverFront: FRONT,
      coverBack: BACK,
    });

    const context = await browser.newContext({ javaScriptEnabled: false });
    await signIn(context, user);
    const page = await context.newPage();
    await page.goto(`/shelf/${id}`);

    await expect(page.getByText("Turn it over")).toBeVisible();
    await page.getByText("Turn it over").click();
    await expect(page.locator("#turn-it-over")).toBeChecked();

    await context.close();
  });

  test("offers no turn when there is no back scan", async ({
    page,
    context,
  }) => {
    const user = nextListener();
    const id = await seedRecord(user, {
      artist: "Talk Talk",
      title: "Spirit of Eden",
      coverFront: FRONT,
    });
    await signIn(context, user);

    await page.goto(`/shelf/${id}`);
    await expect(page.getByText("Turn it over")).toHaveCount(0);
  });
});

test.describe("the record's tracklist", () => {
  test("shows the tracks and offers to scrobble the record", async ({
    page,
    context,
  }) => {
    const user = nextListener();
    await signIn(context, user);

    // Added through search, so it carries the iTunes id a tracklist needs.
    await putOnShelf(page, "blue weekend wolf alice");
    await page.waitForURL(/\/shelf\/[0-9a-f-]{36}/);

    await expect(
      page.getByRole("heading", { name: "Tracklist" })
    ).toBeVisible();
    await expect(page.getByText("Delicious Things")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Put it on and scrobble it/ })
    ).toHaveAttribute("href", /\/album-information\/\d+/);
  });

  test("shows no tracklist for a record with no catalogue id", async ({
    page,
    context,
  }) => {
    // Anything shelved from the owned-and-played page arrives without one.
    const user = nextListener();
    const id = await seedRecord(user, {
      artist: "Bark Psychosis",
      title: "Hex",
    });
    await signIn(context, user);

    await page.goto(`/shelf/${id}`);
    await expect(page.getByRole("heading", { name: "Hex" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tracklist" })).toHaveCount(
      0
    );
  });
});
