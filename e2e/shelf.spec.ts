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
