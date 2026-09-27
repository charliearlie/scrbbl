import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type * as DbModule from "./db.server";
import type * as ShelfModule from "./shelf.server";
import {
  normaliseRating,
  ratingToStars,
  releaseYear,
  shelfKey,
  sortShelf,
  upscaleArtwork,
} from "./shelf";
import type { ShelfAlbum } from "./shelf";

describe("ratings", () => {
  it("clamps to the stored scale and treats nothing as unrated", () => {
    expect(normaliseRating(7)).toBe(7);
    expect(normaliseRating(99)).toBe(10);
    expect(normaliseRating(0)).toBeNull();
    expect(normaliseRating("")).toBeNull();
    expect(normaliseRating("not a number")).toBeNull();
  });

  it("reads back as stars out of five", () => {
    expect(ratingToStars(10)).toBe("5");
    expect(ratingToStars(7)).toBe("3.5");
    expect(ratingToStars(1)).toBe("0.5");
    expect(ratingToStars(null)).toBeNull();
  });
});

describe("shelfKey", () => {
  it("treats a pressing as the same record", () => {
    expect(shelfKey("Wolf Alice", "Blue Weekend (Deluxe Edition)")).toBe(
      shelfKey("Wolf Alice", "Blue Weekend")
    );
  });

  it("keeps genuinely different records apart", () => {
    expect(shelfKey("The Cure", "Disintegration")).not.toBe(
      shelfKey("The Cure", "Wish")
    );
  });
});

describe("artwork and dates", () => {
  it("asks iTunes for a sleeve-sized image", () => {
    expect(
      upscaleArtwork("https://is1.mzstatic.com/image/thumb/x/100x100bb.jpg")
    ).toBe("https://is1.mzstatic.com/image/thumb/x/600x600bb.jpg");
    expect(upscaleArtwork(null)).toBeNull();
  });

  it("reads a year, or admits it cannot", () => {
    expect(releaseYear("2021-06-04T07:00:00Z")).toBe(2021);
    expect(releaseYear("")).toBeNull();
    expect(releaseYear(undefined)).toBeNull();
  });
});

describe("sortShelf", () => {
  const album = (over: Partial<ShelfAlbum>): ShelfAlbum => ({
    id: over.id ?? "x",
    artist: over.artist ?? "A",
    title: over.title ?? "T",
    year: over.year ?? null,
    artworkUrl: null,
    coverFront: null,
    coverBack: null,
    itunesId: null,
    owned: true,
    addedAt: over.addedAt ?? 0,
    review: over.review ?? null,
  });

  const shelf = [
    album({
      id: "a",
      artist: "Wolf Alice",
      addedAt: 3,
      year: 2021,
      review: { rating: 8, body: "", firstPlayedAt: null, updatedAt: 1 },
    }),
    album({ id: "b", artist: "Bowie", addedAt: 1, year: 1977 }),
    album({
      id: "c",
      artist: "The Cure",
      addedAt: 2,
      year: 1989,
      review: { rating: 10, body: "", firstPlayedAt: null, updatedAt: 1 },
    }),
  ];

  it("defaults to most recently added", () => {
    expect(sortShelf(shelf, "added").map((a) => a.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts unrated records last", () => {
    expect(sortShelf(shelf, "rating").map((a) => a.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("sorts by artist and by year", () => {
    expect(sortShelf(shelf, "artist").map((a) => a.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
    expect(sortShelf(shelf, "year").map((a) => a.id)).toEqual(["a", "c", "b"]);
  });

  it("leaves the original array alone", () => {
    const before = shelf.map((a) => a.id);
    sortShelf(shelf, "artist");
    expect(shelf.map((a) => a.id)).toEqual(before);
  });
});

describe("the shelf store", () => {
  let dir: string;
  let db: typeof DbModule;
  let shelf: typeof ShelfModule;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), "scrbbl-shelf-"));
    process.env.TURSO_DATABASE_URL = `file:${join(dir, "test.db")}`;
    db = await import("./db.server");
    db.resetDbForTests();
    shelf = await import("./shelf.server");
  });

  afterEach(() => {
    db.resetDbForTests();
    delete process.env.TURSO_DATABASE_URL;
    rmSync(dir, { force: true, recursive: true });
  });

  const wolfAlice = {
    username: "charlie",
    artist: "Wolf Alice",
    title: "Blue Weekend",
    year: 2021,
    artworkUrl: "https://example.test/art.jpg",
    itunesId: "1554144723",
  };

  it("adds a record and reads it back", async () => {
    const added = await shelf.addToShelf(wolfAlice);
    expect(added.ok).toBe(true);

    const [record] = await shelf.getShelf("charlie");
    expect(record).toMatchObject({
      artist: "Wolf Alice",
      title: "Blue Weekend",
      year: 2021,
      owned: true,
      review: null,
    });
  });

  it("keeps one person's shelf out of another's", async () => {
    await shelf.addToShelf(wolfAlice);
    await shelf.addToShelf({ ...wolfAlice, username: "someone-else" });

    expect(await shelf.getShelf("charlie")).toHaveLength(1);
  });

  it("saves a review and returns it with the record", async () => {
    const added = await shelf.addToShelf(wolfAlice);
    if (!added.ok) throw new Error(added.error);

    expect(
      await shelf.saveReview({
        username: "charlie",
        albumId: added.id,
        rating: 9,
        body: "Delicious Things is the one.",
      })
    ).toBe(true);

    const record = await shelf.getShelfAlbum("charlie", added.id);
    expect(record?.review).toMatchObject({
      rating: 9,
      body: "Delicious Things is the one.",
    });
  });

  it("overwrites a review rather than stacking them up", async () => {
    const added = await shelf.addToShelf(wolfAlice);
    if (!added.ok) throw new Error(added.error);

    await shelf.saveReview({
      username: "charlie",
      albumId: added.id,
      rating: 4,
      body: "first",
    });
    await shelf.saveReview({
      username: "charlie",
      albumId: added.id,
      rating: 9,
      body: "second",
    });

    const record = await shelf.getShelfAlbum("charlie", added.id);
    expect(record?.review).toMatchObject({ rating: 9, body: "second" });
  });

  it("refuses to review a record on somebody else's shelf", async () => {
    const added = await shelf.addToShelf(wolfAlice);
    if (!added.ok) throw new Error(added.error);

    expect(
      await shelf.saveReview({
        username: "an-intruder",
        albumId: added.id,
        rating: 1,
      })
    ).toBe(false);

    const record = await shelf.getShelfAlbum("charlie", added.id);
    expect(record?.review).toBeNull();
  });

  it("finds a record already on the shelf, across pressings", async () => {
    await shelf.addToShelf(wolfAlice);

    const found = await shelf.findOnShelf(
      "charlie",
      "Wolf Alice",
      "Blue Weekend (Deluxe Edition)"
    );
    expect(found?.title).toBe("Blue Weekend");

    expect(await shelf.findOnShelf("charlie", "The Cure", "Wish")).toBeNull();
  });

  it("removes a record and its review together", async () => {
    const added = await shelf.addToShelf(wolfAlice);
    if (!added.ok) throw new Error(added.error);
    await shelf.saveReview({
      username: "charlie",
      albumId: added.id,
      rating: 8,
    });

    await shelf.removeFromShelf("charlie", added.id);

    expect(await shelf.getShelf("charlie")).toHaveLength(0);
    expect(await shelf.getShelfAlbum("charlie", added.id)).toBeNull();
  });

  it("will not let one user delete another's record", async () => {
    const added = await shelf.addToShelf(wolfAlice);
    if (!added.ok) throw new Error(added.error);

    await shelf.removeFromShelf("an-intruder", added.id);
    expect(await shelf.getShelf("charlie")).toHaveLength(1);
  });
});
