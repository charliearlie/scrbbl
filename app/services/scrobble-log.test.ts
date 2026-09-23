import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type * as DbModule from "./db.server";
import type * as ScrobbleLogModule from "./scrobble-log.server";

/**
 * Exercises the real SQLite path rather than a mock, because the thing worth
 * checking is that the schema, the batch insert and the read-back agree.
 */
describe("scrobble log", () => {
  let dir: string;
  let log: typeof ScrobbleLogModule;
  let db: typeof DbModule;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), "scrbbl-log-"));
    process.env.TURSO_DATABASE_URL = `file:${join(dir, "test.db")}`;

    db = await import("./db.server");
    db.resetDbForTests();
    log = await import("./scrobble-log.server");
  });

  afterEach(() => {
    db.resetDbForTests();
    delete process.env.TURSO_DATABASE_URL;
    rmSync(dir, { force: true, recursive: true });
  });

  it("writes a batch and reads it back whole", async () => {
    await log.recordScrobble({
      username: "charlie",
      source: "album",
      album: "Blue Weekend",
      albumArtist: "Wolf Alice",
      accepted: 2,
      ignored: 1,
      ignoredReasons: ["Track was too short"],
      tracks: [
        { artist: "Wolf Alice", track: "The Beach", timestamp: 1_000 },
        { artist: "Wolf Alice", track: "Delicious Things", timestamp: 1_200 },
      ],
    });

    const [batch] = await log.getRecentBatches("charlie");

    expect(batch).toMatchObject({
      source: "album",
      album: "Blue Weekend",
      albumArtist: "Wolf Alice",
      accepted: 2,
      ignored: 1,
      ignoredReasons: ["Track was too short"],
    });
    expect(batch.tracks.map((t) => t.track)).toEqual([
      "The Beach",
      "Delicious Things",
    ]);
  });

  it("keeps track order, which is the play order", async () => {
    await log.recordScrobble({
      username: "charlie",
      source: "album",
      accepted: 3,
      ignored: 0,
      ignoredReasons: [],
      tracks: ["one", "two", "three"].map((track, index) => ({
        artist: "A",
        track,
        timestamp: 1_000 + index,
      })),
    });

    const [batch] = await log.getRecentBatches("charlie");
    expect(batch.tracks.map((t) => t.track)).toEqual(["one", "two", "three"]);
  });

  it("returns batches newest first, and never another user's", async () => {
    await log.recordScrobble({
      username: "charlie",
      source: "manual",
      accepted: 1,
      ignored: 0,
      ignoredReasons: [],
      tracks: [{ artist: "A", track: "older", timestamp: 1 }],
    });
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await log.recordScrobble({
      username: "charlie",
      source: "manual",
      accepted: 1,
      ignored: 0,
      ignoredReasons: [],
      tracks: [{ artist: "A", track: "newer", timestamp: 2 }],
    });
    await log.recordScrobble({
      username: "someone-else",
      source: "manual",
      accepted: 1,
      ignored: 0,
      ignoredReasons: [],
      tracks: [{ artist: "B", track: "theirs", timestamp: 3 }],
    });

    const batches = await log.getRecentBatches("charlie");
    expect(batches).toHaveLength(2);
    expect(batches[0].tracks[0].track).toBe("newer");
  });

  it("stays quiet when there is no database configured", async () => {
    db.resetDbForTests();
    delete process.env.TURSO_DATABASE_URL;
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      // A scrobble that reached Last.FM must not fail over its receipt.
      await expect(
        log.recordScrobble({
          username: "charlie",
          source: "manual",
          accepted: 1,
          ignored: 0,
          ignoredReasons: [],
          tracks: [{ artist: "A", track: "B", timestamp: 1 }],
        })
      ).resolves.toBeUndefined();

      await expect(log.getRecentBatches("charlie")).resolves.toEqual([]);
    } finally {
      process.env.NODE_ENV = previous;
    }
  });
});
